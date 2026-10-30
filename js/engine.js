/* The rules engine: runs and fights, the road between floors, dealing damage, playing cards, resolving beats, foresight. */
/* ---------- Run & fight setup ---------- */
let S;
function newRun(stage,cls,key){
  const C=CLASSES[cls];
  const run={stage,cls,maxhp:C.hp+5*stage,deck:GENERAL.concat(C.deck),foes:rollFoes(),gold:0,road:[],sewn:0,cut:0,knots:[],woven:[]};run.hp=run.maxhp;
  if(key)run.foes[stage]=key;
  startFight(run);
}
// key: an elite from the road (乱线) fought in place of the floor's foe, with 25% more life
function startFight(run,key){
  const F=FOE[key||run.foes[run.stage]];
  S={run,stage:run.stage,beat:1,turn:1,hp:run.hp??run.maxhp,maxhp:run.maxhp,ehp:F.hp,emax:F.hp,sand:CLASSES[run.cls].sand||3,debt:0,shield:0,barrier:0,quick:false,med:false,iceArmor:false,lastSpell:null,
     best:null,turnCards:[],parried:false,parriedPrev:false,foresight:false,rage:0,rageMax:10,combo:0,comboMax:8,poison:0,chain:0,frost:0,refund:0,cry:false,smoke:[],dmgLast:0,dmgThis:0,resThis:false,played:null,lastPlayed:null,drawN:5,
     deck:shuffle(run.deck.slice()),hand:[],discard:[],events:[],genUpTo:0,uid:1,over:null,log:[],pending:null,busy:false,resolving:null,hist:[],doneUpTo:0,E:F.init()};
  if(key){S.foeKey=key;S.emax=S.ehp=Math.round(F.hp*1.25)}
  if(hasK('black'))S.ehp=Math.round(S.emax*.9);
  if(hasK('hourglass'))S.sand++;if(hasK('spindle'))S.drawN=6;if(hasK('rustnail'))S.rage=3;if(hasK('venomsac'))S.poison=5;
  S.shuttle=hasK('shuttle');S.mute=hasK('mute');S.star=hasK('starthread');
  S.totem=hasW('shaman')?10:0;S.hp0=S.hp;S.wfx={};S.fate=run.stage<TOWER.length-1?{k:shuffle(Object.keys(FATES))[0],on:false}:null;
  gen(S.beat+11);
  F.turnStart?.call(F,true);
  draw(S.drawN);S.drawN=5;
  log(F.open);
}
// climb to the next floor with the HP this fight left you, taking card k (or none) and the gold thread the fight earned;
// with ui, the steps of ROAD for this gap are walked before the next fight (the balance AI calls it without, straight to the fight)
function nextFloor(k,ui){const run=S.run;if(k){run.deck.push(k);if(CARDS[k].a)(run.picks??=[]).push(k)}run.gold=(run.gold||0)+loot();run.rift=false;run.maxhp+=5;run.hp=hasK('black')?S.hp:Math.min(run.maxhp,S.hp+5+Math.round(run.maxhp*FLOOR_HEAL));
  payFate(run);run.stage++;if(!ui)return startFight(run);run.road=ROAD[run.stage-1].slice();walk(run)}
// gold thread for a win: a base that grows with the floor, one per 10 of the fight's best beat, two per parry
const loot=()=>Math.round((18+3*S.stage+Math.floor((S.best?.d||0)/10)+2*(S.parries||0)+(FL().key==='knight'?30:0))*(hasK('abacus')?1.3:1)*(S.run.rift&&!S.foeKey?2:1));

