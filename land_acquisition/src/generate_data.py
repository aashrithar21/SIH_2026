import os
import numpy as np
import pandas as pd

# ============================================================
# CONFIGURATION
# ============================================================

N = 12000
SEED = 26017

rng = np.random.default_rng(SEED)


# ============================================================
# GOVERNMENT-GROUNDED REFERENCE DATA
# ============================================================
#
# These names are based on publicly available Indian
# government land-acquisition / infrastructure contexts.
#
# The generated records are SYNTHETIC, not government records.
#

STATES = {
    "Andhra Pradesh": [
        ("Visakhapatnam", 17.6868, 83.2185),
        ("Vijayawada", 16.5062, 80.6480),
        ("Guntur", 16.3067, 80.4365),
        ("Kurnool", 15.8281, 78.0373)
    ],

    "Telangana": [
        ("Hyderabad", 17.3850, 78.4867),
        ("Warangal", 17.9689, 79.5941),
        ("Nalgonda", 17.0575, 79.2684),
        ("Karimnagar", 18.4386, 79.1288)
    ],

    "Karnataka": [
        ("Bengaluru Urban", 12.9716, 77.5946),
        ("Mysuru", 12.2958, 76.6394),
        ("Belagavi", 15.8497, 74.4977),
        ("Dharwad", 15.4589, 75.0078)
    ],

    "Tamil Nadu": [
        ("Chennai", 13.0827, 80.2707),
        ("Coimbatore", 11.0168, 76.9558),
        ("Madurai", 9.9252, 78.1198),
        ("Salem", 11.6643, 78.1460)
    ],

    "Maharashtra": [
        ("Mumbai", 19.0760, 72.8777),
        ("Pune", 18.5204, 73.8567),
        ("Nashik", 19.9975, 73.7898),
        ("Nagpur", 21.1458, 79.0882)
    ],

    "Gujarat": [
        ("Ahmedabad", 23.0225, 72.5714),
        ("Surat", 21.1702, 72.8311),
        ("Vadodara", 22.3072, 73.1812),
        ("Rajkot", 22.3039, 70.8022)
    ],

    "Rajasthan": [
        ("Jaipur", 26.9124, 75.7873),
        ("Jodhpur", 26.2389, 73.0243),
        ("Kota", 25.2138, 75.8648),
        ("Sawai Madhopur", 25.9940, 76.3669)
    ],

    "Uttar Pradesh": [
        ("Lucknow", 26.8467, 80.9462),
        ("Kanpur Nagar", 26.4499, 80.3319),
        ("Agra", 27.1767, 78.0081),
        ("Varanasi", 25.3176, 82.9739)
    ],

    "Madhya Pradesh": [
        ("Bhopal", 23.2599, 77.4126),
        ("Indore", 22.7196, 75.8577),
        ("Gwalior", 26.2183, 78.1828),
        ("Jabalpur", 23.1815, 79.9864)
    ],

    "Punjab": [
        ("Ludhiana", 30.9010, 75.8573),
        ("Amritsar", 31.6340, 74.8723),
        ("Patiala", 30.3398, 76.3869),
        ("Bathinda", 30.2110, 74.9455)
    ]
}


PROJECT_TYPES = [
    "Highway",
    "Railway",
    "Metro",
    "Airport",
    "Industrial Corridor",
    "Irrigation",
    "Power",
    "Urban Development"
]


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def clip(value, low, high):
    return float(np.clip(value, low, high))


def sigmoid(x):
    return 1.0 / (1.0 + np.exp(-np.clip(x, -30, 30)))


# ============================================================
# GENERATE PROJECTS
# ============================================================

rows = []

