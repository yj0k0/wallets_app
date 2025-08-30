import { 
  signInAnonymously, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth'
import { auth } from './firebase'

// 匿名認証でユーザーを作成
export const signInAnonymouslyUser = async (): Promise<User> => {
  try {
    const result = await signInAnonymously(auth)
    return result.user
  } catch (error) {
    console.error('Error signing in anonymously:', error)
    throw error
  }
}

// メール/パスワードでサインイン
export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return result.user
  } catch (error) {
    console.error('Error signing in with email:', error)
    throw error
  }
}

// メール/パスワードでアカウント作成
export const createUserWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    return result.user
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

// サインアウト
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth)
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

// 認証状態の監視
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback)
}

// 現在のユーザーを取得
export const getCurrentUser = (): User | null => {
  return auth.currentUser
}
