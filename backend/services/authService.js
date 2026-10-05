'use strict'

const { CognitoJwtVerifier } = require('aws-jwt-verify')
const logger = require('../utils/logger')

let verifier = null

function getVerifier() {
  if (!verifier) {
    verifier = CognitoJwtVerifier.create({
      userPoolId: process.env.COGNITO_USER_POOL_ID,
      tokenUse: 'id',
      clientId: process.env.COGNITO_CLIENT_ID,
    })
  }
  return verifier
}

/**
 * Extracts and verifies the Bearer token from an Authorization header.
 * Returns the decoded token payload or throws on failure.
 */
async function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header')
  }
  const token = authHeader.slice(7)
  return getVerifier().verify(token)
}

/**
 * Extracts user info from the verified token payload.
 */
function extractUserFromPayload(payload) {
  const groups = payload['cognito:groups'] || []
  return {
    userId: payload.sub,
    email: payload.email,
    name: payload.name || payload['cognito:username'],
    role: groups.includes('admin') ? 'admin' : 'student',
    groups,
  }
}

module.exports = { verifyToken, extractUserFromPayload }
