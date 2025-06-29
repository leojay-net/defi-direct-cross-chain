"use client";

import { Copy, ExternalLink, Download, FileDown } from "lucide-react";
import Image from "next/image";
import { Transaction } from "@/types/transaction";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import { useAccount } from "wagmi";
import { getTransactionExplorerUrl, getExplorerName } from "@/utils/explorer-urls";

interface TransactionDetailsModalProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusColors = {
  successful: "text-green-500",
  pending: "text-orange-500",
  failed: "text-red-500",
};

const statusIcons = {
  successful: "/successfulTx.png",
  pending: "/pendingTx.png",
  failed: "/failedTx.png",
};

const statusBgColors = {
  successful: "bg-green-600",
  pending: "bg-orange-500",
  failed: "bg-red-500",
};

export function TransactionDetailsModal({
  transaction,
  open,
  onOpenChange,
}: TransactionDetailsModalProps) {
  const { chain } = useAccount();

  if (!transaction) return null;

  const { txHash, amount, status, recipient, bank, timestamp, transactionFee, tokenName } = transaction;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!", {
      position: "top-center",
      style: {
        background: "#333",
        color: "#fff",
      },
    });
  };

  const downloadReceipt = () => {
    const receiptContent = `
      Defi-Direct Transaction Receipt
      ----------------------------------
      Status: ${status.charAt(0).toUpperCase() + status.slice(1)}
      Amount: NGN ${amount.toLocaleString()}
      Recipient: ${recipient}
      Bank: ${bank}
      Transaction ID: ${txHash}
      Time: ${timestamp}
      Fee: ${transactionFee !== undefined ? `-${transactionFee.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} ${tokenName || "Token"}` : "N/A"}
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transaction-receipt-${txHash?.substring(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadPdfReceipt = () => {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    pdf.setFillColor(18, 3, 45);
    pdf.rect(0, 0, 210, 297, 'F');

    const logoUrl = "https://res.cloudinary.com/dxswouxj5/image/upload/v1741825461/image_jzzgrp.png";
    const img = document.createElement('img');
    img.crossOrigin = "Anonymous";

    img.onload = function () {
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;
      const aspectRatio = imgWidth / imgHeight;
      const displayWidth = 50;
      const displayHeight = displayWidth / aspectRatio;
      const xPos = (210 - displayWidth) / 2;

      pdf.addImage(img, 'PNG', xPos, 15, displayWidth, displayHeight);

      pdf.setFontSize(24);
      pdf.setTextColor(255, 255, 255);
      pdf.text("Transaction Receipt", 105, 45, { align: "center" });

      pdf.setDrawColor(100, 100, 100);
      pdf.setLineWidth(0.5);
      pdf.line(15, 50, 195, 50);

      pdf.setFontSize(16);
      pdf.setTextColor(
        status === 'successful' ? 46 : status === 'pending' ? 246 : 239,
        status === 'successful' ? 204 : status === 'pending' ? 167 : 68,
        status === 'successful' ? 113 : status === 'pending' ? 38 : 68
      );
      pdf.text(`Transaction ${status.charAt(0).toUpperCase() + status.slice(1)}`, 105, 65, { align: "center" });

      pdf.setFontSize(26);
      pdf.setTextColor(255, 255, 255);
      pdf.text(`NGN ${amount.toLocaleString()}`, 105, 80, { align: "center" });

      const startY = 100;
      const leftX = 40;
      const rightX = 70;
      const lineHeight = 10;

      pdf.setFontSize(12);
      pdf.setTextColor(200, 200, 200);

      pdf.text("Transfer type:", leftX, startY, { align: "right" });
      pdf.text("Recipient:", leftX, startY + lineHeight, { align: "right" });
      pdf.text("Bank:", leftX, startY + lineHeight * 2, { align: "right" });
      pdf.text("Transaction ID:", leftX, startY + lineHeight * 3, { align: "right" });
      pdf.text("Time:", leftX, startY + lineHeight * 4, { align: "right" });

      if (transactionFee !== undefined) {
        pdf.text("Fee:", leftX, startY + lineHeight * 5, { align: "right" });
      }

      pdf.setTextColor(255, 255, 255);
      pdf.text("Bank Transfer", rightX, startY, { align: "left" });
      pdf.text(recipient || "N/A", rightX, startY + lineHeight, { align: "left" });
      pdf.text(bank || "N/A", rightX, startY + lineHeight * 2, { align: "left" });

      if (txHash) {
        const shortHash = `${txHash.substring(0, 10)}...${txHash.substring(txHash.length - 4)}`;
        pdf.text(shortHash, rightX, startY + lineHeight * 3, { align: "left" });
      } else {
        pdf.text("N/A", rightX, startY + lineHeight * 3, { align: "left" });
      }

      pdf.text(timestamp || "N/A", rightX, startY + lineHeight * 4, { align: "left" });

      if (transactionFee !== undefined) {
        pdf.text(
          `-${transactionFee.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} ${tokenName || "Token"}`,
          rightX, startY + lineHeight * 5, { align: "left" }
        );
      }

      if (txHash) {
        pdf.setFontSize(9);
        pdf.setTextColor(156, 44, 255);
        const explorerName = getExplorerName(chain?.id || 534351, chain);
        const explorerUrl = getTransactionExplorerUrl(chain?.id || 534351, txHash, chain);
        pdf.text(`View on ${explorerName}:`, 105, 205, { align: "center" });
        pdf.text(explorerUrl, 105, 212, { align: "center" });
      }

      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Generated on ${new Date().toLocaleString()}`, 105, 280, { align: "center" });
      pdf.text("Powered by Defi Direct", 105, 285, { align: "center" });

      pdf.save(`defi-direct-receipt-${txHash?.substring(0, 8) || "unknown"}.pdf`);

      toast.success("PDF receipt downloaded!", {
        position: "top-center",
        style: {
          background: "#333",
          color: "#fff",
        },
      });
    };

    img.onerror = function () {
      continueWithoutLogo();
    };

    img.src = logoUrl;

    function continueWithoutLogo() {
      pdf.setFontSize(24);
      pdf.setTextColor(255, 255, 255);
      pdf.text("Defi Direct", 105, 25, { align: "center" });
      pdf.text("Transaction Receipt", 105, 40, { align: "center" });

      pdf.setDrawColor(100, 100, 100);
      pdf.setLineWidth(0.5);
      pdf.line(15, 45, 195, 45);

      pdf.setFontSize(16);
      pdf.setTextColor(
        status === 'successful' ? 46 : status === 'pending' ? 246 : 239,
        status === 'successful' ? 204 : status === 'pending' ? 167 : 68,
        status === 'successful' ? 113 : status === 'pending' ? 38 : 68
      );
      pdf.text(`Transaction ${status.charAt(0).toUpperCase() + status.slice(1)}`, 105, 60, { align: "center" });

      pdf.setFontSize(26);
      pdf.setTextColor(255, 255, 255);
      pdf.text(`NGN ${amount.toLocaleString()}`, 105, 75, { align: "center" });


      const startY = 95;
      const leftX = 40;
      const rightX = 70;
      const lineHeight = 10;
      // Set styling for labels
      pdf.setFontSize(12);
      pdf.setTextColor(200, 200, 200);

      // Add transaction details - Left column labels
      pdf.text("Transfer type:", leftX, startY, { align: "right" });
      pdf.text("Recipient:", leftX, startY + lineHeight, { align: "right" });
      pdf.text("Bank:", leftX, startY + lineHeight * 2, { align: "right" });
      pdf.text("Transaction ID:", leftX, startY + lineHeight * 3, { align: "right" });
      pdf.text("Time:", leftX, startY + lineHeight * 4, { align: "right" });

      if (transactionFee !== undefined) {
        pdf.text("Fee:", leftX, startY + lineHeight * 5, { align: "right" });
      }


      pdf.setTextColor(255, 255, 255);
      pdf.text("Bank Transfer", rightX, startY, { align: "left" });
      pdf.text(recipient || "N/A", rightX, startY + lineHeight, { align: "left" });
      pdf.text(bank || "N/A", rightX, startY + lineHeight * 2, { align: "left" });


      if (txHash) {
        const shortHash = `${txHash.substring(0, 10)}...${txHash.substring(txHash.length - 4)}`;
        pdf.text(shortHash, rightX, startY + lineHeight * 3, { align: "left" });
      } else {
        pdf.text("N/A", rightX, startY + lineHeight * 3, { align: "left" });
      }

      pdf.text(timestamp || "N/A", rightX, startY + lineHeight * 4, { align: "left" });

      if (transactionFee !== undefined) {
        pdf.text(
          `-${transactionFee.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} ${tokenName || "Token"}`,
          rightX, startY + lineHeight * 5, { align: "left" }
        );
      }

      if (txHash) {

        pdf.setFontSize(9);
        pdf.setTextColor(156, 44, 255); // #9C2CFF
        const explorerName = getExplorerName(chain?.id || 534351, chain);
        const explorerUrl = getTransactionExplorerUrl(chain?.id || 534351, txHash, chain);
        pdf.text(`View on ${explorerName}:`, 105, 195, { align: "center" });
        pdf.text(explorerUrl, 105, 202, { align: "center" });
      }

      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Generated on ${new Date().toLocaleString()}`, 105, 280, { align: "center" });
      pdf.text("Powered by Defi Direct", 105, 285, { align: "center" });

      // Save the PDF
      pdf.save(`defi-direct-receipt-${txHash?.substring(0, 8) || "unknown"}.pdf`);

      toast.success("PDF receipt downloaded!", {
        position: "top-center",
        style: {
          background: "#333",
          color: "#fff",
        },
      });
    }
  };

  const formattedTxHash = txHash ?
    `${txHash.substring(0, 8)}......${txHash.substring(txHash.length - 4)}` :
    "";

  const recipientName = recipient ? recipient.split(' ')[0] : '';
  const recipientSurname = recipient ? recipient.split(' ').slice(1).join(' ') : '';
  const fullRecipient = `${recipientName} ${recipientSurname}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[95vw] sm:w-full border-none bg-[#12032D] p-0 text-white rounded-[20px] sm:rounded-[40px] max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <div className={`${statusBgColors[status]} rounded-full p-3 sm:p-4 shadow-lg`}>
              <Image
                src={statusIcons[status] || "/successfulTx.png"}
                alt="Transaction Status"
                width={40}
                height={40}
                className="w-8 h-8 sm:w-10 sm:h-10"
              />
            </div>
            <div className="text-center">
              <p className={`text-xs sm:text-sm ${statusColors[status]}`}>
                Transaction {status.charAt(0).toUpperCase() + status.slice(1)}
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold">NGN {amount.toLocaleString()}</h2>
            </div>
          </div>

          <hr className="my-4 sm:my-6 border-gray-700" />

          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-white text-base sm:text-lg">Transfer type</span>
              <span className="text-sm text-gray-400">Bank Transfer</span>
            </div>

            <div className="flex justify-between items-start">
              <span className="text-white text-base sm:text-lg">Recipient Details</span>
              <span className="text-right text-gray-400 text-sm sm:text-base max-w-[60%]">
                <div className="break-words">{fullRecipient}</div>
                <div className="text-xs mt-1">
                  {txHash?.substring(0, 10)} | {bank}
                </div>
              </span>
            </div>

            {txHash && (
              <>
                <div className="flex justify-between">
                  <span className="text-white text-lg">Transaction ID</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 break-all text-right text-sm">{formattedTxHash}</span>
                    <button
                      onClick={() => copyToClipboard(txHash)}
                      className="text-gray-400 hover:text-white transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <a
                    href={getTransactionExplorerUrl(chain?.id || 534351, txHash, chain)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-500 hover:text-purple-400 text-xs flex items-center gap-1"
                  >
                    View on block explorer <ExternalLink size={14} />
                  </a>
                </div>
              </>
            )}

            <div className="flex justify-between">
              <span className="text-white text-lg">Time</span>
              <span className="text-gray-400">{timestamp}</span>
            </div>

            {transactionFee !== undefined && (
              <div className="flex justify-between">
                <span className="text-white text-lg">Fee</span>
                <span className="text-gray-400">
                  -{transactionFee.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} {tokenName || "Token"}
                </span>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={downloadPdfReceipt}
              className="w-full bg-[#9C2CFF] hover:bg-[#9338e8] transition text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
            >
              <FileDown size={18} />
              Download PDF receipt
            </button>
            <button
              onClick={downloadReceipt}
              className="w-full bg-transparent border border-[#9C2CFF] hover:bg-[#9C2CFF]/10 transition text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
            >
              <Download size={18} />
              Download text receipt
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}