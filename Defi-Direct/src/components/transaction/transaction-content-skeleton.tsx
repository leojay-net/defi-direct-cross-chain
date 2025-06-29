import { Skeleton } from "@/components/ui/skeleton"

export default function TransactionContentSkeleton() {
    const filters = ["All types", "Successful", "Pending", "Failed"]

    return (
        <div className="h-screen text-white px-2 sm:px-4">
            <div className="bg-gradient-to-b from-[#151021] via-[#151021] to-[#2f1256] rounded-t-2xl p-3 sm:p-4 lg:p-6 h-full flex flex-col">
                {/* Filters Section */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6 sm:mb-8">
                    {/* Filter Buttons - Desktop */}
                    <div className="hidden sm:flex rounded-full bg-[#352f3c] text-white">
                        {filters.map((filter, index) => (
                            <div
                                key={filter}
                                className={`px-4 py-2 ${index === 0 ? "bg-purple-600 rounded-full" : ""
                                    } whitespace-nowrap text-sm lg:text-base`}
                            >
                                {filter}
                            </div>
                        ))}
                    </div>

                    {/* Filter Dropdown - Mobile */}
                    <div className="relative sm:hidden">
                        <div className="w-full bg-[#352f3c] px-4 py-2 rounded-full flex justify-between items-center">
                            <span>All types</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    {/* Date Filter */}
                    <div className="flex items-center justify-center bg-[#352f3c] px-4 sm:px-6 py-2 rounded-full text-sm lg:text-base whitespace-nowrap">
                        <span className="mr-2">Last 7 days</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Transactions List Skeleton */}
                <div className="divide-y divide-gray-700 overflow-y-auto flex-1">
                    {[1, 2, 3, 4, 5].map((index) => (
                        <div
                            key={index}
                            className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 gap-3 sm:gap-0"
                        >
                            <div className="flex items-center">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#2c1053] rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                                    <svg
                                        className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500/50"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                    </svg>
                                </div>
                                <div>
                                    <Skeleton className="h-5 w-32 bg-white/10 mb-1" />
                                    <Skeleton className="h-4 w-24 bg-white/10" />
                                </div>
                            </div>
                            <div className="text-right ml-14 sm:ml-0">
                                <Skeleton className="h-6 w-28 bg-white/10 mb-1 ml-auto" />
                                <Skeleton className="h-4 w-36 bg-white/10 ml-auto" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
