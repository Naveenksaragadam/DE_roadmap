# Docker Reference Guide for Data Engineers

## Table of Contents
1. [Docker Fundamentals](#docker-fundamentals)
2. [Essential Docker Commands](#essential-docker-commands)
3. [Dockerfile Best Practices for Data Engineering](#dockerfile-best-practices)
4. [Data Engineering Specific Patterns](#data-engineering-patterns)
5. [Docker Compose for Data Pipelines](#docker-compose)
6. [Volume Management and Data Persistence](#volume-management)
7. [Networking for Data Services](#networking)
8. [Common Data Engineering Docker Images](#common-images)
9. [Performance Optimization](#performance-optimization)
10. [Troubleshooting](#troubleshooting)

## Docker Fundamentals

### Core Concepts
- **Image**: Read-only template used to create containers
- **Container**: Running instance of an image
- **Dockerfile**: Text file containing instructions to build an image
- **Registry**: Storage and distribution system for Docker images
- **Volume**: Persistent data storage mechanism
- **Network**: Communication layer between containers

### Container vs Virtual Machine
- Containers share the host OS kernel (lightweight)
- VMs include full OS (resource-heavy)
- Containers start faster and use fewer resources

## Essential Docker Commands

### Image Management
```bash
# List images
docker images
docker image ls

# Pull image from registry
docker pull postgres:13
docker pull apache/airflow:2.5.0

# Build image from Dockerfile
docker build -t my-data-app:v1.0 .
docker build -f Dockerfile.prod -t my-app:prod .

# Remove images
docker rmi image_name
docker image prune  # Remove unused images
```

### Container Management
```bash
# Run container
docker run -d --name postgres-db postgres:13
docker run -it --rm python:3.9 bash  # Interactive with auto-cleanup

# List containers
docker ps          # Running containers
docker ps -a       # All containers

# Stop/Start containers
docker stop container_name
docker start container_name
docker restart container_name

# Remove containers
docker rm container_name
docker container prune  # Remove stopped containers

# View logs
docker logs container_name
docker logs -f container_name  # Follow logs
```

### Execution and Inspection
```bash
# Execute commands in running container
docker exec -it container_name bash
docker exec container_name python script.py

# Inspect container details
docker inspect container_name

# View container resource usage
docker stats
docker stats container_name
```

## Dockerfile Best Practices

### Basic Structure
```dockerfile
# Use official base images
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies first (better caching)
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (leverage layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -u 1000 dataeng && chown -R dataeng:dataeng /app
USER dataeng

# Expose port if needed
EXPOSE 8000

# Set entrypoint
CMD ["python", "main.py"]
```

### Multi-stage Builds for Data Engineering
```dockerfile
# Build stage
FROM python:3.9 as builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Production stage
FROM python:3.9-slim
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .
ENV PATH=/root/.local/bin:$PATH
CMD ["python", "etl_pipeline.py"]
```

## Data Engineering Patterns

### ETL Pipeline Container
```dockerfile
FROM python:3.9-slim

# Install data engineering tools
RUN pip install pandas numpy sqlalchemy psycopg2-binary

# Copy ETL scripts
COPY etl/ /app/etl/
COPY config/ /app/config/

WORKDIR /app

# Environment variables for configuration
ENV DB_HOST=localhost
ENV DB_PORT=5432
ENV DB_NAME=datawarehouse

CMD ["python", "-m", "etl.main"]
```

### Apache Spark Container
```dockerfile
FROM bitnami/spark:3.3

USER root

# Install additional Python packages
RUN pip install pandas pyarrow delta-spark

# Copy Spark applications
COPY spark_jobs/ /opt/spark_jobs/

USER 1001

ENTRYPOINT ["/opt/bitnami/spark/bin/spark-submit"]
```

## Docker Compose for Data Pipelines

### Basic Data Stack
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: datawarehouse
      POSTGRES_USER: dataeng
      POSTGRES_PASSWORD: password123
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  airflow-webserver:
    image: apache/airflow:2.5.0
    depends_on:
      - postgres
      - redis
    environment:
      AIRFLOW__CORE__EXECUTOR: CeleryExecutor
      AIRFLOW__CORE__SQL_ALCHEMY_CONN: postgresql+psycopg2://dataeng:password123@postgres/datawarehouse
      AIRFLOW__CELERY__BROKER_URL: redis://redis:6379/0
    volumes:
      - ./dags:/opt/airflow/dags
      - ./plugins:/opt/airflow/plugins
    ports:
      - "8080:8080"

  etl-pipeline:
    build: .
    depends_on:
      - postgres
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: datawarehouse
      DB_USER: dataeng
      DB_PASSWORD: password123
    volumes:
      - ./data:/app/data

volumes:
  postgres_data:
```

### Kafka Data Streaming Stack
```yaml
version: '3.8'

services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.2.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000

  kafka:
    image: confluentinc/cp-kafka:7.2.0
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1

  kafka-producer:
    build:
      context: ./producer
    depends_on:
      - kafka
    environment:
      KAFKA_BOOTSTRAP_SERVERS: kafka:9092

  kafka-consumer:
    build:
      context: ./consumer
    depends_on:
      - kafka
    environment:
      KAFKA_BOOTSTRAP_SERVERS: kafka:9092
```

## Volume Management

### Volume Types
```bash
# Named volumes (managed by Docker)
docker volume create data_volume
docker run -v data_volume:/data postgres:13

# Bind mounts (host directory)
docker run -v /host/path:/container/path postgres:13
docker run -v $(pwd)/data:/data postgres:13

# Tmpfs mounts (memory)
docker run --tmpfs /tmp postgres:13
```

### Data Persistence Patterns
```yaml
# In docker-compose.yml
services:
  postgres:
    image: postgres:13
    volumes:
      # Named volume for database files
      - postgres_data:/var/lib/postgresql/data
      # Bind mount for initialization scripts
      - ./init-scripts:/docker-entrypoint-initdb.d
      # Bind mount for backups
      - ./backups:/backups

volumes:
  postgres_data:
    driver: local
```

## Networking

### Network Types
```bash
# List networks
docker network ls

# Create custom network
docker network create data_network

# Run containers on custom network
docker run --network data_network --name db postgres:13
docker run --network data_network --name app my-app:latest
```

### Service Discovery
```yaml
# In docker-compose.yml - services can reach each other by name
services:
  database:
    image: postgres:13
    
  application:
    image: my-app:latest
    environment:
      # Use service name as hostname
      DATABASE_HOST: database
      DATABASE_PORT: 5432
```

## Common Data Engineering Docker Images

### Databases
```bash
# PostgreSQL
docker run -d --name postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:13

# MongoDB
docker run -d --name mongo \
  -p 27017:27017 \
  mongo:5.0

# Redis
docker run -d --name redis \
  -p 6379:6379 \
  redis:7-alpine
```

### Processing Engines
```bash
# Apache Spark
docker run -it --rm \
  -p 8080:8080 \
  -v $(pwd):/workspace \
  bitnami/spark:3.3

# Apache Flink
docker run -it --rm \
  -p 8081:8081 \
  flink:1.15-java11
```

### Orchestration
```bash
# Apache Airflow
docker run -d --name airflow \
  -p 8080:8080 \
  -v $(pwd)/dags:/opt/airflow/dags \
  apache/airflow:2.5.0

# Prefect
docker run -d --name prefect \
  -p 4200:4200 \
  prefecthq/prefect:2.0-python3.9
```

## Performance Optimization

### Resource Limits
```yaml
services:
  data-processor:
    image: my-processor:latest
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G
```

### Dockerfile Optimization
```dockerfile
# Use specific versions
FROM python:3.9.16-slim

# Combine RUN commands to reduce layers
RUN apt-get update && apt-get install -y \
    gcc \
    && pip install pandas numpy \
    && apt-get remove -y gcc \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

# Use .dockerignore to exclude unnecessary files
# Create .dockerignore file with:
# __pycache__
# *.pyc
# .git
# .pytest_cache
# tests/
```

### Build Optimization
```bash
# Use build context efficiently
docker build -t my-app .

# Use multi-platform builds
docker buildx build --platform linux/amd64,linux/arm64 -t my-app .

# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker build -t my-app .
```

## Troubleshooting

### Common Issues and Solutions

#### Container Won't Start
```bash
# Check logs
docker logs container_name

# Check exit code
docker ps -a

# Run in interactive mode for debugging
docker run -it image_name bash
```

#### Permission Issues
```bash
# Check user inside container
docker exec container_name id

# Fix with proper user
RUN useradd -m -u $(id -u) -g $(id -g) myuser
USER myuser
```

#### Memory/Resource Issues
```bash
# Monitor resource usage
docker stats

# Set memory limits
docker run -m 2g my-app

# Clean up resources
docker system prune -a
```

#### Networking Issues
```bash
# Test connectivity
docker exec container_name ping other_container

# Check port mapping
docker port container_name

# Inspect network configuration
docker network inspect bridge
```

### Debugging Commands
```bash
# Interactive debugging
docker run -it --rm --entrypoint bash image_name

# Copy files from container
docker cp container_name:/path/to/file ./local/path

# Inspect image layers
docker history image_name

# View container processes
docker exec container_name ps aux
```

## Quick Reference Commands

### Daily Operations
```bash
# Start data stack
docker-compose up -d

# View all logs
docker-compose logs -f

# Scale service
docker-compose up --scale worker=3

# Stop everything
docker-compose down

# Update and restart service
docker-compose pull service_name
docker-compose up -d service_name

# Clean up
docker system prune
docker volume prune
```

### Environment Variables
```bash
# Pass environment variables
docker run -e DB_HOST=postgres -e DB_PORT=5432 my-app

# Use .env file
docker run --env-file .env my-app

# In docker-compose.yml
environment:
  - DB_HOST=postgres
  - DB_PORT=5432
```

This reference guide covers the essential Docker concepts and patterns specifically relevant to data engineering workflows. Use it as a quick reference during development and deployment of your data pipelines.