/* ---------- The road between floors: a queue of steps, so a longer journey is only a longer queue ---------- */
// run.road holds the steps still to walk before the next fight. A step is a THREADS key, or 'fork': FORK_N different threads
// drawn by weight from those whose ok(run) passes, and you walk the one you pick. A thread's go(run,done) runs its screen and
// calls done() to walk on; it may push more steps onto run.road first (an event chain, a detour), and nothing knows where a step sits
const ROAD=[['fork'],['fork'],['fork'],['fork'],['fork','fork'],['fork']];
const FORK_N=2;
// to: the strand's button; tg: the ribbon on its picture; peek(run): what the strand promises, under its name on the fork
const THREADS={
  shop:{n:'织坊',la:'THE WEAVERY',w:3,to:'进入织坊',tg:['花钱',''],d:'花金线买牌、给牌加绣、拆掉不想要的牌。',ok:()=>true,go:(run,done)=>showShop(run,done),
    peek:run=>['货架上四张牌，有时还挂着一枚线结',`加绣 ${sewPrice(run)} · 拆线 ${cutPrice(run)} · 缝补 ${PRICE.mend}`]},
  wheel:{n:'纺车',la:'THE SPINNING WHEEL',w:2,to:'走向纺车',tg:['休整','mo'],d:'歇一歇：回复 30% 生命，或者免费给一张牌加绣。',ok:()=>true,go:(run,done)=>showWheel(run,done),
    peek:run=>[wheelHeal(run)?`歇息：回复 ${wheelHeal(run)} 点生命`:'生命是满的，歇息没有用','或者织补：免费给一张牌加绣']},
  tale:{n:'线头',la:'A LOOSE THREAD',w:3,to:'拉一拉线头',tg:['未知','ind'],d:'一根垂下来的线头，拉一拉看会发生什么。',ok:run=>Object.values(TALES).some(t=>!t.ok||t.ok(run)),go:(run,done)=>showTale(run,done),
    peek:()=>['一件说不准的事：有得也有失','不想要的话，可以走开']},
  elite:{n:'乱线',la:'A TANGLED FOE',w:2,to:'迎战乱线',tg:['危险','red'],d:'下一层的另一只怪织错了，生命 +25%。打赢它挑一枚线结。',ok:run=>run.stage>=1&&TOWER[run.stage].length>1&&knotPool(run).length>0,
    go:run=>{startFight(run,shuffle(TOWER[run.stage].filter(k=>k!==run.foes[run.stage]))[0]);render();showRules(true);banner('乱线',FL().name,true)},
    peek:run=>[`对手：${TOWER[run.stage].filter(k=>k!==run.foes[run.stage]).map(k=>FOE[k].name).join(' 或 ')}`,'打赢了：金线和一枚线结；不回血，不拿牌']},
  cache:{n:'宝线',la:'A GOLDEN KNOT',w:1,to:'取走宝线',tg:['奖励','gd'],d:'一束打好的金色线结，挑一枚带走。',ok:run=>run.stage>=2&&knotPool(run).length>0,go:(run,done)=>showKnotPick(run,done),
    peek:run=>['三枚线结里挑一枚，整局都在',`还有 ${knotPool(run).length} 枚你没拿过`]},
  spool:{n:'金线轴',la:'A SPOOL OF GOLD',w:1,to:'捡起金线轴',tg:['奖励','gd'],d:'路边一卷没人要的金线。',ok:()=>true,
    go:(run,done)=>{const g=spoolGold(run);run.gold+=g;showNote(run,'金线轴',`你收起了 <b>${g}</b> 根金线。`,done,'spool')},
    peek:run=>[`金线 +${spoolGold(run)}`,'捡起来就上路']}
};
const spoolGold=run=>30+5*run.stage,wheelHeal=run=>Math.min(run.maxhp-run.hp,Math.round(run.maxhp*.3));
function walk(run){
  const step=run.road.shift();
  if(!step){startFight(run);render();showRules(true);return}
  if(step==='fork')return showFork(run,()=>walk(run));
  THREADS[step].go(run,()=>walk(run));
}
function forkOptions(run){
  const left=Object.keys(THREADS).filter(k=>THREADS[k].ok(run)),out=[];
  while(out.length<FORK_N&&left.length){let r=Math.random()*left.reduce((a,k)=>a+THREADS[k].w,0);
    const i=left.findIndex(k=>(r-=THREADS[k].w)<0);out.push(left.splice(i<0?0:i,1)[0])}
  return out;
}
// the reward offer: two class cards and one shared time card. From the third pick on, one of the class cards comes from
// the archetype you have taken the most cards of (ties go to the latest), the other from anywhere in the pool.
// Keystones only show up from the third pick on, and never two in one offer
function rewardPool(run,F){
  const K=CLASSES[run.cls],picks=run.picks||[],cls=[],late=picks.length>=2;
  const pool=K.pool.filter(k=>late||!CARDS[k].ks);
  if(late){const n={};picks.forEach((k,i)=>{const a=CARDS[k].a;n[a]=(n[a]||0)+1+i/100});
    const top=Object.keys(n).sort((a,b)=>n[b]-n[a])[0];cls.push(shuffle(pool.filter(k=>CARDS[k].a===top))[0])}
  for(const k of shuffle(pool.slice())){if(cls.length>=2)break;if(cls.includes(k)||(CARDS[k].ks&&cls.some(c=>CARDS[c].ks)))continue;cls.push(k)}
  return cls.concat(shuffle(F.reward.slice()).slice(0,1));
}
const healTo=()=>hasK('black')?S.hp:Math.min(S.maxhp+5,S.hp+5+Math.round((S.maxhp+5)*FLOOR_HEAL));
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function draw(n){for(let i=0;i<n;i++){if(!S.deck.length){if(!S.discard.length)return;S.deck=shuffle(S.discard);S.discard=[]}S.hand.push(S.deck.pop())}}
function ev(o){if(S.edge&&o.dmg&&(o.side==='h'||o.side==='c'))o.dmg+=S.edge;if(o.fx&&hasK('whetstone')&&!S.whet){S.whet=true;o.dmg+=6}o.id=S.uid++;S.events.push(o);return o}
function gen(h){
  const F=FL();
  for(let b=S.genUpTo+1;b<=h;b++){
    const A=CL().atk;if(b%A.every===0)ev({beat:b,side:'h',dmg:A.dmg});
    F.beat(b);
  }
  S.genUpTo=h;F.fill?.call(F,h);
}
const baseView=()=>FL().view?FL().view():8;
const W=()=>baseView()+(S.foresight?4:0)+(hasK('spyglass')?2:0);
const at=(b,side)=>S.events.filter(e=>e.beat===b&&(!side||e.side===side));
// backstab: the assassin hits a beat where no enemy attack lands on them
const openBeat=b=>!atkE(b).length||at(b,'d').length>0;
function heroTotal(hs){
  if(!hs.length)return 0;const b=hs[0].beat;
  let x=hs.reduce((a,e)=>a+e.dmg+(S.cry&&b<S.beat+3?4:0),0);
  if(S.blood&&S.hp*2<S.maxhp)x+=5*hs.length;
  x+=((hasW('wolf')&&S.hp*10<S.maxhp*3?3:0)+(hasW('puppet')?S.windUp||0:0)+(hasW('golem')?S.heat||0:0))*hs.length;
  if(S.run.cls==='rogue'){x+=Math.floor(S.combo/2);if(openBeat(b))x+=1}
  const ks=at(b,'k');if(ks.length)x*=Math.max(...ks.map(k=>k.v||2));
  return Math.round(x*mult(hs.length));
}

function log(msg){S.log.unshift({t:S.beat,msg});S.log=S.log.slice(0,40)}

function restart(el,cls,ms){el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);if(ms)setTimeout(()=>el.classList.remove(cls),ms)}
function lunge(side){const el=$(side==='hero'?'heroArt':'enemyArt');el.classList.add('lunge');setTimeout(()=>el.classList.remove('lunge'),180)}
function banner(title,sub,red){if(FX)FX.push({who:'b',text:title});if(SIM)return;const b=$('banner');b.querySelector('b').textContent=title;b.querySelector('span').textContent=sub||'';b.classList.toggle('red',!!red);restart(b,'show',1650)}
function flt(who,text,cls){if(FX)FX.push({who,text,cls});if(SIM)return;const box=$(who==='hero'?'heroFloats':'enemyFloats');const d=document.createElement('div');d.className='flt '+cls;d.textContent=text;d.style.left=(38+Math.random()*24)+'%';box.appendChild(d);setTimeout(()=>d.remove(),1400);
  if(cls==='hurt'||cls==='big'||cls==='dmg'){restart($(who==='hero'?'heroArt':'enemyArt'),'shake',400);lunge(who==='hero'?'enemy':'hero');if(cls==='big')restart($('flash'),'on',500)}}

