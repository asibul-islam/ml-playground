from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_curve, confusion_matrix
from sklearn.preprocessing import StandardScaler
import pandas as pd
import numpy as np
import io, json
import pickle
from fastapi.responses import StreamingResponse

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Store last trained model + metadata in memory
store = {}

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

    if pd.Series(y).nunique() > 2:
        median = np.median(y)
        y = (y >= median).astype(int)
        store["median"] = median
        store["binarized"] = True
    else:
        y = y.astype(int)
        store["binarized"] = False

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)

    if model_type == "lr":
        model = LogisticRegression(max_iter=1000)
        model.fit(X_train, y_train)
        importance = abs(model.coef_[0]).tolist()
    else:
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)
        importance = model.feature_importances_.tolist()

    # Save to store
    store["model"] = model
    store["scaler"] = scaler
    store["feat_cols"] = feat_cols
    store["model_type"] = model_type

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


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if "model" not in store:
        return {"error": "No model trained yet. Train a model first."}

    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))

    feat_cols = store["feat_cols"]
    missing = [c for c in feat_cols if c not in df.columns]
    if missing:
        return {"error": f"Missing columns: {missing}"}

    X = df[feat_cols].values
    X = store["scaler"].transform(X)

    preds = store["model"].predict(X)
    probs = store["model"].predict_proba(X)[:, 1]

    rows = []
    for i, (pred, prob) in enumerate(zip(preds, probs)):
        row = {col: str(df[feat_cols[j]].iloc[i]) for j, col in enumerate(feat_cols)}
        row["prediction"] = int(pred)
        row["confidence"] = round(float(prob) * 100, 1)
        rows.append(row)

    return {"predictions": rows, "feat_cols": feat_cols}

@app.get("/download-model")
def download_model():
    if "model" not in store:
        return {"error": "No model trained yet"}

    payload = {
        "model": store["model"],
        "scaler": store["scaler"],
        "feat_cols": store["feat_cols"],
        "model_type": store["model_type"],
        "binarized": store.get("binarized", False),
        "median": store.get("median", None),
    }

    buffer = io.BytesIO()
    pickle.dump(payload, buffer)
    buffer.seek(0)

    filename = f"ml_playground_{store['model_type']}.pkl"
    return StreamingResponse(
        buffer,
        media_type="application/octet-stream",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )