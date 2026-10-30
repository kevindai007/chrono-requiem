/* The battle board: rendering the top bar, the loom (timeline) and the hand, and the battle input handlers. */
const MOODS={calm:'静默',judge:'蓄力',rage:'狂怒'};
const SPELLS=new Set(Object.values(CARDS).filter(C=>C.cast).map(C=>C.n));

let lastSand=null;
function render(){renderTop();renderBoard();renderHand()}
function renderTop(){
  const F=FL();
  $('floorNo').textContent=F.floor;$('turnNo').textContent=S.turn;$('goldNo').textContent=S.run.gold||0;$('knotsNo').innerHTML=knotRow(S.run);$('knotsNo').hidden=!S.run.knots?.length;
  $('foeName').textContent=F.name;
  $('enemyArt').style.backgroundImage=`url(${F.img})`;
  document.querySelector('.half.hero').style.setProperty('--hero',`url(${art(`img/classes/hero_${S.run.cls}.jpg`)})`);
  const hp=(S.hp/S.maxhp*100)+'%',ehp=(S.ehp/S.emax*100)+'%';
  $('hpBar').style.width=hp;$('hpLag').style.width=hp;$('hpTxt').textContent=`${S.hp} / ${S.maxhp}`;
  $('ehpBar').style.width=ehp;$('ehpLag').style.width=ehp;$('ehpTxt').textContent=`${S.ehp} / ${S.emax}`;
  $('foeHalf').classList.toggle('rage',!!(F.rage&&F.rage()));
  const K=CL();$('heroName').textContent=K.n;
  $('heroRes').textContent=S.run.cls==='warrior'?`怒气 ${S.rage}/${S.rageMax}`:S.run.cls==='rogue'?`连击 ${S.combo}/${S.comboMax}`:`霜冻 ${S.frost}/${FROST}`;
  const T=(c,on,t)=>on?`<span class="tag ${c}">${t}</span>`:'';
  $('heroStatus').innerHTML=(S.fate?.on?`<span class="tag fate">命运 · ${FATES[S.fate.k].d(S.stage)}</span>`:'')+(S.totem?`<span class="tag">图腾 ${S.totem}</span>`:'')+(S.heat?`<span class="tag">热度 +${S.heat}</span>`:'')+(S.run.cls==='warrior'?T('rg',S.ripo,'反击架势')+T('rg',S.drain,'饮血')+T('rg',S.blood,S.hp*2<S.maxhp?'血怒 · 每击 +5':'血怒')+T('rg',S.undying,'不屈')+T('rg',S.steady,'不动如山')+T('rg',S.breaker,'破军')+T('rg',S.bloodwar,'血战')
      :S.run.cls==='rogue'?T('cb',S.keep,'余势')+T('cb',S.venom,'毒刃')+T('cb',S.toxin,'毒发')+T('cb',S.zanshin,'残心')+T('cb',S.plague,'瘟疫')+T('cb',S.omen,'死兆')
      :T('mg',S.events.some(e=>e.side==='c'),`吟唱 ${S.events.filter(e=>e.side==='c').length}`)+T('mg',S.chain,`连锁 ${S.chain}`)+T('mg',S.barrier,'屏障')+T('mg',S.quick,'瞬发')+T('mg',S.surge,'超载')+T('mg',S.prism,'棱镜')+T('mg',S.flow,'法力回流')+T('mg',S.rime,'寒霜印记')+T('mg',S.tide,'元素潮汐')+T('mg',S.linger,'余韵')+T('mg',S.zero,'绝对零度')+T('mg',S.ff,`霜火 +${S.ff}`)+T('mg',S.iceArmor,'冰甲')+T('mg',S.med,'冥想 +2')+T('mg',S.refund,`回流 +${S.refund}`))+(S.cry?'<span class="tag rg">战吼</span>':'')+(S.smoke.length?'<span class="tag cb">烟幕</span>':'')+(S.parried?'<span class="tag ok">本回合已弹反</span>':'')+(S.dmgLast?`<span class="tag">上回合受伤 ${S.dmgLast}</span>`:'');
  let st='';
  if(F.moods){const m=F.mood();st+=`<span class="mood ${m}" style="background-image:url(img/moods/${m}.jpg)" title="${MOODS[m]}"></span>`}
  $('enemyStatus').innerHTML=st+(F.status?F.status():'')+(S.poison?`<span class="tag p2">中毒 ${S.poison} 层</span>`:'');
  $('dock').classList.toggle('busy',S.busy);
  $('sandNum').textContent=S.sand;
  if(lastSand!==null&&lastSand!==S.sand)restart($('sandNum'),'bump',450);lastSand=S.sand;
  $('debt').textContent=S.debt?`下回合 −${S.debt}`:'';
  $('endBtn').disabled=S.busy||!!S.over;
  $('piles').textContent=`牌库 ${S.deck.length} · 弃牌 ${S.discard.length}`;
  $('latest').innerHTML=S.log[0]?`<span class="t">${roman(S.log[0].t)}</span>${S.log[0].msg}`:'';
  $('log').innerHTML=S.log.map(l=>`<p><span class="t">${roman(l.t)}</span>${l.msg}</p>`).join('');
}
const archName=a=>Object.values(CLASSES).map(K=>K.arch[a]).find(Boolean);
// one card face, shared by the hand and the reward screen; opt.i is its hand index, opt.off disables it
function cardHtml(k,opt={}){const C=CARDS[k];const rg=C.r&&!C.c;const ex=C.cast?`<span class="cx" style="color:var(--indigo)">吟唱 ${castLen(C)} 拍 · ${C.el}</span>`:'';return `<button class="card ${opt.cls||''} ${rg?'rg':''} ${C.ks?'ks':''} ${C.st?'st':''}" ${opt.attr||''} data-t="${C.t}" ${opt.off?'disabled':''}>
    <span class="fr"><span class="art">${C.glyph?`<i class="gl">${SVG[C.glyph]}</i>`:`<i style="background-image:url(img/cards/${C.base||k}.jpg)"></i>`}${C.st?`<span class="stl">${STITCH[C.st].n} · ${STITCH[C.st].sd}</span>`:''}</span><span class="txt"><span class="cn">${C.n}</span><span class="ct">${C.a?archName(C.a):C.t==='诅咒'?'诅咒':'通用'}</span><span class="cd">${C.d}</span>${ex}${C.ks?'<span class="ks">基石</span>':C.x?'<span class="cx">消耗 · 用后移出牌组</span>':''}</span></span><span class="cost"><span>${rg?(C.ra?'全':C.r):opt.cost??C.c}</span>${rg?'<small>怒气</small>':''}</span></button>`}
