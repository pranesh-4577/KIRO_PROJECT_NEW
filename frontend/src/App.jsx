import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Amplify } from 'aws-amplify'
import awsConfig from './aws-config'
import { AuthProvider } from './context/AuthContext'
import {
  RequireAuth, RequireAdmin, RequireStudent, RedirectIfAuth
} from './components/auth/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'

// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import VerifyEmail from './pages/auth/VerifyEmail'
import ForgotPassword from './pages/auth/ForgotPassword'

// Student pages
import StudentDashboard from './pages/student/StudentDashboard'
import SubmitComplaint from './pages/student/SubmitComplaint'
import MyComplaints from './pages/student/MyComplaints'
import ComplaintDetails from './pages/student/ComplaintDetails'
import Profile from './pages/student/Profile'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminComplaints from './pages/admin/AdminComplaints'
import AdminComplaintDetails from './pages/admin/AdminComplaintDetails'
import Analytics from './pages/admin/Analytics'

// Configure Amplify once
Amplify.configure(awsConfig)

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--gray-900)',
              color: '#fff',
              fontSize: '0.875rem',
              borderRadius: 'var(--radius)',
            },
          }}
        />
        <Routes>
          {/* Public auth routes */}
          <Route path="/login" element={<RedirectIfAuth><Login /></RedirectIfAuth>} />
          <Route path="/register" element={<RedirectIfAuth><Register /></RedirectIfAuth>} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Student routes */}
          <Route element={<RequireStudent><AppLayout /></RequireStudent>}>
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/complaints" element={<MyComplaints />} />
            <Route path="/complaints/new" element={<SubmitComplaint />} />
            <Route path="/complaints/:id" element={<ComplaintDetails />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Admin routes */}
          <Route element={<RequireAdmin><AppLayout /></RequireAdmin>}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/complaints" element={<AdminComplaints />} />
            <Route path="/admin/complaints/:id" element={<AdminComplaintDetails />} />
            <Route path="/admin/analytics" element={<Analytics />} />
            <Route path="/admin/profile" element={<Profile />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
