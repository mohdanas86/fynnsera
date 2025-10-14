@echo off
REM Train ML Model Script for Windows
REM This script trains the transaction categorization model

echo ============================================
echo Training ML Model for Transaction Categorization
echo ============================================
echo.

cd ml_models

echo Step 1: Checking if training data exists...
if not exist "synthetic_data.csv" (
    echo ERROR: synthetic_data.csv not found!
    echo Please ensure the training data file exists in ml_models/
    pause
    exit /b 1
)

echo Step 2: Creating model directory...
if not exist "model" mkdir model
if not exist "model\embedder" mkdir model\embedder

echo Step 3: Running training script...
python train_model.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Training failed!
    echo Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo ============================================
echo Training Complete!
echo ============================================
echo.
echo Model files saved to:
echo - ml_models/model/classifier.pkl
echo - ml_models/model/embedder/
echo.
echo You can now start the FastAPI server.
echo.

cd ..
pause
