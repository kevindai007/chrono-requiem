/* ---------- Full-page screens: briefing, victory, defeat, summit ---------- */
const EN={wolf:'THE GREYMANE WOLF',bat:'THE VAMPIRE BAT',skeleton:'THE BONE SENTRY',beetle:'THE IRONSHELL BEETLE',spider:'THE VENOM WEAVER',gargoyle:'THE BELFRY GARGOYLE',slime:'THE SUNDERING SLIME',mirror:'THE MIRROR FAE',puppet:'THE CLOCKWORK PUPPET',
  treant:'THE THORN TREANT',ogre:'THE ONE-EYED OGRE',banshee:'THE WAILING BANSHEE',shaman:'THE GOBLIN SHAMAN',thief:'THE TIME THIEF',golem:'THE MOLTEN GOLEM',knight:'THE BLACK IRON KNIGHT',king:'THE KING OF ENDLESS NIGHT'};
// each class banner shows one starting card from each of its three archetypes
const PICK={warrior:{col:'#923f35',la:'WARRIOR',mt:'以剑守护当下',show:['shield','cleave','grudge']},
  rogue:{col:'#4f5a44',la:'ASSASSIN',mt:'以影为步',show:['dodge','poison','mark']},
  mage:{col:'#2c3d4f',la:'MAGE',mt:'以时间为语',show:['fireball','chain','icelance']}};
const LOGO=`<div class="logo"><span class="knot">${SVG.KNOT}</span><b>时之勇者</b><span>CHRONO REQUIEM</span></div>`;
const MAST=right=>`<header class="mast">${LOGO}<span class="vine" aria-hidden="true"></span>${right||''}</header><div class="trim"></div>`;
const metaHtml=()=>`<div class="meta"><span><b>${FL().floor}</b></span><span>第 <b>${S.turn}</b> 回合</span></div>`;
const rulesList=rs=>`<ul class="rules">${rs.map((r,i)=>`<li><i>${[SVG.CLAW,SVG.SAND,SVG.BURST][i%3]}</i><span>${r}</span></li>`).join('')}</ul>`;
const stat=(ic,c,lb,v,o={})=>`<div class="stat"><i class="${c}">${ic}</i><span><small>${lb}</small><b class="${o.zh?'zh':''}">${v}</b>${o.sm?`<small>${o.sm}</small>`:''}</span></div>`;
// the clock tower: storeys from I at the foot to VII, cleared ones gilded, the current one in madder
const towerCol=()=>`<ol class="tower" aria-label="钟楼">${S.run.foes.map((k,i)=>`<li class="tw ${i<S.stage?'done':i===S.stage?'cur':''}" title="${i<=S.stage?FOE[k].name:FOE[k].floor}">${ROM[i+1]}</li>`).join('')}</ol>`;
const patch=e=>`<div class="chip e ${e.na?'na':''} ${e.kind==='j'?'j':''}">${foeGlyph(e)}${e.label}${e.na?'':` <b>${e.dmg}</b>`}</div>`;
// quiet: redraw the same page in place (a purchase in the weavery), keeping the scroll and skipping the entrance
function openScr(mode,mast,main,focus,quiet){
  const s=$('scr'),y=s.scrollTop;calmDown();s.className='scr '+mode;
  $('scrIn').innerHTML=mast+main;
  s.hidden=false;s.scrollTop=quiet?y:0;delete s.dataset.end;
  if(!quiet)enter(mode);
  const f=$(focus);if(f)f.focus({preventScroll:true});
}
function closePanel(){calmDown();$('scr').hidden=true}
function floorPicker(){
  return `<details class="dbg"><summary>试玩：直接跳到任一只怪（从头开始的生命和牌组）</summary><div class="floors">${TOWER.map((p,i)=>`<div class="fl"><em>${FOE[p[0]].floor}</em><div>${p.map(k=>`<button data-fl="${i}" data-k="${k}" class="${i===S.stage&&k===FL().key?'cur':''}">${FOE[k].name}</button>`).join('')}</div></div>`).join('')}</div></details>`;
}
function wireFloors(){document.querySelectorAll('.floors button').forEach(b=>b.onclick=()=>{newRun(+b.dataset.fl,S.run.cls,b.dataset.k);render();showRules(true)})}

/* Class pick: three heraldic banners hung over a millefleur field */
let pickSel='warrior';
function pkRow(k){
  const C=CLASSES[k],P=PICK[k];
  return `<button class="pk-row" data-cl="${k}" style="--cc:${P.col}" aria-pressed="false">
    <span class="nm">${C.n}</span><span class="la">${P.la}</span><span class="mt">— ${P.mt} —</span>
    <span class="fig" style="background-image:url(img/classes/body_${k}.jpg)"><span class="pk-badge">当前选择</span></span>
    <span class="pk-st"><span>${SVG.HEART}生命 ${C.hp}</span><span>${SVG.SAND}每回合 ${C.sand||3} 沙</span><span>${SVG.SWORD}每${C.atk.every===1?'':` ${C.atk.every} `}拍攻击 ${C.atk.dmg}</span></span>
    <span class="pk-cards">${P.show.map(x=>`<span class="fc"><i style="background-image:url(img/cards/${x}.jpg)"></i><b>${CARDS[x].n}</b><small>${C.arch[CARDS[x].a]}</small></span>`).join('')}</span>
    <span class="tas"></span></button>`;
}
function updatePick(){
  document.querySelectorAll('.pk-row').forEach(r=>{const on=r.dataset.cl===pickSel;r.classList.toggle('on',on);r.setAttribute('aria-pressed',on)});
  const C=CLASSES[pickSel],P=PICK[pickSel];
  $('pkCrest').innerHTML=crest(pickSel,P.col);
  $('pkWho').innerHTML=`<b>${C.n}</b><span>${P.la}</span>`;
  $('pkPitch').textContent=C.pitch;
}
function showClassPick(first){
  closePanel();
  pickSel=(first!==true&&S&&S.run&&S.run.cls)||'warrior';
  $('pkRows').innerHTML=Object.keys(CLASSES).map(pkRow).join('');
  document.querySelectorAll('.pk-row').forEach(r=>{r.onclick=()=>{pickSel=r.dataset.cl;updatePick();sway(r)};r.ondblclick=()=>$('pkGo').click()});
  $('pkBack').hidden=first===true;
  $('pick').hidden=false;$('pick').scrollTop=0;updatePick();
  if(!CALM)gsap.from('.pk-row',{y:-70,rotation:i=>(i-1)*3,opacity:0,stagger:.12,duration:.8,ease:'back.out(1.3)',clearProps:'transform,opacity'});
  const f=document.querySelector('.pk-row.on');if(f)f.focus({preventScroll:true});
}
$('pkGo').onclick=()=>{$('pick').hidden=true;newRun(0,pickSel);render();showRules(true)};
$('pkBack').onclick=()=>{$('pick').hidden=true;if(S.over)showEnd()};

