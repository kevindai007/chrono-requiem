# python3 tools/foe_art.py -> rewrites img/foe_*.svg
# Generates the foe plates: img/foe_<key>.svg (arena, 600x340) and img/foe_<key>_p.svg (portrait, 240x500)
import math,random,sys,os
OUT=sys.argv[1] if len(sys.argv)>1 else os.path.join(os.path.dirname(__file__),"..","img")

def f(v):return ('%.1f'%v).rstrip('0').rstrip('.')
def poly(pts):return 'M'+' L'.join(f(x)+' '+f(y) for x,y in pts)+' Z'
def smooth(pts,closed=True,t=.5):
    n=len(pts);d='M'+f(pts[0][0])+' '+f(pts[0][1])
    rng=range(n) if closed else range(n-1)
    for i in rng:
        p0=pts[(i-1)%n] if closed or i>0 else pts[i];p1=pts[i];p2=pts[(i+1)%n];p3=pts[(i+2)%n] if closed or i+2<n else p2
        c1=(p1[0]+(p2[0]-p0[0])*t/3,p1[1]+(p2[1]-p0[1])*t/3);c2=(p2[0]-(p3[0]-p1[0])*t/3,p2[1]-(p3[1]-p1[1])*t/3)
        d+=f' C{f(c1[0])} {f(c1[1])} {f(c2[0])} {f(c2[1])} {f(p2[0])} {f(p2[1])}'
    return d+(' Z' if closed else '')
def sym(half,cx=150):
    """half: points down the left side, from top centre to bottom centre"""
    return half+[(2*cx-x,y) for x,y in reversed(half)]
def mir(pts,cx=150):return [(2*cx-x,y) for x,y in pts]