for i in range(N):

    # --------------------------------------------------------
    # LOCATION
    # --------------------------------------------------------

    state = rng.choice(list(STATES.keys()))

    location_index = rng.integers(0, len(STATES[state]))

    district, base_lat, base_lon = STATES[state][location_index]

    project_type = rng.choice(
        PROJECT_TYPES
    )

    # --------------------------------------------------------
    # PROJECT SCALE
    # --------------------------------------------------------

    land_area = rng.lognormal(
        mean=np.log(80),
        sigma=0.9
    )

    land_area = clip(
        land_area,
        5,
        1200
    )

    families = int(
        np.clip(
            land_area * rng.uniform(0.5, 1.8)
            + rng.normal(0, 25),
            5,
            1800
        )
    )

    # --------------------------------------------------------
    # LEGAL / ADMINISTRATIVE VARIABLES
    # --------------------------------------------------------

    legal_disputes = int(
        np.clip(
            rng.poisson(
                1.5 + families / 300
            ),
            0,
            30
        )
    )

    pending_approvals = int(
        np.clip(
            rng.poisson(
                1.0 + legal_disputes / 10
            ),
            0,
            12
        )
    )

    approval_delay_days = int(
        np.clip(
            rng.gamma(
                shape=2.0,
                scale=18
            )
            + pending_approvals * rng.uniform(10, 25)
            + legal_disputes * rng.uniform(1, 5),
            0,
            600
        )
    )

    # --------------------------------------------------------
    # PROJECT PROGRESS
    # --------------------------------------------------------

    # A common hidden "project health" factor creates realistic
    # correlation between different progress indicators.

    project_health = rng.beta(
        5,
        3
    )

    compensation = clip(
        project_health * 85
        + rng.normal(0, 12)
        - legal_disputes * 1.1,
        5,
        100
    )

    documentation = clip(
        project_health * 90
        + rng.normal(0, 9)
        - legal_disputes * 0.7,
        5,
        100
    )

    rehabilitation = clip(
        project_health * 82
        + rng.normal(0, 14)
        - families / 180,
        5,
        100
    )

    possession = clip(
        project_health * 88
        + rng.normal(0, 12)
        - legal_disputes * 1.3,
        5,
        100
    )

    stakeholder_response = clip(
        project_health * 90
        + rng.normal(0, 10)
        - pending_approvals * 1.5,
        5,
        100
    )

    historical_performance = clip(
        project_health * 92
        + rng.normal(0, 8),
        5,
        100
    )

    # --------------------------------------------------------
    # OFFICIAL-PROCESS TIMELINES
    # --------------------------------------------------------

    sia_to_preliminary = clip(
        rng.normal(
            9 + legal_disputes * 0.25
            + pending_approvals * 0.4,
            3
        ),
        2,
        24
    )

    land_record_days = int(
        np.clip(
            rng.normal(
                40
                + legal_disputes * 2
                + (100 - documentation) * 0.4,
                18
            ),
            10,
            180
        )
    )

    objection_days = int(
        np.clip(
            rng.normal(
                40
                + legal_disputes * 5,
                25
            ),
            5,
            240
        )
    )

    deposit_months = clip(
        rng.normal(
            4.5
            + pending_approvals * 0.45
            + legal_disputes * 0.12,
            2
        ),
        1,
        15
    )

    prelim_to_declaration = clip(
        rng.normal(
            8
            + legal_disputes * 0.35
            + pending_approvals * 0.45,
            3
        ),
        2,
        24
    )

    award_months = clip(
        rng.normal(
            18
            + legal_disputes * 0.65
            + families / 250,
            7
        ),
        5,
        48
    )

    rr_months = clip(
        rng.normal(
            12
            + families / 100
            + legal_disputes * 0.35,
            5
        ),
        4,
        36
    )

    # --------------------------------------------------------
    # GOVERNMENT PROCESS BENCHMARKS
    # --------------------------------------------------------
    #
    # These thresholds correspond to the benchmark concepts
    # used in the DoLR/LACRRIS process documentation.
    #

    benchmark_breaches = sum([
        sia_to_preliminary > 12,
        land_record_days > 60,
        objection_days > 60,
        deposit_months > 6,
        prelim_to_declaration > 12,
        award_months > 30,
        rr_months > 18
    ])

    # --------------------------------------------------------
    # LATENT RISK SCORE
    # --------------------------------------------------------
    #
    # This represents the underlying relationship used to
    # create synthetic historical outcomes.
    #
    # IMPORTANT:
    # This score is NOT saved as a feature.
    #

    risk_score = (

        # Process problems
        1.60 * benchmark_breaches

        # Legal / administrative problems
        + 0.22 * legal_disputes
        + 0.65 * pending_approvals
        + 0.018 * approval_delay_days

        # Low progress increases risk
        + 0.025 * (100 - compensation)
        + 0.018 * (100 - documentation)
        + 0.022 * (100 - rehabilitation)
        + 0.020 * (100 - possession)

        # Stakeholder / historical performance
        + 0.014 * (100 - stakeholder_response)
        + 0.018 * (100 - historical_performance)

        # Project complexity
        + 0.30 * np.log1p(land_area)
        + 0.15 * np.log1p(families)

        # Controlled noise
        + rng.normal(0, 1.8)
    )

    # --------------------------------------------------------
    # CREATE DELAY PROBABILITY
    # --------------------------------------------------------

    # The offset produces a reasonable mix of delayed and
    # non-delayed projects while retaining meaningful signal.

    probability = sigmoid(
        (risk_score - 10.5) / 2.7
    )

    # Small probability noise prevents the dataset from becoming
    # a perfectly deterministic mathematical rule.

    probability = clip(
        probability + rng.normal(0, 0.025),
        0.02,
        0.98
    )

    delayed = int(
        rng.binomial(
            1,
            probability
        )
    )

    # --------------------------------------------------------
    # OBSERVED DELAY DAYS
    # --------------------------------------------------------

    delay_days = (

        20

        + probability * 280

        + benchmark_breaches * 35

        + legal_disputes * 3.5

        + pending_approvals * 10

        + max(0, 60 - compensation) * 1.2

        + max(0, 60 - rehabilitation) * 0.8

        + max(0, 60 - possession) * 0.8

        + rng.normal(0, 30)
    )

    delay_days = int(
        np.clip(
            delay_days,
            0,
            1500
        )
    )

    # Keep historical outcome broadly consistent.
    if delayed == 1:
        delay_days = max(
            delay_days,
            int(rng.uniform(120, 500))
        )
    else:
        delay_days = min(
            delay_days,
            int(rng.uniform(0, 119))
        )

    # --------------------------------------------------------
    # CURRENT STAGE
    # --------------------------------------------------------

    stage_value = (
        compensation
        + rehabilitation
        + possession
    ) / 3

    if stage_value < 20:
        current_stage = "Preliminary Notification"

    elif stage_value < 40:
        current_stage = "Award"

    elif stage_value < 60:
        current_stage = "Compensation"

    elif stage_value < 78:
        current_stage = "Possession"

    else:
        current_stage = "Rehabilitation & Resettlement"

    # --------------------------------------------------------
    # GIS LOCATION
    # --------------------------------------------------------

    latitude = base_lat + rng.normal(
        0,
        0.08
    )

    longitude = base_lon + rng.normal(
        0,
        0.08
    )

    # --------------------------------------------------------
    # STORE RECORD
    # --------------------------------------------------------

    rows.append({

        "project_id":
            f"LA{(i + 1):05d}",

        "project_type":
            project_type,

        "state":
            state,

        "district":
            district,

        "land_area_hectares":
            round(land_area, 2),

        "affected_families":
            families,

        "legal_disputes":
            legal_disputes,

        "pending_approvals":
            pending_approvals,

        "approval_delay_days":
            approval_delay_days,

        "compensation_percentage":
            round(compensation, 2),

        "documentation_percentage":
            round(documentation, 2),

        "rehabilitation_percentage":
            round(rehabilitation, 2),

        "possession_percentage":
            round(possession, 2),

        "stakeholder_response_percentage":
            round(stakeholder_response, 2),

        "historical_performance_percentage":
            round(historical_performance, 2),

        "sia_to_preliminary_months":
            round(sia_to_preliminary, 2),

        "land_record_update_days":
            land_record_days,

        "objection_disposal_days":
            objection_days,

        "acquisition_cost_deposit_months":
            round(deposit_months, 2),

        "preliminary_to_declaration_months":
            round(prelim_to_declaration, 2),

        "award_duration_months":
            round(award_months, 2),

        "rr_implementation_months":
            round(rr_months, 2),

        "official_benchmark_breaches":
            benchmark_breaches,

        "current_stage":
            current_stage,

        "latitude":
            round(latitude, 6),

        "longitude":
            round(longitude, 6),

        "delay_days":
            delay_days,

        "delayed":
            delayed
    })


