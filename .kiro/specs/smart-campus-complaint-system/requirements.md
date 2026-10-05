# Requirements Document

## Introduction

The Smart Campus Complaint & Service Management System is a full-stack web application that enables college students to report campus problems (electrical faults, plumbing, Wi-Fi issues, classroom problems, hostel issues, cleaning, security, etc.) and allows administrators to manage, assign, track, and resolve those complaints. The system is built on a React.js + Vite frontend backed by an AWS serverless architecture using Cognito, Lambda, DynamoDB, S3, SES, API Gateway, and CloudWatch. An optional AI-assisted complaint classification feature uses AWS AI services. The system is beginner-friendly, free of traditional servers, and suitable for demonstration at an AWS university event.

## Glossary

- **System**: The Smart Campus Complaint & Service Management System as a whole
- **Student**: A registered college student who submits and tracks complaints
- **Admin**: A privileged user who manages, assigns, and resolves complaints
- **Staff**: A campus staff member to whom an Admin assigns a complaint
- **Complaint**: A campus maintenance or service issue submitted by a Student
- **Complaint_ID**: A unique identifier in the format CMP-YYYY-NNNNN (e.g., CMP-2026-00001)
- **Complaint_Status**: One of five states: PENDING, ASSIGNED, IN_PROGRESS, RESOLVED, REJECTED
- **Status_History**: An ordered list of status transitions recorded on a Complaint, each with a timestamp
- **Category**: The classification of a Complaint — one of: Electrical, Plumbing, Internet/Wi-Fi, Classroom, Hostel, Cleaning, Security, Other
- **Priority**: The urgency level of a Complaint — one of: Low, Medium, High, Critical
- **Cognito**: Amazon Cognito, the authentication and user management service
- **Lambda**: AWS Lambda, the serverless compute service hosting business logic
- **DynamoDB**: Amazon DynamoDB, the NoSQL database storing complaints and user data
- **S3**: Amazon S3, the object storage service for complaint image attachments
- **SES**: Amazon Simple Email Service, used for sending email notifications
- **CloudWatch**: Amazon CloudWatch, used for monitoring and logging Lambda functions
- **API_Gateway**: AWS API Gateway, which routes HTTP requests to Lambda handlers
- **AI_Classifier**: The optional AWS AI service component that suggests Category, Priority, and Location Type from free-text descriptions
- **Dashboard**: The main admin UI screen showing complaint statistics and charts
- **JWT**: A Cognito-issued JSON Web Token used for authenticating API requests

---

## Requirements

### Requirement 1: Student Registration and Authentication

**User Story:** As a Student, I want to register and log in using my college email, so that I can securely access the complaint system.

#### Acceptance Criteria

1. THE System SHALL use Cognito as the sole authentication provider for all users.
2. WHEN a Student submits valid registration details (email, password, full name), THE System SHALL create a Cognito user account and send a verification email to the Student.
3. WHEN a Student submits an email address already registered in Cognito, THE System SHALL return a descriptive error indicating the email is already in use.
4. WHEN a Student provides an incorrect password during login, THE System SHALL return an authentication error and deny access.
5. WHEN a Student provides valid credentials during login, THE System SHALL return a Cognito JWT token and grant access to the student portal.
6. IF a Student's Cognito account is not yet verified, THEN THE System SHALL deny login and instruct the Student to verify their email.
7. WHEN a Student requests a password reset, THE System SHALL trigger the Cognito password reset flow and send a reset code to the registered email.
8. WHEN a Student's JWT token expires, THE System SHALL redirect the Student to the login page.

---

### Requirement 2: Admin Authentication and Role Enforcement

**User Story:** As an Admin, I want to log in securely and have my role enforced on every request, so that student data and management functions are protected.

#### Acceptance Criteria

1. WHEN an Admin provides valid credentials, THE System SHALL authenticate the Admin via Cognito and return a JWT token that includes the Admin role claim.
2. WHEN an Admin attempts to access a student-only route, THE System SHALL return a 403 Forbidden response.
3. WHEN a Student attempts to access an admin-only route, THE System SHALL return a 403 Forbidden response.
4. THE System SHALL enforce role-based access control by inspecting the Cognito JWT token group claim on every API_Gateway request via a Lambda authorizer.
5. WHEN an unauthenticated request is made to any protected API endpoint, THE System SHALL return a 401 Unauthorized response.

---

### Requirement 3: Complaint Submission

**User Story:** As a Student, I want to submit a complaint with a category, title, description, location, priority, and optional image, so that campus issues are formally recorded and addressed.

#### Acceptance Criteria

