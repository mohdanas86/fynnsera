# Finance Management Backend API

Unified backend service providing PDF extraction and ML-based transaction categorization.

## Features

### 1. PDF Text Extraction
- Extract transaction data from PDF bank statements
- Parse transaction details (date, amount, type, description)
- Convert to structured JSON format

### 2. ML Transaction Categorization
- Predict transaction categories using machine learning
- Single transaction prediction
- Bulk batch prediction
- Confidence scoring for predictions

## Project Structure

```
backend/
├── main.py                 # Main FastAPI application with all endpoints
├── requirements.txt        # Python dependencies
├── Dockerfile             # Docker configuration
├── cloudbuild.yaml        # Cloud Build configuration
├── train_model.bat        # Windows training script
├── train_model.sh         # Linux/Mac training script
└── ml_models/             # ML model directory
    ├── train_model.py     # Model training script
    ├── synthetic_data.csv # Training data
    ├── model/             # Trained model files (generated)
    │   ├── classifier.pkl
    │   └── embedder/
    └── README.md          # ML models documentation
```

## Setup and Installation

### Prerequisites
- Python 3.9+
- pip

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Train ML Model (Required for first-time setup)

**Windows:**
```bash
train_model.bat
```

**Linux/Mac:**
```bash
chmod +x train_model.sh
./train_model.sh
```

**Manual training:**
```bash
cd ml_models
python train_model.py
cd ..
```

### 3. Run the Server

**Development:**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8080
```

**Production:**
```bash
uvicorn main:app --host 0.0.0.0 --port 8080
```

The API will be available at `http://localhost:8080`

## API Endpoints

### Root
- **GET** `/` - API health check and endpoint information

### PDF Extraction
- **POST** `/extract-text`
  - Upload PDF bank statement
  - Returns structured transaction data
  - Form data: `file` (PDF), `userId` (optional)

### ML Prediction
- **POST** `/predict`
  - Predict category for single transaction
  - Body: `{"description": "string", "transactionType": "Debit"}`
  - Returns: category and confidence score

- **POST** `/bulk_predict`
  - Predict categories for multiple transactions
  - Body: `{"transactions": [...]}`
  - Returns: array of predictions with confidence scores

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8080/docs`
- ReDoc: `http://localhost:8080/redoc`

## Environment Variables

No environment variables required for basic operation. The service uses default configurations.

## Docker Deployment

### Build Docker Image
```bash
docker build -t finance-backend .
```

### Run Docker Container
```bash
docker run -p 8080:8080 finance-backend
```

## Cloud Deployment

The service includes `cloudbuild.yaml` for Google Cloud Build deployment. Configure your cloud settings as needed.

## Transaction Categories

The ML model predicts these categories:
- Food & Dining
- Shopping
- Transportation
- Bills & Utilities
- Entertainment
- Healthcare
- Travel
- Education
- Investment
- Income
- Transfer
- Other

## Model Training

For details on training and customizing the ML model, see `ml_models/README.md`.

## Development Notes

### Adding New Categories
1. Update `synthetic_data.csv` with examples
2. Retrain model using training scripts
3. Model automatically loads new categories

### Updating PDF Parser
Edit the `pdf_to_json()` function in `main.py` to match your PDF format.

## Troubleshooting

### Model Not Loading
If you see "ML model not loaded" error:
1. Ensure model is trained: Run `train_model.bat` or `train_model.sh`
2. Check if `ml_models/model/classifier.pkl` exists
3. Check if `ml_models/model/embedder/` directory exists

### PDF Extraction Issues
- Ensure PDF is readable (not image-based)
- Check PDF format matches expected bank statement structure
- Review extraction logic in `pdf_to_json()` function

## License

[Your License Here]
