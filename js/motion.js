/* ---------- Motion (GSAP + DrawSVG, Physics2D, CustomWiggle; canvas-confetti for the gold flakes):
   a move pulls a thread, a resonance ties a knot, a parry cuts the foe's patch and folds it back;
   blows lunge and shake, spells burst on the foe, the hand is dealt from the pile and swept back,
   a beaten foe unravels into threads; victory is stitched in, defeat frays at the lower edge, the summit unrolls ---------- */
const CALM=matchMedia('(prefers-reduced-motion:reduce)').matches||!window.gsap;
if(!CALM){gsap.registerPlugin(DrawSVGPlugin,Physics2DPlugin,CustomEase,CustomWiggle);CustomWiggle.create('quake',{wiggles:6,type:'easeOut'})}
const NS='http://www.w3.org/2000/svg';
function svgEl(tag,attrs,parent){const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e}
const wrapBox=()=>$('tlwrap').getBoundingClientRect();
const centre=(el,o)=>{const r=el.getBoundingClientRect();return {x:r.left-o.left+r.width/2,y:r.top-o.top+r.height/2,l:r.left,t:r.top,w:r.width,h:r.height}};
// where every patch on the loom sits, taken just before a card changes the board
function chipPos(){if(CALM)return null;const o=wrapBox(),m=new Map();document.querySelectorAll('#timeline .chip[data-id]').forEach(c=>m.set(c.dataset.id,centre(c,o)));return m}
function pullThreads(before){
  if(!before)return;
  const g=$('threads'),o=wrapBox();let moved=0;
  document.querySelectorAll('#timeline .chip[data-id]').forEach(c=>{
    const now=centre(c,o),was=before.get(c.dataset.id);
    if(!was){moved|=2;gsap.from(c,{scale:.3,rotation:-14,opacity:0,duration:.5,ease:'back.out(2)'});return}
    const dx=was.l-now.l,dy=was.t-now.t;if(Math.abs(dx)<3&&Math.abs(dy)<3)return;moved|=1;
    const p=svgEl('path',{d:`M${was.x} ${was.y}Q${(was.x+now.x)/2} ${Math.min(was.y,now.y)-48} ${now.x} ${now.y}`,fill:'none',stroke:'#b28a45','stroke-width':2.4,'stroke-linecap':'round'},g);
    gsap.timeline({onComplete:()=>p.remove()}).fromTo(p,{drawSVG:'0%'},{drawSVG:'100%',duration:.45,ease:'power2.inOut'}).to(p,{drawSVG:'100% 100%',duration:.35,ease:'power1.in'},'+=.12');
    gsap.from(c,{x:dx,y:dy,duration:.55,ease:'power2.inOut'});
  });
  if(moved&1)setTimeout(()=>SFX('pull'),120);else if(moved&2)setTimeout(()=>SFX('spawn'),120);
}
const KNOT_D=['M0 -16c6 0 9 5 6 10l-12 12c-3 5 0 10 6 10s9-5 6-10l-12-12c-3-5 0-10 6-10z','M-16 0c0-6 5-9 10-6l12 12c5 3 10 0 10-6s-5-9-10-6l-12 12c-5 3-10 0-10-6z'];
const slotAt=b=>document.querySelector(`#timeline [data-pb="${b}"]`)||document.querySelector(`#timeline [data-b="${b}"]`);
function tieKnot(b){
  const slot=slotAt(b);if(CALM||!slot)return;
  const g=$('threads'),o=wrapBox(),m=centre(slot.querySelector('.mid'),o),grp=svgEl('g',{},g);
  const strands=[...slot.querySelectorAll('.lane .chip')].map(c=>{const p=centre(c,o);return svgEl('path',{d:`M${p.x} ${p.y}C${p.x+26} ${(p.y+m.y)/2} ${m.x-26} ${(p.y+m.y)/2} ${m.x} ${m.y}`,fill:'none',stroke:'#b28a45','stroke-width':2,'stroke-linecap':'round'},grp)});
  const pin=svgEl('g',{transform:`translate(${m.x} ${m.y})`},grp),k=svgEl('g',{},pin);
  KNOT_D.forEach(d=>svgEl('path',{d,fill:'none',stroke:'#cfa95f','stroke-width':3.2},k));
  gsap.timeline({onComplete:()=>grp.remove()})
    .fromTo(strands,{drawSVG:'0%'},{drawSVG:'100%',duration:.35,stagger:.06,ease:'power2.in'})
    .fromTo(k,{scale:0,rotation:-200,transformOrigin:'50% 50%'},{scale:1.5,rotation:0,duration:.45,ease:'back.out(2.2)'},'-=.08')
    .to(strands,{drawSVG:'100% 100%',duration:.3},'<')
    .to(k,{scale:.9,opacity:0,duration:.35,delay:.25});
}
function cutThread(b){
  const slot=slotAt(b),chip=slot&&slot.querySelector('.lane.e .chip');if(CALM||!chip)return;
  const g=$('threads'),o=wrapBox(),c=centre(chip,o),wrap=$('tlwrap');
  const cut=svgEl('path',{d:`M${c.x-c.w/2-8} ${c.y+c.h/2+6}L${c.x+c.w/2+8} ${c.y-c.h/2-6}`,stroke:'#f1e7d1','stroke-width':3,'stroke-linecap':'round'},g);
  const back=svgEl('path',{d:`M${c.x} ${c.y}C${c.x+60} ${c.y-50} ${c.x+70} ${c.y+20} ${c.x+24} ${c.y+12}`,fill:'none',stroke:'#923f35','stroke-width':2.2,'stroke-linecap':'round'},g);
  const halves=['polygon(0 0,100% 0,100% 30%,0 70%)','polygon(0 70%,100% 30%,100% 100%,0 100%)'].map(cp=>{const h=chip.cloneNode(true);
    h.style.cssText=`position:absolute;left:${c.x-c.w/2}px;top:${c.y-c.h/2}px;width:${c.w}px;height:${c.h}px;margin:0;z-index:7;clip-path:${cp}`;wrap.appendChild(h);return h});
  chip.style.visibility='hidden';
  gsap.timeline({onComplete:()=>{cut.remove();back.remove();halves.forEach(h=>h.remove());chip.style.visibility=''}})
    .fromTo(cut,{drawSVG:'0%'},{drawSVG:'100%',duration:.16,ease:'power3.in'})
    .to(halves[0],{x:18,y:-18,rotation:-16,duration:.55,ease:'power2.out'},'+=.04')
    .to(halves[1],{x:24,y:16,rotation:12,duration:.55,ease:'power2.out'},'<')
    .fromTo(back,{drawSVG:'0%'},{drawSVG:'100%',duration:.4,ease:'power1.inOut'},'<')
    .to([...halves,cut,back],{opacity:0,duration:.3},'+=.05');
}
// after a beat resolves: tie a knot where attacks met, cut the foe's patch on a parry
function beatFx(h){const t=h.rec&&tagOf(h.rec);if(!t)return;if(t.t==='弹反'){SFX('parry');tieKnot(h.b);cutThread(h.b)}else if(t.c==='res'){SFX('knot');tieKnot(h.b)}}

