# -*- coding: utf-8 -*-
"""Tokeniza los colores que estaban hardcodeados y agrega 3 paletas conmutables."""
import io, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSS = os.path.join(ROOT, 'assets', 'css', 'hudson.css')
s = io.open(CSS, encoding='utf-8').read()

REPL = [
    ('rgba(255,92,26,.16), transparent 62%',  'var(--glow-1), transparent 62%'),
    ('rgba(90,120,255,.07), transparent 60%', 'var(--glow-2), transparent 60%'),
    ('.strip{\n  border-bottom:1px solid var(--line-soft);\n  background:rgba(10,10,11,.6);',
     '.strip{\n  border-bottom:1px solid var(--line-soft);\n  background:var(--glass);'),
    ('  background:rgba(10,10,11,.72);\n  backdrop-filter:blur(14px) saturate(1.2);',
     '  background:var(--glass);\n  backdrop-filter:blur(14px) saturate(1.2);'),
    ('.btn:hover{ border-color:var(--bone-dim); background:rgba(237,232,225,.05); }',
     '.btn:hover{ border-color:var(--bone-dim); background:var(--hover); }'),
    ('color:#120602; font-weight:600; }', 'color:var(--on-accent); font-weight:600; }'),
    ('border-color:var(--oxide-2); color:#120602; transform', 'border-color:var(--oxide-2); color:var(--on-accent); transform'),
    ('  position:fixed; inset:0; z-index:80; background:rgba(10,10,11,.97);',
     '  position:fixed; inset:0; z-index:80; background:var(--drawer-bg);'),
    ('.hero h1 .out{ color:transparent; -webkit-text-stroke:1.6px rgba(237,232,225,.34); }',
     '.hero h1 .out{ color:transparent; -webkit-text-stroke:1.6px var(--stroke); }'),
    ('  background:linear-gradient(180deg, rgba(25,25,32,.94), rgba(16,16,19,.94));',
     '  background:linear-gradient(180deg, var(--console-a), var(--console-b));'),
    ('.view button.on{ background:rgba(237,232,225,.08); color:var(--bone); }',
     '.view button.on{ background:var(--hover-2); color:var(--bone); }'),
    ('  background:linear-gradient(180deg, rgba(255,92,26,.07), transparent 42%);',
     '  background:linear-gradient(180deg, var(--glow-card), transparent 42%);'),
    ('.shot{ position:relative; aspect-ratio:4/3; overflow:hidden; background:#0C0C0E; }',
     '.shot{ position:relative; aspect-ratio:4/3; overflow:hidden; background:var(--ink-2); }'),
    ('.shot .veil{ position:absolute; inset:0; background:linear-gradient(180deg,rgba(10,10,11,.42) 0%,transparent 34%,transparent 58%,rgba(10,10,11,.86) 100%); }',
     '.shot .veil{ position:absolute; inset:0; background:linear-gradient(180deg,var(--scrim-a) 0%,transparent 34%,transparent 58%,var(--scrim-b) 100%); }'),
    ('  padding:5px 8px; border-radius:2px; background:rgba(10,10,11,.72); backdrop-filter:blur(6px);',
     '  padding:5px 8px; border-radius:2px; background:var(--glass); backdrop-filter:blur(6px);'),
    ('.badge.new{ background:var(--oxide); border-color:var(--oxide); color:#150701; font-weight:600; }',
     '.badge.new{ background:var(--oxide); border-color:var(--oxide); color:var(--on-accent); font-weight:600; }'),
    ('  background:rgba(10,10,11,.6); padding:4px 8px; border-radius:2px; backdrop-filter:blur(6px);',
     '  background:var(--glass); padding:4px 8px; border-radius:2px; backdrop-filter:blur(6px);'),
    ('.dots i{ width:16px; height:2px; background:rgba(237,232,225,.3); display:block; }',
     '.dots i{ width:16px; height:2px; background:var(--dot); display:block; }'),
    ('  background:rgba(10,10,11,.62); border:1px solid var(--line); backdrop-filter:blur(6px);',
     '  background:var(--glass); border:1px solid var(--line); backdrop-filter:blur(6px);'),
    ('.go:hover{ background:var(--oxide); border-color:var(--oxide); color:#150701; }',
     '.go:hover{ background:var(--oxide); border-color:var(--oxide); color:var(--on-accent); }'),
    ('.sk .a,.sk .b,.sk .c{ background:linear-gradient(90deg,#141418,#1D1D24,#141418);',
     '.sk .a,.sk .b,.sk .c{ background:linear-gradient(90deg,var(--panel),var(--panel-2),var(--panel));'),
    ('  background:rgba(19,19,22,.94); backdrop-filter:blur(16px);',
     '  background:var(--console-a); backdrop-filter:blur(16px);'),
    ('.modal .veil2{ position:absolute; inset:0; background:rgba(6,6,7,.86); backdrop-filter:blur(6px); }',
     '.modal .veil2{ position:absolute; inset:0; background:var(--overlay); backdrop-filter:blur(6px); }'),
    ('  background:rgba(10,10,11,.7); backdrop-filter:blur(6px);\n}',
     '  background:var(--glass); backdrop-filter:blur(6px);\n}'),
    ('.gal{ position:relative; background:#08080A; }', '.gal{ position:relative; background:var(--ink); }'),
    ('  display:grid; place-items:center; background:rgba(10,10,11,.55); backdrop-filter:blur(6px);',
     '  display:grid; place-items:center; background:var(--glass); backdrop-filter:blur(6px);'),
    ('.gal .arrow:hover{ background:var(--oxide); color:#150701; border-color:var(--oxide); }',
     '.gal .arrow:hover{ background:var(--oxide); color:var(--on-accent); border-color:var(--oxide); }'),
    ('background:rgba(10,10,11,.6); padding:5px 9px; border:1px solid var(--line); }',
     'background:var(--glass); padding:5px 9px; border:1px solid var(--line); }'),
    ('.big-mark span{ color:transparent; -webkit-text-stroke:1.4px rgba(237,232,225,.3); }',
     '.big-mark span{ color:transparent; -webkit-text-stroke:1.4px var(--stroke); }'),
    ('.sub button{ padding:0 16px; background:var(--oxide); color:#150701;',
     '.sub button{ padding:0 16px; background:var(--oxide); color:var(--on-accent);'),
    ('  background:var(--wa); color:#04220F; box-shadow:0 14px 34px -10px rgba(37,211,102,.6);',
     '  background:var(--wa); color:#04220F; box-shadow:0 14px 34px -10px rgba(37,211,102,.45);'),
    ('  z-index:100; background:var(--bone); color:#111; padding:11px 18px; border-radius:2px;',
     '  z-index:100; background:var(--toast-bg); color:var(--toast-fg); padding:11px 18px; border-radius:2px;'),
    ('.chip.on{ background:var(--oxide); border-color:var(--oxide); color:#150701; font-weight:600; }\n.chip.on:hover{ color:#150701; }',
     '.chip.on{ background:var(--oxide); border-color:var(--oxide); color:var(--on-accent); font-weight:600; }\n.chip.on:hover{ color:var(--on-accent); }'),
]

