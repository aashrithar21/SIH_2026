# AcquiVision — Land Acquisition Risk Monitor

> **Smart India Hackathon 2026 project**
>
> **Predicting tomorrow's land-acquisition delays today.**

AcquiVision is an AI-assisted decision-support platform for monitoring land acquisition projects, identifying projects with higher delay risk, and helping administrators and risk managers prioritize intervention.

The system combines a **machine-learning delay prediction pipeline**, a **FastAPI backend**, a **React frontend**, **interactive GIS visualization**, analytics, alerts, role-based access, and administrator dataset upload.

---

## 1. Problem Statement

Land acquisition is the process of obtaining land required for a public infrastructure or development project.

For projects such as highways, railways, metro systems, airports, industrial corridors, irrigation and power infrastructure, construction can be delayed when land acquisition is delayed.

Typical sources of delay include:

- Legal disputes
- Pending approvals
- Slow approval processes
- Incomplete documentation
- Compensation progress
- Rehabilitation and resettlement progress
- Delayed possession of land
- Stakeholder response
- Land-record updating
- Objection disposal
- Delays in acquisition-cost deposits
- Delays in statutory/project milestones

### The core idea

Instead of waiting until a project is already delayed, AcquiVision uses the available project information to estimate the **probability of delay** and classify the project into a risk category.

**Input → ML model → Delay probability → Risk category → Dashboard / Alerts / GIS**

---

## 2. What AcquiVision Does

### Dashboard
Provides a high-level view of the land-acquisition portfolio and project risk.

### Projects
Displays project records loaded from the FastAPI backend with search/filter functionality and project detail navigation.

### Project Details
Provides a detailed view of an individual project and its acquisition-related indicators.

### Analytics
Calculates and visualizes:

- Total projects
- Delayed projects
- Non-delayed projects
- Overall delay rate
- State-wise delay statistics
- District-wise delay statistics
- Project-type statistics
- Average delay days

### GIS Map
Plots project locations using latitude/longitude and displays risk using:

- 🔴 High Risk
- 🟠 Medium Risk
- 🟢 Low Risk

The map also supports search and risk filtering.

### Alerts
Surfaces projects that require attention based on the project's delay/risk information.

### Model Center
Provides an interface for viewing ML-model information from the backend.

### Governance
Shows the project's role-based permission structure, security status interface and audit-trail interface.

### Data Upload
Administrators can upload a CSV dataset. The backend validates the structure, runs the ML model on the uploaded records, and appends valid records to the project dataset.

---

## 3. System Architecture

```text
                         ┌──────────────────────────┐
                         │       React Frontend      │
                         │                          │
                         │ Dashboard                │
                         │ Projects                 │
                         │ Analytics                │
                         │ GIS Map                  │
                         │ Alerts                   │
                         │ Model Center             │
                         │ Governance               │
                         │ Data Upload              │
                         └────────────┬─────────────┘
                                      │ HTTP / JSON
                                      ▼
                         ┌──────────────────────────┐
                         │      FastAPI Backend      │
                         │                          │
                         │ /projects                │
                         │ /projects/{id}           │
                         │ /analytics               │
                         │ /predict                 │
                         │ /upload-dataset          │
                         │ /dataset-info            │
                         └────────────┬─────────────┘
                                      │
                       ┌──────────────┴──────────────┐
                       ▼                             ▼
              ┌─────────────────┐          ┌─────────────────┐
              │ land_acquisition│          │ delay_model.pkl │
              │ _training.csv   │          │ trained ML model│
              └─────────────────┘          └─────────────────┘
```

---

## 4. Repository Structure

```text
SIH/
│
├── README.md
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── sidebar.jsx
│   │   │   └── Statcard.jsx
│   │   │
│   │   ├── data/
│   │   │   └── mockData.js
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── ProjectDetails.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── GISMap.jsx
│   │   │   ├── Alerts.jsx
│   │   │   ├── ModelCenter.jsx
│   │   │   ├── Governance.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── Login.jsx
│   │   │   └── DataUpload.jsx
│   │   │
│   │   ├── App.jsx
│   │   └── App.css
│   │
│   └── package.json
│
└── land_acquisition/
    ├── backend/
    │   └── main.py
    │
    ├── data/
    │   └── land_acquisition_training.csv
    │
    ├── models/
    │   ├── delay_model.pkl
    │   └── model_info.pkl
    │
    ├── src/
    │   ├── generate_data.py
    │   ├── train_model.py
    │   └── predict.py
    │
    ├── GOVERNMENT_SOURCES.md
    ├── README.md
    └── requirements.txt
```

