"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Eye, Calendar, Users, AlertCircle, Edit } from "lucide-react"
import { syncProjects, syncProjectData, type Project, type ProjectData } from "@/lib/sync"
import ExpenseManager from "@/components/expense-manager"

export default function SharedProjectPage() {
  const params = useParams()
  const shareToken = params.shareToken as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [projectData, setProjectData] = useState<ProjectData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadSharedProject = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // 共有トークンでプロジェクトを取得
        const sharedProject = await syncProjects.getProjectByShareToken(shareToken)
        
        if (!sharedProject) {
          setError("共有されたプロジェクトが見つかりません")
          return
        }
        
        setProject(sharedProject)
        
        // プロジェクトデータを取得
        const data = await syncProjectData.getProjectData(sharedProject.id)
        if (data) {
          setProjectData(data)
        }
        
      } catch (error) {
        console.error('Error loading shared project:', error)
        setError("プロジェクトの読み込みに失敗しました")
      } finally {
        setIsLoading(false)
      }
    }

    if (shareToken) {
      loadSharedProject()
    }
  }, [shareToken])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">共有プロジェクトを読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                <h2 className="text-lg font-semibold">エラーが発生しました</h2>
                <p className="text-sm text-muted-foreground">{error || "プロジェクトが見つかりません"}</p>
                <Button onClick={() => window.history.back()} className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  戻る
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            戻る
          </Button>
          <Badge variant="default" className="gap-1">
            {project.allowEdit ? (
              <>
                <Edit className="h-3 w-3" />
                共同編集
              </>
            ) : (
              <>
                <Eye className="h-3 w-3" />
                閲覧のみ
              </>
            )}
          </Badge>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {project.name}
            </CardTitle>
            {project.description && (
              <p className="text-muted-foreground">{project.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                作成: {new Date(project.createdAt).toLocaleDateString('ja-JP')}
              </div>
              {project.sharedAt && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  共有: {new Date(project.sharedAt).toLocaleDateString('ja-JP')}
                </div>
              )}
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Project Content */}
      {projectData && (
        <ExpenseManager 
          projectId={project.id} 
          onBackToProjects={() => window.history.back()}
          isReadOnly={!project.allowEdit}
        />
      )}
    </div>
  )
}
