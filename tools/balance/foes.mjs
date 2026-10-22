// Per-foe check: the greedy AI fights each foe on its own floor N times per class (fresh run: full HP, starting deck)
// and prints win rate and average HP lost, so a new foe can be compared with the others on its floor.
// usage: node tools/balance/foes.mjs [fights=6] [classes=warrior,rogue,mage] [floors=0,1,2,3,4]
import {fileURLToPath} from 'node:url';
const {chromium}=await import(process.env.PW||'playwright');
const [,,n='6',classes='warrior,rogue,mage',floors='0,1,2,3,4']=process.argv;
const here=p=>fileURLToPath(new URL(p,import.meta.url));
const b=await chromium.launch();const p=await b.newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+here('../../index.html'));await p.addScriptTag({path:here('./ai.js')});
for(const f of floors.split(',').map(Number)){
  const keys=await p.evaluate(f=>TOWER[f],f);
  for(const k of keys){let line=`${f+1} ${k.padEnd(9)}`;
    for(const cls of classes.split(',')){
      const r=await p.evaluate(([f,k,cls,n])=>{SIM=true;let w=0,loss=0,t=0;
        for(let i=0;i<n;i++){newRun(f,cls,k);const h0=S.hp;const res=AI.fight();if(res==='win')w++;loss+=h0-S.hp;t+=S.turn}
        SIM=false;return {w,loss:Math.round(loss/n),t:(t/n).toFixed(1)}},[f,k,cls,+n]);
      line+=`  ${cls.slice(0,4)} ${r.w}/${n} −${String(r.loss).padStart(3)} t${r.t}`}
    console.log(line)}}
await b.close();
