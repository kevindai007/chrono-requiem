/* ---------- Sound (Tone.js): every effect is synthesised on the spot, so file:// needs no audio files.
   The palette is a loom: the shuttle's swish and the beater's knock, silk strings, a brass clock bell, shears;
   a low harp drifts underneath in three moods (the road, a fight, the last two storeys) ---------- */
const SOUND={mode:'all',mood:null};
try{const m=localStorage.getItem('cr-sound');if(['all','sfx','off'].includes(m))SOUND.mode=m}catch(e){}
const SOUND_UI={all:['SOUND','声音'],sfx:['SFXONLY','音效'],off:['MUTE','静音']};
let AU=null;

// a monophonic Tone voice refuses two notes at the same instant, so each voice keeps its own clock
const vt=(v,dt=0)=>{const t=Math.max(Tone.now()+dt,(v._t||0)+.012);v._t=t;return t};
function buildAudio(){
  const master=new Tone.Volume(-3).toDestination();
  const glue=new Tone.Compressor({threshold:-20,ratio:3.5,attack:.004,release:.18}).connect(master);
  const room=new Tone.Reverb({decay:2.6,preDelay:.012,wet:1}).connect(glue);
  const sfx=new Tone.Gain(1).connect(glue);sfx.connect(new Tone.Gain(.16).connect(room));
  const music=new Tone.Volume(-19).connect(glue);music.connect(new Tone.Gain(.55).connect(room));
  const echo=new Tone.FeedbackDelay({delayTime:'8n.',feedback:.32,wet:.28}).connect(music);
  const vol=(n,db)=>{n.volume.value=db;if('maxPolyphony' in n)n.maxPolyphony=24;return n};
  const noise=(type,ft,freq,q,db)=>{const f=new Tone.Filter({type:ft,frequency:freq,Q:q}).connect(sfx);
    const n=vol(new Tone.NoiseSynth({noise:{type},envelope:{attack:.004,decay:0,sustain:1,release:.06}}),db).connect(f);n.f=f;return n};
  return {master,music,
    harp:vol(new Tone.PolySynth(Tone.Synth,{oscillator:{type:'fattriangle',count:2,spread:14},envelope:{attack:.004,decay:.9,sustain:0,release:.9}}),-12).connect(sfx),
    silk:vol(new Tone.PolySynth(Tone.FMSynth,{harmonicity:2,modulationIndex:3.5,oscillator:{type:'triangle'},envelope:{attack:.001,decay:.55,sustain:0,release:.5},modulationEnvelope:{attack:.001,decay:.12,sustain:0,release:.1}}),-8).connect(sfx),
    wood:vol(new Tone.MembraneSynth({pitchDecay:.008,octaves:2.5,envelope:{attack:.001,decay:.09,sustain:0,release:.02}}),-9).connect(sfx),
    drum:vol(new Tone.MembraneSynth({pitchDecay:.05,octaves:5,envelope:{attack:.001,decay:.42,sustain:0,release:.1}}),-3).connect(sfx),
    metal:vol(new Tone.MetalSynth({envelope:{attack:.001,decay:.32,release:.1},harmonicity:5.1,modulationIndex:28,resonance:3600,octaves:1.4}),-24).connect(sfx),
    bell:vol(new Tone.PolySynth(Tone.FMSynth,{harmonicity:3.01,modulationIndex:9,envelope:{attack:.002,decay:1.5,sustain:0,release:1.5},modulationEnvelope:{attack:.002,decay:.45,sustain:0,release:.4}}),-15).connect(sfx),
    whoosh:noise('pink','bandpass',900,1.4,-6),snip:noise('white','highpass',5200,.7,-14),crunch:noise('brown','lowpass',900,.8,-2),fire:noise('brown','lowpass',400,1.2,-2),
    lute:vol(new Tone.PolySynth(Tone.Synth,{oscillator:{type:'triangle'},envelope:{attack:.006,decay:1.6,sustain:0,release:1.8}}),-8).connect(echo),
    drone:vol(new Tone.Synth({oscillator:{type:'fattriangle',count:3,spread:20},envelope:{attack:2.5,decay:0,sustain:1,release:3}}),-15).connect(new Tone.Filter(320,'lowpass').connect(music)),
    toll:vol(new Tone.FMSynth({harmonicity:3.01,modulationIndex:6,envelope:{attack:.003,decay:3,sustain:0,release:3}}),-16).connect(music)};
}

