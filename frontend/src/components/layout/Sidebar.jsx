import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, PlusCircle, ClipboardList,
  BarChart2, Users, Settings, LogOut, ShieldCheck, User
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const studentNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/complaints/new', label: 'Submit Complaint', icon: PlusCircle },
  { to: '/complaints', label: 'My Complaints', icon: FileText },
  { to: '/profile', label: 'Profile', icon: User },
]

const adminNav = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/complaints', label: 'All Complaints', icon: ClipboardList },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/admin/profile', label: 'Profile', icon: User },
]

export default function Sidebar({ isOpen, onClose }) {
  const { userAttributes, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const navItems = isAdmin ? adminNav : studentNav

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <>
      {/* Overlay for mobile */}
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <ShieldCheck size={18} color="#fff" />
          </div>
          <div>
            <div className="sidebar-logo-text">Smart Campus</div>
            <div className="sidebar-logo-sub">{isAdmin ? 'Admin Portal' : 'Student Portal'}</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section-title">Menu</div>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div style={{ marginBottom: '0.75rem', padding: '0.5rem 0.875rem', borderRadius: 'var(--radius)', background: 'rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
              {userAttributes?.name || 'User'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.125rem' }}>
              {userAttributes?.email || ''}
            </div>
          </div>
          <button className="nav-item" style={{ width: '100%', border: 'none', cursor: 'pointer', background: 'none' }} onClick={handleLogout}>
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
