"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, BarChart3, ArrowRight, Calendar, Target } from "lucide-react"

interface Expense {
  id: string
  categoryId: string
  amount: number
  description: string
  date: string
}

interface Category {
  id: string
  name: string
  budget: number
  spent: number
  icon: string
}

interface MonthlyData {
  categories: Category[]
  expenses: Expense[]
}

interface MonthlyComparisonProps {
  monthlyData: Record<string, MonthlyData>
  currentMonth: string
}

const formatMonthDisplay = (monthKey: string): string => {
  const [year, month] = monthKey.split("-")
  return `${year}年${Number.parseInt(month)}月`
}

const calculateMonthStats = (data: MonthlyData) => {
  const totalBudget = data.categories.reduce((sum, cat) => sum + cat.budget, 0)
  const totalSpent = data.expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const utilizationRate = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
  const categoryCount = data.categories.length
  const expenseCount = data.expenses.length
  const avgExpenseAmount = expenseCount > 0 ? totalSpent / expenseCount : 0

  return {
    totalBudget,
    totalSpent,
    remaining: totalBudget - totalSpent,
    utilizationRate,
    categoryCount,
    expenseCount,
    avgExpenseAmount,
  }
}

const calculateCategoryComparison = (currentData: MonthlyData, compareData: MonthlyData) => {
  const comparisons: Array<{
    categoryName: string
    icon: string
    currentSpent: number
    compareSpent: number
    change: number
    changePercent: number
    trend: "up" | "down" | "same"
  }> = []

  // Get all unique category names from both months
  const allCategories = new Set([
    ...currentData.categories.map((c) => c.name),
    ...compareData.categories.map((c) => c.name),
  ])

  allCategories.forEach((categoryName) => {
    const currentCat = currentData.categories.find((c) => c.name === categoryName)
    const compareCat = compareData.categories.find((c) => c.name === categoryName)

    const currentSpent = currentCat?.spent || 0
    const compareSpent = compareCat?.spent || 0
    const change = currentSpent - compareSpent
    const changePercent = compareSpent > 0 ? (change / compareSpent) * 100 : currentSpent > 0 ? 100 : 0

    let trend: "up" | "down" | "same" = "same"
    if (change > 0) trend = "up"
    else if (change < 0) trend = "down"

    comparisons.push({
      categoryName,
      icon: currentCat?.icon || compareCat?.icon || "📊",
      currentSpent,
      compareSpent,
      change,
      changePercent,
      trend,
    })
  })

  return comparisons.sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
}

