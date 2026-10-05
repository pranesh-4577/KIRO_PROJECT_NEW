import React, { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Menu, Bell } from 'lucide-react'
import Sidebar from './Sidebar'
import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../utils/helpers'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/complaints': 'My Complaints',
  '/complaints/new': 'Submit a Complaint',
  '/profile': 'My Profile',
  '/admin/dashboard': 'Admin Dashboard',
  '/admin/complaints': 'All Complaints',
  '/admin/analytics': 'Analytics',
  '/admin/profile': 'Profile',
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { userAttributes } = useAuth()
  const location = useLocation()

  // Match title from path (handle dynamic routes like /complaints/:id)
  const title = Object.entries(pageTitles).find(([path]) =>
    location.pathname === path || location.pathname.startsWith(path + '/')
  )?.[1] || 'Smart Campus'

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content">
        {/* Top Bar */}
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <span className="topbar-title">{title}</span>
          </div>
          <div className="user-menu">
            <div className="avatar" title={userAttributes?.name}>
              {getInitials(userAttributes?.name || 'U')}
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-700)' }}>
              {userAttributes?.name?.split(' ')[0] || 'User'}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
