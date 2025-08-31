"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from 'firebase/auth'
import { onAuthStateChange, signInAnonymouslyUser } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signInAnonymously: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'No user')
      
      if (user) {
        setUser(user)
        setError(null)
        setLoading(false)
      } else {
        // ユーザーがログインしていない場合は匿名認証を試行
        try {
          console.log('No user found, attempting anonymous sign in...')
          const anonymousUser = await signInAnonymouslyUser()
          console.log('Anonymous sign in successful:', anonymousUser.uid)
          setUser(anonymousUser)
          setError(null)
        } catch (error) {
          console.error('Anonymous sign in failed:', error)
          setError(error instanceof Error ? error.message : '認証エラーが発生しました')
        } finally {
          setLoading(false)
        }
      }
    })

    return () => unsubscribe()
  }, [])

  const signInAnonymously = async () => {
    try {
      setError(null)
      setLoading(true)
      const user = await signInAnonymouslyUser()
      setUser(user)
    } catch (error) {
      console.error('Error signing in anonymously:', error)
      setError(error instanceof Error ? error.message : '認証エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, signInAnonymously }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