1. WHEN a Student submits a complaint with a valid Category, title, description, building, floor, room number, and Priority, THE System SHALL persist the complaint in DynamoDB with Complaint_Status set to PENDING and record the creation timestamp.
2. THE System SHALL assign every new complaint a unique Complaint_ID in the format CMP-YYYY-NNNNN, where YYYY is the four-digit submission year and NNNNN is a zero-padded five-digit sequential number.
3. THE System SHALL accept the following Category values only: Electrical, Plumbing, Internet/Wi-Fi, Classroom, Hostel, Cleaning, Security, Other.
4. THE System SHALL accept the following Priority values only: Low, Medium, High, Critical.
5. WHEN a Student submits a complaint without a title, description, building, or Category, THE System SHALL return a validation error identifying each missing field and reject the submission.
6. WHERE a Student attaches an image to a complaint, THE System SHALL upload the image to S3 and store the resulting S3 object reference in the complaint record in DynamoDB.
7. WHEN a complaint image exceeds 5 MB, THE System SHALL reject the upload and return an error message stating the file size limit.
8. THE System SHALL accept image attachments only in JPEG, PNG, or WebP format; IF any other format is submitted, THEN THE System SHALL return a validation error.
9. WHEN a Student attempts to submit a complaint while unauthenticated, THE System SHALL return a 401 Unauthorized response.
10. WHEN a complaint is successfully submitted, THE System SHALL send a confirmation email to the Student via SES containing the Complaint_ID, title, and submission timestamp.

---

### Requirement 4: Complaint ID Generation

**User Story:** As a Student, I want to receive a unique, human-readable complaint ID immediately after submission, so that I can reference and track my complaint easily.

#### Acceptance Criteria

1. THE System SHALL generate a Complaint_ID for every complaint in the format CMP-YYYY-NNNNN.
2. THE System SHALL guarantee that no two complaints share the same Complaint_ID within the same year.
3. WHEN a Student searches by Complaint_ID, THE System SHALL return the matching complaint or a not-found message if no match exists.
4. THE System SHALL display the Complaint_ID prominently on the complaint confirmation screen and in the complaint list.

---

### Requirement 5: Student Complaint Tracking

**User Story:** As a Student, I want to view and track the status of my submitted complaints, so that I know when my issues are being addressed.

#### Acceptance Criteria

1. WHEN an authenticated Student requests their complaint list, THE System SHALL return only the complaints submitted by that Student, ordered by creation timestamp descending.
2. WHEN an authenticated Student requests the details of a specific complaint, THE System SHALL return the complaint's full details including Complaint_ID, Category, title, description, building, floor, room number, Priority, Complaint_Status, assigned Staff name (if any), creation timestamp, last-updated timestamp, admin comments, and Status_History.
3. WHEN a Student requests a complaint belonging to a different Student, THE System SHALL return a 403 Forbidden response.
4. THE System SHALL allow a Student to search their complaints by Complaint_ID.
5. THE System SHALL display the current Complaint_Status for each complaint using a visible status badge in the student portal.

---

### Requirement 6: Admin Complaint Management

**User Story:** As an Admin, I want to view, search, filter, assign, and update all complaints, so that I can efficiently manage campus maintenance issues.

#### Acceptance Criteria

1. WHEN an authenticated Admin requests the complaint list, THE System SHALL return all complaints across all students with their Complaint_ID, Category, Priority, Complaint_Status, building, creation timestamp, and Student name.
2. WHEN an Admin filters by Complaint_Status, THE System SHALL return only complaints matching the specified status.
3. WHEN an Admin filters by Category, THE System SHALL return only complaints matching the specified Category.
4. WHEN an Admin filters by Priority, THE System SHALL return only complaints matching the specified Priority.
5. WHEN an Admin filters by building, THE System SHALL return only complaints submitted for that building.
6. WHEN an Admin filters by date range, THE System SHALL return only complaints whose creation timestamp falls within the specified range.
7. WHEN an Admin submits a search query, THE System SHALL return complaints whose title, description, or Complaint_ID contains the query string (case-insensitive).
8. WHEN an Admin views a complaint's details, THE System SHALL display the uploaded image if one exists, using a pre-signed S3 URL valid for a limited time.
9. WHEN an Admin assigns a complaint to a Staff member, THE System SHALL store the Staff member's identifier in the complaint record and set Complaint_Status to ASSIGNED.
10. WHEN an Admin adds a comment to a complaint, THE System SHALL append the comment with the Admin's name and timestamp to the complaint record in DynamoDB.
11. WHEN an Admin changes the Complaint_Status of a complaint to a valid next state, THE System SHALL update the record, append the transition to the Status_History, record the update timestamp, and trigger the email notification defined in Requirement 9.
12. WHEN an Admin attempts a status transition not permitted by the lifecycle in Requirement 8, THE System SHALL return a 400 Bad Request error with a descriptive message.
13. WHEN an Admin views a complaint, THE System SHALL display the full Student information associated with that complaint (name, email, Student ID).

