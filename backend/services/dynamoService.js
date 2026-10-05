'use strict'

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, ScanCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb')

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' })
const ddb = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
})

const COMPLAINTS_TABLE = () => process.env.DYNAMODB_COMPLAINTS_TABLE
const USERS_TABLE      = () => process.env.DYNAMODB_USERS_TABLE
const COUNTER_TABLE    = () => process.env.DYNAMODB_COUNTER_TABLE || 'smart-campus-counters'

// ---- Counters (for sequential complaint IDs) ----

async function getNextComplaintNumber(year) {
  const { Attributes } = await ddb.send(new UpdateCommand({
    TableName: COUNTER_TABLE(),
    Key: { counterId: `COMPLAINT_${year}` },
    UpdateExpression: 'ADD #count :inc',
    ExpressionAttributeNames: { '#count': 'count' },
    ExpressionAttributeValues: { ':inc': 1 },
    ReturnValues: 'UPDATED_NEW',
  }))
  return Attributes.count
}

function generateComplaintId(year, number) {
  return `CMP-${year}-${String(number).padStart(5, '0')}`
}

// ---- Complaints ----

async function createComplaint(item) {
  await ddb.send(new PutCommand({ TableName: COMPLAINTS_TABLE(), Item: item }))
  return item
}

async function getComplaintById(complaintId) {
  const { Item } = await ddb.send(new GetCommand({
    TableName: COMPLAINTS_TABLE(),
    Key: { complaintId },
  }))
  return Item || null
}

async function getComplaintsByStudent(studentId) {
  const { Items } = await ddb.send(new QueryCommand({
    TableName: COMPLAINTS_TABLE(),
    IndexName: 'studentId-index',
    KeyConditionExpression: 'studentId = :sid',
    ExpressionAttributeValues: { ':sid': studentId },
    ScanIndexForward: false,
  }))
  return Items || []
}

async function getAllComplaints(filters = {}) {
  // For demo/local: use scan with filter expressions
  // In production, use GSIs for efficient queries
  const params = { TableName: COMPLAINTS_TABLE() }
  const filterExpressions = []
  const exprAttrNames = {}
  const exprAttrValues = {}

  if (filters.status) {
    filterExpressions.push('#status = :status')
    exprAttrNames['#status'] = 'status'
    exprAttrValues[':status'] = filters.status
  }
  if (filters.category) {
    filterExpressions.push('category = :category')
    exprAttrValues[':category'] = filters.category
  }
  if (filters.priority) {
    filterExpressions.push('priority = :priority')
    exprAttrValues[':priority'] = filters.priority
  }
  if (filters.building) {
    filterExpressions.push('building = :building')
    exprAttrValues[':building'] = filters.building
  }
  if (filters.search) {
    filterExpressions.push('(contains(title, :search) OR contains(description, :search) OR contains(complaintId, :search))')
    exprAttrValues[':search'] = filters.search
  }

  if (filterExpressions.length > 0) {
    params.FilterExpression = filterExpressions.join(' AND ')
    if (Object.keys(exprAttrNames).length > 0) params.ExpressionAttributeNames = exprAttrNames
    params.ExpressionAttributeValues = exprAttrValues
  }

  const { Items } = await ddb.send(new ScanCommand(params))
  // Sort by createdAt descending
  return (Items || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

async function updateComplaint(complaintId, updates) {
  const updateParts = []
  const exprAttrNames = {}
  const exprAttrValues = {}

  Object.entries(updates).forEach(([key, value]) => {
    const safeKey = `#${key}`
    updateParts.push(`${safeKey} = :${key}`)
    exprAttrNames[safeKey] = key
    exprAttrValues[`:${key}`] = value
  })

  const { Attributes } = await ddb.send(new UpdateCommand({
    TableName: COMPLAINTS_TABLE(),
    Key: { complaintId },
    UpdateExpression: `SET ${updateParts.join(', ')}`,
    ExpressionAttributeNames: exprAttrNames,
    ExpressionAttributeValues: exprAttrValues,
    ReturnValues: 'ALL_NEW',
  }))
  return Attributes
}

async function appendToListAttribute(complaintId, attributeName, newItem) {
  const { Attributes } = await ddb.send(new UpdateCommand({
    TableName: COMPLAINTS_TABLE(),
    Key: { complaintId },
    UpdateExpression: `SET ${attributeName} = list_append(if_not_exists(${attributeName}, :empty), :newItem)`,
    ExpressionAttributeValues: {
      ':empty': [],
      ':newItem': [newItem],
    },
    ReturnValues: 'ALL_NEW',
  }))
  return Attributes
}

async function deleteComplaint(complaintId) {
  await ddb.send(new DeleteCommand({ TableName: COMPLAINTS_TABLE(), Key: { complaintId } }))
}

// ---- Users ----

async function upsertUser(userItem) {
  await ddb.send(new PutCommand({ TableName: USERS_TABLE(), Item: userItem }))
}

async function getUserById(userId) {
  const { Item } = await ddb.send(new GetCommand({ TableName: USERS_TABLE(), Key: { userId } }))
  return Item || null
}

module.exports = {
  getNextComplaintNumber,
  generateComplaintId,
  createComplaint,
  getComplaintById,
  getComplaintsByStudent,
  getAllComplaints,
  updateComplaint,
  appendToListAttribute,
  deleteComplaint,
  upsertUser,
  getUserById,
}
