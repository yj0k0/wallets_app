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
  dayCalculationType?: DayCalculationType // Added optional day calculation type
}

export interface BudgetAnalysis {
  totalBudget: number
  totalSpent: number
  totalRemaining: number
  dailyAverage: number
  daysRemaining: number
  burnRate: number
  projectedEndDate: string | null
  savingsRate: number
  budgetEfficiency: number
}

export interface CategoryAnalysis {
  categoryId: string
  name: string
  icon: string
  budget: number
  spent: number
  remaining: number
  efficiency: number
  dailyAverage: number
  projectedTotal: number
  isOnTrack: boolean
  recommendation: string
  riskLevel: "low" | "medium" | "high"
}

export interface SpendingPattern {
  averageDaily: number
  averageWeekly: number
  peakSpendingDay: string
  mostExpensiveCategory: string
  spendingTrend: "increasing" | "decreasing" | "stable"
  seasonality: number
}

export interface BudgetRecommendation {
  type: "increase" | "decrease" | "redistribute" | "optimize"
  categoryId: string
  currentAmount: number
  suggestedAmount: number
  reason: string
  impact: number
}

// Core calculation functions
export function calculateBudgetAnalysis(categories: Category[], expenses: Expense[]): BudgetAnalysis {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  // Filter expenses for current month
  const monthlyExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date)
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
  })

  const totalBudget = categories.reduce((sum, cat) => sum + cat.budget, 0)
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0)
  const totalRemaining = totalBudget - totalSpent

  // Calculate days in month and remaining
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const daysPassed = now.getDate()
  const daysRemaining = daysInMonth - daysPassed + 1

  // Calculate daily averages and burn rate
  const dailyAverage = daysRemaining > 0 ? totalRemaining / daysRemaining : 0
  const actualDailySpending = daysPassed > 0 ? totalSpent / daysPassed : 0
  const burnRate = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  // Project when budget will run out
  let projectedEndDate: string | null = null
  if (actualDailySpending > 0 && totalRemaining > 0) {
    const daysUntilBudgetExhausted = totalRemaining / actualDailySpending
    const endDate = new Date(now)
    endDate.setDate(endDate.getDate() + Math.floor(daysUntilBudgetExhausted))
    projectedEndDate = endDate.toISOString().split("T")[0]
  }

  // Calculate savings rate (money not spent vs budget)
  const savingsRate = totalBudget > 0 ? (totalRemaining / totalBudget) * 100 : 0

  // Calculate budget efficiency (how well spending aligns with time passed)
  const expectedSpendingByNow = (daysPassed / daysInMonth) * totalBudget
  const budgetEfficiency = expectedSpendingByNow > 0 ? (totalSpent / expectedSpendingByNow) * 100 : 0

  return {
    totalBudget,
    totalSpent,
    totalRemaining,
    dailyAverage,
    daysRemaining,
    burnRate,
    projectedEndDate,
    savingsRate,
    budgetEfficiency,
  }
}

export function calculateCategoryAnalysis(category: Category, expenses: Expense[]): CategoryAnalysis {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  // Filter expenses for this category and current month
  const categoryExpenses = expenses.filter(
    (expense) =>
      expense.categoryId === category.id &&
      new Date(expense.date).getMonth() === currentMonth &&
      new Date(expense.date).getFullYear() === currentYear,
  )

  const remaining = category.budget - category.spent
  const efficiency = category.budget > 0 ? (category.spent / category.budget) * 100 : 0

  // Calculate daily average for this category
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const daysPassed = now.getDate()
  const daysRemaining = category.dayCalculationType
    ? getRemainingDaysByType(category.dayCalculationType)
    : daysInMonth - daysPassed + 1
  const dailyAverage = daysRemaining > 0 ? remaining / daysRemaining : 0

  // Project total spending for the month
  const actualDailySpending = daysPassed > 0 ? category.spent / daysPassed : 0
  const projectedTotal = category.spent + actualDailySpending * daysRemaining

  // Determine if on track
  const expectedSpendingByNow = (daysPassed / daysInMonth) * category.budget
  const isOnTrack = category.spent <= expectedSpendingByNow * 1.1 // 10% tolerance

  // Generate recommendation
  let recommendation = ""
  let riskLevel: "low" | "medium" | "high" = "low"

  if (efficiency > 100) {
    recommendation = "予算を超過しています。支出を控えるか予算を見直してください。"
    riskLevel = "high"
  } else if (efficiency > 80) {
    recommendation = "予算の80%以上を使用しています。残りの支出に注意してください。"
    riskLevel = "medium"
  } else if (projectedTotal > category.budget) {
    recommendation = "現在のペースでは予算を超過する可能性があります。"
    riskLevel = "medium"
  } else if (efficiency < 50 && daysPassed > daysInMonth * 0.5) {
    recommendation = "予算に余裕があります。他のカテゴリに再配分を検討してください。"
    riskLevel = "low"
  } else {
    recommendation = "順調に予算内で管理できています。"
    riskLevel = "low"
  }

  return {
    categoryId: category.id,
    name: category.name,
    icon: category.icon,
    budget: category.budget,
    spent: category.spent,
    remaining,
    efficiency,
    dailyAverage,
    projectedTotal,
    isOnTrack,
    recommendation,
    riskLevel,
  }
}

