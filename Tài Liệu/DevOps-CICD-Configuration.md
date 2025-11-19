# DevOps & CI/CD Configuration — i-ContExchange

Mã tài liệu: DEVOPS-CONFIG-v1.0  
Ngày: 2025-09-30  
Ngôn ngữ: Tiếng Việt  

Tài liệu này cung cấp cấu hình đầy đủ cho việc triển khai, CI/CD và vận hành hệ thống i-ContExchange.

---

## **1. DOCKER CONFIGURATION**

### **1.1. Frontend Dockerfile**
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### **1.2. Backend API Dockerfile**
```dockerfile
# backend/Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 api
RUN adduser --system --uid 1001 api

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER api
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["node", "dist/server.js"]
```

### **1.3. Docker Compose Development**
```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: icontexchange_dev
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dev -d icontexchange_dev"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

  minio:
    image: minio/minio:latest
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin123
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://dev:dev123@postgres:5432/icontexchange_dev
      - REDIS_URL=redis://redis:6379
      - MINIO_ENDPOINT=minio:9000
      - MINIO_ACCESS_KEY=minioadmin
      - MINIO_SECRET_KEY=minioadmin123
      - JWT_SECRET=dev-jwt-secret-change-in-production
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      minio:
        condition: service_healthy
    volumes:
      - ./backend:/app
      - /app/node_modules
    command: npm run dev

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=dev-nextauth-secret
    ports:
      - "3000:3000"
    depends_on:
      - api
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

### **1.4. Docker Compose Production**
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - api
    restart: unless-stopped

  frontend:
    image: icontexchange/frontend:${IMAGE_TAG:-latest}
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=${API_URL}
      - NEXTAUTH_URL=${FRONTEND_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  api:
    image: icontexchange/api:${IMAGE_TAG:-latest}
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
      - MINIO_ENDPOINT=${MINIO_ENDPOINT}
      - MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY}
      - MINIO_SECRET_KEY=${MINIO_SECRET_KEY}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

---

## **2. KUBERNETES CONFIGURATION**

### **2.1. Namespace & ConfigMap**
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: icontexchange
  labels:
    name: icontexchange
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: icontexchange-config
  namespace: icontexchange
data:
  NODE_ENV: "production"
  POSTGRES_HOST: "postgres-service"
  POSTGRES_PORT: "5432"
  POSTGRES_DB: "icontexchange"
  REDIS_HOST: "redis-service"
  REDIS_PORT: "6379"
  MINIO_ENDPOINT: "minio-service:9000"
```

### **2.2. Secret Management**
```yaml
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: icontexchange-secrets
  namespace: icontexchange
type: Opaque
data:
  POSTGRES_USER: <base64-encoded>
  POSTGRES_PASSWORD: <base64-encoded>
  JWT_SECRET: <base64-encoded>
  NEXTAUTH_SECRET: <base64-encoded>
  MINIO_ACCESS_KEY: <base64-encoded>
  MINIO_SECRET_KEY: <base64-encoded>
```

### **2.3. PostgreSQL Deployment**
```yaml
# k8s/postgres.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: icontexchange
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:14-alpine
        env:
        - name: POSTGRES_DB
          valueFrom:
            configMapKeyRef:
              name: icontexchange-config
              key: POSTGRES_DB
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: icontexchange-secrets
              key: POSTGRES_USER
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: icontexchange-secrets
              key: POSTGRES_PASSWORD
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "1Gi"
            cpu: "500m"
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
  namespace: icontexchange
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: icontexchange
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi
```

