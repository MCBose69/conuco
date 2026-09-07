#!/usr/bin/env python3
"""Baut aus index.html + styles.css + i18n.js + app.js + data/wetter-14-tage.js eine einzelne Datei.
   - conuco-standalone.html : komplette Seite, zum Verschicken / Hochladen
   - (optional) --artifact  : Variante ohne <html>/<head>/<body>-Hülle für Hosting, das die Hülle selbst setzt
"""
import re, sys, pathlib
root = pathlib.Path(__file__).parent
html = (root / 'index.html').read_text(encoding='utf-8')
css  = (root / 'styles.css').read_text(encoding='utf-8')
js   = ''.join((root / f).read_text(encoding='utf-8') + '\n' for f in ('data/wetter-14-tage.js', 'i18n.js', 'app.js'))
out = html.replace('<link rel="stylesheet" href="styles.css">', '<style>\n' + css + '\n</style>')
out = re.sub(r'  <script src="data/wetter-14-tage.js"></script>\n  <script src="i18n.js"></script>\n  <script src="app.js"></script>',
             '<script>\n' + js.replace('</script>', '<\\/script>') + '\n</script>', out)
assert 'styles.css' not in out and 'src="app.js"' not in out
(root / 'conuco-standalone.html').write_text(out, encoding='utf-8')
print('conuco-standalone.html', len(out))
if '--artifact' in sys.argv:
    m = re.search(r'<head>(.*?)</head>\s*<body>(.*)</body>', out, re.S)
    head, body = m.group(1), m.group(2)
    head = re.sub(r'\s*<link rel="icon"[^>]*>', '', head)
    head = re.sub(r'\s*<meta name="viewport"[^>]*>', '', head)
    head = re.sub(r'\s*<meta charset="utf-8">', '', head)
    art = head.strip() + '\n' + body
    target = pathlib.Path(sys.argv[sys.argv.index('--artifact') + 1])
    target.write_text(art, encoding='utf-8')
    print('artifact ->', target, len(art))