# ============================================================
# CREATE DATAFRAME
# ============================================================

df = pd.DataFrame(rows)


# ============================================================
# SAVE
# ============================================================

os.makedirs(
    "data",
    exist_ok=True
)

output_file = (
    "data/land_acquisition_training.csv"
)

df.to_csv(
    output_file,
    index=False
)


# ============================================================
# QUALITY REPORT
# ============================================================

print("=" * 65)
print("LAND ACQUISITION DATASET GENERATED")
print("=" * 65)

print(
    f"\nCreated: {output_file}"
)

print(
    f"Rows: {len(df):,}"
)

print(
    f"Columns: {len(df.columns)}"
)


print("\n" + "-" * 65)
print("DELAY DISTRIBUTION")
print("-" * 65)

distribution = (
    df["delayed"]
    .value_counts(
        normalize=True
    )
    .sort_index()
)

print(
    f"Not delayed : "
    f"{distribution.get(0, 0) * 100:.2f}%"
)

print(
    f"Delayed     : "
    f"{distribution.get(1, 0) * 100:.2f}%"
)


print("\n" + "-" * 65)
print("DELAY DAYS")
print("-" * 65)

print(
    df["delay_days"].describe()
)


print("\n" + "-" * 65)
print("OFFICIAL BENCHMARK BREACHES")
print("-" * 65)

print(
    df[
        "official_benchmark_breaches"
    ]
    .value_counts()
    .sort_index()
)


print("\n" + "-" * 65)
print("PROJECT LIFECYCLE")
print("-" * 65)

print(
    df[
        "current_stage"
    ]
    .value_counts()
)


print("\n" + "-" * 65)
print("SAMPLE PROJECTS")
print("-" * 65)

sample_columns = [
    "project_id",
    "state",
    "district",
    "project_type",
    "land_area_hectares",
    "affected_families",
    "legal_disputes",
    "pending_approvals",
    "compensation_percentage",
    "rehabilitation_percentage",
    "possession_percentage",
    "official_benchmark_breaches",
    "delay_days",
    "delayed"
]

print(
    df[
        sample_columns
    ]
    .head(5)
    .to_string(index=False)
)


print("\n" + "=" * 65)
print("DATASET READY FOR ML TRAINING")
print("=" * 65)