"use client"

import React, { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./button"
import { EmptyState } from "./empty-state"

export interface Column<T> {
  header: React.ReactNode
  accessorKey?: keyof T
  cell?: (row: T, index: number) => React.ReactNode
  className?: string
  align?: "left" | "center" | "right"
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor?: (item: T, index: number) => string | number
  isLoading?: boolean
  zebra?: boolean
  pageSize?: number
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: React.ReactNode | { label: string; onClick: () => void }
  emptyIcon?: React.ComponentType<{ className?: string }>
  className?: string
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  zebra = false,
  pageSize = 10,
  emptyTitle = "No records found",
  emptyDescription = "There are no items to display right now.",
  emptyAction,
  emptyIcon,
  className = "",
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(data.length / pageSize) || 1
  const safePage = Math.min(Math.max(1, currentPage), totalPages)
  
  const startIndex = (safePage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, data.length)
  const currentData = data.slice(startIndex, endIndex)

  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1))
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1))

  return (
    <div className={`w-full overflow-hidden rounded-[10px] border border-gray-200 bg-white shadow-xs ${className}`}>
      <div className="relative max-h-[600px] overflow-auto">
        <table className="w-full text-left text-sm text-gray-900 border-collapse">
          <thead className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-xs border-b border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  scope="col"
                  className={`px-4 py-3 whitespace-nowrap ${
                    col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                      ? "text-center"
                      : "text-left"
                  } ${col.className || ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              Array.from({ length: pageSize > 5 ? 5 : pageSize }).map((_, rIdx) => (
                <tr key={`skeleton-${rIdx}`} className="animate-pulse">
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-4 py-3">
                      <div className="h-4 w-3/4 rounded bg-gray-200" />
                    </td>
                  ))}
                </tr>
              ))
            ) : currentData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                    icon={emptyIcon}
                  />
                </td>
              </tr>
            ) : (
              currentData.map((row, rIdx) => {
                const key = keyExtractor ? keyExtractor(row, rIdx) : rIdx
                const isEven = rIdx % 2 === 0
                return (
                  <tr
                    key={key}
                    className={`transition-colors duration-150 hover:bg-orange-50/40 ${
                      zebra && !isEven ? "bg-gray-50/50" : "bg-white"
                    }`}
                  >
                    {columns.map((col, cIdx) => (
                      <td
                        key={cIdx}
                        className={`px-4 py-3 text-sm text-gray-700 whitespace-nowrap ${
                          col.align === "right"
                            ? "text-right"
                            : col.align === "center"
                            ? "text-center"
                            : "text-left"
                        } ${col.className || ""}`}
                      >
                        {col.cell
                          ? col.cell(row, rIdx)
                          : col.accessorKey
                          ? String(row[col.accessorKey] ?? "")
                          : null}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && data.length > 0 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50/50 px-4 py-3 text-xs text-gray-600">
          <div>
            Showing <span className="font-semibold text-gray-900">{startIndex + 1}</span> to{" "}
            <span className="font-semibold text-gray-900">{endIndex}</span> of{" "}
            <span className="font-semibold text-gray-900">{data.length}</span> results
          </div>
          <div className="flex items-center gap-2">
            <span className="mr-2">
              Page {safePage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="xs"
              onClick={handlePrev}
              disabled={safePage <= 1}
              aria-label="Previous Page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={handleNext}
              disabled={safePage >= totalPages}
              aria-label="Next Page"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
