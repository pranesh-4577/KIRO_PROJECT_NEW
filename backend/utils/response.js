'use strict'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Content-Type': 'application/json',
}

/**
 * Creates a standardised API Gateway response envelope.
 */
const response = {
  success: (data, statusCode = 200) => ({
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify({ success: true, data }),
  }),

  created: (data) => response.success(data, 201),

  error: (message, statusCode = 500, details = null) => ({
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify({ success: false, message, ...(details && { details }) }),
  }),

  badRequest: (message, details = null) => response.error(message, 400, details),
  unauthorized: (message = 'Unauthorized') => response.error(message, 401),
  forbidden: (message = 'Forbidden') => response.error(message, 403),
  notFound: (message = 'Not found') => response.error(message, 404),
  methodNotAllowed: () => response.error('Method not allowed', 405),

  options: () => ({
    statusCode: 200,
    headers: CORS_HEADERS,
    body: '',
  }),
}

module.exports = response
