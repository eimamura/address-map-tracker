# Infrastructure

This directory contains the Terraform configuration for deploying the Address Map Tracker to AWS.

## Architecture

- **ECS Fargate**: Hosted in a private subnet, running the Next.js application.
- **ALB (Application Load Balancer)**: Public facing, forwards traffic to ECS.
- **RDS PostgreSQL**: Managed database for persistent storage.
- **Secrets Manager**: Stores sensitive credentials (DB password, JWT secret, Amazon Location keys).
- **Amazon Location Service**: Used for geocoding.

## Directory Structure

- `modules/`: Reusable Terraform modules (ECS, RDS, Networking, Secrets).
- `envs/dev/`: Environment-specific configuration for Development.

## Setup & Deployment

1. **Prerequisites**:
   - AWS CLI configured with appropriate permissions.
   - Terraform installed (>= 1.0).

2. **Initialize**:
   ```bash
   cd infra/envs/dev
   terraform init
   ```

3. **Plan**:
   ```bash
   terraform plan -out=tfplan
   ```

4. **Apply**:
   ```bash
   terraform apply tfplan
   ```

## Modules

The modules are designed to be minimal but complete for an MVP.

- `networking`: Creates VPC (or uses default), Subnets, Security Groups, ALB.
- `ecs`: Creates ECS Cluster, Task Definition, Service.
- `rds`: Creates RDS Instance.
- `secrets`: Manages secrets in AWS Secrets Manager.

## Notes

- **State Management**: Local state is used by default. For production, configure an S3 backend in `main.tf`.
- **Variables**: Update `variables.tf` in `envs/dev` to customize region, app name, etc.
