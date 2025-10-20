# Every.io Engineering Challenge - Task API

*Maintained by: Ed Silva*
*Date: October 20, 2025*

This repository contains the solution for the Every.io engineering challenge. It is a production-grade REST API for a task management application, built with Node.js, Express, TypeScript, and PostgreSQL.

## Features

- **CRUD Operations:** Full support for creating, reading, updating, and deleting tasks.
- **Authorization:** Users can only access and modify their own tasks. Authorization is handled via an `X-User-Id` header.
- **Layered Architecture:** Follows a clean, layered architecture (Controllers, Services, Repositories) for separation of concerns and testability.
- **Database Migrations:** Uses Prisma for schema management and migrations.
- **Observability:**
  - Structured logging with request IDs.
  - Health check endpoints (`/healthz`, `/readyz`).
  - Prometheus metrics endpoint (`/metrics`).
- **API Documentation:** Interactive API documentation available via Swagger UI.
- **Testing:** Comprehensive integration test suite using Jest and Supertest against a real database.
- **Containerization:** Multi-stage Dockerfile for a lean production image, orchestrated with Docker Compose.

## Architecture Overview

The application is structured in the following layers:

- **`controllers`**: Handles HTTP request/response logic and input validation.
- **`services`**: Contains the core business logic.
- **`repositories`**: Manages all database interactions via the Prisma client.
- **`middleware`**: Contains Express middleware for concerns like authentication, error handling, and metrics.
- **`schemas`**: Defines Zod schemas for robust input validation.
- **`utils`**: Contains utility functions and configurations (e.g., metrics, OpenAPI).

## Environment Variables

The application uses the following environment variables, defined in the `.env` file. A `.env.test` file is also used for the test environment.

| Variable       | Description                                       | Default (dev)                                                    |
| :------------- | :------------------------------------------------ | :--------------------------------------------------------------- |
| `DATABASE_URL` | The connection string for the PostgreSQL database. | `postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public` |
| `PORT`         | The port the application will listen on.          | `3000`                                                           |
| `LOG_LEVEL`    | The minimum level of logs to output.              | `warn`                                                           |

## API Endpoints

All API endpoints are prefixed with `/api/v1` and require an `X-User-Id` header for authorization.

| Method   | Endpoint       | Description                   |
| :------- | :------------- | :---------------------------- |
| `POST`   | `/tasks`       | Create a new task.            |
| `GET`    | `/tasks`       | Get all tasks for the user.   |
| `GET`    | `/tasks/:id`   | Get a single task by its ID.  |
| `PATCH`  | `/tasks/:id`   | Update a task.                |
| `DELETE` | `/tasks/:id`   | Delete a task.                |

### Management Endpoints

| Method | Endpoint    | Description                                                      |
| :----- | :---------- | :--------------------------------------------------------------- |
| `GET`  | `/api-docs` | Serves the interactive Swagger UI documentation.               |
| `GET`  | `/healthz`  | Liveness probe to check if the server is running.                |
| `GET`  | `/readyz`   | Readiness probe to check if the server can connect to the database. |
| `GET`  | `/metrics`  | Exposes application metrics in Prometheus format.              |

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm
- Docker and Docker Compose

### 1. Clone the repository

```bash
git clone https://github.com/eedsilva/engineering-interivew-be.git
cd engineering-interivew-be
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the databases

This command starts both the development and test PostgreSQL databases in the background.

```bash
docker-compose up -d
```

### 4. Run database migrations

```bash
npm run prisma:migrate:dev
```

### 5. Run the application

This will start the development server on `http://localhost:3000`.

```bash
npm run dev
```

## Usage

- **API Base URL:** `http://localhost:3000`
- **API Documentation (Swagger):** `http://localhost:3000/api-docs`
- **Health Check:** `http://localhost:3000/healthz`
- **Metrics:** `http://localhost:3000/metrics`

### Checking Metrics

The `/metrics` endpoint exposes application metrics in the Prometheus exposition format. You can inspect them with `curl`:

```bash
curl http://localhost:3000/metrics
```

The output will be plain text. The custom counter for HTTP requests will look similar to this:

```
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",route="/",status_code="200"} 8
http_requests_total{method="GET",route="/api/v1/tasks",status_code="200"} 5
```

While you can view this directly, the intended use is for a Prometheus server to scrape this endpoint to build graphs and alerts.

### API Examples (cURL)

**Important:** Before using the API, you need a valid user ID. Since there is no signup endpoint, you must create a user first by running the provided helper script:

```bash
# This will create a new user in the database and print their ID
ts-node createUser.ts
```

Copy the generated ID and use it in the `X-User-Id` header for all subsequent API calls.

**Create a Task:**

```bash
# Replace YOUR_USER_ID with the ID from the script
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "X-User-Id: YOUR_USER_ID" \
  -d '{"title": "My first task", "description": "This is a test."}'
```

**Get All Tasks:**

```bash
# Replace YOUR_USER_ID with the ID from the script
curl http://localhost:3000/api/v1/tasks \
  -H "X-User-Id: YOUR_USER_ID"
```

## Running Tests

To run the full integration test suite, use the following command. It will automatically connect to the test database and run migrations.

```bash
npm test
or
npm run test:cov
```

## Running with Docker

To build and run the application as a Docker container:

1.  **Build the image:**

    ```bash
    docker build -t task-api .
    ```

2.  **Run the container:**

    Make sure your development database is running (`docker-compose up -d postgres`).

    ```bash
    docker run -p 3000:3000 
      --network=every_default 
      -e DATABASE_URL="postgresql://johndoe:randompassword@postgres:5432/mydb?schema=public" 
      task-api
    ```

    *Note: `--network=every_default` connects the container to the same network as the Docker Compose services, allowing it to reach the `postgres` container.* 

## Tradeoffs and Future Improvements

- **Authentication:** The challenge explicitly excluded full authentication. In a real-world scenario, the `X-User-Id` header would be replaced with a proper authentication mechanism like JWTs from a login flow.
- **OpenAPI Generation:** The `openapi.json` is currently static for simplicity. It could be generated dynamically from the Zod schemas and route definitions to ensure it's always in sync.
- **Idempotency:** The `Idempotency-Key` header for `POST` requests was planned but not implemented. This would prevent duplicate resource creation from client-side retries.
- **Pagination:** The `GET /tasks` endpoint returns all tasks for a user. For users with a large number of tasks, this should be paginated to ensure predictable and fast responses.
- **Filtering and Sorting:** The API could be enhanced with query parameters to allow filtering tasks by status (`?status=done`) or sorting by different fields (`?sortBy=updatedAt`).
- **Dedicated Status Update Endpoint:** For more granular control and clearer API semantics, a dedicated endpoint like `PATCH /tasks/:id/status` could be introduced to handle only status changes.
- **CI/CD:** GitHub Actions workflow for automated linting, testing, and building.