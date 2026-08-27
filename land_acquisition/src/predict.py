
import joblib
import pandas as pd

MODEL = "models/delay_model.pkl"
model = joblib.load(MODEL)

# Example project for testing the live prediction pipeline.
project = pd.DataFrame([{
    "project_type": "National Highway",
    "state": "Maharashtra",
    "district": "Nashik",
    "land_area_hectares": 485,
    "affected_families": 327,
    "legal_disputes": 18,
    "pending_approvals": 3,
    "approval_delay_days": 76,
    "compensation_percentage": 42,
    "documentation_percentage": 71,
    "rehabilitation_percentage": 28,
    "possession_percentage": 34,
    "stakeholder_response_percentage": 48,
    "historical_performance_percentage": 62,
    "sia_to_preliminary_months": 9,
    "land_record_update_days": 74,
    "objection_disposal_days": 95,
    "acquisition_cost_deposit_months": 7,
    "preliminary_to_declaration_months": 14,
    "award_duration_months": 31,
    "rr_implementation_months": 20,
    "current_stage": "Compensation"
}])

p = float(model.predict_proba(project)[0, 1])

if p >= 0.70:
    risk = "HIGH"
elif p >= 0.40:
    risk = "MEDIUM"
else:
    risk = "LOW"

print(f"Delay probability: {p*100:.2f}%")
print(f"Risk category: {risk}")
