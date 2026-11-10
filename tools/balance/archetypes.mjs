// Archetype check: the starter deck plus one archetype's keystone and five of its other cards (or six random class cards for
// 'mixed'), against random foes of floors 3-7 including the knight and the Demon King, played by the greedy AI.
// usage: node tools/balance/archetypes.mjs <class> [fights=60] [archetype key | mixed; all of them when left out]
import {fileURLToPath} from 'node:url';
const {chromium}=await import(process.env.PW||'playwright');
const [,,cls,n="60",only=""]=process.argv;
const R=fileURLToPath(new URL('../../',import.meta.url));
const b=await chromium.launch();const p=await b.newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+R+'index.html');await p.addScriptTag({path:R+'tools/balance/ai.js'});
const out=await p.evaluate(([cls,n,only])=>{SIM=true;const C=CLASSES[cls],res={};
  for(const a of (only?[only==="mixed"?null:only]:[null,...Object.keys(C.arch)])){let hp=0,turns=0,win=0;const per={};
    for(let i=0;i<n;i++){const stage=2+(i%5);
      const arc=a?C.pool.filter(k=>CARDS[k].a===a):[];const ks=arc.filter(k=>CARDS[k].ks),rest=shuffle(arc.filter(k=>!CARDS[k].ks)).slice(0,5);
      const extra=a?ks.concat(rest):shuffle(C.pool.filter(k=>!CARDS[k].ks)).slice(0,6);
      const run={stage,cls,maxhp:C.hp+5*stage,deck:GENERAL.concat(C.deck,extra),foes:rollFoes(),gold:0,road:[],sewn:0,cut:0,knots:[],woven:[],tales:[],log:[],picks:[]};
      run.hp=Math.round(run.maxhp*.85);startFight(run);const h0=S.hp;
      while(!S.over&&S.turn<=40){AI.turn();if(S.over)break;AI.endTurnSync()}
      const l=h0-S.hp;hp+=l;turns+=S.turn;if(S.over==='win')win++;const f=TOWER[stage][0];(per[stage]??=[0,0]);per[stage][0]+=l;per[stage][1]++}
    res[a||'mixed']={hp:(hp/n).toFixed(1),turns:(turns/n).toFixed(2),win:win+'/'+n,perFloor:Object.entries(per).map(([s,[l,c]])=>`F${+s+1}:${(l/c).toFixed(0)}`).join(' ')}}
  SIM=false;return res},[cls,+n,only]);
console.log(cls,JSON.stringify(out,null,1));await b.close();
