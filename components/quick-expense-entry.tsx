"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"

interface Category {
  id: string
  name: string
  budget: number
  spent: number
  icon: string
}

interface QuickExpenseEntryProps {
  categories: Category[]
  onAddExpense: (categoryId: string, amount: number, description: string) => void
}

const quickExpenseOptions = [
  { amount: 500, description: "コンビニ" },
  { amount: 800, description: "ランチ" },
  { amount: 450, description: "コーヒー" },
  { amount: 1000, description: "交通費" },
  { amount: 1500, description: "ディナー" },
  { amount: 3000, description: "飲み会" },
]

export function QuickExpenseEntry({ categories, onAddExpense }: QuickExpenseEntryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")

  const handleQuickAdd = (quickAmount: number, quickDescription: string) => {
    if (selectedCategory) {
      onAddExpense(selectedCategory, quickAmount, quickDescription)
    }
  }

  const handleCustomAdd = () => {
    if (selectedCategory && amount && description) {
      onAddExpense(selectedCategory, Number.parseInt(amount) || 0, description)
      setAmount("")
      setDescription("")
    }
  }

  return (
    <Card className="touch-manipulation">
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg">クイック出費入力</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="h-12 text-base touch-manipulation">
              <SelectValue placeholder="カテゴリを選択" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id} className="h-12">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{category.icon}</span>
                    <span className="text-base">{category.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCategory && (
          <>
            <div>
              <p className="text-sm text-muted-foreground mb-3">よく使う出費</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {quickExpenseOptions.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start gap-2 h-16 p-3 bg-transparent touch-manipulation"
                    onClick={() => handleQuickAdd(option.amount, option.description)}
                  >
                    <div className="text-left">
                      <div className="font-medium text-sm">¥{option.amount}</div>
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-3">カスタム入力</p>
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <Input
                    type="number"
                    placeholder="金額"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="flex-1 h-12 text-base touch-manipulation"
                  />
                  <Input
                    placeholder="説明"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="flex-1 h-12 text-base touch-manipulation"
                  />
                </div>
                <Button
                  onClick={handleCustomAdd}
                  disabled={!amount || !description}
                  className="w-full h-12 gap-2 text-base touch-manipulation"
                >
                  <Plus className="h-5 w-5" />
                  追加
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
