# ML Models Directory

This directory contains the machine learning model for transaction categorization.

## Structure

```
ml_models/
├── model/              # Trained model files (generated after training)
│   ├── classifier.pkl  # Trained ensemble classifier
│   └── embedder/       # SentenceTransformer embedder model
├── train_model.py      # Training script
├── synthetic_data.csv  # Training data
└── README.md          # This file
```

## Training the Model

To train the categorization model, follow these steps:

### 1. Navigate to the ml_models directory
```bash
cd backend/ml_models
```

### 2. Run the training script
```bash
python train_model.py
```

This will:
- Load synthetic training data from `synthetic_data.csv`
- Train an ensemble model (Logistic Regression + XGBoost)
- Use SentenceTransformer embeddings for text processing
- Perform hyperparameter tuning with GridSearchCV
- Save the trained model to `model/classifier.pkl`
- Save the embedder to `model/embedder/`

### 3. Verify model files exist
After training, ensure these files exist:
- `model/classifier.pkl`
- `model/embedder/` (directory with model files)

## Model Details

- **Embedder**: `all-MiniLM-L6-v2` SentenceTransformer
- **Classifier**: Voting ensemble of Logistic Regression and XGBoost
- **Input Features**: Transaction description + transaction type
- **Output**: Category prediction with confidence score
- **Confidence Threshold**: 0.6 (predictions below this are marked as "Other")

## Categories

The model predicts the following transaction categories:
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

## Usage in Main API

The trained model is automatically loaded when the FastAPI server starts. The model is used in two endpoints:
- `/predict` - Single transaction prediction
- `/bulk_predict` - Batch prediction for multiple transactions

## Requirements

All required packages are listed in `backend/requirements.txt`:
- sentence-transformers
- scikit-learn
- xgboost
- joblib
- numpy
- pandas
