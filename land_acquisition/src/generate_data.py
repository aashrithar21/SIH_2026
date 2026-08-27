
import os
import numpy as np
import pandas as pd

SEED = 26017
N = 12000
rng = np.random.default_rng(SEED)

# Government-grounded milestone thresholds from DoLR/LACRRIS:
# SIA submission: >8 months is a delay benchmark
# SIA -> preliminary notification: >12 months
# Land-record update after preliminary notification: >60 days
# Objection disposal: >2 months
# Acquisition-cost deposit: >6 months
# Preliminary notification -> declaration: >12 months
# Award: >30 months overall
# R&R implementation after possession: >18 months
# Source: DoLR LACRRIS "Steps for entering data" PDF.

locations = {
    "Andhra Pradesh": [
        ("Anantapur", 14.68, 77.60), ("Guntur", 16.31, 80.44),
        ("Krishna", 16.61, 80.72), ("Kurnool", 15.83, 78.04),
        ("Visakhapatnam", 17.69, 83.22)
    ],
    "Assam": [
        ("Kamrup", 26.14, 91.74), ("Dibrugarh", 27.47, 94.91),
        ("Jorhat", 26.75, 94.20), ("Sonitpur", 26.63, 92.80)
    ],
    "Bihar": [
        ("Patna", 25.59, 85.14), ("Gaya", 24.79, 85.00),
        ("Muzaffarpur", 26.12, 85.39), ("Bhagalpur", 25.24, 86.98)
    ],
    "Chhattisgarh": [
        ("Raipur", 21.25, 81.63), ("Bilaspur", 22.08, 82.15),
        ("Durg", 21.19, 81.28), ("Korba", 22.36, 82.68)
    ],
    "Gujarat": [
        ("Ahmedabad", 23.02, 72.57), ("Vadodara", 22.31, 73.18),
        ("Surat", 21.17, 72.83), ("Rajkot", 22.30, 70.80),
        ("Kutch", 23.73, 69.86)
    ],
    "Haryana": [
        ("Gurugram", 28.46, 77.03), ("Hisar", 29.15, 75.72),
        ("Karnal", 29.69, 76.99), ("Rewari", 28.20, 76.62)
    ],
    "Jharkhand": [
        ("Ranchi", 23.34, 85.31), ("Dhanbad", 23.80, 86.43),
        ("Jamshedpur", 22.80, 86.20), ("Bokaro", 23.67, 86.15)
    ],
    "Karnataka": [
        ("Bengaluru Urban", 12.97, 77.59), ("Mysuru", 12.30, 76.65),
        ("Dharwad", 15.46, 75.01), ("Belagavi", 15.85, 74.50),
        ("Kalaburagi", 17.33, 76.83)
    ],
    "Kerala": [
        ("Thiruvananthapuram", 8.52, 76.94), ("Ernakulam", 9.98, 76.28),
        ("Kozhikode", 11.25, 75.78), ("Palakkad", 10.79, 76.65)
    ],
    "Madhya Pradesh": [
        ("Bhopal", 23.26, 77.41), ("Indore", 22.72, 75.86),
        ("Jabalpur", 23.18, 79.95), ("Gwalior", 26.22, 78.18),
        ("Rewa", 24.54, 81.30)
    ],
    "Maharashtra": [
        ("Mumbai Suburban", 19.08, 72.88), ("Pune", 18.52, 73.86),
        ("Nashik", 19.99, 73.79), ("Nagpur", 21.15, 79.09),
        ("Aurangabad", 19.88, 75.34), ("Solapur", 17.66, 75.91)
    ],
    "Odisha": [
        ("Khordha", 20.18, 85.62), ("Cuttack", 20.46, 85.88),
        ("Sundargarh", 22.12, 84.03), ("Ganjam", 19.38, 85.10)
    ],
    "Punjab": [
        ("Ludhiana", 30.90, 75.86), ("Amritsar", 31.63, 74.87),
        ("Patiala", 30.34, 76.39), ("Bathinda", 30.21, 74.95)
    ],
    "Rajasthan": [
        ("Jaipur", 26.91, 75.79), ("Alwar", 27.55, 76.63),
        ("Dausa", 26.89, 76.33), ("Sawai Madhopur", 26.02, 76.34),
        ("Jodhpur", 26.24, 73.02), ("Kota", 25.21, 75.86)
    ],
    "Tamil Nadu": [
        ("Chennai", 13.08, 80.27), ("Coimbatore", 11.02, 76.96),
        ("Madurai", 9.93, 78.12), ("Salem", 11.66, 78.15),
        ("Tiruchirappalli", 10.79, 78.70)
    ],
    "Telangana": [
        ("Hyderabad", 17.39, 78.49), ("Warangal", 17.98, 79.59),
        ("Nizamabad", 18.67, 78.09), ("Khammam", 17.25, 80.15)
    ],
    "Uttar Pradesh": [
        ("Lucknow", 26.85, 80.95), ("Kanpur Nagar", 26.45, 80.35),
        ("Agra", 27.18, 78.01), ("Varanasi", 25.32, 82.97),
        ("Gautam Buddha Nagar", 28.45, 77.52), ("Prayagraj", 25.44, 81.84)
    ],
    "Uttarakhand": [
        ("Dehradun", 30.32, 78.03), ("Haridwar", 29.95, 78.16),
        ("Udham Singh Nagar", 29.00, 79.45)
    ],
    "West Bengal": [
        ("Kolkata", 22.57, 88.36), ("Howrah", 22.60, 88.26),
        ("North 24 Parganas", 22.62, 88.45), ("Paschim Bardhaman", 23.68, 87.00)
    ]
}