/* Briefing: the hunt tapestry, the foe's pattern with its first three beats, your class, the tower */
function showRules(intro){
  const F=FL(),C=CL(),k=S.run.cls,fresh=S.turn===1&&!S.busy;
  const first=[0,1,2].map(i=>{const b=S.beat+i,es=at(b,'e');return `<div><em>${roman(b)}</em>${es.length?es.map(patch).join(''):'<span class="none">—</span>'}</div>`}).join('');
  openScr('brief',MAST(`<span class="page">${SVG.FLEUR}战前情报${SVG.FLEUR}</span>`),`<div class="body">
    <div class="hunt ip"><div class="pic" style="background-image:url(${F.portrait})" role="img" aria-label="${F.name}"></div><span class="flag">${SVG.FLAG}</span>
      <div class="cart"><span class="fl">${F.floor}</span><div class="nm"><h2>${F.name}</h2></div><div class="en">${EN[F.key]}</div></div></div>
    <div class="bmid">
      <section class="pp"><h4 class="sh">敌方行动</h4>${rulesList(F.rules)}<div class="preview">${first}</div></section>
      <section class="pp"><h4 class="sh sm">你的职业</h4><div class="cls"><span class="crest">${crest(k,PICK[k].col)}</span><div><h3>${C.n}</h3><div class="sub">${SVG.SWORD}${C.sub}</div></div><p>${C.rule}</p></div></section>
      ${S.fate&&(fresh||S.fate.on)?`<section class="pp fatebox"><h4 class="sh sm">命运之线</h4><p>${FATES[S.fate.k].d(S.stage)}。接下它：做到了，这场的金线翻倍；没做到，生命 −5。</p>${fresh?`<button class="btn ${S.fate.on?'go':''}" id="fateBtn">${S.fate.on?'已接下（再点放弃）':'接下'}</button>`:''}</section>`:''}
      ${S.run.woven.length?`<section class="pp"><h4 class="sh sm">织入的怪物</h4><ul class="knotlist">${S.run.woven.map(k=>`<li><i class="wvi" style="background-image:url(img/weaves/${k}.png)"></i><b>${WEAVES[k].n}</b><span>${WEAVES[k].d}</span></li>`).join('')}</ul></section>`:''}
      ${S.run.knots.length?`<section class="pp"><h4 class="sh sm">线结</h4><ul class="knotlist">${S.run.knots.map(k=>`<li><i>${SVG.KNOT}</i><b>${KNOTS[k].n}</b><span>${KNOTS[k].d}</span></li>`).join('')}</ul></section>`:''}
      ${intro?'':`<section class="pp"><h4 class="sh sm">时间法则</h4>${rulesList([`时间轴上排着未来的行动：上方是敌人，下方是你。每回合 <b>${C.sand||3} 粒时之砂</b>，点「推进时间」结算亮色的 3 拍。`,
        '<b>共鸣</b>：多次攻击落在同一拍，总伤害 ×1.5（三次及以上 ×2）。<b>拼刀</b>：和敌人同拍且伤害更高就弹反，敌人攻击作废并硬直。',
        '高塔七层：前五层每层从三只怪里随机遇到一只，第 6 层是黑铁骑士，塔顶是永夜魔王。每层打完最大生命 +5，回复 20% 最大生命，挑一张新牌，再从岔路里选一股走：织坊、纺车……打得越漂亮，拿到的金线越多。'])}</section>`}
      ${floorPicker()}
      <div class="acts"><button class="btn" id="pickBtn">${SVG.REDO}换职业重来</button><button class="btn go" id="startBtn">${SVG.SHUTTLE}${fresh?'开战':'继续'}</button></div>
    </div>
    ${towerCol()}</div>`,'startBtn');
  wireFloors();$('pickBtn').onclick=()=>showClassPick();
  // toggle in place: rebuilding the briefing would replay its entrance and jump back to the top
  const fb=$('fateBtn');if(fb)fb.onclick=()=>{S.fate.on=!S.fate.on;fb.classList.toggle('go',S.fate.on);fb.textContent=S.fate.on?'已接下（再点放弃）':'接下';renderTop()};
  $('startBtn').onclick=()=>{closePanel();if(fresh)banner(F.floor,F.name)};
}

