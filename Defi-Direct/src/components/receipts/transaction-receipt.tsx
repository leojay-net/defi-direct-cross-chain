"use client"

import React, { useRef, forwardRef } from "react"
import { Download, CheckCircle, ArrowUpRight, Copy } from "lucide-react"
import { Button } from "../ui/button"
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import toast from 'react-hot-toast'

interface TransactionReceiptProps {
    transaction: {
        id: string
        transactionHash?: string
        amount: number
        recipient: string
        accountNumber: string
        bankName: string
        token: string
        fee: number
        status: 'successful' | 'pending' | 'failed'
        timestamp: string
        smartContractId?: string
        fiatAmount?: number
        exchangeRate?: number
    }
    onClose?: () => void
}

// Receipt component that will be printed/converted to PDF
const ReceiptTemplate = forwardRef<HTMLDivElement, TransactionReceiptProps>(({ transaction }, ref) => {
    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text)
        toast.success(`${label} copied to clipboard`)
    }

    const statusColor = {
        successful: 'text-green-500',
        pending: 'text-yellow-500',
        failed: 'text-red-500'
    }[transaction.status]

    const statusIcon = {
        successful: <CheckCircle className="h-5 w-5 text-green-500" />,
        pending: <div className="h-5 w-5 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin" />,
        failed: <div className="h-5 w-5 rounded-full bg-red-500" />
    }[transaction.status]

    return (
        <div ref={ref} className="bg-white text-black p-8 rounded-lg max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-6 border-b pb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                        <ArrowUpRight className="h-4 w-4 text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-800">DeFi Direct</h1>
                </div>
                <p className="text-sm text-gray-600">Transaction Receipt</p>
            </div>

            {/* Status */}
            <div className="flex items-center justify-center gap-2 mb-6">
                {statusIcon}
                <span className={`font-medium capitalize ${statusColor.replace('text-', 'text-')}`}>
                    {transaction.status}
                </span>
            </div>

            {/* Amount */}
            <div className="text-center mb-6">
                <p className="text-3xl font-bold text-gray-800">
                    ₦{transaction.amount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                    {transaction.fiatAmount ? `${transaction.fiatAmount} ${transaction.token}` : `Amount in ${transaction.token}`}
                </p>
            </div>

            {/* Transaction Details */}
            <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                    <span className="text-gray-600">Recipient:</span>
                    <span className="font-medium">{transaction.recipient}</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-gray-600">Bank:</span>
                    <span className="font-medium">{transaction.bankName}</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-gray-600">Account:</span>
                    <span className="font-medium">{transaction.accountNumber}</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-gray-600">Token:</span>
                    <span className="font-medium">{transaction.token}</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-gray-600">Fee:</span>
                    <span className="font-medium">₦{transaction.fee.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{transaction.timestamp}</span>
                </div>
            </div>

            {/* Transaction Hash */}
            {transaction.transactionHash && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Transaction Hash:</span>
                        <button
                            onClick={() => copyToClipboard(transaction.transactionHash!, 'Transaction hash')}
                            className="text-purple-600 hover:text-purple-700"
                        >
                            <Copy className="h-4 w-4" />
                        </button>
                    </div>
                    <p className="text-sm font-mono break-all mt-1">{transaction.transactionHash}</p>
                </div>
            )}

            {/* Smart Contract ID */}
            {transaction.smartContractId && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Smart Contract ID:</span>
                        <button
                            onClick={() => copyToClipboard(transaction.smartContractId!, 'Smart contract ID')}
                            className="text-purple-600 hover:text-purple-700"
                        >
                            <Copy className="h-4 w-4" />
                        </button>
                    </div>
                    <p className="text-sm font-mono break-all mt-1">{transaction.smartContractId}</p>
                </div>
            )}

            {/* Footer */}
            <div className="border-t pt-4 text-center">
                <p className="text-xs text-gray-500">
                    Generated on {new Date().toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                    DeFi Direct - Secure Cryptocurrency Transfers
                </p>
            </div>
        </div>
    )
})

ReceiptTemplate.displayName = 'ReceiptTemplate'

export function TransactionReceipt({ transaction, onClose }: TransactionReceiptProps) {
    const receiptRef = useRef<HTMLDivElement>(null)

    const downloadPDF = async () => {
        if (!receiptRef.current) return

        try {
            toast.loading('Generating PDF...', { id: 'pdf-generation' })

            // Create canvas from the receipt component
            const canvas = await html2canvas(receiptRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            })

            // Create PDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            })

            const imgData = canvas.toDataURL('image/png')
            const imgWidth = 210 // A4 width in mm
            const pageHeight = 295 // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width
            let heightLeft = imgHeight

            let position = 0

            // Add image to PDF
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
            heightLeft -= pageHeight

            // Add more pages if needed
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight
                pdf.addPage()
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
                heightLeft -= pageHeight
            }

            // Download the PDF
            pdf.save(`transaction-receipt-${transaction.id}.pdf`)

            toast.success('Receipt downloaded successfully!', { id: 'pdf-generation' })
        } catch (error) {
            console.error('Error generating PDF:', error)
            toast.error('Failed to generate PDF', { id: 'pdf-generation' })
        }
    }

    const printReceipt = () => {
        if (!receiptRef.current) return

        const printWindow = window.open('', '_blank')
        if (!printWindow) return

        const printContent = receiptRef.current.outerHTML

        printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Transaction Receipt</title>
          <style>
            body { 
              margin: 0; 
              padding: 20px; 
              font-family: Arial, sans-serif; 
              background: white;
            }
            @media print {
              body { margin: 0; }
              button { display: none !important; }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `)

        printWindow.document.close()
        printWindow.focus()

        setTimeout(() => {
            printWindow.print()
            printWindow.close()
        }, 250)
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Receipt Content */}
                <ReceiptTemplate ref={receiptRef} transaction={transaction} />

                {/* Action Buttons */}
                <div className="p-6 border-t bg-gray-50 flex gap-3 justify-between">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        Close
                    </button>

                    <div className="flex gap-2">
                        <Button
                            onClick={printReceipt}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            Print
                        </Button>

                        <Button
                            onClick={downloadPDF}
                            size="sm"
                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                        >
                            <Download className="h-4 w-4" />
                            Download PDF
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
