#!/bin/bash

set -e

# Configuration
AWS_REGION=${AWS_REGION:-us-east-1}
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
CLUSTER_NAME="loomi-cluster"

echo "🚀 Starting deployment to AWS ECS"
echo "Region: $AWS_REGION"
echo "Account: $AWS_ACCOUNT_ID"

# Create ECR repositories if they don't exist
echo "📦 Creating ECR repositories..."
for service in users-service transactions-service gateway; do
  aws ecr describe-repositories --repository-names loomi-$service --region $AWS_REGION 2>/dev/null || \
  aws ecr create-repository --repository-name loomi-$service --region $AWS_REGION
done

# Build and push Docker images
echo "🐳 Building and pushing Docker images..."
ECR_REGISTRY="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

# Build and push each service
for service in users transactions gateway; do
  echo "Building loomi-$service-service..."
  docker build -t loomi-$service-service:latest -f services/$service/Dockerfile .
  docker tag loomi-$service-service:latest $ECR_REGISTRY/loomi-$service-service:latest
  docker push $ECR_REGISTRY/loomi-$service-service:latest
done

# Create ECS cluster if it doesn't exist
echo "🏗️  Creating ECS cluster..."
aws ecs describe-clusters --clusters $CLUSTER_NAME --region $AWS_REGION 2>/dev/null || \
aws ecs create-cluster --cluster-name $CLUSTER_NAME --region $AWS_REGION

# Register task definitions
echo "📋 Registering task definitions..."
for service in users-service transactions-service gateway; do
  sed "s/ACCOUNT_ID/$AWS_ACCOUNT_ID/g; s/REGION/$AWS_REGION/g" \
    infrastructure/aws/task-definitions/$service.json > /tmp/$service-task-def.json
  aws ecs register-task-definition --cli-input-json file:///tmp/$service-task-def.json --region $AWS_REGION
done

echo "✅ Deployment completed successfully!"
echo ""
echo "Next steps:"
echo "1. Create VPC and networking (see infrastructure/aws/setup-networking.sh)"
echo "2. Create RDS databases (see infrastructure/aws/setup-rds.sh)"
echo "3. Create ElastiCache Redis cluster"
echo "4. Create MSK Kafka cluster"
echo "5. Create ECS services with the registered task definitions"
echo "6. Configure Application Load Balancer"
echo ""
echo "For detailed instructions, see docs/DEPLOYMENT.md"