// o.src: 'atk' (a hero attack beat), 'ghost' (残影 counter), 'unity'; o.res: the hit was a resonance
function dealEnemy(raw,label,o={}){
  const F=FL();
  if(S.edge&&raw>0)raw+=S.edge;
  if(hasW('knight')&&o.src==='ghost'&&raw>0)raw+=4;
  if(hasW('spider')&&o.src==='atk'&&raw>0&&!S.webbed){S.webbed=true;addPoison(2);wvFx('spider',o.beat)}
  let x=F.mod&&o.src!=='true'?F.mod(raw,o):raw,note='';
  if(x<raw&&!(o.beat&&at(o.beat,'e').some(e=>e.sh))){flt('enemy',F.modNote,'info');note=`（${F.modNote}）`}
  if(F.take)x=F.take(x,o,raw);
  if(S.venom&&o.src==='atk'&&raw>0){const k=2*(o.n||1);addPoison(k);flt('enemy',`毒 +${k}`,'info')}
  if(S.shield>0&&x>0){const a=Math.min(S.shield,x);S.shield-=a;x-=a;flt('enemy',`帷幕 −${a}`,'info');note+=`（沙之帷幕吸收 ${a}）`}
  S.ehp=Math.max(0,S.ehp-x);
  if(hasW('slime')&&x>=15&&!S.split&&S.ehp>0){S.split=true;draw(1);wvFx('slime',o.beat)}
  if(x>0)flt('enemy',String(x),x>=25?'big':'dmg');
  log(`${label||'攻击'}造成 ${x} 点伤害${note}。`);
  F.onDealt?.call(F,x,o);
  if(S.ehp<=0)S.over='win';
}
function healEnemy(x,label){
  const h=Math.min(x,S.emax-S.ehp);S.ehp+=h;flt('enemy','+'+h,'heal');log(`${label}：${FL().lane}回复了 ${h} 点生命。`);
}
function dealHero(x,es,opt={}){
  if(x>0&&hasW('banshee')&&x>15){x=15;wvFx('banshee')}
  if(x>0&&hasW('beetle')&&x<4){wvFx('beetle');return}
  if(x>0&&hasW('gargoyle')&&S.resolving&&!at(S.resolving,'h').length){x=Math.max(0,x-2);wvFx('gargoyle');if(!x)return}
  if(x>0&&S.totem>0){const a=Math.min(S.totem,x);S.totem-=a;x-=a;wvFx('shaman');log(`图腾替你挡下 ${a} 点${S.totem?'':'，碎了'}。`);if(!x)return}
  if(x>0&&hasK('rope')&&!S.roped&&S.hp*10<S.maxhp*3){S.roped=true;x=Math.ceil(x/2);flt('hero','打结绳','info');log(`打结绳：这一下减半到 ${x}。`)}
  if(S.iceArmor){x=Math.max(0,x-3);if(!x){flt('hero','冰甲','info');return}}
  S.hp=Math.max(0,S.hp-x);S.dmgThis+=x;flt('hero','-'+x,'hurt');if(!opt.thorn)gainRage(2);
  if(x>0&&hasW('golem'))S.heat=0;
  if(x>0&&hasW('treant')&&!opt.thorn&&S.ehp>0){wvFx('treant');dealEnemy(2,'荆棘',{src:'true'})}
  if(S.hp<=0&&hasW('skeleton')&&!S.rebuilt){S.rebuilt=true;S.hp=Math.min(S.maxhp,11);wvFx('skeleton');log('重组：骨头拼了回去，你带着 11 点生命站起来。')}
  if(S.hp<=0&&S.undying){S.undying=false;S.hp=Math.min(S.maxhp,16);flt('hero','不屈','heal');log('不屈：你在倒下前站稳了，回复到 16 点生命。');banner('不屈','UNDYING')}
  // a hit inside a spell's window breaks the cast (thorns don't count)
  if(S.run.cls==='mage'&&!opt.thorn&&S.resolving){const r=S.resolving,sp=S.events.filter(e=>e.side==='c'&&e.from<=r&&e.beat>=r);
    if(sp.length){if(S.barrier){S.barrier=0;log('法力屏障护住了吟唱。');flt('hero','屏障','info')}else if(S.mute){S.mute=false;log('静音织物护住了吟唱。');flt('hero','静音织物','info')}else{S.events=S.events.filter(e=>!sp.includes(e));log(`吟唱被打断：${sp.map(e=>e.n).join('、')}作废。`);flt('hero','打断！','info');
      if(S.flow){const back=sp.reduce((a,e)=>a+(e.c||0),0);if(back){S.refund+=back;log(`法力回流：下回合返还 ${back} 粒时之砂。`)}}}}}
  FL().onHeroHit?.call(FL(),es,x);
  if(S.hp<=0)S.over='lose';
}
function delayed(src){const F=FL();F.onDelay?.call(F,src);
  if(src==='stagger'||S.over)return;
  if(hasW('puppet')&&(S.windUp||0)<5)S.windUp=(S.windUp||0)+1;
  if(S.rime){dealEnemy(4,'寒霜印记',{src:'spell',el:'冰'});if(S.over)return}
  if(S.run.cls==='mage')addFrost(1)}
// at FROST stacks the next attack that is not time-locked freezes solid and never lands
function addFrost(n){S.frost+=n;flt('enemy',`霜冻 ${Math.min(S.frost,FROST)}/${FROST}`,'info');
  while(S.frost>=FROST){const e=foeE(e=>!e.locked&&!e.na&&e.beat>cur()).sort((x,y)=>x.beat-y.beat)[0];if(!e)break;
    S.frost-=FROST;S.events=S.events.filter(x=>x!==e);log(`冻结：${FL().lane}第 ${roman(e.beat)} 拍的${e.label}被冻碎了。`);banner('冻结','FROZEN');
    if(S.zero&&!S.over){const b=cur();dealEnemy(e.dmg*2,'绝对零度',{src:'spell',el:'冰',beat:b});if(!S.over)react('冰',b)}
    if(S.over)break}}

