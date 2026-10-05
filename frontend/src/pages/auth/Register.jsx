import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ShieldCheck, UserPlus } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Alert from '../../components/common/Alert'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const validate = () => {
    if (!form.name.trim()) return 'Full name is required.'
    if (!form.email.trim()) return 'Email is required.'
    if (form.password.length < 8) return 'Password must be at least 8 characters.'
    if (!/[A-Z]/.test(form.password)) return 'Password must contain at least one uppercase letter.'
    if (!/[0-9]/.test(form.password)) return 'Password must contain at least one number.'
    if (form.password !== form.confirmPassword) return 'Passwords do not match.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }
    setError('')
    setLoading(true)
    try {
      await register(form.email, form.password, form.name)
      navigate('/verify-email', { state: { email: form.email } })
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #7c3aed 100%)', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '3.5rem', height: '3.5rem', background: 'rgba(255,255,255,0.15)', borderRadius: '1rem', backdropFilter: 'blur(10px)', marginBottom: '1rem' }}>
            <ShieldCheck size={28} color="#fff" />
          </div>
          <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700 }}>Smart Campus</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Create your student account</p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Create Account</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '1.5rem' }}>Register to report campus issues</p>

          <Alert type="error" message={error} onClose={() => setError('')} />

          <form onSubmit={handleSubmit} style={{ marginTop: error ? '1rem' : 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="name" className="required">Full Name</label>
                <input id="name" type="text" placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="required">College Email</label>
                <input id="email" type="email" placeholder="student@college.edu" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="required">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password" type={showPassword ? 'text' : 'password'}
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required style={{ paddingRight: '2.75rem' }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="required">Confirm Password</label>
                <input id="confirmPassword" type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: '0.25rem' }}>
                {loading ? <><span className="spinner" /> Creating account…</> : <><UserPlus size={18} /> Create Account</>}
              </button>
            </div>
          </form>

          <div className="divider" />
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
            Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
