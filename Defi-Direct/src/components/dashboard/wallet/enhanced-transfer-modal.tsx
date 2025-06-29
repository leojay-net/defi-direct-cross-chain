// "use client"

// import React, { useState, useEffect } from 'react'
// import { Dialog, DialogContent } from '@/components/ui/dialog'
// import { TransferSummary } from './transfer-summary'
// import { ArrowUpRight, CheckCircle, TrendingUp, Shield, Clock, ChevronDown } from 'lucide-react'
// import { useWallet } from '@/context/WalletContext'
// import { usePublicClient, useWalletClient } from 'wagmi'
// import { convertFiatToToken } from '@/utils/convertFiatToToken'
// import { approveTransaction } from '@/services/initiateTransaction'
// import { initiateTransaction } from '@/services/initiateTransaction'
// import { parseTransactionReceipt } from '@/services/initiateTransaction'
// import { fetchTokenPrice } from '@/utils/fetchTokenprice'
// import { formatBalance } from '@/utils/formatBalance'
// import toast, { Toaster } from 'react-hot-toast'

// interface Bank {
//     name: string
//     code: string
// }

// interface Token {
//     name: string
//     symbol: string
//     address: `0x${string}`
//     icon: string
// }

// interface QuoteData {
//     rate: number
//     lastUpdated: string
//     tokenAmount: number
//     priceImpact: number
// }

// interface TransactionRecord {
//     id: string
//     transactionHash?: string
//     amount: number
//     recipient: string
//     accountNumber: string
//     bankName: string
//     token: string
//     fee: number
//     status: 'successful' | 'pending' | 'failed'
//     timestamp: string
//     smartContractId?: string
//     fiatAmount?: number
//     exchangeRate?: number
//     type: 'send' | 'receive'
//     description?: string
// }

// interface EnhancedTransferModalProps {
//     open: boolean
//     onOpenChange: (open: boolean) => void
// }

// const tokens: Token[] = [
//     {
//         name: 'USDC',
//         symbol: 'USDC',
//         address: '0xA0b86a33E6441c41b9CfE8E9d6ae1cE1fcF52e10' as `0x${string}`,
//         icon: '/USD_Coin_3D.png'
//     },
//     {
//         name: 'USDT',
//         symbol: 'USDT',
//         address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' as `0x${string}`,
//         icon: '/USD_Coin_3D.png'
//     }
// ]

// export function EnhancedTransferModal({ open, onOpenChange }: EnhancedTransferModalProps) {
//     const [banks, setBanks] = useState<Bank[]>([])
//     const [loading, setLoading] = useState(false)
//     const [approving, setApproving] = useState(false)
//     const [approved, setApproved] = useState(false)
//     const [showSummary, setShowSummary] = useState(false)
//     const [selectedToken, setSelectedToken] = useState(tokens[0])
//     const [dropdownOpen, setDropdownOpen] = useState(false)
//     const [currentStep, setCurrentStep] = useState(1)
//     const [, setCompletedTransaction] = useState<TransactionRecord | null>(null)

//     // Enhanced quote state
//     const [quote, setQuote] = useState<QuoteData | null>(null)
//     const [quoteLoading, setQuoteLoading] = useState(false)

//     const { usdcBalance, usdtBalance } = useWallet()
//     const [usdcPrice, setUsdcPrice] = useState<number>(0)
//     const [usdtPrice, setUsdtPrice] = useState<number>(0)

//     const [formData, setFormData] = useState({
//         bankCode: '',
//         accountNumber: '',
//         accountName: '',
//         amount: ''
//     })
//     const [verifying, setVerifying] = useState(false)

//     // Generate real-time quote
//     const generateQuote = async (amount: string) => {
//         if (!amount || parseFloat(amount) <= 0) {
//             setQuote(null)
//             return
//         }

//         setQuoteLoading(true)
//         try {
//             const amountValue = parseFloat(amount)
//             const tokenPrice = selectedToken.name === 'USDC' ? usdcPrice : usdtPrice