/* ---------- The stage: blows, guards, spells ---------- */
const side=who=>who==='hero'?{art:$('heroArt'),box:$('heroFloats'),foe:$('enemyArt'),dir:-1}:{art:$('enemyArt'),box:$('enemyFloats'),foe:$('heroArt'),dir:1};
const rr=([a,b])=>a+Math.random()*(b-a),any=a=>a[Math.floor(Math.random()*a.length)];
// what a float means for the ear and the eye; damage floats are blows, a few words are guards and dodges
const FLOAT_FX=[[/弹反/,'parry'],[/共鸣/,'knot'],[/格挡|盾|帷幕|冰甲|屏障|静音织物|图腾|打结绳/,'block',(w)=>guard(w)],[/闪身|残影|落空/,'dodge',w=>ghost(w)],[/毒/,'poison',w=>burst(w,'poison')],[/霜冻|冻结|冻碎/,'ice',w=>burst(w,'ice')],[/打断/,'err'],[/连击|潮汐|破招/,'spawn']];
function floatFx(who,text,cls){
  if(cls==='dmg'||cls==='big'||cls==='hurt'){SFX(cls==='dmg'?'hit':cls);strike(who,cls==='big'?2:cls==='hurt'?1.3:1);return}
  if(cls==='heal'){SFX('heal');burst(who,'heal');return}
  const m=FLOAT_FX.find(([re])=>re.test(text));if(!m)return;SFX(m[1]);if(!CALM&&m[2])m[2](who);
}
// the striker lunges, the struck one shakes and blanches, a slash is drawn across it; a big blow shakes the arena and stops time for a blink
function strike(who,k){
  if(CALM)return;const T=side(who);
  gsap.timeline().to(T.foe,{x:T.dir*16*k,scale:1+.03*k,rotation:T.dir*2*k,duration:.09,ease:'power2.in',overwrite:true}).to(T.foe,{x:0,scale:1,rotation:0,duration:.4,ease:'power3.out'});
  gsap.fromTo(T.art,{x:0},{x:T.dir*12*k,duration:.5,ease:'quake',overwrite:true,clearProps:'x'});
  gsap.fromTo(T.art,{filter:'brightness(1.8) sepia(.6)'},{filter:'brightness(1) sepia(0)',duration:.35,clearProps:'filter'});
  slash(T.box,who==='hero'?'#b4574a':'#ead39a',k);
  if(k>=2){gsap.fromTo('#arena',{y:0},{y:8,duration:.55,ease:'quake',clearProps:'y'});restart($('flash'),'on',500);setTimeout(hitStop,90)}
}
function hitStop(){gsap.globalTimeline.timeScale(.05);setTimeout(()=>gsap.globalTimeline.timeScale(1),85)}
// an svg laid over a half in its own pixels, so DrawSVG can measure the strokes
function overlay(box){const w=box.clientWidth||400,h=box.clientHeight||300;return [svgEl('svg',{class:'slash',viewBox:`0 0 ${w} ${h}`},box),w,h]}
function slash(box,col,k){
  const [s,w,h]=overlay(box),y=h*(.34+Math.random()*.24);
  const p=svgEl('path',{d:`M${w*(.12+Math.random()*.12)} ${y+h*.2}Q${w/2} ${y-h*.06} ${w*(.8+Math.random()*.1)} ${y-h*.16}`,fill:'none',stroke:col,'stroke-width':3+k*2.5,'stroke-linecap':'round'},s);
  gsap.timeline({onComplete:()=>s.remove()}).fromTo(p,{drawSVG:'0% 0%'},{drawSVG:'0% 100%',duration:.11,ease:'power3.in'}).to(p,{drawSVG:'100% 100%',duration:.24,ease:'power2.out'});
}
function guard(who){
  const T=side(who),d=document.createElement('div');d.className='guard';d.innerHTML=SVG.SHIELD;T.box.appendChild(d);
  gsap.timeline({onComplete:()=>d.remove()}).fromTo(d,{scale:.3,opacity:0},{scale:1.15,opacity:1,duration:.22,ease:'back.out(3)'}).to(d,{x:-T.dir*6,duration:.3,ease:'quake'}).to(d,{scale:1.4,opacity:0,duration:.35},'+=.1');
}
// an afterimage of the dodger slides off and fades
function ghost(who){
  const T=side(who),g=T.art.cloneNode(false);g.removeAttribute('id');g.classList.add('ghost');T.art.after(g);
  gsap.fromTo(g,{opacity:.55,x:0},{opacity:0,x:-T.dir*60,duration:.6,ease:'power2.out',onComplete:()=>g.remove()});
  gsap.fromTo(T.art,{x:T.dir*-22},{x:0,duration:.45,ease:'power3.out',clearProps:'x'});
}
const PT={fire:{n:24,c:['#f2b35b','#d9643a','#ead39a'],g:-280,v:[160,380],a:[-160,-20],s:[5,11]},
  ice:{n:16,c:['#eef4f8','#a9c3d6','#ffffff'],g:700,v:[220,440],a:[-170,-10],s:[5,10],shard:1},
  poison:{n:9,c:['#8fa36b','#69745c','#b9c9a3'],g:-120,v:[40,120],a:[-125,-55],s:[6,12],round:1},
  heal:{n:12,c:['#b9c9a3','#ead39a'],g:-170,v:[30,90],a:[-115,-65],s:[4,8],round:1},
  thread:{n:44,c:['#923f35','#b4574a','#e8d9b9','#b28a45','#3b5064','#69745c'],g:900,v:[20,120],a:[60,120],s:[40,110],w:2.5,spread:[220,140]}};
