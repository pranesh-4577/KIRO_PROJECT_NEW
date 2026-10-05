'use strict'

const { v4: uuidv4 } = require('uuid')
const { verifyToken, extractUserFromPayload } = require('../../services/authService')
const { createComplaint, getNextComplaintNumber, generateComplaintId } = require('../../services/dynamoService')
const { uploadImage, validateImage } = require('../../services/s3Service')
const { sendSubmissionConfirmation } = require('../../services/sesService')
const { validateComplaintBody } = require('../../utils/validate')
const response = require('../../utils/response')
const logger = require('../../utils/logger')

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return response.options()

  try {
    // Auth
    const authHeader = event.headers?.Authorization || event.headers?.authorization
    const payload = await verifyToken(authHeader)
    const user = extractUserFromPayload(payload)

    // Parse body (supports both JSON and multipart via API Gateway)
    let body
    let imageBuffer = null
    let imageContentType = null

    const contentType = event.headers?.['Content-Type'] || event.headers?.['content-type'] || ''

    if (contentType.includes('multipart/form-data')) {
      // Multipart form data — parse using a simple approach
      // In production Lambda, use a multipart parser library
      // For now, parse base64-encoded body from API Gateway
      const parsed = parseMultipart(event.body, contentType, event.isBase64Encoded)
      body = parsed.fields
      if (parsed.file) {
        const validationError = validateImage(parsed.file.contentType, parsed.file.buffer.length)
        if (validationError) return response.badRequest(validationError)
        imageBuffer = parsed.file.buffer
        imageContentType = parsed.file.contentType
      }
    } else {
      body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body
    }

    // Validate
    const errors = validateComplaintBody(body)
    if (Object.keys(errors).length > 0) {
      return response.badRequest('Validation failed', errors)
    }

    // Generate complaint ID
    const year = new Date().getFullYear()
    const seqNumber = await getNextComplaintNumber(year)
    const complaintId = generateComplaintId(year, seqNumber)

    // Upload image if provided
    let imageKey = null
    if (imageBuffer) {
      imageKey = await uploadImage(complaintId, imageBuffer, imageContentType)
    }

    const now = new Date().toISOString()
    const complaint = {
      complaintId,
      studentId: user.userId,
      studentName: user.name,
      studentEmail: user.email,
      title: body.title.trim(),
      description: body.description.trim(),
      category: body.category,
      priority: body.priority,
      building: body.building || '',
      floor: body.floor || '',
      roomNumber: body.roomNumber || '',
      status: 'PENDING',
      imageKey: imageKey || null,
      comments: [],
      statusHistory: [{ oldStatus: null, newStatus: 'PENDING', timestamp: now, adminId: null }],
      createdAt: now,
      updatedAt: now,
    }

    await createComplaint(complaint)

    // Send confirmation email (non-blocking)
    sendSubmissionConfirmation(user.email, complaint).catch(() => {})

    logger.info('CREATE_COMPLAINT', { complaintId, studentId: user.userId })

    return response.created({ complaintId, status: 'PENDING', createdAt: now })
  } catch (err) {
    if (err.message === 'Unauthorized' || err.name === 'JwtVerificationFailed') {
      return response.unauthorized()
    }
    logger.error('CREATE_COMPLAINT', err)
    return response.error('Failed to create complaint')
  }
}

// Simple multipart parser for Lambda
function parseMultipart(body, contentType, isBase64) {
  const buf = isBase64 ? Buffer.from(body, 'base64') : Buffer.from(body || '', 'binary')
  const boundaryMatch = contentType.match(/boundary=(.+)/)
  if (!boundaryMatch) return { fields: {}, file: null }

  const boundary = '--' + boundaryMatch[1]
  const parts = buf.toString('binary').split(boundary).slice(1, -1)
  const fields = {}
  let file = null

  for (const part of parts) {
    const [headerSection, ...bodyParts] = part.split('\r\n\r\n')
    const bodyStr = bodyParts.join('\r\n\r\n').replace(/\r\n$/, '')
    const nameMatch = headerSection.match(/name="([^"]+)"/)
    const filenameMatch = headerSection.match(/filename="([^"]+)"/)
    const ctMatch = headerSection.match(/Content-Type:\s*([^\r\n]+)/)

    if (!nameMatch) continue

    if (filenameMatch && ctMatch) {
      file = {
        buffer: Buffer.from(bodyStr, 'binary'),
        contentType: ctMatch[1].trim(),
        filename: filenameMatch[1],
      }
    } else {
      fields[nameMatch[1]] = bodyStr
    }
  }

  return { fields, file }
}
