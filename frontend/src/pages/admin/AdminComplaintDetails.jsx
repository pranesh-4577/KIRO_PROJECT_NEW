import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, MapPin, Calendar, MessageSquare, UserCheck, RefreshCw, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminGetComplaintById, adminUpdateStatus, adminAssignComplaint, adminAddComment } from '../../api/complaintsApi'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import PriorityBadge from '../../components/common/PriorityBadge'
import Alert from '../../components/common/Alert'
import { formatDate, getCategoryIcon } from '../../utils/helpers'
import { STATUS_TRANSITIONS, COMPLAINT_STATUSES } from '../../utils/constants'

export default function AdminComplaintDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Action state
  const [newStatus, setNewStatus] = useState('')
  const [statusComment, setStatusComment] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const [assignTo, setAssignTo] = useState('')
  const [assigning, setAssigning] = useState(false)

  const [comment, setComment] = useState('')
  const [addingComment, setAddingComment] = useState(false)

  const load = () => {
    adminGetComplaintById(id)
      .then((res) => {
        setComplaint(res.data)
        setNewStatus('')
      })
      .catch((err) => setError(err.message || 'Complaint not found.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  const handleStatusUpdate = async () => {
    if (!newStatus) return
    setUpdatingStatus(true)
    try {
      await adminUpdateStatus(id, newStatus, statusComment)
      toast.success(`Status updated to ${newStatus}`)
      setStatusComment('')
      load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleAssign = async () => {
    if (!assignTo.trim()) return
    setAssigning(true)
    try {
      await adminAssignComplaint(id, assignTo, assignTo)
      toast.success('Complaint assigned successfully')
      setAssignTo('')
      load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setAssigning(false)
    }
  }

  const handleAddComment = async () => {
    if (!comment.trim()) return
    setAddingComment(true)
    try {
      await adminAddComment(id, comment)
      toast.success('Comment added')
      setComment('')
      load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setAddingComment(false)
    }
  }

  if (loading) return <LoadingSpinner fullPage />
  if (error) return (
    <div>
      <Alert type="error" message={error} />
      <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={() => navigate('/admin/complaints')}>
        <ArrowLeft size={16} /> Back
      </button>
    </div>
  )
  if (!complaint) return null

  const allowedTransitions = STATUS_TRANSITIONS[complaint.status] || []

  return (
    <div style={{ maxWidth: 840, margin: '0 auto' }}>
      <button className="btn btn-secondary btn-sm" style={{ marginBottom: '1rem' }} onClick={() => navigate('/admin/complaints')}>
        <ArrowLeft size={16} /> Back to All Complaints
      </button>

      {/* Header */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <span className="complaint-id" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>{complaint.complaintId}</span>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>{complaint.title}</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>{getCategoryIcon(complaint.category)} {complaint.category}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <PriorityBadge priority={complaint.priority} />
            <StatusBadge status={complaint.status} />
          </div>
        </div>

        {/* Meta grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={15} /> <span><strong>{complaint.studentName}</strong> ({complaint.studentEmail})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={15} /> <span>{complaint.building}{complaint.floor ? `, ${complaint.floor}` : ''}{complaint.roomNumber ? `, Room ${complaint.roomNumber}` : ''}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={15} /> <span>Submitted: {formatDate(complaint.createdAt)}</span>
          </div>
          {complaint.assignedToName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserCheck size={15} /> <span>Assigned to: <strong>{complaint.assignedToName}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.75rem' }}>Description</h2>
        <p style={{ fontSize: '0.9375rem', color: 'var(--gray-700)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{complaint.description}</p>
      </div>

      {/* Image */}
      {complaint.imageUrl && (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ImageIcon size={16} /> Attached Image
          </h2>
          <img src={complaint.imageUrl} alt="Complaint attachment" className="image-preview" style={{ maxHeight: 320 }} />
        </div>
      )}

      {/* Admin Actions */}
      <div className="grid-2" style={{ marginBottom: '1rem' }}>
        {/* Update Status */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={16} /> Update Status
          </h2>
          {allowedTransitions.length === 0 ? (
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-400)' }}>No further status transitions available.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                <option value="">Select new status…</option>
                {allowedTransitions.map((s) => (
                  <option key={s} value={s}>{COMPLAINT_STATUSES.find((cs) => cs.value === s)?.label || s}</option>
                ))}
              </select>
              <textarea placeholder="Optional comment for this update…" value={statusComment} onChange={(e) => setStatusComment(e.target.value)} rows={2} />
              <button className="btn btn-primary" disabled={!newStatus || updatingStatus} onClick={handleStatusUpdate}>
                {updatingStatus ? <><span className="spinner" /> Updating…</> : 'Update Status'}
              </button>
            </div>
          )}
        </div>

        {/* Assign */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck size={16} /> Assign to Staff
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input type="text" placeholder="Staff name or ID" value={assignTo} onChange={(e) => setAssignTo(e.target.value)} />
            <button className="btn btn-primary" disabled={!assignTo.trim() || assigning} onClick={handleAssign}>
              {assigning ? <><span className="spinner" /> Assigning…</> : 'Assign'}
            </button>
          </div>
        </div>
      </div>

      {/* Add Comment */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={16} /> Add Comment
        </h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <textarea placeholder="Write an update or note for the student…" value={comment} onChange={(e) => setComment(e.target.value)} rows={2} style={{ flex: 1 }} />
          <button className="btn btn-primary" disabled={!comment.trim() || addingComment} onClick={handleAddComment} style={{ alignSelf: 'flex-end' }}>
            {addingComment ? <span className="spinner" /> : 'Add'}
          </button>
        </div>
      </div>

      {/* Existing comments */}
      {complaint.comments?.length > 0 && (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.75rem' }}>Comments ({complaint.comments.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {complaint.comments.map((c, i) => (
              <div key={i} style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius)', padding: '0.875rem 1rem', borderLeft: '3px solid var(--primary)' }}>
                <p style={{ fontSize: '0.9375rem', color: 'var(--gray-700)', marginBottom: '0.375rem' }}>{c.text}</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--gray-400)' }}>{c.adminName} · {formatDate(c.timestamp)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status History */}
      {complaint.statusHistory?.length > 0 && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem' }}>Status History</h2>
          <div className="timeline">
            {complaint.statusHistory.map((entry, i) => (
              <div key={i} className="timeline-item">
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '0.3rem' }}>
                  <div className="timeline-dot" />
                  {i < complaint.statusHistory.length - 1 && <div className="timeline-line" />}
                </div>
                <div className="timeline-content">
                  <div className="timeline-title">
                    <StatusBadge status={entry.newStatus} />
                    {entry.oldStatus && <span style={{ fontSize: '0.8125rem', color: 'var(--gray-400)', marginLeft: '0.5rem' }}>← {entry.oldStatus}</span>}
                    {entry.adminId && <span style={{ fontSize: '0.8125rem', color: 'var(--gray-400)', marginLeft: '0.5rem' }}>by {entry.adminId}</span>}
                  </div>
                  <div className="timeline-time">{formatDate(entry.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