function burst(who,kind){
  if(CALM)return;const P=PT[kind],box=side(who).box;
  for(let i=0;i<P.n;i++){const d=document.createElement('i'),s=rr(P.s);d.className='pt'+(P.round?' round':'');
    d.style.cssText=`width:${P.w||(P.shard?s/2.5:s)}px;height:${s}px;background:${any(P.c)}`;box.appendChild(d);
    const [sx,sy]=P.spread||[20,20];
    gsap.fromTo(d,{x:rr([-sx,sx]),y:rr([-sy,sy*.6]),rotation:rr([0,360]),opacity:1},{duration:rr(P.spread?[1,1.5]:[.7,1.2]),delay:P.spread?Math.random()*.7:0,physics2D:{velocity:rr(P.v),angle:rr(P.a),gravity:P.g},rotation:'+=180',opacity:0,ease:'power1.in',onComplete:()=>d.remove()})}
}
// lightning: a jagged stroke drawn from the top of the foe's half down onto it
function bolt(who){
  if(CALM)return;const [s,w,h]=overlay(side(who).box);
  let x=w*(.45+Math.random()*.1),d=`M${x} -4`;for(let i=1;i<=6;i++){x+=w*rr([-.09,.09]);d+=`L${x} ${h*i*.1}`}
  const p=svgEl('path',{d,fill:'none',stroke:'#f6f0dc','stroke-width':4,'stroke-linejoin':'bevel'},s);
  restart($('flash'),'on',500);
  gsap.timeline({onComplete:()=>s.remove()}).fromTo(p,{drawSVG:'0%'},{drawSVG:'100%',duration:.1,ease:'none'}).to(p,{opacity:0,duration:.08,repeat:3,yoyo:true}).to(p,{opacity:0,duration:.15});
}
function spellFx(el){if(SIM)return;if(el==='火'){SFX('fire');burst('enemy','fire')}else if(el==='冰'){SFX('ice');burst('enemy','ice')}else if(el==='雷'){SFX('thunder');bolt('enemy')}}

