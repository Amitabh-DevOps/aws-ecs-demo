# AWS ECR & ECS Fargate — Beginner Guide & Hands-on Demo

Welcome! This repository contains a production-ready Node.js application and complete step-by-step documentation for deploying containerized applications to **AWS ECR (Elastic Container Registry)** and **AWS ECS (Elastic Container Service)** using **AWS Fargate**.

---

## 🏗️ Architecture Overview

```
+--------------------------+         +-----------------------+         +-------------------------------+
|  Build Host / EC2 Ubuntu |  Push   | AWS ECR               |  Pull   | AWS ECS Fargate               |
|  - app.js                | ------->| (Private Repository)  | ------->| (Serverless Container Task)   |
|  - Dockerfile            |         | ecs-demo-app:latest   |         | Public IP: Port 3000          |
+--------------------------+         +-----------------------+         +-------------------------------+
```

---

## 📋 Prerequisites

Before starting, ensure you have:
1. An active **AWS Account**.
2. An **AWS EC2 Ubuntu Instance** (or local machine) configured with:
   * **Git**
   * **Docker**
   * **AWS CLI v2** (configured via `aws configure` or an attached IAM EC2 Role).

---

## 🚀 Step-by-Step Deployment Guide

### 1. Setup Environment (Ubuntu EC2 Setup)

If you are using a fresh AWS EC2 Ubuntu instance as your build machine, run:

```bash
# Update package list and install Docker & Git
sudo apt update -y
sudo apt install docker.io git -y

# Enable and start Docker service
sudo systemctl enable --now docker

# Allow current user to run Docker without sudo
sudo usermod -aG docker $USER
newgrp docker
```

To install **AWS CLI v2** on Ubuntu:
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
aws --version
```

---

### 2. Clone Repository & Test Locally

```bash
# Clone repository
git clone <YOUR_GITHUB_REPO_URL>
cd aws-ecr-ecs

# Build local Docker image
docker build -t ecs-demo-app .

# Run container locally to verify
docker run -d -p 3000:3000 --name demo-app ecs-demo-app

# Verify container response
curl http://localhost:3000
```

---

### 3. Create ECR Repository & Push Image

Set your AWS credentials and environment variables:

```bash
export AWS_REGION="us-east-1"
export ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export REPO_NAME="ecs-demo-app"

# Step A: Authenticate Docker with AWS ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Step B: Create ECR Repository
aws ecr create-repository --repository-name $REPO_NAME --region $AWS_REGION

# Step C: Tag Image for ECR
# (Note: Use --platform linux/amd64 if building on Apple Silicon Mac)
docker tag $REPO_NAME:latest $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$REPO_NAME:latest

# Step D: Push Image to AWS ECR
docker push $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$REPO_NAME:latest
```

---

### 4. Deploy on AWS ECS Fargate

1. **Open AWS ECS Console** ➔ Navigate to **Task Definitions** ➔ Click **Create new task definition**.
   * **Name:** `ecs-demo-task`
   * **Infrastructure:** AWS Fargate (Serverless)
   * **OS/Architecture:** Linux/x86_64
   * **CPU & Memory:** 0.25 vCPU, 0.5 GB RAM
   * **Container Details:**
     * **Name:** `demo-container`
     * **Image URI:** Copy full ECR Image URI from Step 3.
     * **Port Mapping:** `3000` (TCP).
2. **Create ECS Cluster:**
   * Navigate to **Clusters** ➔ Click **Create cluster**.
   * **Cluster Name:** `ecs-demo-cluster` ➔ Select **AWS Fargate** compute.
3. **Deploy ECS Service:**
   * Inside `ecs-demo-cluster`, click **Deploy** under Services.
   * Select Task Definition `ecs-demo-task`.
   * Desired Tasks: `1`.
   * **Networking:** Choose default VPC, public subnets, and **TURN ON "Auto-assign Public IP"**.
   * **Security Group:** Add an Inbound Rule for **Custom TCP - Port 3000** from `0.0.0.0/0`.
4. **Access Application:**
   * Open the running Task ➔ Copy **Public IP** ➔ Open `http://<PUBLIC_IP>:3000` in browser!

---

## ⚠️ Common Gotchas & Troubleshooting

| Issue | Cause | Fix |
| :--- | :--- | :--- |
| **`exec format error`** | Docker image built on ARM (Apple Silicon M1/M2/M3) without target architecture specified. | Build image using `docker build --platform linux/amd64 -t ecs-demo-app .` |
| **Cannot pull image from ECR** | Fargate task launched without public internet access. | Ensure task is in a Public Subnet with **Auto-assign Public IP = ENABLED** (or NAT Gateway). |
| **Page Timeout / Connection Refused** | Security Group missing inbound rule for port 3000. | Edit Task Security Group ➔ Add Inbound Rule: TCP Port 3000 from `0.0.0.0/0`. |
| **Permission Denied (Docker on EC2)** | Ubuntu user not added to `docker` group. | Run `sudo usermod -aG docker $USER` then `newgrp docker`. |

---

## 🧹 Resource Cleanup Checklist (Avoid AWS Charges)

To prevent ongoing charges after completing the tutorial:
1. Delete the **ECS Service** and **Cluster**.
2. Delete the **ECR Repository** and stored Docker images.
3. Terminate the **EC2 Instance** if used solely as a temporary build host.
