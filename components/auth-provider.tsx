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
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user)
      setLoading(false)
      if (user) {
        setError(null)
      }
    })

    return () => unsubscribe()
  }, [])

  const signInAnonymously = async () => {
    try {
      setError(null)
      await signInAnonymouslyUser()
    } catch (error) {
      console.error('Error signing in anonymously:', error)
      setError(error instanceof Error ? error.message : '認証エラーが発生しました')
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
