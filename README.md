# 🎓 Smart Campus Complaint & Service Management System

A full-stack serverless web application for colleges and universities that allows students to report campus maintenance issues and administrators to manage, track, and resolve them.

Built with **React.js + Vite** on the frontend and **AWS Serverless** on the backend — perfect for an AWS hackathon or university event.

---

## Problem Statement

Campus maintenance issues (broken lights, plumbing faults, Wi-Fi problems) often go unreported or are communicated informally. This system provides a structured digital platform to:
- Give students an easy way to report problems with a unique tracking ID
- Give administrators complete visibility and management tools
- Automate notifications so nobody needs to manually follow up

---

## Features

### Student
- Register and login via Amazon Cognito
- Submit complaints with category, priority, location (building/floor/room)
- Get a unique Complaint ID (e.g. `CMP-2026-00001`)
- Upload an optional image as proof
- Track complaint status in real time
- View admin comments and status history
- Email notifications at every stage

### Admin
- Secure login with role-based access
- View, search, and filter all complaints
- Assign complaints to staff
- Update complaint status with comments
- View complaint images securely
- Dashboard with statistics and charts
- Analytics page with trends by category, building, priority, and time

---

## AWS Architecture

```
React Frontend (S3 + CloudFront)
        │
        ▼
  API Gateway (REST)
        │
        ├── Lambda Authorizer (Cognito JWT validation)
        │
        ├── POST   /complaints         → createComplaint Lambda
        ├── GET    /complaints          → getComplaints Lambda
        ├── GET    /complaints/:id      → getComplaints Lambda
        ├── GET    /admin/complaints    → adminGetComplaints Lambda
        ├── PUT    /admin/complaints/:id/status  → adminUpdateStatus Lambda
        ├── PUT    /admin/complaints/:id/assign  → adminAssign Lambda
        ├── POST   /admin/complaints/:id/comment → adminAddComment Lambda
        ├── GET    /admin/dashboard     → adminDashboard Lambda
        └── GET    /admin/analytics     → adminAnalytics Lambda

Lambda Functions
   │  ├── Amazon Cognito (auth)
   │  ├── Amazon DynamoDB (data)
   │  ├── Amazon S3 (images)
   │  └── Amazon SES (emails)

Amazon CloudWatch (logs + monitoring for all Lambdas)
```

---

## AWS Services Used

| Service | Purpose |
|---------|---------|
| Amazon Cognito | Authentication, user management, JWT tokens, role groups |
| AWS Lambda | All backend business logic (serverless functions) |
| Amazon API Gateway | REST API endpoints, Lambda authorizer |
| Amazon DynamoDB | Complaints, users, counter tables |
| Amazon S3 | Complaint image storage (private, pre-signed URLs) |
| Amazon SES | Email notifications for all complaint events |
| Amazon CloudWatch | Structured logs and monitoring per Lambda |

---

## Complaint Status Lifecycle

```
PENDING → ASSIGNED → IN_PROGRESS → RESOLVED
    └──────────────────────────────→ REJECTED (from any active state)
```

---

## Database Design (DynamoDB)

### Complaints Table (`smart-campus-complaints`)
| Attribute | Type | Notes |
|-----------|------|-------|
| complaintId (PK) | String | CMP-YYYY-NNNNN |
| studentId | String | GSI partition key |
| studentName, studentEmail | String | |
| title, description | String | |
| category | String | Electrical, Plumbing, etc. |
| priority | String | Low, Medium, High, Critical |
| building, floor, roomNumber | String | |
| status | String | GSI partition key |
| imageKey | String | S3 object key |
| comments | List | [{text, adminName, timestamp}] |
| statusHistory | List | [{oldStatus, newStatus, timestamp, adminId}] |
| createdAt, updatedAt | String | ISO 8601 |
| resolvedAt | String | Set when RESOLVED or REJECTED |

### Users Table (`smart-campus-users`)
| Attribute | Type | Notes |
|-----------|------|-------|
| userId (PK) | String | Cognito sub |
| email, name | String | |

### Counters Table (`smart-campus-counters`)
| Attribute | Type | Notes |
|-----------|------|-------|
| counterId (PK) | String | e.g. COMPLAINT_2026 |
| count | Number | Auto-incremented |

---

## Project Structure

