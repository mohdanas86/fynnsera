import os
import pandas as pd
import joblib
from sentence_transformers import SentenceTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import VotingClassifier
from sklearn.model_selection import GridSearchCV, cross_val_score
import xgboost as xgb
import re

# ----- Utility: Clean and Normalize Text -----
def normalize_text(text):
    # Lowercase and collapse whitespace
    text = text.lower().strip()
    text = re.sub(r'\s+', ' ', text)
    return text

# ----- Step: Load Pre-Generated Synthetic Data -----
def load_synthetic_data(file_path):
    df = pd.read_csv(file_path)
    print(f"✅ Loaded synthetic data with {len(df)} samples from {file_path}")
    return df

# ----- Step: Train the Ensemble Model and Save -----
def train_and_save():
    data_file = "synthetic_data.csv"
    df = load_synthetic_data(data_file)

    # Prepare training input: combine Description, Type, and Amount for richer context.
    # We assume that the synthetic data already contains columns "Description", "Type", and "Amount"
    X_text = df.apply(
        lambda row: f"{normalize_text(row['Description'])} | {row['Type'].lower()} | amount: {row['Amount']}", axis=1
    ).tolist()
    y = df['Category']

    print("🔍 Loading SentenceTransformer embedding model...")
    embedder = SentenceTransformer('all-MiniLM-L6-v2')
    X_vec = embedder.encode(X_text)

    print("🧠 Setting up ensemble classifier...")
    # Instantiate base classifiers.
    clf_lr = LogisticRegression(max_iter=3000, C=1.0, solver='lbfgs', n_jobs=-1)
    # Force XGBoost to use the CPU-based 'hist' tree method.
    clf_xgb = xgb.XGBClassifier(tree_method='hist', eval_metric='mlogloss')

    # Create the voting ensemble (using soft voting to average probabilities).
    ensemble = VotingClassifier(
        estimators=[('lr', clf_lr), ('xgb', clf_xgb)],
        voting='soft',
        n_jobs=-1
    )

    # Set up GridSearchCV with a small parameter grid.
    param_grid = {
        'lr__C': [0.5, 1.0, 2.0],
        'xgb__max_depth': [3, 5, 7]
    }
    grid = GridSearchCV(ensemble, param_grid, cv=3, n_jobs=1, scoring='accuracy', error_score='raise')
    grid.fit(X_vec, y)
    best_model = grid.best_estimator_
    print(f"📊 Best CV Accuracy: {grid.best_score_*100:.2f}%")
    print("Best Params:", grid.best_params_)

    # Evaluate the best model with 5-fold cross-validation.
    cv_scores = cross_val_score(best_model, X_vec, y, cv=5, n_jobs=1)
    print(f"📊 Final Cross-validation accuracy: {cv_scores.mean()*100:.2f}% ± {cv_scores.std()*100:.2f}%")

    os.makedirs("model/embedder", exist_ok=True)
    os.makedirs("model", exist_ok=True)

    print("💾 Saving ensemble classifier...")
    joblib.dump(best_model, "model/classifier.pkl")

    print("💾 Saving embedder (SentenceTransformer)...")
    embedder.save("model/embedder")

    from sklearn.metrics import accuracy_score
    preds = best_model.predict(X_vec)
    acc = accuracy_score(y, preds)
    print(f"✅ Training complete. Ensemble model accuracy on synthetic training data: {acc*100:.2f}%")

if __name__ == "__main__":
    train_and_save()
