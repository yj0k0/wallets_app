"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ExpenseManager from "@/components/expense-manager"

interface ProjectPageProps {
  params: {
    projectId: string
  }
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const router = useRouter()
  const [isValidProject, setIsValidProject] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // プロジェクトが存在するかチェック
    if (typeof window !== "undefined") {
      const projects = localStorage.getItem("expense-projects")
      if (projects) {
        const projectList = JSON.parse(projects)
        const projectExists = projectList.some((project: { id: string }) => project.id === params.projectId)
        setIsValidProject(projectExists)
      } else {
        setIsValidProject(false)
      }
      setIsLoading(false)
    }
  }, [params.projectId])

  const handleBackToProjects = () => {
    router.push("/")
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

  if (isValidProject === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-foreground">プロジェクトが見つかりません</h1>
          <p className="text-muted-foreground">
            指定されたプロジェクトは存在しないか、削除された可能性があります。
          </p>
          <button
            onClick={handleBackToProjects}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            プロジェクト一覧に戻る
          </button>
        </div>
      </div>
    )
  }

  return <ExpenseManager projectId={params.projectId} onBackToProjects={handleBackToProjects} />
}
