'use strict'

const { verifyToken, extractUserFromPayload } = require('../../services/authService')
const { getAllComplaints, getComplaintById } = require('../../services/dynamoService')
const { getPresignedUrl } = require('../../services/s3Service')
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
    const query = event.queryStringParameters || {}

    if (complaintId) {
      const complaint = await getComplaintById(complaintId)
      if (!complaint) return response.notFound('Complaint not found')
      if (complaint.imageKey) {
        complaint.imageUrl = await getPresignedUrl(complaint.imageKey)
      }
      return response.success(complaint)
    }

    const complaints = await getAllComplaints({
      status: query.status,
      category: query.category,
      priority: query.priority,
      building: query.building,
      search: query.search,
    })

    logger.info('ADMIN_GET_COMPLAINTS', { adminId: user.userId, count: complaints.length })
    return response.success(complaints)
  } catch (err) {
    if (err.message === 'Unauthorized' || err.name === 'JwtVerificationFailed') {
      return response.unauthorized()
    }
    logger.error('ADMIN_GET_COMPLAINTS', err)
    return response.error('Failed to retrieve complaints')
  }
}
