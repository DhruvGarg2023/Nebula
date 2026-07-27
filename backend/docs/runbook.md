# Operational Runbook — Collaborative AI Code Editor Backend

This operational runbook provides production support guidelines, database management, Redis recovery procedures, environment configurations, and incident response scenarios.

---

## 1. System Overview & Architecture

The backend is built as a modular Node.js Express application backed by PostgreSQL (persistence) and Redis (caching, pub/sub, rate limiting, and BullMQ background task processing).

### Core Components:
- **Express API Server**: Port `3000`
- **Socket.IO Engine**: Real-time collaborative document editing & room events.
- **PostgreSQL Database**: Port `5432` (`collab_editor` schema).
- **Redis Cache & Broker**: Port `6379`.
- **BullMQ Workers**: Background queues (`compiler-queue`, `github-queue`, `ai-queue`).

---

## 2. Environment Configuration Reference

| Environment Variable | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Yes | Environment mode (`development`, `production`, `test`) | `production` |
| `PORT` | No | HTTP listening port (default: 3000) | `3000` |
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `REDIS_URL` | Yes | Redis connection URL | `redis://127.0.0.1:6379` |
| `JWT_SECRET` | Yes | Secret key for signing access tokens (min 32 chars) | `your-production-jwt-secret-key-32-chars!` |
| `ENCRYPTION_KEY` | Yes | AES-256-GCM secret key for encrypting tokens (min 32 chars) | `your-production-encryption-key-32-chars!` |
| `GROQ_API_KEY` | Optional | Free-tier API key for Groq AI Code Review provider | `gsk_...` |

---

## 3. Database Maintenance & Migrations

### Run Database Migrations (Production)
```bash
npx prisma migrate deploy
```

### Seed Development Environment
```bash
npm run db:seed
```

### Database Backup & Restore Procedures
- **Backup**:
  ```bash
  pg_dump -U postgres -d collab_editor -F c -b -v -f /backups/collab_editor_$(date +%Y%m%d_%H%M%S).dump
  ```
- **Restore**:
  ```bash
  pg_restore -U postgres -d collab_editor -v /backups/collab_editor_backup.dump
  ```

---

## 4. Operational Monitoring Probes

| Probe Endpoint | Purpose | Target Response |
| :--- | :--- | :--- |
| `GET /api/v1/health` | Container Liveness | `{ "status": "healthy" }` |
| `GET /api/v1/ready` | Dependency Readiness | `{ "status": "ready", "checks": { "db": "healthy", "redis": "healthy" } }` |
| `GET /api/v1/docs` | OpenAPI Swagger UI | HTML UI render |
| `GET /api/v1/queues` | BullMQ Queue Status | Job counts (`active`, `completed`, `failed`) |

---

## 5. Incident Response & Troubleshooting

### Scenario 1: Redis Connection Failure
- **Symptom**: `Ready probe failed` or `Redis connection lost` logs.
- **Action**:
  1. Inspect Redis container: `docker logs collab-editor-redis`
  2. Verify network connectivity: `redis-cli ping`
  3. Restart Redis: `docker restart collab-editor-redis`

### Scenario 2: BullMQ Queue Backlog / Worker Stalled
- **Symptom**: AI Code Reviews or GitHub Sync jobs stuck in `queued` state.
- **Action**:
  1. Check Queue status endpoint: `curl http://localhost:3000/api/v1/queues`
  2. Restart Node.js application process to re-initialize worker loops.

### Scenario 3: Database Connection Exhaustion
- **Symptom**: `PrismaClientInitializationError` or `connection pool exhausted`.
- **Action**:
  1. Verify active connection count: `SELECT count(*) FROM pg_stat_activity;`
  2. Ensure connection pool limit in `DATABASE_URL` matches PostgreSQL `max_connections`.
