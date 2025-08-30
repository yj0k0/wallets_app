"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, History, Target, ArrowLeft, Wifi, WifiOff } from "lucide-react"
// import { syncProjectData, type ProjectData } from "@/lib/sync"
// import { useAuth } from "@/components/auth-provider"

import { BudgetCategory } from "@/components/budget-category"
import { AddCategoryDialog } from "@/components/add-category-dialog"
import { ExpenseHistoryDialog } from "@/components/expense-history-dialog"
import { QuickExpenseEntry } from "@/components/quick-expense-entry"
import { BudgetInsights } from "@/components/budget-insights"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { calculateBudgetAnalysis, getRemainingDaysByType, type DayCalculationType } from "@/lib/calculations"
import { MonthSelector } from "@/components/month-selector"

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
  dayCalculationType: DayCalculationType
}

interface MonthlyData {
  categories: Category[]
  expenses: Expense[]
}

const getMonthKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

interface ExpenseManagerProps {
  projectId: string
  onBackToProjects?: () => void
}

export default function ExpenseManager({ projectId, onBackToProjects }: ExpenseManagerProps) {
  const router = useRouter()
  // const { user } = useAuth()
  const [currentMonth, setCurrentMonth] = useState<string>(getMonthKey(new Date()))
  const [monthlyData, setMonthlyData] = useState<Record<string, MonthlyData>>({})
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // オンライン状態をチェック
    const checkOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }
    
    window.addEventListener('online', checkOnlineStatus)
    window.addEventListener('offline', checkOnlineStatus)
    checkOnlineStatus()

    // ローカルストレージからデータを読み込み
    const loadProjectData = () => {
      try {
        console.log('Loading project data from localStorage for debugging')
        const savedData = localStorage.getItem(`expense-project-${projectId}`)
        if (savedData) {
          const projectData = JSON.parse(savedData)
          console.log('Loaded project data:', projectData)
          setMonthlyData(projectData)
        } else {
          console.log('No project data found, creating default')
          const defaultData = {
            [currentMonth]: {
              categories: [],
              expenses: [],
            },
          }
          setMonthlyData(defaultData)
        }
      } catch (error) {
        console.error('Error loading project data:', error)
        const defaultData = {
          [currentMonth]: {
            categories: [],
            expenses: [],
          },
        }
        setMonthlyData(defaultData)
      } finally {
        setIsLoading(false)
      }
    }

    loadProjectData()

    // リアルタイム同期を無効化
    const unsubscribe = () => {
      console.log('Project data subscription disabled for debugging')
    }

    return () => {
      window.removeEventListener('online', checkOnlineStatus)
      window.removeEventListener('offline', checkOnlineStatus)
      unsubscribe()
    }
  }, [projectId, currentMonth])

  useEffect(() => {
    if (Object.keys(monthlyData).length > 0) {
      // ローカルバックアップのみ
      localStorage.setItem(`expense-project-${projectId}`, JSON.stringify(monthlyData))
      console.log('Saved project data to localStorage:', monthlyData)
    }
  }, [monthlyData, projectId])

  const getCurrentMonthData = (): MonthlyData => {
    return monthlyData[currentMonth] || { categories: [], expenses: [] }
  }

  const { categories, expenses } = getCurrentMonthData()

  const updateMonthlyData = (monthKey: string, updates: Partial<MonthlyData>) => {
    setMonthlyData((prev) => ({
      ...prev,
      [monthKey]: {
        ...prev[monthKey],
        ...updates,
      },
    }))
  }

  const handleMonthChange = (monthKey: string) => {
    // Initialize month with empty data if it doesn't exist
    if (!monthlyData[monthKey]) {
      setMonthlyData((prev) => ({
        ...prev,
        [monthKey]: { categories: [], expenses: [] },
      }))
    }
    setCurrentMonth(monthKey)
  }

  const availableMonths = Object.keys(monthlyData).sort()

  const addCategory = (name: string, budget: number, icon: string, dayCalculationType: DayCalculationType = "all") => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      budget,
      spent: 0,
      icon,
      dayCalculationType,
    }

    updateMonthlyData(currentMonth, {
      categories: [...categories, newCategory],
    })
  }

  const addExpense = (categoryId: string, amount: number, description: string, date?: string) => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      categoryId,
      amount,
      description,
      date: date || new Date().toISOString().split("T")[0],
    }

    const updatedExpenses = [...expenses, newExpense]
    const updatedCategories = categories.map((cat) =>
      cat.id === categoryId ? { ...cat, spent: cat.spent + amount } : cat,
    )

    updateMonthlyData(currentMonth, {
      expenses: updatedExpenses,
      categories: updatedCategories,
    })
  }

  const updateExpense = (expenseId: string, updates: Partial<Expense>) => {
    const oldExpense = expenses.find((e) => e.id === expenseId)
    if (!oldExpense) return

    const updatedExpenses = expenses.map((e) => (e.id === expenseId ? { ...e, ...updates } : e))

    // Update category spent amounts if amount changed
    let updatedCategories = categories
    if (updates.amount !== undefined) {
      const amountDiff = updates.amount - oldExpense.amount
      updatedCategories = categories.map((cat) =>
        cat.id === oldExpense.categoryId ? { ...cat, spent: cat.spent + amountDiff } : cat,
      )
    }

    updateMonthlyData(currentMonth, {
      expenses: updatedExpenses,
      categories: updatedCategories,
    })
  }

  const deleteExpense = (expenseId: string) => {
    const expense = expenses.find((e) => e.id === expenseId)
    if (!expense) return

    const updatedExpenses = expenses.filter((e) => e.id !== expenseId)
    const updatedCategories = categories.map((cat) =>
      cat.id === expense.categoryId ? { ...cat, spent: cat.spent - expense.amount } : cat,
    )

    updateMonthlyData(currentMonth, {
      expenses: updatedExpenses,
      categories: updatedCategories,
    })
  }

  const updateCategory = (id: string, updates: Partial<Category>) => {
    const updatedCategories = categories.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat))

    updateMonthlyData(currentMonth, {
      categories: updatedCategories,
    })
  }

  const deleteCategory = (id: string) => {
    // Delete all expenses for this category and remove category
    const updatedExpenses = expenses.filter((e) => e.categoryId !== id)
    const updatedCategories = categories.filter((cat) => cat.id !== id)

    updateMonthlyData(currentMonth, {
      expenses: updatedExpenses,
      categories: updatedCategories,
    })
  }

  const budgetAnalysis = calculateBudgetAnalysis(categories, expenses)

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onBackToProjects || (() => router.push("/"))}
              className="gap-2 px-3 py-2 h-12 text-sm touch-manipulation"
            >
              <ArrowLeft className="h-4 w-4" />
              プロジェクト一覧
            </Button>
            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">ID: {projectId.slice(-6)}</div>
              {isOnline ? (
                <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded flex items-center gap-1">
                  <Wifi className="h-3 w-3" />
                  同期中
                </div>
              ) : (
                <div className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded flex items-center gap-1">
                  <WifiOff className="h-3 w-3" />
                  オフライン
                </div>
              )}
            </div>
          </div>

          <div className="text-center space-y-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">月間出費管理</h1>
            <MonthSelector
              currentMonth={currentMonth}
              availableMonths={availableMonths}
              onMonthChange={handleMonthChange}
            />
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12 mb-6">
            <TabsTrigger value="dashboard" className="text-sm font-medium h-10">
              ダッシュボード
            </TabsTrigger>
            <TabsTrigger value="insights" className="text-sm font-medium h-10">
              インサイト
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card className="touch-manipulation">
                <CardHeader className="pb-2 px-3 pt-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">総予算</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3">
                  <div className="text-lg sm:text-2xl font-bold text-foreground">
                    ¥{budgetAnalysis.totalBudget.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card className="touch-manipulation">
                <CardHeader className="pb-2 px-3 pt-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">使用済み</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3">
                  <div className="text-lg sm:text-2xl font-bold text-destructive">
                    ¥{budgetAnalysis.totalSpent.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">消費率: {budgetAnalysis.burnRate.toFixed(1)}%</p>
                </CardContent>
              </Card>

              <Card className="touch-manipulation">
                <CardHeader className="pb-2 px-3 pt-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">残り予算</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3">
                  <div className="text-lg sm:text-2xl font-bold text-primary">
                    ¥{budgetAnalysis.totalRemaining.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">節約率: {budgetAnalysis.savingsRate.toFixed(1)}%</p>
                </CardContent>
              </Card>

              <Card className="touch-manipulation">
                <CardHeader className="pb-2 px-3 pt-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">1日平均予算</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3">
                  <div className="text-lg sm:text-2xl font-bold text-accent">
                    ¥{Math.round(budgetAnalysis.dailyAverage).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">残り{budgetAnalysis.daysRemaining}日</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-medium text-muted-foreground">カテゴリ別1日平均予算</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {categories.map((category) => {
                  const remaining = category.budget - category.spent
                  const categoryDaysRemaining = getRemainingDaysByType(category.dayCalculationType)
                  const dailyAverage =
                    remaining > 0 && categoryDaysRemaining > 0 ? Math.round(remaining / categoryDaysRemaining) : 0
                  return (
                    <Card key={category.id} className="bg-muted/30 touch-manipulation">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{category.icon}</span>
                          <span className="text-sm font-medium text-muted-foreground truncate">{category.name}</span>
                        </div>
                        <div className="text-base font-bold text-blue-600 mb-1">
                          ¥{dailyAverage.toLocaleString()}/日
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">残り¥{remaining.toLocaleString()}</p>
                        <p className="text-xs text-blue-500">
                          {category.dayCalculationType === "weekdays" && "平日"}
                          {category.dayCalculationType === "weekends" && "休日"}
                          {category.dayCalculationType === "all" && "全日"}
                          残り{categoryDaysRemaining}日
                        </p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            <QuickExpenseEntry categories={categories} onAddExpense={addExpense} />

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground">予算カテゴリ</h2>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsHistoryOpen(true)}
                    className="gap-2 flex-1 sm:flex-none h-12 text-sm touch-manipulation"
                  >
                    <History className="h-4 w-4" />
                    履歴
                  </Button>
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="gap-2 flex-1 sm:flex-none h-12 text-sm touch-manipulation"
                  >
                    <Plus className="h-4 w-4" />
                    カテゴリ追加
                  </Button>
                </div>
              </div>

              {categories.length === 0 ? (
                <Card className="touch-manipulation">
                  <CardContent className="py-16">
                    <div className="text-center space-y-4">
                      <Target className="h-16 w-16 text-muted-foreground mx-auto" />
                      <h3 className="text-xl font-medium">カテゴリがありません</h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                        「カテゴリ追加」ボタンから最初の予算カテゴリを作成してください。
                      </p>
                      <Button
                        onClick={() => setIsAddDialogOpen(true)}
                        className="gap-2 h-12 px-6 text-base touch-manipulation"
                      >
                        <Plus className="h-5 w-5" />
                        最初のカテゴリを追加
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <BudgetCategory
                      key={category.id}
                      category={category}
                      expenses={expenses.filter((e) => e.categoryId === category.id)}
                      onUpdate={(updates) => updateCategory(category.id, updates)}
                      onDelete={() => deleteCategory(category.id)}
                      onAddExpense={(amount, description, date) => addExpense(category.id, amount, description, date)}
                      onUpdateExpense={updateExpense}
                      onDeleteExpense={deleteExpense}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4 sm:space-y-6">
            <BudgetInsights
              expenses={expenses}
              categories={categories}
              monthlyData={monthlyData}
              currentMonth={currentMonth}
            />
          </TabsContent>
        </Tabs>

        <AddCategoryDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onAdd={addCategory} />

        <ExpenseHistoryDialog
          open={isHistoryOpen}
          onOpenChange={setIsHistoryOpen}
          monthlyData={monthlyData}
          currentMonth={currentMonth}
          onUpdateExpense={updateExpense}
          onDeleteExpense={deleteExpense}
        />
      </div>
    </div>
  )
}