function renderHand(){
  $('hand').classList.toggle('empty',!S.hand.length);
  $('hand').innerHTML=S.hand.map((k,i)=>{const C=CARDS[k];return cardHtml(k,{cost:costOf(C),cls:S.pending===i?'sel':'',attr:`data-i="${i}"`,off:costOf(C)>S.sand||(C.r&&S.rage<C.r)||S.busy||S.over})}).join('');
}

/* what a resolved (or simulated) beat came to, in a word or two */
const TAGS=[[/^打断/,'吟唱打断','bad'],[/^屏障/,'屏障护住','ok'],[/^弹反/,'弹反','ok'],[/^闪身/,'闪身','ok'],[/^残影/,'残影','ok'],[/^镜影/,'镜影吞没','bad'],[/^盾反/,'盾反','bad'],[/^拼刀失利/,'拼刀失利','bad'],[/^格挡/,null,'ok'],[/^烟幕/,null,'ok'],[/^冰甲/,'冰甲','ok'],[/^共鸣/,null,'res'],[/^背刺/,null,'res']];
function tagOf(r){
  for(const [re,w,c] of TAGS){const f=r.fx.find(x=>x.who!=='b'&&re.test(x.text));if(f)return {t:w||f.text,c}}
  const re=r.fx.find(x=>x.who==='b');if(re)return {t:re.text,c:'res'};
  const sp=r.fx.find(x=>x.who==='hero'&&SPELLS.has(x.text));if(sp)return {t:'释放·'+sp.text,c:'res'};
  const ar=r.fx.find(x=>x.who==='enemy'&&x.cls==='info'&&/甲|图腾|帷幕/.test(x.text));if(ar)return {t:ar.text.split(' ')[0],c:'arm'};
  return null;
}
const nums=r=>(r.took>0?`<em class="tk">受 ${r.took}</em>`:'')+(r.net>0?`<em class="dl">打 ${r.net}</em>`:'')+(r.net<0?`<em class="hl">回 ${-r.net}</em>`:'');
function midRec(r,bs){
  if(!r)return {h:'',c:''};
  const t=tagOf(r);const n=nums(r);
  let h=(t?`<span>${t.t}</span>`:'')+(n?`<span>${n}</span>`:'');
  const chg=bs&&(bs.took!==r.took||bs.net!==r.net);
  if(chg){const o=(bs.took?`受 ${bs.took}`:'')+(bs.took&&bs.net?' · ':'')+(bs.net>0?`打 ${bs.net}`:bs.net<0?`回 ${-bs.net}`:'');h+=`<span class="old">${o||'无事'}</span>`}
  if(!h&&r.es.length)h='<span>无伤</span>';
  return {h,c:r.took>0?'bad':t?t.c:r.net>0?'res':'',chg};
}
const lanesHtml=()=>'<div class="lanes"><div></div><div class="le">敌方</div><div class="lc">交锋</div><div class="lh">勇者</div></div>';
// the glyph sewn on each patch
const EL={'火':SVG.FIRE,'冰':SVG.ICE,'雷':SVG.BOLT};
const foeGlyph=e=>e.na?'':e.kind==='j'||e.fin?SVG.BURST:SVG.CLAW;
function pastSlot(h){
  const m=midRec(h.rec);
  return `<div class="slot past ${h.fresh?'fresh':''}" data-pb="${h.b}">${wvHtml(h.b)}<div class="bn"><span>${roman(h.b)}</span></div>
    <div class="lane e">${h.e.map(x=>`<div class="chip st">${x.l}${x.na?'':` <b>${x.d}</b>`}</div>`).join('')}</div>
    <div class="mid ${m.c}"><span class="mt">${m.h}</span></div>
    <div class="lane h">${h.h.map(x=>`<div class="chip st">${x.l}${x.na?'':` <b>${x.d}</b>`}</div>`).join('')}</div></div>`;
}
// the analytic guess for beats past this turn: what the board looks like if nothing else changes
function guessMid(b,F){
  const hs=at(b,'h'),ae=at(b,'e'),es=atkE(b),gs=at(b,'g'),ms=at(b,'m'),ws=at(b,'w'),ds=at(b,'d'),cs=at(b,'c'),cw=S.events.filter(e=>e.side==='c'&&e.from<=b&&e.beat>b);
  let mid='',mc='';const ht=heroTotal(hs);let et=es.reduce((a,e)=>a+e.dmg,0);const ct=ht+cs.reduce((a,c)=>a+c.dmg*c.hits,0);
  const ghostOK=gs.length&&!es.some(e=>e.noGhost);
  const blk=es.length&&ws.length&&!ghostOK&&!ds.length?Math.min(blkAt(b),et):0;et-=blk;
  const armor=v=>{if(!F.mod)return v;return F.mod(v,{res:hs.length>=2,src:'atk',beat:b})};
  const shown=v=>{const a=armor(v);return a<v?`${F.modShort}→${a}`:a};
  if(ms.length&&hs.length){mid='镜影<br>攻击落空';mc='bad'}
  else if(es.length&&ds.length){mid=hs.length?`闪身<br>${shown(ht)}`:'闪身';mc='ok'}
  else if(es.length&&ghostOK){mid='落空·反击';mc='ok'}
  else if(es.length&&blk&&et<=0){mid=hs.length?`格挡 ${blk}<br>打 ${shown(ht)}`:`格挡 ${blk}`;mc='ok'}
  else if(es.length&&ct){const pre=blk?`挡${blk} `:'';if(ct>et){mid=`${pre}拼刀${ct}>${et}<br>弹反`;mc='ok'}else{mid=`${pre}拼刀${ct}≤${et}<br>受 ${et-ct}`;mc='bad'}}
  else if(es.length&&blk){mid=`格挡 ${blk}<br>受 ${et}`;mc='bad'}
  else if(hs.length>=2){mid=`共鸣×${mult(hs.length)}<br>${shown(ht)}`;mc='res'}
  else if(hs.length===1&&hs[0].rev){mid=`逆针<br>魔王回 ${ht}`;mc='bad'}
  else if(hs.length&&ae.some(e=>e.sh)){mid=`盾反<br>弹回 ${Math.floor(ht/2)}`;mc='bad'}
  else if(hs.length&&S.run.cls==='rogue'){mid=`背刺<br>${shown(ht)}`;mc=armor(ht)<ht?'arm':'res'}
  else if(hs.length&&F.mod){const v=armor(ht);if(v<ht){mid=`${F.modShort}→${v}`;mc='arm'}}
  const hurts=es.length&&!ds.length&&!ghostOK&&et>0&&!(ct&&ct>et);
  if((cs.length||cw.length)&&hurts){mid=S.barrier?'屏障<br>护住吟唱':'打断<br>吟唱！';mc=S.barrier?'ok':'bad'}
  else if(cs.length&&!mid){mid=`释放<br>${cs.map(e=>e.el).join('')}`;mc='res'}
  return {h:mid,c:mc};
}
function liveSlot(b,o){
  const F=FL(),pend=o.pend;
  const hs=at(b,'h'),ae=at(b,'e'),gs=at(b,'g'),ms=at(b,'m'),ws=at(b,'w'),ds=at(b,'d'),ks=at(b,'k'),cs=at(b,'c'),cw=S.events.filter(e=>e.side==='c'&&e.from<=b&&e.beat>b);
  const now=b<S.beat+3,far=b>=S.beat+baseView();
  const tg=pend?pend.tg:null;
  const tgt=(tg==='pair'&&b<S.beat+W()-1)||tg==='any'||tg==='h'||tg==='e'||(tg==='b4'&&b<=S.beat+3)||(tg==='cast'&&b>=S.beat+castLen(pend)-1);
  const ech=ae.map(e=>{const warn=e.kind==='j'&&b-S.beat<3;return `<div class="chip e ${e.kind==='j'?'j':''} ${e.na?(e.sh?'sh':'na'):''} ${e.fin?'fin':''} ${warn?'warn':''} ${tg==='e'&&!e.locked?'pick':''} " data-id="${e.id}">${foeGlyph(e)}${e.label}${e.na?'':` <b>${e.dmg}</b>`}${e.locked?'<span class="lock">锁</span>':''}</div>`}).join('')
    +gs.map(()=>`<div class="chip g">残影</div>`).join('')+ws.map(w=>`<div class="chip w">${SVG.SHIELD}${w.v?'塔盾':'盾'} −${w.v||SHIELD}</div>`).join('')+ds.map(()=>`<div class="chip d">闪身</div>`).join('')+ms.map(()=>`<div class="chip e mir">镜影</div>`).join('');
  const hch=hs.map(e=>`<div class="chip h ${e.ch?'ch':''} ${e.fx?'fx':''} ${e.rev?'rev':''} ${tg==='h'?'pick':''}" data-id="${e.id}">${e.rev?'':SVG.SWORD}${e.rev?'逆':e.fx?'重击':'击'} <b>${e.dmg}</b></div>`).join('')
    +ks.map(k=>`<div class="chip k">${k.v?'破绽':'标记'} ×${k.v||2}</div>`).join('')
    +cs.map(e=>`<div class="chip sp" data-el="${e.el}" data-id="${e.id}">${EL[e.el]}${e.n} <b>${e.dmg}${e.hits>1?'×'+e.hits:''}</b></div>`).join('')+cw.map(e=>`<div class="chip spw" data-el="${e.el}">吟唱·${e.n}</div>`).join('');
  const m=now?midRec(o.rec):guessMid(b,F);
  return `<div class="slot ${now?'now':'fut'} ${far?'far':''} ${S.smoke.includes(b)?'smk':''} ${S.resolving===b?'hit':''} ${tgt?'tgt':''} " data-b="${b}">${wvHtml(b)}
    <div class="bn"><span>${roman(b)}</span></div><div class="lane e">${ech}</div><div class="mid ${m.c}"><span class="mt">${m.h}</span></div><div class="lane h">${hch}</div></div>`;
}
let scrollKey='';
function renderBoard(){
  const F=FL();
  const pend=S.pending!=null?CARDS[S.hand[S.pending]]:null;
  const fc=forecast(),recs=fc.base.out;
  let html=lanesHtml()+S.hist.filter(h=>h.b>=S.beat-3).map(pastSlot).join('');
  for(let b=S.doneUpTo+1;b<S.beat+W();b++)html+=liveSlot(b,{pend,rec:recs.find(r=>r.b===b)});
  $('timeline').innerHTML=html;
  // keep this turn's beats in view when the ribbon scrolls
  const sc=$('tlscroll'),first=document.querySelector('#timeline .slot[data-b]'),sk=S.beat+':'+S.doneUpTo;
  if(first&&sk!==scrollKey){scrollKey=sk;if(sc.scrollWidth>sc.clientWidth){const lw=document.querySelector('#timeline .lanes').offsetWidth;sc.scrollLeft=Math.max(0,first.offsetLeft-lw-70)}}
  const n=$('needle'),cs=S.resolving&&document.querySelector(`#timeline [data-b="${S.resolving}"],#timeline [data-pb="${S.resolving}"]`);
  if(cs){n.style.left=(cs.offsetLeft+cs.offsetWidth/2)+'px';n.classList.add('on')}else n.classList.remove('on');
  renderHint(pend);
}
function renderHint(pend){
  let h=hintMsg;
  if(!h&&pend)h=HINTS[pend.tg];
  if(!h&&S.busy)h='时针正在走过本回合的 3 拍……';
  if(!h&&!S.busy)h='亮色的 3 拍会在本回合结算，交锋一栏是它们的结果。';
  const el=$('hint');
  el.className='hint'+(hintMsg?' err':pend?' pend':'');
  el.innerHTML=DIAM+`<span>${h}</span>`+(pend&&!hintMsg?'<button class="cancel" id="cancelBtn">取消</button>':'');
}