### **2.4. API Deployment**
```yaml
# k8s/api.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  namespace: icontexchange
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: icontexchange/api:latest
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: icontexchange-config
              key: NODE_ENV
        - name: DATABASE_URL
          value: "postgresql://$(POSTGRES_USER):$(POSTGRES_PASSWORD)@$(POSTGRES_HOST):$(POSTGRES_PORT)/$(POSTGRES_DB)"
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: icontexchange-secrets
              key: POSTGRES_USER
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: icontexchange-secrets
              key: POSTGRES_PASSWORD
        - name: POSTGRES_HOST
          valueFrom:
            configMapKeyRef:
              name: icontexchange-config
              key: POSTGRES_HOST
        - name: POSTGRES_PORT
          valueFrom:
            configMapKeyRef:
              name: icontexchange-config
              key: POSTGRES_PORT
        - name: POSTGRES_DB
          valueFrom:
            configMapKeyRef:
              name: icontexchange-config
              key: POSTGRES_DB
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: icontexchange-secrets
              key: JWT_SECRET
        ports:
        - containerPort: 3001
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: api-service
  namespace: icontexchange
spec:
  selector:
    app: api
  ports:
  - port: 3001
    targetPort: 3001
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
  namespace: icontexchange
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### **2.5. Frontend Deployment**
```yaml
# k8s/frontend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: icontexchange
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: icontexchange/frontend:latest
        env:
        - name: NODE_ENV
          value: "production"
        - name: NEXT_PUBLIC_API_URL
          value: "https://api.icontexchange.vn/api/v1"
        - name: NEXTAUTH_URL
          value: "https://icontexchange.vn"
        - name: NEXTAUTH_SECRET
          valueFrom:
            secretKeyRef:
              name: icontexchange-secrets
              key: NEXTAUTH_SECRET
        ports:
        - containerPort: 3000
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "128Mi"
            cpu: "50m"
          limits:
            memory: "256Mi"
            cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  namespace: icontexchange
spec:
  selector:
    app: frontend
  ports:
  - port: 3000
    targetPort: 3000
```

### **2.6. Ingress Configuration**
```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: icontexchange-ingress
  namespace: icontexchange
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  tls:
  - hosts:
    - icontexchange.vn
    - api.icontexchange.vn
    secretName: icontexchange-tls
  rules:
  - host: icontexchange.vn
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 3000
  - host: api.icontexchange.vn
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 3001
```

---

## **3. CI/CD PIPELINE**

### **3.1. GitHub Actions Workflow**
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: icontexchange

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        npm ci
        cd frontend && npm ci
        cd ../backend && npm ci
    
    - name: Run linting
      run: |
        cd frontend && npm run lint
        cd ../backend && npm run lint
    
    - name: Run type checking
      run: |
        cd frontend && npm run type-check
        cd ../backend && npm run type-check
    
    - name: Run unit tests
      run: |
        cd backend && npm run test
        cd ../frontend && npm run test
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        REDIS_URL: redis://localhost:6379
    
    - name: Run integration tests
      run: |
        cd backend && npm run test:integration
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        REDIS_URL: redis://localhost:6379
    
    - name: Build applications
      run: |
        cd frontend && npm run build
        cd ../backend && npm run build

  security:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        scan-ref: '.'
        format: 'sarif'
        output: 'trivy-results.sarif'
    
    - name: Upload Trivy scan results
      uses: github/codeql-action/upload-sarif@v2
      with:
        sarif_file: 'trivy-results.sarif'

  build-and-push:
    needs: [test, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    strategy:
      matrix:
        component: [frontend, backend]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Log in to Container Registry
      uses: docker/login-action@v2
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v4
      with:
        images: ${{ env.REGISTRY }}/${{ github.repository }}/${{ matrix.component }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix={{branch}}-
          type=raw,value=latest,enable={{is_default_branch}}
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v4
      with:
        context: ./${{ matrix.component }}
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  deploy-staging:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment: staging
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup kubectl
      uses: azure/setup-kubectl@v3
      with:
        version: 'v1.28.0'
    
    - name: Configure kubectl
      run: |
        echo "${{ secrets.KUBE_CONFIG_STAGING }}" | base64 -d > kubeconfig
        export KUBECONFIG=kubeconfig
    
    - name: Deploy to staging
      run: |
        export KUBECONFIG=kubeconfig
        kubectl set image deployment/frontend frontend=${{ env.REGISTRY }}/${{ github.repository }}/frontend:develop -n icontexchange-staging
        kubectl set image deployment/api api=${{ env.REGISTRY }}/${{ github.repository }}/backend:develop -n icontexchange-staging
        kubectl rollout status deployment/frontend -n icontexchange-staging
        kubectl rollout status deployment/api -n icontexchange-staging

  deploy-production:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup kubectl
      uses: azure/setup-kubectl@v3
      with:
        version: 'v1.28.0'
    
    - name: Configure kubectl
      run: |
        echo "${{ secrets.KUBE_CONFIG_PROD }}" | base64 -d > kubeconfig
        export KUBECONFIG=kubeconfig
    
    - name: Deploy to production
      run: |
        export KUBECONFIG=kubeconfig
        kubectl set image deployment/frontend frontend=${{ env.REGISTRY }}/${{ github.repository }}/frontend:latest -n icontexchange
        kubectl set image deployment/api api=${{ env.REGISTRY }}/${{ github.repository }}/backend:latest -n icontexchange
        kubectl rollout status deployment/frontend -n icontexchange
        kubectl rollout status deployment/api -n icontexchange
    
    - name: Run smoke tests
      run: |
        sleep 30
        curl -f https://icontexchange.vn/health
        curl -f https://api.icontexchange.vn/health
    
    - name: Notify deployment
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        channel: '#deployments'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
      if: always()
```

