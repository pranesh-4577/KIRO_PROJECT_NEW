'use strict'

const { verifyToken, extractUserFromPayload } = require('../../services/authService')
const { getComplaintById, appendToListAttribute } = require('../../services/dynamoService')
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
    const { comment } = body || {}

    if (!comment?.trim()) return response.badRequest('Comment text is required')

    const complaint = await getComplaintById(complaintId)
    if (!complaint) return response.notFound('Complaint not found')

    const now = new Date().toISOString()
    const commentEntry = {
      text: comment.trim(),
      adminId: user.userId,
      adminName: user.name,
      timestamp: now,
    }

    await appendToListAttribute(complaintId, 'comments', commentEntry)

    logger.info('ADMIN_ADD_COMMENT', { complaintId, adminId: user.userId })
    return response.success({ complaintId, comment: commentEntry })
  } catch (err) {
    if (err.message === 'Unauthorized' || err.name === 'JwtVerificationFailed') {
      return response.unauthorized()
    }
    logger.error('ADMIN_ADD_COMMENT', err)
    return response.error('Failed to add comment')
  }
}