export function MonthlyComparison({ monthlyData, currentMonth }: MonthlyComparisonProps) {
  const availableMonths = Object.keys(monthlyData).sort().reverse()
  const [compareMonth, setCompareMonth] = useState<string>(
    availableMonths.find((m) => m !== currentMonth) || currentMonth,
  )

  const currentData = monthlyData[currentMonth] || { categories: [], expenses: [] }
  const compareData = monthlyData[compareMonth] || { categories: [], expenses: [] }

  const currentStats = calculateMonthStats(currentData)
  const compareStats = calculateMonthStats(compareData)
  const categoryComparisons = calculateCategoryComparison(currentData, compareData)

  const spentChange = currentStats.totalSpent - compareStats.totalSpent
  const spentChangePercent =
    compareStats.totalSpent > 0 ? (spentChange / compareStats.totalSpent) * 100 : currentStats.totalSpent > 0 ? 100 : 0

  const budgetChange = currentStats.totalBudget - compareStats.totalBudget
  const budgetChangePercent =
    compareStats.totalBudget > 0
      ? (budgetChange / compareStats.totalBudget) * 100
      : currentStats.totalBudget > 0
        ? 100
        : 0

  const utilizationChange = currentStats.utilizationRate - compareStats.utilizationRate

  if (availableMonths.length < 2) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-3">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-medium">月間比較データがありません</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              複数の月にデータを入力すると、月間比較分析が利用できるようになります。
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Month Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
            月間比較分析
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{formatMonthDisplay(currentMonth)}</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">と比較:</span>
              <Select value={compareMonth} onValueChange={setCompareMonth}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableMonths
                    .filter((month) => month !== currentMonth)
                    .map((month) => (
                      <SelectItem key={month} value={month}>
                        {formatMonthDisplay(month)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">総支出比較</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-lg font-bold">¥{currentStats.totalSpent.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-sm">
                {spentChange > 0 ? (
                  <TrendingUp className="h-3 w-3 text-destructive" />
                ) : spentChange < 0 ? (
                  <TrendingDown className="h-3 w-3 text-primary" />
                ) : (
                  <Target className="h-3 w-3 text-muted-foreground" />
                )}
                <span className={spentChange > 0 ? "text-destructive" : spentChange < 0 ? "text-primary" : ""}>
                  {spentChange > 0 ? "+" : ""}
                  {spentChangePercent.toFixed(1)}%
                </span>
              </div>
              <div className="text-xs text-muted-foreground">前回: ¥{compareStats.totalSpent.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">予算使用率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-lg font-bold">{currentStats.utilizationRate.toFixed(1)}%</div>
              <div className="flex items-center gap-1 text-sm">
                {utilizationChange > 0 ? (
                  <TrendingUp className="h-3 w-3 text-destructive" />
                ) : utilizationChange < 0 ? (
                  <TrendingDown className="h-3 w-3 text-primary" />
                ) : (
                  <Target className="h-3 w-3 text-muted-foreground" />
                )}
                <span
                  className={utilizationChange > 0 ? "text-destructive" : utilizationChange < 0 ? "text-primary" : ""}
                >
                  {utilizationChange > 0 ? "+" : ""}
                  {utilizationChange.toFixed(1)}%
                </span>
              </div>
              <div className="text-xs text-muted-foreground">前回: {compareStats.utilizationRate.toFixed(1)}%</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">出費回数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-lg font-bold">{currentStats.expenseCount}回</div>
              <div className="flex items-center gap-1 text-sm">
                {currentStats.expenseCount > compareStats.expenseCount ? (
                  <TrendingUp className="h-3 w-3 text-yellow-500" />
                ) : currentStats.expenseCount < compareStats.expenseCount ? (
                  <TrendingDown className="h-3 w-3 text-blue-500" />
                ) : (
                  <Target className="h-3 w-3 text-muted-foreground" />
                )}
                <span>
                  {currentStats.expenseCount > compareStats.expenseCount ? "+" : ""}
                  {currentStats.expenseCount - compareStats.expenseCount}回
                </span>
              </div>
              <div className="text-xs text-muted-foreground">前回: {compareStats.expenseCount}回</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">平均出費額</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-lg font-bold">¥{Math.round(currentStats.avgExpenseAmount).toLocaleString()}</div>
              <div className="flex items-center gap-1 text-sm">
                {currentStats.avgExpenseAmount > compareStats.avgExpenseAmount ? (
                  <TrendingUp className="h-3 w-3 text-destructive" />
                ) : currentStats.avgExpenseAmount < compareStats.avgExpenseAmount ? (
                  <TrendingDown className="h-3 w-3 text-primary" />
                ) : (
                  <Target className="h-3 w-3 text-muted-foreground" />
                )}
                <span
                  className={
                    currentStats.avgExpenseAmount > compareStats.avgExpenseAmount
                      ? "text-destructive"
                      : currentStats.avgExpenseAmount < compareStats.avgExpenseAmount
                        ? "text-primary"
                        : ""
                  }
                >
                  {currentStats.avgExpenseAmount > compareStats.avgExpenseAmount ? "+" : ""}¥
                  {Math.round(currentStats.avgExpenseAmount - compareStats.avgExpenseAmount).toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                前回: ¥{Math.round(compareStats.avgExpenseAmount).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category-wise Comparison */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">カテゴリ別比較</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryComparisons.map((comparison, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{comparison.icon}</span>
                    <span className="font-medium">{comparison.categoryName}</span>
                  </div>
                  <Badge
                    variant={
                      comparison.trend === "up" ? "destructive" : comparison.trend === "down" ? "default" : "secondary"
                    }
                    className="text-xs"
                  >
                    {comparison.trend === "up" ? "増加" : comparison.trend === "down" ? "減少" : "変化なし"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">{formatMonthDisplay(currentMonth)}</div>
                    <div className="font-medium">¥{comparison.currentSpent.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">{formatMonthDisplay(compareMonth)}</div>
                    <div className="font-medium">¥{comparison.compareSpent.toLocaleString()}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    {comparison.trend === "up" ? (
                      <TrendingUp className="h-3 w-3 text-destructive" />
                    ) : comparison.trend === "down" ? (
                      <TrendingDown className="h-3 w-3 text-primary" />
                    ) : (
                      <Target className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span
                      className={
                        comparison.trend === "up"
                          ? "text-destructive"
                          : comparison.trend === "down"
                            ? "text-primary"
                            : ""
                      }
                    >
                      {comparison.change > 0 ? "+" : ""}¥{comparison.change.toLocaleString()}
                    </span>
                  </div>
                  <div
                    className={
                      comparison.changePercent > 0
                        ? "text-destructive"
                        : comparison.changePercent < 0
                          ? "text-primary"
                          : "text-muted-foreground"
                    }
                  >
                    {comparison.changePercent > 0 ? "+" : ""}
                    {comparison.changePercent.toFixed(1)}%
                  </div>
                </div>

                {/* Visual progress comparison */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>支出比較</span>
                    <span>
                      {Math.max(comparison.currentSpent, comparison.compareSpent) > 0
                        ? Math.round(
                            (Math.min(comparison.currentSpent, comparison.compareSpent) /
                              Math.max(comparison.currentSpent, comparison.compareSpent)) *
                              100,
                          )
                        : 0}
                      % 差
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Progress
                      value={
                        Math.max(comparison.currentSpent, comparison.compareSpent) > 0
                          ? (comparison.currentSpent / Math.max(comparison.currentSpent, comparison.compareSpent)) * 100
                          : 0
                      }
                      className="h-2"
                    />
                    <Progress
                      value={
                        Math.max(comparison.currentSpent, comparison.compareSpent) > 0
                          ? (comparison.compareSpent / Math.max(comparison.currentSpent, comparison.compareSpent)) * 100
                          : 0
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            ))}

            {categoryComparisons.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">比較するデータがありません</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
