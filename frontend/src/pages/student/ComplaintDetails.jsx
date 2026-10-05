import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Calendar, Clock, MessageSquare, Image as ImageIcon } from 'lucide-react'
import { getComplaintById } from '../../api/complaintsApi'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import PriorityBadge from '../../components/common/PriorityBadge'
import Alert from '../../components/common/Alert'
import { formatDate, getCategoryIcon } from '../../utils/helpers'

export default function ComplaintDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getComplaintById(id)
      .then((res) => setComplaint(res.data))
      .catch((err) => setError(err.message || 'Complaint not found.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <LoadingSpinner fullPage />
  if (error) return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <Alert type="error" message={error} />
      <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={() => navigate('/complaints')}>
        <ArrowLeft size={16} /> Back to My Complaints
      </button>
    </div>
  )
  if (!complaint) return null

  return (
    <div style={{ maxWidth: 780, margin: '0 auto' }}>
      <button className="btn btn-secondary btn-sm" style={{ marginBottom: '1rem' }} onClick={() => navigate('/complaints')}>
        <ArrowLeft size={16} /> Back
      </button>

      {/* Header card */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <span className="complaint-id" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>{complaint.complaintId}</span>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>{complaint.title}</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
              {getCategoryIcon(complaint.category)} {complaint.category}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <PriorityBadge priority={complaint.priority} />
            <StatusBadge status={complaint.status} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.875rem', padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)' }}>
            <MapPin size={15} /> <span>{complaint.building}{complaint.floor ? `, ${complaint.floor}` : ''}{complaint.roomNumber ? `, Room ${complaint.roomNumber}` : ''}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)' }}>
            <Calendar size={15} /> <span>Submitted: {formatDate(complaint.createdAt)}</span>
          </div>
          {complaint.updatedAt && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)' }}>
              <Clock size={15} /> <span>Updated: {formatDate(complaint.updatedAt)}</span>
            </div>
          )}
          {complaint.assignedToName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)' }}>
              <span>👷 Assigned to: <strong>{complaint.assignedToName}</strong></span>
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

      {/* Admin Comments */}
      {complaint.comments?.length > 0 && (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={16} /> Admin Updates ({complaint.comments.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {complaint.comments.map((comment, i) => (
              <div key={i} style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius)', padding: '0.875rem 1rem', borderLeft: '3px solid var(--primary)' }}>
                <p style={{ fontSize: '0.9375rem', color: 'var(--gray-700)', marginBottom: '0.375rem' }}>{comment.text}</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--gray-400)' }}>
                  {comment.adminName} · {formatDate(comment.timestamp)}
                </p>
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
