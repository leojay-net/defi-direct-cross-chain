import React from 'react'
import TransactionContent from '@/components/transaction/TransactionContent'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function TransactionPage() {
  return (
    <div>
      <TransactionContent />
    </div>
  )
}
