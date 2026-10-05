'use strict'

const VALID_CATEGORIES = ['Electrical', 'Plumbing', 'Internet/Wi-Fi', 'Classroom', 'Hostel', 'Cleaning', 'Security', 'Other']
const VALID_PRIORITIES  = ['Low', 'Medium', 'High', 'Critical']
const VALID_STATUSES    = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']

const STATUS_TRANSITIONS = {
  PENDING:     ['ASSIGNED', 'REJECTED'],
  ASSIGNED:    ['IN_PROGRESS', 'REJECTED'],
  IN_PROGRESS: ['RESOLVED', 'REJECTED'],
  RESOLVED:    [],
  REJECTED:    [],
}

function validateComplaintBody(body) {
  const errors = {}
  if (!body.title?.trim())       errors.title       = 'Title is required.'
  if (!body.description?.trim()) errors.description = 'Description is required.'
  if (!body.building?.trim())    errors.building    = 'Building is required.'
  if (!body.category)            errors.category    = 'Category is required.'
  else if (!VALID_CATEGORIES.includes(body.category)) errors.category = `Invalid category.`
  if (!body.priority)            errors.priority    = 'Priority is required.'
  else if (!VALID_PRIORITIES.includes(body.priority)) errors.priority = `Invalid priority.`
  return errors
}

function validateStatusTransition(currentStatus, newStatus) {
  if (!VALID_STATUSES.includes(newStatus)) {
    return `Invalid status: ${newStatus}`
  }
  const allowed = STATUS_TRANSITIONS[currentStatus] || []
  if (!allowed.includes(newStatus)) {
    return `Cannot transition from ${currentStatus} to ${newStatus}. Allowed: ${allowed.join(', ') || 'none'}.`
  }
  return null
}

module.exports = { validateComplaintBody, validateStatusTransition, VALID_CATEGORIES, VALID_PRIORITIES, VALID_STATUSES }
