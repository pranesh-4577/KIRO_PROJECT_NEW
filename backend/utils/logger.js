'use strict'

/**
 * Structured logger for CloudWatch compatibility.
 * Emits JSON log entries with requestId, operation, and outcome.
 */
const logger = {
  info: (operation, data = {}) => {
    console.log(JSON.stringify({ level: 'INFO', operation, timestamp: new Date().toISOString(), ...data }))
  },
  error: (operation, error, data = {}) => {
    console.error(JSON.stringify({
      level: 'ERROR',
      operation,
      timestamp: new Date().toISOString(),
      error: error?.message || String(error),
      stack: error?.stack,
      ...data,
    }))
  },
  warn: (operation, data = {}) => {
    console.warn(JSON.stringify({ level: 'WARN', operation, timestamp: new Date().toISOString(), ...data }))
  },
}

module.exports = logger