//             if (tokenPrice > 0) {
//                 // Convert NGN to token amount
//                 const tokenAmount = await convertFiatToToken(amountValue, selectedToken.name, tokenPrice)
//                 const realTokenAmount = tokenAmount / 10 ** 6 // Convert from smallest unit to actual token amount
//                 // Calculate fee as 1% of the amount
//                 // const calculatedFee = (amountValue * 100) / 10000
//                 const priceImpact = 0.05 // Simulated price impact

//                 const newQuote: QuoteData = {
//                     rate: tokenPrice,
//                     lastUpdated: new Date().toLocaleTimeString(),
//                     tokenAmount: realTokenAmount,
//                     priceImpact: priceImpact
//                 }

//                 setQuote(newQuote)
//             }
//         } catch (error) {
//             console.error('Error generating quote:', error)
//         } finally {
//             setQuoteLoading(false)
//         }
//     }

//     const fetchPrices = async () => {
//         try {
//             const [usdcPriceData, usdtPriceData] = await Promise.all([
//                 fetchTokenPrice('USDC'),
//                 fetchTokenPrice('USDT')
//             ])
//             setUsdcPrice(usdcPriceData)
//             setUsdtPrice(usdtPriceData)
//         } catch (error) {
//             console.error('Error fetching token prices:', error)
//         }
//     }

//     const usdcBalanceFormatted = formatBalance(usdcBalance)
//     const usdtBalanceFormatted = formatBalance(usdtBalance)

//     const publicClient = usePublicClient()
//     const { data: walletClient } = useWalletClient()

//     // Reset form when modal is closed
//     const resetForm = () => {
//         setFormData({
//             bankCode: '',
//             accountNumber: '',
//             accountName: '',
//             amount: '',
//         })
//         setShowSummary(false)
//         setLoading(false)
//         setApproving(false)
//         setApproved(false)
//         setVerifying(false)
//         setCurrentStep(1)
//         setQuote(null)
//         setCompletedTransaction(null)
//     }

//     useEffect(() => {
//         let isMounted = true

//         const fetchBanks = async () => {
//             try {
//                 const response = await fetch('/api/get-banks')
//                 const result = await response.json()
//                 if (result.success && isMounted) {
//                     setBanks(result.data)
//                 }
//             } catch (error) {
//                 console.error('Error fetching banks:', error)
//             }
//         }

//         if (open) {
//             fetchBanks()
//         }

//         if (open) {
//             fetchPrices()
//         }

//         return () => {
//             isMounted = false
//         }
//     }, [open])

//     useEffect(() => {
//         if (!open) {
//             resetForm()
//         }
//     }, [open])

//     // Auto-refresh quote every 10 seconds
//     useEffect(() => {
//         if (open && formData.amount && !showSummary) {
//             const interval = setInterval(() => {
//                 generateQuote(formData.amount)
//             }, 10000)

//             return () => clearInterval(interval)
//         }
//     }, [open, formData.amount, showSummary, selectedToken.name, usdcPrice, usdtPrice])

//     const usdcNgnBalance = (parseFloat(usdcBalanceFormatted) * usdcPrice).toLocaleString(undefined, {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2,
//     })

//     const usdtNgnBalance = (parseFloat(usdtBalanceFormatted) * usdtPrice).toLocaleString(undefined, {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2,
//     })

//     const selectedTokenBalance = selectedToken.name === "USDC" ? usdcNgnBalance : usdtNgnBalance

//     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//         const { name, value } = e.target

//         if (name === 'accountNumber') {
//             if (value.length < 10) {
//                 setFormData(prev => ({ ...prev, [name]: value, accountName: '' }))
//             } else if (value.length === 10 && formData.bankCode) {
//                 setFormData(prev => ({ ...prev, [name]: value }))
//                 verifyAccount(formData.bankCode, value)
//             } else {
//                 setFormData(prev => ({ ...prev, [name]: value.slice(0, 10) }))
//             }
//         } else {
//             setFormData(prev => ({ ...prev, [name]: value }))

//             if (name === 'bankCode' && formData.accountNumber.length === 10 && value) {
//                 verifyAccount(value, formData.accountNumber)
//             }
//         }

