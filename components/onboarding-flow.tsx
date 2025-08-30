"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ChevronRight,
  ChevronLeft,
  Smartphone,
  Target,
  PieChart,
  Calendar,
  FolderOpen,
  TrendingUp,
  CheckCircle,
} from "lucide-react"

interface OnboardingFlowProps {
  onComplete: () => void
}

const onboardingSteps = [
  {
    id: 1,
    title: "出費管理アプリへようこそ",
    description: "スマホで簡単に月間出費を管理できるアプリです",
    icon: <Smartphone className="h-12 w-12 text-primary" />,
    content: [
      "📱 スマホ最適化されたタッチフレンドリーなUI",
      "💰 カテゴリ別の予算設定と出費記録",
      "📊 視覚的な分析とレポート機能",
      "📅 月ごとの履歴管理",
    ],
  },
  {
    id: 2,
    title: "プロジェクト管理",
    description: "複数のプロジェクトで出費を分けて管理できます",
    icon: <FolderOpen className="h-12 w-12 text-primary" />,
    content: [
      "🏠 家計管理、旅行費用など用途別に分類",
      "📝 プロジェクト名と説明を設定",
      "🔄 プロジェクト間の簡単な切り替え",
      "💾 各プロジェクトのデータは独立して保存",
    ],
  },
  {
    id: 3,
    title: "カテゴリ別予算設定",
    description: "ランチ代、カフェ代など項目ごとに予算を設定",
    icon: <Target className="h-12 w-12 text-primary" />,
    content: [
      "🍽️ ランチ代、カフェ代、飲み会代など自由に設定",
      "💵 各カテゴリの月間予算を設定",
      "📅 平日のみ、休日のみ、全日から選択可能",
      "⚡ 1日平均予算を自動計算",
    ],
  },
  {
    id: 4,
    title: "出費記録と分析",
    description: "簡単な入力で詳細な分析が可能",
    icon: <PieChart className="h-12 w-12 text-primary" />,
    content: [
      "📝 金額、説明、日付を記録",
      "⚡ クイック入力で素早く記録",
      "📊 円グラフ、棒グラフで視覚化",
      "📈 月間比較と傾向分析",
    ],
  },
  {
    id: 5,
    title: "履歴管理",
    description: "過去の出費履歴を確認・編集できます",
    icon: <Calendar className="h-12 w-12 text-primary" />,
    content: [
      "📅 月ごとの出費履歴を表示",
      "✏️ 過去の出費を編集・削除",
      "📊 月間サマリーで使用状況を確認",
      "🔍 全期間の出費を検索・フィルタ",
    ],
  },
  {
    id: 6,
    title: "スマホでの使い方のコツ",
    description: "モバイルでより快適に使うためのヒント",
    icon: <TrendingUp className="h-12 w-12 text-primary" />,
    content: [
      "👆 大きなボタンでタップしやすい設計",
      "📱 縦画面での最適化されたレイアウト",
      "⚡ クイック入力で外出先でも素早く記録",
      "🔄 スワイプやタップで直感的な操作",
    ],
  },
]

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const skipOnboarding = () => {
    onComplete()
  }

  const step = onboardingSteps[currentStep]

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Progress indicator */}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {currentStep + 1} / {onboardingSteps.length}
          </Badge>
          <Button variant="ghost" size="sm" onClick={skipOnboarding} className="text-xs">
            スキップ
          </Button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
          />
        </div>

        {/* Main content */}
        <Card className="min-h-[500px]">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">{step.icon}</div>
            <div>
              <CardTitle className="text-xl mb-2">{step.title}</CardTitle>
              <p className="text-muted-foreground text-sm">{step.description}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {step.content.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex-1 h-12 gap-2 bg-transparent"
          >
            <ChevronLeft className="h-4 w-4" />
            戻る
          </Button>
          <Button onClick={nextStep} className="flex-1 h-12 gap-2">
            {currentStep === onboardingSteps.length - 1 ? "始める" : "次へ"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Tips for current step */}
        {currentStep === 0 && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-primary mb-1">💡 ヒント</p>
                  <p className="text-xs text-muted-foreground">
                    このアプリはスマートフォンでの使用に最適化されています。大きなボタンと見やすい文字で、外出先でも簡単に出費を記録できます。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-accent mb-1">💡 ヒント</p>
                  <p className="text-xs text-muted-foreground">
                    ランチ代は「平日のみ」、カフェ代は「休日のみ」など、カテゴリごとに計算方法を選択できます。より正確な1日平均予算が計算されます。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