### **3.2. Environment-specific Deployment Scripts**
```bash
#!/bin/bash
# scripts/deploy-staging.sh

set -e

echo "🚀 Deploying to Staging Environment..."

# Set variables
NAMESPACE="icontexchange-staging"
IMAGE_TAG="develop-$(git rev-parse --short HEAD)"

# Apply Kubernetes manifests
kubectl apply -f k8s/namespace-staging.yaml
kubectl apply -f k8s/configmap-staging.yaml
kubectl apply -f k8s/secrets-staging.yaml

# Update deployments with new image tags
kubectl set image deployment/frontend frontend=ghcr.io/icontexchange/frontend:$IMAGE_TAG -n $NAMESPACE
kubectl set image deployment/api api=ghcr.io/icontexchange/backend:$IMAGE_TAG -n $NAMESPACE

# Wait for rollout to complete
kubectl rollout status deployment/frontend -n $NAMESPACE --timeout=300s
kubectl rollout status deployment/api -n $NAMESPACE --timeout=300s

# Run health checks
echo "🔍 Running health checks..."
kubectl wait --for=condition=ready pod -l app=frontend -n $NAMESPACE --timeout=60s
kubectl wait --for=condition=ready pod -l app=api -n $NAMESPACE --timeout=60s

echo "✅ Staging deployment completed successfully!"
```

```bash
#!/bin/bash
# scripts/deploy-production.sh

set -e

echo "🚀 Deploying to Production Environment..."

# Safety checks
read -p "Are you sure you want to deploy to PRODUCTION? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Set variables
NAMESPACE="icontexchange"
IMAGE_TAG="latest"

# Pre-deployment backup
echo "📦 Creating database backup..."
kubectl exec -n $NAMESPACE deployment/postgres -- pg_dump -U postgres icontexchange > backup-$(date +%Y%m%d-%H%M%S).sql

# Apply Kubernetes manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# Rolling update with zero downtime
kubectl set image deployment/frontend frontend=ghcr.io/icontexchange/frontend:$IMAGE_TAG -n $NAMESPACE
kubectl set image deployment/api api=ghcr.io/icontexchange/backend:$IMAGE_TAG -n $NAMESPACE

# Wait for rollout to complete
kubectl rollout status deployment/frontend -n $NAMESPACE --timeout=600s
kubectl rollout status deployment/api -n $NAMESPACE --timeout=600s

# Run smoke tests
echo "🔍 Running smoke tests..."
sleep 30
curl -f https://icontexchange.vn/health || (echo "❌ Frontend health check failed" && exit 1)
curl -f https://api.icontexchange.vn/health || (echo "❌ API health check failed" && exit 1)

echo "✅ Production deployment completed successfully!"

# Send notification
curl -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"🚀 i-ContExchange deployed to production successfully!\"}" \
    $SLACK_WEBHOOK_URL
```

---

## **4. MONITORING & LOGGING**

### **4.1. Prometheus Configuration**
```yaml
# monitoring/prometheus.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s
    
    rule_files:
      - "/etc/prometheus/rules/*.yml"
    
    scrape_configs:
    - job_name: 'kubernetes-apiservers'
      kubernetes_sd_configs:
      - role: endpoints
      scheme: https
      tls_config:
        ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
      bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
      relabel_configs:
      - source_labels: [__meta_kubernetes_namespace, __meta_kubernetes_service_name, __meta_kubernetes_endpoint_port_name]
        action: keep
        regex: default;kubernetes;https
    
    - job_name: 'icontexchange-api'
      kubernetes_sd_configs:
      - role: endpoints
        namespaces:
          names:
          - icontexchange
      relabel_configs:
      - source_labels: [__meta_kubernetes_service_name]
        action: keep
        regex: api-service
      - source_labels: [__meta_kubernetes_endpoint_port_name]
        action: keep
        regex: http
    
    - job_name: 'icontexchange-frontend'
      kubernetes_sd_configs:
      - role: endpoints
        namespaces:
          names:
          - icontexchange
      relabel_configs:
      - source_labels: [__meta_kubernetes_service_name]
        action: keep
        regex: frontend-service
    
    - job_name: 'postgres-exporter'
      static_configs:
      - targets: ['postgres-exporter:9187']
    
    - job_name: 'redis-exporter'
      static_configs:
      - targets: ['redis-exporter:9121']

    alerting:
      alertmanagers:
      - static_configs:
        - targets:
          - alertmanager:9093
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-rules
  namespace: monitoring
data:
  icontexchange.yml: |
    groups:
    - name: icontexchange
      rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: High error rate detected
          description: "Error rate is {{ $value }} for {{ $labels.job }}"
      
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High response time
          description: "95th percentile response time is {{ $value }}s"
      
      - alert: DatabaseConnectionsHigh
        expr: pg_stat_database_numbackends / pg_settings_max_connections > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: Database connections high
          description: "Database connections are at {{ $value }}% of maximum"
```

