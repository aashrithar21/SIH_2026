# SIH 2026 - Land Acquisition Predictive Analytics

## Important

The generated dataset is synthetic. It is NOT claimed to be real government project data.

Its schema and delay-risk logic are grounded in the Government of India's Department of Land Resources
LACRRIS system and its published milestone/ranking criteria.

## Run in VS Code

### 1. Create/activate virtual environment

Windows PowerShell:
```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

Windows CMD:
```cmd
python -m venv .venv
.venv\Scripts\activate
```

### 2. Install packages

```bash
pip install -r requirements.txt
```

### 3. Generate 12,000 training records

```bash
python src/generate_data.py
```

Output:
`data/land_acquisition_training.csv`

### 4. Train model

```bash
python src/train_model.py
```

Output:
`models/delay_model.pkl`

### 5. Test one project

```bash
python src/predict.py
```

## Next step

Build the Streamlit dashboard around the saved model:
- project list
- project details
- live project update
- risk probability
- explainable risk factors
- recommendations
- GIS map
- what-if intervention simulation