/* ---------- The hand: dealt from the pile at the start of a turn, swept back when time moves on ---------- */
const pileAt=()=>{const r=$('piles').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top}};
function dealHand(){
  const cards=[...document.querySelectorAll('#hand .card')];cards.forEach((c,i)=>setTimeout(()=>SFX('draw'),i*70));if(CALM)return;
  const p=pileAt();
  cards.forEach((c,i)=>{const r=c.getBoundingClientRect();gsap.from(c,{x:p.x-(r.left+r.width/2),y:p.y-r.top,rotation:24,scale:.35,opacity:0,duration:.55,delay:i*.07,ease:'back.out(1.2)',clearProps:'transform,opacity'})});
}
function discardHand(){
  const cards=[...document.querySelectorAll('#hand .card')];if(!cards.length)return;SFX('sweep');if(CALM)return;
  const p=pileAt();
  cards.forEach((el,i)=>{const r=el.getBoundingClientRect(),c=el.cloneNode(true);c.disabled=true;c.classList.remove('sel');
    c.style.cssText=`position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;margin:0;z-index:30;pointer-events:none`;document.body.appendChild(c);
    gsap.to(c,{x:p.x-(r.left+r.width/2),y:p.y-r.top-r.height*.3,scale:.22,rotation:16,opacity:0,duration:.45,delay:i*.04,ease:'power2.in',onComplete:()=>c.remove()})});
}

/* ---------- A fight begins and ends ---------- */
const ARTS='#heroArt,#enemyArt';
function fightIn(){
  if(CALM)return;
  gsap.set(ARTS,{clearProps:'transform,opacity,filter,clipPath'});
  gsap.from('#enemyArt',{x:90,opacity:0,duration:.8,ease:'power3.out',clearProps:'transform,opacity'});
  gsap.from('#heroArt',{x:-90,opacity:0,duration:.8,ease:'power3.out',clearProps:'transform,opacity'});
  gsap.from('.arena .plate',{y:26,opacity:0,stagger:.1,duration:.5,delay:.3,clearProps:'transform,opacity'});
  dealHand();
}
// the fight is over: a beaten foe comes apart from the lower edge up and its threads fall; a fallen hero sinks and greys. Returns when to show the result
function overFx(){
  if(S.over==='win')SFX('fall');
  if(CALM)return 700;
  if(S.over==='win'){
    gsap.fromTo('#enemyArt',{clipPath:'inset(0 0 0% 0)'},{clipPath:'inset(0 0 100% 0)',duration:1,ease:'power1.in',delay:.15});
    burst('enemy','thread');
  }else gsap.to('#heroArt',{y:30,filter:'grayscale(1) brightness(.55)',duration:1,ease:'power2.in'});
  return 1300;
}

