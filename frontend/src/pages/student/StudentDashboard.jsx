import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, FileText, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getMyComplaints } from '../../api/complaintsApi'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import PriorityBadge from '../../components/common/PriorityBadge'
import EmptyState from '../../components/common/EmptyState'
import { formatDate, getCategoryIcon } from '../../utils/helpers'

export default function StudentDashboard() {
  const { userAttributes } = useAuth()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyComplaints()
      .then((res) => setComplaints(res.data || []))
      .catch(() => setComplaints([]))
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === 'PENDING').length,
    inProgress: complaints.filter((c) => ['ASSIGNED', 'IN_PROGRESS'].includes(c.status)).length,
    resolved: complaints.filter((c) => c.status === 'RESOLVED').length,
    rejected: complaints.filter((c) => c.status === 'REJECTED').length,
  }

  const recent = complaints.slice(0, 5)

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)' }}>
          Welcome, {userAttributes?.name?.split(' ')[0] || 'Student'} 👋
        </h1>
        <p style={{ color: 'var(--gray-500)', marginTop: '0.25rem', fontSize: '0.9375rem' }}>
          Track and manage your campus complaints from here.
        </p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
        {[
          { label: 'Total Complaints', value: stats.total, icon: FileText, color: '#2563eb', bg: '#dbeafe' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: '#f59e0b', bg: '#fef3c7' },
          { label: 'In Progress', value: stats.inProgress, icon: AlertTriangle, color: '#8b5cf6', bg: '#ede9fe' },
          { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: '#10b981', bg: '#d1fae5' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: bg }}>
              <Icon size={22} color={color} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{loading ? '—' : value}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick action */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
        <Link to="/complaints/new" className="btn btn-primary btn-lg">
          <PlusCircle size={20} /> Submit New Complaint
        </Link>
        <Link to="/complaints" className="btn btn-secondary btn-lg">
          <FileText size={20} /> View All Complaints
        </Link>
      </div>

      {/* Recent complaints */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Recent Complaints</h2>
          <Link to="/complaints" style={{ fontSize: '0.875rem' }}>View all →</Link>
        </div>

        {loading ? <LoadingSpinner /> : recent.length === 0 ? (
          <EmptyState
            title="No complaints yet"
            description="Submit your first complaint to get started."
            action={<Link to="/complaints/new" className="btn btn-primary">Submit Complaint</Link>}
          />
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Complaint ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((c) => (
                  <tr key={c.complaintId} style={{ cursor: 'pointer' }}>
                    <td>
                      <Link to={`/complaints/${c.complaintId}`} className="complaint-id">
                        {c.complaintId}
                      </Link>
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      <Link to={`/complaints/${c.complaintId}`} style={{ color: 'var(--gray-800)' }}>
                        {c.title}
                      </Link>
                    </td>
                    <td>{getCategoryIcon(c.category)} {c.category}</td>
                    <td><PriorityBadge priority={c.priority} /></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td style={{ color: 'var(--gray-400)', fontSize: '0.8125rem' }}>{formatDate(c.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
