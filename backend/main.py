
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import pdfplumber
import tempfile
import os
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import joblib
import numpy as np
from sentence_transformers import SentenceTransformer

# Initialize FastAPI app
app = FastAPI(title="Finance Management Backend API")

# Allow CORS from your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load ML model and embedder on startup
print("🚀 Loading ML model...")
try:
    clf = joblib.load("ml_models/model/classifier.pkl")
    embedder = SentenceTransformer("ml_models/model/embedder")
    print("✅ ML model loaded successfully")
except Exception as e:
    print(f"⚠️ Warning: Could not load ML model: {e}")
    print("   ML prediction endpoints will not work until model is trained")
    clf = None
    embedder = None

# Pydantic models for ML prediction
class Transaction(BaseModel):
    description: str
    transactionType: Optional[str] = "Debit"
    amount: Optional[float] = None
    date: Optional[str] = None
    userId: Optional[str] = None
    transactionId: Optional[str] = None

class BulkPredictRequest(BaseModel):
    transactions: List[Transaction]

def pdf_to_json(file_path, userId=""):
    transactions = []
    with pdfplumber.open(file_path) as pdf:
        lines = []
        # Combine text lines from each page
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                lines.extend(text.split("\n"))

    i = 0
    while i < len(lines):
        line = lines[i]
        # Check if this line represents a transaction (contains DEBIT or CREDIT)
        if "DEBIT" in line or "CREDIT" in line:
            try:
                # Assuming the first part of the line is the date (e.g., "Apr 09, 2025")
                date_part = line.split(" ")[0:3]  # e.g., ["Apr", "09,", "2025"]
                transaction_date_str = " ".join(date_part)  # "Apr 09, 2025"
                remainder = line.replace(transaction_date_str, "").strip()

                # Extract description based on keywords
                if "Paid to" in remainder:
                    description = remainder.split("Paid to")[1].split("DEBIT")[0].strip()
                    transaction_type = "DEBIT"
                elif "Received from" in remainder:
                    description = remainder.split("Received from")[1].split("CREDIT")[0].strip()
                    transaction_type = "CREDIT"
                else:
                    description = ""
                    transaction_type = ""

                # Extract amount after the rupee symbol "₹"
                if "₹" in remainder:
                    amount_str = remainder.split("₹")[-1].replace(",", "").strip()
                    try:
                        amount = float(amount_str)
                    except ValueError:
                        amount = 0
                else:
                    amount = 0

                # Extract additional information from the next lines:
                txn_line = lines[i + 1] if i + 1 < len(lines) else ""
                time_part = txn_line.split()[0] if txn_line.split() else "00:00"

                # Combine date and time and parse into ISO format, if possible
                try:
                    full_datetime = datetime.strptime(transaction_date_str + " " + time_part, "%b %d, %Y %H:%M")
                    createdAt = full_datetime.isoformat() + "Z"
                    date_only = full_datetime.strftime("%Y-%m-%dT00:00:00.000Z")
                except Exception:
                    createdAt = ""
                    date_only = ""

                if "Transaction ID" in txn_line:
                    transaction_id = txn_line.split("Transaction ID")[-1].strip()
                else:
                    transaction_id = ""

                # Line for UTR No (if needed, but not mapped to final format)
                utr_line = lines[i + 2] if i + 2 < len(lines) else ""
                if "UTR No." in utr_line:
                    utr_no = utr_line.split("UTR No.")[-1].strip()
                else:
                    utr_no = ""

                # Paid/Credited by information (if needed, but not mapped to final output)
                paid_line = lines[i + 3] if i + 3 < len(lines) else ""
                if paid_line:
                    paid_by = paid_line.split()[-1].strip()
                else:
                    paid_by = ""

                # Build transaction dictionary using the required keys.
                txn = {
                    "amount": amount,
                    "createdAt": createdAt,
                    "date": date_only,
                    "description": description,
                    "transactionId": transaction_id,
                     "transactionType": transaction_type,
                    "userId": userId,
                }
                transactions.append(txn)
                # Skip the 4 lines that we processed as part of this transaction block.
                i += 4
            except Exception as e:
                print(f"Skipping line due to error: {e}")
                i += 1
        else:
            i += 1

    return transactions

# Root endpoint
@app.get("/")
def home():
    return {
        "msg": "Finance Management Backend API is working!",
        "endpoints": {
            "pdf_extraction": "/extract-text",
            "ml_prediction": "/predict",
            "ml_bulk_prediction": "/bulk_predict"
        },
        "ml_model_loaded": clf is not None
    }

# ==================== PDF EXTRACTION ENDPOINT ====================

@app.post("/extract-text")
async def extract_text(
    file: UploadFile = File(...),
    userId: str = Form("")
):
    print(f"Received userId: {userId}")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp:
        temp.write(await file.read())
        temp_path = temp.name

    try:
        data = pdf_to_json(temp_path, userId=userId)
        return JSONResponse(content=data)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
    finally:
        os.remove(temp_path)

# ==================== ML PREDICTION ENDPOINTS ====================

@app.post("/predict")
async def predict(transaction: Transaction):
    """
    Predict category for a single transaction
    """
    if clf is None or embedder is None:
        return JSONResponse(
            content={"error": "ML model not loaded. Please train the model first."},
            status_code=503
        )
    
    desc = transaction.description
    tx_type = transaction.transactionType or "Debit"

    if not desc:
        return JSONResponse(content={"error": "Missing description"}, status_code=400)

    input_text = f"{desc} | {tx_type}"
    vec = embedder.encode([input_text])
    proba = clf.predict_proba(vec)[0]
    confidence = float(np.max(proba))
    category = clf.classes_[np.argmax(proba)]

    if confidence < 0.6:
        category = "Other"

    # Merge original data with prediction results
    result = {
        **transaction.dict(),
        "category": category,
        "confidence": round(confidence, 3)
    }
    return JSONResponse(content=result)

@app.post("/bulk_predict")
async def bulk_predict(request: BulkPredictRequest):
    """
    Predict categories for multiple transactions in batch
    """
    if clf is None or embedder is None:
        return JSONResponse(
            content={"error": "ML model not loaded. Please train the model first."},
            status_code=503
        )
    
    transactions = request.transactions
    
    if not transactions:
        return JSONResponse(
            content={"error": "Expected a list of transactions"},
            status_code=400
        )

    input_texts = []
    for txn in transactions:
        desc = txn.description
        tx_type = txn.transactionType or "Debit"
        if not desc:
            return JSONResponse(
                content={"error": "Each transaction must include a 'description'"},
                status_code=400
            )
        input_texts.append(f"{desc} | {tx_type}")

    # Batch encode all transaction texts
    embeddings = embedder.encode(input_texts)

    # 🔒 Fix: Ensure embeddings is a proper 2D array
    if len(embeddings) == 0:
        return JSONResponse(content={"error": "Empty input after encoding"}, status_code=400)
    if isinstance(embeddings, np.ndarray) and embeddings.ndim == 1:
        embeddings = embeddings.reshape(1, -1)

    probas = clf.predict_proba(embeddings)
    predictions = clf.classes_[np.argmax(probas, axis=1)]
    confidences = np.max(probas, axis=1)

    results = []
    for i, txn in enumerate(transactions):
        pred = predictions[i]
        conf = float(confidences[i])
        if conf < 0.6:
            pred = "Other"
        # Return all original fields plus prediction results
        txn_result = {
            **txn.dict(),
            "category": pred,
            "confidence": round(conf, 3)
        }
        results.append(txn_result)

    return JSONResponse(content={"predictions": results})

