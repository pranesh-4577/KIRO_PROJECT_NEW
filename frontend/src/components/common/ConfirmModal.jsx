import React from 'react'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', danger = false }) {
  if (!isOpen) return null
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }}>
      <div className="card" style={{ maxWidth: 420, width: '100%', padding: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <AlertTriangle size={24} color={danger ? '#ef4444' : '#f59e0b'} style={{ flexShrink: 0 }} />
          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.375rem' }}>{title}</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>{message}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