function apply(key,target){
  const lo=S.beat,hi=S.beat+W()-1;
  const find=id=>S.events.find(e=>e.id===id);
  if(CARDS[key].cast){
    const C=CARDS[key],L=castLen(C),from=target-L+1;
    if(from<lo)return `吟唱要 ${L} 拍，往后选一拍`;if(target>hi)return '那一拍不在视野内';
    const k=S.surge?2:1;
    // 三相咒 goes off over its last three beats, fire then ice then lightning; the whole window is one cast
    const ff=S.ff||0;
    if(C.tri){if(target-2<lo)return '三相咒要 3 拍，往后选一拍';['火','冰','雷'].forEach((el,j)=>ev({beat:target-2+j,side:'c',from:Math.min(from,target-2),el,dmg:C.dmg*k+(el==='火'?ff:0),hits:1,n:C.n+'·'+el,c:j?0:C.c,len:L}))}
    else ev({beat:target,side:'c',from,el:C.el,dmg:C.dmg*k+(C.el==='火'?ff:0),hits:C.hits||1,frz:C.frz,n:C.n,c:C.c,len:L});
    if(ff&&(C.tri||C.el==='火')){S.ff=0;log(`霜火：这一发火焰 +${ff}。`)}
    S.quick=false;S.surge=false;
    log(`${C.n}：从第 ${roman(Math.min(from,C.tri?target-2:from))} 拍开始吟唱，${C.tri?`第 ${roman(target-2)}~${roman(target)} 拍依次释放火、冰、雷`:`第 ${roman(target)} 拍释放`}${k>1?'（超载，伤害翻倍）':''}。`);return null;
  }
  switch(key){
    case 'swift':{const e=find(target);if(e.fx)return '重击不能被挪动';if(e.beat-1<lo)return '它已经在最早的一拍了';e.beat--;log(`迅步：攻击提前到第 ${roman(e.beat)} 拍。`);break}
    case 'slow':{const e=find(target);if(e.locked)return '这个行动被时间锁定，无法延后';e.beat++;log(`迟滞：${e.label}延后到第 ${roman(e.beat)} 拍。`);delayed('card');break}
    case 'swap':{const b=target;if(b+1>hi)return '下一拍不在视野内';const a=at(b),c=at(b+1);if(a.concat(c).some(e=>e.locked))return '锁定的行动在这两拍里，无法互换';
      let d=false;a.forEach(e=>{e.beat=b+1;if(e.from)e.from++;if(e.side==='e')d=true});c.forEach(e=>{e.beat=b;if(e.from)e.from=Math.max(lo,e.from-1)});log(`错位：第 ${roman(b)} 拍与第 ${roman(b+1)} 拍互换。`);if(d)delayed('card');break}
    case 'echo':{const e=find(target);ev({beat:e.beat,side:'h',dmg:e.dmg,ch:e.ch});log(`回响：第 ${roman(e.beat)} 拍多了一次 ${e.dmg} 点的攻击。`);break}
    case 'gather':{const b=target;if(b>S.beat+3)return '只能选本回合起 4 拍内的一拍';const hs=S.events.filter(e=>e.side==='h'&&!e.fx&&e.beat>=lo&&e.beat<=S.beat+3);if(!hs.length)return '这 4 拍内没有你的攻击';hs.forEach(e=>e.beat=b);log(`收束：${hs.length} 次攻击汇聚于第 ${roman(b)} 拍。`);break}
    case 'charge':{const e=find(target);if(e.fx)return '重击不能被挪动';e.beat+=2;e.dmg+=8;e.ch=true;log(`蓄时：攻击延后到第 ${roman(e.beat)} 拍，伤害升至 ${e.dmg}。`);break}
    case 'stasis':{const es=foeE(e=>!e.locked&&e.beat>=lo&&e.beat<=S.beat+2);if(!es.length)return '本回合没有可以延后的敌人行动';es.forEach(e=>e.beat++);log(`静滞领域：${es.length} 个敌人行动延后 1 拍。`);for(const e of es){if(S.over)break;delayed('card')}break}
    case 'haste':{let n=0;for(let b=lo;b<=S.beat+3;b++){if(!at(b,'h').length){ev({beat:b,side:'h',dmg:6});n++}}if(!n)return '这 4 拍每一拍都已经有攻击了';log(`疾时：补上了 ${n} 次攻击。`);break}
    case 'ghost':{if(at(target,'g').length)return '这一拍已经有残影了';ev({beat:target,side:'g'});log(`残影：留在第 ${roman(target)} 拍。`);break}
    case 'rewind':{if(S.dmgLast<=0)return '上回合没有受到伤害';const h=Math.min(S.dmgLast,S.maxhp-S.hp);S.hp+=h;S.dmgLast=0;flt('hero','+'+h,'heal');log(`回溯：恢复 ${h} 点生命。`);break}
    case 'foresee':{draw(2);S.foresight=true;log('预知：看见了更远的时间。');break}
    case 'stop':{const es=foeE(e=>e.beat>=lo);es.forEach(e=>e.beat+=2);log(`时停：${FL().lane}的时间整体冻结 2 拍。`);flt('enemy','时停','info');banner('时停','TEMPUS · STOP');for(const e of es.filter(e=>!e.na)){if(S.over)break;delayed('stop')}break}
    case 'unity':{const hs=S.events.filter(e=>e.side==='h'&&e.beat>=lo&&e.beat<=hi);if(!hs.length)return '视野内没有你的攻击';const sum=hs.reduce((a,e)=>a+e.dmg,0);const tot=Math.round(sum*(1+.5*(hs.length-1)));S.events=S.events.filter(e=>!hs.includes(e));if(hs.length>=2)S.resThis=true;banner('万象归一',`${hs.length} 次攻击同时落下`);dealEnemy(tot,`万象归一（${hs.length} 次攻击）`,{src:'unity',res:hs.length>=2});break}
    case 'paradox':{S.sand+=2;S.debt+=3;log('悖论：借来 2 粒时之砂，下回合要还 3 粒。');break}
    case 'barrier':{if(S.barrier)return '本回合已经有屏障了';S.barrier=1;log('法力屏障：本回合的吟唱能挨一下。');break}
    case 'quick':{if(S.quick)return '已经准备好瞬发了';S.quick=true;log('瞬发：下一张法术吟唱 −2 拍。');break}
    case 'meditate':{const e=S.events.filter(e=>e.side==='h'&&!e.fx&&e.beat>=lo).sort((a,b)=>a.beat-b.beat)[0];if(e)S.events=S.events.filter(x=>x!==e);S.med=true;log(`冥想：${e?`放弃第 ${roman(e.beat)} 拍的攻击，`:''}下回合 +2 时之砂。`);break}
    case 'overcharge':{if(S.surge)return '已经准备好超载了';S.surge=true;log('超载：下一张法术吟唱 +2 拍，伤害翻倍。');break}
    case 'manaflow':{if(S.flow)return '本回合已经有法力回流了';S.flow=true;log('法力回流：本回合吟唱被打断，下回合返还时之砂。');break}
    case 'prism':{if(S.prism)return '本回合已经有棱镜了';S.prism=true;log('棱镜：本回合隔 2 拍的法术也能反应，连锁更强。');break}
    case 'nova':{addFrost(2);log('霜冻新星：霜冻 +2。');break}
    case 'rime':{if(S.rime)return '寒霜印记已经生效了';S.rime=true;log('寒霜印记：敌人每被推迟一次，受到 4 点冰伤。');break}
    case 'frostarmor':{if(S.iceArmor)return '本回合已经有冰甲了';S.iceArmor=true;log('冰甲：本回合每次受伤 −3。');break}
    case 'shield':{if(at(target,'w').length)return '这一拍已经举盾了';ev({beat:target,side:'w'});log(`举盾：第 ${roman(target)} 拍架起了盾。`);break}
    case 'bash':{if(!at(target,'w').length)return '这一拍没有举盾';const d=Math.max(4,Math.min(12,atkE(target).reduce((a,e)=>a+e.dmg,0)));ev({beat:target,side:'h',dmg:d});log(`盾击：第 ${roman(target)} 拍追加一次 ${d} 点攻击。`);break}
    case 'taunt':{const e=find(target);if(e.locked)return '这个行动被时间锁定，无法挪动';if(e.beat-1<lo)return '它已经在最早的一拍了';e.beat--;log(`挑衅：${e.label}提前到第 ${roman(e.beat)} 拍。`);break}
    case 'cleave':{ev({beat:target,side:'h',dmg:20,fx:true});log(`裂地斩：第 ${roman(target)} 拍放下一次 20 点重击。`);break}
    case 'warcry':{if(S.cry)return '本回合已经战吼过了';S.cry=true;log('战吼：本回合 3 拍内每次攻击 +4。');flt('hero','战吼','info');break}
    case 'backwater':{if(S.hp*2>S.maxhp)return '生命还没低于一半';const e=S.events.filter(e=>e.side==='h'&&e.beat>=lo).sort((a,b)=>a.beat-b.beat)[0];if(!e)return '视野内没有你的攻击';e.dmg*=2;e.ch=true;log(`背水：第 ${roman(e.beat)} 拍的攻击翻倍到 ${e.dmg}。`);break}
    case 'ironwall':{const e=foeE(e=>!e.na&&e.dmg>0&&e.beat>=lo&&e.beat<=hi).sort((a,b)=>b.dmg-a.dmg)[0];if(!e)return '视野内没有敌人的攻击';e.dmg=Math.ceil(e.dmg/2);S.rage=Math.min(S.rageMax,S.rage+5);log(`铁壁：第 ${roman(e.beat)} 拍的${e.label}减半到 ${e.dmg}，怒气 +5。`);break}
    case 'riposte':{if(S.ripo)return '本回合已经摆好架势了';S.ripo=true;log('反击架势：本回合盾每挡下 1 点，反击 2 点。');break}
    case 'towershield':{if(at(target,'w').some(w=>w.v))return '这一拍已经竖起塔盾了';ev({beat:target,side:'w',v:12});log(`塔盾：第 ${roman(target)} 拍竖起了塔盾。`);break}
    case 'lure':{const b=target;if(b>S.beat+3)return '只能选本回合起 4 拍内的一拍';const es=foeE(e=>!e.locked&&!e.na&&e.beat>=lo&&e.beat<=S.beat+3&&e.beat!==b);if(!es.length)return '这 4 拍内没有能挪动的敌人攻击';
      const later=es.some(e=>e.beat<b);es.forEach(e=>e.beat=b);log(`引战：${es.length} 次攻击被引到第 ${roman(b)} 拍。`);if(later)delayed('card');break}
    case 'wrath':{S.rageMax=20;log('狂暴之心：本场怒气上限变为 20。');flt('hero','狂暴','info');break}
    case 'skybreaker':{ev({beat:target,side:'h',dmg:38,fx:true});log(`天崩：第 ${roman(target)} 拍放下一次 38 点重击。`);break}
    case 'whet':{gainRage(4);draw(1);log('磨刃：怒气 +4，抽 1 张牌。');break}
    case 'bloodlust':{S.blood=true;log('血怒：生命不到一半时，你的每次攻击 +5。');break}
    case 'gamble':{if(S.hp<=1)return '生命已经见底了';const l=Math.min(6,S.hp-1);S.hp-=l;S.dmgThis+=l;flt('hero','-'+l,'hurt');gainRage(5);log(`搏命：失去 ${l} 点生命，怒气 +5。`);break}
    case 'drain':{if(S.drain)return '本回合已经饮血了';S.drain=true;log('饮血：本回合弹反时回复造成伤害的一半。');break}
    case 'undying':{S.undying=true;log('不屈：本场第一次受到致命伤时会站住。');break}
    case 'frenzy':{const d=S.rage*3;S.rage=0;banner('狂怒',`${d} 点伤害`);dealEnemy(d,'狂怒',{src:'unity'});break}
    case 'dodge':{if(at(target,'d').length)return '这一拍已经闪身了';ev({beat:target,side:'d'});log(`闪身：第 ${roman(target)} 拍会躲开敌人的攻击。`);break}
    case 'poison':{addPoison(4);log(`淬毒：敌人中毒 ${S.poison} 层。`);flt('enemy','中毒','info');break}
    case 'venomblade':{if(S.venom)return '本回合刀上已经淬了毒';S.venom=true;log('毒刃：本回合每命中一拍，敌人 +2 层毒。');break}
    case 'corrode':{if(!S.poison)return '敌人还没有中毒';addPoison(S.poison);log(`蚀骨：毒翻倍到 ${S.poison} 层。`);flt('enemy','蚀骨','info');break}
    case 'detonate':{if(!S.poison)return '敌人还没有中毒';const d=S.poison*2;banner('毒爆',`${S.poison} 层毒`);dealEnemy(d,`毒爆（${S.poison} 层）`,{src:'poison'});break}
    case 'momentum':{S.comboMax=12;S.keep=true;log('余势：连击上限 12，中断时只掉一半。');break}
    case 'vanish':{let n=0;for(let b=S.beat;b<S.beat+3;b++)if(b>S.doneUpTo&&!at(b,'d').length){ev({beat:b,side:'d'});n++}if(!n)return '本回合每一拍都已经闪身了';log('影遁：本回合 3 拍你都会闪开。');break}
    case 'flurry':{for(let b=S.beat;b<S.beat+3;b++)if(b>S.doneUpTo)ev({beat:b,side:'h',dmg:2});log('乱刃：本回合每拍多一次 2 点攻击。');break}
    case 'ready':{addCombo(2);log(`蓄势：连击升到 ${S.combo}。`);flt('hero','连击 +2','info');break}
    case 'converge':{const b=target;if(!at(b,'k').length)return '选一个标记过的拍';const hs=S.events.filter(e=>e.side==='h'&&!e.fx&&e.beat>=lo&&e.beat<=S.beat+3&&e.beat!==b);if(!hs.length)return '这 4 拍内没有能挪动的攻击';
      hs.forEach(e=>e.beat=b);log(`聚刃：${hs.length} 次攻击汇聚到标记的第 ${roman(b)} 拍。`);break}
    case 'expose':{if(at(target,'k').some(k=>k.v))return '这一拍已经有破绽了';ev({beat:target,side:'k',v:3});log(`破绽：第 ${roman(target)} 拍伤害 ×3。`);break}
    case 'clone':{ev({beat:target,side:'h',dmg:4});ev({beat:target,side:'h',dmg:4});log(`分影：第 ${roman(target)} 拍插入两次 4 点攻击。`);break}
    case 'shadow':{ev({beat:target,side:'h',dmg:6});log(`影袭：第 ${roman(target)} 拍插入一次 6 点攻击。`);break}
    case 'finisher':{if(!S.combo)return '还没有连击';const d=S.combo*4,n=S.combo;S.combo=0;banner('绝杀',`${n} 层连击`);dealEnemy(d,`绝杀（${n} 层）`,{src:'unity'});break}
    case 'smoke':{S.smoke=[S.beat,S.beat+1,S.beat+2];log('烟幕：本回合敌人的攻击伤害减半。');break}
    case 'boomerang':{if(target+2>hi)return '回程那一拍不在视野内';ev({beat:target,side:'h',dmg:5});ev({beat:target+2,side:'h',dmg:5});log(`回旋刃：第 ${roman(target)} 拍和第 ${roman(target+2)} 拍各 5 点。`);break}
    case 'mark':{if(at(target,'k').length)return '这一拍已经标记过了';ev({beat:target,side:'k'});log(`标记：第 ${roman(target)} 拍伤害翻倍。`);break}
    case 'steadfast':{S.steady=true;log('不动如山：你的盾挡下攻击后会留到下一拍。');flt('hero','不动如山','info');break}
    case 'breaker':{S.breaker=true;log('破军：你的重击会直接砸掉同一拍的敌人攻击。');flt('hero','破军','info');break}
    case 'quake':{ev({beat:target,side:'h',dmg:12,fx:true,quake:true});log(`震地：第 ${roman(target)} 拍放下一次 12 点重击。`);break}
    case 'bloodwar':{S.bloodwar=true;log('血战：拼刀输了也照样打出去。');flt('hero','血战','info');break}
    case 'grudge':{if(S.dmgLast<=0)return '上回合没有受到伤害';const d=Math.min(30,S.dmgLast);ev({beat:target,side:'h',dmg:d});log(`怨报：第 ${roman(target)} 拍放下一次 ${d} 点攻击。`);break}
    case 'shift':{const e=find(target);if(e.locked)return '这个行动被时间锁定，无法挪动';if(e.na)return '选敌人的一次攻击';const to=foeE(x=>!x.na&&x.beat>e.beat&&x.beat<=hi).sort((a,b)=>a.beat-b.beat)[0];if(!to)return '它后面视野内没有别的敌人攻击';
      e.beat=to.beat;log(`换影：${e.label}挪到第 ${roman(e.beat)} 拍，和${to.label}叠在一起。`);delayed('card');break}
    case 'zanshin':{S.zanshin=true;log('残心：每闪开一次攻击，连击 +1 并反刺 3 点。');flt('hero','残心','info');break}
    case 'toxin':{if(S.toxin)return '本回合已经用过毒发了';S.toxin=true;log('毒发：本回合连击每 +1，敌人 +1 层毒。');break}
    case 'plague':{S.plague=true;log('瘟疫：毒上限 30，毒每回合结束减半，不再每拍减层。');flt('enemy','瘟疫','info');break}
    case 'omen':{S.omen=true;log('死兆：打出伤害的标记会移到下一拍。');flt('hero','死兆','info');break}
    case 'tide':{S.tide=true;log('元素潮汐：每次元素反应，下回合 +1 时之砂。');flt('hero','潮汐','info');break}
    case 'linger':{S.linger=true;log('余韵：长吟唱的法术释放后，下一拍再响一次。');flt('hero','余韵','info');break}
    case 'zero':{S.zero=true;log('绝对零度：冻碎的攻击会反噬敌人。');flt('enemy','绝对零度','info');break}
    case 'frostfire':{if(!S.frost)return '还没有霜冻';const n=S.frost;S.frost=0;S.ff=(S.ff||0)+6*n;log(`霜火：消耗 ${n} 层霜冻，下一张火焰法术 +${S.ff}。`);flt('hero','霜火','info');break}
    case 'assassinate':{if(FL().boss){dealEnemy(40,'暗杀',{src:'true'});break}if(S.ehp*4>S.emax)return '敌人生命还没低于 25%';banner('暗杀','ASSASSINATE');dealEnemy(S.ehp,'暗杀',{src:'true'});break}
  }
  return null;
}

