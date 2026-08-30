from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
import os


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="LAND-SAFE API",
    description="AI-powered Land Acquisition Delay Prediction API",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "delay_model.pkl"
)

DATA_PATH = os.path.join(
    BASE_DIR,
    "data",
    "land_acquisition_training.csv"
)


# ============================================================
# CHECK FILES
# ============================================================

if not os.path.exists(DATA_PATH):
    raise FileNotFoundError(
        f"Dataset not found: {DATA_PATH}"
    )

if not os.path.exists(MODEL_PATH):
    print(
        f"WARNING: ML model not found: {MODEL_PATH}"
    )
    model = None
else:
    model = joblib.load(MODEL_PATH)

    print("============================================")
    print("ML model loaded successfully")
    print("Model:", MODEL_PATH)
    print("============================================")


# ============================================================
# LOAD DATASET
# ============================================================

projects_df = pd.read_csv(DATA_PATH)

# Clean column names
projects_df.columns = (
    projects_df.columns
    .str.strip()
)

# Clean project IDs
if "project_id" in projects_df.columns:
    projects_df["project_id"] = (
        projects_df["project_id"]
        .astype(str)
        .str.strip()
    )


print("============================================")
print("Dataset loaded successfully")
print("Dataset:", DATA_PATH)
print("Total projects:", len(projects_df))
print("Columns:", len(projects_df.columns))
print("============================================")


# ============================================================
# HELPERS
# ============================================================

def clean_records(df):
    """
    Convert dataframe into JSON-safe records.
    """
    return (
        df
        .replace([float("inf"), float("-inf")], None)
        .fillna("")
        .to_dict(orient="records")
    )


def clean_record(row):
    """
    Convert one dataframe row into JSON-safe dictionary.
    """
    return (
        row
        .replace([float("inf"), float("-inf")], None)
        .fillna("")
        .to_dict()
    )


# ============================================================
# INPUT DATA MODEL
# ============================================================

class ProjectData(BaseModel):

    project_type: str
    state: str
    district: str

    land_area_hectares: float
    affected_families: int

    legal_disputes: int
    pending_approvals: int
    approval_delay_days: int

    compensation_percentage: float
    documentation_percentage: float
    rehabilitation_percentage: float
    possession_percentage: float

    stakeholder_response_percentage: float
    historical_performance_percentage: float

    sia_to_preliminary_months: float
    land_record_update_days: int
    objection_disposal_days: int

    acquisition_cost_deposit_months: float
    preliminary_to_declaration_months: float
    award_duration_months: float
    rr_implementation_months: float

    current_stage: str

    official_benchmark_breaches: int


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {
        "status": "online",
        "message": "LAND-SAFE AI Prediction API",
        "model_loaded": model is not None,
        "dataset_loaded": True,
        "total_projects": len(projects_df)
    }


# ============================================================
# DATASET INFO
# ============================================================

@app.get("/dataset-info")
def dataset_info():

    return {
        "success": True,
        "total_projects": len(projects_df),
        "total_columns": len(projects_df.columns),
        "columns": projects_df.columns.tolist()
    }


# ============================================================
# GET ALL PROJECTS
# ============================================================

@app.get("/projects")
def get_projects(
    limit: int = Query(
        12000,
        ge=1,
        le=12000
    ),
    offset: int = Query(
        0,
        ge=0
    )
):

    data = projects_df.iloc[
        offset:offset + limit
    ]

    return {
        "success": True,
        "total_projects": len(projects_df),
        "limit": limit,
        "offset": offset,
        "returned_projects": len(data),
        "projects": clean_records(data)
    }


# ============================================================
# GET SINGLE PROJECT
# ============================================================

@app.get("/projects/{project_id}")
def get_project(project_id: str):

    project_id = str(project_id).strip()

    result = projects_df[
        projects_df["project_id"]
        .astype(str)
        .str.strip()
        == project_id
    ]

    if result.empty:

        raise HTTPException(
            status_code=404,
            detail=f"Project {project_id} not found"
        )

    return {
        "success": True,
        "project": clean_record(
            result.iloc[0]
        )
    }


# ============================================================
# ANALYTICS
# ============================================================

