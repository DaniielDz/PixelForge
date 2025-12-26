# 🗺️ PixelForge - Active Roadmap

This file tracks the development progress of the PixelForge project. The Agent must refer to this file to understand the current context and the next priority task.

## ✅ Completed Phases

### Phase 1: Base Infrastructure

- [x] Docker Compose configuration.
- [x] Services Setup: Postgres, Redis, MinIO.
- [x] S3 Buckets initialization script.

### Phase 2: Project Setup

- [x] Node.js & TypeScript initialization.
- [x] ESLint (Flat Config) & Prettier setup.
- [x] Folder Structure (Monorepo pattern: api, worker, shared).
- [x] Environment Variable Validation (Zod).

### 🚧 Current Phase: Phase 3: Database & Models

- [ ] Prisma Schema definition (Job model, JobStatus enum).
- [ ] Initial migration to Postgres.
- [ ] Prisma Client generation.
- [ ] Shared Zod Schemas (Dimensions Allowlist).

### Phase 4 - API Service (Producer)

Objective: Enable image upload and job enqueuing.

- [ ] Multer Config: Implement middleware to handle multipart/form-data.
- [ ] Controller Validation: Validate request body (width, height) using shared CreateJobSchema.
- [ ] MinIO Integration: Upload the received raw file to the /raw bucket.
- [ ] BullMQ Integration: Create the image-processing queue and add the job.
- [ ] Endpoint: Implement POST /api/v1/jobs returning the jobId.

## 🔮 Future Phases (Pending)

### Phase 5: Worker Service (Consumer)

- [ ] Configure BullMQ Worker.
- [ ] Implement file download from MinIO.
- [ ] Image Processing with Sharp (Resize + Format).
- [ ] Upload processed result to MinIO (/processed).
- [ ] Update Job status in DB (COMPLETED or FAILED).

### Phase 6: Polling & Status

- [ ] Implement GET /api/v1/jobs/:id endpoint.
- [ ] Return status and final URL (if completed).

### Phase 7: Production & Cleanup

- [ ] Optimized Dockerfile for Production (API).
- [ ] Optimized Dockerfile for Production (Worker).
- [ ] Temp files cleanup script/mechanism.

## 📌 Context Notes

- Storage: We use MinIO locally as an S3 replacement.
- Communication: Interaction between API and Worker is strictly via Redis (BullMQ).
- Validation: Validation schemas are centralized in src/shared/schemas.ts.