//         // Generate quote when amount changes
//         if (name === 'amount') {
//             generateQuote(value)
//         }
//     }

//     const verifyAccount = async (bankCode: string, accountNumber: string) => {
//         if (accountNumber.length !== 10) return

//         setVerifying(true)
//         setFormData(prev => ({ ...prev, accountName: '' }))

//         try {
//             const response = await fetch('/api/verify-account', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({ bankCode, accountNumber })
//             })

//             const result = await response.json()

//             if (result.success) {
//                 setFormData(prev => ({ ...prev, accountName: result.data.account_name }))
//                 toast.success(`Account verified: ${result.data.account_name}`)
//             } else {
//                 toast.error(result.message || 'Account verification failed')
//             }
//         } catch (error) {
//             console.error('Account verification error:', error)
//             toast.error('Error verifying account')
//         } finally {
//             setVerifying(false)
//         }
//     }

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault()

//         // Validate form
//         if (!formData.bankCode || !formData.accountNumber || !formData.accountName || !formData.amount) {
//             toast.error("Please fill in all required fields")
//             return
//         }

//         const amountValue = parseFloat(formData.amount)
//         if (isNaN(amountValue) || amountValue <= 0 || amountValue > parseFloat(selectedTokenBalance.replace(/,/g, ''))) {
//             toast.error("Please enter a valid amount within your available balance")
//             return
//         }

//         // Set loading state and wait for 2 seconds before showing the summary
//         setLoading(true)
//         setTimeout(() => {
//             if (open) {
//                 setShowSummary(true)
//                 setLoading(false)
//             }
//         }, 2000) // 2-second delay
//     }

//     const handleApproveTokens = async () => {
//         setApproving(true)

//         const price = selectedToken.name === "USDC" ? usdcPrice : usdtPrice
//         const amountValue = parseFloat(formData.amount)
//         const tokenAmount = await convertFiatToToken(amountValue, selectedToken.name, price)

//         try {
//             if (walletClient && publicClient) {
//                 // Step 1: Approve the transaction (user signs for approval)
//                 await approveTransaction(tokenAmount, selectedToken.address, publicClient, walletClient)
//                 setApproved(true)
//                 toast.success("Tokens approved successfully! You can now confirm the transfer.")
//             } else {
//                 toast.error("Wallet client is not available")
//             }
//         } catch (error) {
//             console.error('Approval error:', error)
//             toast.error("Failed to approve tokens. Please try again.")
//         } finally {
//             setApproving(false)
//         }
//     }

//     const handleConfirmTransfer = async () => {
//         if (!approved) {
//             toast.error("Please approve tokens first")
//             return
//         }

//         setLoading(true)

//         const price = selectedToken.name === "USDC" ? usdcPrice : usdtPrice
//         console.log("Withdrawal price:", price)
//         const amountValue = parseFloat(formData.amount)
//         const tokenAmount = await convertFiatToToken(amountValue, selectedToken.name, price)

//         try {
//             if (walletClient && publicClient) {
//                 // Step 1: Initiate the transaction (approval already done)
//                 const receipt = await initiateTransaction(
//                     tokenAmount,
//                     selectedToken.address,
//                     formData.accountNumber,
//                     amountValue,
//                     formData.bankCode,
//                     formData.accountName,
//                     publicClient,
//                     walletClient
//                 )

//                 // Step 2: Call the backend API to complete the transfer
//                 if (receipt && receipt.status === 'success') {
//                     try {
//                         const parsedReceipt = await parseTransactionReceipt(receipt)
//                         if (parsedReceipt) {
//                             const response = await fetch('/api/initiate-transfer', {
//                                 method: 'POST',
//                                 headers: {
//                                     'Content-Type': 'application/json',
//                                 },
//                                 body: JSON.stringify({
//                                     bankCode: formData.bankCode,
//                                     accountNumber: formData.accountNumber,
//                                     accountName: formData.accountName,
//                                     amount: amountValue,
//                                 }),
//                             })

//                             const result = await response.json()

