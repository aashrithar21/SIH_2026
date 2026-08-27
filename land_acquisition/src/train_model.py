
import os
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    classification_report, confusion_matrix, roc_auc_score,
    accuracy_score
)

DATA = "data/land_acquisition_training.csv"
MODEL = "models/delay_model.pkl"

df = pd.read_csv(DATA)

# Do not train on the target or post-outcome fields.
# delay_days is an observed outcome and must not be used as an input feature.
target = "delayed"

features = [
    "project_type", "state", "district",
    "land_area_hectares", "affected_families",
    "legal_disputes", "pending_approvals", "approval_delay_days",
    "compensation_percentage", "documentation_percentage",
    "rehabilitation_percentage", "possession_percentage",
    "stakeholder_response_percentage",
    "historical_performance_percentage",
    "sia_to_preliminary_months", "land_record_update_days",
    "objection_disposal_days", "acquisition_cost_deposit_months",
    "preliminary_to_declaration_months", "award_duration_months",
    "rr_implementation_months", "current_stage"
]

X = df[features]
y = df[target]

categorical = [
    "project_type", "state", "district", "current_stage"
]

numeric = [c for c in features if c not in categorical]

preprocessor = ColumnTransformer(
    transformers=[
        ("categorical", OneHotEncoder(handle_unknown="ignore"), categorical)
    ],
    remainder="passthrough"
)

model = RandomForestClassifier(
    n_estimators=350,
    max_depth=18,
    min_samples_leaf=3,
    class_weight="balanced",
    random_state=26017,
    n_jobs=-1
)

pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("model", model)
])

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.20,
    random_state=26017,
    stratify=y
)

pipeline.fit(X_train, y_train)

pred = pipeline.predict(X_test)
proba = pipeline.predict_proba(X_test)[:, 1]

print("\n===== MODEL EVALUATION =====")
print(f"Accuracy : {accuracy_score(y_test, pred):.4f}")
print(f"ROC-AUC  : {roc_auc_score(y_test, proba):.4f}")
print("\nClassification report:")
print(classification_report(y_test, pred))
print("Confusion matrix:")
print(confusion_matrix(y_test, pred))

os.makedirs("models", exist_ok=True)
joblib.dump(pipeline, MODEL)
print(f"\nSaved trained model to: {MODEL}")
