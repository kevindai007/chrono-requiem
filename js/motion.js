/* ---------- Motion (GSAP): a move pulls a thread, a resonance ties a knot, a parry cuts the foe's patch and folds it back;
   victory is stitched in, defeat frays at the lower edge, the summit unrolls ---------- */
const CALM=matchMedia('(prefers-reduced-motion:reduce)').matches||!window.gsap;
if(!CALM&&window.DrawSVGPlugin)gsap.registerPlugin(DrawSVGPlugin);
const NS='http://www.w3.org/2000/svg';
function svgEl(tag,attrs,parent){const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e}
const wrapBox=()=>$('tlwrap').getBoundingClientRect();
const centre=(el,o)=>{const r=el.getBoundingClientRect();return {x:r.left-o.left+r.width/2,y:r.top-o.top+r.height/2,l:r.left,t:r.top,w:r.width,h:r.height}};
// where every patch on the loom sits, taken just before a card changes the board
function chipPos(){if(CALM)return null;const o=wrapBox(),m=new Map();document.querySelectorAll('#timeline .chip[data-id]').forEach(c=>m.set(c.dataset.id,centre(c,o)));return m}
function pullThreads(before){
  if(!before)return;
  const g=$('threads'),o=wrapBox();
  document.querySelectorAll('#timeline .chip[data-id]').forEach(c=>{
    const now=centre(c,o),was=before.get(c.dataset.id);
    if(!was){gsap.from(c,{scale:.3,rotation:-14,opacity:0,duration:.5,ease:'back.out(2)'});return}
    const dx=was.l-now.l,dy=was.t-now.t;if(Math.abs(dx)<3&&Math.abs(dy)<3)return;
    const p=svgEl('path',{d:`M${was.x} ${was.y}Q${(was.x+now.x)/2} ${Math.min(was.y,now.y)-48} ${now.x} ${now.y}`,fill:'none',stroke:'#b28a45','stroke-width':2.4,'stroke-linecap':'round'},g);
    gsap.timeline({onComplete:()=>p.remove()}).fromTo(p,{drawSVG:'0%'},{drawSVG:'100%',duration:.45,ease:'power2.inOut'}).to(p,{drawSVG:'100% 100%',duration:.35,ease:'power1.in'},'+=.12');
    gsap.from(c,{x:dx,y:dy,duration:.55,ease:'power2.inOut'});
  });
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
function beatFx(h){const t=h.rec&&tagOf(h.rec);if(!t)return;if(t.t==='弹反'){tieKnot(h.b);cutThread(h.b)}else if(t.c==='res')tieKnot(h.b)}
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
  }else if(mode==='lose'){
    fray();
    gsap.from('.lmain>*',{y:18,opacity:0,stagger:.07,duration:.5,ease:'power2.out',delay:.2,clearProps:'transform,opacity'});
  }else if(mode==='end'){
    gsap.from('.pano',{clipPath:'inset(0 50% 0 50%)',duration:1.5,ease:'power3.inOut'});
    gsap.from('.pano .cap',{y:30,opacity:0,duration:.6,delay:1.2});
    gsap.fromTo('.seven path',{drawSVG:'0%'},{drawSVG:'100%',duration:1.8,ease:'power1.inOut',delay:.8});
    gsap.from('.seven .kn',{scale:0,transformOrigin:'50% 50%',stagger:.24,duration:.4,ease:'back.out(3)',delay:1});
    gsap.from('.scr.end .stats,.scr.end .pp,.scr.end .acts',{y:24,opacity:0,stagger:.1,duration:.5,delay:1.6,clearProps:'transform,opacity'});
  }
}

function start(data){
  if(data&&data.state&&data.state.run&&data.state.run.cls&&data.state.hp!=null){S=data.state;S.run.foes??=TOWER.map(p=>p[0]);S.run.gold??=0;S.run.road??=[];S.run.knots??=[];S.run.woven??=[];[S.run.deck,S.deck,S.hand,S.discard].flat().forEach(k=>k.includes('+')&&card(k));S.rageMax??=10;S.comboMax??=8;S.chain??=0;S.frost??=0;S.refund??=0;S.busy=false;S.resolving=null;S.pending=null;S.hist??=[];S.doneUpTo??=S.beat-1;if(S.doneUpTo>=S.beat)S.doneUpTo=S.beat-1;render();if(S.run.stage!==S.stage)walk(S.run);else if(S.over)showEnd()}
  else{newRun(0,'warrior');render();showClassPick(true)}
}
window.claude?.hot?.snapshot?.(()=>({state:JSON.parse(JSON.stringify(S))}));
window.claude?.hot?.ready?window.claude.hot.ready(start):start(window.claude?.hot?.data??{});
