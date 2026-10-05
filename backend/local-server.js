'use strict'

/**
 * Local Express development server.
 * Simulates API Gateway routing and invokes Lambda handlers directly.
 * Run: node local-server.js (or npm start in backend/)
 */

require('dotenv').config()
const express = require('express')
const cors = require('cors')
const multer = require('multer')
const { checkEnvVars } = require('./utils/envCheck')
const logger = require('./utils/logger')

checkEnvVars()

const app = express()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json({ limit: '10mb' }))

// ---- Lambda adapter ----
// Converts Express req to API Gateway event format and calls the Lambda handler
async function invokeLambda(handler, req, res, pathParameters = {}) {
  const headers = {}
  Object.entries(req.headers).forEach(([k, v]) => { headers[k] = v })

  // Handle multipart for file uploads
  let body = req.body
  let isBase64Encoded = false

  if (req.file) {
    // Reconstruct a simple multipart body with the file
    const boundary = 'boundary123'
    headers['content-type'] = `multipart/form-data; boundary=${boundary}`
    const fields = Object.entries(req.body || {})
      .map(([k, v]) => `--${boundary}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}`)
      .join('\r\n')
    const fileHeader = `--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="${req.file.originalname}"\r\nContent-Type: ${req.file.mimetype}\r\n\r\n`
    const combined = Buffer.concat([
      Buffer.from(fields + '\r\n' + fileHeader, 'binary'),
      req.file.buffer,
      Buffer.from(`\r\n--${boundary}--`, 'binary'),
    ])
    body = combined.toString('base64')
    isBase64Encoded = true
  } else if (typeof body === 'object') {
    body = JSON.stringify(body)
  }

  const event = {
    httpMethod: req.method,
    path: req.path,
    pathParameters,
    queryStringParameters: Object.keys(req.query).length > 0 ? req.query : null,
    headers,
    body: body || null,
    isBase64Encoded,
  }

  try {
    const result = await handler(event)
    res.status(result.statusCode)
    Object.entries(result.headers || {}).forEach(([k, v]) => res.setHeader(k, v))
    res.send(result.body)
  } catch (err) {
    logger.error('LOCAL_SERVER', err)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

// ---- Import handlers ----
const createComplaint    = require('./lambdas/complaints/createComplaint').handler
const getComplaints      = require('./lambdas/complaints/getComplaints').handler
const adminGetComplaints = require('./lambdas/admin/adminGetComplaints').handler
const adminUpdateStatus  = require('./lambdas/admin/adminUpdateStatus').handler
const adminAssign        = require('./lambdas/admin/adminAssign').handler
const adminAddComment    = require('./lambdas/admin/adminAddComment').handler
const adminDashboard     = require('./lambdas/admin/adminDashboard').handler
const adminAnalytics     = require('./lambdas/admin/adminAnalytics').handler

// ---- Routes ----

// Student complaint routes
app.post('/complaints', upload.single('image'), (req, res) =>
  invokeLambda(createComplaint, req, res))

app.get('/complaints', (req, res) =>
  invokeLambda(getComplaints, req, res))

app.get('/complaints/:id', (req, res) =>
  invokeLambda(getComplaints, req, res, { id: req.params.id }))

// Admin routes
app.get('/admin/dashboard', (req, res) =>
  invokeLambda(adminDashboard, req, res))

app.get('/admin/analytics', (req, res) =>
  invokeLambda(adminAnalytics, req, res))

app.get('/admin/complaints', (req, res) =>
  invokeLambda(adminGetComplaints, req, res))

app.get('/admin/complaints/:id', (req, res) =>
  invokeLambda(adminGetComplaints, req, res, { id: req.params.id }))

app.put('/admin/complaints/:id/status', (req, res) =>
  invokeLambda(adminUpdateStatus, req, res, { id: req.params.id }))

app.put('/admin/complaints/:id/assign', (req, res) =>
  invokeLambda(adminAssign, req, res, { id: req.params.id }))

app.post('/admin/complaints/:id/comment', (req, res) =>
  invokeLambda(adminAddComment, req, res, { id: req.params.id }))

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

// OPTIONS for CORS preflight
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  res.status(200).end()
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  logger.info('LOCAL_SERVER_START', { port: PORT, url: `http://localhost:${PORT}` })
  console.log(`\n🚀 Backend running at http://localhost:${PORT}`)
  console.log(`📋 Health check: http://localhost:${PORT}/health\n`)
})