# shared paint: body = dark silhouette with a gold rim; det = inner lines; glow = eyes and cores
def body(d,fill='url(#bd)',rim=1):return f'<path d="{d}" fill="{fill}" stroke="url(#rim)" stroke-width="{2.2*rim}" stroke-linejoin="round"/>'
def det(d,w=1.4,op=.7,col='var(--d)'):return f'<path d="{d}" fill="none" stroke="{col}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round" opacity="{op}"/>'
def eye(x,y,r=4,col=None):
    c=col or 'var(--e)'
    return f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(r*2.6)}" fill="{c}" opacity=".35" filter="url(#bl)"/><circle cx="{f(x)}" cy="{f(y)}" r="{f(r)}" fill="{c}"/><circle cx="{f(x)}" cy="{f(y)}" r="{f(r*.4)}" fill="#fff8e0"/>'
def glow(d,col=None,op=.55):
    c=col or 'var(--e)'
    return f'<path d="{d}" fill="{c}" opacity="{op}" filter="url(#bl)"/><path d="{d}" fill="{c}" opacity=".9"/>'

C={}
# ---------- floor 1 ----------
C['wolf']=dict(tint='#6b5a48',eye='#ffb347',det='#c9a676',g=lambda:(
  body(poly([(30,160),(62,146),(100,134),(122,112),(128,74),(150,108),(166,62),(178,110),(206,112),(232,98),(244,122),(268,112),(268,140),(294,146),(276,166),(296,186),(270,194),(286,224),(256,220),(262,256),(228,240),(214,282),(190,246),(160,232),(128,212),(100,198),(72,192),(52,184),(60,174),(36,168)]))+
  det(poly([(130,84),(146,110),(156,80)]),1.2,.6)+
  det('M40 166 L112 186 M60 176 L66 168 L72 179 L80 171 L86 182 L94 174 L100 185',1.4,.9,'#f3e7cf')+
  det('M118 140 Q150 150 170 180 M180 130 Q205 160 210 200 M150 175 Q170 205 168 228',1.2,.45)+
  eye(118,132,4.2)))
C['bat']=dict(tint='#5a2a3a',eye='#ff4d4d',det='#d68a9a',g=lambda:(
  body(smooth([(136,128),(110,98),(70,74),(20,92),(4,132),(30,128),(40,162),(62,146),(76,184),(98,162),(112,196),(132,170)],False,.3).replace(' Z','')+' L140 170 Z')+
  body(smooth(mir([(136,128),(110,98),(70,74),(20,92),(4,132),(30,128),(40,162),(62,146),(76,184),(98,162),(112,196),(132,170)]),False,.3)+' L160 170 Z')+
  det('M136 128 L70 76 M128 140 L30 128 M132 150 L62 146 M134 160 L98 162 M164 128 L230 76 M172 140 L270 128 M168 150 L238 146 M166 160 L202 162',1.1,.5)+
  body(smooth(sym([(150,112),(140,104),(132,78),(126,108),(128,140),(132,190),(142,222)]),True,.4))+
  det('M142 156 Q150 166 158 156 M146 162 L147 170 M154 162 L153 170',1.4,.9,'#f3e7cf')+
  eye(141,136,3.6)+eye(159,136,3.6)))
C['skeleton']=dict(tint='#4a4a5a',eye='#7fe0ff',det='#6d6250',g=lambda:(
  # sword behind
  '<path d="M214 40 L226 46 L176 236 L166 232 Z" fill="#8c8c96" stroke="url(#rim)" stroke-width="1.6"/>'+det('M220 44 L212 72 M206 96 L200 120',1.2,.6,'#e8e8f0')+
  '<path d="M150 236 L196 248 M168 226 L180 252" stroke="#c9b48a" stroke-width="6" stroke-linecap="round"/>'+
  # ribcage and spine
  body(smooth(sym([(150,130),(122,138),(104,152),(100,176),(110,206),(130,222),(150,226)]),True,.4),fill='url(#bone)')+
  det('M150 134 L150 300',4,.9,'#3a3226')+
  ''.join(det(f'M148 {y} Q{f(122-i*2)} {y-4} {f(110+i*3)} {y+10} M152 {y} Q{f(178+i*2)} {y-4} {f(190-i*3)} {y+10}',2.4,.8,'#3a3226') for i,y in enumerate([150,166,182,198]))+
  # arms
  det('M106 150 L84 196 L100 236 M194 150 L212 190 L192 232',7,1,'url(#bone)')+det('M106 150 L84 196 L100 236 M194 150 L212 190 L192 232',1.2,.6,'#3a3226')+
  # skull
  body(smooth(sym([(150,40),(128,44),(112,62),(110,90),(118,108),(128,114),(130,128),(150,132)]),True,.45),fill='url(#bone)')+
  '<path d="M124 82 Q134 70 146 82 Q140 98 128 96 Z M176 82 Q166 70 154 82 Q160 98 172 96 Z M146 104 L150 96 L154 104 Z" fill="#120f14"/>'+
  det('M132 118 L168 118 M138 114 L138 124 M146 114 L146 125 M154 114 L154 125 M162 114 L162 124',1.4,.9,'#3a3226')+
  eye(135,86,2.6)+eye(165,86,2.6)))
# ---------- floor 2 ----------
C['beetle']=dict(tint='#2f4a3a',eye='#c6ff6a',det='#9fbf8a',g=lambda:(
  ''.join(det(f'M{150+s*60} {y} L{150+s*(110+i*6)} {y+18} L{150+s*(124+i*8)} {y+52}',4,.95,'#0d0b10')+det(f'M{150+s*60} {y} L{150+s*(110+i*6)} {y+18} L{150+s*(124+i*8)} {y+52}',1.2,.8,'url(#rim)') for s in (-1,1) for i,y in enumerate([170,196,222]))+
  body(smooth(sym([(150,108),(110,112),(70,132),(46,170),(54,214),(90,246),(150,258)]),True,.5),fill='url(#shell)')+
  det('M150 112 L150 256',1.6,.8)+det('M84 150 Q110 132 140 130 M216 150 Q190 132 160 130 M70 190 Q100 210 140 214 M230 190 Q200 210 160 214',1.2,.45)+
  body(smooth(sym([(150,84),(128,88),(116,104),(122,120),(150,126)]),True,.5))+
  body('M144 92 C138 70 132 46 150 18 C158 40 162 66 156 92 Z')+det('M150 24 L150 86',1,.5)+
  body('M128 116 Q112 130 118 150 Q126 136 136 124 Z')+body('M172 116 Q188 130 182 150 Q174 136 164 124 Z')+
  eye(134,104,3.4)+eye(166,104,3.4)))
def spider():
    s=''
    for side in (-1,1):
        for i,(a,b,c) in enumerate([((112,150),(60,92),(26,140)),((114,166),(52,140),(16,208)),((118,180),(62,196),(36,270)),((124,192),(86,232),(76,296))]):
            pts=[(150+side*(p[0]-150),p[1]) for p in (a,b,c)]
            d='M'+' L'.join(f'{f(x)} {f(y)}' for x,y in pts)
            s+=det(d,6-i*.3,1,'#0d0b10')+det(d,1.3,.9,'url(#rim)')
    return s
C['spider']=dict(tint='#3a2350',eye='#ff3d6e',det='#b48ad6',g=lambda:(
  det('M150 0 L150 70',1,.6,'#e8d8ff')+
  '<g opacity=".25" stroke="#e8d8ff" fill="none" stroke-width=".8"><path d="M0 20 L300 260 M300 20 L0 260 M150 0 L150 300"/><circle cx="150" cy="140" r="60"/><circle cx="150" cy="140" r="110"/></g>'+
  spider()+
  body(smooth(sym([(150,62),(124,70),(108,96),(112,126),(130,146),(150,150)]),True,.5))+
  det('M150 72 L150 140 M132 92 Q150 104 168 92 M128 116 Q150 128 172 116',1.2,.5)+
  '<path d="M138 84 l6 10 l6 -10 l6 10 l6 -10" fill="none" stroke="#ff3d6e" stroke-width="1.2" opacity=".7"/>'+
  body(smooth(sym([(150,148),(132,152),(124,168),(130,188),(150,196)]),True,.5))+
  body('M140 192 Q134 210 142 218 Q144 206 148 196 Z')+body('M160 192 Q166 210 158 218 Q156 206 152 196 Z')+
  eye(142,164,3.4)+eye(158,164,3.4)+eye(135,174,2.2)+eye(165,174,2.2)+eye(146,176,1.8)+eye(154,176,1.8)))
C['gargoyle']=dict(tint='#3f4652',eye='#ff8a3d',det='#9aa4b4',g=lambda:(
  body(poly([(120,140),(96,96),(70,40),(60,76),(36,52),(40,96),(14,92),(36,140),(16,160),(70,170),(112,176)]),fill='url(#stone)')+
  body(poly(mir([(120,140),(96,96),(70,40),(60,76),(36,52),(40,96),(14,92),(36,140),(16,160),(70,170),(112,176)])),fill='url(#stone)')+
  det('M118 142 L66 46 M112 160 L38 96 M108 170 L24 156 M182 142 L234 46 M188 160 L262 96 M192 170 L276 156',1.1,.45)+
  body('M20 252 L280 252 L286 290 L14 290 Z',fill='url(#stone)')+det('M40 266 L90 266 M120 276 L200 276 M230 264 L270 264',1,.4)+
  body(smooth(sym([(150,112),(126,118),(108,140),(100,176),(92,214),(84,250),(112,252),(124,226),(150,232)]),True,.4),fill='url(#stone)')+
  body(poly([(98,214),(80,252),(92,252),(98,240),(104,254),(112,240),(118,254),(122,226)]),fill='url(#stone)')+
  body(poly(mir([(98,214),(80,252),(92,252),(98,240),(104,254),(112,240),(118,254),(122,226)])),fill='url(#stone)')+
  body(smooth(sym([(150,72),(132,76),(120,92),(122,112),(134,126),(150,132)]),True,.5),fill='url(#stone)')+
  body('M128 82 Q108 62 112 34 Q122 58 138 76 Z',fill='url(#stone)')+body('M172 82 Q192 62 188 34 Q178 58 162 76 Z',fill='url(#stone)')+
  det('M136 118 L142 112 L148 120 L152 120 L158 112 L164 118',1.4,.9,'#f3e7cf')+det('M118 160 Q150 176 182 160 M126 190 L138 200 M174 190 L162 200',1.2,.4)+
  eye(138,98,3.6)+eye(162,98,3.6)))
# ---------- floor 3 ----------
C['slime']=dict(tint='#1f5a3a',eye='#eaff9a',det='#a8f0b8',g=lambda:(
  body(smooth([(56,262),(42,236),(56,214),(80,212),(96,232),(92,258)],True,.6),fill='url(#goo)')+
  body(smooth([(222,266),(214,240),(232,222),(256,226),(266,248),(254,268)],True,.6),fill='url(#goo)')+
  body(smooth([(150,76),(116,82),(90,110),(76,150),(70,196),(82,236),(110,262),(150,270),(190,262),(218,236),(230,196),(224,150),(210,110),(184,82)],True,.5),fill='url(#goo)')+
  glow('M120 252 q-4 26 2 34 q6-8 2-34 Z',None,.4)+glow('M188 254 q-3 20 2 26 q5-6 1-26 Z',None,.4)+
  '<ellipse cx="118" cy="120" rx="22" ry="12" fill="#ffffff" opacity=".22" transform="rotate(-30 118 120)"/><circle cx="104" cy="146" r="5" fill="#fff" opacity=".2"/>'+
  '<circle cx="176" cy="196" r="10" fill="none" stroke="var(--d)" opacity=".35"/><circle cx="130" cy="222" r="6" fill="none" stroke="var(--d)" opacity=".35"/>'+
  '<path d="M116 192 Q150 236 184 192 Q150 210 116 192 Z" fill="#0b1a10"/>'+det('M126 198 l4 8 l4 -6 l4 9 l4 -7 M162 206 l4 -8 l4 6 l4 -8',1.2,.9,'#eaff9a')+
  eye(128,160,6)+eye(172,160,6)+eye(66,236,2.4)+eye(82,236,2.4)+eye(234,244,2.4)+eye(250,244,2.4)))
C['mirror']=dict(tint='#2a3f6a',eye='#bfe8ff',det='#cfe6ff',g=lambda:(
  ''.join(f'<path d="{poly(p)}" fill="#bfe8ff" opacity=".28" stroke="#e8f6ff" stroke-width=".8"/>' for p in [[(30,60),(52,48),(46,86)],[(250,70),(276,90),(254,104)],[(24,200),(44,186),(40,222)],[(262,196),(284,214),(258,228)],[(76,26),(90,20),(86,40)]])+
  '<ellipse cx="150" cy="150" rx="86" ry="118" fill="url(#glass)" stroke="url(#rim)" stroke-width="7"/>'+
  '<ellipse cx="150" cy="150" rx="78" ry="110" fill="none" stroke="var(--d)" stroke-width="1" opacity=".6"/>'+
  det('M150 24 Q140 10 150 2 Q160 10 150 24 M64 150 Q50 140 44 150 Q50 160 64 150 M236 150 Q250 140 256 150 Q250 160 236 150 M150 276 Q140 290 150 298 Q160 290 150 276',2,.9,'url(#rim)')+
  # the sprite inside: glass wings and a slim figure
  f'<path d="{poly([(146,140),(92,84),(102,150),(84,196),(144,166)])}" fill="#dff4ff" opacity=".35" stroke="#e8f6ff" stroke-width="1"/>'+
  f'<path d="{poly(mir([(146,140),(92,84),(102,150),(84,196),(144,166)]))}" fill="#dff4ff" opacity=".35" stroke="#e8f6ff" stroke-width="1"/>'+
  body(smooth(sym([(150,96),(140,100),(136,114),(142,126),(136,140),(130,180),(122,236),(150,244)]),True,.4))+
  det('M142 98 Q130 120 124 160 M158 98 Q170 120 176 160',1.4,.8,'#cfe6ff')+
  det('M60 230 L110 170 L104 200 M224 70 L188 120',1,.6,'#ffffff')+
  eye(145,112,2.4)+eye(155,112,2.4)))
C['puppet']=dict(tint='#5a4020',eye='#ffd36b',det='#e0b46a',g=lambda:(
  # wind-up key behind
  '<g transform="translate(150 70)"><path d="M-6 0 L-6 -30 L6 -30 L6 0 Z" fill="#b08a3a" stroke="url(#rim)" stroke-width="1.5"/>'+
  '<path d="M0 -30 C-34 -30 -46 -70 -16 -70 C-6 -70 -2 -58 0 -46 C2 -58 6 -70 16 -70 C46 -70 34 -30 0 -30 Z" fill="#c9a24a" stroke="url(#rim)" stroke-width="1.8"/></g>'+
  # hammer
  '<path d="M206 236 L238 78" stroke="#4a3418" stroke-width="7" stroke-linecap="round"/>'+body('M214 64 L264 74 L258 104 L208 94 Z',fill='url(#brass)')+
  # torso, joints, limbs
  body(smooth(sym([(150,120),(120,124),(104,142),(108,196),(122,224),(150,230)]),True,.45),fill='url(#brass)')+
  det('M150 130 L150 222 M118 170 L182 170',1.2,.5)+'<circle cx="150" cy="170" r="14" fill="none" stroke="var(--d)" stroke-width="1.6" opacity=".8"/>'+
  det('M150 156 L150 170 L160 176',1.6,.9,'var(--e)')+
  det('M106 148 L84 186 L92 226 M194 148 L214 180 L220 236 M132 228 L124 296 M168 228 L176 296',8,1,'url(#brass)')+
  ''.join(f'<circle cx="{x}" cy="{y}" r="6" fill="#2a1d10" stroke="url(#rim)" stroke-width="1.5"/>' for x,y in [(106,148),(84,186),(194,148),(214,180),(132,228),(168,228),(128,262),(172,262)])+
  # porcelain head with a crack
  body(smooth(sym([(150,62),(126,68),(114,90),(118,112),(150,124)]),True,.5),fill='url(#porc)')+
  det('M160 66 L154 82 L162 92 L156 104',1.2,.8,'#3a2a14')+
  '<circle cx="136" cy="92" r="7" fill="#1a120a"/><circle cx="164" cy="92" r="7" fill="#1a120a"/>'+
  det('M134 112 L166 112 M140 108 L140 116 M150 108 L150 117 M160 108 L160 116',1.3,.9,'#3a2a14')+
  eye(136,92,2.4)+eye(164,92,2.4)))
# ---------- floor 4 ----------
C['treant']=dict(tint='#2c3e1e',eye='#9cff5a',det='#a6c27a',g=lambda:(
  body(poly([(120,150),(84,110),(40,96),(20,62),(52,82),(60,50),(78,88),(100,96),(96,56),(116,90),(130,120)]),fill='url(#bark)')+
  body(poly(mir([(120,150),(84,110),(40,96),(20,62),(52,82),(60,50),(78,88),(100,96),(96,56),(116,90),(130,120)])),fill='url(#bark)')+
  ''.join(det(f'M{x} {y} l{dx} {dy}',1.6,.9,'#d9e8b0') for x,y,dx,dy in [(60,94,-6,-8),(84,104,-2,-10),(46,84,-8,2),(240,94,6,-8),(216,104,2,-10),(254,84,8,2),(110,170,-10,-2),(190,180,10,-2),(120,220,-10,2)])+
  body(smooth([(150,70),(122,78),(110,110),(112,170),(104,230),(80,276),(110,270),(128,290),(150,276),(172,290),(190,270),(220,276),(196,230),(188,170),(190,110),(178,78)],True,.4),fill='url(#bark)')+
  det('M132 96 Q126 150 136 206 M168 100 Q176 150 166 210 M150 210 L146 270',1.4,.5)+
  '<path d="M130 176 Q150 196 170 176 Q160 206 150 208 Q140 206 130 176 Z" fill="#0a0806"/>'+
  '<path d="M126 124 Q136 116 146 126 Q138 140 128 136 Z M174 124 Q164 116 154 126 Q162 140 172 136 Z" fill="#0a0806"/>'+
  eye(136,128,3.6)+eye(164,128,3.6)))
C['ogre']=dict(tint='#4a3424',eye='#ffcf3d',det='#c89a6a',g=lambda:(
  # bell hammer over the shoulder
  '<path d="M196 150 L262 40" stroke="#3a2614" stroke-width="10" stroke-linecap="round"/>'+
  body(smooth([(236,46),(250,14),(282,20),(292,52),(298,74),(244,58)],True,.4),fill='url(#brass)')+det('M246 54 Q270 66 296 70',1.4,.8)+
  body(smooth(sym([(150,84),(116,90),(70,108),(40,140),(30,190),(44,236),(70,250),(96,232),(100,270),(150,280)]),True,.4))+
  body(smooth([(46,150),(26,200),(30,250),(54,268),(74,250),(66,200)],True,.5))+
  body(smooth([(254,150),(274,190),(262,180),(220,170),(200,150)],True,.5))+
  det('M96 150 Q150 180 204 150 M110 200 Q150 220 190 200 M150 180 L150 270',1.6,.45)+
  body(smooth(sym([(150,52),(128,56),(116,74),(118,98),(130,112),(150,116)]),True,.5))+
  det('M132 100 L136 108 L140 100 M160 100 L164 108 L168 100',1.6,.9,'#f3e7cf')+det('M128 70 Q150 62 172 70',2,.8)+
  eye(150,80,7)))
C['banshee']=dict(tint='#2a3a52',eye='#d6f4ff',det='#bcd8f0',g=lambda:(
  ''.join(det(f'M{x} 60 Q{x+dx} 140 {x+dx*2} 220',2.2,.35,'#d6ecff') for x,dx in [(118,-30),(124,-18),(182,30),(176,18),(112,-40)])+
  body(smooth([(150,40),(118,52),(104,86),(98,130),(70,180),(46,230),(62,226),(60,262),(84,244),(92,286),(112,256),(128,300),(144,262),(156,300),(170,258),(188,290),(198,248),(220,270),(222,236),(250,236),(214,186),(200,130),(194,86),(182,52)],True,.35),fill='url(#wraith)')+
  body(smooth([(104,140),(60,120),(30,90),(44,124),(30,132),(66,152),(100,170)],True,.4),fill='url(#wraith)')+
  body(smooth(mir([(104,140),(60,120),(30,90),(44,124),(30,132),(66,152),(100,170)]),True,.4),fill='url(#wraith)')+
  det('M34 92 l-8 -6 M30 132 l-10 2 M266 92 l8 -6 M270 132 l10 2',1.6,.8,'#d6ecff')+
  '<ellipse cx="150" cy="104" rx="26" ry="32" fill="#0a0d14"/>'+
  glow('M140 118 Q150 112 160 118 Q158 140 150 144 Q142 140 140 118 Z',None,.6)+
  eye(140,98,3)+eye(160,98,3)))
# ---------- floor 5 ----------
C['shaman']=dict(tint='#2e4a24',eye='#7dff9a',det='#c9b48a',g=lambda:(
  # totem pole
  body('M196 40 L250 40 L254 290 L192 290 Z',fill='url(#bark)')+
  body(poly([(186,40),(260,40),(272,24),(223,8),(174,24)]),fill='url(#bark)')+
  det('M196 110 L250 110 M196 190 L250 190',1.6,.6)+
  '<path d="M206 70 L218 62 L222 76 Z M240 70 L228 62 L224 76 Z M206 150 L218 142 L222 156 Z M240 150 L228 142 L224 156 Z" fill="#0a0806"/>'+
  det('M210 92 L236 92 M206 172 Q223 184 240 172 M210 220 L236 220 M214 236 L232 236',2,.85,'#0a0806')+
  eye(216,70,2.6)+eye(230,70,2.6)+eye(216,150,2.6)+eye(230,150,2.6)+
  # goblin with a skull staff
  '<path d="M86 300 L110 96" stroke="#3a2614" stroke-width="6" stroke-linecap="round"/>'+
  body(smooth([(110,70),(96,76),(94,96),(110,104),(124,96),(124,78)],True,.5),fill='url(#bone)')+
  '<circle cx="104" cy="86" r="4" fill="#120f14"/><circle cx="116" cy="86" r="4" fill="#120f14"/>'+eye(104,86,1.6)+eye(116,86,1.6)+
  det('M96 104 L82 118 M124 104 L136 120 M100 104 l-4 22 M120 104 l4 20',1.2,.7,'#c9b48a')+
  body(smooth([(132,150),(104,166),(98,220),(92,290),(132,296),(176,290),(170,220),(162,168)],True,.4),fill='url(#robe)')+
  body(poly([(118,128),(64,112),(96,138),(116,146)]))+body(poly([(146,128),(204,108),(170,140),(150,146)]))+
  body(smooth([(132,104),(116,112),(112,134),(120,150),(132,156),(146,150),(152,134),(148,112)],True,.5))+
  det('M110 180 Q132 196 156 180 M120 230 L120 280 M144 230 L148 284',1.2,.5)+
  det('M124 142 L128 146 L132 142 L136 146 L140 142',1.2,.9,'#f3e7cf')+
  eye(124,128,2.6)+eye(140,128,2.6)))
C['thief']=dict(tint='#3a2a4a',eye='#ffe07a',det='#c4a8e0',g=lambda:(
  # trailing scarf
  body(smooth([(170,110),(220,96),(270,70),(296,84),(262,100),(286,112),(244,120),(196,128)],True,.4),fill='url(#robe)')+
  # crouched cloak
  body(smooth([(150,62),(122,70),(104,100),(98,140),(66,186),(40,240),(70,232),(76,268),(104,250),(120,282),(150,262),(180,282),(196,250),(224,268),(230,232),(260,240),(234,186),(202,140),(196,100),(178,70)],True,.35),fill='url(#robe)')+
  det('M118 140 Q150 160 182 140 M104 200 Q150 220 196 200 M150 160 L150 250',1.2,.45)+
  # hood and mask
  '<path d="M126 104 Q150 88 174 104 L172 124 Q150 132 128 124 Z" fill="#0a080d"/>'+
  det('M126 116 L174 116',3,.9,'#4a3a5a')+
  # daggers
  body('M60 196 L98 168 L104 176 L68 204 Z',fill='#9aa0b0')+det('M98 168 L112 160 M100 176 L112 168',3,.9,'#4a3418')+
  body('M240 196 L202 168 L196 176 L232 204 Z',fill='#9aa0b0')+det('M202 168 L188 160 M200 176 L188 168',3,.9,'#4a3418')+
  # pocket watch on a chain
  det('M150 140 Q140 170 150 190',1,.9,'url(#rim)')+'<circle cx="150" cy="198" r="10" fill="#c9a24a" stroke="url(#rim)" stroke-width="1.5"/>'+det('M150 198 L150 192 M150 198 L155 200',1.2,1,'#2a1d10')+
  eye(140,112,2.6)+eye(160,112,2.6)))
C['golem']=dict(tint='#4a2414',eye='#ffb03d',det='#ff8a3d',g=lambda:(
  body(smooth([(150,70),(112,78),(66,96),(36,132),(28,184),(40,236),(66,246),(80,214),(92,260),(84,296),(216,296),(208,260),(220,214),(234,246),(260,236),(272,184),(264,132),(234,96),(188,78)],True,.3),fill='url(#rock)')+
  body(smooth([(150,40),(128,46),(120,66),(130,84),(150,88),(170,84),(180,66),(172,46)],True,.5),fill='url(#rock)')+
  glow('M118 120 L182 120 L192 176 L150 196 L108 176 Z',None,.5)+
  det('M118 120 L182 120 L192 176 L150 196 L108 176 Z M130 120 L136 186 M150 120 L150 196 M170 120 L164 186',2,.9,'#2a120a')+
  ''.join(det(d,2,.9,'var(--e)') for d in ['M66 110 L84 140 L74 168','M232 106 L218 138 L230 170','M60 200 L76 222','M240 200 L222 226','M110 220 L124 250 L116 280','M190 222 L178 252 L186 282','M140 50 L146 62'])+
  eye(140,64,3)+eye(160,64,3)))
C['king']=dict(tint='#3a1a4a',eye='#ff5ad1',det='#d6a8ff',g=lambda:(
  '<circle cx="150" cy="96" r="92" fill="none" stroke="url(#rim)" stroke-width="3" opacity=".9"/><circle cx="150" cy="96" r="82" fill="none" stroke="var(--d)" stroke-width="1" opacity=".6"/>'+
  ''.join(f'<path d="M{f(150+82*math.sin(a))} {f(96-82*math.cos(a))} L{f(150+92*math.sin(a))} {f(96-92*math.cos(a))}" stroke="#f7dc96" stroke-width="{3 if i%3==0 else 1.4}"/>' for i,a in enumerate([k*math.pi/6 for k in range(12)]))+
  det('M150 96 L150 20 M150 96 L206 60',3,.9,'#f7dc96')+
  body(smooth([(150,90),(116,100),(70,120),(26,190),(10,290),(80,262),(110,296),(150,280),(190,296),(220,262),(290,290),(274,190),(230,120),(184,100)],True,.35),fill='url(#robe)')+
  det('M110 120 L96 290 M190 120 L204 290 M150 120 L150 280',1.4,.5)+
  body(smooth([(150,56),(130,62),(124,84),(132,104),(150,112),(168,104),(176,84),(170,62)],True,.5))+
  body(poly([(128,62),(122,26),(136,48),(150,14),(164,48),(178,26),(172,62)]),fill='url(#brass)')+
  eye(140,82,3)+eye(160,82,3)))

DEFS='''<radialGradient id="bg" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="var(--t)"/><stop offset=".55" stop-color="#110d16"/><stop offset="1" stop-color="#060509"/></radialGradient>
<radialGradient id="halo" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffd88a" stop-opacity=".45"/><stop offset=".5" stop-color="var(--t)" stop-opacity=".35"/><stop offset="1" stop-color="var(--t)" stop-opacity="0"/></radialGradient>
<linearGradient id="bd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2230"/><stop offset="1" stop-color="#0a080d"/></linearGradient>
<linearGradient id="rim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1c8"/><stop offset=".45" stop-color="#d4a54a"/><stop offset="1" stop-color="#6a4a1a"/></linearGradient>
<linearGradient id="bone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#efe4c8"/><stop offset="1" stop-color="#9c8c6c"/></linearGradient>
<linearGradient id="shell" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a6a56"/><stop offset=".5" stop-color="#1a2a22"/><stop offset="1" stop-color="#0a100c"/></linearGradient>
<linearGradient id="stone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a707c"/><stop offset="1" stop-color="#1c1e24"/></linearGradient>
<radialGradient id="goo" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#9af0a0" stop-opacity=".95"/><stop offset=".6" stop-color="#2e8a4a" stop-opacity=".9"/><stop offset="1" stop-color="#0c2a16" stop-opacity=".95"/></radialGradient>
<radialGradient id="glass" cx="40%" cy="35%" r="75%"><stop offset="0" stop-color="#cfe6ff" stop-opacity=".35"/><stop offset=".6" stop-color="#2a3f6a" stop-opacity=".5"/><stop offset="1" stop-color="#0a1020" stop-opacity=".85"/></radialGradient>
<linearGradient id="brass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e0b860"/><stop offset=".5" stop-color="#8a6424"/><stop offset="1" stop-color="#3a2810"/></linearGradient>
<linearGradient id="porc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6efe2"/><stop offset="1" stop-color="#b8a88c"/></linearGradient>
<linearGradient id="bark" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5a4a30"/><stop offset=".6" stop-color="#2a2014"/><stop offset="1" stop-color="#100c08"/></linearGradient>
<linearGradient id="wraith" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe2f6" stop-opacity=".85"/><stop offset=".5" stop-color="#5a7494" stop-opacity=".6"/><stop offset="1" stop-color="#1a2434" stop-opacity="0"/></linearGradient>
<linearGradient id="robe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2e44"/><stop offset="1" stop-color="#0a080d"/></linearGradient>
<linearGradient id="rock" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5a4038"/><stop offset=".5" stop-color="#2a1a16"/><stop offset="1" stop-color="#100a08"/></linearGradient>
<linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#060509"/></linearGradient>
<filter id="bl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
<filter id="bl2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>'''

def clock(cx,cy,r):
    s=f'<g opacity=".32" fill="none" stroke="#d4a54a"><circle cx="{f(cx)}" cy="{f(cy)}" r="{f(r)}" stroke-width="1.5"/><circle cx="{f(cx)}" cy="{f(cy)}" r="{f(r*.86)}" stroke-width=".8" stroke-dasharray="2 4"/>'
    for i in range(60):
        a=i*math.pi/30;l=r*(.9 if i%5==0 else .95)
        s+=f'<path d="M{f(cx+l*math.sin(a))} {f(cy-l*math.cos(a))} L{f(cx+r*math.sin(a))} {f(cy-r*math.cos(a))}" stroke-width="{2 if i%5==0 else .8}"/>'
    rom=['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI']
    for i,t in enumerate(rom):
        a=i*math.pi/6;l=r*.76
        s+=f'<text x="{f(cx+l*math.sin(a))}" y="{f(cy-l*math.cos(a)+r*.035)}" font-family="Georgia,serif" font-size="{f(r*.1)}" text-anchor="middle" fill="#d4a54a" stroke="none">{t}</text>'
    return s+'</g>'

def embers(w,h,seed):
    random.seed(seed);s=''
    for _ in range(int(w*h/4000)):
        x,y,r=random.uniform(0,w),random.uniform(0,h*.8),random.uniform(.6,1.8)
        s+=f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(r)}" fill="#ffd88a" opacity="{f(random.uniform(.2,.7))}"/>'
    return s

def plate(key,w,h,cx,cy,sc,ccx,ccy,cr):
    c=C[key]
    out=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" preserveAspectRatio="xMidYMid slice">
<defs>{DEFS}</defs>
<rect width="{w}" height="{h}" fill="url(#bg)"/>
{clock(ccx,ccy,cr)}
<ellipse cx="{f(cx)}" cy="{f(cy)}" rx="{f(150*sc)}" ry="{f(140*sc)}" fill="url(#halo)"/>
{embers(w,h,key)}
<g transform="translate({f(cx-150*sc)} {f(cy-150*sc)}) scale({f(sc)})">{c['g']()}</g>
<rect y="{f(h*.6)}" width="{w}" height="{f(h*.4)}" fill="url(#floor)"/>
</svg>'''
    return out.replace('var(--t)',c['tint']).replace('var(--e)',c['eye']).replace('var(--d)',c['det'])

for k in C:
    open(os.path.join(OUT,f'foe_{k}.svg'),'w').write(plate(k,600,340,300,150,.95,300,135,150))
    open(os.path.join(OUT,f'foe_{k}_p.svg'),'w').write(plate(k,240,500,120,215,.72,120,205,108))
print(len(C),'foes')
