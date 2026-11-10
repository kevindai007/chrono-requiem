// Card check: the starter deck plus two copies of one class card, against random foes of floors 2-5 at 85% HP, played by the
// greedy AI. Prints HP lost and turns per fight next to the starter deck alone, and how often the AI chose to play the card.
// usage: node tools/balance/cards.mjs <class> [fights per card=30] [cards, comma-separated | BASE for the starter deck only]
// One browser page slows down over a long session: for a whole pool, run one process per card in parallel (xargs -P4).
import {fileURLToPath} from 'node:url';
const {chromium}=await import(process.env.PW||'playwright');
const [,,cls,n='30',only='']=process.argv;
const R=fileURLToPath(new URL('../../',import.meta.url));
const b=await chromium.launch();const p=await b.newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+R+'index.html');await p.addScriptTag({path:R+'tools/balance/ai.js'});
await p.evaluate(()=>{
  window.PL={};window.HD={};
  const src=AI.turn.toString().replace('commit(best[0],best[1]);','{const kk=baseOf(S.hand[best[0]]);PL[kk]=(PL[kk]||0)+1}commit(best[0],best[1]);');
  AI.turn=eval('(function '+src.replace(/^turn/,'')+')');
  window.bench=(cls,extra,n)=>{SIM=true;let hp=0,turns=0,win=0,plays=0,held=0;const k=extra[0];
    for(let i=0;i<n;i++){const stage=1+(i%4),C=CLASSES[cls];
      const run={stage,cls,maxhp:C.hp+5*stage,deck:GENERAL.concat(C.deck,extra),foes:rollFoes(),gold:0,road:[],sewn:0,cut:0,knots:[],woven:[],tales:[],log:[],picks:[]};
      run.hp=Math.round(run.maxhp*.85);startFight(run);const h0=S.hp;PL={};
      while(!S.over&&S.turn<=40){if(k)held+=S.hand.filter(x=>baseOf(x)===k).length?1:0;AI.turn();if(S.over)break;AI.endTurnSync()}
      hp+=h0-S.hp;turns+=S.turn;if(S.over==='win')win++;if(k)plays+=PL[k]||0}
    SIM=false;return {hp:hp/n,turns:turns/n,win,plays:plays/n,held:held/n}};
});
const pool=only==='BASE'?[]:only?only.split(','):await p.evaluate(c=>CLASSES[c].pool,cls);
const t0=Date.now();
const base=only&&only!=='BASE'?{hp:0,turns:0,win:0}:await p.evaluate(([c,n])=>bench(c,[],n),[cls,+n*2]);
if(!only||only==='BASE')console.log(`BASE ${cls} hp ${base.hp.toFixed(1)} turns ${base.turns.toFixed(2)} win ${base.win}/${+n*2} (${((Date.now()-t0)/1000).toFixed(0)}s)`);
for(const k of pool){const r=await p.evaluate(([c,k,n])=>bench(c,[k,k],n),[cls,k,+n]);
  console.log(`${k}\t${r.hp.toFixed(1)}\t${r.turns.toFixed(2)}\t${r.win}/${n}\tplays ${r.plays.toFixed(2)}\theldTurns ${r.held.toFixed(2)}`)}
await b.close();
