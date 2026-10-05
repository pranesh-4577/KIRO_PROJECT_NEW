import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, ShieldCheck, LogIn } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Alert from '../../components/common/Alert'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await login(form.email, form.password)
      if (result.nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
        navigate('/verify-email', { state: { email: form.email } })
        return
      }
      // Role-based redirect
      // isAdmin is updated after loadUser — read from token directly
      const { fetchAuthSession } = await import('aws-amplify/auth')
      const session = await fetchAuthSession()
      const groups = session?.tokens?.accessToken?.payload?.['cognito:groups'] || []
      const role = groups.includes('admin') ? 'admin' : 'student'
      navigate(from || (role === 'admin' ? '/admin/dashboard' : '/dashboard'))
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #7c3aed 100%)', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '3.5rem', height: '3.5rem', background: 'rgba(255,255,255,0.15)', borderRadius: '1rem', backdropFilter: 'blur(10px)', marginBottom: '1rem' }}>
            <ShieldCheck size={28} color="#fff" />
          </div>
          <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700 }}>Smart Campus</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Complaint & Service Management</p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Welcome back</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '1.5rem' }}>Sign in to your account to continue</p>

          <Alert type="error" message={error} onClose={() => setError('')} />

          <form onSubmit={handleSubmit} style={{ marginTop: error ? '1rem' : 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="email" className="required">Email Address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="student@college.edu"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="required">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Your password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    autoComplete="current-password"
                    style={{ paddingRight: '2.75rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <Link to="/forgot-password" style={{ fontSize: '0.8125rem' }}>Forgot password?</Link>
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: '0.25rem' }}>
                {loading ? <><span className="spinner" /> Signing in…</> : <><LogIn size={18} /> Sign In</>}
              </button>
            </div>
          </form>

          <div className="divider" />
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 600 }}>Create one</Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)' }}>
          © 2026 Smart Campus System. All rights reserved.
        </p>
      </div>
    </div>
  )
}
