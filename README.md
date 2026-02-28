 # DocSummarizer

 DocSummarizer is a web application that lets users upload PDF or TXT documents and automatically generates concise AI-based summaries. It is built with **Next.js**, **React**, **TypeScript**, **Tailwind CSS**, and **Supabase** for storage, and it uses GitHub Models (for example GPT‑4.1‑mini) to produce summaries.

 ## Features

 - Upload PDF or plain‑text documents
 - Store uploaded documents in Supabase storage
 - View a list of uploaded documents with status information
 - Trigger AI summarization for a selected document
 - Display the generated summary in a clean, readable layout
 - Delete documents that are no longer needed

 ## Tech Stack

 - **Framework**: Next.js 16 (App Router)
 - **Language**: TypeScript, React 19
 - **Styling**: Tailwind CSS
 - **UI Components**: Radix UI + custom components
 - **State / Data Fetching**: SWR
 - **Backend / APIs**: Next.js API routes under `/app/api`
 - **Storage**: Supabase (PostgreSQL + Storage bucket)
 - **AI Models**: GitHub Models (e.g. GPT‑4.1‑mini)

 ## Getting Started

 ### Prerequisites

 - Node.js (LTS version recommended)
 - pnpm, npm, or yarn (examples below use **pnpm**)
 - A Supabase project with:
   - A `documents` table
   - A storage bucket for uploaded files
 - GitHub Models (or compatible) credentials configured via environment variables

 ### Installation

 1. Install dependencies:

    ```bash
    pnpm install
    ```

 2. Create an `.env.local` file in the project root and configure the required environment variables, for example:

    ```bash
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
    GITHUB_MODELS_API_KEY=your_github_models_api_key
    ```

    Adjust the variable names to match your actual implementation.

 ### Development

 To start the development server:

 ```bash
 pnpm dev
 ```

 The app will be available at `http://localhost:3000`.

 ### Production Build

 To create a production build and start it:

 ```bash
 pnpm build
 pnpm start
 ```

 ## Project Structure (High Level)

 - `app/` – Next.js app router pages and API routes  
   - `page.tsx` – main UI for uploading documents and viewing summaries  
   - `api/` – backend routes for uploading, listing, summarizing, and deleting documents
 - `components/` – shared React components and UI primitives
 - `lib/` – Supabase clients, shared types, and utilities
 - `scripts/` – SQL scripts to create tables and storage buckets

 ## How It Works

 1. The user uploads a PDF or TXT file from the home page.
 2. The file is stored in a Supabase storage bucket and metadata is saved in the `documents` table.
 3. When the user clicks **Summarize**, the frontend calls a Next.js API route (e.g. `/api/summarize`) with the document ID.
 4. The API retrieves the file, extracts its text (for PDFs using `pdf-parse`), and sends the text to a GitHub Model to generate a summary.
 5. The summary is stored and then displayed back to the user in the UI.

 ## Testing

 At a minimum, the following flows should be tested:

 - Upload a valid PDF and TXT file and verify that a summary is generated.
 - Upload multiple documents and summarize them individually.
 - Attempt to upload unsupported file types and confirm the app handles the error.
 - Trigger summarization when the AI API is unavailable and verify that the error is surfaced gracefully.
 - Delete documents and confirm that the list and storage remain in sync.

 ## Documentation Files

 For course or assignment submission, additional documentation is provided:

 - `task1.md` – high‑level overview of the application with screenshots
 - `task2.md` – step‑by‑step usage tutorial and description of the testing strategy

 Refer to those files for detailed walkthroughs and example screenshots.