function flyCard(i){
  const el=document.querySelector(`.card[data-i="${i}"]`);if(!el)return;
  if(CALM)return;
  const r=el.getBoundingClientRect();const c=el.cloneNode(true);c.classList.add('flying');c.classList.remove('sel');c.disabled=true;
  c.style.cssText=`position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;margin:0;z-index:30`;
  document.body.appendChild(c);
  gsap.to(c,{y:-180,scale:.55,rotation:-8,opacity:0,duration:.5,ease:'power2.in',onComplete:()=>c.remove()});
}
// everything a card does to the state, with no screen effects; the real play and the preview both go through here
function commit(i,target){
  const key=S.hand[i],C=CARDS[key],cost=costOf(C);
  if(cost>S.sand)return '时之砂不足';
  if(C.r&&S.rage<C.r)return '怒气不足';
  const was=new Map(S.events.map(e=>[e.id,e.beat])),e0=S.ehp;
  S.edge=C.st==='edge'?4:0;const err=apply(C.base||key,target);S.edge=0;if(err)return err;
  for(const e of S.events)if(was.get(e.id)!==e.beat)(e.by??=[]).push(C.n);
  if(!C.tg&&!C.ks)S.turnCards.push(C.n);
  if(e0-S.ehp>(S.best?.d||0))S.best={d:e0-S.ehp,cards:[C.n]};
  S.sand-=cost;if(cost<C.c)S.shuttle=false;if(C.r&&!C.ra)S.rage-=C.r;S.hand.splice(i,1);
  if(!C.x)(C.st==='loop'?S.deck:S.discard).push(key);
  if(!S.played||C.c>=S.played.c)S.played={t:C.t,c:C.c};
  return null;
}
function playCard(i,target){
  const before=chipPos();
  const err=commit(i,target);
  if(err){setHint(err);return}
  flyCard(i);
  S.pending=null;render();pullThreads(before);
  if(S.over)setTimeout(showEnd,700);
}
let hintMsg='';function setHint(m){hintMsg=m;render();setTimeout(()=>{if(hintMsg===m){hintMsg='';render()}},2200)}

