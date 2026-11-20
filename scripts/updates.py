#!/usr/bin/env python3
"""Schreibt site/updates.json: letzter Commit (Unix-Zeit) pro Spiele-Ordner in site/.
Läuft im Deploy (braucht volle Git-Historie). Die Startseite sortiert damit die Testspiele."""
import json, os, subprocess
root = os.path.join(os.path.dirname(__file__), '..', 'site')
out = {}
for d in sorted(os.listdir(root)):
    if not os.path.isdir(os.path.join(root, d)) or d in ('api', 'fonts'):
        continue
    t = subprocess.run(['git', 'log', '-1', '--format=%ct', '--', 'site/' + d], capture_output=True, text=True).stdout.strip()
    if t:
        out[d] = int(t)
with open(os.path.join(root, 'updates.json'), 'w') as f:
    json.dump(out, f, separators=(',', ':'))
print(out)