//                             if (result.success) {
//                                 // Complete the transaction using server-side transaction manager
//                                 try {
//                                     const completeResponse = await fetch('/api/complete-transaction', {
//                                         method: 'POST',
//                                         headers: {
//                                             'Content-Type': 'application/json',
//                                         },
//                                         body: JSON.stringify({
//                                             transactionId: parsedReceipt.txId,
//                                             amountSpent: parsedReceipt.amount.toString(), // Convert BigInt to string
//                                             // TODO: Add authentication token
//                                         }),
//                                     })

//                                     const completeResult = await completeResponse.json()

//                                     if (completeResult.success) {
//                                         console.log("Transaction completed successfully:", completeResult.txHash)
//                                         toast.success(`Your transfer of ₦${formData.amount.toString()} is complete!`)
//                                     } else {
//                                         console.warn("Complete transaction failed:", completeResult.message)
//                                         toast.error("Transfer successful but smart contract completion failed")
//                                     }
//                                 } catch (completeError) {
//                                     console.error("Failed to complete transaction:", completeError)
//                                     toast.error("Transfer successful but smart contract completion failed")
//                                     // Note: The backend transfer was successful but the smart contract completion failed
//                                 }

//                                 resetForm()
//                                 onOpenChange(false)
//                             } else {
//                                 toast.error(result.message || "Could not complete your transfer request")
//                             }
//                         }
//                     }
//                     catch (error) {
//                         console.error("Error processing transaction:", error)
//                         toast.error("An error occurred while processing your transaction")
//                     }
//                 }
//             } else {
//                 toast.error("Wallet client is not available")
//             }
//         } catch (error) {
//             toast.error("An unexpected error occurred. Please try again later.")
//             console.error('Transfer error:', error)
//         } finally {
//             if (open) {
//                 setLoading(false)
//             }
//         }
//     }

//     if (showSummary) {
//         return (
//             <Dialog open={open} onOpenChange={onOpenChange}>
//                 <DialogContent className="max-w-xl border-none bg-transparent p-0">
//                     <TransferSummary
//                         loading={loading}
//                         approving={approving}
//                         approved={approved}
//                         amount={parseFloat(formData.amount)}
//                         recipient={formData.accountName}
//                         accountNumber={formData.accountNumber}
//                         bankName={formData.bankCode}
//                         quote={quote}
//                         token={selectedToken.name}
//                         onBack={() => {
//                             setShowSummary(false)
//                             setLoading(false)
//                         }}
//                         onApprove={handleApproveTokens}
//                         onConfirm={handleConfirmTransfer}
//                     />
//                 </DialogContent>
//             </Dialog>
//         )
//     }

//     return (
//         <>
//             <Toaster position="top-center" />
//             <Dialog open={open} onOpenChange={onOpenChange}>
//                 <DialogContent className="max-w-md border-none bg-[#1C1C27] p-0 text-white">
//                     <div className="space-y-6 rounded-3xl bg-gradient-to-b from-[#1C1C27] to-[#1C1C2700] p-6">
//                         {/* Progress Steps */}
//                         <div className="flex items-center justify-between mb-6">
//                             <div className="flex items-center gap-2">
//                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-400'
//                                     }`}>
//                                     {currentStep > 1 ? <CheckCircle className="h-4 w-4" /> : '1'}
//                                 </div>
//                                 <span className="text-sm text-gray-400">Verify Account</span>
//                             </div>

//                             <div className={`flex-1 h-0.5 mx-3 ${currentStep >= 2 ? 'bg-purple-600' : 'bg-gray-600'}`} />

//                             <div className="flex items-center gap-2">
//                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-400'
//                                     }`}>
//                                     {currentStep > 2 ? <CheckCircle className="h-4 w-4" /> : '2'}
//                                 </div>
//                                 <span className="text-sm text-gray-400">Enter Amount</span>
//                             </div>

//                             <div className={`flex-1 h-0.5 mx-3 ${currentStep >= 3 ? 'bg-purple-600' : 'bg-gray-600'}`} />

//                             <div className="flex items-center gap-2">
//                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 3 ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-400'
//                                     }`}>
//                                     3
//                                 </div>
//                                 <span className="text-sm text-gray-400">Confirm</span>
//                             </div>
//                         </div>

