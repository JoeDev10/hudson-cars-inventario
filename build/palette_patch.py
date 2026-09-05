# -*- coding: utf-8 -*-
"""Paleta v3: el logo de la marca es blanco y negro, así que el naranja industrial
   se reemplaza por monocromo cálido + champán, y la silueta del coupé pasa a ser
   el sistema gráfico de la página."""
import io, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSS = os.path.join(ROOT, 'assets', 'css', 'hudson.css')
c = io.open(CSS, encoding='utf-8').read()
fallos = []

def sub(a, b):
    global c
    if a not in c:
        fallos.append(a.strip().splitlines()[0][:70])
        return
    c = c.replace(a, b)

# ---------- 1. acento: naranja industrial -> champán ----------
sub("""  --oxide:      #FF5C1A;
  --oxide-2:    #FF8A4C;
  --oxide-soft: rgba(255,92,26,.13);
  --wa:         #25D366;
  --ok:         #7BE495;""",
"""  --oxide:      #C6AE7E;            /* champan: el unico acento */
  --oxide-2:    #DCC79B;
  --oxide-soft: rgba(198,174,126,.13);
  --gold:       #C6AE7E;            /* filetes y glifos decorativos */
  --wa:         #17A35A;
  --ok:         #8FD6A6;

  --m-logo: url('../img/logo-mask.png');
  --m-car:  url('../img/car-mask.png');""")

sub("  --on-accent:  #150701;", "  --on-accent:  #14120C;")
sub("  --glow-1:     rgba(255,92,26,.16);", "  --glow-1:     rgba(198,174,126,.11);")
sub("  --glow-2:     rgba(90,120,255,.07);", "  --glow-2:     rgba(120,140,180,.05);")
sub("  --glow-card:  rgba(255,92,26,.07);", "  --glow-card:  rgba(198,174,126,.05);")

sub("""  --ink:        #0A0A0B;
  --ink-2:      #0E0E10;
  --panel:      #131316;
  --panel-2:    #191920;""",
"""  --ink:        #0A0908;
  --ink-2:      #0E0D0B;
  --panel:      #121110;
  --panel-2:    #191714;""")
sub("  --bone:       #EDE8E1;", "  --bone:       #F0ECE4;")

sub("  --glass:      rgba(10,10,11,.68);", "  --glass:      rgba(10,9,8,.7);")
sub("  --drawer-bg:  rgba(10,10,11,.97);", "  --drawer-bg:  rgba(10,9,8,.97);")
sub("  --overlay:    rgba(6,6,7,.86);", "  --overlay:    rgba(6,5,4,.88);")
sub("  --console-a:  rgba(25,25,32,.94);", "  --console-a:  rgba(25,23,20,.94);")
sub("  --console-b:  rgba(16,16,19,.94);", "  --console-b:  rgba(16,15,13,.94);")
sub("  --scrim-a:    rgba(10,10,11,.42);", "  --scrim-a:    rgba(10,9,8,.42);")
sub("  --scrim-b:    rgba(10,10,11,.86);", "  --scrim-b:    rgba(10,9,8,.88);")

# ---------- 2. logo real en la nav ----------
sub(".brand{ display:flex; align-items:baseline; gap:9px; flex:0 0 auto; }",
""".brand{ display:flex; align-items:center; flex:0 0 auto; }
.brand-mark{
  display:block; width:clamp(148px,15vw,204px); aspect-ratio:645/151;
  background:var(--bone);
  -webkit-mask:var(--m-logo) center/contain no-repeat;
          mask:var(--m-logo) center/contain no-repeat;
  transition:opacity .25s;
}
.brand:hover .brand-mark{ opacity:.72; }""")

# ---------- 3. divisor: silueta en vez de cinta de obra ----------
sub(""".tape{
  height:7px; margin:0; border:0;
  background:repeating-linear-gradient(45deg, var(--oxide) 0 9px, transparent 9px 18px);
  opacity:.55;
}
.tape--thin{ height:5px; opacity:.35; }""",
""".tape{
  display:flex; align-items:center; gap:clamp(16px,3vw,34px);
  width:100%; max-width:var(--maxw); margin-inline:auto;
  padding-inline:var(--gutter); border:0; height:auto;
}
.tape::before,.tape::after{
  content:''; flex:1; height:1px;
  background:linear-gradient(90deg,transparent,var(--line),transparent);
}
.tape i{
  display:block; width:clamp(46px,6vw,74px); aspect-ratio:312/78; flex:0 0 auto;
  background:var(--gold); opacity:.62;
  -webkit-mask:var(--m-car) center/contain no-repeat;
          mask:var(--m-car) center/contain no-repeat;
}
.tape--thin i{ width:clamp(34px,4vw,52px); opacity:.4; }""")

# ---------- 4. filete dorado + coupe fantasma en el hero ----------
sub(".hero .eyebrow i{ width:46px; height:1px; background:var(--oxide); display:block; }",
    ".hero .eyebrow i{ width:46px; height:1px; background:var(--gold); display:block; }")