function showEnd(){
  if(!$('scr').hidden&&$('scr').dataset.end===String(S.uid))return;
  const F=FL(),win=S.over==='win',last=S.stage===TOWER.length-1,B=S.best,cls=S.run.cls;
  const bestAt=B?(B.b?`第 ${roman(B.b)} 拍`:'一张牌'):'';
  if(!win){
    openScr('lose',MAST(),`<div class="body">
      <div class="fray ip"><div class="pic" style="background-image:url(img/classes/defeat_${cls}.jpg)" role="img" aria-label="倒下的${CL().n}"></div><svg class="threads" id="frayThreads" viewBox="0 0 600 200" preserveAspectRatio="none" aria-hidden="true"></svg></div>
      <div class="lmain pp"><div class="kick">DEFEAT</div><h2 class="ttl">时间终结</h2><div class="where">${F.floor} · ${F.name}</div>
        <div class="stats">${stat(SVG.SAND,'','回合',S.turn)}${stat(SVG.BURST,'ind','最高一拍',B?B.d:0,{sm:B?bestAt+(B.cards.length?' · '+B.cards.join('、'):''):''})}${stat(SVG.CLAW,'mo','敌方剩余',S.ehp)}</div>
        <h4 class="sh sm">它的节奏</h4>${rulesList(F.rules)}
        <div class="acts"><button class="btn" id="runBtn">${SVG.REDO}重新选职业</button><button class="btn red" id="retryBtn">${SVG.SHUTTLE}重试本层</button></div>
        <p class="coda">钟针仍在前行</p></div></div>`,'retryBtn');
    $('retryBtn').onclick=()=>{closePanel();startFight(S.run,S.foeKey);render();banner(FL().floor,FL().name)};
    $('runBtn').onclick=()=>showClassPick();
  }else if(last){
    const ks=[...new Set(S.run.deck)];
    openScr('end',MAST(),`<div class="body">
      <div class="pano ip"><div class="pic" style="background-image:url(img/scenes/end_panorama.jpg)" role="img" aria-label="七层钟楼"></div><div class="cap"><h2>永夜终结</h2><span>THE SEVENTH THREAD</span></div></div>
      <svg class="seven" viewBox="0 0 1400 70" preserveAspectRatio="none" aria-hidden="true"><path d="M10 35C110 5 160 65 210 35S310 5 410 35 510 65 610 35 710 5 810 35 910 65 1010 35 1110 5 1210 35 1310 65 1390 35" fill="none" stroke="#923f35" stroke-width="3"/>${ROM.slice(1,8).map((r,i)=>`<g class="kn" transform="translate(${110+i*200} 35)"><circle r="16" fill="#202d3a" stroke="#cfa95f" stroke-width="2.5"/><text y="5.5" text-anchor="middle" font-family="Noto Serif SC,serif" font-weight="900" font-size="15" fill="#ead39a">${r}</text></g>`).join('')}</svg>
      <div class="stats">${stat(SVG.TOWER,'','七层登顶',`第 ${S.turn} 回合`,{zh:1})}${stat(SVG.BURST,'ind','最高一拍',B?B.d:0,{sm:B?bestAt:''})}${stat(SVG.CARDS,'mo','牌组',`${S.run.deck.length} 张`)}</div>
      <section class="pp"><h4 class="sh sm">登顶的牌组</h4><div class="deck">${ks.map(k=>{const n=S.run.deck.filter(x=>x===k).length;return `<span><i style="background-image:url(img/cards/${baseOf(k)}.jpg)"></i>${CARDS[k].n}${CARDS[k].st?'·'+STITCH[CARDS[k].st].n:''}${n>1?`<em>×${n}</em>`:''}</span>`}).join('')}</div></section>
      <div class="acts end"><button class="btn go" id="runBtn">${SVG.SHUTTLE}再登钟楼</button></div></div>`,'runBtn');
    $('runBtn').onclick=()=>showClassPick();
  }else if(S.foeKey){
    // an elite from the road: no heal and no card, its gold and a knot, then back onto the road
    const run=S.run,g=loot();
    openScr('road',pageHd('乱线解开了',run),`<div class="body"><h2 class="ttl">${F.name}倒下了</h2>
      <div class="stats">${stat(SVG.SAND,'','回合',S.turn)}${stat(SVG.HEART,'','生命',`${S.hp} / ${S.maxhp}`)}${stat(SVG.KNOT,'ind','金线',`+${g}`)}</div>
      <div class="acts end"><button class="btn go" id="goOn">${SVG.KNOT}挑一枚线结</button></div></div>`,'goOn');
    $('goOn').onclick=()=>{run.hp=S.hp;run.gold+=g;payFate(run);showKnotPick(run,()=>walk(run))};
  }else{
    const N=FOE[S.run.foes[S.stage+1]],pool=rewardPool(S.run,F);if(S.run.rift){const x=shuffle(CLASSES[S.run.cls].pool.filter(k=>!pool.includes(k)&&!CARDS[k].ks))[0];if(x)pool.unshift(x)}
    openScr('win',MAST(metaHtml()),`<div class="vban"><b>胜利</b><span>VICTORY</span></div><div class="body">
      <div class="hero-col"><div class="ip fig"><div class="pic" style="background-image:url(img/classes/body_${cls}.jpg)" role="img" aria-label="${CL().n}"></div></div>
        <div class="foecrest"><i style="background-image:url(${F.img})"></i></div>
        ${B?`<div class="best ip"><div class="v"><small>最高一拍</small><b>${B.d}</b><em>${bestAt}</em></div><div class="cards">${B.cards.length?B.cards.join('、'):'自动攻击'}</div></div>`:''}</div>
      <div class="vmain"><h2 class="ttl">${F.name}倒下了</h2><div class="seam"></div>
        <div class="stats">${stat(SVG.SAND,'','回合',S.turn)}${stat(SVG.HEART,'','生命',`${S.hp} → <em>${healTo()}</em>`,{sm:`上限 ${S.maxhp+5}`})}${stat(SVG.STAIRS,'ind','下一层',N.name,{zh:1})}</div>
        <h4 class="sh">战利品</h4><p class="lead">挑一张牌加入牌组</p>
        <div class="rewards">${pool.map(k=>cardHtml(k,{cls:'rw',attr:`data-k="${k}"`})).join('')}
          ${WEAVES[F.key]&&!S.run.woven.includes(F.key)?`<button class="skipcard weave" id="weaveBtn"><span class="sk-ic"><i style="background-image:url(img/weaves/${F.key}.png)"></i></span><b>织入${F.lane}</b><i>不拿牌 · ${WEAVES[F.key].n}：${WEAVES[F.key].d}</i></button>`:''}
          <button class="skipcard" id="skipBtn"><span class="sk-ic">${SVG.SKIP}</span><b>直接上楼</b><i>不拿牌</i></button></div>
        <div class="journey ip">${S.run.foes.map((k,i)=>`<span class="jn ${i<=S.stage?'done':i===S.stage+1?'next':''}"><em>${ROM[i+1]}</em><i></i><span>${i<=S.stage+1?FOE[k].name:''}</span></span>`).join('')}</div>
        ${S.fate?.on?`<p class="lead fate">${fateRes()?`命运之线 · 完成：金线再 <b>+${loot()}</b>`:'命运之线 · 没有完成：生命 <b>−5</b>'}</p>`:''}
        <p class="lead"><span class="rwnote">当前牌组 ${S.run.deck.length} 张 · 金线 ${S.run.gold||0} <em>+${loot()}</em></span></p></div></div>`);
    const next=k=>nextFloor(k,true);
    document.querySelectorAll('.rewards .card').forEach(b=>b.onclick=()=>next(b.dataset.k));
    $('skipBtn').onclick=()=>next(null);
    if($('weaveBtn'))$('weaveBtn').onclick=()=>{const run=S.run;if(run.woven.length<WEAVE_MAX){run.woven.push(F.key);next(null)}else showUnweave(run,F.key,()=>next(null),showEnd)};
  }
  $('scr').dataset.end=String(S.uid);
}

