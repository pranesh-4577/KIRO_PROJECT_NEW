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
    const currentYear = new Date().getFullYear()

    const byCategory = {}
    const byBuilding = {}
    const byPriority = { Low: 0, Medium: 0, High: 0, Critical: 0 }
    const monthlyMap = {}
    const categoryResolutionMs = {}
    const categoryResolutionCount = {}

    for (const c of complaints) {
      byCategory[c.category] = (byCategory[c.category] || 0) + 1
      if (c.building) byBuilding[c.building] = (byBuilding[c.building] || 0) + 1
      if (byPriority[c.priority] !== undefined) byPriority[c.priority]++

      const d = new Date(c.createdAt)
      if (d.getFullYear() === currentYear) {
        const monthLabel = d.toLocaleString('en-US', { month: 'short' })
        monthlyMap[monthLabel] = (monthlyMap[monthLabel] || 0) + 1
      }

      if (c.status === 'RESOLVED' && c.resolvedAt && c.createdAt) {
        const ms = new Date(c.resolvedAt) - new Date(c.createdAt)
        if (ms > 0 && c.category) {
          categoryResolutionMs[c.category] = (categoryResolutionMs[c.category] || 0) + ms
          categoryResolutionCount[c.category] = (categoryResolutionCount[c.category] || 0) + 1
        }
      }
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthly = months.map((m) => ({ month: m, count: monthlyMap[m] || 0 }))

    const avgResolutionByCategory = {}
    for (const [cat, totalMs] of Object.entries(categoryResolutionMs)) {
      avgResolutionByCategory[cat] = (totalMs / categoryResolutionCount[cat] / 3600000).toFixed(1)
    }

    logger.info('ADMIN_ANALYTICS', { adminId: user.userId })
    return response.success({ byCategory, byBuilding, byPriority, monthly, avgResolutionByCategory })
  } catch (err) {
    if (err.message === 'Unauthorized' || err.name === 'JwtVerificationFailed') {
      return response.unauthorized()
    }
    logger.error('ADMIN_ANALYTICS', err)
    return response.error('Failed to load analytics')
  }
}
