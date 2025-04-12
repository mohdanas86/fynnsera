from flask import Flask, request, jsonify
import joblib
import numpy as np
from sentence_transformers import SentenceTransformer

print("🚀 Loading model...")
clf = joblib.load("model/classifier.pkl")
embedder = SentenceTransformer("model/embedder")

app = Flask(__name__)

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    # For single transaction, expecting keys: "Description" and "Type"
    desc = data.get("Description", "")
    tx_type = data.get("Type", "Debit")  # default to Debit if not provided

    if not desc:
        return jsonify({"error": "Missing Description"}), 400

    input_text = f"{desc} | {tx_type}"
    vec = embedder.encode([input_text])
    proba = clf.predict_proba(vec)[0]
    confidence = float(np.max(proba))
    category = clf.classes_[np.argmax(proba)]

    if confidence < 0.6:
        category = "Other"

    return jsonify({
        "Category": category,
        "Confidence": round(confidence, 3)
    })

@app.route("/bulk_predict", methods=["POST"])
def bulk_predict():
    data = request.get_json()
    # Expecting "transactions" key with a list of transaction objects
    transactions = data.get("transactions", None)
    if transactions is None or not isinstance(transactions, list):
        return jsonify({"error": "Expected a JSON list under key 'transactions'"}), 400

    input_texts = []
    for txn in transactions:
        desc = txn.get("Description", "")
        tx_type = txn.get("Type", "Debit")
        if not desc:
            return jsonify({"error": "Each transaction must include a 'Description'"}), 400
        input_texts.append(f"{desc} | {tx_type}")

    # Encode all transaction texts in one batch
    embeddings = embedder.encode(input_texts)
    probas = clf.predict_proba(embeddings)
    predictions = clf.classes_[np.argmax(probas, axis=1)]
    confidences = np.max(probas, axis=1)

    results = []
    for i, txn in enumerate(transactions):
        pred = predictions[i]
        conf = float(confidences[i])
        if conf < 0.6:
            pred = "Other"
        results.append({
            "Description": txn.get("Description"),
            "Type": txn.get("Type", "Debit"),
            "Predicted_Category": pred,
            "Confidence": round(conf, 3)
        })

    return jsonify({"predictions": results})

@app.route("/", methods=["GET"])
def root():
    return jsonify({"message": "Bank Transaction Categorizer is running."})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