/* the recipes */
let tock=0;
// PluckSynth needs an AudioWorklet, which file:// refuses, so the silk string is a short FM pluck
const pluck=(n,dt=0,v=1)=>AU.silk.triggerAttackRelease(n,.4,Tone.now()+dt,v);
const wood=(n,dt=0,v=.6,d=.05)=>AU.wood.triggerAttackRelease(n,d,vt(AU.wood,dt),v);
const drum=(n,dt=0,v=.8)=>AU.drum.triggerAttackRelease(n,.3,vt(AU.drum,dt),v);
const metal=(n,dt=0,v=.7)=>AU.metal.triggerAttackRelease(n,.25,vt(AU.metal,dt),v);
const bell=(ns,dt=0,v=.4)=>AU.bell.triggerAttackRelease(ns,1.2,Tone.now()+dt,v);
const harp=(ns,gap=.09,v=.45,dt=0)=>ns.forEach((n,i)=>AU.harp.triggerAttackRelease(n,.7,Tone.now()+dt+i*gap,v));
// a burst of filtered noise whose filter slides from f0 to f1: the shuttle, a slash, a flame
function swish(voice,len,f0,f1,v=.6,dt=0,att=.004){const n=AU[voice],t=vt(n,dt);n.envelope.attack=att;
  n.f.frequency.cancelScheduledValues(t);n.f.frequency.setValueAtTime(f0,t);n.f.frequency.exponentialRampToValueAtTime(f1,t+len);n.triggerAttackRelease(len,t,v)}
const SFX_BOOK={
  tap:()=>wood('A5',0,.3,.03),
  pick:()=>pluck('E5'),
  cancel:()=>pluck('A3',0,.8),
  err:()=>{wood('D3',0,.7);wood('D3',.09,.55)},
  play:()=>{swish('whoosh',.2,500,2800,.5);wood('G3',.15,.75)},
  pull:()=>{const n=['A4','B4','D5','E5'][Math.floor(Math.random()*4)];pluck(n,0,.8);pluck(Tone.Frequency(n).transpose(7).toNote(),.07,.6)},
  spawn:()=>pluck('A5',0,.7),
  draw:()=>swish('whoosh',.06,2400,3600,.22),
  sweep:()=>swish('whoosh',.32,2200,500,.38),
  tick:()=>wood(tock++%2?'G5':'C6',0,.5,.02),
  hit:()=>{drum('E2',0,.7);swish('crunch',.08,1400,500,.45);swish('snip',.06,6000,3000,.5)},
  big:()=>{drum('A1',0,1);swish('crunch',.22,2000,300,.8);metal('C3',.01,.55);bell(['D3','A3'],.02,.25)},
  hurt:()=>{drum('C2',0,.9);swish('crunch',.14,700,200,.8)},
  knot:()=>{pluck('D5');pluck('A5',.02);harp(['D6'],0,.25,.06)},
  parry:()=>{metal('C4',0,.9);swish('snip',.035,7000,5000,.8);swish('snip',.035,7000,5000,.8,.08);pluck('E6',.04,.7)},
  block:()=>{wood('C3',0,.9,.08);drum('G2',.01,.4)},
  dodge:()=>swish('whoosh',.26,1100,4200,.36,0,.06),
  heal:()=>harp(['D5','F#5','A5'],.07,.38),
  poison:()=>{wood('A4',0,.18,.03);wood('E5',.07,.15,.03);wood('B4',.15,.12,.03)},
  fire:()=>{swish('fire',.5,300,3200,.8,0,.03);drum('D2',.02,.3)},
  ice:()=>{bell(['E6','B6'],0,.3);swish('snip',.04,8000,6000,.5,.03)},
  thunder:()=>{swish('crunch',.4,3000,200,.9);metal('G2',0,.6);drum('A1',.03,.7)},
  banner:()=>bell(['D5','A5'],0,.42),
  turn:()=>bell(['A4'],0,.28),
  coin:()=>bell(['B6','E7'],0,.22),
  buy:()=>{bell(['B6','E7'],0,.22);wood('E4',.05,.5)},
  sew:()=>{pluck('G5');swish('snip',.03,7000,5000,.6,.12);swish('snip',.03,7000,5000,.6,.2)},
  snip:()=>{swish('snip',.035,7000,4500,.8);swish('snip',.035,7000,4500,.8,.07)},
  page:()=>swish('whoosh',.42,300,1500,.24,0,.12),
  fall:()=>{harp(['A4','F4','D4','A3'],.06,.3);swish('whoosh',.9,1800,300,.3,0,.2)},
  win:()=>{harp(['D4','F#4','A4','D5','F#5','A5'],.11,.5);bell(['D6','A6'],.7,.35)},
  lose:()=>{harp(['A3','F3','D3'],.38,.45);drum('D1',.2,.5)},
  summit:()=>{harp(['D4','A4','D5','F#5','A5','D6','F#6','A6'],.13,.5);bell(['D5','A5','D6'],1.1,.4)}
};
const lastPlay={};
function SFX(name){
  if(SIM||!AU||SOUND.mode==='off')return;
  const now=performance.now();if(now-(lastPlay[name]||0)<45)return;lastPlay[name]=now;
  try{SFX_BOOK[name]?.()}catch(e){}
}

