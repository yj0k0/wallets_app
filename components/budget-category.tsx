"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Edit3, Trash2, Plus, History } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getRemainingDaysByType, getDayTypeLabel, type DayCalculationType } from "@/lib/calculations"

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

interface BudgetCategoryProps {
  category: Category
  expenses: Expense[]
  onUpdate: (updates: Partial<Category>) => void
  onDelete: () => void
  onAddExpense: (amount: number, description: string, date?: string) => void
  onUpdateExpense: (expenseId: string, updates: Partial<Expense>) => void
  onDeleteExpense: (expenseId: string) => void
  isReadOnly?: boolean
}

export function BudgetCategory({
  category,
  expenses,
  onUpdate,
  onDelete,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  isReadOnly = false,
}: BudgetCategoryProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isExpenseOpen, setIsExpenseOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [editName, setEditName] = useState(category.name)
  const [editBudget, setEditBudget] = useState(category.budget.toString())
  const [editIcon, setEditIcon] = useState(category.icon)
  const [editDayCalculationType, setEditDayCalculationType] = useState<DayCalculationType>(category.dayCalculationType)
  const [expenseAmount, setExpenseAmount] = useState("")
  const [expenseDescription, setExpenseDescription] = useState("")
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0])

  const remaining = category.budget - category.spent
  const progressPercentage = (category.spent / category.budget) * 100
  const isOverBudget = category.spent > category.budget

  const remainingDays = getRemainingDaysByType(category.dayCalculationType)
  const dailyAverageBudget = remaining > 0 && remainingDays > 0 ? remaining / remainingDays : 0

  const handleEditSave = () => {
    onUpdate({
      name: editName,
      budget: Number.parseInt(editBudget) || 0,
      icon: editIcon,
      dayCalculationType: editDayCalculationType, // Include day calculation type in updates
    })
    setIsEditOpen(false)
  }

  const handleAddExpense = () => {
    const amount = Number.parseInt(expenseAmount) || 0
    if (amount > 0 && expenseDescription.trim()) {
      onAddExpense(amount, expenseDescription.trim(), expenseDate)
      setExpenseAmount("")
      setExpenseDescription("")
      setExpenseDate(new Date().toISOString().split("T")[0])
      setIsExpenseOpen(false)
    }
  }

  const recentExpenses = expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3)

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{category.icon}</span>
            <CardTitle className="text-lg">{category.name}</CardTitle>
          </div>
          <div className="flex gap-1">
            {!isReadOnly && (
              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>カテゴリ編集</DialogTitle>
                  <DialogDescription>カテゴリの詳細を編集してください。</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-name">カテゴリ名</Label>
                    <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="edit-budget">予算額</Label>
                    <Input
                      id="edit-budget"
                      type="number"
                      value={editBudget}
                      onChange={(e) => setEditBudget(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-icon">アイコン</Label>
                    <Input
                      id="edit-icon"
                      value={editIcon}
                      onChange={(e) => setEditIcon(e.target.value)}
                      placeholder="絵文字を入力"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-day-calculation-type">日数計算方法</Label>
                    <Select
                      value={editDayCalculationType}
                      onValueChange={(value: DayCalculationType) => setEditDayCalculationType(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekdays">平日のみ</SelectItem>
                        <SelectItem value="weekends">休日のみ</SelectItem>
                        <SelectItem value="all">全日</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                    キャンセル
                  </Button>
                  <Button onClick={handleEditSave}>保存</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {!isReadOnly && (
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">使用済み</span>
            <span className={isOverBudget ? "text-destructive font-medium" : "text-foreground"}>
              ¥{category.spent.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">予算</span>
            <span className="text-foreground">¥{category.budget.toLocaleString()}</span>
          </div>
          <Progress value={Math.min(progressPercentage, 100)} className="h-2" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">残り</span>
            <span className={remaining >= 0 ? "text-primary font-medium" : "text-destructive font-medium"}>
              ¥{remaining.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">1日平均予算</span>
            <span className={dailyAverageBudget > 0 ? "text-blue-600 font-medium" : "text-muted-foreground"}>
              ¥{Math.round(dailyAverageBudget).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">計算方法</span>
            <span className="text-blue-500">
              {getDayTypeLabel(category.dayCalculationType)} (残り{remainingDays}日)
            </span>
          </div>
        </div>

        {recentExpenses.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">最近の出費</span>
              <Button variant="ghost" size="sm" onClick={() => setIsHistoryOpen(true)}>
                <History className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-1">
              {recentExpenses.map((expense) => (
                <div key={expense.id} className="flex justify-between text-xs">
                  <span className="text-muted-foreground truncate">{expense.description}</span>
                  <span className="font-medium">¥{expense.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isReadOnly && (
          <div className="flex gap-2">
            <Dialog open={isExpenseOpen} onOpenChange={setIsExpenseOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1 gap-2">
                  <Plus className="h-4 w-4" />
                  出費を記録
                </Button>
              </DialogTrigger>
              <DialogContent>
              <DialogHeader>
                <DialogTitle>{category.name}の出費記録</DialogTitle>
                <DialogDescription>出費の詳細を入力してください。</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="expense-amount">金額</Label>
                  <Input
                    id="expense-amount"
                    type="number"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="金額を入力"
                  />
                </div>
                <div>
                  <Label htmlFor="expense-description">説明</Label>
                  <Input
                    id="expense-description"
                    value={expenseDescription}
                    onChange={(e) => setExpenseDescription(e.target.value)}
                    placeholder="例: コンビニ弁当"
                  />
                </div>
                <div>
                  <Label htmlFor="expense-date">日付</Label>
                  <Input
                    id="expense-date"
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsExpenseOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleAddExpense} disabled={!expenseAmount || !expenseDescription.trim()}>
                  記録
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        )}

        {isOverBudget && (
          <Badge variant="destructive" className="w-full justify-center">
            予算超過: ¥{Math.abs(remaining).toLocaleString()}
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