project_types = [
    "National Highway", "State Highway", "Railway", "Irrigation",
    "Industrial Corridor", "Power Transmission", "Urban Infrastructure",
    "Airport", "Metro/Rapid Transit"
]

stages = [
    "SIA", "Preliminary Notification", "Land Record Update",
    "Objection Disposal", "Award", "Compensation", "Possession",
    "Rehabilitation & Resettlement"
]

# Sample a state with a mild population/administrative-size weighting.
states = list(locations.keys())
state_weights = np.array([
    0.05,0.025,0.055,0.025,0.05,0.03,0.025,0.055,0.03,0.05,
    0.08,0.04,0.035,0.035,0.055,0.04,0.08,0.025,0.06
])
state_weights = state_weights / state_weights.sum()

rows = []
for i in range(N):
    state = rng.choice(states, p=state_weights)
    district, lat, lon = locations[state][rng.integers(len(locations[state]))]
    ptype = rng.choice(project_types)

    # Project size and affected families are correlated.
    land_area = float(np.clip(rng.lognormal(mean=4.7, sigma=1.0), 5, 2500))
    families = int(np.clip(
        land_area * rng.lognormal(mean=-0.15, sigma=0.65) + rng.normal(5, 15),
        5, 2500
    ))

    # Difficulty drivers. These are intentionally correlated rather than independent.
    complexity = (
        0.25 * np.log1p(land_area) +
        0.20 * np.log1p(families) +
        0.20 * (ptype in ["National Highway", "Railway", "Metro/Rapid Transit"]) +
        0.15 * (state in ["Maharashtra", "Uttar Pradesh", "West Bengal", "Bihar"]) +
        rng.normal(0, 0.35)
    )

    legal_disputes = int(np.clip(
        rng.poisson(max(0.4, 1.5 + 2.0 * complexity)), 0, 80
    ))

    pending_approvals = int(np.clip(
        rng.poisson(max(0.3, 0.8 + 1.4 * complexity)), 0, 15
    ))

    approval_delay_days = int(np.clip(
        rng.gamma(shape=2.2, scale=18) + pending_approvals * rng.uniform(8, 25),
        0, 500
    ))

    # Official LACRRIS-style milestone durations.
    sia_to_prelim_months = float(np.clip(
        rng.gamma(2.0, 2.6) + complexity * 1.8, 0.5, 24
    ))
    land_record_days = int(np.clip(
        rng.gamma(2.0, 16) + complexity * 12, 5, 150
    ))
    objection_days = int(np.clip(
        rng.gamma(2.0, 25) + legal_disputes * rng.uniform(1, 5), 5, 300
    ))
    deposit_months = float(np.clip(
        rng.gamma(2.0, 1.7) + pending_approvals * rng.uniform(0.15, 0.8),
        0.2, 12
    ))
    prelim_to_declaration_months = float(np.clip(
        rng.gamma(2.0, 4.0) + legal_disputes * rng.uniform(0.02, 0.15),
        1, 30
    ))
    award_months = float(np.clip(
        rng.gamma(2.3, 8.5) + legal_disputes * rng.uniform(0.15, 0.6),
        6, 48
    ))

    # Progress variables are linked to milestone performance.
    compensation = float(np.clip(
        100 - 2.0 * legal_disputes - 3.0 * pending_approvals
        - 0.25 * approval_delay_days + rng.normal(0, 10),
        5, 100
    ))
    documentation = float(np.clip(
        100 - 0.55 * land_record_days - 0.20 * objection_days
        + rng.normal(0, 10),
        20, 100
    ))
    rehabilitation = float(np.clip(
        compensation * 0.65 - legal_disputes * 0.8
        + rng.normal(0, 12),
        5, 100
    ))
    possession = float(np.clip(
        compensation * 0.55 + documentation * 0.20
        - legal_disputes * 0.9 - pending_approvals * 2.0
        + rng.normal(0, 10),
        5, 100
    ))
    stakeholder_response = float(np.clip(
        85 - legal_disputes * 1.4 - pending_approvals * 2.2
        + rng.normal(0, 12),
        10, 100
    ))
    historical_performance = float(np.clip(
        82 - complexity * 10 + rng.normal(0, 10), 20, 98
    ))

    rr_months = float(np.clip(
        rng.gamma(2.0, 5.0) + max(0, 70 - rehabilitation) / 10,
        1, 30
    ))

    # Official benchmark breaches, based on DoLR/LACRRIS published ranking criteria.
    b_sia = sia_to_prelim_months > 12
    b_land = land_record_days > 60
    b_objection = objection_days > 60
    b_deposit = deposit_months > 6
    b_declaration = prelim_to_declaration_months > 12
    b_award = award_months > 30
    b_rr = rr_months > 18

    benchmark_breaches = sum([
        b_sia, b_land, b_objection, b_deposit,
        b_declaration, b_award, b_rr
    ])

    # A prototype "observed delay" outcome.
    # This is synthetic, but grounded in the official milestone thresholds
    # plus the additional predictive variables requested in the SIH statement.
    excess_days = (
        max(0, sia_to_prelim_months - 12) * 30 +
        max(0, land_record_days - 60) +
        max(0, objection_days - 60) +
        max(0, deposit_months - 6) * 30 +
        max(0, prelim_to_declaration_months - 12) * 30 +
        max(0, award_months - 30) * 30 +
        max(0, rr_months - 18) * 30
    )

    operational_delay = (
        legal_disputes * rng.uniform(1.5, 4.0) +
        pending_approvals * rng.uniform(8, 22) +
        max(0, 70 - compensation) * rng.uniform(0.6, 1.4) +
        max(0, 65 - rehabilitation) * rng.uniform(0.4, 1.0) +
        max(0, 60 - possession) * rng.uniform(0.3, 0.8) +
        max(0, 55 - stakeholder_response) * rng.uniform(0.2, 0.6)
    )

    delay_days = int(np.clip(
        excess_days * 0.65 + operational_delay + rng.normal(0, 35),
        0, 1500
    ))

    delayed = int(delay_days >= 120)

    # Current lifecycle stage is influenced by progress.
    progress = (compensation + rehabilitation + possession) / 3
    if progress < 25:
        current_stage = "Preliminary Notification"
    elif progress < 45:
        current_stage = "Award"
    elif progress < 65:
        current_stage = "Compensation"
    elif progress < 82:
        current_stage = "Possession"
    else:
        current_stage = "Rehabilitation & Resettlement"

    rows.append({
        "project_id": f"LA{(i+1):05d}",
        "project_type": ptype,
        "state": state,
        "district": district,
        "land_area_hectares": round(land_area, 2),
        "affected_families": families,
        "legal_disputes": legal_disputes,
        "pending_approvals": pending_approvals,
        "approval_delay_days": approval_delay_days,
        "compensation_percentage": round(compensation, 2),
        "documentation_percentage": round(documentation, 2),
        "rehabilitation_percentage": round(rehabilitation, 2),
        "possession_percentage": round(possession, 2),
        "stakeholder_response_percentage": round(stakeholder_response, 2),
        "historical_performance_percentage": round(historical_performance, 2),
        "sia_to_preliminary_months": round(sia_to_prelim_months, 2),
        "land_record_update_days": land_record_days,
        "objection_disposal_days": objection_days,
        "acquisition_cost_deposit_months": round(deposit_months, 2),
        "preliminary_to_declaration_months": round(prelim_to_declaration_months, 2),
        "award_duration_months": round(award_months, 2),
        "rr_implementation_months": round(rr_months, 2),
        "official_benchmark_breaches": benchmark_breaches,
        "current_stage": current_stage,
        "latitude": round(lat + rng.normal(0, 0.03), 6),
        "longitude": round(lon + rng.normal(0, 0.03), 6),
        "delay_days": delay_days,
        "delayed": delayed
    })

df = pd.DataFrame(rows)

os.makedirs("data", exist_ok=True)
out = "data/land_acquisition_training.csv"
df.to_csv(out, index=False)

print(f"Created: {out}")
print(f"Rows: {len(df):,}")
print(f"Columns: {len(df.columns)}")
print("\nDelay distribution:")
print(df["delayed"].value_counts(normalize=True).rename({0: "Not delayed", 1: "Delayed"}))
print("\nRisk benchmark breaches:")
print(df["official_benchmark_breaches"].value_counts().sort_index())
