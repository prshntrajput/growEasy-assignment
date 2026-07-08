# GrowEasy CSV Importer

A full-stack CSV import and AI-assisted CRM record extraction app built with a Next.js frontend, a Node.js/Express backend, and Inngest for background event-driven processing.

## Overview

GrowEasy CSV Importer is designed to let a user upload a CSV file, split it into batches, process those batches asynchronously, extract structured CRM-ready records using AI, and aggregate the results into a final import summary.

The project uses three main runtime parts:

- **Frontend**: Next.js app used for file upload, progress display, and final results.
- **Backend**: Express API that accepts uploads, validates and parses CSVs, creates import jobs, and exposes the Inngest endpoint.
- **Inngest Dev Server**: Local event-driven development server used to receive events and run background functions during development.

## Project Flow

### End-to-end flow

1. A user opens the frontend in the browser.
2. The frontend uploads a CSV file to the backend.
3. The backend validates the request and parses the CSV.
4. The backend splits the CSV into manageable batches.
5. The backend creates a job entry in the in-memory job store.
6. The backend sends an Inngest event to start asynchronous processing.
7. Inngest triggers the background function.
8. The function processes each batch using the AI extraction service.
9. The result aggregator combines extracted output with original rows.
10. The job store is updated with progress, completion status, or failure details.
11. The frontend polls or fetches job status and displays progress and final results.

### Background processing flow

The background job logic lives in the Inngest function definitions. The `process-csv-import` function receives a payload containing:

- `jobId`
- `totalBatches`
- `batches`

For each batch:

1. The job status is initialized.
2. The AI extraction service is called.
3. Progress is updated after each batch.
4. Final results are aggregated.
5. The job is marked `done` or `failed`.

## Tech Stack

### Frontend

- Next.js
- React
- Node.js runtime in Docker

### Backend

- Node.js
- TypeScript
- Express
- Zod-style schema validation pattern
- Dotenv / dotenvx-compatible environment loading

### Async processing

- Inngest SDK
- Inngest Dev Server for local development

### AI processing

- Gemini API via `GEMINI_API_KEY`

### Containerization

- Docker
- Docker Compose

## Engineering Principles

This project follows **object-oriented programming (OOP)**, **SOLID principles**, and **clean code** practices to keep the codebase modular, maintainable, and easy to extend.

- **OOP** is used to organize business logic into focused classes and services.
- **SOLID principles** are applied to improve separation of concerns and reduce tight coupling between modules.
- **Clean code** practices are followed to keep naming clear, functions small, and the overall flow easy to understand.

## Folder Structure

A typical project layout looks like this:

```text
groweasy-csv-importer/
├── docker-compose.yml
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   └── ...
└── backend/
    ├── Dockerfile
    ├── package.json
    ├── tsconfig.json
    ├── .env
    └── src/
        ├── app.ts
        ├── server.ts
        ├── controllers/
        ├── routes/
        ├── services/
        ├── schemas/
        ├── middlewares/
        └── inngest/
            ├── client.ts
            └── functions/
                └── index.ts
```

## Important Backend Modules

### `src/inngest/client.ts`

This file creates the shared Inngest client instance:

```ts
import { Inngest } from 'inngest';

export const inngest = new Inngest({ id: 'groweasy-csv-importer' });
```

### `src/inngest/functions/index.ts`

This file defines the background functions. It imports the shared Inngest client and exports an array of functions for the Inngest route handler.

### `services/ai-extraction.service.ts`

This service sends structured prompts to the Gemini API and transforms raw CSV row data into extracted CRM-ready records.

### `services/batch.service.ts`

This service splits CSV rows into batches so AI processing is more reliable and easier to track.

### `services/job-store.service.ts`

This service tracks import status, percentage progress, result payloads, and failure information.

### `services/result-aggregator.service.ts`

This service merges extracted AI results with the source rows and creates the final response shape sent back to the client.

## Docker Setup

The local development environment is orchestrated with Docker Compose.

### Services

- `frontend`: serves the Next.js application on port `3000`
- `backend`: serves the API on port `4000`
- `inngest`: runs the Inngest Dev Server on port `8288`

### Final `docker-compose.yml`

```yaml
services:
  frontend:
    build:
      context: ./frontend
    container_name: groweasy-frontend
    ports:
      - "3000:3000"
    depends_on:
      backend:
        condition: service_started
    restart: unless-stopped

  backend:
    build:
      context: ./backend
    container_name: groweasy-backend
    ports:
      - "4000:4000"
    env_file:
      - ./backend/.env
    environment:
      NODE_ENV: development
      INNGEST_DEV: "1"
      INNGEST_BASE_URL: http://inngest:8288
      INNGEST_SERVE_HOST: http://backend:4000
    depends_on:
      inngest:
        condition: service_started
    restart: unless-stopped

  inngest:
    image: inngest/inngest:latest
    container_name: groweasy-inngest
    command: inngest dev -u http://backend:4000/api/inngest
    ports:
      - "8288:8288"
    restart: unless-stopped
```

## Environment Variables

Create `backend/.env` with at least the following values:

```env
GEMINI_API_KEY=your_actual_gemini_api_key
```

Optional runtime variables are already injected by Docker Compose:

- `NODE_ENV=development`
- `INNGEST_DEV=1`
- `INNGEST_BASE_URL=http://inngest:8288`
- `INNGEST_SERVE_HOST=http://backend:4000`

## Setup Guide

### Prerequisites

Install the following on your machine:

- Docker
- Docker Compose plugin
- Git

Optional for non-Docker local development:

- Node.js 20+
- npm

### Step 1: Clone the repository

```bash
git clone <your-repository-url>
cd groweasy-csv-importer
```

### Step 2: Create backend environment file

```bash
cd backend
cp .env.example .env
```

If you do not have `.env.example`, create `.env` manually:

```bash
touch .env
```

Then add:

```env
GEMINI_API_KEY=your_actual_gemini_api_key
```

### Step 3: Start the project

From the project root:

```bash
docker compose down -v
docker compose up --build
```

### Step 4: Open the apps

- Frontend: http://localhost:3000
- Backend health: http://localhost:4000/api/health/ping
- Inngest Dev Server: http://localhost:8288

## Local Development Commands

### Rebuild everything

```bash
docker compose build --no-cache
```

### Start services

```bash
docker compose up
```

### Stop services

```bash
docker compose down
```

### Remove containers, networks, and volumes

```bash
docker compose down -v
```

### Rebuild only backend

```bash
docker compose build --no-cache backend
```

### Rebuild only frontend

```bash
docker compose build --no-cache frontend
```

## API Notes

### Health route

The health route is:

```text
GET /api/health/ping
```

Example response:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-07-08T22:26:52.121Z"
  },
  "message": "Server is healthy"
}
```

### Inngest route

The backend exposes:

```text
/api/inngest
```

This route is used by the Inngest Dev Server to discover and run local functions.

## A to Z Quickstart

```bash
# 1. Clone
git clone <your-repository-url>
cd groweasy-csv-importer

# 2. Create backend env file
echo "GEMINI_API_KEY=your_actual_gemini_api_key" > backend/.env

# 3. Build and run
docker compose down -v
docker compose up --build

# 4. Verify
curl http://localhost:4000/api/health/ping

# 5. Open
# Frontend: http://localhost:3000
# Inngest:  http://localhost:8288
```
## Summary

This project was built as an assignment to demonstrate a full-stack CSV import workflow with asynchronous AI processing using Inngest. The frontend handles file upload and result display, the backend handles parsing and orchestration, and Inngest manages background execution. With the Docker Compose setup and environment configuration in place, the project can be run locally in a consistent and reproducible way.