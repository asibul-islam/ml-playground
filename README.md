# ML Model Playground

A full-stack machine learning web app that lets you upload a CSV dataset, select features, train a classification model, and inspect results — all in the browser.

Built with React + Vite on the frontend and FastAPI + scikit-learn on the backend.

![ML Playground Screenshot](https://placehold.co/800x400?text=ML+Model+Playground)

---

## Features

- **CSV upload** — drag and drop any CSV file with a header row
- **Column assignment** — interactively pick which columns are features and which is the target label
- **Two models** — Logistic Regression (gradient descent) and Random Forest (100 trees)
- **Auto-preprocessing** — non-numeric columns are dropped automatically; continuous targets are binarized at the median
- **Results dashboard** — accuracy, precision, recall, F1 score, confusion matrix, ROC curve, and feature importance chart
- **80/20 train/test split** — all metrics are evaluated on held-out data

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Recharts, Axios |
| Backend | FastAPI, Uvicorn, scikit-learn, pandas, NumPy |
| Deployment | Vercel (frontend), Railway (backend) |

---

## Project Structure

```
ml-playground/
├── backend/
│   ├── main.py           # FastAPI app — /train endpoint
│   ├── requirements.txt  # Python dependencies
│   └── venv/             # Virtual environment (not committed)
├── src/
│   ├── components/
│   │   ├── Uploader.jsx  # Step 1 — CSV drag and drop
│   │   ├── Configure.jsx # Step 2 — column picker + model selector
│   │   └── Results.jsx   # Step 3 — metrics dashboard
│   ├── App.jsx           # Root component + step navigation
│   ├── main.jsx          # React entry point
│   └── index.css         # Global styles
├── index.html
├── package.json
├── vite.config.js
└── .gitignore
```

---

## Getting Started

### Prerequisites

- Node.js v20+
- Python 3.11+
- Git

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/ml-playground.git
cd ml-playground
```

### 2. Set up the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The API will be running at `http://localhost:8000`.

### 3. Set up the frontend

Open a second terminal:

```bash
cd ml-playground
npm install
npm run dev
```

The app will be running at `http://localhost:5173`.

---

## API Reference

### `POST /train`

Trains a classification model on the uploaded dataset.

**Form fields:**

| Field | Type | Description |
|---|---|---|
| `file` | File | CSV file with a header row |
| `target` | string | Name of the target column |
| `features` | JSON string | Array of feature column names e.g. `["col1", "col2"]` |
| `model_type` | string | `"lr"` for Logistic Regression or `"rf"` for Random Forest |

**Response:**

```json
{
  "accuracy": 0.962,
  "precision": 0.923,
  "recall": 1.0,
  "f1": 0.96,
  "confusion_matrix": [[13, 1], [0, 12]],
  "roc": [{"fpr": 0.0, "tpr": 0.0}, ...],
  "feature_importance": [{"name": "gdp_per_capita", "val": 62.3}, ...]
}
```

---

## How It Works

### Preprocessing
- Non-numeric columns (e.g. country names) are automatically dropped using `select_dtypes(include='number')`
- If the target column has more than 2 unique values (continuous), it is binarized at the median — values at or above the median become class `1`, below become class `0`

### Models
- **Logistic Regression** — scikit-learn's `LogisticRegression` with `max_iter=1000`. Feature importance is derived from the absolute values of the model coefficients.
- **Random Forest** — 100 decision trees with bootstrap sampling. Feature importance comes directly from `feature_importances_` (mean decrease in impurity).

### Evaluation
- All metrics are computed on the 20% held-out test set
- ROC curve is computed using `sklearn.metrics.roc_curve`

---

## Deployment

### Backend → Railway

1. Create a new project on [railway.app](https://railway.app) and connect your GitHub repo
2. Set the root directory to `backend`
3. Add a `Procfile` in the `backend/` folder:
   ```
   web: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
4. Railway will install from `requirements.txt` and deploy automatically

### Frontend → Vercel

1. Update the API URL in `Configure.jsx` from `http://localhost:8000` to your Railway URL
2. Push the change to GitHub
3. Import the repo on [vercel.com](https://vercel.com)
4. Set build command to `npm run build` and output directory to `dist`
5. Deploy — Vercel handles everything else

---

## Example Datasets

Any CSV with numeric columns works. Some good ones to try:

- [World Happiness Report](https://www.kaggle.com/datasets/unsdsn/world-happiness) — predict above/below average happiness score
- [Iris Dataset](https://archive.ics.uci.edu/ml/datasets/iris) — classify flower species (binary only — pick two classes)
- [Titanic](https://www.kaggle.com/c/titanic/data) — predict survival (drop non-numeric columns or they are auto-dropped)
- [Heart Disease UCI](https://archive.ics.uci.edu/ml/datasets/Heart+Disease) — predict presence of heart disease

---

## Roadmap

- [ ] Multi-class classification support
- [ ] Cross-validation instead of a single train/test split
- [ ] Data preview table after upload
- [ ] Download trained model as `.pkl`
- [ ] Support for regression targets (MSE, R²)
- [ ] SHAP values for explainability

---

## License

MIT
