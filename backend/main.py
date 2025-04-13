
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
import pdfplumber
import tempfile
import os
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

app = FastAPI()

# Allow CORS from your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    return {"msg": "FastAPI is working!"}

@app.post("/extract-text")
async def extract_text(
    file: UploadFile = File(...),
    userId: str = Form("")
):
    print(f"Received userId: {userId}")  # Debug log
    print(f"no userId: {userId}")


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

