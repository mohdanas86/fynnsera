# from flask import Flask, request, jsonify
# import joblib
# import numpy as np
# from sentence_transformers import SentenceTransformer
# from flask_cors import CORS


# print("🚀 Loading model...")
# clf = joblib.load("model/classifier.pkl")
# embedder = SentenceTransformer("model/embedder")

# app = Flask(__name__)
# # This enables CORS for all routes and origins.
# CORS(app)

# @app.route("/predict", methods=["POST"])
# def predict():
#     data = request.get_json()
#     # For single transaction, expecting keys: "description" and "Type"
#     desc = data.get("description", "")
#     tx_type = data.get("transactionType", "Debit")  # default to Debit if not provided

#     if not desc:
#         return jsonify({"error": "Missing description"}), 400

#     input_text = f"{desc} | {tx_type}"
#     vec = embedder.encode([input_text])
#     proba = clf.predict_proba(vec)[0]
#     confidence = float(np.max(proba))
#     category = clf.classes_[np.argmax(proba)]

#     if confidence < 0.6:
#         category = "Other"

#     return jsonify({
#         "category": category,
#         "confidence": round(confidence, 3)
#     })

# @app.route("/bulk_predict", methods=["POST"])
# def bulk_predict():
#     data = request.get_json()
#     # Expecting "transactions" key with a list of transaction objects
#     transactions = data.get("transactions", None)
#     if transactions is None or not isinstance(transactions, list):
#         return jsonify({"error": "Expected a JSON list under key 'transactions'"}), 400

#     input_texts = []
#     for txn in transactions:
#         desc = txn.get("description", "")
#         tx_type = txn.get("transactionType", "Debit")
#         if not desc:
#             return jsonify({"error": "Each transaction must include a 'description'"}), 400
#         input_texts.append(f"{desc} | {tx_type}")

#     # Encode all transaction texts in one batch
#     embeddings = embedder.encode(input_texts)
#     probas = clf.predict_proba(embeddings)
#     predictions = clf.classes_[np.argmax(probas, axis=1)]
#     confidences = np.max(probas, axis=1)

#     results = []
#     for i, txn in enumerate(transactions):
#         pred = predictions[i]
#         conf = float(confidences[i])
#         if conf < 0.6:
#             pred = "Other"
#         results.append({
#             "description": txn.get("description"),
#             "transactionType": txn.get("transactionType", "Debit"),
#             "category": pred,
#             "confidence": round(conf, 3)
#         })

#     return jsonify({"predictions": results})

# @app.route("/", methods=["GET"])
# def root():
#     return jsonify({"message": "Bank Transaction Categorizer is running."})

# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=5000)


from flask import Flask, request, jsonify
import joblib
import numpy as np
from sentence_transformers import SentenceTransformer
from flask_cors import CORS

print("🚀 Loading model...")
clf = joblib.load("model/classifier.pkl")
embedder = SentenceTransformer("model/embedder")

app = Flask(__name__)
# This enables CORS for all routes and origins.
CORS(app)

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    # For single transaction, expecting keys: "description" and "transactionType"
    desc = data.get("description", "")
    tx_type = data.get("transactionType", "Debit")  # default to Debit if not provided

    if not desc:
        return jsonify({"error": "Missing description"}), 400

    input_text = f"{desc} | {tx_type}"
    vec = embedder.encode([input_text])
    proba = clf.predict_proba(vec)[0]
    confidence = float(np.max(proba))
    category = clf.classes_[np.argmax(proba)]

    if confidence < 0.6:
        category = "Other"

    # Merge original data with prediction results
    result = {
        **data,
        "category": category,
        "confidence": round(confidence, 3)
    }
    return jsonify(result)

@app.route("/bulk_predict", methods=["POST"])
def bulk_predict():
    data = request.get_json()
    # Expecting "transactions" key with a list of transaction objects
    transactions = data.get("transactions", None)
    if transactions is None or not isinstance(transactions, list):
        return jsonify({"error": "Expected a JSON list under key 'transactions'"}), 400

    input_texts = []
    for txn in transactions:
        desc = txn.get("description", "")
        tx_type = txn.get("transactionType", "Debit")
        if not desc:
            return jsonify({"error": "Each transaction must include a 'description'"}), 400
        input_texts.append(f"{desc} | {tx_type}")

    # Batch encode all transaction texts
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
        # Return all original fields plus prediction results
        txn_result = {
            **txn,
            "category": pred,
            "confidence": round(conf, 3)
        }
        results.append(txn_result)

    return jsonify({"predictions": results})

@app.route("/", methods=["GET"])
def root():
    return jsonify({"message": "Bank Transaction Categorizer is running."})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
