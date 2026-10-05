'use strict'

const { verifyToken, extractUserFromPayload } = require('../../services/authService')
const { getComplaintById, updateComplaint, appendToListAttribute } = require('../../services/dynamoService')
const {
  sendStatusChangeNotification,
  sendResolutionNotification,
  sendRejectionNotification,
} = require('../../services/sesService')
const { validateStatusTransition } = require('../../utils/validate')
const response = require('../../utils/response')
const logger = require('../../utils/logger')

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return response.options()

  try {
    const authHeader = event.headers?.Authorization || event.headers?.authorization
    const payload = await verifyToken(authHeader)
    const user = extractUserFromPayload(payload)

    if (user.role !== 'admin') return response.forbidden('Admin access required')

    const complaintId = event.pathParameters?.id
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body
    const { status: newStatus, comment } = body || {}

    if (!newStatus) return response.badRequest('New status is required')

    const complaint = await getComplaintById(complaintId)
    if (!complaint) return response.notFound('Complaint not found')

    const transitionError = validateStatusTransition(complaint.status, newStatus)
    if (transitionError) return response.badRequest(transitionError)

    const oldStatus = complaint.status
    const now = new Date().toISOString()

    const updates = {
      status: newStatus,
      updatedAt: now,
    }
    if (newStatus === 'RESOLVED' || newStatus === 'REJECTED') {
      updates.resolvedAt = now
    }

    // Update status
    await updateComplaint(complaintId, updates)

    // Append to status history
    await appendToListAttribute(complaintId, 'statusHistory', {
      oldStatus,
      newStatus,
      timestamp: now,
      adminId: user.userId,
      adminName: user.name,
    })

    // Append comment if provided
    if (comment?.trim()) {
      await appendToListAttribute(complaintId, 'comments', {
        text: comment.trim(),
        adminId: user.userId,
        adminName: user.name,
        timestamp: now,
      })
    }

    // Send email notifications (non-blocking)
    const updatedComplaint = { ...complaint, status: newStatus }
    if (newStatus === 'RESOLVED') {
      sendResolutionNotification(complaint.studentEmail, updatedComplaint, comment).catch(() => {})
    } else if (newStatus === 'REJECTED') {
      sendRejectionNotification(complaint.studentEmail, updatedComplaint, comment).catch(() => {})
    } else {
      sendStatusChangeNotification(complaint.studentEmail, updatedComplaint, oldStatus, newStatus).catch(() => {})
    }

    logger.info('ADMIN_UPDATE_STATUS', { complaintId, oldStatus, newStatus, adminId: user.userId })
    return response.success({ complaintId, status: newStatus, updatedAt: now })
  } catch (err) {
    if (err.message === 'Unauthorized' || err.name === 'JwtVerificationFailed') {
      return response.unauthorized()
    }
    logger.error('ADMIN_UPDATE_STATUS', err)
    return response.error('Failed to update complaint status')
  }
}
