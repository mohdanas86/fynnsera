# Fynnsera — AI-Powered Fintech Platform
Live : https://fynsera.netlify.app/

> Intelligent financial insights through AI-driven transaction processing and categorization.

## Overview

Fynnsera is a full-stack fintech platform utilizing OCR, NLP, and machine learning to process, categorize, and visualize financial transactions. It leverages AI for document parsing and financial categorization, enabling users to gain structured insights from uploaded statements and receipts.

## Features

- Document parsing PDFs
- Machine learning-based transaction categorization
- Dynamic financial dashboards and visualizations
- Conversational AI interface for financial queries
- Secure authentication and user management
- Fully responsive and modern UI

---

## Tech Stack

### Frontend

- Next.js (App Router, latest version)
- Tailwind CSS
- Component libraries: Radix UI, ShadCN
- Animation and icon support: Framer Motion, Lucide, Heroicons
- Notification system and theming support

### Backend

- Next.js API routes
- MongoDB with Mongoose ODM
- Authentication (provider-based)

### AI Services (Python Microservices)

#### Transaction Extraction (FastAPI)
- Technologies: Uvicorn, PDF parsing, OCR libraries

#### Categorization Model (Flask)
- Technologies: Transformers, Scikit-learn, XGBoost, Pandas, Flask

---

## Screenshots
![1.](https://github.com/user-attachments/assets/f20be483-6a20-44e5-aecb-b1880386f8b4)
![2.](https://github.com/user-attachments/assets/8dd527d4-cc20-45ab-9037-46723111275c)
![3.](https://github.com/user-attachments/assets/330326a7-569e-421b-b8db-517c45a47457)

---

## Local Development Setup

### Frontend (Next.js)

```bash
git clone https://github.com/yourusername/fynnsera.git
cd fynnsera
npm install
npm run dev
```

### Python Microservices

#### Transaction Extractor (FastAPI)

```bash
cd backend/fastapi-extractor
pip install -r requirements.txt
uvicorn app:app --reload
```

#### Categorization Model (Flask)

```bash
cd backend/flask-categorizer
pip install -r requirements.txt
python app.py
```

> Ensure MongoDB is running and `.env` variables are configured correctly for database, authentication, and service integrations.

---

## Contributing

Contributions are welcome. Please open issues or submit feature requests and pull requests.

