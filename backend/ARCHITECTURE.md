# Backend Architecture

## Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Finance Management                        │
│                      Backend Service                         │
│                      (FastAPI - Port 8080)                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────┐    ┌──────────────────────┐       │
│  │  PDF Extraction     │    │  ML Prediction       │       │
│  │  Module             │    │  Module              │       │
│  ├─────────────────────┤    ├──────────────────────┤       │
│  │ • Upload PDF        │    │ • Load embedder      │       │
│  │ • Parse text        │    │ • Load classifier    │       │
│  │ • Extract data      │    │ • Single predict     │       │
│  │ • Format JSON       │    │ • Bulk predict       │       │
│  └─────────────────────┘    └──────────────────────┘       │
│           │                           │                     │
│           │                           │                     │
│           └───────────┬───────────────┘                     │
│                       │                                     │
│                       ▼                                     │
│            ┌──────────────────────┐                        │
│            │   FastAPI Router     │                        │
│            │   (main.py)          │                        │
│            └──────────────────────┘                        │
│                       │                                     │
└───────────────────────┼─────────────────────────────────────┘
                        │
                        ▼
                 ┌──────────────┐
                 │   Frontend   │
                 │  (Next.js)   │
                 └──────────────┘
```

## API Endpoints Flow

### 1. PDF Extraction Flow
```
Frontend                Backend                    Response
   │                       │                          │
   ├─ POST /extract-text ─▶│                          │
   │  (PDF + userId)        │                          │
   │                       │                          │
   │                       ├─ Parse PDF               │
   │                       ├─ Extract transactions    │
   │                       ├─ Format to JSON          │
   │                       │                          │
   │                       ├─────────────────────────▶│
   │                       │  [{transaction}, ...]    │
   │◀──────────────────────┼──────────────────────────┤
```

### 2. Single Prediction Flow
```
Frontend                Backend                ML Model              Response
   │                       │                      │                    │
   ├─ POST /predict ──────▶│                      │                    │
   │  {description, type}   │                      │                    │
   │                       │                      │                    │
   │                       ├─ Encode text ────────▶│                    │
   │                       │                      │                    │
   │                       │◀─ Embeddings ────────┤                    │
   │                       │                      │                    │
   │                       ├─ Predict ────────────▶│                    │
   │                       │                      │                    │
   │                       │◀─ Category + conf ───┤                    │
   │                       │                      │                    │
   │                       ├─────────────────────────────────────────▶│
   │                       │  {category, confidence, ...}              │
   │◀──────────────────────┼───────────────────────────────────────────┤
```

### 3. Bulk Prediction Flow
```
Frontend                Backend                ML Model              Response
   │                       │                      │                    │
   ├─ POST /bulk_predict ─▶│                      │                    │
   │  {transactions: [...]} │                      │                    │
   │                       │                      │                    │
   │                       ├─ Batch encode ───────▶│                    │
   │                       │                      │                    │
   │                       │◀─ Batch embeddings ──┤                    │
   │                       │                      │                    │
   │                       ├─ Batch predict ──────▶│                    │
   │                       │                      │                    │
   │                       │◀─ Categories + conf ─┤                    │
   │                       │                      │                    │
   │                       ├─────────────────────────────────────────▶│
   │                       │  {predictions: [{...}, ...]}              │
   │◀──────────────────────┼───────────────────────────────────────────┤
```

## Data Flow

### Transaction Processing Pipeline
```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│   PDF    │────▶│  Parse   │────▶│  Format  │────▶│  Store   │
│  Upload  │     │   Text   │     │   JSON   │     │   DB     │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                                        │
                                        │
                                        ▼
                                  ┌──────────┐
                                  │  ML      │
                                  │  Predict │
                                  └──────────┘
                                        │
                                        │
                                        ▼
                                  ┌──────────┐
                                  │ Add      │
                                  │ Category │
                                  └──────────┘
