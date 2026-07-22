# unleash-fullstack-demo-app — backend

The backend service for the Unleash fullstack demo app. Built with Express and TypeScript, it serves the static frontend files and provides API endpoints.

## Development

All tasks run from the repo root (this package defines no scripts of its own):

```bash
# Install dependencies (root + backend workspace)
pnpm install

# Start both development servers, or the backend alone with hot-reload
pnpm dev
pnpm dev:backend

# Type-check frontend + backend
pnpm check

# Start the backend serving the built frontend
pnpm start:backend

# Test the AI chat API (against a running server)
pnpm test-chat

# Test the metrics collection (against a running server)
pnpm test-metrics
```

Alternatively, use `npm` (`npm run dev`, `npm run check`, and so on).

## API Endpoints

- `GET /api/info` - Returns information about the backend service including name, version, timestamp, and environment
- `POST /api/chat` - AI-powered chat endpoint that answers questions about user expenses
  - Request body: `{ "message": "your question here" }`
  - Response: `{ "response": "AI response", "variant": "basic|advanced", "executionTimeMs": 123, "costInDollars": 0.02 }`
  - Supports questions about total expenses, expense categories, highest expenses, and spending patterns (advanced variant only)
  - Supports context parameters passed via headers in the format `Unleash-ContextParam-{paramName}: {value}`
- `GET /api/flag/variant` - Debug endpoint returning the variant of the 'fsDemoApp.chatbot' flag as evaluated by the backend SDK
  - Supports context parameters passed via headers in the format `Unleash-ContextParam-{paramName}: {value}`
- `GET /metrics` - Prometheus metrics endpoint for monitoring chat performance and costs

## Metrics

The backend collects the following metrics for chat queries:

- `chat_execution_time_seconds` - Execution time of chat queries in seconds (Histogram)
  - Buckets optimized for basic variant (0.3-0.7s) and advanced variant (1.5-2.5s)
- `chat_total_cost_dollars` - Total accumulated cost of chat queries in dollars (Counter)
- `chat_cost_per_call_dollars` - Cost per individual chat query in dollars (Histogram)
  - Buckets optimized for basic variant ($0.1) and advanced variant ($0.2)
- `chat_call_count_total` - Total number of chat calls (Counter)

These metrics are available at the `/metrics` endpoint and can be scraped by Prometheus for monitoring and alerting.

## Configuration

The server reads the repo-root `.env` file on startup (`src/loadEnv.ts`); variables already set in the process environment take precedence. See `.env.example` at the repo root for the full contract. The backend uses:

- `UNLEASH_URL` - Unleash server API base URL, ends with `/api/` (required)
- `UNLEASH_API_KEY` - Backend (client) token for the project/environment (required)
- `NODE_ENV` - `development` or `production`; controls debug logging and the chat response shape
- `PORT` - The port on which the server will listen (default: 3000)

## Feature Flags

The application uses the following feature flags:

- `fsDemoApp.chatbot` - Controls which variant of the AI chat to use:
  - When enabled: Uses the advanced AI chat with detailed expense analysis
  - When disabled: Uses the basic AI chat with simple expense information

## File Structure

- `src/index.ts` - Main entry point for the Express application
- `src/chatService.ts` - Service for handling AI chat functionality
- `src/metricsService.ts` - Service for collecting and exposing Prometheus metrics
- `src/contextMiddleware.ts` - Middleware for extracting Unleash context from request headers
- `test-chat-api.js` - Script for testing the chat API
- `test-metrics.js` - Script for testing metrics collection

## Static Content

The server serves static content from the frontend build directory (`../../dist`). This allows the backend to serve the frontend application in production environments.