/* ---------- Gold rolls up to its new value ---------- */
function countTo(el,v){
  const was=+el.dataset.v;el.dataset.v=v;
  if(was===v)return;
  if(isNaN(was)||CALM){el.textContent=v;return}
  if(v>was)SFX('coin');
  const o={n:was};gsap.to(o,{n:v,duration:.8,ease:'power1.out',overwrite:true,onUpdate:()=>el.textContent=Math.round(o.n)});
  gsap.fromTo(el,{scale:1.35},{scale:1,duration:.5,ease:'back.out(3)'});
}
const FLAKES={colors:['#cfa95f','#ead39a','#923f35','#f1e7d1'],shapes:['square'],disableForReducedMotion:true,zIndex:60};
function sway(el){if(!CALM)gsap.fromTo(el,{rotation:-2.2},{rotation:0,duration:1.4,ease:'elastic.out(1,.35)',clearProps:'transform'})}
// the defeat illustration loses its lower edge into hanging threads that keep swaying
function fray(){
  const svg=$('frayThreads');if(!svg)return;
  const cols=['#923f35','#b4574a','#e8d9b9','#b28a45','#3b5064','#69745c','#923f35'];
  const ps=Array.from({length:64},(_,i)=>{const x=i*9.4+4+Math.random()*5,len=50+Math.random()*140,sw=(Math.random()-.5)*28;
    const d=s=>`M${x} 0C${x+s*.3} ${len*.35} ${x-s*.6} ${len*.65} ${x+s} ${len}`;
    const p=svgEl('path',{d:d(sw),fill:'none',stroke:cols[i%cols.length],'stroke-width':1.6+Math.random()*2.2,'stroke-linecap':'round',opacity:.9},svg);p._d=[d(sw),d(-sw*.8)];return p});
  if(CALM)return;
  gsap.fromTo(ps,{drawSVG:'0%'},{drawSVG:'100%',duration:1.6,ease:'power2.out',stagger:{each:.02,from:'random'},delay:.3});
  ps.forEach(p=>gsap.to(p,{attr:{d:p._d[1]},duration:2+Math.random()*2.5,ease:'sine.inOut',repeat:-1,yoyo:true,delay:Math.random()}));
  gsap.from('.fray .pic',{clipPath:'inset(0 0 0 0)',duration:1.8,ease:'power2.inOut'});
}
function calmDown(){if(!CALM)gsap.killTweensOf('#frayThreads path')}
function enter(mode){
  if(CALM)return;
  gsap.from('#scrIn',{opacity:0,duration:.35});
  if(mode==='brief'){
    gsap.from('.hunt',{clipPath:'inset(0 0 100% 0)',duration:.9,ease:'power2.out'});
    gsap.from('.bmid>*',{x:30,opacity:0,stagger:.08,duration:.5,ease:'power2.out',delay:.2,clearProps:'transform,opacity'});
    gsap.from('.tw',{opacity:0,y:-12,stagger:.07,duration:.35,delay:.4});
    gsap.from('.tw.cur',{scale:1.25,duration:.6,ease:'back.out(2.5)',delay:.95});
  }else if(mode==='win'){
    gsap.from('.vban',{scaleY:0,transformOrigin:'50% 0',duration:.7,ease:'back.out(1.6)'});
    gsap.from('.hero-col>*,.vmain>.ttl,.vmain>.stats,.vmain>.sh,.vmain>.lead',{y:22,opacity:0,stagger:.06,duration:.5,ease:'power2.out',delay:.15,clearProps:'transform,opacity'});
    gsap.from('.seam',{clipPath:'inset(0 100% 0 0)',duration:1,ease:'power2.inOut',delay:.4});
    gsap.from('.rewards>*',{y:70,rotation:i=>(i-1.5)*7,opacity:0,stagger:.09,duration:.65,ease:'back.out(1.4)',delay:.55,clearProps:'transform,opacity'});
    gsap.from('.journey',{clipPath:'inset(0 100% 0 0)',duration:1.2,ease:'power2.inOut',delay:.7});
    gsap.from('.journey .jn.next i',{scale:0,duration:.5,ease:'back.out(3)',delay:1.7});
    setTimeout(()=>confetti({...FLAKES,particleCount:90,spread:75,startVelocity:38,origin:{y:.12},gravity:.75,scalar:.9,ticks:240}),250);
  }else if(mode==='road'&&$('scrIn').querySelector('.strands')){
    // the red thread drops from its knot and splits, then each strand's picture is hung at its end
    gsap.from('.strands .spool',{y:-30,opacity:0,duration:.4,ease:'back.out(2)'});
    gsap.fromTo('.split path',{drawSVG:'0%'},{drawSVG:'100%',duration:.7,ease:'power1.inOut',delay:.25});
    gsap.from('.strand',{y:-40,opacity:0,stagger:.12,duration:.55,ease:'back.out(1.4)',delay:.6,clearProps:'transform,opacity'});
    gsap.from('.nfoe,.pack',{opacity:0,duration:.5,delay:.3,clearProps:'opacity'});
  }else if(mode==='shop'&&$('scrIn').querySelector('.shelf')){
    gsap.from('.shelf .ware',{y:-26,opacity:0,stagger:.07,duration:.45,ease:'back.out(1.6)',delay:.15,clearProps:'transform,opacity'});
    gsap.from('.say',{scale:.8,opacity:0,transformOrigin:'50% 0',duration:.4,ease:'back.out(2)',delay:.4,clearProps:'transform,opacity'});
  }else if(mode==='lose'){
    fray();
    gsap.from('.lmain>*',{y:18,opacity:0,stagger:.07,duration:.5,ease:'power2.out',delay:.2,clearProps:'transform,opacity'});
  }else if(mode==='end'){
    gsap.from('.pano',{clipPath:'inset(0 50% 0 50%)',duration:1.5,ease:'power3.inOut'});
    gsap.from('.pano .cap',{y:30,opacity:0,duration:.6,delay:1.2});
    gsap.fromTo('.seven path',{drawSVG:'0%'},{drawSVG:'100%',duration:1.8,ease:'power1.inOut',delay:.8});
    gsap.from('.seven .kn',{scale:0,transformOrigin:'50% 50%',stagger:.24,duration:.4,ease:'back.out(3)',delay:1});
    gsap.from('.scr.end .stats,.scr.end .pp,.scr.end .acts',{y:24,opacity:0,stagger:.1,duration:.5,delay:1.6,clearProps:'transform,opacity'});
    setTimeout(()=>{confetti({...FLAKES,particleCount:120,angle:60,spread:65,origin:{x:0,y:.6},ticks:320});confetti({...FLAKES,particleCount:120,angle:120,spread:65,origin:{x:1,y:.6},ticks:320})},1300);
  }else gsap.from('#scrIn .body>*',{y:18,opacity:0,stagger:.06,duration:.45,ease:'power2.out',clearProps:'transform,opacity'});
}

function start(data){
  if(data&&data.state&&data.state.run&&data.state.run.cls&&data.state.hp!=null){S=data.state;S.run.foes??=TOWER.map(p=>p[0]);S.run.gold??=0;S.run.road??=[];S.run.knots??=[];S.run.woven??=[];[S.run.deck,S.deck,S.hand,S.discard].flat().forEach(k=>k.includes('+')&&card(k));S.rageMax??=10;S.comboMax??=8;S.chain??=0;S.frost??=0;S.refund??=0;S.busy=false;S.resolving=null;S.pending=null;S.hist??=[];S.doneUpTo??=S.beat-1;if(S.doneUpTo>=S.beat)S.doneUpTo=S.beat-1;render();if(S.run.stage!==S.stage)walk(S.run);else if(S.over)showEnd()}
  else{newRun(0,'warrior');render();showClassPick(true)}
}
window.claude?.hot?.snapshot?.(()=>({state:JSON.parse(JSON.stringify(S))}));
window.claude?.hot?.ready?window.claude.hot.ready(start):start(window.claude?.hot?.data??{});