```

## ML Model Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    ML Models Directory                   │
│                    (ml_models/)                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Training Pipeline:                                      │
│  ┌────────────┐   ┌──────────┐   ┌─────────────┐       │
│  │ Synthetic  │──▶│  Train   │──▶│   Save      │       │
│  │   Data     │   │  Model   │   │   Model     │       │
│  │  (.csv)    │   │  Script  │   │  (.pkl)     │       │
│  └────────────┘   └──────────┘   └─────────────┘       │
│                                         │               │
│  Prediction Pipeline:                   │               │
│  ┌────────────┐   ┌──────────┐   ┌─────▼───────┐       │
│  │   Text     │──▶│ Embedder │──▶│ Classifier  │       │
│  │ Description│   │ (BERT)   │   │ (Ensemble)  │       │
│  └────────────┘   └──────────┘   └─────┬───────┘       │
│                                         │               │
│                                         ▼               │
│                                  ┌─────────────┐        │
│                                  │  Category   │        │
│                                  │+ Confidence │        │
│                                  └─────────────┘        │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack

```
┌─────────────────────────────────────────┐
│           Backend Stack                  │
├─────────────────────────────────────────┤
│ • FastAPI - Web framework               │
│ • Uvicorn - ASGI server                 │
│ • PDFPlumber - PDF parsing              │
│ • SentenceTransformers - Text encoding  │
│ • Scikit-learn - ML framework           │
│ • XGBoost - Gradient boosting           │
│ • NumPy - Numerical computing           │
│ • Joblib - Model serialization          │
└─────────────────────────────────────────┘
```

## Deployment Options

### Option 1: Single Server
```
┌────────────────────────────┐
│     Single Container       │
│   ┌────────────────────┐   │
│   │  FastAPI Service   │   │
│   │  + ML Models       │   │
│   │  Port: 8080        │   │
│   └────────────────────┘   │
└────────────────────────────┘
```

### Option 2: Docker Container
```
┌────────────────────────────┐
│   Docker Container          │
│  ┌──────────────────────┐  │
│  │  Python 3.9          │  │
│  │  + Dependencies      │  │
│  │  + FastAPI           │  │
│  │  + ML Models         │  │
│  └──────────────────────┘  │
│         Port 8080           │
└────────────────────────────┘
```

### Option 3: Cloud Deployment
```
┌──────────────────────────────┐
│    Cloud Platform            │
│  ┌────────────────────────┐  │
│  │  Container Instance    │  │
│  │  ┌──────────────────┐  │  │
│  │  │  Backend Service │  │  │
│  │  └──────────────────┘  │  │
│  │   Port 8080 (public)   │  │
│  └────────────────────────┘  │
└──────────────────────────────┘
```

## Request/Response Examples

### PDF Extraction Request
```
POST /extract-text HTTP/1.1
Content-Type: multipart/form-data

file: [PDF Binary Data]
userId: "user123"
```

### PDF Extraction Response
```json
[
  {
    "amount": 150.00,
    "createdAt": "2025-04-09T10:30:00Z",
    "date": "2025-04-09T00:00:00.000Z",
    "description": "Starbucks Coffee",
    "transactionId": "TXN123456",
    "transactionType": "DEBIT",
    "userId": "user123"
  }
]
```

### Single Prediction Request
```json
{
  "description": "Starbucks Coffee",
  "transactionType": "Debit"
}
```

### Single Prediction Response
```json
{
  "description": "Starbucks Coffee",
  "transactionType": "Debit",
  "category": "Food & Dining",
  "confidence": 0.95
}
```

### Bulk Prediction Request
```json
{
  "transactions": [
    {
      "description": "Starbucks Coffee",
      "transactionType": "Debit"
    },
    {
      "description": "Monthly Salary",
      "transactionType": "Credit"
    }
  ]
}
```

### Bulk Prediction Response
```json
{
  "predictions": [
    {
      "description": "Starbucks Coffee",
      "transactionType": "Debit",
      "category": "Food & Dining",
      "confidence": 0.95
    },
    {
      "description": "Monthly Salary",
      "transactionType": "Credit",
      "category": "Income",
      "confidence": 0.98
    }
  ]
}
```