/* ---------- Foresight: the preview runs the real rules on a copy of the state ---------- */
// SIM silences the screen (floats, banners); FX collects the floats of the beat being stepped so the board can name what happened
let SIM=false,FX=null;
function sim(st,fn){
  const real=S;S=structuredClone(st);SIM=true;let out,res;
  try{out=fn()}finally{res=S;S=real;SIM=false}
  return {st:res,out};
}
function stepBeat(b){
  const r={b,hp0:S.hp,ehp0:S.ehp,es:atkE(b).map(e=>({l:e.label,d:e.dmg})),st:at(b,'e').filter(e=>e.na).map(e=>e.label),fx:[]};
  const keep=FX;FX=r.fx;S.resolving=b;
  const by=[...new Set(at(b).flatMap(e=>e.by||[]).concat(S.turnCards))];
  try{resolveBeat(b)}finally{FX=keep}
  S.doneUpTo=b;r.took=r.hp0-S.hp;r.net=r.ehp0-S.ehp;
  if(r.net>(S.best?.d||0))S.best={d:r.net,b,cards:by};r.hp=S.hp;r.ehp=S.ehp;r.over=S.over;
  return r;
}
// the rest of this turn's three beats plus the end-of-turn effects, exactly as endTurn runs them
function runBeats(){
  const recs=[];
  for(let b=S.doneUpTo+1;b<S.beat+3;b++){recs.push(stepBeat(b));if(S.over)break}
  S.resolving=null;
  if(!S.over)FL().turnEnd?.call(FL());
  return recs;
}
function forecast(i,t){
  const base=sim(S,runBeats);
  if(i==null)return {base};
  const pre=sim(S,()=>commit(i,t));
  if(pre.out)return {base,err:pre.out,i,t};
  return {base,pre:pre.st,alt:sim(pre.st,runBeats),i,t,key:S.hand[i]};
}
// a click on beat b: for cards that move something, b is where it should end up (a click on the chip itself picks that chip)
const SRC={swift:1,charge:-2,echo:0,slow:-1,taunt:1};
function resolveTarget(i,slot,chip){
  const key=S.hand[i],C=CARDS[key],tg=C.tg,b=+slot.dataset.b;
  if(tg==='h'||tg==='e'){
    if(chip&&chip.classList.contains(tg)&&S.events.some(e=>e.id===+chip.dataset.id))return {t:+chip.dataset.id,b};
    const src=b+(SRC[key]??0),all=at(src,tg),ok=all.filter(e=>tg==='h'?!e.fx:!e.locked);
    if(ok[0])return {t:ok[0].id,b};
    if(all[0])return {err:tg==='h'?'重击不能被挪动':'这个行动被时间锁定',b};
    return {err:{swift:`第 ${roman(src)} 拍没有能提前到这里的攻击`,charge:`第 ${roman(src)} 拍没有能蓄时到这里的攻击`,echo:'这一拍没有你的攻击',slow:`第 ${roman(src)} 拍没有能延后到这里的敌人行动`,taunt:`第 ${roman(src)} 拍没有能拉到这里的敌人行动`}[key]||'这里没有可选的行动',b};
  }
  return {t:b,b};
}
function resolveBeat(b){
  const F=FL();
  let hs=at(b,'h');let es=atkE(b);const g=at(b,'g').length>0,dodge=at(b,'d').length>0,shield=at(b,'w').length>0;
  if(at(b,'m').length&&hs.length){flt('hero','镜影 · 落空','info');log(`第 ${roman(b)} 拍：你的攻击被镜影吞没。`);hs=[];F.onMirror?.call(F)}
  // 破军: a heavy hit smashes the unlocked attacks on its beat before they can clash
  if(S.breaker&&hs.some(h=>h.fx)){const sm=atkE(b).filter(e=>!e.locked);if(sm.length){S.events=S.events.filter(e=>!sm.includes(e));es=atkE(b);gainRage(2*sm.length);flt('enemy','破招','info');log(`第 ${roman(b)} 拍：重击砸掉了${sm.map(e=>e.label).join('、')}。`)}}
  const res=hs.length>=2;if(res)S.resThis=true;
  const ht=heroTotal(hs);let struck=false,blkd=0;let et=es.reduce((a,e)=>a+e.dmg,0);
  // a spell going off on this beat clashes too
  const sp=at(b,'c').reduce((a,c)=>a+c.dmg*c.hits,0),ct=ht+sp;
  const rev=hs.length===1&&hs[0].rev;
  const resLbl=res?`共鸣×${mult(hs.length)}`:(S.run.cls==='rogue'&&hs.length&&openBeat(b)?'背刺':'攻击');
  const hit=()=>{if(rev)healEnemy(ht,`第 ${roman(b)} 拍的逆攻击`);else{struck=true;dealEnemy(ht,resLbl,{res,src:'atk',beat:b,n:hs.length})}};
  const names=[...new Set(es.map(e=>e.label))].join('、');
  if(res)flt('hero',resLbl,'info');
  let clean=hs.length>0;  // assassin combo survives this beat
  if(es.length&&S.smoke.includes(b)){const h=Math.floor(et/2);flt('hero',`烟幕 −${et-h}`,'info');log(`第 ${roman(b)} 拍：烟幕里${F.lane}的${names}只打出一半（${et}→${h}）。`);et=h;if(et<=0)es=[]}
  if(es.length&&dodge){flt('hero','闪身','info');log(`第 ${roman(b)} 拍：你闪开了${names}。`);
    if(S.zanshin){const n=es.length;addCombo(n);dealEnemy(3*n,'残心',{src:'ghost',beat:b});if(S.over)return}
    es=[];et=0}
  if(es.length&&shield&&!(g&&!es.some(e=>e.noGhost))){
    // a shield takes its full value off each attack on the beat
    const v=blkAt(b),raw=es.reduce((a,e)=>a+e.dmg,0),k=raw?et/raw:0;
    const blk=Math.min(et,es.reduce((a,e)=>a+Math.min(v,Math.floor(e.dmg*k)),0));et-=blk;blkd=blk;gainRage(blk);flt('hero',`格挡 ${blk}`,'info');log(`第 ${roman(b)} 拍：盾挡下 ${blk} 点${names}。`);
    if(S.ripo&&blk>0){dealEnemy(blk*2,'反击架势',{src:'ghost',beat:b});if(S.over)return}
    if(et<=0){es=[]}
  }
  if(es.length){
    clean=false;
    const ghostOK=g&&!es.some(e=>e.noGhost);
    if(g&&!ghostOK)log(`第 ${roman(b)} 拍：残影挡不住${names}。`);
    if(ghostOK){
      flt('hero','残影 · 落空','info');log(`第 ${roman(b)} 拍：${F.lane}击中了残影。`);clean=hs.length>0;
      dealEnemy(6,'残影反击',{src:'ghost',beat:b});if(hs.length&&!S.over)hit();
    }else if(hs.length||sp){
      if(ct>et){
        flt('hero','弹反！','info');S.parried=true;S.parries=(S.parries||0)+1;gainRage(2);if(hasK('shears')&&!S.sheared){S.sheared=true;dealEnemy(12,'断线剪',{src:'true'})}
        if(hasW('bat')){const h=Math.min(3,S.maxhp-S.hp);if(h){S.hp+=h;wvFx('bat',b)}}if(hasW('thief')&&!S.stole){S.stole=true;S.refund++;wvFx('thief',b)}if(hasW('ogre')&&!S.over){freeze('震荡');wvFx('ogre',b)}log(`第 ${roman(b)} 拍：拼刀 ${ct} 对 ${et}，弹反成功！${rev?'逆针被弹反净化。':''}`);
        if(S.bloodwar){const h=Math.min(3,S.maxhp-S.hp);if(h>0){S.hp+=h;flt('hero','+'+h,'heal')}}
        if(hs.length){struck=true;const e0=S.ehp;dealEnemy(ht,resLbl,{res,src:'atk',beat:b,n:hs.length});
          const h=S.drain?Math.min(Math.floor((e0-S.ehp)/2),S.maxhp-S.hp):0;if(h>0){S.hp+=h;flt('hero','+'+h,'heal');log(`饮血：回复 ${h} 点生命。`)}}
        const nx=foeE(e=>!e.locked&&!e.na&&e.beat>b).sort((x,y)=>x.beat-y.beat)[0];
        const st=F.stagger||1;
        if(nx){nx.beat+=st;log(`${F.lane}硬直，下一次行动延后 ${st} 拍。`);delayed('stagger')}
        F.onParry?.call(F);
      }else{
        const left=et-ct;log(`第 ${roman(b)} 拍：拼刀 ${ct} 对 ${et}，被压制，承受 ${left} 点伤害。`);
        flt('hero','拼刀失利','info');if(left>0)dealHero(left,es);
        if(S.bloodwar&&hs.length&&!S.over){struck=true;log('血战：你那一击照样砍了下去。');dealEnemy(ht,resLbl,{res,src:'atk',beat:b,n:hs.length})}
      }
    }else{
      log(`第 ${roman(b)} 拍：${F.lane}的${names}，受到 ${et} 点伤害。`);dealHero(et,es);
    }
  }else if(hs.length){hit()}
  if(struck&&!S.over&&hs.some(h=>h.quake))freeze('震地');
  for(const c of at(b,'c')){if(S.over)break;castFire(c,b)}
  if(S.run.cls==='rogue'&&!S.over){
    if(clean)addCombo(1)
    else if(S.combo){let k=S.keep?Math.floor(S.combo/2):0;if(hasK('silk')&&!S.silked){S.silked=true;k=Math.max(k,S.combo-2)}log(`连击在第 ${roman(b)} 拍中断（${S.combo} 层${k?`，余势留下 ${k} 层`:''}）。`);S.combo=k}
  }
  if(S.poison>0&&!S.over){const d=S.poison;if(!S.plague)S.poison--;dealEnemy(d,`毒（${d} 层）`,{src:'poison',beat:b})}
  if(!S.over)F.afterBeat?.call(F,b);
  // 不动如山: a shield that blocked stays up for the next beat (three beats in a row at most)
  if(S.steady&&blkd>0)for(const w of at(b,'w'))if((w.k||0)<3&&!at(b+1,'w').length)ev({beat:b+1,side:'w',v:w.v,k:(w.k||0)+1});
  // 死兆: a mark you dealt damage on moves on to the next beat
  if(S.omen&&struck)for(const m of at(b,'k'))ev({beat:b+1,side:'k',v:m.v});
  S.events=S.events.filter(e=>e.beat!==b);
}

