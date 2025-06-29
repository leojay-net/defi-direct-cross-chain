"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import Image from "next/image"

interface Bank {
  id: string
  name: string
  icon: string
  shortName: string
}

const banks: Bank[] = [
  {
    id: "first-bank",
    name: "First Bank Nigeria",
    icon: "/placeholder.svg",
    shortName: "FB",
  },
  {
    id: "uba",
    name: "United Bank of Africa",
    icon: "/placeholder.svg",
    shortName: "UBA",
  },
  {
    id: "union-bank",
    name: "Union Bank Nigeria",
    icon: "/placeholder.svg",
    shortName: "UBN",
  },
]

// interface BankSelectProps {
//   onSelect: (bankId: string, bankName: string) => void
// }
interface BankSelectProps {
    onSelect: (bankId: string, bankName: string) => void
    selectedBank?: string // Add this prop to receive the selected bank
  }
  

export function BankSelect({ onSelect }: BankSelectProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedBank, setSelectedBank] = React.useState<Bank | null>(null)

  const filteredBanks = banks.filter((bank) => bank.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <Select
      onValueChange={(value) => {
        const bank = banks.find((b) => b.id === value)
        setSelectedBank(bank || null)
        if (bank) {
          onSelect(bank.id, bank.name)
        }
      }}
    >
      <SelectTrigger className="h-14 w-full rounded-2xl border-0 bg-[#2F2F3A] text-white">
        <div className="flex items-center gap-3">
          {selectedBank ? (
            <div className="h-8 w-8 overflow-hidden rounded-full bg-white">
              <Image
                src={selectedBank.icon || "/placeholder.svg"}
                alt={selectedBank.name}
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600">
              <span className="text-lg font-semibold text-white">B</span>
            </div>
          )}
          <SelectValue placeholder="Select Bank">
            {selectedBank ? (
              <span className="text-white">{selectedBank.name}</span>
            ) : (
              <span className="text-gray-400">Select Bank</span>
            )}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent className="w-full max-w-[400px] rounded-3xl border-0 bg-[#2F2F3A] p-4 text-white" align="center">
        <p className="mb-2 text-sm text-gray-400">scroll for selecting bank</p>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            type="text"
            placeholder="Search for Bank"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 rounded-2xl border-0 bg-[#1C1C27] pl-10 text-white placeholder:text-gray-400"
          />
        </div>
        <div className="max-h-[300px] space-y-2 overflow-y-auto">
          {filteredBanks.map((bank) => (
            <SelectItem key={bank.id} value={bank.id} className="rounded-xl focus:bg-[#1C1C27]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-white">
                  <Image
                    src={bank.icon || "/placeholder.svg"}
                    alt={bank.name}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                </div>
                <span>{bank.name}</span>
              </div>
            </SelectItem>
          ))}
        </div>
      </SelectContent>
    </Select>
  )
}

