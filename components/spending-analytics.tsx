"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"

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

interface SpendingAnalyticsProps {
  expenses: Expense[]
  categories: Category[]
}

export function SpendingAnalytics({ expenses, categories }: SpendingAnalyticsProps) {
  // Prepare data for pie chart (spending by category)
  const categorySpendingData = categories
    .map((category) => ({
      name: category.name,
      value: category.spent,
      icon: category.icon,
      budget: category.budget,
      remaining: category.budget - category.spent,
    }))
    .filter((item) => item.value > 0)

  // Prepare data for daily spending trend
  const dailySpendingData = expenses
    .reduce(
      (acc, expense) => {
        const date = expense.date
        const existing = acc.find((item) => item.date === date)
        if (existing) {
          existing.amount += expense.amount
        } else {
          acc.push({ date, amount: expense.amount })
        }
        return acc
      },
      [] as { date: string; amount: number }[],
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((item) => ({
      ...item,
      formattedDate: new Date(item.date).toLocaleDateString("ja-JP", { month: "short", day: "numeric" }),
    }))

  // Prepare data for budget vs actual comparison
  const budgetComparisonData = categories.map((category) => ({
    name: category.name,
    budget: category.budget,
    spent: category.spent,
    remaining: Math.max(0, category.budget - category.spent),
    icon: category.icon,
  }))

  // Calculate weekly spending
  const weeklySpendingData = expenses
    .reduce(
      (acc, expense) => {
        const date = new Date(expense.date)
        const weekStart = new Date(date.setDate(date.getDate() - date.getDay()))
        const weekKey = weekStart.toISOString().split("T")[0]

        const existing = acc.find((item) => item.week === weekKey)
        if (existing) {
          existing.amount += expense.amount
        } else {
          acc.push({
            week: weekKey,
            amount: expense.amount,
            formattedWeek: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
          })
        }
        return acc
      },
      [] as { week: string; amount: number; formattedWeek: string }[],
    )
    .sort((a, b) => new Date(a.week).getTime() - new Date(b.week).getTime())

  const COLORS = ["#059669", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#c6f6d5"]

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          {payload.map((entry: { name: string; value: number; color: string }, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ¥{entry.value?.toLocaleString()}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const PieTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { icon: string; name: string; value: number; budget: number; remaining: number } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium flex items-center gap-2">
            <span>{data.icon}</span>
            {data.name}
          </p>
          <p className="text-sm text-primary">支出: ¥{data.value.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">予算: ¥{data.budget.toLocaleString()}</p>
          <p className="text-sm text-accent">残り: ¥{data.remaining.toLocaleString()}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            概要
          </TabsTrigger>
          <TabsTrigger value="categories" className="text-xs sm:text-sm">
            カテゴリ別
          </TabsTrigger>
          <TabsTrigger value="trends" className="text-xs sm:text-sm">
            トレンド
          </TabsTrigger>
          <TabsTrigger value="comparison" className="text-xs sm:text-sm">
            比較
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">支出分布</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                  <PieChart>
                    <Pie
                      data={categorySpendingData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      labelLine={false}
                      fontSize={10}
                    >
                      {categorySpendingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">日別支出推移</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                  <LineChart data={dailySpendingData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="formattedDate"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                      tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`}
                      width={40}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">カテゴリ別予算 vs 実績</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350} className="sm:h-[400px]">
                <BarChart data={budgetComparisonData} margin={{ top: 20, right: 10, left: 10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`}
                    width={40}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="budget" fill="hsl(var(--muted))" name="予算" />
                  <Bar dataKey="spent" fill="hsl(var(--primary))" name="支出" />
                  <Bar dataKey="remaining" fill="hsl(var(--accent))" name="残り" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">週別支出推移</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                  <BarChart data={weeklySpendingData} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="formattedWeek" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                      tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`}
                      width={40}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="amount" fill="hsl(var(--chart-1))" name="支出" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">支出パターン分析</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                    <span className="text-xs sm:text-sm text-muted-foreground">最も支出の多いカテゴリ</span>
                    <div className="flex items-center gap-2">
                      <span>
                        {categories.reduce((max, cat) => (cat.spent > max.spent ? cat : max), categories[0])?.icon}
                      </span>
                      <span className="text-sm font-medium">
                        {categories.reduce((max, cat) => (cat.spent > max.spent ? cat : max), categories[0])?.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                    <span className="text-xs sm:text-sm text-muted-foreground">平均日次支出</span>
                    <span className="text-sm font-medium">
                      ¥
                      {Math.round(
                        expenses.reduce((sum, exp) => sum + exp.amount, 0) / Math.max(dailySpendingData.length, 1),
                      ).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                    <span className="text-xs sm:text-sm text-muted-foreground">最高日次支出</span>
                    <span className="text-sm font-medium">
                      ¥{Math.max(...dailySpendingData.map((d) => d.amount), 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                    <span className="text-xs sm:text-sm text-muted-foreground">予算達成率</span>
                    <span className="text-sm font-medium">
                      {categories.filter((cat) => cat.spent <= cat.budget).length}/{categories.length} カテゴリ
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">予算効率分析</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map((category) => {
                  const efficiency = category.budget > 0 ? (category.spent / category.budget) * 100 : 0
                  const isOverBudget = efficiency > 100

                  return (
                    <div key={category.id} className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{category.icon}</span>
                          <span className="font-medium text-sm sm:text-base">{category.name}</span>
                        </div>
                        <div className="text-left sm:text-right">
                          <div
                            className={`font-medium text-sm sm:text-base ${isOverBudget ? "text-destructive" : "text-foreground"}`}
                          >
                            {efficiency.toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ¥{category.spent.toLocaleString()} / ¥{category.budget.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isOverBudget ? "bg-destructive" : "bg-primary"
                          }`}
                          style={{ width: `${Math.min(efficiency, 100)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
