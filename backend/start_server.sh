#!/bin/bash
# Start Backend Server
echo "============================================"
echo "Starting Finance Management Backend API"
echo "============================================"
echo ""

# Check if model exists
if [ ! -f "ml_models/model/classifier.pkl" ]; then
    echo "WARNING: ML model not found!"
    echo ""
    echo "The prediction endpoints will not work until the model is trained."
    echo "To train the model, run: ./train_model.sh"
    echo ""
    echo "Press Enter to start server anyway, or Ctrl+C to cancel..."
    read
fi

echo "Starting FastAPI server on http://localhost:8080"
echo "API docs will be available at http://localhost:8080/docs"
echo ""

uvicorn main:app --reload --host 0.0.0.0 --port 8080