/* the music under it: a harp that picks notes from the mood's scale, over one held drone */
const MOODS_MUSIC={road:{bpm:58,root:'D2',scale:['D4','E4','F#4','A4','B4','D5','E5'],p:.42},
  battle:{bpm:76,root:'D2',scale:['D4','F4','G4','A4','C5','D5'],p:.36},
  boss:{bpm:64,root:'A1',scale:['A3','C4','D4','E4','F4','A4'],p:.32,toll:'A2'}};
let musicLoop=null,bar=0;
function musicTick(time){
  const M=SOUND.mode==='all'&&MOODS_MUSIC[SOUND.mood];if(!M)return;
  if(bar++%16===0&&M.toll)AU.toll.triggerAttackRelease(M.toll,2,time,.5);
  if(Math.random()>M.p)return;
  const n=M.scale[Math.floor(Math.random()*M.scale.length)];
  AU.lute.triggerAttackRelease(Math.random()<.18?[n,Tone.Frequency(n).transpose(-5).toNote()]:n,1.2,time,.35+Math.random()*.25);
}
function setMood(m){
  SOUND.mood=m;if(!AU)return;
  const M=SOUND.mode==='all'&&MOODS_MUSIC[m];
  if(!M){if(AU.droneOn)AU.drone.triggerRelease();AU.droneOn=null;return}
  Tone.getTransport().bpm.rampTo(M.bpm,2);
  if(AU.droneOn!==M.root){if(AU.droneOn)AU.drone.triggerRelease();AU.drone.triggerAttack(M.root,Tone.now()+.1,.6);AU.droneOn=M.root}
}
function applySound(){
  const [ic,lb]=SOUND_UI[SOUND.mode];$('soundBtn').innerHTML=SVG[ic]+`<span class="lb">${lb}</span>`;$('soundBtn').title=`声音：${lb}（全开 → 只开音效 → 静音）`;
  if(!AU)return;
  AU.master.mute=SOUND.mode==='off';setMood(SOUND.mood);
}
// browsers keep audio locked until the player touches the page
async function unlockAudio(){
  if(AU||!window.Tone)return;
  removeEventListener('pointerdown',unlockAudio,true);removeEventListener('keydown',unlockAudio,true);
  await Tone.start();
  AU=buildAudio();
  musicLoop=new Tone.Loop(musicTick,'4n').start(0);Tone.getTransport().start();
  applySound();
}
addEventListener('pointerdown',unlockAudio,true);addEventListener('keydown',unlockAudio,true);
$('soundBtn').addEventListener('click',()=>{SOUND.mode={all:'sfx',sfx:'off',off:'all'}[SOUND.mode];try{localStorage.setItem('cr-sound',SOUND.mode)}catch(e){}applySound();SFX('tap')});
// every button knocks the loom softly; picking a card from a page plucks a string
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled||b.id==='soundBtn'||b.closest('#hand'))return;SFX(b.classList.contains('card')?'pick':'tap')});
applySound();
