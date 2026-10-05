import React from 'react'

export default function LoadingSpinner({ text = 'Loading…', fullPage = false }) {
  if (fullPage) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', flexDirection: 'column', gap: '1rem',
        color: 'var(--gray-500)'
      }}>
        <span className="spinner" style={{ width: '2rem', height: '2rem' }} />
        <p style={{ fontSize: '0.9375rem' }}>{text}</p>
      </div>
    )
  }
  return (
    <div className="loading-overlay">
      <span className="spinner" />
      <span style={{ fontSize: '0.9375rem', color: 'var(--gray-500)' }}>{text}</span>
    </div>
  )
}
