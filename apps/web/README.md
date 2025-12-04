# FraudGuard AI - Demo Dashboard

This is the frontend application for the AI fraud detection research case study.

It demonstrates a low-latency (<200ms) fraud detection pipeline for cross-border payments.

## Features

- **Real-time fraud scoring**: Submits transactions to the Python FastAPI backend.
- **Sanctions screening**: Displays fuzzy match results against OFAC lists.
- **Explainability**: Visualizes risk scores and decision logic.
- **Performance metrics**: Shows end-to-end latency.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: Shadcn UI + Tailwind CSS
- **State management**: React hook form + Zod
- **Charts**: Recharts
- **Icons**: Lucide react

## Getting Started

1.  **Ensure the API is running**:

    ```bash
    cd apps/api
    docker-compose up
    # OR locally
    uvicorn src.main:app --reload --port 8000
    ```

2.  **Install dependencies**:

    ```bash
    cd apps/web
    bun install
    ```

3.  **Run the development server**:

    ```bash
    bun dev
    ```

4.  **Open the dashboard**:
    Navigate to [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create a `.env.local` file if your API is not at `localhost:8000`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```
