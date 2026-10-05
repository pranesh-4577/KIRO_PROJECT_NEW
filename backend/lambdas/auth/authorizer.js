'use strict'

const { verifyToken, extractUserFromPayload } = require('../../services/authService')
const logger = require('../../utils/logger')

/**
 * Lambda Authorizer for API Gateway.
 * Validates the Cognito JWT and returns an IAM policy.
 */
exports.handler = async (event) => {
  const token = event.authorizationToken || event.headers?.Authorization
  try {
    const payload = await verifyToken(token?.startsWith('Bearer ') ? token : `Bearer ${token}`)
    const user = extractUserFromPayload(payload)

    logger.info('AUTHORIZER_SUCCESS', { userId: user.userId, role: user.role })

    return {
      principalId: user.userId,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [{
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: event.methodArn,
        }],
      },
      context: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    }
  } catch (err) {
    logger.error('AUTHORIZER_FAILED', err)
    throw new Error('Unauthorized')
  }
}