sub(".hero{ padding-block:clamp(38px,6vw,86px) clamp(20px,3vw,34px); position:relative; }",
""".hero{ padding-block:clamp(38px,6vw,86px) clamp(20px,3vw,34px); position:relative; }
.hero::after{                         /* el coupe de la marca, fantasma */
  content:''; position:absolute; z-index:0; pointer-events:none;
  right:-6%; top:16%; width:min(62vw,780px); aspect-ratio:312/78;
  background:var(--bone); opacity:.05;
  -webkit-mask:var(--m-car) center/contain no-repeat;
          mask:var(--m-car) center/contain no-repeat;
}
.hero > *{ position:relative; z-index:1; }""")

sub(".marquee li::after{ content:'◆'; font-size:6px; color:var(--oxide); }",
    ".marquee li::after{ content:'◆'; font-size:6px; color:var(--gold); }")
sub(".rail .track i{ position:absolute; top:0; left:0; width:1px; background:var(--oxide); height:0; }",
    ".rail .track i{ position:absolute; top:0; left:0; width:1px; background:var(--gold); height:0; }")

# ---------- 5. paletas nuevas ----------
a = c.index('/* ---------- 14. Paletas alternativas ---------- */')
b = c.index('   15. v2')
b = c.rindex('/* ==============', 0, b)
NUEVAS = """/* ---------- 14. Paletas ---------- */
/* B - MEDIANOCHE: azul nocturno con acento blanco puro. Frio, tecnologico, 0 km. */
body[data-tema="medianoche"]{
  --ink:#060911; --ink-2:#0A0E18; --panel:#0E1420; --panel-2:#131A28;
  --line:rgba(216,228,244,.12); --line-soft:rgba(216,228,244,.055);
  --bone:#E9EFF7; --bone-dim:#9DAABF; --bone-mute:#66738B;
  --oxide:#E9EFF7; --oxide-2:#FFFFFF; --on-accent:#070B14; --gold:#B9C6DA;
  --glass:rgba(6,9,17,.72); --drawer-bg:rgba(6,9,17,.97); --overlay:rgba(3,6,12,.88);
  --console-a:rgba(19,26,40,.94); --console-b:rgba(10,14,24,.94);
  --scrim-a:rgba(6,9,17,.42); --scrim-b:rgba(6,9,17,.9);
  --hover:rgba(216,228,244,.05); --hover-2:rgba(216,228,244,.09);
  --stroke:rgba(216,228,244,.26); --dot:rgba(216,228,244,.3);
  --glow-1:rgba(150,180,230,.1); --glow-2:rgba(90,120,200,.06); --glow-card:rgba(200,220,245,.05);
  --toast-bg:#E9EFF7; --toast-fg:#0A0E18;
}
/* C - ALABASTRO: claro editorial con acento carbon y filetes champan. */
body[data-tema="alabastro"]{
  --ink:#F4F1EB; --ink-2:#EBE7DE; --panel:#FFFFFF; --panel-2:#FAF8F3;
  --line:rgba(26,24,20,.14); --line-soft:rgba(26,24,20,.07);
  --bone:#1A1814; --bone-dim:#57524A; --bone-mute:#8A8378;
  --oxide:#1A1814; --oxide-2:#332F28; --on-accent:#F5F2EC; --gold:#A8854A;
  --glass:rgba(255,255,255,.84); --drawer-bg:rgba(244,241,235,.98); --overlay:rgba(30,27,23,.58);
  --console-a:rgba(255,255,255,.96); --console-b:rgba(250,248,243,.96);
  --scrim-a:rgba(26,24,20,.26); --scrim-b:rgba(26,24,20,.82);
  --hover:rgba(26,24,20,.05); --hover-2:rgba(26,24,20,.09);
  --stroke:rgba(26,24,20,.2); --dot:rgba(255,255,255,.6);
  --glow-1:rgba(168,133,74,.13); --glow-2:rgba(120,130,150,.05); --glow-card:rgba(26,24,20,.04);
  --toast-bg:#1A1814; --toast-fg:#F4F1EB;
}
body[data-tema="alabastro"] .card{ box-shadow:0 1px 2px rgba(26,24,20,.05); }
body[data-tema="alabastro"] .card:hover{ box-shadow:0 22px 44px -30px rgba(26,24,20,.5); }
body[data-tema="alabastro"] .console-in{ box-shadow:0 18px 44px -34px rgba(26,24,20,.45); }
body[data-tema="alabastro"] .hero::after{ opacity:.07; }

/* selector de paleta */
.temas{ display:flex; align-items:center; gap:6px; }
.temas b{ font-weight:400; color:var(--bone-mute); font-family:var(--f-mono); font-size:9px; letter-spacing:.16em; }
.temas button{
  width:15px; height:15px; border-radius:50%; border:1px solid var(--line);
  transition:transform .2s, box-shadow .2s;
}
.temas button:hover{ transform:scale(1.18); }
.temas button[aria-pressed="true"]{ box-shadow:0 0 0 2px var(--ink), 0 0 0 3px var(--bone-dim); }
.t-carbon{     background:linear-gradient(135deg,#0A0908 50%,#C6AE7E 50%); }
.t-medianoche{ background:linear-gradient(135deg,#060911 50%,#E9EFF7 50%); }
.t-alabastro{  background:linear-gradient(135deg,#F4F1EB 50%,#1A1814 50%); }

"""
c = c[:a] + NUEVAS + c[b:]

io.open(CSS, 'w', encoding='utf-8').write(c)
print('reemplazos fallidos:', len(fallos))
for f in fallos:
    print('  x', f)
