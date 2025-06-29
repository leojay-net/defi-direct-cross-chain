import { ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"

export default function TransferForm() {
  return (
    <div className="w-full max-w-xl rounded-[2.5rem]  p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-white">Transfer</h1>
        <button className="flex items-center gap-2 rounded-full bg-[#2F2F3A] px-4 py-2">
          <div className="relative h-6 w-6 overflow-hidden rounded-full">
            <Image
              src="/placeholder.svg"
              alt="Nigeria flag"
              width={24}
              height={24}
              className="h-full w-full object-cover"
            />
          </div>
          <span className="text-white">Nigeria</span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <div className="mt-6 rounded-3xl bg-[#14141B] p-6">
        <form className="space-y-4">
          <div className="space-y-3">
            <Select>
              <SelectTrigger className="h-14 w-full rounded-2xl border-0 bg-[#2F2F3A] text-white">
                <SelectValue placeholder="Select Bank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="first-bank">First Bank</SelectItem>
                <SelectItem value="uba">UBA</SelectItem>
                <SelectItem value="zenith">Zenith Bank</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="text"
              placeholder="Enter Account number"
              className="h-14 rounded-2xl border-0 bg-[#2F2F3A] text-white placeholder:text-gray-400"
            />

            <Input
              type="number"
              placeholder="Amount"
              className="h-14 rounded-2xl border-0 bg-[#2F2F3A] text-white placeholder:text-gray-400"
            />

            <p className="text-center text-sm text-gray-400">Available balance of the token should show here</p>
          </div>

          <button
            type="submit"
            className="mt-8 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-purple-500 py-4 text-white transition-opacity hover:opacity-90"
          >
            Transfer
          </button>
        </form>
      </div>
    </div>
  )
}