```
KIRO_PROJECT_NEW/
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── api/                # Axios API client
│   │   ├── aws-config.js       # Amplify configuration
│   │   ├── components/
│   │   │   ├── auth/           # ProtectedRoute guards
│   │   │   ├── common/         # Reusable UI components
│   │   │   └── layout/         # Sidebar, AppLayout
│   │   ├── context/            # AuthContext (Cognito)
│   │   ├── pages/
│   │   │   ├── auth/           # Login, Register, VerifyEmail, ForgotPassword
│   │   │   ├── student/        # Dashboard, SubmitComplaint, MyComplaints, etc.
│   │   │   └── admin/          # AdminDashboard, AdminComplaints, Analytics
│   │   └── utils/              # constants, helpers
│   ├── .env                    # Frontend env vars (not committed)
│   ├── package.json
│   └── vite.config.js
│
├── backend/                    # AWS Lambda backend
│   ├── lambdas/
│   │   ├── auth/               # Lambda Authorizer
│   │   ├── complaints/         # Student Lambda handlers
│   │   └── admin/              # Admin Lambda handlers
│   ├── services/               # DynamoDB, S3, SES, Auth services
│   ├── utils/                  # Logger, response helpers, validation
│   ├── local-server.js         # Express dev server (Lambda emulation)
│   ├── .env                    # Backend env vars (not committed)
│   └── package.json
│
├── infrastructure/
│   ├── dynamodb-tables.json    # Table definitions
│   └── setup-aws.sh            # AWS resource creation script
│
├── docs/
│   └── API.md                  # API reference
│
└── README.md
```

---

## Local Setup Instructions

### Prerequisites

- Node.js 18+
- npm or yarn
- AWS account (for full functionality) OR local mocks

### Step 1: Clone and Install

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### Step 2: Configure Environment Variables

**Frontend** — copy and edit `frontend/.env`:
```bash
cp frontend/.env.example frontend/.env
```

**Backend** — copy and edit `backend/.env`:
```bash
cp backend/.env.example backend/.env
```

### Step 3: Set Up AWS Resources (one-time)

```bash
# Make the setup script executable
chmod +x infrastructure/setup-aws.sh

# Run it (requires AWS CLI configured)
./infrastructure/setup-aws.sh
```

Copy the output values (Cognito Pool ID, Client ID, S3 bucket) into your `.env` files.

### Step 4: Verify your SES sender email

In the AWS Console → SES → Verified Identities → add and verify your sender email.

### Step 5: Create an Admin user

```bash
# Create a user in Cognito (replace values)
aws cognito-idp admin-create-user \
  --user-pool-id YOUR_POOL_ID \
  --username admin@yourcollege.edu \
  --user-attributes Name=email,Value=admin@yourcollege.edu Name=name,Value="Campus Admin" \
  --temporary-password TempPass123! \
  --region us-east-1

# Add to admin group
aws cognito-idp admin-add-user-to-group \
  --user-pool-id YOUR_POOL_ID \
  --username admin@yourcollege.edu \
  --group-name admin \
  --region us-east-1
```

---

## Running Locally

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd backend
npm start
# Server runs on http://localhost:4000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# App runs on http://localhost:3000
```

Open `http://localhost:3000` in your browser.

**Test the backend health check:**
```bash
curl http://localhost:4000/health
```

---

## Deployment Instructions

### Deploy Frontend to S3 + CloudFront

```bash
cd frontend

# Build
npm run build

# Create S3 bucket for hosting
aws s3 mb s3://smart-campus-frontend-<your-account-id>

# Enable static hosting
aws s3 website s3://smart-campus-frontend-<your-account-id> \
  --index-document index.html --error-document index.html

# Upload build
aws s3 sync dist/ s3://smart-campus-frontend-<your-account-id>
```

### Deploy Backend Lambdas

Each file in `backend/lambdas/` is a standalone Lambda function.

```bash
cd backend

# Zip and deploy each Lambda (example for createComplaint)
zip -r create-complaint.zip lambdas/complaints/createComplaint.js services/ utils/ node_modules/

aws lambda create-function \
  --function-name smart-campus-createComplaint \
  --runtime nodejs18.x \
  --handler lambdas/complaints/createComplaint.handler \
  --zip-file fileb://create-complaint.zip \
  --role arn:aws:iam::<ACCOUNT_ID>:role/smart-campus-lambda-role \
  --environment Variables="{AWS_REGION=us-east-1,COGNITO_USER_POOL_ID=...,COGNITO_CLIENT_ID=...,DYNAMODB_COMPLAINTS_TABLE=smart-campus-complaints,S3_BUCKET_NAME=...,SES_SENDER_EMAIL=...}" \
  --region us-east-1
```