### **4.2. Grafana Dashboard**
```json
{
  "dashboard": {
    "title": "i-ContExchange Overview",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{status}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          },
          {
            "expr": "histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "50th percentile"
          }
        ]
      },
      {
        "title": "Active Users",
        "type": "stat",
        "targets": [
          {
            "expr": "active_users_total",
            "legendFormat": "Active Users"
          }
        ]
      },
      {
        "title": "Database Performance",
        "type": "graph",
        "targets": [
          {
            "expr": "pg_stat_database_tup_fetched",
            "legendFormat": "Rows fetched"
          },
          {
            "expr": "pg_stat_database_tup_inserted",
            "legendFormat": "Rows inserted"
          }
        ]
      }
    ]
  }
}
```

---

## **5. BACKUP & DISASTER RECOVERY**

### **5.1. Database Backup Script**
```bash
#!/bin/bash
# scripts/backup-database.sh

set -e

NAMESPACE="icontexchange"
BACKUP_DIR="/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="icontexchange_backup_$DATE.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create database backup
kubectl exec -n $NAMESPACE deployment/postgres -- pg_dump \
  -U postgres \
  -h localhost \
  -p 5432 \
  --verbose \
  --format=custom \
  --no-owner \
  --no-privileges \
  icontexchange > $BACKUP_DIR/$BACKUP_FILE

# Compress backup
gzip $BACKUP_DIR/$BACKUP_FILE

# Upload to S3 (optional)
if [ -n "$AWS_S3_BUCKET" ]; then
  aws s3 cp $BACKUP_DIR/$BACKUP_FILE.gz s3://$AWS_S3_BUCKET/database-backups/
fi

# Clean up old backups (keep last 7 days)
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "✅ Database backup completed: $BACKUP_FILE.gz"
```

### **5.2. Automated Backup CronJob**
```yaml
# k8s/backup-cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: database-backup
  namespace: icontexchange
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: postgres:14-alpine
            command:
            - /bin/sh
            - -c
            - |
              pg_dump -h postgres-service -U postgres -d icontexchange > /backup/backup-$(date +%Y%m%d_%H%M%S).sql
              echo "Backup completed"
            env:
            - name: PGPASSWORD
              valueFrom:
                secretKeyRef:
                  name: icontexchange-secrets
                  key: POSTGRES_PASSWORD
            volumeMounts:
            - name: backup-storage
              mountPath: /backup
          volumes:
          - name: backup-storage
            persistentVolumeClaim:
              claimName: backup-pvc
          restartPolicy: OnFailure
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1
```

---

## **6. ENVIRONMENT CONFIGURATION**

### **6.1. Environment Variables Template**
```bash
# .env.example
# Application
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://icontexchange.vn
API_URL=https://api.icontexchange.vn

# Database
DATABASE_URL=postgresql://username:password@host:5432/database
DATABASE_SSL=true
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Redis
REDIS_URL=redis://redis:6379
REDIS_TTL=3600

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# File Storage
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET=icontexchange-files
MINIO_USE_SSL=false

# External Services
EKYC_PROVIDER_URL=https://api.fpt.ai/vision/idr/vnm
EKYC_API_KEY=your-ekyc-api-key

PAYMENT_VNPAY_TMN_CODE=your-vnpay-tmn-code
PAYMENT_VNPAY_HASH_SECRET=your-vnpay-hash-secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@icontexchange.vn
SMTP_PASSWORD=your-email-password

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

Tài liệu này cung cấp foundation hoàn chỉnh cho việc triển khai và vận hành hệ thống i-ContExchange trong môi trường production với high availability, monitoring và disaster recovery.