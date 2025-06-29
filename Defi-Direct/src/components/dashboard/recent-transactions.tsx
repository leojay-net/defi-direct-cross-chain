import { Avatar } from "antd"
import { ArrowUpOutlined } from "@ant-design/icons"

interface Transaction {
  id: string
  name: string
  bank: string
  amount: string
  status: "successful" | "pending" | "failed"
  date: string
}

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "successful":
        return "text-green-500"
      case "pending":
        return "text-yellow-500"
      case "failed":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <div className="rounded-2xl bg-[#1A1727] p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg text-white">Recent transactions</h2>
        <a href="#" className="text-purple-500 hover:text-purple-400">
          view all
        </a>
      </div>
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between rounded-lg bg-[#2D2A3C] p-4">
            <div className="flex items-center gap-4">
              <Avatar icon={<ArrowUpOutlined className="rotate-45" />} className="bg-purple-900 text-purple-500" />
              <div>
                <p className="font-medium text-white">{transaction.name}</p>
                <p className="text-sm text-gray-400">{transaction.bank}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={getStatusColor(transaction.status)}>NGN{transaction.amount}</p>
              <p className="text-sm text-gray-400">
                {transaction.status} | {transaction.date}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