---

### Requirement 7: Complaint Status Lifecycle

**User Story:** As a system designer, I want a well-defined status lifecycle, so that all status transitions are predictable and auditable.

#### Acceptance Criteria

1. THE System SHALL initialise every new complaint with Complaint_Status PENDING.
2. THE System SHALL permit the following status transitions only:
   - PENDING → ASSIGNED
   - PENDING → REJECTED
   - ASSIGNED → IN_PROGRESS
   - ASSIGNED → REJECTED
   - IN_PROGRESS → RESOLVED
   - IN_PROGRESS → REJECTED
3. IF an Admin requests a status transition not listed in criterion 2, THEN THE System SHALL return a 400 Bad Request error with a descriptive message.
4. WHEN a complaint reaches RESOLVED or REJECTED status, THE System SHALL record the resolution timestamp in the complaint record.
5. WHEN a complaint's status changes, THE System SHALL append an entry to the complaint's Status_History containing the old status, new status, timestamp, and the Admin's identifier.

---

### Requirement 8: Admin Dashboard Statistics

**User Story:** As an Admin, I want to see a summary dashboard with complaint counts, charts, and resolution metrics, so that I can monitor the health of campus maintenance.

#### Acceptance Criteria

1. WHEN an authenticated Admin loads the dashboard, THE System SHALL return complaint counts for each Complaint_Status value: PENDING, ASSIGNED, IN_PROGRESS, RESOLVED, REJECTED.
2. WHEN an authenticated Admin loads the dashboard, THE System SHALL return the total number of complaints.
3. WHEN an authenticated Admin loads the dashboard, THE System SHALL return the count of complaints with Priority High or Critical.
4. WHEN an authenticated Admin loads the dashboard, THE System SHALL return complaint counts grouped by Category for display as a chart.
5. WHEN an authenticated Admin loads the dashboard, THE System SHALL return complaint counts grouped by building for display as a chart.
6. WHEN an authenticated Admin loads the dashboard, THE System SHALL return monthly complaint submission counts for the current calendar year for display as a monthly statistics chart.
7. WHEN an authenticated Admin loads the dashboard, THE System SHALL return the average resolution time in hours for complaints that have reached RESOLVED status.
8. WHEN the underlying complaint data changes, THE System SHALL reflect updated statistics on the next dashboard load without requiring a cache invalidation step.

---

### Requirement 9: Email Notifications

**User Story:** As a Student, I want to receive email notifications for key complaint events, so that I stay informed without having to check the portal.

#### Acceptance Criteria

1. WHEN a complaint is successfully submitted, THE System SHALL send a submission confirmation email to the Student via SES containing the Complaint_ID, title, Category, and submission timestamp.
2. WHEN an Admin assigns a complaint to a Staff member, THE System SHALL send an assignment notification email to the Student containing the Complaint_ID and the name of the assigned Staff member.
3. WHEN the Complaint_Status of a complaint changes, THE System SHALL send a status-change notification email to the Student containing the Complaint_ID, title, previous status, new status, and a link to the student portal.
4. WHEN a complaint reaches RESOLVED status, THE System SHALL send a resolution notification email to the Student containing the Complaint_ID and any final admin comment.
5. WHEN a complaint is set to REJECTED status, THE System SHALL send a rejection notification email to the Student containing the Complaint_ID and the reason provided by the Admin.
6. IF SES fails to deliver a notification email, THEN THE System SHALL log the failure details to CloudWatch and continue processing without returning an error to the Admin.
7. THE System SHALL send all notification emails only from a verified SES sender address stored in an environment variable.

---

### Requirement 10: Image Upload and Secure Access

**User Story:** As a Student, I want to optionally attach an image to my complaint, and as an Admin, I want to view that image securely, so that complaints are supported by visual evidence.

#### Acceptance Criteria

