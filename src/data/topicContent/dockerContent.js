// Docker & Kubernetes — Topic Deep-Dive Content
export const dockerContent = {
  'docker-k8s-0': {
    tutorial: {
      explanation: [
        'An Image is a read-only template with instructions for creating a Docker container. It contains the application code, libraries, dependencies, tools, and other files needed to run an application.',
        'A Container is a runnable instance of an image. You can create, start, stop, move, or delete a container using the Docker API or CLI. You can connect a container to one or more networks, attach storage to it, or even create a new image based on its current state.',
        'Because container engines (like Docker) use the host system\'s kernel, they share resources and are therefore extremely lightweight and fast to start compared to traditional Virtual Machines (which require compiling a full Guest OS per VM).',
      ],
      codeExamples: [
        {
          description: 'Fundamental Docker commands',
          code: `# --- IMAGE COMMANDS ---
# Pull an image from Docker Hub
docker pull postgres:15-alpine

# List all images on your local machine
docker images

# Build an image from a local Dockerfile
docker build -t my-python-app:1.0.0 .

# --- CONTAINER COMMANDS ---
# Run a container from an image
# -d (detached mode), -p (publish port Host:Container), --name (give it a name)
docker run --name pg_db -d -p 5432:5432 -e POSTGRES_PASSWORD=secret postgres:15-alpine

# List running containers
docker ps 
# List ALL containers (including stopped ones)
docker ps -a

# Stop and entirely remove a container
docker stop pg_db
docker rm pg_db`,
        },
      ],
      keyTakeaways: [
        'An Image is the "Class". A Container is the "Object" instantiated from that class.',
        'Standardization: If it works on your laptop, it runs exactly the same way in production. "It works on my machine" is solved.',
        'A container provides isolation, but it is not a VM. A Linux container must run on a Linux kernel. A Windows container must run on a Windows kernel.',
      ],
    },
    crashCourse: {
      summary: 'Docker packages an application and its dependencies into an immutable Image. When run, that image becomes an isolated process called a Container. Containers are lightweight and guarantee identical environments across dev, test, and production.',
      quickFacts: [
        'Image: Read-only template (code + dependencies).',
        'Container: A running instance of an image (process + isolation).',
        'Docker Hub: The default global public registry for downloading images.',
        'Ports: Containers run on private internal networks. Use `-p HostPort:ContainerPort` to map them out.',
      ],
      tips: [
        'Never store sensitive data (API keys, passwords) inside an Image. Always pass them via Environment Variables at runtime (`-e KEY=VALUE`).',
      ],
    },
  },
  'docker-k8s-1': {
    tutorial: {
      explanation: [
        'A Dockerfile is a simple text file containing consecutive instructions to build a Docker image. It is executed top-to-bottom. Each instruction creates a new "Layer" in the image.',
        'Docker uses a layered storage architecture and caches these layers. If you change a line of code at the bottom of your Dockerfile (e.g., in your application script), Docker only rebuilds that one layer. But if you change a line at the top (e.g., updating a dependency), Docker must rebuild that layer AND EVERY LAYER BELOW IT. This is critical for build performance.',
      ],
      codeExamples: [
        {
          description: 'A Data Engineering production Dockerfile (Python)',
          code: `# 1. Use an official, lightweight base image
# Alpine is tiny (5MB), but often causes C-compilation errors with Python libraries.
# Slim-buster is larger (43MB) but much safer for Python data science packages.
FROM python:3.9-slim-buster

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy ONLY the requirements file first!
# Why? We want Docker to cache the 'pip install' layer and NEVER rebuild it 
# unless the requirements.txt ACTUALLY changes.
COPY requirements.txt .

# 4. Install dependencies (This layer is now cached!)
RUN pip install --no-cache-dir -r requirements.txt

# 5. Now, copy your constantly changing application code
COPY . .

# 6. Set environment variables
ENV PYTHONUNBUFFERED=1 \\
    APP_ENV=production

# 7. Define the command to run when the container starts
CMD ["python", "pipeline.py"]`,
        },
      ],
      keyTakeaways: [
        'Optimize your Dockerfile for caching: Order matters! Put frequently changing lines (like `COPY . .` for app code) at the very bottom.',
        'Minimize layers: Combine multiple `RUN apt-get update && apt-get install` commands into a single `RUN` layer to reduce image size.',
        'Always clean up installation caches instantly in the same `RUN` command (e.g., `rm -rf /var/lib/apt/lists/*`) because a later `RUN` command cannot delete files from a previous layer to save space.',
      ],
    },
    crashCourse: {
      summary: 'A Dockerfile defines the blueprint for an image. Docker builds images in layers and caches them from top to bottom. To speed up builds, always copy your `requirements.txt` and install dependencies BEFORE copying your rapidly changing application code.',
      quickFacts: [
        'FROM: Defines the base image (Start here).',
        'WORKDIR: Sets the current directory inside the container.',
        'COPY: Moves files from your local host into the image.',
        'RUN: Executes commands during the BUILD phase (e.g., installing packages).',
        'CMD: The default command executed during the RUN phase (when the container starts).',
      ],
      tips: [
        'Use `.dockerignore` files (similar to `.gitignore`). This prevents massive `node_modules`, `__pycache__`, or local databases from being copied into your image and destroying build times.',
      ],
    },
  },
  'docker-k8s-2': {
    tutorial: {
      explanation: [
        'Containers are perfectly ephemeral—when a container stops or is deleted, all data inside it is destroyed forever. This is disastrous if running a database container!',
        'Volumes are the preferred mechanism for persisting data generated by and used by Docker containers. They are completely managed by Docker and are safely stored outside the container\'s filesystem on the host machine.',
        'Bind Mounts attach a specific, absolute path on your host machine directly into the container. This is primarily used for local development so that when you edit code on your laptop, the container sees the change instantly without needing a rebuild.',
      ],
      codeExamples: [
        {
          description: 'Volumes vs Bind Mounts',
          code: `# --- 1. VOLUMES (For Databases / Production Data) ---
# Create a named volume managed entirely by Docker
docker volume create pg_data

# Run Postgres, attaching the named volume to Postgres's internal data directory.
# If we delete the container, the 'pg_data' volume safely persists the database!
docker run -d \\
  --name db \\
  -v pg_data:/var/lib/postgresql/data \\
  postgres:15-alpine


# --- 2. BIND MOUNTS (For Local Development Code) ---
# Assuming you are in your project directory containing 'app.py'
# -v /path/to/my/laptop:/path/in/container
# The pwd (print working directory) maps your current folder into /usr/src/app
docker run -d \\
  --name my_api \\
  -v $(pwd):/usr/src/app \\
  python-app:latest

# If you edit app.py on your laptop, the container sees the update immediately!`,
        },
      ],
      keyTakeaways: [
        'Volumes: Use for Databases (Postgres, Mongo), long-term file storage, or sharing data between entirely separate containers.',
        'Bind Mounts: Use exclusively for live-editing code during local development.',
        'If data matters, never store it in the container\'s writable layer.',
      ],
    },
    crashCourse: {
      summary: 'Containers are ephemeral; they wipe their data when deleted. Use Volumes to persist critical database data outside the container. Use Bind Mounts for local development to map your laptop\'s code folder into the container to enable live reloading.',
      quickFacts: [
        'Ephemeral: The default state of Data inside a container. Fast but temporary.',
        'Named Volume (`-v my_vol:/app/data`): Managed by Docker. Safe, persistent storage.',
        'Bind Mount (`-v /Users/me/code:/app`): Maps a literal folder from OS to container.',
        'Anonymous Volume: Created on the fly, difficult to manage, avoid unless necessary.',
      ],
      tips: [
        'When writing an ETL job in Docker, attach a volume so the output Parquet files are written to your local disk instead of vanishing when the container stops.',
      ],
    },
  },
  'docker-k8s-3': {
    tutorial: {
      explanation: [
        'By default, Docker isolates containers completely. They cannot talk to your host machine\'s `localhost`, nor can they talk to other containers.',
        'To allow an API container to talk to a Postges container, you must create a custom Docker Network. When both containers join the same custom network, Docker provides an automated internal DNS server. This allows Container A to ping Container B using just the Container\'s Name as the hostname!',
      ],
      codeExamples: [
        {
          description: 'Connecting two isolated containers',
          code: `# 1. Create a custom bridge network
docker network create data-pipeline-net

# 2. Start a Postgres database on the network
# Give it a specific name: 'prod-db'
docker run -d \\
  --name prod-db \\
  --network data-pipeline-net \\
  -e POSTGRES_PASSWORD=secret \\
  postgres:15-alpine

# 3. Start a Python API on the same network
docker run -d \\
  --name backend-api \\
  --network data-pipeline-net \\
  -e DB_HOST=prod-db \\
  -e DB_PASS=secret \\
  my-python-api:latest
  
# The backend-api container can now connect to Postgres using the 
# hostname "prod-db" instead of tracking unpredictable IP addresses!`,
        },
      ],
      keyTakeaways: [
        'Never use IP addresses to connect containers. Always use a custom bridge network and the container name to rely on internal DNS resolution.',
        'The `--link` flag is completely deprecated. Stop using it.',
        'Port mapping (`-p 8080:80`) is ONLY required for the outside world (your laptop browser) to reach the container. Containers on the same internal network can talk to each other directly on any port without `-p` being exposed.',
      ],
    },
    crashCourse: {
      summary: 'Containers on the same custom Docker network can communicate using each other\'s container names as hostnames via automated internal DNS. No hardcoded IP addresses required.',
      quickFacts: [
        'Bridge Network (Default): Isolated network on a single host machine.',
        'Host Network: Removes isolation, binds container directly to host network interface.',
        'Overlay Network: Used in Docker Swarm to connect containers across multiple machines.',
        'Internal DNS: Resolves container names to IP addresses automatically.',
      ],
      tips: [
        'If a container script is trying to connect to a DB running locally on your Mac/Windows machine, it cannot use `localhost` (that points to the container itself). Use the magic hostname `host.docker.internal` instead.',
      ],
    },
  },
  'docker-k8s-4': {
    tutorial: {
      explanation: [
        'Running `docker run` commands with 15 flags for a multi-container architecture is unmaintainable. Docker Compose is a tool for defining and running multi-container Docker applications.',
        'You use a YAML file (`docker-compose.yml`) to configure your application\'s services, networks, and volumes collaboratively. Then, with a single command (`docker-compose up`), you create and start all the services from your configuration.',
        'Docker Compose automatically creates a shared bridge network for all defined services, meaning they can all talk to each other instantly using their service names.',
      ],
      codeExamples: [
        {
          description: 'A Data Engineering docker-compose.yml stack',
          code: `version: '3.8'

services:
  # The Postgres Database
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secretpassword
      POSTGRES_DB: analytics_db
    ports:
      - "5432:5432" # Publish so we can explore via DBeaver
    volumes:
      - pgdata_volume:/var/lib/postgresql/data # Persist Data!

  # The Airflow Scheduler
  airflow-scheduler:
    build: 
      context: ./airflow
      dockerfile: Dockerfile
    environment:
      - AIRFLOW__CORE__SQL_ALCHEMY_CONN=postgresql+psycopg2://admin:secretpassword@postgres:5432/analytics_db
    depends_on:
      - postgres # Ensure DB boots first!
    volumes:
      - ./dags:/opt/airflow/dags # Live bind mount the DAG folder

volumes:
  pgdata_volume: # Define the named volume globally`,
        },
      ],
      keyTakeaways: [
        'Docker Compose is the absolute standard for local development stacks. You can spin up Kafka, Postgres, Airflow, and Spark with a single file.',
        'The `depends_on` keyword dictates startup order, but it DOES NOT wait for the target container to become "healthy" (e.g., Postgres ready to accept connections), only that it booted. Use `healthcheck` configurations for true dependency waiting.',
        'Compose files replace endless shell script files full of `docker run` flags.',
      ],
    },
    crashCourse: {
      summary: 'Docker Compose uses a YAML file to define the images, volumes, environment variables, and networks for multiple containers, spinning up entire complex tech stacks with a single `docker-compose up` command.',
      quickFacts: [
        '`docker-compose up -d`: Boots the entire stack in the background.',
        '`docker-compose down -v`: Tears down the stack and destroys all named volumes (careful!).',
        '`depends_on`: Controls the startup sequence of containers.',
        'Shared Network: Compose automatically creates one network and connects all defined services.',
      ],
      tips: [
        'Instead of installing Postgres, Redis, MongoDB, and Kafka locally on your laptop (polluting your OS), use Docker Compose to spin them up instantly and tear them down cleanly when you finish working.',
      ],
    },
  },
  'docker-k8s-5': {
    tutorial: {
      explanation: [
        'Docker is great for running 3 containers on your laptop. But how do you run 5,000 containers across 100 servers in production? What happens if Server #14 dies in a fire? Kubernetes (K8s) is an orchestrator that solves this.',
        'Kubernetes automates deploying, scaling, and managing containerized applications. You give K8s a declarative state ("I want 5 copies of my web app running"), and K8s constantly works to maintain that state.',
        'K8s monitors server health, restarts dead containers automatically, handles load balancing across the cluster, securely injects secrets, and manages automated rolling deployments with zero downtime.',
      ],
      codeExamples: [
        {
          description: 'The difference between Docker and Kubernetes',
          code: `# DOCKER (Imperative: "Do exactly this right now")
# You type on Server A:
docker run -d --name app-v1 my-api
# Problem: If Server A dies, the app is gone forever.

# KUBERNETES (Declarative: "Make this truth happen")
# You tell the K8s Master API:
"Ensure there are always exactly 3 instances of 'my-api' running."
# Solution: 
# The Master API schedules them across Servers A, B, and C.
# If Server A burns down, the API instantly notices we only have 2 left.
# It automatically spins up a new replacement on Server D without you waking up.`,
        },
      ],
      keyTakeaways: [
        'Kubernetes is the Control Plane. Docker (or containerd) is just the engine running on the individual servers. K8s commands the engines.',
        'K8s uses a declarative YAML-based approach. You say *what* you want, not *how* to do it.',
        'K8s abstracts the underlying hardware. You don\'t deploy to "Server 5." You deploy to the "Cluster", and K8s handles the distribution to maximize hardware efficiency.',
      ],
    },
    crashCourse: {
      summary: 'Docker runs containers locally. Kubernetes orchestrates thousands of containers across fleets of servers. K8s handles self-healing (restarting dead apps), load balancing, and zero-downtime deployments.',
      quickFacts: [
        'Cluster: A set of worker machines (Nodes) that run containerized applications.',
        'Control Plane (Master Node): The brain of K8s. Manages scheduling and maintains desired state.',
        'Worker Node: The physical/virtual server actually running your application containers.',
        'Declarative YAML: You define the desired state; K8s actively reconciles reality to match it.',
      ],
      tips: [
        'Never install Kubernetes yourself ("K8s the hard way"). Always use managed cloud services: EKS (AWS), GKE (Google), or AKS (Azure). They handle the master node complexity for you.',
      ],
    },
  },
  'docker-k8s-6': {
    tutorial: {
      explanation: [
        'In Kubernetes, you never deploy a single Docker container directly. The smallest deployable computing unit is a Pod.',
        'A Pod is a wrapper around one or more tightly coupled containers. These containers share the exact same IP address, network ports, and storage volumes. They are guaranteed to be scheduled onto the exact same physical Worker Node.',
        'Most often, a Pod contains just a single container (the "One-Container-per-Pod" pattern). However, the classic multi-container pattern is the "Sidecar" pattern: an application container paired with an auxiliary container (e.g., a logging agent or service mesh proxy that intercepts traffic).',
      ],
      codeExamples: [
        {
          description: 'Defining a Kubernetes Pod (Manifest)',
          code: `apiVersion: v1
kind: Pod
metadata:
  name: data-ingestion-pod
  labels:
    app: ingestion
    tier: backend
spec:
  containers:
    # Main Application
    - name: python-importer
      image: my-ingestor:1.2
      resources:
        requests: # Guaranteed minimum hardware
          memory: "1Gi"
          cpu: "500m"
        limits: # Maximum allowed before K8s kills it
          memory: "2Gi"
          cpu: "1000m"
    
    # Auxiliary Sidecar (e.g., pushing logs to Splunk/Datadog)
    - name: log-forwarder-sidecar
      image: fluentd:v1.14`,
        },
      ],
      keyTakeaways: [
        'Pods are Ephemeral. They are mortal. If a node dies, the Pod dies, and K8s will NOT restart it. Do not rely on a standalone Pod.',
        'To get self-healing behavior, you must wrap a Pod inside a higher-level controller (like a Deployment or DaemonSet).',
        'Containers inside the same Pod communicate via `localhost`.',
      ],
    },
    crashCourse: {
      summary: 'A Pod is the smallest unit of deployment in Kubernetes. It wraps one or more containers that share an IP address and storage. Pods are ephemeral and mortal—they die when their node dies.',
      quickFacts: [
        'Pod: Smallest deployable unit. Usually 1 container, sometimes 2+.',
        'Sidecar Pattern: Adding a helper container (like a log shipper) into the same pod as the main app.',
        'Ephemeral: Pods are born and die. Their IPs change constantly.',
        '`kubectl get pods`: The command to list running applications in K8s.',
      ],
      tips: [
        'Always set CPU and Memory `requests` and `limits` in your Pod definitions. If you don\'t, K8s cannot accurately schedule Pods across the cluster, and one hungry app can crash an entire node (OOM).',
      ],
    },
  },
  'docker-k8s-7': {
    tutorial: {
      explanation: [
        'Because Pods are ephemeral and mortal, you should almost never create them directly. Instead, you create a Deployment.',
        'A Deployment is a declarative controller that provides self-healing and scaling for Pods. You tell a Deployment "I want 3 replicas of the frontend app". The Deployment creates a ReplicaSet, which ensures exactly 3 Pods are running at all times.',
        'If a node crashes and takes down Pod #1, the ReplicaSet detects it is currently at 2/3 desired state, and instantly spins up a replacement Pod #4 on a healthy node to restore the 3/3 state.',
      ],
      codeExamples: [
        {
          description: 'A Kubernetes Deployment Manifest',
          code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: airflow-webserver-deployment
spec:
  # The desired state! K8s will fight to keep exactly 3 alive.
  replicas: 3
  
  # How the Deployment finds the Pods it is supposed to manage
  selector:
    matchLabels:
      app: airflow-web
      
  # The blueprint for the Pods it creates
  template:
    metadata:
      labels: # These must match the selector above!
        app: airflow-web
    spec:
      containers:
      - name: webserver
        image: apache/airflow:2.6.0
        ports:
        - containerPort: 8080`,
        },
      ],
      keyTakeaways: [
        'Deployments enable Zero-Downtime Rolling Updates. When you change the Deployment to reference a new Image version (e.g., `v2.0`), K8s slowly spins up new v2 Pods and gracefully tears down v1 Pods one-by-one, ensuring users experience NO downtime during the release.',
        'You can instantly scale an application globally using `kubectl scale deployment my-app --replicas=100`.',
        'StatefulSets are the cousin to Deployments. While Deployments are for stateless apps (APIs), StatefulSets are designed to run stateful databases in K8s, guaranteeing sticky identities and persistent disk attachments across restarts.',
      ],
    },
    crashCourse: {
      summary: 'A Deployment dictates the desired state for an application. It provides self-healing (restarting dead Pods), horizontal scaling, and zero-downtime rolling upgrades.',
      quickFacts: [
        'Deployment: Manages stateless applications. Handles updates and rollbacks.',
        'ReplicaSet: The sub-controller ensuring exactly N pods are running at all times.',
        'Rolling Update: Gradually replacing old Pods with new Pods to prevent downtime during releases.',
        'StatefulSet: The controller used exclusively for Databases/Stateful apps needing sticky identities.',
      ],
      tips: [
        'If your Deployment produces an error state of `CrashLoopBackOff`, it means the container application inside the Pod is starting, throwing a fatal error, and instantly crashing repeatedly.',
      ],
    },
  },
  'docker-k8s-8': {
    tutorial: {
      explanation: [
        'If you have a Deployment managing 3 Pods, how does a frontend application talk to them? Pods die and are recreated constantly, so their IP addresses change every minute. You cannot rely on Pod IPs.',
        'A Kubernetes Service acts as a static, permanent Load Balancer in front of a volatile group of Pods. The Service gets a permanent IP address and a permanent DNS name. Traffic is sent to the Service, and it relies on Label Selectors to distribute the traffic across however many healthy Pods match those labels.',
      ],
      codeExamples: [
        {
          description: 'Kubernetes Service translating permanent DNS to volatile Pods',
          code: `apiVersion: v1
kind: Service
metadata:
  name: airflow-web-service # This becomes the permanent internal DNS name
spec:
  # ClusterIP means it's only accessible from INSIDE the cluster
  # NodePort/LoadBalancer are used for external internet access
  type: ClusterIP 
  
  # How the Service knows which Pods to send traffic to
  # It will round-robin load balance across ALL Pods with 'app: airflow-web'
  selector:
    app: airflow-web
    
  ports:
    - protocol: TCP
      port: 80       # The permanent port the Service listens on
      targetPort: 8080 # The port the Pods are actually listening on`,
        },
      ],
      keyTakeaways: [
        'Services decouple the networking from the lifecycle of the Pods. This is the entire foundation of Kubernetes microservices.',
        'There are three primary Service types: 1) `ClusterIP` (Internal only, default), 2) `NodePort` (Exposes a port on every host machine IP), 3) `LoadBalancer` (Automatically provisions an AWS ALB / Cloud Load balancer to route internet traffic inwards).',
        'Ingress is a smarter, Layer-7 routing controller that sits in front of Services, routing traffic based on URL paths (e.g. `/api` goes to API Service, `/web` goes to UI Service).',
      ],
    },
    crashCourse: {
      summary: 'Pod IP addresses change constantly. A Service provides a permanent IP and DNS name that load-balances traffic across a volatile group of Pods identified by Labels.',
      quickFacts: [
        'Service: Permanent networking endpoint and load balancer.',
        'Label Selectors: How Services find the Pods they are supposed to route traffic towards (e.g. `app=database`).',
        'ClusterIP: Internal cluster networking only.',
        'LoadBalancer: integration with Cloud Providers to accept public internet traffic.',
      ],
      tips: [
        'If one K8s microservice cannot talk to another, double check the `targetPort` in the Service matches the `containerPort` in the Deployment.',
      ],
    },
  },
  'docker-k8s-9': {
    tutorial: {
      explanation: [
        'Hardcoding database passwords or API tokens in code or Git repositories is a critical security vulnerability. Kubernetes provides resources to decouple configuration and secrets from the application container image.',
        'A ConfigMap stores non-confidential configuration data (like `env=production` or a massive `.ini` file).',
        'A Secret stores confidential data (passwords, tokens, SSH keys). It is base64 encoded and optimally encrypted at rest by the K8s API.',
        'Both can be injected into a Pod either as Environment Variables or mounted as physical files in a Volume.',
      ],
      codeExamples: [
        {
          description: 'Injecting ConfigMaps and Secrets into a Pod',
          code: `# 1. Define the Secret
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
type: Opaque
data:
  # Must be Base64 encoded before applying!
  password: c3VwZXJzZWNyZXRwYXNz

---
# 2. Use it in a Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: spark-job
spec:
  template:
    spec:
      containers:
      - name: processor
        image: data-processor:1.5
        env:
        # Dynamically inject the username from a ConfigMap
        - name: DB_USER
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: database_user
        # Securely inject the password from a Secret
        - name: DB_PASS
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: password`,
        },
      ],
      keyTakeaways: [
        'By separating config from code, you can use the exact same Docker Image in Dev, Staging, and Production. K8s simply injects the environment-specific ConfigMap at runtime.',
        'Kubernetes Secrets are just Base64 encoded natively, which is trivially decoded. In production, use integration tools like AWS Secrets Manager or HashiCorp Vault to securely populate K8s Secrets.',
      ],
    },
    crashCourse: {
      summary: 'ConfigMaps store plain-text config. Secrets store secure passwords. They allow you to decouple environments from code, meaning the same Docker Image can be promoted from Dev to Prod just by changing the injected variables.',
      quickFacts: [
        'ConfigMap: Non-sensitive config (URLs, environment names).',
        'Secret: Sensitive data (Passwords, TLS certificates, API keys). Base64 encoded.',
        'Injection: Inject as Environment Variables or mount as Read-Only physical files inside the container.',
      ],
      tips: [
        'Never commit K8s Secret YAML files to Git if they contain the real Base64 encoded password! Use tools like SealedSecrets or ExternalSecrets for GitOps workflows.',
      ],
    },
  },
};