/* ---------- The road: a fork in the red thread, the weavery, the spinning wheel ---------- */
const roadMeta=run=>`<div class="meta">${run.knots.length?`<span>${knotRow(run)}</span>`:''}<span>金线 <b>${run.gold}</b></span><span>生命 <b>${run.hp} / ${run.maxhp}</b></span><span>牌组 <b>${run.deck.length}</b></span></div>`;
const pageHd=(t,run)=>MAST(`<span class="page">${SVG.FLEUR}${t}${SVG.FLEUR}</span>${roadMeta(run)}`);
// the journey frieze with the coming floor lit
const journey=run=>`<div class="journey ip">${run.foes.map((k,i)=>`<span class="jn ${i<run.stage?'done':i===run.stage?'next':''}"><em>${ROM[i+1]}</em><i></i><span>${i<=run.stage?FOE[k].name:''}</span></span>`).join('')}</div>`;
// the coming foe, hung beside the road as a small hunting tapestry
function nextFoe(run){
  const F=FOE[run.foes[run.stage]];
  return `<aside class="nfoe ip"><div class="pic" style="background-image:url(${F.portrait})" role="img" aria-label="${F.name}"></div>
    <div class="cap"><span class="fl">下一层 · 第 ${ROM[run.stage+1]} 层</span><h3>${F.name}</h3><small>${EN[F.key]}</small>
      <span class="hp">${SVG.HEART}生命 <b>${F.hp}</b></span><p>${F.rules[0]}</p></div></aside>`;
}
// what you carry: life, gold, the deck in short, knots and woven foes
function pack(run){
  const st=run.deck.filter(k=>CARDS[k].st).length,tg=run.deck.filter(k=>CARDS[k].t==='诅咒').length;
  return `<aside class="pack pp"><h4 class="sh sm">行囊</h4>
    <div class="hpbar" title="生命"><span style="width:${Math.round(100*run.hp/run.maxhp)}%"></span><b>${SVG.HEART}${run.hp} / ${run.maxhp}</b></div>
    <div class="purse"><i>${SVG.KNOT}</i><b>${run.gold}</b><small>金线</small></div>
    <p class="dk">牌组 <b>${run.deck.length}</b> 张${st?` · 绣过 <b>${st}</b>`:''}${tg?` · 乱线 <b>${tg}</b>`:''}</p>
    ${run.knots.length?`<ul class="knotlist">${run.knots.map(k=>`<li><i>${SVG.KNOT}</i><b>${KNOTS[k].n}</b><span>${KNOTS[k].d}</span></li>`).join('')}</ul>`:'<p class="none">还没有线结</p>'}
    ${run.woven.length?`<ul class="knotlist">${run.woven.map(k=>`<li><i class="wvi" style="background-image:url(img/weaves/${k}.png)"></i><b>${WEAVES[k].n}</b><span>${WEAVES[k].d}</span></li>`).join('')}</ul>`:''}</aside>`;
}
// the red thread drops from a knot and splits into one strand per choice; each strand ends in a woven picture
function showFork(run,done){
  const opts=forkOptions(run),n=opts.length,more=run.road.includes('fork');
  openScr('road',pageHd('岔路',run),`<div class="body forkpg">
    ${nextFoe(run)}
    <div class="fmain"><h2 class="ttl">红线在这里分岔</h2>
      <p class="lead">选一股走下去，尽头是第 ${ROM[run.stage+1]} 层的 <b>${FOE[run.foes[run.stage]].name}</b>${more?'；走完这一股，红线还会再分一次':''}</p>
      <div class="strands" style="--n:${n}"><span class="spool">${SVG.KNOT}</span>
        <svg class="split" viewBox="0 0 ${n*100} 60" preserveAspectRatio="none" aria-hidden="true">${opts.map((k,i)=>`<path data-i="${i}" d="M${n*50} 0C${n*50} 34 ${i*100+50} 26 ${i*100+50} 60"/>`).join('')}</svg>
        ${opts.map((k,i)=>{const T=THREADS[k];return `<button class="strand" data-k="${k}" data-i="${i}"><span class="pic" style="background-image:url(img/road/${k}.jpg)"><em class="tg ${T.tg[1]}">${T.tg[0]}</em></span>
          <span class="tx"><b>${T.n}</b><small>${T.la}</small><span class="d">${T.d}</span><ul class="peek">${T.peek(run).map(x=>`<li>${x}</li>`).join('')}</ul></span>
          <span class="pick">${SVG.SHUTTLE}${T.to}</span></button>`}).join('')}</div></div>
    ${pack(run)}
    ${journey(run)}</div>`);
  const paths=document.querySelectorAll('.split path');
  document.querySelectorAll('.strand').forEach(b=>{const p=paths[+b.dataset.i];
    b.onmouseenter=b.onfocus=()=>p.classList.add('hot');b.onmouseleave=b.onblur=()=>p.classList.remove('hot');
    b.onclick=()=>THREADS[b.dataset.k].go(run,done)});
}
// a short page on the road; pic names one of the road pictures img/rd_<pic>.jpg
function showNote(run,title,html,done,pic){
  openScr('road',pageHd(title,run),`<div class="body"><div class="pp note ${pic?'pic':''}">${pic?`<span class="np" style="background-image:url(img/road/${pic}.jpg)"></span>`:''}<p>${html}</p><div class="acts"><button class="btn go" id="goOn">${SVG.SHUTTLE}继续上路</button></div></div></div>`,'goOn');
  $('goOn').onclick=done;
}
// the weavery's prices: stitching and unpicking cost more each time you do them in a run
const PRICE={card:45,ks:80,time:35,mend:25};
const sewPrice=run=>40+15*run.sewn,cutPrice=run=>50+25*run.cut;
function stockFor(run){
  const K=CLASSES[run.cls],cls=rewardPool(run,{reward:[]});
  const more=shuffle(K.pool.filter(k=>!cls.includes(k)&&!CARDS[k].ks))[0];
  const time=shuffle(Object.keys(CARDS).filter(k=>!CARDS[k].a&&!k.includes('+')&&CARDS[k].t!=='诅咒'))[0];
  return cls.concat(more,time).map(k=>({k,p:CARDS[k].ks?PRICE.ks:CARDS[k].a?PRICE.card:PRICE.time}));
}
function knotWare(run){const k=shuffle(knotPool(run))[0];return k?{k,p:100+10*run.stage}:null
}
// what the old weaver says: a greeting by how full your purse is, then a word on whatever you just did
const WEAVER={rich:['金线不少嘛。好布配好牌，慢慢挑。','这么多金线，够把整面墙都绣一遍了。'],poor:['钱袋空了？看看也不收钱。','金线不够就去打怪，楼上多的是。'],
  mid:['进来吧，外面的线都乱了。','牌是织出来的，不顺手就拆了重织。','往上走的人，都在我这儿换过一身线。'],
  buy:k=>`「${CARDS[k].n}」织得紧，好好用。`,knot:k=>`「${KNOTS[k].n}」系牢了，整局都不会松。`,sew:k=>`绣好了，「${CARDS[k].n}」比原来顺手。`,
  cut:k=>`「${CARDS[k].n}」拆下来了，线我留着。`,mend:'伤口缝上了。别再撕开。'};
