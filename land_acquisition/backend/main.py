from fastapi import FastAPI, HTTPException, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
import os
from io import BytesIO


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="ACQUIVISION API",
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
# CHECK REQUIRED FILES
# ============================================================

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(
        f"ML model not found: {MODEL_PATH}"
    )

if not os.path.exists(DATA_PATH):
    raise FileNotFoundError(
        f"Dataset not found: {DATA_PATH}"
    )


# ============================================================
# LOAD ML MODEL
# ============================================================

model = joblib.load(MODEL_PATH)

print("============================================")
print("ML MODEL LOADED SUCCESSFULLY")
print("Model:", MODEL_PATH)
print("============================================")


# ============================================================
# LOAD DATASET
# ============================================================

projects_df = pd.read_csv(DATA_PATH)

print("============================================")
print("DATASET LOADED SUCCESSFULLY")
print("Dataset:", DATA_PATH)
print("Total projects:", len(projects_df))
print("Columns:", len(projects_df.columns))
print("============================================")


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
# ROOT / HEALTH CHECK
# ============================================================

@app.get("/")
def root():

    return {
        "status": "online",
        "message": "ACQUIVISION AI Prediction API",
        "model_loaded": True,
        "dataset_loaded": True,
        "total_projects": len(projects_df)
    }


# ============================================================
# DATASET INFORMATION
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
        100,
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

        "total_projects":
            len(projects_df),

        "limit":
            limit,

        "offset":
            offset,

        "returned_projects":
            len(data),

        "projects":
            data
            .fillna("")
            .to_dict(
                orient="records"
            )
    }


# ============================================================
# GET SINGLE PROJECT
# ============================================================

@app.get("/projects/{project_id}")
def get_project(project_id: str):

    result = projects_df[
        projects_df["project_id"].astype(str)
        == str(project_id)
    ]

    if result.empty:

        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    return {
        "success": True,

        "project":
            result
            .iloc[0]
            .fillna("")
            .to_dict()
    }


# ============================================================
# ADMIN CSV DATA UPLOAD
# ============================================================

@app.post("/upload-dataset")
async def upload_dataset(
    file: UploadFile = File(...)
):

    global projects_df

    # --------------------------------------------------------
    # CHECK FILE NAME
    # --------------------------------------------------------

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="No file was selected."
        )


    # --------------------------------------------------------
    # CHECK FILE TYPE
    # --------------------------------------------------------

    if not file.filename.lower().endswith(".csv"):

        raise HTTPException(
            status_code=400,
            detail="Only CSV files are allowed."
        )


    # --------------------------------------------------------
    # READ FILE
    # --------------------------------------------------------

    try:

        contents = await file.read()

        uploaded_df = pd.read_csv(
            BytesIO(contents)
        )

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=(
                "Unable to read CSV file: "
                f"{str(e)}"
            )
        )


    # --------------------------------------------------------
    # CHECK EMPTY FILE
    # --------------------------------------------------------

    if uploaded_df.empty:

        raise HTTPException(
            status_code=400,
            detail="Uploaded CSV file is empty."
        )


    # --------------------------------------------------------
    # CHECK COLUMN STRUCTURE
    # --------------------------------------------------------

    existing_columns = list(
        projects_df.columns
    )

    uploaded_columns = list(
        uploaded_df.columns
    )


    if existing_columns != uploaded_columns:

        missing_columns = [
            column
            for column in existing_columns
            if column not in uploaded_columns
        ]

        extra_columns = [
            column
            for column in uploaded_columns
            if column not in existing_columns
        ]

        message = (
            "CSV column structure does not "
            "match the existing dataset."
        )

        if missing_columns:

            message += (
                f" Missing columns: "
                f"{missing_columns}."
            )

        if extra_columns:

            message += (
                f" Extra columns: "
                f"{extra_columns}."
            )

        raise HTTPException(
            status_code=400,
            detail=message
        )


    # --------------------------------------------------------
    # CHECK DUPLICATE PROJECT IDS
    # --------------------------------------------------------

    if "project_id" in uploaded_df.columns:

        existing_ids = set(
            projects_df["project_id"]
            .astype(str)
        )

        uploaded_ids = (
            uploaded_df["project_id"]
            .astype(str)
        )

        duplicate_ids = [
            project_id
            for project_id in uploaded_ids
            if project_id in existing_ids
        ]

        if duplicate_ids:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Duplicate project ID found: "
                    +
                    ", ".join(
                        duplicate_ids[:10]
                    )
                )
            )


    # --------------------------------------------------------
    # VALIDATE REQUIRED DATA TYPES
    # --------------------------------------------------------

    numeric_columns = [

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

        "official_benchmark_breaches"
    ]


    try:

        for column in numeric_columns:

            uploaded_df[column] = pd.to_numeric(
                uploaded_df[column],
                errors="raise"
            )

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid numeric value in CSV: "
                f"{str(e)}"
            )
        )


    # --------------------------------------------------------
    # CHECK PROJECT IDS
    # --------------------------------------------------------

    if "project_id" in uploaded_df.columns:

        if uploaded_df["project_id"].isnull().any():

            raise HTTPException(
                status_code=400,
                detail="Project ID cannot be empty."
            )


    # --------------------------------------------------------
    # PREDICT DELAY FOR UPLOADED PROJECTS
    # --------------------------------------------------------

    try:

        prediction_input = uploaded_df.drop(
            columns=["project_id", "delayed", "delay_days"],
            errors="ignore"
        )


        probabilities = model.predict_proba(
            prediction_input
        )[:, 1]


        predictions = model.predict(
            prediction_input
        )


        uploaded_df["predicted_delay_probability"] = (
            probabilities * 100
        ).round(2)


        uploaded_df["predicted_delay"] = [
            "Delayed"
            if int(prediction) == 1
            else "Not Delayed"
            for prediction in predictions
        ]


        uploaded_df["risk_category"] = [
            "HIGH"
            if probability >= 70
            else
            "MEDIUM"
            if probability >= 40
            else
            "LOW"
            for probability in (
                probabilities * 100
            )
        ]


    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=(
                "Unable to generate prediction "
                f"for uploaded data: {str(e)}"
            )
        )


    # --------------------------------------------------------
    # REMOVE PREDICTION COLUMNS BEFORE SAVING
    # --------------------------------------------------------
    #
    # The original dataset structure must remain unchanged.
    #
    # --------------------------------------------------------

    prediction_columns = [
        "predicted_delay_probability",
        "predicted_delay",
        "risk_category"
    ]


    dataset_rows = uploaded_df.drop(
        columns=prediction_columns,
        errors="ignore"
    )


    # --------------------------------------------------------
    # APPEND DATA TO EXISTING DATASET
    # --------------------------------------------------------

    try:

        projects_df = pd.concat(
            [
                projects_df,
                dataset_rows
            ],
            ignore_index=True
        )


        # Save updated dataset
        projects_df.to_csv(
            DATA_PATH,
            index=False
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to save uploaded dataset: "
                f"{str(e)}"
            )
        )


    # --------------------------------------------------------
    # RETURN UPLOAD + PREDICTION RESULTS
    # --------------------------------------------------------

    prediction_results = []

    for index, row in uploaded_df.iterrows():

        prediction_results.append({

            "project_id":
                str(row.get(
                    "project_id",
                    ""
                )),

            "prediction":
                row.get(
                    "predicted_delay",
                    ""
                ),

            "delay_probability":
                float(
                    row.get(
                        "predicted_delay_probability",
                        0
                    )
                ),

            "risk_category":
                row.get(
                    "risk_category",
                    ""
                )
        })


    return {

        "success": True,

        "message": (
            f"{len(uploaded_df)} project(s) "
            "uploaded successfully."
        ),

        "uploaded_projects":
            len(uploaded_df),

        "total_projects":
            len(projects_df),

        "predictions":
            prediction_results,

        "projects":
            uploaded_df
            .fillna("")
            .to_dict(
                orient="records"
            )
    }


