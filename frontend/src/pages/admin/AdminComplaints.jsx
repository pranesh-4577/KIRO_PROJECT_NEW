import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter } from 'lucide-react'
import { adminGetComplaints } from '../../api/complaintsApi'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import PriorityBadge from '../../components/common/PriorityBadge'
import EmptyState from '../../components/common/EmptyState'
import { formatDate, getCategoryIcon, truncate } from '../../utils/helpers'
import { COMPLAINT_STATUSES, COMPLAINT_CATEGORIES, COMPLAINT_PRIORITIES, BUILDINGS } from '../../utils/constants'

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [buildingFilter, setBuildingFilter] = useState('')

  const fetchComplaints = () => {
    setLoading(true)
    const params = {}
    if (search) params.search = search
    if (statusFilter) params.status = statusFilter
    if (categoryFilter) params.category = categoryFilter
    if (priorityFilter) params.priority = priorityFilter
    if (buildingFilter) params.building = buildingFilter

    adminGetComplaints(params)
      .then((res) => setComplaints(res.data || []))
      .catch(() => setComplaints([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchComplaints() }, [statusFilter, categoryFilter, priorityFilter, buildingFilter])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchComplaints()
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">All Complaints</h1>
          <p className="page-subtitle">{complaints.length} complaint{complaints.length !== 1 ? 's' : ''} found</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <form onSubmit={handleSearch}>
          <div className="filter-bar">
            <div style={{ position: 'relative', flex: 2, minWidth: 200 }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
              <input type="text" placeholder="Search by ID, title, or description…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: '2.25rem', width: '100%' }} />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              {COMPLAINT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">All Categories</option>
              {COMPLAINT_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="">All Priorities</option>
              {COMPLAINT_PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <select value={buildingFilter} onChange={(e) => setBuildingFilter(e.target.value)}>
              <option value="">All Buildings</option>
              {BUILDINGS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <button type="submit" className="btn btn-primary">
              <Filter size={16} /> Search
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        {loading ? <LoadingSpinner /> : complaints.length === 0 ? (
          <EmptyState title="No complaints found" description="Try adjusting your filters." />
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Complaint ID</th>
                  <th>Student</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Building</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.complaintId}>
                    <td>
                      <Link to={`/admin/complaints/${c.complaintId}`} className="complaint-id">{c.complaintId}</Link>
                    </td>
                    <td style={{ fontSize: '0.875rem' }}>{c.studentName || 'Unknown'}</td>
                    <td style={{ fontWeight: 500 }}>
                      <Link to={`/admin/complaints/${c.complaintId}`} style={{ color: 'var(--gray-800)' }}>
                        {truncate(c.title, 45)}
                      </Link>
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