/* ---------- Input: pick a card, then a beat ---------- */
$('hand').addEventListener('click',e=>{
  const c=e.target.closest('.card');if(!c||c.disabled)return;
  const i=+c.dataset.i,C=CARDS[S.hand[i]];
  if(S.pending===i){S.pending=null;render();return}
  if(C.c>S.sand)return setHint('时之砂不足');
  if(C.r&&S.rage<C.r)return setHint('怒气不足');
  if(C.tg){S.pending=i;hintMsg='';render()}else playCard(i);
});
$('timeline').addEventListener('click',e=>{
  if(S.pending==null||S.busy)return;
  const slot=e.target.closest('.slot[data-b]');if(!slot)return;
  const tgt=resolveTarget(S.pending,slot,e.target.closest('.chip[data-id]'));
  if(tgt.err)return setHint(tgt.err);
  playCard(S.pending,tgt.t);
});
$('hint').addEventListener('click',e=>{if(e.target.id==='cancelBtn'){S.pending=null;render()}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&S.pending!=null){S.pending=null;render()}});
$('endBtn').addEventListener('click',endTurn);
$('rulesBtn').addEventListener('click',()=>showRules(false));
$('resetBtn').addEventListener('click',()=>{startFight(S.run,S.foeKey);render();banner('第 1 回合','HORA I')});
addEventListener('resize',()=>{if(S)renderBoard()});