// push the next n enemy attacks (that are not time-locked) one beat later
function freeze(why,n=1){const xs=foeE(e=>!e.locked&&!e.na&&e.beat>cur()).sort((x,y)=>x.beat-y.beat).slice(0,n);
  for(const nx of xs){if(S.over)break;nx.beat++;log(`${why}：${FL().lane}的${nx.label}延后到第 ${roman(nx.beat)} 拍。`);delayed('card')}}
function castFire(c,b){
  flt('hero',c.n,'info');
  for(let i=0;i<c.hits&&!S.over;i++)dealEnemy(c.dmg,c.n,{src:'spell',beat:b,el:c.el});
  if(S.over)return;
  if(c.frz)freeze(c.n,c.frz);
  if(S.over)return;
  if(S.linger&&!c.echo&&(c.len||0)>=4&&c.el){ev({beat:b+1,side:'c',from:b+1,el:c.el,dmg:Math.floor(c.dmg/2),hits:c.hits,n:c.n+'·余韵',c:0,echo:true});log(`余韵：${c.n}会在第 ${roman(b+1)} 拍再响一次。`)}
  react(c.el,b);
}
// an element going off at beat b reacts with the last one if they differ and are close enough
function react(el,b){
  const p=S.lastSpell,R=p&&p.el!==el&&b-p.beat<=(S.prism?2:1)?REACT[p.el+el]:null;
  S.lastSpell={beat:b,el};
  if(!R){S.chain=0;return}
  const link=S.chain++,d=(R.dmg+link*(CHAIN+(S.prism?4:0)))*(S.star?2:1);if(S.star){S.star=false;log('星辰线：这次反应伤害翻倍。')}
  if(S.tide&&(S.tideN||0)<3){S.tideN=(S.tideN||0)+1;S.refund++;flt('hero','潮汐 +1','info')}
  banner(R.n,`${p.el} + ${el}${link?` · 连锁 ${link+1}`:''}`);dealEnemy(d,`元素反应·${R.n}${link?`（连锁 ${link+1}）`:''}`,{src:'spell',beat:b});S.resThis=true;if(R.frz&&!S.over)freeze(R.n)
}

