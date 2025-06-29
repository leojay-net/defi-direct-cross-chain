import { ArrowLeft, Clock, Shield, TrendingUp } from "lucide-react"
import { useWallet } from "@/context/WalletContext"

interface QuoteData {
  rate: number
  lastUpdated: string
  tokenAmount: number
  priceImpact: number
}

interface TransferSummaryProps {
  amount: number
  recipient: string
  accountNumber: string
  bankName: string
  loading: boolean
  approving: boolean
  approved: boolean
  quote?: QuoteData | null
  token?: string
  approvalFee?: number
  tokenName?: string
  onBack: () => void
  onApprove: () => void | Promise<void>
  onConfirm: () => void | Promise<void>
}

export function TransferSummary({
  loading,
  approving,
  approved,
  amount,
  recipient,
  accountNumber,
  bankName,
  quote,
  token = "USDC",
  // tokenName = "USDC",
  // approvalFee = 0,
  onBack,
  onApprove,
  onConfirm,
}: TransferSummaryProps) {
  const { usdcPrice, usdtPrice } = useWallet();

  // Calculate fees in both token units and fiat
  // Always calculate fee as 1% of the fiat amount for consistency
  const fiatFee = amount * 0.01; // 1% of fiat amount in Naira

  // Calculate token fee amount based on current token price
  const currentTokenPrice = token === "USDT" ? usdtPrice : usdcPrice;
  const tokenFeeAmount = currentTokenPrice > 0 ? fiatFee / currentTokenPrice : 0;

  // Format token fee for stablecoin display (typically 2-6 decimal places)
  const formatTokenFee = (amount: number) => {
    if (amount === 0) return "0.00";

    // For stablecoins, show appropriate decimal places
    if (amount < 0.01) {
      return amount.toFixed(6); // Show more precision for very small amounts
    } else if (amount < 1) {
      return amount.toFixed(4); // 4 decimal places for amounts under $1
    } else {
      return amount.toFixed(2); // 2 decimal places for larger amounts
    }
  };

  const totalAmount = amount + fiatFee;

  return (
    <div className="w-[95vw] sm:w-full max-w-xl rounded-[2.5rem] sm:rounded-[2.5rem] bg-gradient-to-b from-[#1C1C27] to-[#14141B] p-4 sm:p-6">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <button
          onClick={onBack}
          className="text-white hover:opacity-80 transition-opacity"
          disabled={loading}
        >
          <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
        <h1 className="text-xl sm:text-2xl font-medium text-white">Transfer Summary</h1>
      </div>

      {/* Amount Display */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="mb-2">
          <p className="text-2xl sm:text-4xl font-bold text-white">₦{amount.toLocaleString()}</p>
          <p className="text-sm sm:text-lg text-gray-400 mt-1 truncate">TO {recipient.toUpperCase()}</p>
        </div>

        {quote && (
          <div className="bg-[#2F2F3A] rounded-xl p-3 mt-3 sm:mt-4">
            <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
              <span className="text-xs sm:text-sm text-white text-center">You&apos;ll send: {quote.tokenAmount.toFixed(6)} {token}</span>
            </div>
            <p className="text-xs text-gray-400 text-center">Rate: ₦{quote.rate.toLocaleString()} per {token}</p>
          </div>
        )}
      </div>

      {/* Transaction Details */}
      <div className="bg-gradient-to-b from-[#1C1C27]/80 to-[#14141B]/60 rounded-2xl sm:rounded-3xl overflow-hidden mb-4 sm:mb-6">
        <div className="space-y-3 sm:space-y-4 p-4 sm:p-6">
          {/* Transfer Type */}
          <div className="flex justify-between items-center text-sm sm:text-base">
            <span className="text-white">Transfer type</span>
            <div className="flex items-center gap-2">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
              <span className="text-xs sm:text-sm text-gray-400">Bank Transfer</span>
            </div>
          </div>

          {/* Recipient Details */}
          <div className="flex justify-between text-sm sm:text-base">
            <span className="text-white">Recipient Details</span>
            <div className="text-right max-w-[60%]">
              <p className="text-xs sm:text-sm text-gray-400 truncate">{recipient}</p>
              <p className="text-xs sm:text-sm text-gray-400">{accountNumber}</p>
              <p className="text-xs sm:text-sm text-gray-400 truncate">{bankName}</p>
            </div>
          </div>

          {/* Token Information */}
          {quote && (
            <div className="flex justify-between text-sm sm:text-base">
              <span className="text-white">Token Details</span>
              <div className="text-right">
                <p className="text-xs sm:text-sm text-gray-400">{quote.tokenAmount.toFixed(6)} {token}</p>
                <p className="text-xs text-gray-500">@ ₦{quote.rate.toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* Smart Contract ID */}
          <div className="flex justify-between text-sm sm:text-base">
            <span className="text-white">Smart Contract</span>
            <span className="text-xs sm:text-sm text-gray-400 font-mono">PayDirect v2.0</span>
          </div>

          {/* Timestamp */}
          <div className="flex justify-between text-sm sm:text-base">
            <span className="text-white">Time</span>
            <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-400">
              <Clock className="h-3 w-3" />
              <span className="text-right">{new Date().toLocaleString()}</span>
            </div>
          </div>

          {/* Fee Breakdown */}
          <div className="border-t border-gray-600 pt-3 sm:pt-4">
            <div className="flex justify-between mb-2 text-sm sm:text-base">
              <span className="text-white">Subtotal</span>
              <span className="text-gray-400">₦{amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-2 text-sm sm:text-base">
              <span className="text-white">Platform Fee (1%)</span>
              <div className="text-right">
                <p className="text-gray-400">₦{fiatFee.toFixed(2)}</p>
                {currentTokenPrice > 0 ? (
                  <p className="text-xs text-gray-500">
                    ~{formatTokenFee(tokenFeeAmount)} {token}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">
                    Loading {token} rate...
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-base sm:text-lg text-white">Total</span>
              <span className="text-base sm:text-lg text-white">₦{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex items-start gap-2 sm:gap-3">
          <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs sm:text-sm text-purple-400 font-medium mb-1">Secure Transaction</p>
            <p className="text-xs text-purple-300">
              This transaction is secured by smart contracts on the blockchain.
              Your funds are protected throughout the entire process.
            </p>
          </div>
        </div>
      </div>

      {/* Two-Step Process */}
      <div className="space-y-3 sm:space-y-4">
        {/* Step 1: Approve Tokens */}
        {!approved && (
          <button
            onClick={onApprove}
            disabled={approving || loading}
            className={`w-full rounded-xl sm:rounded-2xl py-3 sm:py-4 text-sm sm:text-lg font-medium transition-all duration-200 ${approving || loading
              ? "bg-gray-600 cursor-not-allowed text-gray-400"
              : "bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white shadow-lg hover:shadow-purple-500/25"
              }`}
          >
            {approving ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm sm:text-base">Approving Tokens...</span>
              </div>
            ) : (
              <span className="text-sm sm:text-base">Step 1: Approve Tokens</span>
            )}
          </button>
        )}

        {/* Step 2: Confirm Transfer */}
        {approved && (
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`w-full rounded-xl sm:rounded-2xl py-3 sm:py-4 text-sm sm:text-lg font-medium transition-all duration-200 ${loading
              ? "bg-gray-600 cursor-not-allowed text-gray-400"
              : "bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white shadow-lg hover:shadow-purple-500/25"
              }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm sm:text-base">Processing Transfer...</span>
              </div>
            ) : (
              <span className="text-sm sm:text-base">Step 2: Confirm Transfer</span>
            )}
          </button>
        )}

        {/* Approval Status */}
        {approved && !loading && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs sm:text-sm text-green-400 font-medium">Tokens approved successfully</span>
            </div>
          </div>
        )}
      </div>

      {/* Quote Timestamp */}
      {quote && (
        <p className="text-center text-xs text-gray-500 mt-3">
          Quote last updated: {quote.lastUpdated}
        </p>
      )}
    </div>
  );
}