1. WHERE a Student attaches an image during complaint submission, THE System SHALL upload the image to a dedicated S3 bucket and store the S3 object key in the complaint record.
2. THE System SHALL accept image uploads only in JPEG, PNG, or WebP format.
3. WHEN an uploaded image exceeds 5 MB, THE System SHALL reject the upload and return a descriptive error message.
4. WHEN an authenticated Admin or the owning Student requests to view a complaint image, THE System SHALL generate a pre-signed S3 URL with a limited expiry and return it to the client.
5. WHEN an unauthenticated user or a Student who does not own the complaint requests the image URL, THE System SHALL return a 403 Forbidden response.
6. THE System SHALL store complaint images in S3 with a path structure that includes the Complaint_ID to allow easy retrieval.
7. THE System SHALL configure the S3 bucket to block all public access; images SHALL be accessible only via pre-signed URLs generated by authorized Lambda functions.

---

### Requirement 11: Security and Authorization

**User Story:** As a developer, I want all API endpoints and AWS resources protected by least-privilege IAM policies and proper authorization checks, so that student data remains confidential.

#### Acceptance Criteria

1. THE System SHALL use a Lambda authorizer on API_Gateway to validate the Cognito JWT token and extract the user's role before routing any request to a business-logic Lambda.
2. THE System SHALL enforce that Students can only read, create, or update their own complaints; any cross-user access attempt SHALL return 403 Forbidden.
3. THE System SHALL enforce that Admin endpoints are accessible only to users whose Cognito JWT contains the Admin role claim.
4. THE System SHALL assign IAM roles to each Lambda function with only the permissions required for that function's operations (least-privilege).
5. THE System SHALL never include AWS credentials, secret keys, or resource ARNs as hardcoded literals in source code or configuration files committed to version control.
6. THE System SHALL read all AWS resource identifiers (Cognito User Pool ID, Cognito App Client ID, DynamoDB table names, S3 bucket name, SES sender address) from environment variables at Lambda runtime.
7. THE System SHALL validate all incoming API request bodies against a defined schema; IF validation fails, THEN THE System SHALL return a 400 Bad Request with details of the violations.
8. THE System SHALL enforce HTTPS for all API_Gateway and frontend communications.
9. WHEN a Lambda function cold-starts, THE System SHALL verify that all required environment variables are present and log a CloudWatch error if any are missing.

---

### Requirement 12: Monitoring and Logging

**User Story:** As a developer, I want Lambda functions to emit structured logs to CloudWatch, so that I can diagnose issues in production.

#### Acceptance Criteria

1. WHEN a Lambda function handles a request, THE System SHALL emit a structured log entry to CloudWatch containing the request ID, operation name, and outcome (success or error code).
2. WHEN a Lambda function encounters an unhandled exception, THE System SHALL log the full error stack trace to CloudWatch before returning a 500 Internal Server Error response.
3. THE System SHALL create a dedicated CloudWatch log group per Lambda function with a defined log retention period.
4. THE System SHALL log each complaint status transition to CloudWatch including the Complaint_ID, old status, new status, and Admin identifier.

---

### Requirement 13: Frontend Application and UI Pages

**User Story:** As a user, I want a clean, responsive web interface with clear navigation, so that I can use the system comfortably on any device.

#### Acceptance Criteria

1. THE System SHALL provide a React.js + Vite single-page application as the frontend.
2. THE System SHALL display a responsive layout that adapts correctly to desktop (≥1024 px), tablet (768 px–1023 px), and mobile (<768 px) viewport widths.
3. THE System SHALL provide the following pages for unauthenticated users: Login and Register.
4. THE System SHALL provide the following pages for authenticated Students: Student Dashboard, Submit Complaint, My Complaints, Complaint Details, and Profile.
5. THE System SHALL provide the following pages for authenticated Admins: Admin Dashboard, All Complaints, Complaint Details, Analytics, and Profile.
6. WHEN an API request is in progress, THE System SHALL display a loading indicator to the user.
7. IF an API request fails, THEN THE System SHALL display a human-readable error message without exposing internal error details or stack traces.
8. WHEN a list or table has no records to display, THE System SHALL show an empty-state message explaining there are no items.
9. THE System SHALL use status badges, priority badges, and colour-coded indicators to make Complaint_Status and Priority immediately recognisable in all list and detail views.
10. THE System SHALL use icons, cards, and data tables to present complaint information clearly in both student and admin views.

---

### Requirement 14: Analytics Page

**User Story:** As an Admin, I want a dedicated analytics page with charts and statistics, so that I can identify trends and make informed maintenance decisions.

#### Acceptance Criteria

1. WHEN an authenticated Admin loads the analytics page, THE System SHALL display complaint counts grouped by Category as a chart.
2. WHEN an authenticated Admin loads the analytics page, THE System SHALL display complaint counts grouped by building as a chart.
3. WHEN an authenticated Admin loads the analytics page, THE System SHALL display monthly complaint submission counts for the current calendar year as a time-series chart.
4. WHEN an authenticated Admin loads the analytics page, THE System SHALL display the distribution of complaints by Priority as a chart.
5. WHEN an authenticated Admin loads the analytics page, THE System SHALL display the average resolution time per Category.