// what the timeline showed for a beat just before it resolved, kept as a stone fragment of the past
function snapBeat(b){
  return {b,e:at(b,'e').map(e=>({l:e.label,d:e.dmg,na:e.na})).concat(at(b,'g').map(()=>({l:'残影',na:1})),at(b,'w').map(()=>({l:'盾',na:1})),at(b,'d').map(()=>({l:'闪身',na:1}))),
    h:at(b,'h').map(e=>({l:e.fx?'重击':'击',d:e.dmg})).concat(at(b,'c').map(c=>({l:c.n,na:1})))};
}
// after the turn's three beats: end-of-turn effects, then everything that lasts "this turn" wears off and the next hand is drawn
function nextTurn(){
  const F=FL();
  F.turnEnd?.call(F);
  S.beat+=3;S.turn++;gen(S.beat+11);
  S.parriedPrev=S.parried;S.parried=false;
  if(hasW('mirror')&&!S.dmgThis&&S.hp<S.maxhp){S.hp=Math.min(S.maxhp,S.hp+4);wvFx('mirror',S.beat-1)}
  if(hasW('golem'))S.heat=Math.min(5,(S.heat||0)+1);
  S.webbed=S.split=S.stole=false;S.windUp=0;
  S.dmgLast=S.dmgThis;S.dmgThis=0;S.foresight=false;
  S.lastPlayed=S.played;S.played=null;S.turnCards=[];S.resThis=false;S.cry=false;S.smoke=[];
  S.ripo=S.drain=S.venom=S.prism=S.flow=S.toxin=false;S.tideN=0;
  if(S.plague&&S.poison){S.poison=Math.floor(S.poison/2);log(`瘟疫：毒减半到 ${S.poison} 层。`)}
  const kept=hasK('jar')?Math.min(1,S.sand):0;S.shuttle=hasK('shuttle');S.whet=S.silked=false;
  S.sand=(CL().sand||3)-S.debt+(S.med?2:0)+S.refund+kept;S.debt=0;S.med=false;S.refund=0;S.barrier=0;S.iceArmor=false;
  F.turnStart?.call(F,false);
  S.sand=Math.max(0,S.sand);
  draw(S.drawN);S.drawN=5;
}
async function endTurn(){
  if(S.busy||S.over)return;
  const F=FL();
  S.busy=true;S.pending=null;
  S.discard.push(...S.hand);S.hand=[];
  for(let k=0;k<3;k++){
    const b=S.beat+k;S.resolving=b;render();
    await sleep(520);
    const snap=snapBeat(b);snap.rec=stepBeat(b);
    S.hist.forEach(h=>h.fresh=false);snap.fresh=true;S.hist.push(snap);
    render();beatFx(snap);
    await sleep(650);
    if(S.over)break;
  }
  S.resolving=null;
  if(!S.over){
    nextTurn();
    S.hist=S.hist.filter(h=>h.b>=S.beat-3);S.hist.forEach(h=>h.fresh=false);
    banner(`第 ${S.turn} 回合`,`HORA ${roman(S.beat)}`);
  }
  S.busy=false;render();
  if(S.over)setTimeout(showEnd,700);
}

