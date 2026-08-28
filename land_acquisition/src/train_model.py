import os
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline

from sklearn.impute import SimpleImputer

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier

from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    roc_auc_score,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score
)


# ============================================================
# CONFIGURATION
# ============================================================

DATA = "data/land_acquisition_training.csv"
MODEL = "models/delay_model.pkl"
MODEL_INFO = "models/model_info.pkl"

RANDOM_STATE = 26017


# ============================================================
# LOAD DATA
# ============================================================

print("=" * 65)
print("LAND ACQUISITION DELAY PREDICTION - MODEL TRAINING")
print("=" * 65)

df = pd.read_csv(DATA)

print(f"\nDataset: {DATA}")
print(f"Rows   : {len(df):,}")
print(f"Columns: {len(df.columns)}")


# ============================================================
# TARGET
# ============================================================

target = "delayed"


# ============================================================
# FEATURES
# ============================================================
#
# IMPORTANT:
#
# delay_days is intentionally NOT included.
#
# It is an observed historical outcome and would cause
# target leakage if used to predict delayed.
#

features = [
    "project_type",
    "state",
    "district",

    "land_area_hectares",
    "affected_families",

    "legal_disputes",
    "pending_approvals",
    "approval_delay_days",

    "compensation_percentage",
    "documentation_percentage",
    "rehabilitation_percentage",
    "possession_percentage",

    "stakeholder_response_percentage",
    "historical_performance_percentage",

    "sia_to_preliminary_months",
    "land_record_update_days",
    "objection_disposal_days",
    "acquisition_cost_deposit_months",
    "preliminary_to_declaration_months",
    "award_duration_months",
    "rr_implementation_months",

    "official_benchmark_breaches",

    "current_stage"
]


X = df[features]
y = df[target]


# ============================================================
# CHECK TARGET DISTRIBUTION
# ============================================================

print("\n" + "-" * 65)
print("TARGET DISTRIBUTION")
print("-" * 65)

target_distribution = y.value_counts(normalize=True)

print(
    f"Not delayed : {target_distribution.get(0, 0) * 100:.2f}%"
)

print(
    f"Delayed     : {target_distribution.get(1, 0) * 100:.2f}%"
)


# ============================================================
# CATEGORICAL / NUMERIC FEATURES
# ============================================================

categorical = [
    "project_type",
    "state",
    "district",
    "current_stage"
]

numeric = [
    c for c in features
    if c not in categorical
]


# ============================================================
# PREPROCESSING
# ============================================================

categorical_pipeline = Pipeline([
    (
        "imputer",
        SimpleImputer(strategy="most_frequent")
    ),
    (
        "encoder",
        OneHotEncoder(
            handle_unknown="ignore"
        )
    )
])


numeric_pipeline = Pipeline([
    (
        "imputer",
        SimpleImputer(strategy="median")
    ),
    (
        "scaler",
        StandardScaler()
    )
])


preprocessor = ColumnTransformer([
    (
        "categorical",
        categorical_pipeline,
        categorical
    ),
    (
        "numeric",
        numeric_pipeline,
        numeric
    )
])


# ============================================================
# TRAIN / TEST SPLIT
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=RANDOM_STATE,
    stratify=y
)

print("\n" + "-" * 65)
print("DATA SPLIT")
print("-" * 65)

print(f"Training records: {len(X_train):,}")
print(f"Testing records : {len(X_test):,}")


# ============================================================
# MODELS
# ============================================================

models = {

    "Logistic Regression": LogisticRegression(
        max_iter=2000,
        class_weight="balanced",
        random_state=RANDOM_STATE
    ),

    "Random Forest": RandomForestClassifier(
        n_estimators=500,
        max_depth=16,
        min_samples_leaf=3,
        class_weight="balanced",
        random_state=RANDOM_STATE,
        n_jobs=-1
    ),

    "Gradient Boosting": GradientBoostingClassifier(
        n_estimators=250,
        learning_rate=0.05,
        max_depth=4,
        min_samples_leaf=5,
        random_state=RANDOM_STATE
    )
}