missing = []
for a, b in REPL:
    if a not in s:
        missing.append(a[:60])
    s = s.replace(a, b)

# tokens nuevos dentro de :root
TOKENS = """  --on-accent:  #150701;
  --glass:      rgba(10,10,11,.68);
  --drawer-bg:  rgba(10,10,11,.97);
  --overlay:    rgba(6,6,7,.86);
  --console-a:  rgba(25,25,32,.94);
  --console-b:  rgba(16,16,19,.94);
  --scrim-a:    rgba(10,10,11,.42);
  --scrim-b:    rgba(10,10,11,.86);
  --hover:      rgba(237,232,225,.05);
  --hover-2:    rgba(237,232,225,.09);
  --stroke:     rgba(237,232,225,.34);
  --dot:        rgba(237,232,225,.3);
  --glow-1:     rgba(255,92,26,.16);
  --glow-2:     rgba(90,120,255,.07);
  --glow-card:  rgba(255,92,26,.07);
  --toast-bg:   #EDE8E1;
  --toast-fg:   #141414;

"""
s = s.replace('  --f-display:', TOKENS + '  --f-display:')

THEMES = """

/* ---------- 14. Paletas alternativas ---------- */
/* B · ACERO — nocturno azulado con acento cian. Lee "premium / tecnología / 0 km". */
body[data-tema="acero"]{
  --ink:#070A11; --ink-2:#0B0F18; --panel:#101623; --panel-2:#151C2C;
  --line:rgba(214,228,246,.13); --line-soft:rgba(214,228,246,.06);
  --bone:#E7EEF8; --bone-dim:#9AA8BD; --bone-mute:#63708A;
  --oxide:#37C2E8; --oxide-2:#67D6F2; --on-accent:#04202B;
  --glass:rgba(7,10,17,.7); --drawer-bg:rgba(7,10,17,.97); --overlay:rgba(4,7,12,.88);
  --console-a:rgba(21,28,44,.94); --console-b:rgba(11,15,24,.94);
  --scrim-a:rgba(7,10,17,.42); --scrim-b:rgba(7,10,17,.88);
  --hover:rgba(214,228,246,.05); --hover-2:rgba(214,228,246,.09);
  --stroke:rgba(214,228,246,.3); --dot:rgba(214,228,246,.3);
  --glow-1:rgba(55,194,232,.14); --glow-2:rgba(120,90,255,.08); --glow-card:rgba(55,194,232,.07);
  --toast-bg:#E7EEF8; --toast-fg:#0B0F18;
}
/* C · MARFIL — claro editorial con acento terracota. Lee "showroom limpio / usados premium". */
body[data-tema="marfil"]{
  --ink:#F3F0EA; --ink-2:#E9E5DC; --panel:#FFFFFF; --panel-2:#FAF8F4;
  --line:rgba(24,22,20,.15); --line-soft:rgba(24,22,20,.08);
  --bone:#191714; --bone-dim:#5B554D; --bone-mute:#8C857A;
  --oxide:#C63F14; --oxide-2:#E05423; --on-accent:#FFF6F1;
  --glass:rgba(255,255,255,.82); --drawer-bg:rgba(243,240,234,.98); --overlay:rgba(35,31,27,.6);
  --console-a:rgba(255,255,255,.96); --console-b:rgba(250,248,244,.96);
  --scrim-a:rgba(24,22,20,.3); --scrim-b:rgba(24,22,20,.8);
  --hover:rgba(24,22,20,.05); --hover-2:rgba(24,22,20,.09);
  --stroke:rgba(24,22,20,.22); --dot:rgba(255,255,255,.55);
  --glow-1:rgba(198,63,20,.1); --glow-2:rgba(60,90,160,.06); --glow-card:rgba(198,63,20,.05);
  --toast-bg:#191714; --toast-fg:#F3F0EA;
}
body[data-tema="marfil"] .card{ box-shadow:0 1px 2px rgba(24,22,20,.05); }
body[data-tema="marfil"] .card:hover{ box-shadow:0 22px 44px -30px rgba(24,22,20,.55); }
body[data-tema="marfil"] .console-in{ box-shadow:0 18px 44px -34px rgba(24,22,20,.5); }
body[data-tema="marfil"] .brand s{ -webkit-text-stroke-color:var(--bone-mute); }

/* selector de paleta */
.temas{ display:flex; align-items:center; gap:6px; }
.temas b{ font-weight:400; color:var(--bone-mute); font-family:var(--f-mono); font-size:9px; letter-spacing:.16em; }
.temas button{
  width:15px; height:15px; border-radius:50%; border:1px solid var(--line);
  transition:transform .2s, box-shadow .2s;
}
.temas button:hover{ transform:scale(1.18); }
.temas button[aria-pressed="true"]{ box-shadow:0 0 0 2px var(--ink), 0 0 0 3px var(--bone-dim); }
.t-oxido{ background:linear-gradient(135deg,#0A0A0B 50%,#FF5C1A 50%); }
.t-acero{ background:linear-gradient(135deg,#070A11 50%,#37C2E8 50%); }
.t-marfil{ background:linear-gradient(135deg,#F3F0EA 50%,#C63F14 50%); }
"""
s = s.rstrip() + THEMES

io.open(CSS, 'w', encoding='utf-8').write(s)
print('reemplazos faltantes:', len(missing))
for m in missing:
    print('  ×', m)
