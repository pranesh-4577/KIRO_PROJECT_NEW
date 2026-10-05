import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, PlusCircle, FileText } from 'lucide-react'
import { getMyComplaints } from '../../api/complaintsApi'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import PriorityBadge from '../../components/common/PriorityBadge'
import EmptyState from '../../components/common/EmptyState'
import { formatDate, getCategoryIcon } from '../../utils/helpers'
import { COMPLAINT_STATUSES, COMPLAINT_CATEGORIES } from '../../utils/constants'

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  useEffect(() => {
    getMyComplaints()
      .then((res) => setComplaints(res.data || []))
      .catch(() => setComplaints([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = complaints.filter((c) => {
    const matchSearch = !search ||
      c.complaintId?.toLowerCase().includes(search.toLowerCase()) ||
      c.title?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || c.status === statusFilter
    const matchCategory = !categoryFilter || c.category === categoryFilter
    return matchSearch && matchStatus && matchCategory
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Complaints</h1>
          <p className="page-subtitle">{complaints.length} total complaint{complaints.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/complaints/new" className="btn btn-primary">
          <PlusCircle size={16} /> New Complaint
        </Link>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <div className="filter-bar">
          <div style={{ position: 'relative', flex: 2 }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
            <input
              type="text" placeholder="Search by Complaint ID or title…"
              value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.25rem', width: '100%' }}
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {COMPLAINT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            {COMPLAINT_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={search || statusFilter || categoryFilter ? 'No matching complaints' : 'No complaints yet'}
            description={search || statusFilter || categoryFilter ? 'Try adjusting your search or filters.' : 'Submit your first complaint to get started.'}
            action={!search && !statusFilter && !categoryFilter && (
              <Link to="/complaints/new" className="btn btn-primary">Submit Complaint</Link>
            )}
          />
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Complaint ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Building</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.complaintId}>
                    <td><Link to={`/complaints/${c.complaintId}`} className="complaint-id">{c.complaintId}</Link></td>
                    <td style={{ fontWeight: 500 }}>
                      <Link to={`/complaints/${c.complaintId}`} style={{ color: 'var(--gray-800)' }}>{c.title}</Link>
                    </td>
                    <td>{getCategoryIcon(c.category)} {c.category}</td>
                    <td>{c.building || '—'}</td>
                    <td><PriorityBadge priority={c.priority} /></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td style={{ color: 'var(--gray-400)', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>{formatDate(c.createdAt)}</td>
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