# ============================================================
# TRAIN + EVALUATE
# ============================================================

results = {}

trained_pipelines = {}

print("\n" + "=" * 65)
print("MODEL COMPARISON")
print("=" * 65)


for name, model in models.items():

    print(f"\nTraining: {name} ...")

    pipeline = Pipeline([
        (
            "preprocessor",
            preprocessor
        ),
        (
            "model",
            model
        )
    ])

    pipeline.fit(
        X_train,
        y_train
    )

    pred = pipeline.predict(X_test)

    proba = pipeline.predict_proba(
        X_test
    )[:, 1]

    accuracy = accuracy_score(
        y_test,
        pred
    )

    precision = precision_score(
        y_test,
        pred,
        zero_division=0
    )

    recall = recall_score(
        y_test,
        pred,
        zero_division=0
    )

    f1 = f1_score(
        y_test,
        pred,
        zero_division=0
    )

    roc_auc = roc_auc_score(
        y_test,
        proba
    )

    results[name] = {
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "roc_auc": roc_auc
    }

    trained_pipelines[name] = pipeline

    print(
        f"Accuracy : {accuracy:.4f}"
    )

    print(
        f"Precision: {precision:.4f}"
    )

    print(
        f"Recall   : {recall:.4f}"
    )

    print(
        f"F1 Score : {f1:.4f}"
    )

    print(
        f"ROC-AUC  : {roc_auc:.4f}"
    )


# ============================================================
# MODEL COMPARISON TABLE
# ============================================================

results_df = pd.DataFrame(
    results
).T

results_df = results_df.sort_values(
    "roc_auc",
    ascending=False
)

print("\n" + "=" * 65)
print("MODEL PERFORMANCE")
print("=" * 65)

print(
    results_df.round(4).to_string()
)


# ============================================================
# SELECT BEST MODEL
# ============================================================
#
# ROC-AUC is used because this is a risk-probability system.
#
# We care about how well the model separates:
#
# HIGH delay risk
# from
# LOW delay risk
#

best_model_name = results_df.index[0]

best_pipeline = trained_pipelines[
    best_model_name
]

best_predictions = best_pipeline.predict(
    X_test
)

best_probabilities = best_pipeline.predict_proba(
    X_test
)[:, 1]


# ============================================================
# DETAILED EVALUATION
# ============================================================

print("\n" + "=" * 65)
print(f"BEST MODEL: {best_model_name}")
print("=" * 65)

print(
    f"\nAccuracy : "
    f"{accuracy_score(y_test, best_predictions):.4f}"
)

print(
    f"ROC-AUC  : "
    f"{roc_auc_score(y_test, best_probabilities):.4f}"
)

print("\nClassification report:")

print(
    classification_report(
        y_test,
        best_predictions,
        target_names=[
            "Not Delayed",
            "Delayed"
        ],
        zero_division=0
    )
)

print("Confusion matrix:")

print(
    confusion_matrix(
        y_test,
        best_predictions
    )
)


# ============================================================
# SAVE MODEL
# ============================================================

os.makedirs(
    "models",
    exist_ok=True
)

joblib.dump(
    best_pipeline,
    MODEL
)


# ============================================================
# SAVE MODEL INFORMATION
# ============================================================

model_info = {

    "model_name": best_model_name,

    "features": features,

    "categorical_features": categorical,

    "numeric_features": numeric,

    "target": target,

    "training_rows": len(X_train),

    "testing_rows": len(X_test),

    "metrics": results[best_model_name],

    "all_model_results": results
}


joblib.dump(
    model_info,
    MODEL_INFO
)


# ============================================================
# FINAL OUTPUT
# ============================================================

print("\n" + "=" * 65)
print("TRAINING COMPLETE")
print("=" * 65)

print(
    f"\nBest model: {best_model_name}"
)

print(
    f"ROC-AUC: "
    f"{results[best_model_name]['roc_auc']:.4f}"
)

print(
    f"\nSaved model:"
    f"\n{MODEL}"
)

print(
    f"\nSaved model information:"
    f"\n{MODEL_INFO}"
)

print("\nThe model is ready for application integration.")