const weaverHi=run=>rnd(run.gold<PRICE.time?WEAVER.poor:run.gold>=150?WEAVER.rich:WEAVER.mid);
// the deck, folded: each card once with its count, stitched ones gilded, curses in madder
const deckFold=(run,cls='')=>{const n={};run.deck.forEach(k=>n[k]=(n[k]||0)+1);
  return `<div class="deck ${cls}">${Object.keys(n).map(k=>`<span class="${CARDS[k].st?'st':''} ${CARDS[k].t==='诅咒'?'cu':''}" title="${CARDS[k].d}"><i style="background-image:url(img/cards/${baseOf(k)}.jpg)"></i>${CARDS[k].n}${CARDS[k].st?'·'+STITCH[CARDS[k].st].n:''}${n[k]>1?`<em>×${n[k]}</em>`:''}</span>`).join('')}</div>`};
function showShop(run,done,said){
  const st=run.stall??={stock:stockFor(run),knot:knotWare(run),mended:false};st.hi??=weaverHi(run);
  const leave=()=>{delete run.stall;done()},back=say=>showShop(run,done,say);
  const pay=p=>{if(run.gold<p)return false;run.gold-=p;return true};
  const tag=(sold,p)=>`<span class="price ${sold?'':run.gold<p?'short':''}">${sold?'已售':`${p} 金线`}${!sold&&run.gold<p?`<small>还差 ${p-run.gold}</small>`:''}</span>`;
  openScr('shop',pageHd('织坊',run),`<div class="body shoppg">
    <aside class="weaver ip"><div class="pic" style="background-image:url(img/road/weaver.jpg)" role="img" aria-label="老织娘"></div>
      <div class="cap"><h3>老织娘</h3><small>THE OLD WEAVER</small></div><p class="say">${said||st.hi}</p>
      <div class="purse"><i>${SVG.KNOT}</i><b>${run.gold}</b><small>金线</small></div><p class="trade" id="trade">指向一件货，看看买下之后</p></aside>
    <div class="smain">
      <section class="pp"><h4 class="sh">货架</h4><p class="lead">职业牌 ${PRICE.card} · 基石 ${PRICE.ks} · 时间牌 ${PRICE.time} · 线结 ${st.knot?st.knot.p:'—'}</p>
        <div class="shelf">${st.stock.map((w,i)=>`<div class="ware ${w.sold?'sold':''}">${cardHtml(w.k,{attr:`data-i="${i}"`,off:w.sold||run.gold<w.p})}${tag(w.sold,w.p)}</div>`).join('')}
        ${st.knot?`<div class="ware ${st.knot.sold?'sold':''}"><button class="kware" id="knotBuy" ${st.knot.sold||run.gold<st.knot.p?'disabled':''}>${knotFace(st.knot.k)}</button>${tag(st.knot.sold,st.knot.p)}</div>`:''}</div></section>
      <section class="pp"><h4 class="sh sm">手艺</h4><div class="crafts">
        <button class="craft art" id="sewBtn" ${run.gold<sewPrice(run)?'disabled':''}><i style="background-image:url(img/crafts/sew.jpg)"></i><span><b>加绣</b><small>给一张牌绣上轻线、锋线或回线</small><small class="nx">绣过 ${run.sewn} 次 · 下次 ${sewPrice(run)+15}</small></span><em>${sewPrice(run)}</em></button>
        <button class="craft art" id="cutBtn" ${run.gold<cutPrice(run)||run.deck.length<=5?'disabled':''}><i style="background-image:url(img/crafts/cut.jpg)"></i><span><b>拆线</b><small>${run.deck.length<=5?'牌组只剩 5 张，拆不动了':'把一张牌从牌组里拆掉'}</small><small class="nx">拆过 ${run.cut} 次 · 下次 ${cutPrice(run)+25}</small></span><em>${cutPrice(run)}</em></button>
        <button class="craft art" id="mendBtn" ${run.gold<PRICE.mend||st.mended||run.hp>=run.maxhp?'disabled':''}><i style="background-image:url(img/crafts/mend.jpg)"></i><span><b>缝补</b><small>${st.mended?'这次已经缝补过了':run.hp>=run.maxhp?'生命是满的':'回复 15 点生命'}</small><small class="nx">每次进织坊一次</small></span><em>${PRICE.mend}</em></button>
      </div></section>
      <section class="pp"><h4 class="sh sm">你的牌组 · ${run.deck.length} 张</h4>${deckFold(run)}</section>
      <div class="acts end"><button class="btn go" id="goOn">${SVG.SHUTTLE}离开织坊</button></div></div></div>`,'goOn',said!=null);
  // pointing at a ware shows what buying it leaves you with
  const trade=(p,what)=>$('trade').innerHTML=run.gold<p?`还差 <b>${p-run.gold}</b> 金线`:`金线 ${run.gold} → <b>${run.gold-p}</b>${what}`;
  document.querySelectorAll('.shelf .ware').forEach((w,i)=>{const it=i<st.stock.length?st.stock[i]:st.knot;if(it.sold)return;
    w.onmouseenter=()=>trade(it.p,i<st.stock.length?` · 牌组 ${run.deck.length} → <b>${run.deck.length+1}</b>`:` · 线结 +1`);w.onmouseleave=()=>$('trade').textContent='指向一件货，看看买下之后'});
  document.querySelectorAll('.shelf .card').forEach(b=>b.onclick=()=>{const w=st.stock[+b.dataset.i];if(w.sold||!pay(w.p))return;
    w.sold=true;run.deck.push(w.k);if(CARDS[w.k].a)(run.picks??=[]).push(w.k);back(WEAVER.buy(w.k))});
  if($('knotBuy'))$('knotBuy').onclick=()=>{if(st.knot.sold||!pay(st.knot.p))return;st.knot.sold=true;run.knots.push(st.knot.k);back(WEAVER.knot(st.knot.k))};
  $('sewBtn').onclick=()=>showSew(run,sewPrice(run),k=>back(WEAVER.sew(k)),()=>back(''));
  $('cutBtn').onclick=()=>showCut(run,k=>back(k?WEAVER.cut(k):''));
  $('mendBtn').onclick=()=>{if(!pay(PRICE.mend))return;st.mended=true;run.hp=Math.min(run.maxhp,run.hp+15);back(WEAVER.mend)};
  $('goOn').onclick=leave;
}
function showWheel(run,done){
  const h=wheelHeal(run);
  openScr('road',pageHd('纺车',run),`<div class="body"><h2 class="ttl">在纺车边歇一歇</h2><p class="lead">炉火正旺，两件事只来得及做一件</p>
    <div class="wheelpg"><span class="scene" style="background-image:url(img/road/wheel.jpg)"></span>
      <div class="crafts two">
        <button class="craft art big" id="restBtn" ${h?'':'disabled'}><i style="background-image:url(img/crafts/mend.jpg)"></i><span><b>歇息</b><small>${h?`回复 ${h} 点生命`:'生命是满的'}</small>
          <span class="hpbar"><span style="width:${Math.round(100*run.hp/run.maxhp)}%"></span><span class="gain" style="left:${Math.round(100*run.hp/run.maxhp)}%;width:${Math.round(100*h/run.maxhp)}%"></span><b>${run.hp} → ${run.hp+h} / ${run.maxhp}</b></span></span></button>
        <button class="craft art big" id="sewBtn" ${run.deck.some(k=>stitchesFor(k).length)?'':'disabled'}><i style="background-image:url(img/crafts/sew.jpg)"></i><span><b>织补</b><small>免费给一张牌加绣（织坊里要 ${sewPrice(run)} 金线）</small>
          <small class="nx">能绣的牌 ${run.deck.filter(k=>stitchesFor(k).length).length} 张</small></span></button></div></div>
    ${journey(run)}</div>`);
  $('restBtn').onclick=()=>{run.hp+=h;done()};
  $('sewBtn').onclick=()=>showSew(run,0,done,()=>showWheel(run,done));
}
// why a card or a stitch can't be sewn
const noSew=k=>CARDS[k].st?`已绣${STITCH[CARDS[k].st].n}`:CARDS[k].t==='诅咒'?'乱线不能绣':'没有合适的绣纹';
// stitching, two steps on one page. First pick a card: the three stitches hang above the deck, and pointing at one lights the
// cards that can take it. Then the card sits in the embroidery hoop, each stitch shows the card it would make, and you confirm.
// cost 0 is the spinning wheel's free stitch; done(id) gets the stitched card
function showSew(run,cost,done,cancel=done,sel=null){
  const can=run.deck.map(k=>stitchesFor(k));
  const fee=cost?`这次加绣 <b>${cost}</b> 金线 · 你有 <b>${run.gold}</b>`:'纺车边的织补 · <b>免费</b>';
  if(sel==null){
    openScr('shop',pageHd('加绣',run),`<div class="body sewpg">
      <h2 class="ttl">挑一张牌加绣</h2><p class="lead">${fee}</p>
      <div class="stlegend">${Object.keys(STITCH).map(x=>`<button class="stx" data-s="${x}"><i style="background-image:url(img/stitches/${x}.jpg)"></i><span><b>${STITCH[x].n}</b><small>${STITCH[x].d}</small><small class="nx">能绣 ${can.filter(c=>c.includes(x)).length} 张</small></span></button>`).join('')}</div>
      <section class="pp"><h4 class="sh sm">牌组 · 能绣的 ${can.filter(c=>c.length).length} 张</h4>
        <div class="rewards deckpick">${run.deck.map((k,i)=>`<span class="dp" data-s="${can[i].join(' ')}">${cardHtml(k,{attr:`data-i="${i}"`,off:!can[i].length})}${can[i].length?`<span class="sts">${can[i].map(x=>`<i style="background-image:url(img/stitches/${x}.jpg)" title="${STITCH[x].n}"></i>`).join('')}</span>`:`<span class="why">${noSew(k)}</span>`}</span>`).join('')}</div></section>
      <div class="acts end"><button class="btn" id="backBtn">${SVG.REDO}算了</button></div></div>`,'backBtn');
    // pointing at a stitch lights the cards that can take it; a click pins it
    const dps=document.querySelectorAll('.dp');let lock=null;
    const dim=s=>dps.forEach(d=>d.classList.toggle('dim',!!s&&!d.dataset.s.split(' ').includes(s)));
    document.querySelectorAll('.stx').forEach(b=>{const s=b.dataset.s;
      b.onmouseenter=b.onfocus=()=>dim(s);b.onmouseleave=b.onblur=()=>dim(lock);
      b.onclick=()=>{lock=lock===s?null:s;document.querySelectorAll('.stx').forEach(x=>x.classList.toggle('on',x.dataset.s===lock));dim(lock)}});
    document.querySelectorAll('.deckpick .card').forEach(b=>b.onclick=()=>showSew(run,cost,done,cancel,+b.dataset.i));
    $('backBtn').onclick=cancel;return;
  }
  const k=run.deck[sel],ok=can[sel];let pick=ok[0];
  const after=x=>{const id=k+'+'+x;card(id);return id};
  // the change a stitch makes, written under the stitched card
  const diff=x=>{const A=card(after(x)),C=CARDS[k];return x==='light'?(C.c>0?`费用 ${C.c} → ${A.c}`:`怒气 ${C.r} → ${A.r}`):x==='edge'?'每次伤害 +4':'打出后 → 牌库顶'};
  const lbl=x=>`绣上${STITCH[x].n}${cost?` · ${cost} 金线`:''}`;
  openScr('shop',pageHd('加绣',run),`<div class="body sewpg">
    <h2 class="ttl">挑一种绣纹</h2><p class="lead">${fee}</p>
    <div class="hoopwrap">
      <div class="hoop"><span class="ring"></span>${cardHtml(k)}<small>绣之前</small></div>
      <span class="arrow"></span>
      <div class="hoop aft"><span class="ring"></span><span id="aftCard">${cardHtml(after(pick))}</span><small id="aftDiff">${diff(pick)}</small></div>
      <div class="stitchlist">${Object.keys(STITCH).map(x=>`<button class="stx ${x===pick?'on':''}" data-s="${x}" ${ok.includes(x)?'':'disabled'}><i style="background-image:url(img/stitches/${x}.jpg)"></i><span><b>${STITCH[x].n}</b><small>${ok.includes(x)?STITCH[x].d:STITCH[x].no}</small></span></button>`).join('')}</div></div>
    <div class="acts end"><button class="btn" id="backBtn">${SVG.REDO}换一张</button><button class="btn go" id="sewGo" ${run.gold<cost?'disabled':''}>${SVG.SHUTTLE}<span id="sewLbl">${lbl(pick)}</span></button></div></div>`,'sewGo');
  document.querySelectorAll('.stitchlist .stx').forEach(b=>b.onclick=()=>{pick=b.dataset.s;
    document.querySelectorAll('.stitchlist .stx').forEach(x=>x.classList.toggle('on',x===b));
    $('aftCard').innerHTML=cardHtml(after(pick));$('sewLbl').textContent=lbl(pick);$('aftDiff').textContent=diff(pick);
    if(!CALM)gsap.from('#aftCard .card',{scale:.9,opacity:.4,duration:.3,ease:'back.out(2)',clearProps:'transform,opacity'})});
  $('sewGo').onclick=()=>{if(run.gold<cost)return;run.gold-=cost;if(cost)run.sewn++;const id=after(pick);run.deck[sel]=id;done(id)};
  $('backBtn').onclick=()=>showSew(run,cost,done,cancel);
}
// pick one card of the deck; onPick gets its index. head is the page title, sub the line under it
function pickCard(run,title,head,onPick,back,sub=''){
  openScr('shop',pageHd(title,run),`<div class="body sewpg"><h2 class="ttl">${head}</h2>${sub?`<p class="lead">${sub}</p>`:''}
    <section class="pp"><h4 class="sh sm">牌组 · ${run.deck.length} 张</h4><div class="rewards deckpick">${run.deck.map((k,i)=>`<span class="dp">${cardHtml(k,{attr:`data-i="${i}"`})}</span>`).join('')}</div></section>
    <div class="acts end"><button class="btn" id="backBtn">${SVG.REDO}算了</button></div></div>`);
  document.querySelectorAll('.deckpick .card').forEach(b=>b.onclick=()=>onPick(+b.dataset.i));
  $('backBtn').onclick=back;
}
function unpick(run,i){const [k]=run.deck.splice(i,1);if(run.picks){const j=run.picks.lastIndexOf(k);if(j>=0)run.picks.splice(j,1)}return k}
// done(k) gets the card that was cut, or nothing when you changed your mind
function showCut(run,done){
  const p=cutPrice(run);
  pickCard(run,'拆线','拆掉哪一张？',i=>{if(run.gold<p)return;run.gold-=p;run.cut++;done(unpick(run,i))},()=>done(),`拆一张 <b>${p}</b> 金线 · 你有 <b>${run.gold}</b> · 牌组越薄，好牌来得越勤`);
}
const knotFace=k=>`<span class="kn-ic">${SVG.KNOT}</span><b>${KNOTS[k].n}</b>${KNOTS[k].cls?`<small>${CLASSES[KNOTS[k].cls].n}</small>`:'<small>线结</small>'}<span class="d">${KNOTS[k].d}</span>`;
function showKnotPick(run,done){
  const ks=shuffle(knotPool(run)).slice(0,3);
  openScr('road',pageHd('线结',run),`<div class="body"><span class="kpbanner" style="background-image:url(img/road/cache.jpg)"></span><h2 class="ttl">挑一枚线结</h2><p class="lead">线结整局都在，每枚改写一条小规则</p>
    <div class="fork">${ks.map(k=>`<button class="thr kn" data-k="${k}">${knotFace(k)}</button>`).join('')}</div>
    <div class="acts end"><button class="btn" id="skipBtn">${SVG.SKIP}都不要</button></div></div>`);
  document.querySelectorAll('.thr.kn').forEach(b=>b.onclick=()=>{run.knots.push(b.dataset.k);done()});
  $('skipBtn').onclick=done;
}

