'use strict'

const { verifyToken, extractUserFromPayload } = require('../../services/authService')
const { getComplaintById, updateComplaint, appendToListAttribute } = require('../../services/dynamoService')
const { sendAssignmentNotification, sendStatusChangeNotification } = require('../../services/sesService')
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
    const { assignedTo, assignedToName } = body || {}

    if (!assignedTo) return response.badRequest('assignedTo is required')

    const complaint = await getComplaintById(complaintId)
    if (!complaint) return response.notFound('Complaint not found')

    // Assigning moves status to ASSIGNED
    const oldStatus = complaint.status
    const transitionError = validateStatusTransition(oldStatus, 'ASSIGNED')
    if (transitionError) return response.badRequest(transitionError)

    const now = new Date().toISOString()

    await updateComplaint(complaintId, {
      status: 'ASSIGNED',
      assignedTo,
      assignedToName: assignedToName || assignedTo,
      updatedAt: now,
    })

    await appendToListAttribute(complaintId, 'statusHistory', {
      oldStatus,
      newStatus: 'ASSIGNED',
      timestamp: now,
      adminId: user.userId,
      adminName: user.name,
    })

    const updatedComplaint = { ...complaint, status: 'ASSIGNED' }
    sendAssignmentNotification(complaint.studentEmail, updatedComplaint, assignedToName || assignedTo).catch(() => {})

    logger.info('ADMIN_ASSIGN', { complaintId, assignedTo, adminId: user.userId })
    return response.success({ complaintId, status: 'ASSIGNED', assignedTo, updatedAt: now })
  } catch (err) {
    if (err.message === 'Unauthorized' || err.name === 'JwtVerificationFailed') {
      return response.unauthorized()
    }
    logger.error('ADMIN_ASSIGN', err)
    return response.error('Failed to assign complaint')
  }
}