Create an API Gateway REST API and route each endpoint to the corresponding Lambda.

---

## Required IAM Permissions

The Lambda execution role needs:

```json
{
  "Effect": "Allow",
  "Action": [
    "dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:UpdateItem",
    "dynamodb:DeleteItem", "dynamodb:Query", "dynamodb:Scan"
  ],
  "Resource": "arn:aws:dynamodb:*:*:table/smart-campus-*"
},
{
  "Effect": "Allow",
  "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
  "Resource": "arn:aws:s3:::smart-campus-*/*"
},
{
  "Effect": "Allow",
  "Action": ["ses:SendEmail"],
  "Resource": "*"
},
{
  "Effect": "Allow",
  "Action": ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"],
  "Resource": "*"
}
```

---

## Security Considerations

- All AWS credentials are in environment variables — never in code
- Cognito JWT validation on every API request
- Role-based access control (students can only access their own data)
- S3 bucket has public access blocked; images served via pre-signed URLs
- Input validation on all API endpoints
- HTTPS enforced on all API Gateway and CloudFront URLs

---

## Environment Variables Reference

### Frontend (`frontend/.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| VITE_COGNITO_USER_POOL_ID | Cognito User Pool ID | us-east-1_XXXXXXXX |
| VITE_COGNITO_CLIENT_ID | Cognito App Client ID | 1abc2def3ghi... |
| VITE_COGNITO_REGION | AWS region | us-east-1 |
| VITE_API_BASE_URL | API Gateway URL or localhost | http://localhost:4000 |
| VITE_AI_CLASSIFIER_ENABLED | Enable AI suggestions | false |

### Backend (`backend/.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| AWS_REGION | AWS region | us-east-1 |
| COGNITO_USER_POOL_ID | Cognito User Pool ID | us-east-1_XXXXXXXX |
| COGNITO_CLIENT_ID | Cognito App Client ID | 1abc2def3ghi... |
| DYNAMODB_COMPLAINTS_TABLE | Complaints table name | smart-campus-complaints |
| DYNAMODB_USERS_TABLE | Users table name | smart-campus-users |
| DYNAMODB_COUNTER_TABLE | Counters table name | smart-campus-counters |
| S3_BUCKET_NAME | S3 bucket for images | smart-campus-complaints-images |
| SES_SENDER_EMAIL | Verified sender email | noreply@college.edu |
| APP_URL | Frontend URL for email links | http://localhost:3000 |
| AI_CLASSIFIER_ENABLED | Enable AI feature | false |

---

## Testing Checklist

- [ ] Student can register with email
- [ ] Student receives verification email
- [ ] Student can log in and access dashboard
- [ ] Student can submit a complaint (with and without image)
- [ ] Complaint ID generated in CMP-YYYY-NNNNN format
- [ ] Student receives submission confirmation email
- [ ] Student can view their complaints list
- [ ] Student can view complaint details with status history
- [ ] Admin can log in (admin group in Cognito)
- [ ] Admin can view all complaints
- [ ] Admin can filter/search complaints
- [ ] Admin can assign a complaint to staff
- [ ] Admin can update complaint status (valid transitions only)
- [ ] Admin can add comments
- [ ] Student receives email notification on status change
- [ ] Admin dashboard shows correct statistics
- [ ] Analytics charts load correctly
- [ ] Invalid status transition returns error
- [ ] Student cannot access admin routes (403)
- [ ] Admin cannot access student-only routes (403)
- [ ] Unauthenticated requests return 401

---

## Future Enhancements

- Real-time notifications using WebSockets (API Gateway WebSocket API)
- Push notifications via SNS
- Mobile app with React Native
- QR code scanning for room-level complaint submission
- SLA tracking and breach alerts
- Multi-language support
- Bulk complaint assignment
- Staff portal (separate role)

---

## Hackathon Presentation Tips

1. **Demo flow**: Register student → submit complaint with image → switch to admin → assign → update status → show student gets email → show dashboard charts
2. **Highlight AWS services**: Point out each service on the architecture diagram
3. **Show the Complaint ID**: CMP-2026-00001 format is memorable and professional
4. **Show mobile responsiveness**: Open on phone or resize browser
5. **Mention scalability**: Serverless means it scales to zero cost and handles spikes automatically
6. **Security story**: JWT auth, pre-signed URLs, no hardcoded credentials

---

*Built for AWS UG / Kiro University event — 2026*