//                         {/* Header */}
//                         <div className="text-center">
//                             <div className="mb-4 flex justify-center">
//                                 <div className="rounded-full bg-gradient-to-r from-purple-600 to-purple-500 p-3">
//                                     <ArrowUpRight className="h-6 w-6" />
//                                 </div>
//                             </div>
//                             <h2 className="text-2xl font-semibold">Send Money</h2>
//                             <p className="mt-2 text-gray-400">
//                                 Transfer funds to any Nigerian bank account
//                             </p>
//                         </div>

//                         <form onSubmit={handleSubmit} className="space-y-4">
//                             {/* Token Selection */}
//                             <div className="space-y-2">
//                                 <label className="text-sm font-medium text-gray-300">Select Token</label>
//                                 <div className="relative">
//                                     <button
//                                         type="button"
//                                         onClick={() => setDropdownOpen(!dropdownOpen)}
//                                         className="flex w-full items-center justify-between rounded-xl border border-gray-600 bg-[#2F2F3A] p-3 text-left hover:border-purple-500 focus:border-purple-500 focus:outline-none"
//                                     >
//                                         <div className="flex items-center gap-3">
//                                             <img src={selectedToken.icon} alt={selectedToken.name} className="h-8 w-8" />
//                                             <div>
//                                                 <p className="font-medium">{selectedToken.name}</p>
//                                                 <p className="text-sm text-gray-400">
//                                                     Balance: ₦{selectedTokenBalance}
//                                                 </p>
//                                             </div>
//                                         </div>
//                                         <ChevronDown className={`h-5 w-5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
//                                     </button>

//                                     {dropdownOpen && (
//                                         <div className="absolute z-10 mt-1 w-full rounded-xl border border-gray-600 bg-[#2F2F3A] shadow-lg">
//                                             {tokens.map((token) => (
//                                                 <button
//                                                     key={token.name}
//                                                     type="button"
//                                                     onClick={() => {
//                                                         setSelectedToken(token)
//                                                         setDropdownOpen(false)
//                                                         // Regenerate quote with new token
//                                                         if (formData.amount) {
//                                                             generateQuote(formData.amount)
//                                                         }
//                                                     }}
//                                                     className="flex w-full items-center gap-3 p-3 hover:bg-[#3F3F4A] first:rounded-t-xl last:rounded-b-xl"
//                                                 >
//                                                     <img src={token.icon} alt={token.name} className="h-8 w-8" />
//                                                     <div className="text-left">
//                                                         <p className="font-medium">{token.name}</p>
//                                                         <p className="text-sm text-gray-400">
//                                                             Balance: ₦{token.name === "USDC" ? usdcNgnBalance : usdtNgnBalance}
//                                                         </p>
//                                                     </div>
//                                                 </button>
//                                             ))}
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>

//                             {/* Bank Selection */}
//                             <div className="space-y-2">
//                                 <label htmlFor="bankCode" className="text-sm font-medium text-gray-300">
//                                     Select Bank
//                                 </label>
//                                 <select
//                                     id="bankCode"
//                                     name="bankCode"
//                                     value={formData.bankCode}
//                                     onChange={handleChange}
//                                     className="w-full rounded-xl border border-gray-600 bg-[#2F2F3A] p-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
//                                     required
//                                 >
//                                     <option value="">Choose a bank</option>
//                                     {banks.map((bank) => (
//                                         <option key={bank.code} value={bank.code}>
//                                             {bank.name}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>

//                             {/* Account Number */}
//                             <div className="space-y-2">
//                                 <label htmlFor="accountNumber" className="text-sm font-medium text-gray-300">
//                                     Account Number
//                                 </label>
//                                 <input
//                                     type="text"
//                                     id="accountNumber"
//                                     name="accountNumber"
//                                     value={formData.accountNumber}
//                                     onChange={handleChange}
//                                     placeholder="Enter 10-digit account number"
//                                     className="w-full rounded-xl border border-gray-600 bg-[#2F2F3A] p-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
//                                     maxLength={10}
//                                     required
//                                 />

