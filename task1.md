 # Task 1 – Application Overview with Screenshots

 ## 1. Application Summary

 **Application name**: DocSummarizer  
 **Technology stack**: Next.js, TypeScript, React, Tailwind CSS, Supabase (storage), GitHub Models (GPT‑4.1‑mini)

 DocSummarizer is a web application that allows users to upload PDF or TXT documents and automatically generates an AI-based summary. The app is designed to make it easy to quickly understand long documents without reading them in full.

 Key features:

 - Upload PDF or plain-text files
 - List all uploaded documents with status information
 - Trigger AI summarization for a selected document
 - View the generated summary and metadata
 - Delete documents that are no longer needed

 ---

 ## 2. Main Screenshots

 > Note: Replace the image file names with your own screenshots.

 ### 2.1 Home Page – Empty State

 ![Home page – empty document list](./screenshots/home-empty.png)

 This screenshot shows the initial state of the application:

 - A **header** with the app logo and title “DocSummarizer”.
 - An **upload section** prompting the user to upload a PDF or TXT file.
 - A **document list section** that currently shows a message indicating that no documents have been uploaded yet.

 ---

 ### 2.2 Uploading a Document

 ![Uploading a document](./screenshots/uploading-document.png)

 This screenshot demonstrates the upload flow:

 - The user selects a PDF or TXT file using the upload zone.
 - The UI shows a visual drop area and feedback once the file is selected.
 - After the upload is complete, the document will appear in the list below.

 ---

 ### 2.3 Document List with Items

 ![Document list with items](./screenshots/document-list.png)

 This screenshot shows the **document list** populated with uploaded documents:

 - Each card or row displays:
   - The **document name**
   - The **upload time**
   - The current **status** (e.g., “uploaded”, “processing”, “summarized”)
 - There are action buttons such as:
   - **Summarize** – triggers the AI summarization
   - **Delete** – removes the document from the system

 ---

 ### 2.4 Summarization in Progress

 ![Summarization in progress](./screenshots/summarization-processing.png)

 In this screenshot:

 - The selected document has status **“processing”**.
 - The UI uses a spinner or loading indicator to show that the summarization request has been sent to the backend.
 - This state helps the user understand that they need to wait for the AI model to finish.

 ---

 ### 2.5 Completed Summary View

 ![Completed summary view](./screenshots/summary-completed.png)

 This screenshot shows the UI after summarization is completed:

 - The document status changes to **“summarized”**.
 - The generated summary text is displayed in a readable format.
 - The user can still delete the document if they no longer need it.

 ---

 ## 3. How the Screens Relate to the User Flow

 1. **Home page (empty state)** – The user opens the app and is prompted to upload a document.
 2. **Uploading a document** – The user chooses a file and uploads it.
 3. **Document list with items** – The uploaded document appears in the list.
 4. **Summarization in progress** – The user clicks “Summarize”, and the app calls the backend API to generate a summary.
 5. **Completed summary view** – The AI summary is shown, and the user can review, upload more documents, or delete existing ones.

 These screenshots collectively provide a clear overview of the entire user journey in the DocSummarizer application.