---

### Requirement 15: API Endpoints

**User Story:** As a developer, I want a well-defined REST API, so that the frontend and backend are cleanly decoupled and the API can be tested independently.

#### Acceptance Criteria

1. THE System SHALL expose the following student-scoped API endpoints via API_Gateway:
   - POST /complaints — create a new complaint
   - GET /complaints — list the authenticated Student's complaints
   - GET /complaints/{id} — retrieve a specific complaint by Complaint_ID
   - PUT /complaints/{id} — update a complaint (student-editable fields only, while PENDING)
   - DELETE /complaints/{id} — delete a complaint (only while PENDING)
2. THE System SHALL expose the following admin-scoped API endpoints via API_Gateway:
   - GET /admin/complaints — list all complaints with filter and search parameters
   - GET /admin/complaints/{id} — retrieve full complaint details
   - PUT /admin/complaints/{id}/status — update Complaint_Status
   - PUT /admin/complaints/{id}/assign — assign complaint to a Staff member
   - POST /admin/complaints/{id}/comment — add an admin comment
   - GET /admin/dashboard — retrieve dashboard statistics
   - GET /admin/analytics — retrieve analytics data
3. THE System SHALL return consistent JSON response envelopes with a success flag, data payload, and error message field on all endpoints.
4. WHEN an API endpoint receives an unsupported HTTP method, THE System SHALL return a 405 Method Not Allowed response.

---

### Requirement 16: DynamoDB Data Design

**User Story:** As a developer, I want an efficient DynamoDB table design with appropriate keys and indexes, so that all required query patterns are supported without table scans.

#### Acceptance Criteria

1. THE System SHALL maintain a Users table in DynamoDB with the Cognito user sub as the partition key.
2. THE System SHALL maintain a Complaints table in DynamoDB with Complaint_ID as the partition key.
3. THE Complaints table SHALL include a Global Secondary Index on studentId to support efficient retrieval of all complaints by a specific Student.
4. THE Complaints table SHALL include a Global Secondary Index on Complaint_Status to support efficient filtering by status.
5. THE Complaints table SHALL store the Status_History as a list attribute within each complaint record.
6. THE Complaints table SHALL store admin comments as a list attribute within each complaint record, each entry containing the comment text, Admin identifier, and timestamp.
7. THE System SHALL store the S3 object key (not the full URL) for complaint images in the Complaints table.

---

### Requirement 17: Optional AI-Assisted Complaint Classification

**User Story:** As a Student, I want the system to suggest a Category, Priority, and Location Type based on my free-text description, so that I can fill in the complaint form faster and more accurately.

#### Acceptance Criteria

1. WHERE the AI_Classifier feature is enabled, WHEN a Student enters a free-text description in the complaint form, THE System SHALL invoke an AWS AI service to analyse the text and return suggested values for Category, Priority, and Location Type.
2. WHERE the AI_Classifier feature is enabled, THE System SHALL present the suggestions to the Student as pre-filled form fields that the Student can review and modify before submitting.
3. WHERE the AI_Classifier feature is disabled or the AWS AI service call fails, THE System SHALL allow the Student to fill in all complaint fields manually without any degradation in core functionality.
4. THE System SHALL use only AWS-native AI services (such as Amazon Comprehend or Amazon Bedrock) for the AI_Classifier feature.
5. IF the AI_Classifier AWS service call returns an error, THEN THE System SHALL log the error to CloudWatch and proceed with an empty suggestion set rather than blocking complaint submission.
6. THE System SHALL control the AI_Classifier feature via an environment variable flag so that it can be enabled or disabled without a code deployment.

---

### Requirement 18: Project Setup and Structure

**User Story:** As a developer, I want a well-organised project structure, so that the codebase is easy to navigate and extend.

#### Acceptance Criteria

1. THE System SHALL organise the codebase into the following top-level directories: frontend/, backend/, infrastructure/, and docs/.
2. THE backend/ directory SHALL contain sub-directories for lambdas/, services/, models/, and utils/.
3. THE System SHALL include a README.md at the project root containing: project overview, problem statement, proposed solution, feature list, technology stack, AWS architecture description, database design, API documentation, folder structure, local setup instructions, AWS configuration steps, deployment instructions, security considerations, and future enhancement ideas.
4. THE System SHALL document all required IAM permissions in the README.md.
5. THE System SHALL include environment variable reference documentation listing every required variable, its purpose, and an example value (with secrets replaced by placeholders).