//                                 {/* Account Name Display */}
//                                 {verifying && (
//                                     <div className="flex items-center gap-2 text-sm text-yellow-500">
//                                         <div className="h-4 w-4 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent"></div>
//                                         Verifying account...
//                                     </div>
//                                 )}

//                                 {formData.accountName && !verifying && (
//                                     <div className="flex items-center gap-2 text-sm text-green-500">
//                                         <CheckCircle className="h-4 w-4" />
//                                         {formData.accountName}
//                                     </div>
//                                 )}
//                             </div>

//                             {/* Amount */}
//                             <div className="space-y-2">
//                                 <label htmlFor="amount" className="text-sm font-medium text-gray-300">
//                                     Amount (NGN)
//                                 </label>
//                                 <div className="relative">
//                                     <input
//                                         type="number"
//                                         id="amount"
//                                         name="amount"
//                                         value={formData.amount}
//                                         onChange={handleChange}
//                                         placeholder="0.00"
//                                         className="w-full rounded-xl border border-gray-600 bg-[#2F2F3A] p-3 pl-8 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
//                                         step="0.01"
//                                         min="0"
//                                         required
//                                     />
//                                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₦</span>
//                                 </div>

//                                 {/* Real-time Quote Display */}
//                                 {formData.amount && quote && !quoteLoading && (
//                                     <div className="bg-[#2F2F3A] rounded-xl p-4 mt-3">
//                                         <div className="flex items-center gap-2 mb-3">
//                                             <TrendingUp className="h-4 w-4 text-green-500" />
//                                             <span className="text-sm font-medium text-white">Live Quote</span>
//                                             <div className="flex items-center gap-1 text-xs text-gray-400">
//                                                 <Clock className="h-3 w-3" />
//                                                 Updated {quote.lastUpdated}
//                                             </div>
//                                         </div>

//                                         <div className="space-y-2 text-sm">
//                                             <div className="flex justify-between">
//                                                 <span className="text-gray-400">Exchange Rate:</span>
//                                                 <span className="text-white">₦{quote.rate.toLocaleString()} / {selectedToken.name}</span>
//                                             </div>
//                                             <div className="flex justify-between">
//                                                 <span className="text-gray-400">You&apos;ll send:</span>
//                                                 <span className="text-white">{quote.tokenAmount.toFixed(6)} {selectedToken.name}</span>
//                                             </div>
//                                             <div className="flex justify-between">
//                                                 <span className="text-gray-400">Fee (1%):</span>
//                                                 <span className="text-white">₦{((parseFloat(formData.amount) * 100) / 10000).toFixed(2)}</span>
//                                             </div>
//                                             <div className="flex justify-between text-xs">
//                                                 <span className="text-gray-500">Price Impact:</span>
//                                                 <span className="text-yellow-500">{(quote.priceImpact * 100).toFixed(2)}%</span>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 )}

//                                 {quoteLoading && formData.amount && (
//                                     <div className="bg-[#2F2F3A] rounded-xl p-4 mt-3">
//                                         <div className="flex items-center gap-2">
//                                             <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"></div>
//                                             <span className="text-sm text-gray-400">Generating quote...</span>
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>

//                             {/* Security Notice */}
//                             <div className="bg-[#2F2F3A]/50 rounded-xl p-3 mt-4">
//                                 <div className="flex items-start gap-2">
//                                     <Shield className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
//                                     <div className="text-xs text-gray-400">
//                                         <p className="font-medium text-white mb-1">Secure Transfer</p>
//                                         <p>All transactions are secured by smart contracts and encrypted end-to-end.</p>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Submit Button */}
//                             <button
//                                 type="submit"
//                                 disabled={loading || !formData.accountName || !formData.amount || quoteLoading}
//                                 className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 p-3 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
//                             >
//                                 {loading ? (
//                                     <div className="flex items-center justify-center gap-2">
//                                         <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
//                                         Processing...
//                                     </div>
//                                 ) : (
//                                     'Review Transfer'
//                                 )}
//                             </button>
//                         </form>
//                     </div>
//                 </DialogContent>
//             </Dialog>
//         </>
//     )
// }