export function calculateSpendingPattern(expenses: Expense[]): SpendingPattern {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  // Filter expenses for current month
  const monthlyExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date)
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
  })

  // Calculate averages
  const totalAmount = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0)
  const uniqueDays = new Set(monthlyExpenses.map((exp) => exp.date)).size
  const averageDaily = uniqueDays > 0 ? totalAmount / uniqueDays : 0
  const averageWeekly = averageDaily * 7

  // Find peak spending day
  const dailyTotals = monthlyExpenses.reduce(
    (acc, expense) => {
      const date = expense.date
      acc[date] = (acc[date] || 0) + expense.amount
      return acc
    },
    {} as Record<string, number>,
  )

  const peakSpendingDay = Object.entries(dailyTotals).reduce(
    (max, [date, amount]) => (amount > max.amount ? { date, amount } : max),
    { date: "", amount: 0 },
  ).date

  // Find most expensive category
  const categoryTotals = monthlyExpenses.reduce(
    (acc, expense) => {
      acc[expense.categoryId] = (acc[expense.categoryId] || 0) + expense.amount
      return acc
    },
    {} as Record<string, number>,
  )

  const mostExpensiveCategory = Object.entries(categoryTotals).reduce(
    (max, [categoryId, amount]) => (amount > max.amount ? { categoryId, amount } : max),
    { categoryId: "", amount: 0 },
  ).categoryId

  // Calculate spending trend (simple linear regression)
  const sortedExpenses = monthlyExpenses.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  let spendingTrend: "increasing" | "decreasing" | "stable" = "stable"

  if (sortedExpenses.length >= 3) {
    const firstHalf = sortedExpenses.slice(0, Math.floor(sortedExpenses.length / 2))
    const secondHalf = sortedExpenses.slice(Math.floor(sortedExpenses.length / 2))

    const firstHalfAvg = firstHalf.reduce((sum, exp) => sum + exp.amount, 0) / firstHalf.length
    const secondHalfAvg = secondHalf.reduce((sum, exp) => sum + exp.amount, 0) / secondHalf.length

    const difference = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100

    if (difference > 10) spendingTrend = "increasing"
    else if (difference < -10) spendingTrend = "decreasing"
  }

  // Calculate seasonality (variance in daily spending)
  const dailyAmounts = Object.values(dailyTotals)
  const mean = dailyAmounts.reduce((sum, amount) => sum + amount, 0) / dailyAmounts.length
  const variance = dailyAmounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / dailyAmounts.length
  const seasonality = (Math.sqrt(variance) / mean) * 100 || 0

  return {
    averageDaily,
    averageWeekly,
    peakSpendingDay,
    mostExpensiveCategory,
    spendingTrend,
    seasonality,
  }
}

export function generateBudgetRecommendations(categories: Category[], expenses: Expense[]): BudgetRecommendation[] {
  const recommendations: BudgetRecommendation[] = []

  categories.forEach((category) => {
    const analysis = calculateCategoryAnalysis(category, expenses)

    // Recommend budget increase for overspent categories
    if (analysis.efficiency > 100) {
      recommendations.push({
        type: "increase",
        categoryId: category.id,
        currentAmount: category.budget,
        suggestedAmount: Math.ceil(analysis.projectedTotal * 1.1),
        reason: "予算を超過しているため、予算の増額をお勧めします。",
        impact: analysis.projectedTotal - category.budget,
      })
    }

    // Recommend budget decrease for underutilized categories
    else if (analysis.efficiency < 50 && analysis.projectedTotal < category.budget * 0.7) {
      recommendations.push({
        type: "decrease",
        categoryId: category.id,
        currentAmount: category.budget,
        suggestedAmount: Math.ceil(analysis.projectedTotal * 1.2),
        reason: "予算に余裕があるため、他のカテゴリへの再配分を検討してください。",
        impact: category.budget - Math.ceil(analysis.projectedTotal * 1.2),
      })
    }

    // Recommend optimization for categories with high variance
    else if (analysis.riskLevel === "medium") {
      recommendations.push({
        type: "optimize",
        categoryId: category.id,
        currentAmount: category.budget,
        suggestedAmount: Math.ceil(analysis.projectedTotal * 1.05),
        reason: "支出パターンを最適化することで、より効率的な予算管理が可能です。",
        impact: Math.abs(category.budget - Math.ceil(analysis.projectedTotal * 1.05)),
      })
    }
  })

  return recommendations
}

// Utility functions for date calculations
export function getDaysInCurrentMonth(): number {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
}

export function getDaysRemainingInMonth(): number {
  const now = new Date()
  const daysInMonth = getDaysInCurrentMonth()
  return daysInMonth - now.getDate() + 1
}

export function getDaysPassedInMonth(): number {
  return new Date().getDate()
}

export function getRemainingDaysByType(type: DayCalculationType): number {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const today = now.getDate()

  let remainingDays = 0

  for (let day = today; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day)
    const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    switch (type) {
      case "weekdays":
        if (dayOfWeek >= 1 && dayOfWeek <= 5) remainingDays++
        break
      case "weekends":
        if (dayOfWeek === 0 || dayOfWeek === 6) remainingDays++
        break
      case "all":
        remainingDays++
        break
    }
  }

  return remainingDays
}

export function getDayTypeLabel(type: DayCalculationType): string {
  switch (type) {
    case "weekdays":
      return "平日のみ"
    case "weekends":
      return "休日のみ"
    case "all":
      return "全日"
  }
}

// Formatting utilities
export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString()}`
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export type DayCalculationType = "weekdays" | "weekends" | "all"
