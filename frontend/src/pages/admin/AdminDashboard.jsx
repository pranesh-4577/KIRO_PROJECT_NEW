import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Clock, CheckCircle, XCircle, AlertTriangle, Zap, Users, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { getDashboardStats } from '../../api/complaintsApi'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Alert from '../../components/common/Alert'

const STATUS_COLORS = {
  PENDING: '#f59e0b', ASSIGNED: '#3b82f6', IN_PROGRESS: '#8b5cf6',
  RESOLVED: '#10b981', REJECTED: '#ef4444',
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.message || 'Failed to load dashboard stats.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />
  if (error) return <Alert type="error" message={error} />

  const statusCards = [
    { label: 'Total', value: stats?.total || 0, icon: FileText, color: '#2563eb', bg: '#dbeafe' },
    { label: 'Pending', value: stats?.byStatus?.PENDING || 0, icon: Clock, color: '#f59e0b', bg: '#fef3c7' },
    { label: 'Assigned', value: stats?.byStatus?.ASSIGNED || 0, icon: Users, color: '#3b82f6', bg: '#dbeafe' },
    { label: 'In Progress', value: stats?.byStatus?.IN_PROGRESS || 0, icon: TrendingUp, color: '#8b5cf6', bg: '#ede9fe' },
    { label: 'Resolved', value: stats?.byStatus?.RESOLVED || 0, icon: CheckCircle, color: '#10b981', bg: '#d1fae5' },
    { label: 'Rejected', value: stats?.byStatus?.REJECTED || 0, icon: XCircle, color: '#ef4444', bg: '#fee2e2' },
    { label: 'High/Critical', value: stats?.highPriority || 0, icon: Zap, color: '#f97316', bg: '#ffedd5' },
    { label: 'Avg Resolution', value: stats?.avgResolutionHours ? `${stats.avgResolutionHours}h` : '—', icon: AlertTriangle, color: '#6b7280', bg: '#f3f4f6' },
  ]

  const categoryData = Object.entries(stats?.byCategory || {}).map(([name, count]) => ({ name, count }))
  const monthlyData = (stats?.monthly || []).map((m) => ({ month: m.month, count: m.count }))
  const statusPieData = Object.entries(stats?.byStatus || {}).map(([name, value]) => ({ name, value }))

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Overview of all campus complaints</p>
        </div>
        <Link to="/admin/complaints" className="btn btn-primary">View All Complaints</Link>
      </div>

      {/* Stats Grid */}
      <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
        {statusCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: bg }}>
              <Icon size={22} color={color} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
        {/* Category bar chart */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem' }}>Complaints by Category</h2>
          {categoryData.length === 0 ? (
            <p style={{ color: 'var(--gray-400)', fontSize: '0.875rem' }}>No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status pie chart */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem' }}>Status Distribution</h2>
          {statusPieData.filter((d) => d.value > 0).length === 0 ? (
            <p style={{ color: 'var(--gray-400)', fontSize: '0.875rem' }}>No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusPieData.filter((d) => d.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {statusPieData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#9ca3af'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Monthly chart */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem' }}>Monthly Complaints (This Year)</h2>
        {monthlyData.length === 0 ? (
          <p style={{ color: 'var(--gray-400)', fontSize: '0.875rem' }}>No data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
