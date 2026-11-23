#!/usr/bin/env python3
"""Builds public/tour.mp4 (+ poster, + WebVTT captions) from the real lab recordings.
Slides are HTML rendered by headless Chrome; voice is the macOS en-IN synthetic voice (labelled as such on the page).
Usage: python3 scripts/video/make-tour.py   (macOS, ffmpeg, Chrome, node_modules present)"""
import os, subprocess, json, html, pathlib, shutil
ROOT = pathlib.Path(__file__).resolve().parents[2]; W = ROOT / '.tour-tmp'; W.mkdir(exist_ok=True)
CHROME = os.environ.get('CHROME', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'); VOICE = 'Tara'
F = f'file://{ROOT}/node_modules/'
SEG = [
 dict(id='intro', clip=None, k='Vikas Manjunath · Computer Science · Bengaluru', t='Products you can <i>verify.</i>', sub='A 60-second tour of four core projects. Every number carries its source.', stats=[],
      say='I am Vikas Manjunath, a computer science student in Bengaluru. This is a sixty second tour of four products I built. Every number you see carries its source.'),
 dict(id='finos', clip='lab-finos', k='01 · FIN-OS · personal finance for India', t='A bug hid behind <i>88 calculators.</i>', sub='Scoring rules ported to TypeScript and matched against the original Python on 500 random cases: all 500 agree.', stats=[('1,655','mobile tests passing','DOCUMENTED'),('500 / 500','parity cases agree','CHECKABLE')],
      say='FIN-OS is a personal finance app for India. A systemic bug hid behind eighty eight calculators. So I ported the scoring rules and matched them against my original Python on five hundred random cases. All five hundred agree. You can run it yourself on this site.'),
 dict(id='vybes', clip='lab-vybes', k='02 · VYBES LYNK · verified campus app', t='Location is off by default. <i>The database decides.</i>', sub='Precision is decided per viewer inside the database, not in the app.', stats=[('283','database assertions','DOCUMENTED'),('51 / 52','mutants killed','DOCUMENTED')],
      say='VYBES LYNK is a verified students only campus app where location is off by default. The database, not the app, decides how precisely each viewer sees a position. Two hundred eighty three database assertions pass, and fifty one of fifty two mutants are killed.'),
 dict(id='akaar', clip='lab-akaar', k='03 · AkaarAI · colour and pattern verdicts', t='A verdict traced to <i>a measurable rule.</i>', sub='No photo is kept on the server. The three colour rules match the Python on 500 random cases.', stats=[('500 / 500','parity cases agree','CHECKABLE'),('520','server tests passing','DOCUMENTED')],
      say='AkaarAI gives a colour verdict you can trace to a measurable rule, and keeps no photo on the server. The three colour rules match my Python on five hundred random cases. Five hundred twenty server tests pass.'),
 dict(id='clock', clip='lab-clock', k='04 · DueClock · statutory receivables', t='Deadlines by rule, <i>never by an LLM.</i>', sub='Due dates and interest for Indian micro and small manufacturers, matched to the original engine on 400 random invoices.', stats=[('400 / 400','parity cases agree','CHECKABLE'),('30 / 30','mutants killed','DOCUMENTED')],
      say='DueClock computes statutory payment deadlines and interest for Indian small manufacturers, by rules, never by an LLM. Four hundred random invoices match the original engine, and thirty of thirty mutants are killed.'),
 dict(id='outro', clip=None, k='Evidence · checkable · documented · self-reported', t='Open the <i>ledger.</i>', sub='vikas-manjunath.vercel.app/evidence: 157 claims, each with its class and source. Narration is a synthetic voice.', stats=[],
      say='Every claim here is tagged checkable, documented, or self reported. Open the evidence ledger on my site, and check the numbers yourself. This narration uses a synthetic voice.'),
]
def slide(s, has_clip):
    stats = ''.join(f'<div class=st><b>{a}</b><span>{html.escape(b)}</span><em>{c}</em></div>' for a, b, c in s['stats'])
    w = '560px' if has_clip else '1040px'
    return f'''<!doctype html><meta charset=utf-8><style>
@font-face{{font-family:IS;src:url({F}@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2)}}
@font-face{{font-family:IS;font-style:italic;src:url({F}@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2)}}
@font-face{{font-family:G;font-weight:100 900;src:url({F}@fontsource-variable/geist/files/geist-latin-wght-normal.woff2)}}
*{{box-sizing:border-box;margin:0}}body{{width:1280px;height:720px;background:#03060f;color:#eef3ff;font-family:G,sans-serif;position:relative;overflow:hidden;padding:64px}}
.g{{position:absolute;inset:0;background:linear-gradient(rgba(94,161,255,.07) 1px,transparent 1px) 0 0/48px 48px,linear-gradient(90deg,rgba(94,161,255,.07) 1px,transparent 1px) 0 0/48px 48px;-webkit-mask:radial-gradient(80% 100% at 75% 20%,#000,transparent)}}
.b{{position:absolute;right:-160px;top:-200px;width:760px;height:760px;border-radius:50%;background:radial-gradient(circle,rgba(201,255,61,.22),rgba(94,161,255,.18) 40%,transparent 70%)}}
.k{{font:500 18px/1.2 monospace;letter-spacing:.12em;text-transform:uppercase;color:#c9ff3d;position:relative;width:{w}}}
h1{{font:400 {64 if has_clip else 104}px/1 IS,serif;letter-spacing:-.02em;margin-top:26px;position:relative;width:{w}}}h1 i{{color:#c9ff3d}}
p{{font-size:23px;line-height:1.4;color:#b7c4e0;margin-top:22px;width:{w};position:relative}}
.sts{{position:absolute;left:64px;bottom:64px;display:flex;gap:16px;width:{w}}}
.st{{border:1.5px solid rgba(255,255,255,.22);border-radius:14px;padding:14px 18px;background:rgba(3,6,15,.7);flex:1}}.st b{{display:block;font:600 34px G;color:#fff}}.st span{{font-size:16px;color:#b7c4e0}}.st em{{display:block;margin-top:6px;font:500 11px monospace;letter-spacing:.12em;color:#c9ff3d;font-style:normal}}
.u{{position:absolute;right:64px;bottom:26px;font:500 16px monospace;color:#7d8aa6}}
.fr{{position:absolute;left:660px;top:60px;width:560px;height:600px;border:1.5px solid rgba(255,255,255,.18);border-radius:18px;background:#05080f}}
</style><div class=g></div><div class=b></div><div class=k>{html.escape(s['k'])}</div><h1>{s['t']}</h1><p>{html.escape(s['sub'])}</p><div class=sts>{stats}</div>{'<div class=fr></div>' if has_clip else ''}<div class=u>vikas-manjunath.vercel.app</div>'''
def run(*a): subprocess.run(a, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
t0, vtt, parts = 0.0, ['WEBVTT', ''], []
def ts(x): return f'{int(x//3600):02d}:{int(x%3600//60):02d}:{x%60:06.3f}'
for s in SEG:
    h = W / f"{s['id']}.html"; h.write_text(slide(s, bool(s['clip'])))
    png = W / f"{s['id']}.png"; run(CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=1280,720', '--virtual-time-budget=3000', f'--screenshot={png}', f'file://{h}')
    aif = W / f"{s['id']}.aiff"; run('say', '-v', VOICE, '-r', '172', '-o', str(aif), s['say'])
    dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(aif)]).decode().strip()) + 0.9
    out = W / f"{s['id']}.mp4"
    if s['clip']:
        clip = ROOT / 'public/clips' / f"{s['clip']}.mp4"
        fc = "[1:v]scale=540:580:force_original_aspect_ratio=decrease[c];[0:v][c]overlay=(670+(540-w)/2):(70+(580-h)/2):shortest=1[v]"
        run('ffmpeg', '-y', '-loop', '1', '-i', str(png), '-stream_loop', '-1', '-i', str(clip), '-i', str(aif), '-filter_complex', fc, '-map', '[v]', '-map', '2:a', '-t', f'{dur}', '-r', '30', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '24', '-c:a', 'aac', '-b:a', '112k', '-af', 'apad', str(out))
    else:
        run('ffmpeg', '-y', '-loop', '1', '-i', str(png), '-i', str(aif), '-t', f'{dur}', '-r', '30', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '24', '-c:a', 'aac', '-b:a', '112k', '-af', 'apad', str(out))
    vtt += [f'{ts(t0)} --> {ts(t0 + dur - 0.3)}', s['say'], '']; t0 += dur; parts.append(out)
lst = W / 'list.txt'; lst.write_text(''.join(f"file '{p}'\n" for p in parts))
run('ffmpeg', '-y', '-f', 'concat', '-safe', '0', '-i', str(lst), '-c', 'copy', '-movflags', '+faststart', str(ROOT / 'public/tour.mp4'))
(ROOT / 'public/tour.vtt').write_text('\n'.join(vtt)); shutil.copy(W / 'finos.png', ROOT / 'public/tour-poster.png')
run('ffmpeg', '-y', '-i', str(W / 'intro.png'), '-q:v', '4', str(ROOT / 'public/tour-poster.jpg'))
print(f'tour.mp4 {t0:.1f}s'); shutil.rmtree(W)
