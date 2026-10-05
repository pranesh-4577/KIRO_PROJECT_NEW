import apiClient from './apiClient'

// ---- Student Complaint APIs ----

export const submitComplaint = async (formData) => {
  // formData is a FormData object (supports file upload)
  const { fetchAuthSession } = await import('aws-amplify/auth')
  const session = await fetchAuthSession()
  const token = session?.tokens?.idToken?.toString()

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
  const response = await fetch(`${BASE_URL}/complaints`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.message || 'Failed to submit complaint')
  return data
}

export const getMyComplaints = (params = {}) =>
  apiClient.get('/complaints', { params })

export const getComplaintById = (id) =>
  apiClient.get(`/complaints/${id}`)

export const updateComplaint = (id, data) =>
  apiClient.put(`/complaints/${id}`, data)

export const deleteComplaint = (id) =>
  apiClient.delete(`/complaints/${id}`)

// ---- Admin Complaint APIs ----

export const adminGetComplaints = (params = {}) =>
  apiClient.get('/admin/complaints', { params })

export const adminGetComplaintById = (id) =>
  apiClient.get(`/admin/complaints/${id}`)

export const adminUpdateStatus = (id, status, comment = '') =>
  apiClient.put(`/admin/complaints/${id}/status`, { status, comment })

export const adminAssignComplaint = (id, assignedTo, assignedToName) =>
  apiClient.put(`/admin/complaints/${id}/assign`, { assignedTo, assignedToName })

export const adminAddComment = (id, comment) =>
  apiClient.post(`/admin/complaints/${id}/comment`, { comment })

// ---- Analytics & Dashboard ----

export const getDashboardStats = () =>
  apiClient.get('/admin/dashboard')

export const getAnalytics = () =>
  apiClient.get('/admin/analytics')

// ---- AI Classifier ----

export const classifyComplaint = (description) =>
  apiClient.post('/complaints/classify', { description })
