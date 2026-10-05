import React, { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'
import { getAnalytics } from '../../api/complaintsApi'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Alert from '../../components/common/Alert'

const COLORS = ['#2563eb', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#f97316', '#6b7280', '#3b82f6']

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getAnalytics()
      .then((res) => setAnalytics(res.data))
      .catch((err) => setError(err.message || 'Failed to load analytics.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />
  if (error) return <Alert type="error" message={error} />

  const categoryData = Object.entries(analytics?.byCategory || {}).map(([name, count]) => ({ name, count }))
  const buildingData = Object.entries(analytics?.byBuilding || {}).map(([name, count]) => ({ name, count }))
  const priorityData = Object.entries(analytics?.byPriority || {}).map(([name, value]) => ({ name, value }))
  const monthlyData = (analytics?.monthly || []).map((m) => ({ month: m.month, count: m.count }))
  const resolutionData = Object.entries(analytics?.avgResolutionByCategory || {}).map(([name, hours]) => ({ name, hours: parseFloat(hours).toFixed(1) }))

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Detailed complaint statistics and trends</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Row 1: Category + Building */}
        <div className="grid-2">
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem' }}>Complaints by Category</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={categoryData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem' }}>Complaints by Building</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={buildingData} margin={{ left: -20 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#7c3aed" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 2: Monthly + Priority */}
        <div className="grid-2">
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem' }}>Monthly Trend (This Year)</h2>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthlyData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem' }}>Priority Distribution</h2>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={priorityData.filter((d) => d.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {priorityData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resolution time by category */}
        {resolutionData.length > 0 && (
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem' }}>Average Resolution Time by Category (hours)</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={resolutionData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v}h`, 'Avg Resolution']} />
                <Bar dataKey="hours" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
