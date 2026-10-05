'use strict'
const logger = require('./logger')

const REQUIRED_ENV_VARS = [
  'AWS_REGION',
  'COGNITO_USER_POOL_ID',
  'COGNITO_CLIENT_ID',
  'DYNAMODB_COMPLAINTS_TABLE',
  'DYNAMODB_USERS_TABLE',
  'S3_BUCKET_NAME',
  'SES_SENDER_EMAIL',
]

function checkEnvVars() {
  const missing = REQUIRED_ENV_VARS.filter((v) => !process.env[v])
  if (missing.length > 0) {
    logger.error('ENV_CHECK', new Error('Missing environment variables'), { missing })
    return false
  }
  return true
}

module.exports = { checkEnvVars }
