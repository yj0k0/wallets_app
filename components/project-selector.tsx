"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, FolderOpen, Calendar, Trash2, HelpCircle, Lightbulb, Wifi, WifiOff } from "lucide-react"
import { syncProjects, type Project } from "@/lib/sync"
import { useAuth } from "@/components/auth-provider"

interface ProjectSelectorProps {
  showOnboardingHints?: boolean
}

export function ProjectSelector({ showOnboardingHints = false }: ProjectSelectorProps) {
  const router = useRouter()
  const { user, loading: authLoading, error: authError, signInAnonymously } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [isOnline, setIsOnline] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // 認証が完了していない場合は匿名認証を実行
    if (!authLoading && !user) {
      signInAnonymously()
      return
    }

    if (!user) return
    
    // オンライン状態をチェック
    const checkOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }
    
    window.addEventListener('online', checkOnlineStatus)
    window.addEventListener('offline', checkOnlineStatus)
    checkOnlineStatus()

    // Firestoreからプロジェクトを取得
    const loadProjects = async () => {
      try {
        setError(null)
        const projectsData = await syncProjects.getProjects(user.uid)
        setProjects(projectsData)
      } catch (error) {
        console.error('Error loading projects:', error)
        setError(error instanceof Error ? error.message : 'プロジェクトの読み込みに失敗しました')
        // オフライン時はlocalStorageから読み込み
        if (typeof window !== "undefined") {
          const saved = localStorage.getItem("expense-projects")
          if (saved) {
            setProjects(JSON.parse(saved))
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadProjects()

    // リアルタイム同期
    const unsubscribe = syncProjects.subscribeToProjects(user.uid, (projectsData) => {
      if (Array.isArray(projectsData)) {
        setProjects(projectsData)
        // ローカルバックアップも保存
        if (typeof window !== "undefined") {
          localStorage.setItem("expense-projects", JSON.stringify(projectsData))
        }
      } else {
        console.error('Invalid projects data received:', projectsData)
        setError('プロジェクトデータの形式が無効です')
      }
    })

    return () => {
      window.removeEventListener('online', checkOnlineStatus)
      window.removeEventListener('offline', checkOnlineStatus)
      unsubscribe()
    }
  }, [authLoading, user, signInAnonymously])

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectDescription, setNewProjectDescription] = useState("")
  const [showHints, setShowHints] = useState(showOnboardingHints)

  const saveProjects = async (updatedProjects: Project[]) => {
    setProjects(updatedProjects)
    // ローカルバックアップ
    localStorage.setItem("expense-projects", JSON.stringify(updatedProjects))
    
    // オンライン時はFirestoreに保存
    if (isOnline && user) {
      try {
        for (const project of updatedProjects) {
          await syncProjects.saveProject(project)
        }
      } catch (error) {
        console.error('Error saving to Firestore:', error)
      }
    }
  }

  const createProject = async () => {
    if (!newProjectName.trim() || !user) return

    const newProject: Project = {
      id: Date.now().toString(),
      name: newProjectName.trim(),
      description: newProjectDescription.trim(),
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      userId: user.uid,
    }

    const updatedProjects = [...projects, newProject]
    saveProjects(updatedProjects)

    setNewProjectName("")
    setNewProjectDescription("")
    setIsCreateDialogOpen(false)

    // Automatically select the new project
    router.push(`/projects/${newProject.id}`)
  }

  const deleteProject = async (projectId: string) => {
    const updatedProjects = projects.filter((p) => p.id !== projectId)
    await saveProjects(updatedProjects)

    // Also remove project data from localStorage
    localStorage.removeItem(`expense-project-${projectId}`)
    
    // オンライン時はFirestoreからも削除
    if (isOnline) {
      try {
        await syncProjects.deleteProject(projectId)
      } catch (error) {
        console.error('Error deleting from Firestore:', error)
      }
    }
    
    // If we're currently on the deleted project's page, redirect to home
    if (typeof window !== "undefined" && window.location.pathname === `/projects/${projectId}`) {
      router.push("/")
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
            <FolderOpen className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">出費管理</h1>
          <p className="text-muted-foreground">プロジェクトを選択または作成してください</p>
          
          {/* 認証・オンライン状態表示 */}
          <div className="flex items-center justify-center gap-2">
            {user && (
              <Badge variant="outline" className="gap-1">
                <FolderOpen className="h-3 w-3" />
                ユーザー: {user.uid.slice(-8)}
              </Badge>
            )}
            {isOnline ? (
              <Badge variant="default" className="gap-1">
                <Wifi className="h-3 w-3" />
                オンライン同期
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <WifiOff className="h-3 w-3" />
                オフライン
              </Badge>
            )}
          </div>

          {/* エラー表示 */}
          {(authError || error) && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive font-medium">エラーが発生しました</p>
              {authError && (
                <p className="text-xs text-destructive mt-1">認証エラー: {authError}</p>
              )}
              {error && (
                <p className="text-xs text-destructive mt-1">データエラー: {error}</p>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.reload()} 
                className="mt-2"
              >
                ページを再読み込み
              </Button>
            </div>
          )}

          {showHints && (
            <div className="flex items-center justify-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Lightbulb className="h-3 w-3" />
                初回利用ガイド
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => setShowHints(false)} className="text-xs">
                非表示
              </Button>
            </div>
          )}
        </div>

        {showHints && projects.length === 0 && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-primary mb-2">🎯 プロジェクトとは？</p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>• 家計管理、旅行費用、イベント予算など用途別に分けて管理</p>
                    <p>• 各プロジェクトで独立した予算とカテゴリを設定</p>
                    <p>• 複数のプロジェクトを同時に管理可能</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Project Button */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="w-full h-14 text-lg gap-3">
              <Plus className="h-6 w-6" />
              新しいプロジェクトを作成
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-4">
            <DialogHeader>
              <DialogTitle>新しいプロジェクトを作成</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {showHints && (
                <Card className="bg-muted/30">
                  <CardContent className="p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2">💡 プロジェクト名の例</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>• 2024年家計管理</div>
                      <div>• 沖縄旅行予算</div>
                      <div>• 結婚式準備費用</div>
                      <div>• 一人暮らし費用</div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                <Label htmlFor="project-name">プロジェクト名 *</Label>
                <Input
                  id="project-name"
                  placeholder="例: 2024年家計管理"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="h-12 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-description">説明（任意）</Label>
                <Input
                  id="project-description"
                  placeholder="例: 月ごとの出費を管理するプロジェクト"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  className="h-12 text-base"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1 h-12">
                  キャンセル
                </Button>
                <Button onClick={createProject} disabled={!newProjectName.trim()} className="flex-1 h-12">
                  作成
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Projects List */}
        {projects.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">既存のプロジェクト</h2>
              <Badge variant="outline">{projects.length}個のプロジェクト</Badge>
            </div>
            <div className="space-y-3">
              {projects.map((project) => (
                <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1" onClick={() => router.push(`/projects/${project.id}`)}>
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        {project.description && (
                          <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteProject(project.id)
                        }}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0" onClick={() => router.push(`/projects/${project.id}`)}>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        作成: {formatDate(project.createdAt)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {projects.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-3">
                <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-medium">プロジェクトがありません</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  最初のプロジェクトを作成して、出費管理を始めましょう。
                </p>
                {showHints && (
                  <div className="mt-4 p-3 bg-accent/10 rounded-lg">
                    <p className="text-xs text-accent font-medium">
                      💡 まずは「2024年家計管理」などの名前でプロジェクトを作成してみましょう
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
