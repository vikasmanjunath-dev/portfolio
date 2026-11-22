"""Random cases from the REAL AkaarAI colour rules. Usage: <venv python> scripts/parity/gen_akaar_cases.py ~/Desktop/VTO > scripts/parity/akaar_cases.json"""
import json, random, sys
sys.path.insert(0, sys.argv[1] + '/akaarai-server')
from app.verdict.colour_rules import rate
from app.verdict.garment_colours import GarmentColour
from app.verdict.skin import Skin, undertone_of
random.seed(11); out = []
for _ in range(500):
    sk = dict(L=random.uniform(25, 90), C=random.uniform(8, 40), h=random.uniform(20, 90))
    n = random.choice([1, 2, 3]); shares = [random.randint(10, 60) for _ in range(n)]; gs = []
    for s in shares:
        L = random.uniform(5, 98); C = random.choice([random.uniform(0, 12), random.uniform(10, 95)]); h = random.uniform(0, 360)
        gs.append(dict(L=L, C=C, h=h, share=s, neutral=(C < 10 or L > 92 or L < 14)))
    skin = Skin(sk['L'], sk['C'], sk['h'], undertone_of(sk['h']), 500)
    cols = [GarmentColour('#000000', g['share'], g['L'], g['C'], g['h'], g['neutral']) for g in gs]
    v = rate(skin, cols)
    out.append({'skin': sk, 'g': gs, 'label': v.label, 'score': v.score, 'rules': list(v.rules)})
print(json.dumps(out))
