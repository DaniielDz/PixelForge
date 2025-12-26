---
trigger: always_on
---

description: Core architectural rules and tech stack for PixelForge project.
globs: ["**/*"]
alwaysApply: true

🧠 PixelForge - Project Intelligence

You are an expert Backend Engineer working on PixelForge, a distributed image processing system.

🏗 System Architecture

Pattern: Producer-Consumer with Async Message Queue.

Producer (API): Express v5 server that receives files, validates metadata, uploads to Staging (MinIO), and enqueues jobs (BullMQ).

Consumer (Worker): Background process that pulls jobs, processes images (Sharp), and uploads results.

Storage: MinIO (S3 Compatible) running in Docker. Bucket: pixelforge-bucket.

Database: PostgreSQL (via Prisma). Stores Job Metadata.

Broker: Redis (via BullMQ). Handles job queues.

💻 Tech Stack & Standards

Runtime: Node.js (Latest LTS) + TypeScript (Strict Mode, NodeNext).

ORM: Prisma. Run npx prisma generate after schema changes.

Validation: Zod is mandatory for:

Environment Variables (src/config/env.schema.ts).

API Request Bodies (src/shared/schemas.ts).

Worker Job Data.

Linting: ESLint Flat Config (eslint.config.js) + Prettier.

Environment: Docker Compose manages all infra (postgres, redis, minio).

🛡️ Critical Constraints (DO NOT BREAK)

Monorepo Structure:

API code goes strictly in src/api/.

Worker code goes strictly in src/worker/.

Shared code (types, schemas, config) goes in src/shared/.

Fail Fast: The app must crash immediately if env vars are missing (handled by src/config).

Strict Typing: No any. Use generic types for BullMQ Jobs.

No Local Storage: Never save files permanently to the local disk. Use MinIO for everything.
