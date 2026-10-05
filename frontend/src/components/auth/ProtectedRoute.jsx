import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../common/LoadingSpinner'

export function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()
  if (loading) return <LoadingSpinner fullPage />
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

export function RequireAdmin({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  const location = useLocation()
  if (loading) return <LoadingSpinner fullPage />
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return children
}

export function RequireStudent({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  const location = useLocation()
  if (loading) return <LoadingSpinner fullPage />
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />
  if (isAdmin) return <Navigate to="/admin/dashboard" replace />
  return children
}

export function RedirectIfAuth({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  if (loading) return <LoadingSpinner fullPage />
  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin/dashboard' : '/dashboard'} replace />
  }
  return children
}
