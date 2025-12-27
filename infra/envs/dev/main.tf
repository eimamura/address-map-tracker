terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

locals {
  app_name = "address-map-tracker"
  env      = "dev"
}

module "networking" {
  source = "../../modules/networking"
  # app_name = local.app_name
  # env      = local.env
}

module "secrets" {
  source = "../../modules/secrets"
}

module "rds" {
  source = "../../modules/rds"
}

module "ecs" {
  source = "../../modules/ecs"
}
