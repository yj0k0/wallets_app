"use client"

import { useState, useEffect } from "react"
import { ProjectSelector } from "@/components/project-selector"
import { OnboardingFlow } from "@/components/onboarding-flow"
import ExpenseManager from "@/components/expense-manager"

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user has seen onboarding before
    const hasSeenOnboarding = localStorage.getItem("has-seen-onboarding")
    const lastProject = localStorage.getItem("last-selected-project")

    if (!hasSeenOnboarding) {
      setShowOnboarding(true)
    } else if (lastProject) {
      setSelectedProject(lastProject)
    }

    setIsLoading(false)
  }, [])

  const handleSelectProject = (projectId: string) => {
    // プロジェクト選択時は直接URLにリダイレクトするため、この関数は使用しない
    // ただし、onboarding完了後の自動リダイレクト用に残す
    setSelectedProject(projectId)
    localStorage.setItem("last-selected-project", projectId)
  }

  const handleBackToProjects = () => {
    setSelectedProject(null)
    localStorage.removeItem("last-selected-project")
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    localStorage.setItem("has-seen-onboarding", "true")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />
  }

  if (!selectedProject) {
    const hasSeenOnboarding = localStorage.getItem("has-seen-onboarding")
    return <ProjectSelector showOnboardingHints={!hasSeenOnboarding} />
  }

  return <ExpenseManager projectId={selectedProject} onBackToProjects={handleBackToProjects} />
}