---

# 5. Dataset

## Dataset size

The repository contains a generated training dataset with:

- **12,000 project records**
- **28 columns**
- Target column: `delayed`
- GIS fields: `latitude`, `longitude`

The target distribution in the current dataset is:

- **7,784 delayed**
- **4,216 not delayed**

This dataset is used for the SIH prototype.

## Important data disclosure

The 12,000 project rows are **synthetic prototype records**.

They are **not claimed to be actual Government of India project records**.

The data generator was designed so that its project structure, acquisition milestones and benchmark concepts are grounded in the Government of India's land-acquisition information context, especially DoLR/LACRRIS material.

The repository already documents the government references in:

```text
land_acquisition/GOVERNMENT_SOURCES.md
```

For a production deployment, the intended pipeline is:

```text
Official departmental/project records
              ↓
Data validation and cleaning
              ↓
Feature engineering
              ↓
Model retraining
              ↓
Risk prediction
```

---

# 6. Dataset Columns

The dataset contains the following 28 columns.

| Column | Meaning |
|---|---|
| `project_id` | Unique project identifier |
| `project_type` | Type of infrastructure project |
| `state` | State of the project |
| `district` | District of the project |
| `land_area_hectares` | Land area involved |
| `affected_families` | Number of affected families |
| `legal_disputes` | Number of legal disputes |
| `pending_approvals` | Number of pending approvals |
| `approval_delay_days` | Delay associated with approvals |
| `compensation_percentage` | Compensation progress |
| `documentation_percentage` | Documentation progress |
| `rehabilitation_percentage` | Rehabilitation progress |
| `possession_percentage` | Land-possession progress |
| `stakeholder_response_percentage` | Stakeholder response/progress indicator |
| `historical_performance_percentage` | Historical performance indicator |
| `sia_to_preliminary_months` | SIA-to-preliminary-notification duration |
| `land_record_update_days` | Land-record update duration |
| `objection_disposal_days` | Objection-disposal duration |
| `acquisition_cost_deposit_months` | Acquisition-cost deposit duration |
| `preliminary_to_declaration_months` | Preliminary-notification-to-declaration duration |
| `award_duration_months` | Award process duration |
| `rr_implementation_months` | Rehabilitation & Resettlement implementation duration |
| `official_benchmark_breaches` | Number of benchmark thresholds exceeded |
| `current_stage` | Current acquisition stage |
| `latitude` | Project latitude for GIS |
| `longitude` | Project longitude for GIS |
| `delay_days` | Observed/historical delay outcome used in the dataset |
| `delayed` | Target: `1` = delayed, `0` = not delayed |

---

# 7. Machine Learning Pipeline

The training code is implemented in:

```text
land_acquisition/src/train_model.py
```

## Target

```text
delayed
```

The model performs **binary classification**:

```text
0 → Not Delayed
1 → Delayed
```

## Features used

The training pipeline uses **23 predictive features**:

### Project / location

- `project_type`
- `state`
- `district`

### Project scale

- `land_area_hectares`
- `affected_families`

### Legal / administrative risk

- `legal_disputes`
- `pending_approvals`
- `approval_delay_days`

### Progress indicators

- `compensation_percentage`
- `documentation_percentage`
- `rehabilitation_percentage`
- `possession_percentage`
- `stakeholder_response_percentage`
- `historical_performance_percentage`

### Acquisition-process timelines

- `sia_to_preliminary_months`
- `land_record_update_days`
- `objection_disposal_days`
- `acquisition_cost_deposit_months`
- `preliminary_to_declaration_months`
- `award_duration_months`
- `rr_implementation_months`

### Benchmark / stage information

- `official_benchmark_breaches`
- `current_stage`

### Target-leakage protection

`delay_days` is deliberately **not** used as a predictive feature.

It is an observed outcome in the historical/synthetic dataset. Including it directly while predicting `delayed` would create target leakage.

---

# 8. Data Preprocessing

The training pipeline uses a Scikit-learn `ColumnTransformer` with separate preprocessing paths.

## Categorical features

```text
project_type
state
district
current_stage
```

Processing:

