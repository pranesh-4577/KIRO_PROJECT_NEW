import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { KeyRound, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Alert from '../../components/common/Alert'

export default function ForgotPassword() {
  const [step, setStep] = useState(1) // 1=email, 2=code+new password
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { forgotPassword, confirmForgotPassword } = useAuth()
  const navigate = useNavigate()

  const handleRequestCode = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await forgotPassword(email)
      setStep(2)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return }
    setError('')
    setLoading(true)
    try {
      await confirmForgotPassword(email, code, newPassword)
      navigate('/login', { state: { message: 'Password reset successfully. Please sign in.' } })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #7c3aed 100%)', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '3.5rem', height: '3.5rem', background: 'var(--primary-light)', borderRadius: '1rem', margin: '0 auto 1rem', marginBottom: '1rem' }}>
            <KeyRound size={28} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.5rem' }}>Reset Password</h2>

          {step === 1 ? (
            <>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', textAlign: 'center', marginBottom: '1.5rem' }}>
                Enter your email and we'll send you a reset code.
              </p>
              <Alert type="error" message={error} onClose={() => setError('')} />
              <form onSubmit={handleRequestCode} style={{ marginTop: '1rem' }}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label htmlFor="email" className="required">Email Address</label>
                  <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="your@email.com" />
                </div>
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
                  {loading ? <><span className="spinner" /> Sending…</> : 'Send Reset Code'}
                </button>
              </form>
            </>
          ) : (
            <>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', textAlign: 'center', marginBottom: '1.5rem' }}>
                Enter the code sent to <strong>{email}</strong> and your new password.
              </p>
              <Alert type="error" message={error} onClose={() => setError('')} />
              <form onSubmit={handleResetPassword} style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="required">Reset Code</label>
                  <input type="text" value={code} onChange={(e) => setCode(e.target.value)} required placeholder="6-digit code" />
                </div>
                <div className="form-group">
                  <label className="required">New Password</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="New password" />
                </div>
                <div className="form-group">
                  <label className="required">Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="Confirm password" />
                </div>
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
                  {loading ? <><span className="spinner" /> Resetting…</> : 'Reset Password'}
                </button>
              </form>
            </>
          )}

          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem' }}>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <ArrowLeft size={14} /> Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
