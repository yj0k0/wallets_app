"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target } from "lucide-react"
import {
  calculateBudgetAnalysis,
  calculateCategoryAnalysis,
  calculateSpendingPattern,
  generateBudgetRecommendations,
  formatCurrency,
  formatPercentage,
  formatDate,
} from "@/lib/calculations"
import { MonthlyComparison } from "./monthly-comparison"

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

interface BudgetInsightsProps {
  expenses: Expense[]
  categories: Category[]
  monthlyData?: Record<string, MonthlyData>
  currentMonth?: string
}

export function BudgetInsights({ expenses, categories, monthlyData, currentMonth }: BudgetInsightsProps) {
  const budgetAnalysis = calculateBudgetAnalysis(categories, expenses)
  const spendingPattern = calculateSpendingPattern(expenses)
  const recommendations = generateBudgetRecommendations(categories, expenses)

  const categoryAnalyses = categories.map((category) => calculateCategoryAnalysis(category, expenses))

  const getRiskIcon = (riskLevel: "low" | "medium" | "high") => {
    switch (riskLevel) {
      case "low":
        return <CheckCircle className="h-4 w-4 text-primary" />
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "high":
        return <AlertTriangle className="h-4 w-4 text-destructive" />
    }
  }

  const getTrendIcon = (trend: "increasing" | "decreasing" | "stable") => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="h-4 w-4 text-destructive" />
      case "decreasing":
        return <TrendingDown className="h-4 w-4 text-primary" />
      case "stable":
        return <Target className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-6">
      {monthlyData && currentMonth && Object.keys(monthlyData).length > 1 ? (
        <Tabs defaultValue="insights" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="insights" className="text-xs sm:text-sm">
              今月の分析
            </TabsTrigger>
            <TabsTrigger value="comparison" className="text-xs sm:text-sm">
              月間比較
            </TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-6">
            {/* Budget Health Overview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5" />
                  予算健全性分析
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">予算効率</span>
                      <span className="font-medium">{formatPercentage(budgetAnalysis.budgetEfficiency)}</span>
                    </div>
                    <Progress value={Math.min(budgetAnalysis.budgetEfficiency, 100)} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">消費率</span>
                      <span className="font-medium">{formatPercentage(budgetAnalysis.burnRate)}</span>
                    </div>
                    <Progress value={Math.min(budgetAnalysis.burnRate, 100)} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">節約率</span>
                      <span className="font-medium">{formatPercentage(budgetAnalysis.savingsRate)}</span>
                    </div>
                    <Progress value={Math.min(budgetAnalysis.savingsRate, 100)} className="h-2" />
                  </div>
                </div>

                {budgetAnalysis.projectedEndDate && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-xs sm:text-sm">
                      現在のペースでは、{formatDate(budgetAnalysis.projectedEndDate)}頃に予算が尽きる可能性があります。
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Spending Pattern Analysis */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  {getTrendIcon(spendingPattern.spendingTrend)}
                  支出パターン分析
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-bold text-primary">
                      {formatCurrency(Math.round(spendingPattern.averageDaily))}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">日平均支出</div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-bold text-accent">
                      {formatCurrency(Math.round(spendingPattern.averageWeekly))}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">週平均支出</div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm sm:text-lg font-bold text-foreground">
                      {spendingPattern.peakSpendingDay ? formatDate(spendingPattern.peakSpendingDay) : "N/A"}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">最高支出日</div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {getTrendIcon(spendingPattern.spendingTrend)}
                      <span className="text-sm font-medium capitalize">
                        {spendingPattern.spendingTrend === "increasing"
                          ? "増加傾向"
                          : spendingPattern.spendingTrend === "decreasing"
                            ? "減少傾向"
                            : "安定"}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">支出トレンド</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Risk Assessment */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">カテゴリ別リスク評価</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryAnalyses.map((analysis) => (
                    <div
                      key={analysis.categoryId}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg"
                    >
                      <div className="flex items-start sm:items-center gap-3 flex-1">
                        <span className="text-lg sm:text-xl">{analysis.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm sm:text-base">{analysis.name}</div>
                          <div className="text-xs sm:text-sm text-muted-foreground break-words">
                            {analysis.recommendation}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-2 sm:flex-shrink-0">
                        <Badge
                          variant={
                            analysis.riskLevel === "high"
                              ? "destructive"
                              : analysis.riskLevel === "medium"
                                ? "secondary"
                                : "default"
                          }
                          className="text-xs"
                        >
                          {analysis.riskLevel === "high"
                            ? "高リスク"
                            : analysis.riskLevel === "medium"
                              ? "中リスク"
                              : "低リスク"}
                        </Badge>
                        {getRiskIcon(analysis.riskLevel)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Budget Recommendations */}
            {recommendations.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">予算最適化の提案</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recommendations.map((rec, index) => {
                      const category = categories.find((c) => c.id === rec.categoryId)
                      return (
                        <div key={index} className="p-3 border rounded-lg space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{category?.icon}</span>
                              <span className="font-medium text-sm sm:text-base">{category?.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {rec.type === "increase" ? "増額" : rec.type === "decrease" ? "減額" : "最適化"}
                              </Badge>
                            </div>
                            <div className="text-xs sm:text-sm text-muted-foreground">
                              影響: {formatCurrency(rec.impact)}
                            </div>
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground">{rec.reason}</div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                            <span>現在: {formatCurrency(rec.currentAmount)}</span>
                            <span className="hidden sm:inline">→</span>
                            <span className="font-medium">提案: {formatCurrency(rec.suggestedAmount)}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <MonthlyComparison monthlyData={monthlyData} currentMonth={currentMonth} />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-6">
          {/* Budget Health Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Target className="h-4 w-4 sm:h-5 sm:w-5" />
                予算健全性分析
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">予算効率</span>
                    <span className="font-medium">{formatPercentage(budgetAnalysis.budgetEfficiency)}</span>
                  </div>
                  <Progress value={Math.min(budgetAnalysis.budgetEfficiency, 100)} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">消費率</span>
                    <span className="font-medium">{formatPercentage(budgetAnalysis.burnRate)}</span>
                  </div>
                  <Progress value={Math.min(budgetAnalysis.burnRate, 100)} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">節約率</span>
                    <span className="font-medium">{formatPercentage(budgetAnalysis.savingsRate)}</span>
                  </div>
                  <Progress value={Math.min(budgetAnalysis.savingsRate, 100)} className="h-2" />
                </div>
              </div>

              {budgetAnalysis.projectedEndDate && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs sm:text-sm">
                    現在のペースでは、{formatDate(budgetAnalysis.projectedEndDate)}頃に予算が尽きる可能性があります。
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Spending Pattern Analysis */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                {getTrendIcon(spendingPattern.spendingTrend)}
                支出パターン分析
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-primary">
                    {formatCurrency(Math.round(spendingPattern.averageDaily))}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">日平均支出</div>
                </div>

                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-accent">
                    {formatCurrency(Math.round(spendingPattern.averageWeekly))}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">週平均支出</div>
                </div>

                <div className="text-center">
                  <div className="text-sm sm:text-lg font-bold text-foreground">
                    {spendingPattern.peakSpendingDay ? formatDate(spendingPattern.peakSpendingDay) : "N/A"}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">最高支出日</div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    {getTrendIcon(spendingPattern.spendingTrend)}
                    <span className="text-sm font-medium capitalize">
                      {spendingPattern.spendingTrend === "increasing"
                        ? "増加傾向"
                        : spendingPattern.spendingTrend === "decreasing"
                          ? "減少傾向"
                          : "安定"}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">支出トレンド</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Risk Assessment */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">カテゴリ別リスク評価</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryAnalyses.map((analysis) => (
                  <div
                    key={analysis.categoryId}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg"
                  >
                    <div className="flex items-start sm:items-center gap-3 flex-1">
                      <span className="text-lg sm:text-xl">{analysis.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm sm:text-base">{analysis.name}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground break-words">
                          {analysis.recommendation}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:flex-shrink-0">
                      <Badge
                        variant={
                          analysis.riskLevel === "high"
                            ? "destructive"
                            : analysis.riskLevel === "medium"
                              ? "secondary"
                              : "default"
                        }
                        className="text-xs"
                      >
                        {analysis.riskLevel === "high"
                          ? "高リスク"
                          : analysis.riskLevel === "medium"
                            ? "中リスク"
                            : "低リスク"}
                      </Badge>
                      {getRiskIcon(analysis.riskLevel)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Budget Recommendations */}
          {recommendations.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">予算最適化の提案</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendations.map((rec, index) => {
                    const category = categories.find((c) => c.id === rec.categoryId)
                    return (
                      <div key={index} className="p-3 border rounded-lg space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{category?.icon}</span>
                            <span className="font-medium text-sm sm:text-base">{category?.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {rec.type === "increase" ? "増額" : rec.type === "decrease" ? "減額" : "最適化"}
                            </Badge>
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            影響: {formatCurrency(rec.impact)}
                          </div>
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground">{rec.reason}</div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                          <span>現在: {formatCurrency(rec.currentAmount)}</span>
                          <span className="hidden sm:inline">→</span>
                          <span className="font-medium">提案: {formatCurrency(rec.suggestedAmount)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
