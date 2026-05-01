from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_curve, confusion_matrix
import pandas as pd
import numpy as np
import io, json

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.post("/train")
async def train(
    file: UploadFile = File(...),
    target: str = Form(...),
    features: str = Form(...),
    model_type: str = Form(...)
):
    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))
    df = df.select_dtypes(include='number')
    feat_cols = [c for c in json.loads(features) if c in df.columns]

    if target not in df.columns:
        return {"error": f"Target column '{target}' is not numeric"}

    X = df[feat_cols].values
    y = df[target].values

    # Binarize if target is continuous
    if pd.Series(y).nunique() > 2:
        y = (y >= np.median(y)).astype(int)
    else:
        y = y.astype(int)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    if model_type == "lr":
        model = LogisticRegression(max_iter=1000)
        model.fit(X_train, y_train)
        importance = abs(model.coef_[0]).tolist()
    else:
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)
        importance = model.feature_importances_.tolist()

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    cm = confusion_matrix(y_test, y_pred).tolist()
    fpr, tpr, _ = roc_curve(y_test, y_prob)
    imp_sum = sum(importance) or 1

    return {
        "accuracy":  round(accuracy_score(y_test, y_pred), 4),
        "precision": round(precision_score(y_test, y_pred, zero_division=0), 4),
        "recall":    round(recall_score(y_test, y_pred, zero_division=0), 4),
        "f1":        round(f1_score(y_test, y_pred, zero_division=0), 4),
        "confusion_matrix": cm,
        "roc": [{"fpr": round(float(f), 4), "tpr": round(float(t), 4)} for f, t in zip(fpr, tpr)],
        "feature_importance": [{"name": c, "val": round(v / imp_sum * 100, 1)} for c, v in zip(feat_cols, importance)]
    }