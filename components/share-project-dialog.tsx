"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Eye, 
  EyeOff,
  Calendar,
  Users,
  Edit,
  Lock
} from "lucide-react"
import { syncProjects, generateShareToken, generateShareUrl, type Project } from "@/lib/sync"

interface ShareProjectDialogProps {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareProjectDialog({ project, open, onOpenChange }: ShareProjectDialogProps) {
  const [shareToken, setShareToken] = useState<string>("")
  const [shareUrl, setShareUrl] = useState<string>("")
  const [isCopied, setIsCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isShared, setIsShared] = useState(false)
  const [allowEdit, setAllowEdit] = useState(false)

  useEffect(() => {
    if (project.isShared && project.shareToken) {
      setShareToken(project.shareToken)
      setShareUrl(generateShareUrl(project.shareToken))
      setIsShared(true)
      setAllowEdit(project.allowEdit || false)
    } else {
      setShareToken("")
      setShareUrl("")
      setIsShared(false)
      setAllowEdit(false)
    }
  }, [project])

  const handleShare = async () => {
    if (!shareToken) return
    
    setIsLoading(true)
    try {
      await syncProjects.shareProject(project.id, shareToken, allowEdit)
      setShareUrl(generateShareUrl(shareToken))
      setIsShared(true)
    } catch (error) {
      console.error('Error sharing project:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnshare = async () => {
    setIsLoading(true)
    try {
      await syncProjects.unshareProject(project.id)
      setShareToken("")
      setShareUrl("")
      setIsShared(false)
    } catch (error) {
      console.error('Error unsharing project:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateToken = () => {
    const newToken = generateShareToken()
    setShareToken(newToken)
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }

  const handleOpenUrl = () => {
    window.open(shareUrl, '_blank')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            プロジェクトを共有
          </DialogTitle>
          <DialogDescription>
            {project.name}を他の人と共有できます。共有されたプロジェクトは読み取り専用で表示されます。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* プロジェクト情報 */}
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{project.name}</h3>
                    {isShared && (
                      <Badge variant="default" className="gap-1">
                        {allowEdit ? (
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
                    )}
                  </div>
                {project.description && (
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(project.createdAt).toLocaleDateString('ja-JP')}
                  </div>
                  {project.sharedAt && (
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {new Date(project.sharedAt).toLocaleDateString('ja-JP')}に共有
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 共有設定 */}
          {!isShared ? (
            <div className="space-y-3">
              <div>
                <Label htmlFor="shareToken">共有トークン</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="shareToken"
                    value={shareToken}
                    onChange={(e) => setShareToken(e.target.value)}
                    placeholder="共有トークンを生成してください"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={handleGenerateToken}
                    className="shrink-0"
                  >
                    生成
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>編集権限</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="allowEdit"
                    checked={allowEdit}
                    onChange={(e) => setAllowEdit(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="allowEdit" className="text-sm">
                    共同編集を許可する
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  {allowEdit ? "共有されたユーザーはプロジェクトを編集できます" : "共有されたユーザーは閲覧のみ可能です"}
                </p>
              </div>
              
              <Button
                onClick={handleShare}
                disabled={!shareToken || isLoading}
                className="w-full"
              >
                {isLoading ? "共有中..." : "プロジェクトを共有"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <Label>共有URL</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={handleCopyUrl}
                    className="shrink-0"
                  >
                    {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleOpenUrl}
                    className="shrink-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <Button
                variant="destructive"
                onClick={handleUnshare}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "共有解除中..." : "共有を解除"}
              </Button>
            </div>
          )}

          {/* 共有の説明 */}
          <div className="bg-muted/50 rounded-lg p-3">
            <h4 className="font-medium text-sm mb-2">共有について</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• 共有URLを知っている人は誰でもアクセスできます</li>
              <li>• 編集権限を設定して共同編集を許可できます</li>
              <li>• いつでも共有を解除できます</li>
              <li>• プロジェクトの削除は所有者のみ可能です</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
