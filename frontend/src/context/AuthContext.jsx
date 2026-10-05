import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  signIn,
  signUp,
  signOut,
  confirmSignUp,
  resendSignUpCode,
  resetPassword,
  confirmResetPassword,
  getCurrentUser,
  fetchAuthSession,
  fetchUserAttributes,
} from 'aws-amplify/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userAttributes, setUserAttributes] = useState(null)
  const [userRole, setUserRole] = useState(null) // 'student' | 'admin'
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  const loadUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser()
      const session = await fetchAuthSession()
      const attrs = await fetchUserAttributes()

      // Determine role from Cognito groups in the JWT
      const groups = session?.tokens?.accessToken?.payload?.['cognito:groups'] || []
      const role = groups.includes('admin') ? 'admin' : 'student'

      setUser(currentUser)
      setUserAttributes(attrs)
      setUserRole(role)
    } catch {
      setUser(null)
      setUserAttributes(null)
      setUserRole(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = async (email, password) => {
    setAuthError(null)
    try {
      const result = await signIn({ username: email, password })
      if (result.isSignedIn) {
        await loadUser()
      }
      return result
    } catch (err) {
      setAuthError(err.message)
      throw err
    }
  }

  const register = async (email, password, fullName) => {
    setAuthError(null)
    try {
      return await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name: fullName,
          },
        },
      })
    } catch (err) {
      setAuthError(err.message)
      throw err
    }
  }

  const confirmRegistration = async (email, code) => {
    setAuthError(null)
    try {
      return await confirmSignUp({ username: email, confirmationCode: code })
    } catch (err) {
      setAuthError(err.message)
      throw err
    }
  }

  const resendConfirmationCode = async (email) => {
    try {
      return await resendSignUpCode({ username: email })
    } catch (err) {
      setAuthError(err.message)
      throw err
    }
  }

  const forgotPassword = async (email) => {
    try {
      return await resetPassword({ username: email })
    } catch (err) {
      setAuthError(err.message)
      throw err
    }
  }

  const confirmForgotPassword = async (email, code, newPassword) => {
    try {
      return await confirmResetPassword({ username: email, confirmationCode: code, newPassword })
    } catch (err) {
      setAuthError(err.message)
      throw err
    }
  }

  const logout = async () => {
    await signOut()
    setUser(null)
    setUserAttributes(null)
    setUserRole(null)
  }

  const getToken = async () => {
    try {
      const session = await fetchAuthSession()
      return session?.tokens?.idToken?.toString()
    } catch {
      return null
    }
  }

  const value = {
    user,
    userAttributes,
    userRole,
    loading,
    authError,
    isAuthenticated: !!user,
    isAdmin: userRole === 'admin',
    isStudent: userRole === 'student',
    login,
    register,
    confirmRegistration,
    resendConfirmationCode,
    forgotPassword,
    confirmForgotPassword,
    logout,
    getToken,
    refreshUser: loadUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
