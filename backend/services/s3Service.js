'use strict'

const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')

const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' })

const BUCKET = () => process.env.S3_BUCKET_NAME
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

function validateImage(contentType, size) {
  if (!ALLOWED_TYPES.includes(contentType)) {
    return 'Only JPEG, PNG, or WebP images are allowed.'
  }
  if (size > MAX_SIZE_BYTES) {
    return 'Image must be smaller than 5 MB.'
  }
  return null
}

async function uploadImage(complaintId, buffer, contentType) {
  const ext = contentType.split('/')[1].replace('jpeg', 'jpg')
  const key = `complaints/${complaintId}/image.${ext}`
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET(),
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ServerSideEncryption: 'AES256',
  }))
  return key
}

async function getPresignedUrl(key, expiresInSeconds = 3600) {
  const command = new GetObjectCommand({ Bucket: BUCKET(), Key: key })
  return getSignedUrl(s3, command, { expiresIn: expiresInSeconds })
}

async function deleteImage(key) {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET(), Key: key }))
}

module.exports = { validateImage, uploadImage, getPresignedUrl, deleteImage }