```text
Most-frequent imputation
        ↓
OneHotEncoder(handle_unknown="ignore")
```

## Numeric features

The remaining predictive features are processed using:

```text
Median imputation
        ↓
StandardScaler
```

The preprocessing and model are stored together inside the saved Scikit-learn pipeline.

This means the same preprocessing used during training is automatically reused when the API receives a new project.

---

# 9. Algorithms / Models Tested

Three classification algorithms are trained and compared.

## 1. Logistic Regression

Used as a strong, interpretable classification baseline.

Configuration includes:

- `max_iter = 2000`
- `class_weight = "balanced"`

## 2. Random Forest

An ensemble of decision trees that can capture nonlinear relationships between acquisition indicators.

Configuration includes:

- `n_estimators = 500`
- `max_depth = 16`
- `min_samples_leaf = 3`
- `class_weight = "balanced"`

## 3. Gradient Boosting

An ensemble method that builds trees sequentially to improve prediction errors.

Configuration includes:

- `n_estimators = 250`
- `learning_rate = 0.05`
- `max_depth = 4`
- `min_samples_leaf = 5`

---

# 10. Model Selection

The dataset is split using:

```text
80% → training
20% → testing
```

The split is stratified by the target and uses a fixed random seed for reproducibility.

Models are compared using:

- Accuracy
- Precision
- Recall
- F1 Score
- ROC-AUC

The training script selects the model with the **highest ROC-AUC**, because the application is intended to work with delay-risk probabilities rather than only hard class labels.

## Current training result

The model information stored in `models/model_info.pkl` records the following test results:

| Model | Accuracy | Precision | Recall | F1 | ROC-AUC |
|---|---:|---:|---:|---:|---:|
| Logistic Regression | 0.6846 | 0.8165 | 0.6628 | 0.7317 | **0.7540** |
| Random Forest | 0.6975 | 0.7932 | 0.7219 | 0.7559 | 0.7462 |
| Gradient Boosting | **0.7046** | 0.7445 | **0.8292** | **0.7846** | 0.7437 |

### Selected model

The current training script selects:

**Logistic Regression**

because it has the highest ROC-AUC among the three tested models:

```text
ROC-AUC ≈ 0.7540
```

The final selected pipeline is saved as:

```text
land_acquisition/models/delay_model.pkl
```

Model metadata and comparison results are saved as:

```text
land_acquisition/models/model_info.pkl
```

> These metrics are prototype-dataset evaluation results, not a claim of production-level accuracy on real government records.

---

# 11. Risk Classification

The API converts the predicted probability of delay into a risk category.

```text
Probability >= 70%  → HIGH
Probability >= 40%  → MEDIUM
Probability < 40%   → LOW
```

For example:

```text
82% → HIGH
55% → MEDIUM
23% → LOW
```

This makes the ML output easier for decision-makers to understand.

---

# 12. Government-Grounded Benchmark Logic

The synthetic data generator includes milestone-related benchmark concepts such as:

- SIA to preliminary notification
- Land-record updating
- Objection disposal
- Acquisition-cost deposit
- Preliminary notification to declaration
- Award duration
- R&R implementation

The generator creates:

```text
official_benchmark_breaches
```

by counting benchmark-threshold breaches.

The detailed references are documented in:

```text
land_acquisition/GOVERNMENT_SOURCES.md
```

Again, the generated project rows themselves are synthetic.

---

# 13. Backend

The backend is implemented using **FastAPI**.

Main file:

```text
land_acquisition/backend/main.py
```

The backend loads:

```text
models/delay_model.pkl
data/land_acquisition_training.csv
```

when the application starts.

## API endpoints

### Health check

```http
GET /
```

Returns backend status and confirms that the model and dataset were loaded.

### Dataset information

```http
GET /dataset-info
```

Returns dataset size and column information.

### Project list

```http
GET /projects
```

Supports pagination parameters:

```text
limit
offset
```

Example:

```text
/projects?limit=100&offset=0
```

### Single project

```http
GET /projects/{project_id}
```

Returns one project by ID.

### Prediction

```http
POST /predict
```

Receives project indicators and returns:

- Delay probability
- Prediction
- Risk category
- Project location information

### Analytics

```http
GET /analytics
```

Returns:

- Overall project summary
- State-wise statistics
- District-wise statistics
- Project-type statistics

### Dataset upload

```http
POST /upload-dataset
```

