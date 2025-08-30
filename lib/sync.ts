import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc,
  onSnapshot
} from 'firebase/firestore'
import { db } from './firebase'

export interface Project {
  id: string
  name: string
  description: string
  createdAt: string
  lastModified: string
  userId: string
}

export interface Category {
  id: string
  name: string
  budget: number
  spent: number
  icon: string
  dayCalculationType: 'all' | 'weekdays' | 'weekends'
}

export interface Expense {
  id: string
  categoryId: string
  amount: number
  description: string
  date: string
}

export interface MonthlyData {
  categories: Category[]
  expenses: Expense[]
}

export interface ProjectData {
  [monthKey: string]: MonthlyData
}

// プロジェクト関連の同期
export const syncProjects = {
  // プロジェクト一覧を取得
  async getProjects(userId: string): Promise<Project[]> {
    try {
      const q = query(
        collection(db, 'projects'),
        where('userId', '==', userId)
        // orderBy('lastModified', 'desc') // 一時的にコメントアウト
      )
      const querySnapshot = await getDocs(q)
      const projects = querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          name: data.name || '',
          description: data.description || '',
          createdAt: data.createdAt || new Date().toISOString(),
          lastModified: data.lastModified || new Date().toISOString(),
          userId: data.userId || userId
        } as Project
      })
      
      // クライアントサイドでソート
      return projects.sort((a, b) => 
        new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
      )
    } catch (error) {
      console.error('Error getting projects:', error)
      return []
    }
  },

  // プロジェクトを作成・更新
  async saveProject(project: Project): Promise<void> {
    try {
      await setDoc(doc(db, 'projects', project.id), {
        ...project,
        lastModified: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error saving project:', error)
      throw error
    }
  },

  // プロジェクトを削除
  async deleteProject(projectId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'projects', projectId))
    } catch (error) {
      console.error('Error deleting project:', error)
      throw error
    }
  },

  // リアルタイムリスナー
  subscribeToProjects(userId: string, callback: (projects: Project[]) => void) {
    try {
      console.log('Setting up projects subscription for userId:', userId)
      
      const q = query(
        collection(db, 'projects'),
        where('userId', '==', userId)
        // orderBy('lastModified', 'desc') // 一時的にコメントアウト
      )
      
      return onSnapshot(q, (querySnapshot) => {
        try {
          console.log('Projects snapshot received, docs count:', querySnapshot.docs.length)
          
          const projects = querySnapshot.docs.map(doc => {
            const data = doc.data()
            console.log('Document data:', doc.id, data)
            
            return {
              id: doc.id,
              name: data?.name || '',
              description: data?.description || '',
              createdAt: data?.createdAt || new Date().toISOString(),
              lastModified: data?.lastModified || new Date().toISOString(),
              userId: data?.userId || userId
            } as Project
          })
          
          console.log('Processed projects:', projects)
          
          // クライアントサイドでソート
          const sortedProjects = projects.sort((a, b) => 
            new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
          )
          
          console.log('Sorted projects:', sortedProjects)
          callback(sortedProjects)
        } catch (error) {
          console.error('Error in projects snapshot handler:', error)
          callback([])
        }
      }, (error) => {
        console.error('Projects subscription error:', error)
        callback([])
      })
    } catch (error) {
      console.error('Error setting up projects subscription:', error)
      callback([])
    }
  }
}

// プロジェクトデータ関連の同期
export const syncProjectData = {
  // プロジェクトデータを取得
  async getProjectData(projectId: string): Promise<ProjectData | null> {
    try {
      const docRef = doc(db, 'projectData', projectId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        // データの検証とデフォルト値の設定
        if (data && typeof data === 'object') {
          return data as ProjectData
        }
      }
      return null
    } catch (error) {
      console.error('Error getting project data:', error)
      return null
    }
  },

  // プロジェクトデータを保存
  async saveProjectData(projectId: string, data: ProjectData): Promise<void> {
    try {
      await setDoc(doc(db, 'projectData', projectId), {
        ...data,
        lastUpdated: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error saving project data:', error)
      throw error
    }
  },

  // リアルタイムリスナー
  subscribeToProjectData(projectId: string, callback: (data: ProjectData | null) => void) {
    const docRef = doc(db, 'projectData', projectId)
    
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data()
        // データの検証
        if (data && typeof data === 'object') {
          callback(data as ProjectData)
        } else {
          callback(null)
        }
      } else {
        callback(null)
      }
    })
  }
}

// ユーザー設定の同期
export const syncUserSettings = {
  // ユーザー設定を取得
  async getUserSettings(userId: string): Promise<Record<string, unknown>> {
    try {
      const docRef = doc(db, 'userSettings', userId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return docSnap.data()
      }
      return {}
    } catch (error) {
      console.error('Error getting user settings:', error)
      return {}
    }
  },

  // ユーザー設定を保存
  async saveUserSettings(userId: string, settings: Record<string, unknown>): Promise<void> {
    try {
      await setDoc(doc(db, 'userSettings', userId), {
        ...settings,
        lastUpdated: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error saving user settings:', error)
      throw error
    }
  }
}

// デバイスID生成
export const generateDeviceId = (): string => {
  if (typeof window !== 'undefined') {
    let deviceId = localStorage.getItem('device-id')
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('device-id', deviceId)
    }
    return deviceId
  }
  return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 一時的なユーザーID生成（認証なしの場合）
export const generateTemporaryUserId = (): string => {
  if (typeof window !== 'undefined') {
    let userId = localStorage.getItem('temporary-user-id')
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('temporary-user-id', userId)
    }
    return userId
  }
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
