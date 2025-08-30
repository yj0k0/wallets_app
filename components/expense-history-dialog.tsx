"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit3, Trash2, Save, X, TrendingUp, Calendar, BarChart3 } from "lucide-react"

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

interface ExpenseHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  monthlyData: Record<string, MonthlyData>
  currentMonth: string
  onUpdateExpense: (expenseId: string, updates: Partial<Expense>) => void
  onDeleteExpense: (expenseId: string) => void
}

const formatMonthDisplay = (monthKey: string): string => {
  const [year, month] = monthKey.split("-")
  return `${year}年${Number.parseInt(month)}月`
}

export function ExpenseHistoryDialog({
  open,
  onOpenChange,
  monthlyData,
  currentMonth,
  onUpdateExpense,
  onDeleteExpense,
}: ExpenseHistoryDialogProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editDate, setEditDate] = useState("")

  const getAllExpenses = (): (Expense & { monthKey: string })[] => {
    const allExpenses: (Expense & { monthKey: string })[] = []
    
    // monthlyDataが存在しない場合は空配列を返す
    if (!monthlyData || typeof monthlyData !== 'object') {
      console.warn('monthlyData is undefined or invalid:', monthlyData)
      return []
    }
    
    Object.entries(monthlyData).forEach(([monthKey, data]) => {
      // monthKeyが月の形式（YYYY-MM）でない場合はスキップ
      if (!/^\d{4}-\d{2}$/.test(monthKey)) {
        console.log('Skipping non-month key:', monthKey)
        return
      }
      
      // dataとdata.expensesが存在することを確認
      if (data && data.expenses && Array.isArray(data.expenses)) {
        data.expenses.forEach((expense) => {
          allExpenses.push({ ...expense, monthKey })
        })
      } else {
        console.warn('Invalid data structure for monthKey:', monthKey, data)
      }
    })
    return allExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const getMonthlySummaries = () => {
    // monthlyDataが存在しない場合は空配列を返す
    if (!monthlyData || typeof monthlyData !== 'object') {
      console.warn('monthlyData is undefined or invalid for summaries:', monthlyData)
      return []
    }
    
    return Object.entries(monthlyData)
      .filter(([monthKey]) => /^\d{4}-\d{2}$/.test(monthKey)) // 月の形式のキーのみフィルタリング
      .map(([monthKey, data]) => {
        // dataとそのプロパティが存在することを確認
        if (!data || !data.categories || !data.expenses) {
          console.warn('Invalid data structure for monthKey in summaries:', monthKey, data)
          return {
            monthKey,
            totalBudget: 0,
            totalSpent: 0,
            remaining: 0,
            expenseCount: 0,
            categoryCount: 0,
            utilizationRate: 0,
          }
        }
        
        const totalBudget = data.categories.reduce((sum, cat) => sum + cat.budget, 0)
        const totalSpent = data.expenses.reduce((sum, exp) => sum + exp.amount, 0)
        const expenseCount = data.expenses.length
        const categoryCount = data.categories.length

        return {
          monthKey,
          totalBudget,
          totalSpent,
          remaining: totalBudget - totalSpent,
          expenseCount,
          categoryCount,
          utilizationRate: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
        }
      })
      .sort((a, b) => b.monthKey.localeCompare(a.monthKey))
  }

  const getCurrentMonthData = () => {
    if (!monthlyData || !currentMonth) {
      return { categories: [], expenses: [] }
    }
    return monthlyData[currentMonth] || { categories: [], expenses: [] }
  }
  const { expenses: currentExpenses } = getCurrentMonthData()

  const getCategoryInfo = (categoryId: string, monthKey: string) => {
    if (!monthlyData || !monthKey) return null
    const monthData = monthlyData[monthKey]
    if (!monthData || !monthData.categories) return null
    return monthData.categories.find((c) => c.id === categoryId)
  }

  const startEdit = (expense: Expense) => {
    setEditingId(expense.id)
    setEditAmount(expense.amount.toString())
    setEditDescription(expense.description)
    setEditDate(expense.date)
  }

  const saveEdit = () => {
    if (editingId) {
      onUpdateExpense(editingId, {
        amount: Number.parseInt(editAmount) || 0,
        description: editDescription,
        date: editDate,
      })
      setEditingId(null)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditAmount("")
    setEditDescription("")
    setEditDate("")
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
      weekday: "short",
    })
  }

  const allExpenses = getAllExpenses()
  const monthlySummaries = getMonthlySummaries()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            出費履歴
          </DialogTitle>
          <DialogDescription>過去の出費履歴と月間サマリーを確認できます。</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="current" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="current" className="text-xs sm:text-sm">
              今月の履歴
            </TabsTrigger>
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              全履歴
            </TabsTrigger>
            <TabsTrigger value="summary" className="text-xs sm:text-sm">
              月間サマリー
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="flex-1 overflow-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{formatMonthDisplay(currentMonth)}の出費履歴</h3>
                <Badge variant="outline">{currentExpenses.length}件</Badge>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>日付</TableHead>
                    <TableHead>カテゴリ</TableHead>
                    <TableHead>説明</TableHead>
                    <TableHead className="text-right">金額</TableHead>
                    <TableHead className="w-20">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentExpenses
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((expense) => {
                      const category = getCategoryInfo(expense.categoryId, currentMonth)
                      const isEditing = editingId === expense.id

                      return (
                        <TableRow key={expense.id}>
                          <TableCell>
                            {isEditing ? (
                              <Input
                                type="date"
                                value={editDate}
                                onChange={(e) => setEditDate(e.target.value)}
                                className="w-32"
                              />
                            ) : (
                              formatDate(expense.date)
                            )}
                          </TableCell>
                          <TableCell>
                            {category && (
                              <Badge variant="outline" className="gap-1">
                                <span>{category.icon}</span>
                                <span>{category.name}</span>
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {isEditing ? (
                              <Input
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                className="min-w-32"
                              />
                            ) : (
                              expense.description
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {isEditing ? (
                              <Input
                                type="number"
                                value={editAmount}
                                onChange={(e) => setEditAmount(e.target.value)}
                                className="w-20 text-right"
                              />
                            ) : (
                              `¥${expense.amount.toLocaleString()}`
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {isEditing ? (
                                <>
                                  <Button size="sm" variant="ghost" onClick={saveEdit}>
                                    <Save className="h-3 w-3" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={cancelEdit}>
                                    <X className="h-3 w-3" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button size="sm" variant="ghost" onClick={() => startEdit(expense)}>
                                    <Edit3 className="h-3 w-3" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => onDeleteExpense(expense.id)}>
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                </TableBody>
              </Table>

              {currentExpenses.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">今月はまだ出費が記録されていません</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="all" className="flex-1 overflow-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">全期間の出費履歴</h3>
                <Badge variant="outline">{allExpenses.length}件</Badge>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>日付</TableHead>
                    <TableHead>月</TableHead>
                    <TableHead>カテゴリ</TableHead>
                    <TableHead>説明</TableHead>
                    <TableHead className="text-right">金額</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allExpenses.map((expense) => {
                    const category = getCategoryInfo(expense.categoryId, expense.monthKey)

                    return (
                      <TableRow key={`${expense.monthKey}-${expense.id}`}>
                        <TableCell>{formatDate(expense.date)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {formatMonthDisplay(expense.monthKey)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {category && (
                            <Badge variant="outline" className="gap-1">
                              <span>{category.icon}</span>
                              <span>{category.name}</span>
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell className="text-right font-medium">¥{expense.amount.toLocaleString()}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {allExpenses.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">まだ出費が記録されていません</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="summary" className="flex-1 overflow-auto">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5" />
                <h3 className="font-medium">月間サマリー</h3>
              </div>

              <div className="grid gap-4">
                {monthlySummaries.map((summary) => (
                  <Card key={summary.monthKey}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center justify-between">
                        {formatMonthDisplay(summary.monthKey)}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{summary.expenseCount}件</span>
                          <span>•</span>
                          <span>{summary.categoryCount}カテゴリ</span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">予算</p>
                          <p className="font-medium">¥{summary.totalBudget.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">使用済み</p>
                          <p className="font-medium text-destructive">¥{summary.totalSpent.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">残り</p>
                          <p className={`font-medium ${summary.remaining >= 0 ? "text-primary" : "text-destructive"}`}>
                            ¥{summary.remaining.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">使用率</p>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{summary.utilizationRate.toFixed(1)}%</p>
                            {summary.utilizationRate > 100 && <TrendingUp className="h-3 w-3 text-destructive" />}
                          </div>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              summary.utilizationRate > 100
                                ? "bg-destructive"
                                : summary.utilizationRate > 80
                                  ? "bg-yellow-500"
                                  : "bg-primary"
                            }`}
                            style={{ width: `${Math.min(summary.utilizationRate, 100)}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {monthlySummaries.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">まだデータがありません</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