The upload workflow:

```text
CSV selected
   ↓
CSV validation
   ↓
Column structure validation
   ↓
Duplicate project-ID check
   ↓
Numeric-field validation
   ↓
ML prediction
   ↓
Risk categorization
   ↓
Append valid records to dataset
```

The upload feature is restricted in the frontend to the Administrator role.

---

# 14. Frontend

The frontend is a React application powered by Vite.

## Main technologies

- React
- Vite
- React Router
- Leaflet
- React Leaflet
- React Leaflet Cluster
- Recharts
- Axios

## Frontend modules

```text
Login
Dashboard
Projects
Project Details
Analytics
GIS Map
Alerts
Model Center
Governance
Settings
Data Upload
```

---

# 15. GIS Visualization

The GIS page uses:

- Leaflet
- React Leaflet
- OpenStreetMap tiles
- Project latitude/longitude

Projects are represented as circular markers.

The marker color is derived from risk score:

```text
Red    → High Risk
Orange → Medium Risk
Green  → Low Risk
```

Clicking a marker opens a popup containing information such as:

- Project name
- District
- State
- Risk level
- Risk score
- Predicted delay

The map also provides:

- Risk filters
- Search
- Automatic map fitting to project coordinates

---

# 16. Role-Based Access

The frontend defines three application roles:

### Administrator

Full access to system modules, including dataset upload.

### Risk Manager

Access focused on project management, analytics, GIS, alerts and settings.

### Analyst

Primarily focused on viewing projects, analytics and GIS information.

The current role/access implementation is primarily a **frontend prototype** using the logged-in user's stored role.

The Governance page describes the intended security model and backend integration direction. Production deployment should implement authentication and authorization on the backend as well.

---

# 17. Running the Project Locally

## Step 1 — Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd SIH
```

## Step 2 — Backend environment

Go to:

```bash
cd land_acquisition
```

Create a virtual environment.

### Windows PowerShell

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

### Windows CMD

```cmd
python -m venv .venv
.venv\Scripts\activate
```

Install the backend dependencies:

```bash
pip install -r requirements.txt
```

> The current backend code uses FastAPI/Uvicorn and multipart file-upload support. Ensure those packages are included in the environment before starting the API.

## Step 3 — Start FastAPI

```bash
cd backend
uvicorn main:app --reload --port 8000
```

API:

```text
http://127.0.0.1:8000
```

Swagger UI:

```text
http://127.0.0.1:8000/docs
```

## Step 4 — Start React frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite normally starts the frontend at:

```text
http://localhost:5173
```

---

# 18. Retraining the Model

If the synthetic dataset is regenerated:

```bash
cd land_acquisition
python src/generate_data.py
```

Then retrain:

```bash
python src/train_model.py
```

The training process will:

1. Load the dataset
2. Separate features and target
3. Preprocess categorical and numeric variables
4. Split the dataset into train/test sets
5. Train Logistic Regression
6. Train Random Forest
7. Train Gradient Boosting
8. Evaluate all models
9. Select the highest-ROC-AUC model
10. Save the selected pipeline
11. Save model metadata

---

# 19. Example Prediction Flow

A new project provides indicators such as:

```text
Project type
State
District
Land area
Affected families
Legal disputes
Pending approvals
Approval delay
Compensation progress
Documentation progress
Rehabilitation progress
Possession progress
Stakeholder response
Historical performance
Process timelines
Benchmark breaches
Current stage
```

The system then performs:

```text
Raw project data
      ↓
Preprocessing
      ↓
Trained ML pipeline
      ↓
Probability of delay
      ↓
Risk classification
      ↓
Dashboard / Alert / GIS
```

This changes the workflow from:

```text
Detect delay after it happens
```

to:

```text
Identify risk before the delay becomes critical
```

---

# 20. Why the Project Is Useful

The platform is intended as a **decision-support system**, not as an automatic replacement for government decision-making.

Its value is in bringing several views into one place:

```text
Project data
    +
Process milestones
    +
Historical indicators
    +
ML risk prediction
    +
Analytics
    +
GIS
    +
