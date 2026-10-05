'use strict'

const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses')
const logger = require('../utils/logger')

const ses = new SESClient({ region: process.env.AWS_REGION || 'us-east-1' })
const FROM = () => process.env.SES_SENDER_EMAIL
const APP_URL = () => process.env.APP_URL || 'http://localhost:3000'

async function sendEmail(to, subject, htmlBody, textBody) {
  try {
    await ses.send(new SendEmailCommand({
      Source: FROM(),
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject },
        Body: {
          Html: { Data: htmlBody },
          Text: { Data: textBody || htmlBody.replace(/<[^>]+>/g, '') },
        },
      },
    }))
    logger.info('SES_SEND', { to, subject })
  } catch (err) {
    // Log but do NOT re-throw — email failure must not block the main operation
    logger.error('SES_SEND_FAILED', err, { to, subject })
  }
}

function buildEmailHtml(title, bodyLines, complaintId) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
      <div style="background: #1e3a8a; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 20px;">🎓 Smart Campus System</h1>
      </div>
      <div style="background: white; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
        <h2 style="color: #1f2937; font-size: 18px;">${title}</h2>
        ${bodyLines.map((line) => `<p style="color: #4b5563; line-height: 1.6;">${line}</p>`).join('')}
        ${complaintId ? `<div style="background: #dbeafe; padding: 12px; border-radius: 6px; margin: 16px 0;"><strong>Complaint ID: ${complaintId}</strong></div>` : ''}
        <a href="${APP_URL()}" style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; margin-top: 8px;">View in Portal</a>
      </div>
      <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 16px;">This is an automated notification from Smart Campus System.</p>
    </div>
  `
}

async function sendSubmissionConfirmation(to, complaint) {
  await sendEmail(
    to,
    `Complaint Submitted: ${complaint.complaintId}`,
    buildEmailHtml(
      'Complaint Submitted Successfully',
      [
        `Your complaint has been received and is now under review.`,
        `<strong>Title:</strong> ${complaint.title}`,
        `<strong>Category:</strong> ${complaint.category}`,
        `<strong>Submitted:</strong> ${new Date(complaint.createdAt).toLocaleString()}`,
        `You will be notified as your complaint progresses.`,
      ],
      complaint.complaintId
    )
  )
}

async function sendStatusChangeNotification(to, complaint, oldStatus, newStatus) {
  await sendEmail(
    to,
    `Complaint Status Updated: ${complaint.complaintId}`,
    buildEmailHtml(
      'Your Complaint Status Has Changed',
      [
        `The status of your complaint has been updated.`,
        `<strong>Title:</strong> ${complaint.title}`,
        `<strong>Previous Status:</strong> ${oldStatus}`,
        `<strong>New Status:</strong> ${newStatus}`,
      ],
      complaint.complaintId
    )
  )
}

async function sendAssignmentNotification(to, complaint, assignedToName) {
  await sendEmail(
    to,
    `Complaint Assigned: ${complaint.complaintId}`,
    buildEmailHtml(
      'Your Complaint Has Been Assigned',
      [
        `Good news! Your complaint has been assigned to a staff member.`,
        `<strong>Title:</strong> ${complaint.title}`,
        `<strong>Assigned To:</strong> ${assignedToName}`,
        `We'll keep you posted on the progress.`,
      ],
      complaint.complaintId
    )
  )
}

async function sendResolutionNotification(to, complaint, finalComment) {
  await sendEmail(
    to,
    `Complaint Resolved: ${complaint.complaintId}`,
    buildEmailHtml(
      '✅ Your Complaint Has Been Resolved',
      [
        `Your complaint has been resolved. Thank you for your patience.`,
        `<strong>Title:</strong> ${complaint.title}`,
        ...(finalComment ? [`<strong>Note from Admin:</strong> ${finalComment}`] : []),
      ],
      complaint.complaintId
    )
  )
}

async function sendRejectionNotification(to, complaint, reason) {
  await sendEmail(
    to,
    `Complaint Rejected: ${complaint.complaintId}`,
    buildEmailHtml(
      'Complaint Rejected',
      [
        `We're sorry, but your complaint could not be processed.`,
        `<strong>Title:</strong> ${complaint.title}`,
        ...(reason ? [`<strong>Reason:</strong> ${reason}`] : []),
        `If you believe this is incorrect, please contact the campus administration.`,
      ],
      complaint.complaintId
    )
  )
}

module.exports = {
  sendSubmissionConfirmation,
  sendStatusChangeNotification,
  sendAssignmentNotification,
  sendResolutionNotification,
  sendRejectionNotification,
}
