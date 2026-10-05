import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Mail, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Alert from '../../components/common/Alert'

export default function VerifyEmail() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { confirmRegistration, resendConfirmationCode } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''

  const handleVerify = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await confirmRegistration(email, code)
      navigate('/login', { state: { message: 'Email verified! You can now sign in.' } })
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      await resendConfirmationCode(email)
      setSuccess('A new verification code has been sent to your email.')
    } catch (err) {
      setError(err.message)
    } finally {
      setResending(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #7c3aed 100%)', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '3.5rem', height: '3.5rem', background: 'var(--primary-light)', borderRadius: '1rem', marginBottom: '1rem' }}>
            <Mail size={28} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Verify Your Email</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '1.5rem' }}>
            We've sent a 6-digit code to <strong>{email}</strong>. Enter it below to verify your account.
          </p>

          <Alert type="error" message={error} onClose={() => setError('')} />
          <Alert type="success" message={success} onClose={() => setSuccess('')} />

          <form onSubmit={handleVerify} style={{ marginTop: '1rem' }}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label htmlFor="code" className="required">Verification Code</label>
              <input
                id="code" type="text" placeholder="123456" value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required maxLength={6} style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading || code.length < 6} style={{ width: '100%' }}>
              {loading ? <><span className="spinner" /> Verifying…</> : <><CheckCircle size={18} /> Verify Email</>}
            </button>
          </form>

          <p style={{ marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--gray-500)' }}>
            Didn't receive the code?{' '}
            <button onClick={handleResend} disabled={resending} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>
              {resending ? 'Resending…' : 'Resend code'}
            </button>
          </p>
          <p style={{ marginTop: '0.75rem', fontSize: '0.8125rem' }}>
            <Link to="/login">← Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
