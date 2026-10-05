import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, X, Sparkles, Send, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { submitComplaint, classifyComplaint } from '../../api/complaintsApi'
import Alert from '../../components/common/Alert'
import { COMPLAINT_CATEGORIES, COMPLAINT_PRIORITIES, BUILDINGS, FLOORS } from '../../utils/constants'
import { validateImageFile } from '../../utils/helpers'

const AI_ENABLED = import.meta.env.VITE_AI_CLASSIFIER_ENABLED === 'true'

export default function SubmitComplaint() {
  const navigate = useNavigate()
  const fileInputRef = useRef()
  const [form, setForm] = useState({
    title: '', description: '', category: '', priority: 'Medium',
    building: '', floor: '', roomNumber: '',
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [classifying, setClassifying] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitted, setSubmitted] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required.'
    if (!form.description.trim()) e.description = 'Description is required.'
    if (!form.category) e.category = 'Please select a category.'
    if (!form.priority) e.priority = 'Please select a priority.'
    if (!form.building) e.building = 'Please select a building.'
    return e
  }

  const handleImageChange = (file) => {
    if (!file) return
    const err = validateImageFile(file)
    if (err) { toast.error(err); return }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    handleImageChange(file)
  }

  const handleAIClassify = async () => {
    if (!form.description.trim()) { toast.error('Enter a description first.'); return }
    setClassifying(true)
    try {
      const res = await classifyComplaint(form.description)
      const suggestion = res.data
      if (suggestion.category) set('category', suggestion.category)
      if (suggestion.priority) set('priority', suggestion.priority)
      toast.success('AI suggestion applied. Review and modify as needed.')
    } catch {
      toast.error('AI classification unavailable. Please fill in manually.')
    } finally {
      setClassifying(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setSubmitError('')
    setSubmitting(true)
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([k, v]) => formData.append(k, v))
      if (imageFile) formData.append('image', imageFile)

      const res = await submitComplaint(formData)
      setSubmitted(res.data)
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit complaint. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '4rem', height: '4rem', background: 'var(--status-resolved-bg)', borderRadius: '50%', marginBottom: '1.25rem' }}>
            <CheckCircle size={32} color="var(--status-resolved)" />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Complaint Submitted!</h2>
          <p style={{ color: 'var(--gray-500)', marginBottom: '1.25rem' }}>
            Your complaint has been successfully submitted. You'll receive an email confirmation shortly.
          </p>
          <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>Your Complaint ID</div>
            <div className="complaint-id" style={{ fontSize: '1.25rem', padding: '0.5rem 1rem' }}>{submitted.complaintId}</div>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '1.5rem' }}>Save this ID to track your complaint status.</p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/complaints')}>View My Complaints</button>
            <button className="btn btn-secondary" onClick={() => { setSubmitted(null); setForm({ title: '', description: '', category: '', priority: 'Medium', building: '', floor: '', roomNumber: '' }); setImageFile(null); setImagePreview(null) }}>Submit Another</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Submit a Complaint</h1>
          <p className="page-subtitle">Fill in the details about the campus issue you want to report.</p>
        </div>
      </div>

      <Alert type="error" message={submitError} onClose={() => setSubmitError('')} />

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ padding: '1.75rem', marginTop: submitError ? '1rem' : 0 }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--gray-700)' }}>
            Complaint Details
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Title */}
            <div className="form-group">
              <label htmlFor="title" className="required">Complaint Title</label>
              <input id="title" type="text" placeholder="Brief summary of the issue" value={form.title} onChange={(e) => set('title', e.target.value)} className={errors.title ? 'input-error' : ''} />
              {errors.title && <span className="field-error">{errors.title}</span>}
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="description" className="required">Description</label>
              <textarea id="description" placeholder="Describe the issue in detail..." value={form.description} onChange={(e) => set('description', e.target.value)} rows={4} className={errors.description ? 'input-error' : ''} />
              {errors.description && <span className="field-error">{errors.description}</span>}
              {AI_ENABLED && (
                <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }} onClick={handleAIClassify} disabled={classifying}>
                  {classifying ? <><span className="spinner" /> Analyzing…</> : <><Sparkles size={14} /> AI Suggest Category & Priority</>}
                </button>
              )}
            </div>

            {/* Category + Priority */}
            <div className="grid-2">
              <div className="form-group">
                <label htmlFor="category" className="required">Category</label>
                <select id="category" value={form.category} onChange={(e) => set('category', e.target.value)} className={errors.category ? 'input-error' : ''}>
                  <option value="">Select category</option>
                  {COMPLAINT_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                  ))}
                </select>
                {errors.category && <span className="field-error">{errors.category}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="priority" className="required">Priority</label>
                <select id="priority" value={form.priority} onChange={(e) => set('priority', e.target.value)}>
                  {COMPLAINT_PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card" style={{ padding: '1.75rem', marginTop: '1rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--gray-700)' }}>Location</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="grid-2">
              <div className="form-group">
                <label htmlFor="building" className="required">Building</label>
                <select id="building" value={form.building} onChange={(e) => set('building', e.target.value)} className={errors.building ? 'input-error' : ''}>
                  <option value="">Select building</option>
                  {BUILDINGS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                {errors.building && <span className="field-error">{errors.building}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="floor">Floor</label>
                <select id="floor" value={form.floor} onChange={(e) => set('floor', e.target.value)}>
                  <option value="">Select floor</option>
                  {FLOORS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group" style={{ maxWidth: 240 }}>
              <label htmlFor="roomNumber">Room Number</label>
              <input id="roomNumber" type="text" placeholder="e.g. 204, Lab 3" value={form.roomNumber} onChange={(e) => set('roomNumber', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Image upload */}
        <div className="card" style={{ padding: '1.75rem', marginTop: '1rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--gray-700)' }}>
            Attach Image <span style={{ fontWeight: 400, color: 'var(--gray-400)', fontSize: '0.8125rem' }}>(Optional)</span>
          </h3>

          {imagePreview ? (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img src={imagePreview} alt="Preview" className="image-preview" style={{ maxHeight: 240, display: 'block' }} />
              <button type="button" onClick={() => { setImageFile(null); setImagePreview(null) }}
                style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '1.75rem', height: '1.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={14} />
              </button>
            </div>
          ) : (
            <div
              className={`image-upload-area ${dragOver ? 'dragover' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <Upload size={32} style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontWeight: 500 }}>Click to upload or drag and drop</p>
              <p style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>JPEG, PNG, or WebP — max 5 MB</p>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={(e) => handleImageChange(e.target.files[0])} />
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button type="button" className="btn btn-secondary btn-lg" onClick={() => navigate('/complaints')}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
            {submitting ? <><span className="spinner" /> Submitting…</> : <><Send size={18} /> Submit Complaint</>}
          </button>
        </div>
      </form>
    </div>
  )
}