// the loom holds WEAVE_MAX foes: weaving a new one unravels one you pick
function showUnweave(run,key,done,back){
  openScr('road',pageHd('织入',run),`<div class="body"><h2 class="ttl">织机满了</h2><p class="lead">拆掉一只，才能把<b>${FOE[key].name}</b>织进去</p>
    <div class="fork">${run.woven.map(k=>`<button class="thr wvn" data-k="${k}"><span class="wv-ic" style="background-image:url(img/weaves/${k}.png)"></span><b>${WEAVES[k].n}</b><small>${FOE[k].name}</small><span class="d">${WEAVES[k].d}</span></button>`).join('')}</div>
    <div class="acts end"><button class="btn" id="backBtn">${SVG.REDO}算了</button></div></div>`);
  document.querySelectorAll('.thr.wvn').forEach(b=>b.onclick=()=>{run.woven[run.woven.indexOf(b.dataset.k)]=key;done()});
  $('backBtn').onclick=()=>{delete $('scr').dataset.end;back()};
}

/* ---------- Loose threads: road events, each a choice with a price ---------- */
// ok(run): can it show up now; each option's ok(run) greys it out, go(run,done) runs it and walks on
const rnd=a=>a[Math.floor(Math.random()*a.length)];
const TALES={
  weaver:{n:'迷途的织女',la:'THE LOST WEAVER',d:'一位织女坐在台阶上，线团散了一地。她说，只要分她一点你的命，她就把命运里的一个结让给你。',
    opts:[{t:'献出 8 点最大生命，挑一枚线结',ok:r=>r.maxhp>30&&knotPool(r).length>0,go:(r,done)=>{r.maxhp-=8;r.hp=Math.min(r.hp,r.maxhp);showKnotPick(r,done)}},
      {t:'帮她把线理好，收下 30 根金线',go:(r,done)=>{r.gold+=30;showNote(r,'迷途的织女','她把一束金线塞进你手里。金线 <b>+30</b>。',done)}}]},
  torn:{n:'破损的挂毯',la:'THE TORN TAPESTRY',d:'墙上的挂毯破了一个洞，洞里能看见别的时间。',
    opts:[{t:'花 40 金线补好它：随机一张牌加绣',ok:r=>r.gold>=40&&r.deck.some(k=>stitchesFor(k).length),go:(r,done)=>{r.gold-=40;
        const i=rnd(r.deck.map((k,i)=>i).filter(i=>stitchesFor(r.deck[i]).length)),x=rnd(stitchesFor(r.deck[i])),id=r.deck[i]+'+'+x;card(id);r.deck[i]=id;
        showNote(r,'破损的挂毯',`补好的地方多了一道绣纹：<b>${CARDS[id].n}</b> 绣上了<b>${STITCH[x].n}</b>（${STITCH[x].d}）。`,done)}},
      {t:'撕下一块：随机拆掉一张牌，拿 25 金线',ok:r=>r.deck.length>5,go:(r,done)=>{const k=unpick(r,Math.floor(Math.random()*r.deck.length));r.gold+=25;
        showNote(r,'破损的挂毯',`撕下来的那块布上织着<b>${CARDS[k].n}</b>，它离开了你的牌组。金线 <b>+25</b>。`,done)}}]},
  well:{n:'回响之井',la:'THE ECHOING WELL',d:'往井里喊一声，回来的是两声。只是第二声有点走调。',
    opts:[{t:'复制一张牌，但牌组里多一张乱线',go:(r,done)=>pickCard(r,'回响之井','复制哪一张？',i=>{r.deck.push(r.deck[i],'tangle');
        showNote(r,'回响之井',`<b>${CARDS[r.deck[i]].n}</b> 多了一张，也多了一张<b>乱线</b>（花 1 粒沙打出，本场就不再出现）。`,done)},done)},
      {t:'不出声，走开',go:(r,done)=>done()}]},
  rift:{n:'时间裂缝',la:'A RIFT IN TIME',d:'墙上裂开一道缝，缝那头传来更高处的脚步声。',ok:r=>r.stage<=3,
    opts:[{t:'踏进去：下一层换成更高一层的怪，赢了金线翻倍、多一张牌可选',go:(r,done)=>{r.foes[r.stage]=rnd(TOWER[r.stage+1]);r.rift=true;
        showNote(r,'时间裂缝',`裂缝那头等着你的是<b>${FOE[r.foes[r.stage]].name}</b>。`,done)}},
      {t:'绕开它',go:(r,done)=>done()}]},
  wheel:{n:'命运纺锤',la:'THE SPINDLE OF FATE',d:'一只纺锤悬在半空，还在自己转。',
    opts:[{t:'拨它一下',go:(r,done)=>{const n=Math.floor(Math.random()*3);
        if(n===0&&knotPool(r).length)return showKnotPick(r,done);
        if(n===1){r.hp=r.maxhp;return showNote(r,'命运纺锤','纺锤停下时，你身上的伤口都被缝好了。生命回满。',done)}
        r.deck.push('tangle');showNote(r,'命运纺锤','纺锤缠住了你的手，一张<b>乱线</b>织进了牌组。',done)}},
      {t:'别碰它',go:(r,done)=>done()}]},
  thief:{n:'窃贼的赃物',la:'THE THIEF\'S HAUL',d:'时之窃贼摊开一块布：「拿你最贵的一张，换我这里一张你没见过的。」布下面的牌背朝上。',
    opts:[{t:'换',ok:r=>r.deck.some(k=>CARDS[k].a),go:(r,done)=>{const own=r.deck.map((k,i)=>i).filter(i=>CARDS[r.deck[i]].a),top=Math.max(...own.map(i=>CARDS[r.deck[i]].c+(CARDS[r.deck[i]].r||0)/3)),
        i=rnd(own.filter(i=>CARDS[r.deck[i]].c+(CARDS[r.deck[i]].r||0)/3===top)),K=CLASSES[r.cls],nw=rnd(K.pool.filter(k=>!r.deck.includes(k))),old=unpick(r,i);r.deck.push(nw);
        showNote(r,'窃贼的赃物',`他拿走了<b>${CARDS[old].n}</b>，你翻开的是<b>${CARDS[nw].n}</b>：${CARDS[nw].d}`,done)}},
      {t:'不换',go:(r,done)=>done()}]}
};
function showTale(run,done){
  const T=rnd(Object.values(TALES).filter(t=>!t.ok||t.ok(run)));
  openScr('road',pageHd('线头',run),`<div class="body"><div class="tale ip"><span class="np" style="background-image:url(img/road/tale.jpg)"></span><span class="kick">${T.la}</span><h2>${T.n}</h2><p>${T.d}</p></div>
    <div class="taleopts">${T.opts.map((o,i)=>`<button class="craft" data-i="${i}" ${o.ok&&!o.ok(run)?'disabled':''}><i>${SVG.FLEUR}</i><span><b>${o.t}</b></span></button>`).join('')}</div></div>`);
  document.querySelectorAll('.taleopts .craft').forEach(b=>b.onclick=()=>T.opts[+b.dataset.i].go(run,done));
}

