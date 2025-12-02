#!/bin/bash

# Script to set up AWS Systems Manager Parameter Store values for virtual-classroom
# Usage: ./setup-aws-parameters.sh

# Set your AWS region
REGION="us-east-1"  # Change this to your region

echo "Setting up Parameter Store values for virtual-classroom..."
echo "Region: $REGION"
echo ""

# Read values from your local .env files or prompt for them
read -p "Enter AGORA_APP_ID: " AGORA_APP_ID
read -p "Enter AGORA_APP_CERTIFICATE: " AGORA_APP_CERTIFICATE
read -p "Enter AGORA_WHITEBOARD_APP_ID: " AGORA_WHITEBOARD_APP_ID
read -p "Enter AGORA_WHITEBOARD_SDK_TOKEN: " AGORA_WHITEBOARD_SDK_TOKEN
read -p "Enter AGORA_WHITEBOARD_APP_SECRET: " AGORA_WHITEBOARD_APP_SECRET
read -p "Enter AGORA_WHITEBOARD_AK: " AGORA_WHITEBOARD_AK
read -p "Enter AGORA_WHITEBOARD_SK: " AGORA_WHITEBOARD_SK
read -p "Enter BACKEND_URL: " BACKEND_URL
read -p "Enter OPENAI_API_KEY: " OPENAI_API_KEY
read -p "Enter JWT_SECRET: " JWT_SECRET

echo ""
echo "Creating parameters..."

# Create parameters (using SecureString for sensitive data)
aws ssm put-parameter --region $REGION --name "/virtual-classroom/agora_app_id" --value "$AGORA_APP_ID" --type "SecureString" --overwrite
aws ssm put-parameter --region $REGION --name "/virtual-classroom/agora_app_certificate" --value "$AGORA_APP_CERTIFICATE" --type "SecureString" --overwrite
aws ssm put-parameter --region $REGION --name "/virtual-classroom/whiteboard_app_id" --value "$AGORA_WHITEBOARD_APP_ID" --type "SecureString" --overwrite
aws ssm put-parameter --region $REGION --name "/virtual-classroom/whiteboard_sdk_token" --value "$AGORA_WHITEBOARD_SDK_TOKEN" --type "SecureString" --overwrite
aws ssm put-parameter --region $REGION --name "/virtual-classroom/whiteboard_app_secret" --value "$AGORA_WHITEBOARD_APP_SECRET" --type "SecureString" --overwrite
aws ssm put-parameter --region $REGION --name "/virtual-classroom/whiteboard_ak" --value "$AGORA_WHITEBOARD_AK" --type "SecureString" --overwrite
aws ssm put-parameter --region $REGION --name "/virtual-classroom/whiteboard_sk" --value "$AGORA_WHITEBOARD_SK" --type "SecureString" --overwrite
aws ssm put-parameter --region $REGION --name "/virtual-classroom/backend_url" --value "$BACKEND_URL" --type "String" --overwrite
aws ssm put-parameter --region $REGION --name "/virtual-classroom/openai_api_key" --value "$OPENAI_API_KEY" --type "SecureString" --overwrite
aws ssm put-parameter --region $REGION --name "/virtual-classroom/jwt_secret" --value "$JWT_SECRET" --type "SecureString" --overwrite

echo ""
echo "✅ All parameters created successfully!"
echo ""
echo "To verify, run:"
echo "aws ssm get-parameters-by-path --region $REGION --path /virtual-classroom --recursive"
