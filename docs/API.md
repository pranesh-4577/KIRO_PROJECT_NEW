# API Documentation

## Base URL

- Local: `http://localhost:4000`
- Production: `https://<api-id>.execute-api.<region>.amazonaws.com/dev`

## Authentication

All protected endpoints require:
```
Authorization: Bearer <Cognito ID Token>
```

## Response Format

All responses follow this envelope:
```json
{ "success": true, "data": { ... } }
{ "success": false, "message": "Error message", "details": { ... } }
```

---

## Student Endpoints

### POST /complaints
Submit a new complaint (multipart/form-data).

**Body fields:**
| Field | Type | Required |
|-------|------|----------|
| title | string | ✅ |
| description | string | ✅ |
| category | string | ✅ |
| priority | string | ✅ |
| building | string | ✅ |
| floor | string | ❌ |
| roomNumber | string | ❌ |
| image | file (JPEG/PNG/WebP, max 5MB) | ❌ |

**Response 201:**
```json
{ "success": true, "data": { "complaintId": "CMP-2026-00001", "status": "PENDING", "createdAt": "..." } }
```

### GET /complaints
List authenticated student's complaints.

**Query params:** `search`, `status`, `category`

### GET /complaints/:id
Get full complaint details (student must own it).

### PUT /complaints/:id
Update complaint (only while PENDING).

### DELETE /complaints/:id
Delete complaint (only while PENDING).

---

## Admin Endpoints

### GET /admin/complaints
List all complaints with optional filters.

**Query params:** `search`, `status`, `category`, `priority`, `building`

### GET /admin/complaints/:id
Get full complaint details including student info.

### PUT /admin/complaints/:id/status
Update complaint status.

```json
{ "status": "IN_PROGRESS", "comment": "Optional note" }
```

**Valid transitions:**
- PENDING → ASSIGNED, REJECTED
- ASSIGNED → IN_PROGRESS, REJECTED
- IN_PROGRESS → RESOLVED, REJECTED

### PUT /admin/complaints/:id/assign
Assign complaint to staff member.

```json
{ "assignedTo": "staff-id", "assignedToName": "John Maintenance" }
```

### POST /admin/complaints/:id/comment
Add a comment/update to a complaint.

```json
{ "comment": "Technician has been dispatched." }
```

### GET /admin/dashboard
Get dashboard statistics (status counts, category/building breakdown, monthly stats).

### GET /admin/analytics
Get detailed analytics data.

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation error |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (wrong role or wrong owner) |
| 404 | Not found |
| 405 | Method not allowed |
| 500 | Internal server error |