# ============================================================
# ANALYTICS
# ============================================================

@app.get("/analytics")
def analytics():

    total_projects = len(projects_df)


    delayed_projects = int(
        projects_df["delayed"].sum()
    )


    not_delayed_projects = (
        total_projects
        -
        delayed_projects
    )


    delay_rate = round(
        (
            delayed_projects
            /
            total_projects
        ) * 100,
        2
    )


    # ========================================================
    # STATE-WISE STATISTICS
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
    # DISTRICT-WISE STATISTICS
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


    # ========================================================
    # RETURN ANALYTICS
    # ========================================================

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
            state_stats
            .fillna("")
            .to_dict(
                orient="records"
            ),

        "district_statistics":
            district_stats
            .fillna("")
            .to_dict(
                orient="records"
            ),

        "project_type_statistics":
            project_type_stats
            .fillna("")
            .to_dict(
                orient="records"
            )
    }


# ============================================================
# ML PREDICTION API
# ============================================================

@app.post("/predict")
def predict(project: ProjectData):

    # --------------------------------------------------------
    # CONVERT REQUEST TO DICTIONARY
    # --------------------------------------------------------

    data = project.model_dump()


    # --------------------------------------------------------
    # CONVERT TO DATAFRAME
    # --------------------------------------------------------

    df = pd.DataFrame([data])


    # --------------------------------------------------------
    # ML PREDICTION
    # --------------------------------------------------------

    try:

        probability = model.predict_proba(
            df
        )[0][1]

        prediction = model.predict(
            df
        )[0]

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=(
                "Unable to generate prediction: "
                f"{str(e)}"
            )
        )


    # --------------------------------------------------------
    # CONVERT PROBABILITY TO PERCENTAGE
    # --------------------------------------------------------

    delay_probability = round(
        float(probability) * 100,
        2
    )


    # --------------------------------------------------------
    # RISK CATEGORY
    # --------------------------------------------------------

    if delay_probability >= 70:

        risk_category = "HIGH"

    elif delay_probability >= 40:

        risk_category = "MEDIUM"

    else:

        risk_category = "LOW"


    # --------------------------------------------------------
    # PREDICTION TEXT
    # --------------------------------------------------------

    if int(prediction) == 1:

        prediction_text = "Delayed"

    else:

        prediction_text = "Not Delayed"


    # --------------------------------------------------------
    # RETURN RESULT
    # --------------------------------------------------------

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