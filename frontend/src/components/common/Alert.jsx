import React from 'react'
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react'

const icons = {
  error: AlertCircle,
  success: CheckCircle,
  info: Info,
  warning: AlertTriangle,
}

export default function Alert({ type = 'info', message, onClose }) {
  if (!message) return null
  const Icon = icons[type]
  return (
    <div className={`alert alert-${type}`} role="alert">
      <Icon size={16} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', opacity: 0.7 }}
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
