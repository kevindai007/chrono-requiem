// Balance check: a greedy AI climbs the tower N times per class and prints clear rate and HP lost per floor.
// usage: node tools/balance/run.mjs [runs=20] [classes=warrior,rogue,mage] [js to eval first, e.g. "CARDS.dodge.c=0"]
// needs playwright (set PW to its path if it is not resolvable, e.g. PW=/opt/node-tools/node_modules/playwright/index.mjs)
import {fileURLToPath} from 'node:url';
const {chromium}=await import(process.env.PW||'playwright');
const [,,n='20',classes='warrior,rogue,mage',ovr='']=process.argv;
const here=p=>fileURLToPath(new URL(p,import.meta.url));
const b=await chromium.launch();const p=await b.newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+here('../../index.html'));await p.addScriptTag({path:here('./ai.js')});
if(ovr)await p.evaluate(ovr);
for(const cls of classes.split(',')){let wins=0;const deaths={};const loss=[0,0,0,0,0,0,0],cnt=[0,0,0,0,0,0,0];
  for(let k=0;k<+n;k++){const r=await p.evaluate(c=>AI.run(c),cls);const last=r[r.length-1];
    r.forEach(x=>{loss[x.f]+=x.loss;cnt[x.f]++});
    if(last.r==='win'&&last.f===6)wins++;else deaths[last.f+1]=(deaths[last.f+1]||0)+1;}
  console.log(`${cls}: cleared ${wins}/${n}, died on floor ${JSON.stringify(deaths)}, avg HP lost per floor ${loss.map((l,i)=>cnt[i]?Math.round(l/cnt[i]):'-').join(' ')}`);}
await b.close();
