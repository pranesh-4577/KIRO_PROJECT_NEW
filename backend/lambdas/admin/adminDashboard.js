'use strict'

const { verifyToken, extractUserFromPayload } = require('../../services/authService')
const { getAllComplaints } = require('../../services/dynamoService')
const response = require('../../utils/response')
const logger = require('../../utils/logger')

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return response.options()

  try {
    const authHeader = event.headers?.Authorization || event.headers?.authorization
    const payload = await verifyToken(authHeader)
    const user = extractUserFromPayload(payload)

    if (user.role !== 'admin') return response.forbidden('Admin access required')

    const complaints = await getAllComplaints()

    // Status counts
    const byStatus = { PENDING: 0, ASSIGNED: 0, IN_PROGRESS: 0, RESOLVED: 0, REJECTED: 0 }
    const byCategory = {}
    const byBuilding = {}
    const monthlyMap = {}
    let resolvedCount = 0
    let totalResolutionMs = 0
    let highPriority = 0

    const currentYear = new Date().getFullYear()

    for (const c of complaints) {
      // Status
      if (byStatus[c.status] !== undefined) byStatus[c.status]++

      // Category
      byCategory[c.category] = (byCategory[c.category] || 0) + 1

      // Building
      if (c.building) byBuilding[c.building] = (byBuilding[c.building] || 0) + 1

      // Monthly
      const d = new Date(c.createdAt)
      if (d.getFullYear() === currentYear) {
        const monthLabel = d.toLocaleString('en-US', { month: 'short' })
        monthlyMap[monthLabel] = (monthlyMap[monthLabel] || 0) + 1
      }

      // High/Critical priority
      if (c.priority === 'High' || c.priority === 'Critical') highPriority++

      // Resolution time
      if (c.status === 'RESOLVED' && c.resolvedAt && c.createdAt) {
        const ms = new Date(c.resolvedAt) - new Date(c.createdAt)
        if (ms > 0) { totalResolutionMs += ms; resolvedCount++ }
      }
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthly = months.map((m) => ({ month: m, count: monthlyMap[m] || 0 }))

    const avgResolutionHours = resolvedCount > 0
      ? Math.round(totalResolutionMs / resolvedCount / 3600000 * 10) / 10
      : null

    const stats = {
      total: complaints.length,
      byStatus,
      byCategory,
      byBuilding,
      monthly,
      highPriority,
      avgResolutionHours,
    }

    logger.info('ADMIN_DASHBOARD', { adminId: user.userId, total: complaints.length })
    return response.success(stats)
  } catch (err) {
    if (err.message === 'Unauthorized' || err.name === 'JwtVerificationFailed') {
      return response.unauthorized()
    }
    logger.error('ADMIN_DASHBOARD', err)
    return response.error('Failed to load dashboard')
  }
}