@app.get("/analytics")
def analytics():

    total_projects = len(projects_df)

    delayed_projects = 0

    if "delayed" in projects_df.columns:

        delayed_projects = int(
            pd.to_numeric(
                projects_df["delayed"],
                errors="coerce"
            )
            .fillna(0)
            .sum()
        )

    not_delayed_projects = (
        total_projects -
        delayed_projects
    )

    delay_rate = (
        round(
            delayed_projects /
            total_projects *
            100,
            2
        )
        if total_projects > 0
        else 0
    )


    # ========================================================
    # STATE STATISTICS
    # ========================================================

    state_stats = (
        projects_df
        .groupby("state")
        .agg(
            total_projects=(
                "project_id",
                "count"
            ),
            delayed_projects=(
                "delayed",
                "sum"
            ),
            average_delay_days=(
                "delay_days",
                "mean"
            )
        )
        .reset_index()
    )

    state_stats["delay_rate"] = (
        state_stats["delayed_projects"]
        /
        state_stats["total_projects"]
        *
        100
    ).round(2)

    state_stats["average_delay_days"] = (
        state_stats["average_delay_days"]
        .round(2)
    )


    # ========================================================
    # DISTRICT STATISTICS
    # ========================================================

    district_stats = (
        projects_df
        .groupby("district")
        .agg(
            total_projects=(
                "project_id",
                "count"
            ),
            delayed_projects=(
                "delayed",
                "sum"
            ),
            average_delay_days=(
                "delay_days",
                "mean"
            )
        )
        .reset_index()
    )

    district_stats["delay_rate"] = (
        district_stats["delayed_projects"]
        /
        district_stats["total_projects"]
        *
        100
    ).round(2)

    district_stats["average_delay_days"] = (
        district_stats["average_delay_days"]
        .round(2)
    )


    # ========================================================
    # PROJECT TYPE STATISTICS
    # ========================================================

    project_type_stats = (
        projects_df
        .groupby("project_type")
        .agg(
            total_projects=(
                "project_id",
                "count"
            ),
            delayed_projects=(
                "delayed",
                "sum"
            ),
            average_delay_days=(
                "delay_days",
                "mean"
            )
        )
        .reset_index()
    )

    project_type_stats["delay_rate"] = (
        project_type_stats["delayed_projects"]
        /
        project_type_stats["total_projects"]
        *
        100
    ).round(2)

    project_type_stats["average_delay_days"] = (
        project_type_stats["average_delay_days"]
        .round(2)
    )


    return {

        "success": True,

        "summary": {

            "total_projects":
                total_projects,

            "delayed_projects":
                delayed_projects,

            "not_delayed_projects":
                not_delayed_projects,

            "delay_rate":
                delay_rate
        },

        "state_statistics":
            clean_records(
                state_stats
            ),

        "district_statistics":
            clean_records(
                district_stats
            ),

        "project_type_statistics":
            clean_records(
                project_type_stats
            )
    }


# ============================================================
# ALERTS
# ============================================================

@app.get("/alerts")
def alerts():

    df = projects_df.copy()

    # Ensure delayed is numeric
    df["delayed"] = pd.to_numeric(
        df["delayed"],
        errors="coerce"
    ).fillna(0)

    # Calculate risk score
    df["risk_score"] = (
        df["delayed"]
        .apply(
            lambda x: 75 if x == 1 else 25
        )
    )

    # Risk category
    def risk_category(score):

        if score >= 70:
            return "Critical"

        if score >= 50:
            return "High"

        if score >= 30:
            return "Medium"

        return "Low"

    df["risk_level"] = (
        df["risk_score"]
        .apply(risk_category)
    )

    # Only active alerts
    alert_df = df[
        df["risk_level"]
        .isin(
            ["Critical", "High", "Medium"]
        )
    ]

    return {
        "success": True,
        "total_alerts": len(alert_df),
        "critical": len(
            alert_df[
                alert_df["risk_level"]
                == "Critical"
            ]
        ),
        "high": len(
            alert_df[
                alert_df["risk_level"]
                == "High"
            ]
        ),
        "medium": len(
            alert_df[
                alert_df["risk_level"]
                == "Medium"
            ]
        ),
        "alerts": clean_records(
            alert_df
        )
    }


# ============================================================
# MODEL INFORMATION
# ============================================================

@app.get("/model-info")
def model_info():

    return {

        "success": True,

        "model_loaded":
            model is not None,

        "model_version":
            "DelayRisk-AI v1.0",

        "model_type":
            "Land Acquisition Delay Prediction",

        "dataset_records":
            len(projects_df),

        "features":
            len(ProjectData.model_fields),

        "dataset_columns":
            len(projects_df.columns),

        "status":
            "Active"
            if model is not None
            else "Dataset Ready - Model Missing"
    }


# ============================================================
# PREDICTION API
# ============================================================

@app.post("/predict")
def predict(project: ProjectData):

    if model is None:

        raise HTTPException(
            status_code=503,
            detail="ML model is not loaded."
        )


    # --------------------------------------------------------
    # Convert request
    # --------------------------------------------------------

    data = project.model_dump()


    # --------------------------------------------------------
    # DataFrame
    # --------------------------------------------------------

    df = pd.DataFrame([data])


    # --------------------------------------------------------
    # Prediction
    # --------------------------------------------------------

    try:

        probability = (
            model
            .predict_proba(df)[0][1]
        )

        prediction = (
            model
            .predict(df)[0]
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )


    # --------------------------------------------------------
    # Probability
    # --------------------------------------------------------

    delay_probability = round(
        float(probability) * 100,
        2
    )


    # --------------------------------------------------------
    # Risk
    # --------------------------------------------------------

    if delay_probability >= 70:

        risk_category = "HIGH"

    elif delay_probability >= 40:

        risk_category = "MEDIUM"

    else:

        risk_category = "LOW"


    # --------------------------------------------------------
    # Prediction text
    # --------------------------------------------------------

    prediction_text = (
        "Delayed"
        if int(prediction) == 1
        else "Not Delayed"
    )


    return {

        "success": True,

        "project_type":
            project.project_type,

        "state":
            project.state,

        "district":
            project.district,

        "delay_probability":
            delay_probability,

        "prediction":
            prediction_text,

        "risk_category":
            risk_category
    }