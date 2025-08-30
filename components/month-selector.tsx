"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface MonthSelectorProps {
  currentMonth: string
  availableMonths: string[]
  onMonthChange: (monthKey: string) => void
}

const formatMonthDisplay = (monthKey: string): string => {
  const [year, month] = monthKey.split("-")
  return `${year}年${Number.parseInt(month)}月`
}

const getMonthKey = (year: number, month: number): string => {
  return `${year}-${String(month).padStart(2, "0")}`
}

export function MonthSelector({ currentMonth, availableMonths, onMonthChange }: MonthSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState(() => {
    const [year] = currentMonth.split("-")
    return Number.parseInt(year)
  })

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i)
  const months = [
    { value: 1, label: "1月" },
    { value: 2, label: "2月" },
    { value: 3, label: "3月" },
    { value: 4, label: "4月" },
    { value: 5, label: "5月" },
    { value: 6, label: "6月" },
    { value: 7, label: "7月" },
    { value: 8, label: "8月" },
    { value: 9, label: "9月" },
    { value: 10, label: "10月" },
    { value: 11, label: "11月" },
    { value: 12, label: "12月" },
  ]

  const goToPreviousMonth = () => {
    const [year, month] = currentMonth.split("-").map(Number)
    const prevDate = new Date(year, month - 2, 1)
    const prevMonthKey = getMonthKey(prevDate.getFullYear(), prevDate.getMonth() + 1)
    onMonthChange(prevMonthKey)
  }

  const goToNextMonth = () => {
    const [year, month] = currentMonth.split("-").map(Number)
    const nextDate = new Date(year, month, 1)
    const nextMonthKey = getMonthKey(nextDate.getFullYear(), nextDate.getMonth() + 1)
    onMonthChange(nextMonthKey)
  }

  const handleMonthSelect = (month: number) => {
    const monthKey = getMonthKey(selectedYear, month)
    onMonthChange(monthKey)
    setIsOpen(false)
  }

  const hasData = (year: number, month: number): boolean => {
    const monthKey = getMonthKey(year, month)
    return availableMonths.includes(monthKey)
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2 min-w-[140px] bg-transparent">
            <Calendar className="h-4 w-4" />
            {formatMonthDisplay(currentMonth)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="center">
          <div className="space-y-4">
            <div className="text-center">
              <h4 className="font-medium text-sm text-muted-foreground mb-3">年月を選択</h4>
            </div>

            {/* Year Selection */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">年</label>
              <div className="flex gap-1">
                {years.map((year) => (
                  <Button
                    key={year}
                    variant={selectedYear === year ? "default" : "outline"}
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setSelectedYear(year)}
                  >
                    {year}
                  </Button>
                ))}
              </div>
            </div>

            {/* Month Selection */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">月</label>
              <div className="grid grid-cols-3 gap-1">
                {months.map((month) => {
                  const monthKey = getMonthKey(selectedYear, month.value)
                  const isCurrentMonth = monthKey === currentMonth
                  const hasMonthData = hasData(selectedYear, month.value)

                  return (
                    <Button
                      key={month.value}
                      variant={isCurrentMonth ? "default" : "outline"}
                      size="sm"
                      className={`text-xs relative ${hasMonthData ? "border-primary/50" : ""}`}
                      onClick={() => handleMonthSelect(month.value)}
                    >
                      {month.label}
                      {hasMonthData && <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />}
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Available Months Info */}
            {availableMonths.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">データがある月:</p>
                <div className="flex flex-wrap gap-1">
                  {availableMonths.slice(0, 8).map((monthKey) => (
                    <Button
                      key={monthKey}
                      variant="ghost"
                      size="sm"
                      className="text-xs h-6 px-2"
                      onClick={() => {
                        onMonthChange(monthKey)
                        setIsOpen(false)
                      }}
                    >
                      {formatMonthDisplay(monthKey)}
                    </Button>
                  ))}
                  {availableMonths.length > 8 && (
                    <span className="text-xs text-muted-foreground self-center">他{availableMonths.length - 8}件</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <Button variant="outline" size="sm" onClick={goToNextMonth}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
