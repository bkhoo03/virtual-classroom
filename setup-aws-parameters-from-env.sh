#!/bin/bash

# Script to set up AWS Systems Manager Parameter Store from .env files
# Usage: ./setup-aws-parameters-from-env.sh

REGION="us-east-1"  # Change this to your region

echo "Setting up Parameter Store values from .env files..."
echo "Region: $REGION"
echo ""

# Load from virtual-classroom/.env
if [ -f "virtual-classroom/.env" ]; then
    source virtual-classroom/.env
    echo "✓ Loaded virtual-classroom/.env"
fi

# Load from virtual-classroom/backend/.env
if [ -f "virtual-classroom/backend/.env" ]; then
    source virtual-classroom/backend/.env
    echo "✓ Loaded virtual-classroom/backend/.env"
fi

echo ""
echo "Creating parameters..."

# Create parameters
aws ssm put-parameter --region $REGION --name "/virtual-classroom/agora_app_id" --value "${AGORA_APP_ID:-placeholder}" --type "SecureString" --overwrite
aws ssm put-parameter --region $REGION --name "/virtual-classroom/agora_app_certificate" --value "${AGORA_APP_CERTIFICATE:-placeholder}" --type "SecureString" --overwrite
aws ssm put-parameter --region $REGION --name "/virtual-classroom/whiteboard_app_id" --value "${AGORA_WHITEBOARD_APP_ID:-placeholder}" --type "SecureString" --overwrite
aws ssm put-parameter --region $REGION --name "/virtual-classroom/whiteboard_sdk_token" --value "${AGORA_WHITEBOARD_SDK_TOKEN:-placeholder}" --type "SecureString" --overwrite
aws ssm put-parameter --region $REGION --name "/virtual-classroom/whiteboard_app_secret" --value "${AGORA_WHITEBOARD_APP_SECRET:-placeholder}" --type "SecureString" --overwrite
aws ssm put-parameter --region $REGION --name "/virtual-classroom/whiteboard_ak" --value "${AGORA_WHITEBOARD_AK:-placeholder}" --type "SecureString" --overwrite
aws ssm put-parameter --region $REGION --name "/virtual-classroom/whiteboard_sk" --value "${AGORA_WHITEBOARD_SK:-placeholder}" --type "SecureString" --overwrite
aws ssm put-parameter --region $REGION --name "/virtual-classroom/backend_url" --value "${VITE_BACKEND_URL:-http://localhost:3001}" --type "String" --overwrite
aws ssm put-parameter --region $REGION --name "/virtual-classroom/openai_api_key" --value "${VITE_OPENAI_API_KEY:-placeholder}" --type "SecureString" --overwrite
aws ssm put-parameter --region $REGION --name "/virtual-classroom/jwt_secret" --value "${JWT_SECRET:-placeholder}" --type "SecureString" --overwrite

echo ""
echo "✅ All parameters created!"
echo ""
echo "To verify:"
echo "aws ssm get-parameters-by-path --region $REGION --path /virtual-classroom --recursive"
