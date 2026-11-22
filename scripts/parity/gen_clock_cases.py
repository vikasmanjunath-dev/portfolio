"""Generate randomised DueClock cases from the REAL Python engine, for the TypeScript port to be checked against.
Usage:  python3 scripts/parity/gen_clock_cases.py /path/to/DueClock > scripts/parity/clock_cases.json
"""
import json, random, sys
from datetime import date, timedelta

root = sys.argv[1] if len(sys.argv) > 1 else '.'
sys.path.insert(0, root)
from dueclock.core.clock import evaluate, InvoiceFacts, SupplierFacts, RatePolicy  # noqa: E402
from dueclock.core import rulings as R  # noqa: E402

random.seed(7)
cats = ['MICRO', 'SMALL', 'MEDIUM', 'LARGE', 'UNKNOWN']
acts = ['MANUFACTURING', 'SERVICES', 'TRADING', 'UNKNOWN']
cases = []
for _ in range(400):
    inv = date(2021, 1, 1) + timedelta(days=random.randint(0, 1800))
    dlv = random.choice([None, inv + timedelta(days=random.randint(0, 10))])
    agr = random.choice([False, True]); days = random.choice([0, 10, 30, 45, 60, 90])
    out = round(random.uniform(0, 500000), 2)
    asof = inv + timedelta(days=random.randint(0, 600))
    pol = random.choice([RatePolicy.AT_DUE_DATE, RatePolicy.THROUGH_PERIOD])
    c, a = random.choice(cats), random.choice(acts)
    r = evaluate(InvoiceFacts(invoice_date=inv, outstanding=out, delivery_date=dlv, has_written_agreement=agr, agreed_credit_days=days),
                 SupplierFacts(c, a, date(2015, 1, 1)), asof, rulings=R.Rulings(), rate_policy=pol)
    cases.append({'in': dict(category=c, activity=a, invoiceDate=inv.isoformat(), deliveryDate=dlv.isoformat() if dlv else None, hasAgreement=agr, agreedDays=days, outstanding=out, asOf=asof.isoformat(), policy='through_period' if pol == RatePolicy.THROUGH_PERIOD else 'at_due_date'),
                  'out': dict(coverage=r.coverage, baseDate=r.base_date.isoformat(), dueDate=r.due_date.isoformat(), effectiveDays=r.effective_days, overdueDays=r.overdue_days, interest=r.interest, rate=r.annual_interest_rate_pct, exposure=r.disallowance_exposure)})
print(json.dumps(cases))
