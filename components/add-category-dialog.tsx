"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { DayCalculationType } from "@/lib/calculations"

interface AddCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (name: string, budget: number, icon: string, dayCalculationType: DayCalculationType) => void
}

const commonCategories = [
  { name: "ランチ代", icon: "🍽️", dayCalculationType: "weekdays" as DayCalculationType },
  { name: "カフェ代", icon: "☕", dayCalculationType: "weekends" as DayCalculationType },
  { name: "飲み会代", icon: "🍻", dayCalculationType: "all" as DayCalculationType },
  { name: "服代", icon: "👕", dayCalculationType: "all" as DayCalculationType },
  { name: "交通費", icon: "🚃", dayCalculationType: "weekdays" as DayCalculationType },
  { name: "書籍代", icon: "📚", dayCalculationType: "all" as DayCalculationType },
  { name: "映画代", icon: "🎬", dayCalculationType: "weekends" as DayCalculationType },
  { name: "美容代", icon: "💄", dayCalculationType: "all" as DayCalculationType },
  { name: "ジム代", icon: "💪", dayCalculationType: "all" as DayCalculationType },
  { name: "趣味代", icon: "🎨", dayCalculationType: "weekends" as DayCalculationType },
]

export function AddCategoryDialog({ open, onOpenChange, onAdd }: AddCategoryDialogProps) {
  const [name, setName] = useState("")
  const [budget, setBudget] = useState("")
  const [icon, setIcon] = useState("📝")
  const [dayCalculationType, setDayCalculationType] = useState<DayCalculationType>("all")

  const handleAdd = () => {
    if (name.trim() && budget) {
      onAdd(name.trim(), Number.parseInt(budget) || 0, icon, dayCalculationType)
      setName("")
      setBudget("")
      setIcon("📝")
      setDayCalculationType("all")
      onOpenChange(false)
    }
  }

  const selectCommonCategory = (category: { name: string; icon: string; dayCalculationType: DayCalculationType }) => {
    setName(category.name)
    setIcon(category.icon)
    setDayCalculationType(category.dayCalculationType)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>新しいカテゴリを追加</DialogTitle>
          <DialogDescription>予算カテゴリの詳細を入力してください。</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">よく使われるカテゴリ</Label>
            <div className="grid grid-cols-2 gap-2">
              {commonCategories.map((category) => (
                <Button
                  key={category.name}
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2 h-auto py-2 bg-transparent"
                  onClick={() => selectCommonCategory(category)}
                >
                  <span>{category.icon}</span>
                  <span className="text-xs">{category.name}</span>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="category-name">カテゴリ名</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: ランチ代"
            />
          </div>

          <div>
            <Label htmlFor="category-budget">月間予算</Label>
            <Input
              id="category-budget"
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="例: 30000"
            />
          </div>

          <div>
            <Label htmlFor="category-icon">アイコン</Label>
            <Input
              id="category-icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="絵文字を入力"
            />
          </div>

          <div>
            <Label htmlFor="day-calculation-type">日数計算方法</Label>
            <Select
              value={dayCalculationType}
              onValueChange={(value: DayCalculationType) => setDayCalculationType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="日数計算方法を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekdays">平日のみ</SelectItem>
                <SelectItem value="weekends">休日のみ</SelectItem>
                <SelectItem value="all">全日</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              1日平均予算の計算に使用する日数の種類を選択してください
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleAdd} disabled={!name.trim() || !budget}>
            追加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