Alerts
```

This allows users to prioritize which projects may need attention first.

---

# 21. Novelty

The project combines several capabilities into one workflow:

1. **Predictive rather than purely descriptive monitoring**
2. **Land-acquisition-specific features and milestone benchmarks**
3. **Probability-based risk classification**
4. **Geographical visualization of project risk**
5. **Portfolio-level analytics**
6. **Alert-oriented prioritization**
7. **Administrator dataset upload and re-analysis**
8. **Role-based application structure**

The important idea is not simply displaying project data; it is connecting project indicators to an early-warning risk workflow.

---

# 22. Feasibility

The prototype is feasible because it uses commonly available technologies:

- Python
- Pandas
- Scikit-learn
- FastAPI
- React
- Vite
- Leaflet
- Recharts

The current implementation is designed to run locally without requiring a large cloud infrastructure.

For production, the CSV storage layer can be replaced or supplemented with a database and the synthetic training data can be replaced with validated official records.

---

# 23. Limitations and Future Improvements

The current repository is a hackathon prototype. Important next steps include:

### Data

- Replace synthetic training rows with validated real project records where legally and operationally available.
- Add stronger data validation and missing-data handling.
- Establish a repeatable official-data ingestion pipeline.

### Machine learning

- Evaluate on real historical projects.
- Use cross-validation and time-aware validation where appropriate.
- Tune hyperparameters.
- Calibrate predicted probabilities.
- Add explainability such as SHAP/feature contribution views.
- Monitor model drift after deployment.

### Backend

- Add production authentication and authorization.
- Move persistent project storage from CSV to a database.
- Add audit logging at the backend.
- Add API validation and rate limiting.
- Add a dedicated model-information endpoint for the Model Center.

### Frontend

- Connect every risk display to the same backend prediction/risk source.
- Improve pagination rather than loading very large project lists at once.
- Add richer project-level risk explanations.
- Add intervention recommendations.

### GIS

- Use clustering/vector tiles for large datasets.
- Add state/district boundaries where appropriate.
- Add more detailed project-level map layers.

---

# 24. Important Prototype Notes

There are two different concepts in the current codebase:

### ML risk probability

The FastAPI `/predict` and `/upload-dataset` workflows use the trained ML pipeline and produce an actual predicted delay probability.

### Existing project/alert display logic

Some existing frontend portfolio views derive a simplified display score from the stored `delayed` field. This is useful for the current prototype UI, but it should be unified with the ML probability returned by the backend before production.

This distinction is important when evaluating model performance: the **ML evaluation metrics come from `train_model.py`**, not from the simplified frontend display score.

---

# 25. Government References

The repository contains a dedicated reference file:

```text
land_acquisition/GOVERNMENT_SOURCES.md
```

It documents the Government of India sources used to ground the prototype's land-acquisition fields and milestone concepts, including:

- Department of Land Resources / LACRRIS
- Open Government Data Platform India
- NHAI-related land acquisition datasets/resources

The prototype explicitly distinguishes **official reference material** from **synthetic generated training records**.

---

# 26. Project Status

| Component | Status |
|---|---|
| React frontend | Implemented |
| FastAPI backend | Implemented |
| Synthetic dataset generation | Implemented |
| ML training pipeline | Implemented |
| Logistic Regression | Implemented |
| Random Forest | Implemented |
| Gradient Boosting | Implemented |
| Model comparison | Implemented |
| Saved ML pipeline | Included |
| Prediction API | Implemented |
| CSV upload | Implemented |
| Analytics API | Implemented |
| GIS visualization | Implemented |
| Risk filtering | Implemented |
| Alerts interface | Implemented |
| Role-based frontend access | Implemented |
| Governance interface | Implemented |
| Production authentication | Future work |
| Production database | Future work |
| Real-data retraining pipeline | Future work |

---

# 27. Suggested Demo Flow for SIH

For a short judge presentation, do not try to explain every screen.

Use this sequence:

```text
1. Problem
      ↓
2. Why delays happen
      ↓
3. AcquiVision solution
      ↓
4. ML prediction
      ↓
5. Dashboard
      ↓
6. High-risk project
      ↓
7. GIS risk map
      ↓
8. Analytics
      ↓
9. Upload new dataset
      ↓
10. Impact / future deployment
```

### One-line explanation

> **AcquiVision converts land-acquisition project information into an early-warning delay-risk signal so that decision-makers can prioritize intervention before delays become critical.**

---

## License / Usage

This repository is an SIH 2026 hackathon prototype. The included training data is synthetic and should not be represented as official government project data.

For production use, replace the prototype data with properly authorized, validated and documented project data.
