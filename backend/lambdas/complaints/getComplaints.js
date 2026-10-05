'use strict'

const { verifyToken, extractUserFromPayload } = require('../../services/authService')
const { getComplaintsByStudent, getComplaintById } = require('../../services/dynamoService')
const { getPresignedUrl } = require('../../services/s3Service')
const response = require('../../utils/response')
const logger = require('../../utils/logger')

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return response.options()

  try {
    const authHeader = event.headers?.Authorization || event.headers?.authorization
    const payload = await verifyToken(authHeader)
    const user = extractUserFromPayload(payload)

    if (user.role !== 'student') return response.forbidden()

    const complaintId = event.pathParameters?.id
    const query = event.queryStringParameters || {}

    if (complaintId) {
      // Get specific complaint
      const complaint = await getComplaintById(complaintId)
      if (!complaint) return response.notFound('Complaint not found')
      if (complaint.studentId !== user.userId) return response.forbidden()

      // Attach pre-signed image URL if image exists
      if (complaint.imageKey) {
        complaint.imageUrl = await getPresignedUrl(complaint.imageKey)
      }

      return response.success(complaint)
    }

    // List student's complaints
    let complaints = await getComplaintsByStudent(user.userId)

    // Client-side search filter (search by ID or title)
    if (query.search) {
      const s = query.search.toLowerCase()
      complaints = complaints.filter((c) =>
        c.complaintId?.toLowerCase().includes(s) || c.title?.toLowerCase().includes(s)
      )
    }
    if (query.status) complaints = complaints.filter((c) => c.status === query.status)
    if (query.category) complaints = complaints.filter((c) => c.category === query.category)

    logger.info('GET_COMPLAINTS', { studentId: user.userId, count: complaints.length })
    return response.success(complaints)
  } catch (err) {
    if (err.message === 'Unauthorized' || err.name === 'JwtVerificationFailed') {
      return response.unauthorized()
    }
    logger.error('GET_COMPLAINTS', err)
    return response.error('Failed to retrieve complaints')
  }
}
