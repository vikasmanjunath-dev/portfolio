"""Random cases from the REAL FIN-OS health score. Usage: python3 scripts/parity/gen_finos_cases.py "<Finos/Initial Deployment>/services/alerts" > scripts/parity/finos_cases.json"""
import json, random, sys
sys.path.insert(0, sys.argv[1])
import health_score as H
random.seed(5); out = []
for _ in range(500):
    exp = random.choice([0, random.uniform(8000, 120000)]); inc = random.uniform(20000, 400000); liq = random.uniform(0, 2_000_000)
    vol = random.uniform(0, 100); stab = random.uniform(0, 100); lf = random.random() < .5
    emi = random.choice([0, random.uniform(0, 0.7) * inc]); cc = random.choice([0, random.uniform(0, 80000)]); pl = random.random() < .3; car = random.random() < .3
    H._monthly_expenses = lambda t, e=exp: e; H._monthly_income = lambda t, p=None, i=inc: i; H._liquid_savings = lambda p, h, l=liq: l
    H._spending_volatility = lambda t, v=vol: v; H._income_stability = lambda t, s=stab: s; H._monthly_emi = lambda t, e=emi: e
    ef = H.score_emergency_fund({'emergency_in_liquid_fund': lf}, [], {})
    d = H.score_debt_management({'cc_outstanding': cc, 'has_personal_loan': pl, 'has_car_loan': car}, [])
    out.append({'ef': dict(monthlyExp=exp, liquid=liq, vol=vol, stab=stab, liquidFund=lf), 'efPts': ef.score, 'efTarget': ef.features['target_months'],
                'debt': dict(income=inc, emi=emi, ccBal=cc, personalLoan=pl, carLoan=car), 'debtPts': d.score})
print(json.dumps(out))
