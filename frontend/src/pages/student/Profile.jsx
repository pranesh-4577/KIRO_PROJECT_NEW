import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { User, Mail, ShieldCheck } from 'lucide-react'
import { getInitials } from '../../utils/helpers'

export default function Profile() {
  const { userAttributes, userRole } = useAuth()
  const name = userAttributes?.name || 'Unknown'
  const email = userAttributes?.email || ''

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
      </div>

      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ width: '5rem', height: '5rem', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, margin: '0 auto 1.25rem' }}>
          {getInitials(name)}
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{name}</h2>
        <span className={`badge ${userRole === 'admin' ? 'badge-resolved' : 'badge-assigned'}`} style={{ marginTop: '0.5rem' }}>
          {userRole === 'admin' ? 'Administrator' : 'Student'}
        </span>

        <div className="divider" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)' }}>
            <User size={18} color="var(--gray-400)" />
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--gray-400)' }}>Full Name</div>
              <div style={{ fontWeight: 500 }}>{name}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)' }}>
            <Mail size={18} color="var(--gray-400)" />
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--gray-400)' }}>Email</div>
              <div style={{ fontWeight: 500 }}>{email}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)' }}>
            <ShieldCheck size={18} color="var(--gray-400)" />
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--gray-400)' }}>Role</div>
              <div style={{ fontWeight: 500, textTransform: 'capitalize' }}>{userRole || 'Student'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
