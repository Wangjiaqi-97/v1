 # Task 2 – Step-by-Step Tutorial and Testing Description

 ## 1. Introduction

 This document provides a step-by-step tutorial for using the **DocSummarizer** web application, including screenshots at each key step. It is written so that a user who is not familiar with the app can follow the instructions and successfully complete the main tasks.

 In addition, this document explains how the application was tested, covering both **happy paths** and **exceptional cases**.

 ---

 ## 2. Prerequisites

 To use the application, the user needs:

 - A modern web browser (Chrome, Edge, Firefox, or Safari)
 - At least one **PDF** or **TXT** document to upload
 - A stable internet connection (the AI summarization runs on a remote API)

 ---

 ## 3. Step-by-Step Tutorial

 ### Step 1 – Open the Application

 1. Open your browser.
 2. Navigate to the URL where the DocSummarizer app is deployed (for example: `http://localhost:3000` during development, or the deployed production URL).

 ![Home page – empty document list](./screenshots/home-empty.png)

 You should see the home page with:

 - A header showing the app name “DocSummarizer”
 - An upload section titled “Upload Document”
 - A document list section that is currently empty

 ---

 ### Step 2 – Upload a Document

 1. Scroll to the **“Upload Document”** section.
 2. Click on the upload area, or drag and drop a file into it.
 3. Select a **PDF** or **TXT** file from your computer.

 ![Uploading a document](./screenshots/uploading-document.png)

 After a successful upload:

 - The upload area will reset and show that the upload is complete.
 - The new document will appear in the **document list** below.

 ---

 ### Step 3 – View the Document List

 Once the upload has finished, locate the **document list** section.

 ![Document list with items](./screenshots/document-list.png)

 In this list:

 - Each item shows the **document name** and a **status** indicator.
 - Initially, the status is something like **“uploaded”** or **“ready”**.
 - There are buttons such as **“Summarize”** and **“Delete”** for each document.

 ---

 ### Step 4 – Trigger AI Summarization

 To generate a summary:

 1. Find the document you want to summarize in the list.
 2. Click the **“Summarize”** button for that document.

 ![Summarization in progress](./screenshots/summarization-processing.png)

 After clicking:

 - The app sends a POST request to the `/api/summarize` endpoint with the document ID.
 - The document status changes to **“processing”**.
 - A spinner or loading indicator shows that the summarization is in progress.

 ---

 ### Step 5 – Read the Generated Summary

 When the AI model finishes:

 1. The document status changes to **“summarized”**.
 2. The summary text becomes visible in the UI.

 ![Completed summary view](./screenshots/summary-completed.png)

 At this point, the user can:

 - Read the summary to quickly understand the document.
 - Upload additional documents and repeat the process.
 - Delete documents they no longer need by clicking the **“Delete”** button.

 ---

 ### Step 6 – Delete a Document (Optional)

 If the user decides that a document or its summary is no longer required:

 1. Locate the document in the list.
 2. Click the **“Delete”** button.

 The document will be removed from the list. If the deletion fails for any reason, the app reverts the local state to keep the document visible.

 ---

 ## 4. How We Tested the Application

 This section explains how the application was tested to ensure correct behavior.

 ### 4.1 Happy Path Tests

 These tests cover the normal user journey when everything works as expected.

 - **Upload and summarize a valid PDF**
   - Upload a small, well-formed PDF file.
   - Confirm that the document appears in the list with status “uploaded”.
   - Click “Summarize” and wait.
   - Verify that the status becomes “summarized” and a summary is displayed.
 - **Upload and summarize a TXT file**
   - Repeat the above steps with a plain-text file.
 - **Multiple documents**
   - Upload two or more documents.
   - Summarize them one by one.
   - Confirm that each document’s status and summary are correctly shown.

 ### 4.2 Exceptional and Edge Case Tests

 - **Unsupported file type**
   - Try to upload a file with an unsupported extension (e.g., `.jpg`).
   - Expected result: the app should reject the file and show an error message or prevent the upload.
 - **Very large file**
   - Upload a large PDF file close to the maximum size limit.
   - Verify that the upload either succeeds (and summarization works) or fails with a clear error message.
 - **Network failure during summarization**
   - Temporarily disconnect the network or simulate a failed API call when clicking “Summarize”.
   - Expected result:
     - The app logs or displays an error.
     - The status does not remain stuck in “processing” forever; the UI eventually reflects the failure.
 - **Deleting a document**
   - Delete an uploaded document.
   - Confirm that it is removed from the list.
   - If the backend delete call fails, verify that the document reappears (the optimistic UI is rolled back).
 - **Refreshing the page**
   - After uploading and summarizing one or more documents, refresh the browser.
   - Confirm that the list of documents and their statuses are correctly reloaded from the backend.

 ---

 ## 5. Conclusion

 This tutorial shows how a new user can:

 1. Open the DocSummarizer application,
 2. Upload a PDF or TXT document,
 3. Trigger AI summarization, and
 4. Read or delete the resulting summaries.

 By following the happy path and exceptional case tests described above, we verified that the core functionality of the application works as intended and that common error scenarios are handled gracefully.

