# Simplified Cloud-Based Document Management System

## Overview
A lightweight web-based system to upload, store, and retrieve documents using ReactJS and AWS (Lambda, S3, DynamoDB, API Gateway, Cognito).

---

## 🌐 Deployed URLs
- **Frontend (Amplify)**: [https://main--cloud-doc-system.amplifyapp.com](https://main.d36lpth6m3auwp.amplifyapp.com/)
  
---

## 🚀 Features
- User login (via AWS Cognito or test account)
- Upload and list user-specific documents
- Filter and sort by type/date/name
- Delete and download documents

---

## 🧱 Tech Stack
- **Frontend**: ReactJS + TypeScript, Redux, AWS Amplify
- **Backend**: AWS Lambda (Python), S3, DynamoDB, API Gateway
- **Auth**: AWS Cognito

---

## 🛠️ AWS Setup Summary
- S3 Bucket: `doc-mgmt-system-bucket`
- DynamoDB Table: `DocumentsMetadata`
- Cognito User Pool: handles username/password login
- IAM Role: Grants Lambda access to S3 and DynamoDB

---

## 🔧 Lambda Functions (Python)
1. `DocumentUploadFunction` – handles `POST /upload`, `GET /documents`
2. `DeleteDocumentFunction` – handles `DELETE /delete-document`

---

## 🖥️ App Structure
```
src/
├── index.tsx
├── App.tsx
└── WebApp/
    ├── index.tsx
    ├── TOC.tsx
    ├── Dashboard/ (Document UI)
    └── Account/ (Login, Signup, Profile)
```

---

## ⚙️ Behavior
- Sign-in screen shown by default
- After login: view Profile, update user info, see own documents
- Upload via drag-and-drop or file picker
- File controls: filter, sort, delete, download

---

## 🗃️ Database Model
**Users** (via Cognito):
- `user_id`, `username`, `password`, `first_name`, `last_name`, `dob`, `email`

**Documents**:
- `document_id`, `user_id`, `s3_key`, `file_name`, `upload_time`

**Relationship**: One user → many documents

---

## 🤝 Author
Runying Chen 😄

---
