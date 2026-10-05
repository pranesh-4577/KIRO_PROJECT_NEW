#!/bin/bash
# Smart Campus - AWS Resource Setup Script
# Run this ONCE to create required AWS resources.
# Prerequisites: AWS CLI configured with appropriate IAM permissions.

set -e

REGION="us-east-1"
APP_NAME="smart-campus"

echo "=== Smart Campus AWS Setup ==="
echo "Region: $REGION"

# ---- 1. Create DynamoDB Tables ----
echo ""
echo "Creating DynamoDB tables..."

aws dynamodb create-table \
  --table-name smart-campus-complaints \
  --billing-mode PAY_PER_REQUEST \
  --attribute-definitions \
    AttributeName=complaintId,AttributeType=S \
    AttributeName=studentId,AttributeType=S \
    AttributeName=status,AttributeType=S \
  --key-schema AttributeName=complaintId,KeyType=HASH \
  --global-secondary-indexes \
    "[{\"IndexName\":\"studentId-index\",\"KeySchema\":[{\"AttributeName\":\"studentId\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}},{\"IndexName\":\"status-index\",\"KeySchema\":[{\"AttributeName\":\"status\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}}]" \
  --region $REGION || echo "Table already exists or error — continuing..."

aws dynamodb create-table \
  --table-name smart-campus-users \
  --billing-mode PAY_PER_REQUEST \
  --attribute-definitions AttributeName=userId,AttributeType=S \
  --key-schema AttributeName=userId,KeyType=HASH \
  --region $REGION || echo "Table already exists — continuing..."

aws dynamodb create-table \
  --table-name smart-campus-counters \
  --billing-mode PAY_PER_REQUEST \
  --attribute-definitions AttributeName=counterId,AttributeType=S \
  --key-schema AttributeName=counterId,KeyType=HASH \
  --region $REGION || echo "Table already exists — continuing..."

echo "✅ DynamoDB tables created."

# ---- 2. Create S3 Bucket ----
echo ""
echo "Creating S3 bucket..."

BUCKET_NAME="$APP_NAME-complaints-images-$(aws sts get-caller-identity --query Account --output text)"

aws s3api create-bucket \
  --bucket $BUCKET_NAME \
  --region $REGION \
  --create-bucket-configuration LocationConstraint=$REGION || echo "Bucket already exists — continuing..."

# Block all public access
aws s3api put-public-access-block \
  --bucket $BUCKET_NAME \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

echo "✅ S3 bucket: $BUCKET_NAME"

# ---- 3. Cognito User Pool ----
echo ""
echo "Creating Cognito User Pool..."

POOL_ID=$(aws cognito-idp create-user-pool \
  --pool-name "smart-campus-users" \
  --policies '{"PasswordPolicy":{"MinimumLength":8,"RequireUppercase":true,"RequireLowercase":true,"RequireNumbers":true}}' \
  --auto-verified-attributes email \
  --schema '[{"Name":"name","AttributeDataType":"String","Required":true}]' \
  --region $REGION \
  --query 'UserPool.Id' --output text)

echo "User Pool ID: $POOL_ID"

CLIENT_ID=$(aws cognito-idp create-user-pool-client \
  --user-pool-id $POOL_ID \
  --client-name "smart-campus-web" \
  --no-generate-secret \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH ALLOW_USER_SRP_AUTH \
  --region $REGION \
  --query 'UserPoolClient.ClientId' --output text)

echo "App Client ID: $CLIENT_ID"

# Create admin group
aws cognito-idp create-group \
  --group-name admin \
  --user-pool-id $POOL_ID \
  --description "System administrators" \
  --region $REGION

echo "✅ Cognito User Pool created."

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Add these values to your .env files:"
echo "  COGNITO_USER_POOL_ID=$POOL_ID"
echo "  COGNITO_CLIENT_ID=$CLIENT_ID"
echo "  S3_BUCKET_NAME=$BUCKET_NAME"
echo ""
echo "Frontend (.env):"
echo "  VITE_COGNITO_USER_POOL_ID=$POOL_ID"
echo "  VITE_COGNITO_CLIENT_ID=$CLIENT_ID"
echo ""
echo "Remember to:"
echo "  1. Verify an email address in SES (sandbox mode)"
echo "  2. Create an admin user and add to 'admin' group in Cognito"
