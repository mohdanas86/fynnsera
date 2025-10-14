#!/bin/bash
# Train ML Model Script for Linux/Mac
# This script trains the transaction categorization model

echo "============================================"
echo "Training ML Model for Transaction Categorization"
echo "============================================"
echo ""

cd ml_models

echo "Step 1: Checking if training data exists..."
if [ ! -f "synthetic_data.csv" ]; then
    echo "ERROR: synthetic_data.csv not found!"
    echo "Please ensure the training data file exists in ml_models/"
    exit 1
fi

echo "Step 2: Creating model directory..."
mkdir -p model/embedder

echo "Step 3: Running training script..."
python3 train_model.py

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Training failed!"
    echo "Please check the error messages above."
    exit 1
fi

echo ""
echo "============================================"
echo "Training Complete!"
echo "============================================"
echo ""
echo "Model files saved to:"
echo "- ml_models/model/classifier.pkl"
echo "- ml_models/model/embedder/"
echo ""
echo "You can now start the FastAPI server."
echo ""

cd ..
