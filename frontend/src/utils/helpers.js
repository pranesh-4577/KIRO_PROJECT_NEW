import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { COMPLAINT_STATUSES, COMPLAINT_PRIORITIES } from './constants'

export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr)
    return format(d, 'dd MMM yyyy, hh:mm a')
  } catch {
    return dateStr
  }
}

export const formatDateShort = (dateStr) => {
  if (!dateStr) return '—'
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr)
    return format(d, 'dd MMM yyyy')
  } catch {
    return dateStr
  }
}

export const timeAgo = (dateStr) => {
  if (!dateStr) return ''
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr)
    return formatDistanceToNow(d, { addSuffix: true })
  } catch {
    return ''
  }
}

export const getStatusBadgeClass = (status) => {
  const map = {
    PENDING: 'badge-pending',
    ASSIGNED: 'badge-assigned',
    IN_PROGRESS: 'badge-inprogress',
    RESOLVED: 'badge-resolved',
    REJECTED: 'badge-rejected',
  }
  return `badge ${map[status] || 'badge-pending'}`
}

export const getStatusLabel = (status) => {
  return COMPLAINT_STATUSES.find((s) => s.value === status)?.label || status
}

export const getPriorityBadgeClass = (priority) => {
  const map = {
    Low: 'badge-low',
    Medium: 'badge-medium',
    High: 'badge-high',
    Critical: 'badge-critical',
  }
  return `badge ${map[priority] || 'badge-low'}`
}

export const getInitials = (name = '') => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  const maxSizeMB = 5
  if (!allowedTypes.includes(file.type)) {
    return 'Only JPEG, PNG, or WebP images are allowed.'
  }
  if (file.size > maxSizeMB * 1024 * 1024) {
    return `Image must be smaller than ${maxSizeMB} MB.`
  }
  return null
}

export const getCategoryIcon = (category) => {
  const map = {
    Electrical: '⚡',
    Plumbing: '🔧',
    'Internet/Wi-Fi': '📶',
    Classroom: '🏫',
    Hostel: '🏠',
    Cleaning: '🧹',
    Security: '🔒',
    Other: '📋',
  }
  return map[category] || '📋'
}

export const truncate = (str, maxLen = 60) => {
  if (!str) return ''
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str
}
