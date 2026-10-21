// greedy AI for tools/balance/run.mjs: tries every card on every target with the real rules (sim + stepBeat), keeps the best by
// damage dealt minus HP lost over this turn, plus a discounted look at the rest of the visible window
window.AI={
  targets(i){const C=CARDS[S.hand[i]],lo=S.beat,hi=S.beat+W()-1,tg=C.tg;
    if(!tg)return [undefined];
    if(tg==='h')return S.events.filter(e=>e.side==='h'&&e.beat>=lo&&e.beat<=hi).map(e=>e.id);
    if(tg==='e')return S.events.filter(e=>e.side==='e'&&e.beat>=lo&&e.beat<=hi).map(e=>e.id);
    const r=[];for(let b=lo;b<=hi;b++)r.push(b);return r},
  // resolve this turn's beats, then keep going through the visible window with no more cards (discounted)
  look(){const r={};for(let b=S.doneUpTo+1;b<S.beat+3&&!S.over;b++)stepBeat(b);r.hp=S.hp;r.ehp=S.ehp;r.over=S.over;r.rage=S.rage;r.combo=S.combo;r.sand=S.sand;
    if(!S.over){FL().turnEnd?.call(FL());for(let b=S.beat+3;b<S.beat+W()&&!S.over;b++)stepBeat(b)}
    r.hp2=S.hp;r.ehp2=S.ehp;r.over2=S.over;return r},
  score2(r,hp0,ehp0){if(r.over==='win')return 1e6+r.hp*10;if(r.over==='lose')return -1e6;
    let v=(ehp0-r.ehp)-1.3*(hp0-r.hp)+(r.rage||0)*0.3+(r.combo||0)*0.3;
    v+=0.6*(r.ehp-r.ehp2)-0.5*(r.hp-r.hp2)+(r.over2==='win'?30:0);return v},
  score(st,hp0,ehp0){if(st.over==='win')return 1e6+st.hp*10;if(st.over==='lose')return -1e6;
    return (ehp0-st.ehp)-1.3*(hp0-st.hp)+(st.rage||0)*0.3+(st.combo||0)*0.3+(st.sand>0?0.2*st.sand:0)},
  turn(){
    for(let guard=0;guard<10;guard++){
      const hp0=S.hp,ehp0=S.ehp;
      const L=()=>this.look(),base=this.score2(sim(S,L).out,hp0,ehp0);
      let best=null,bs=base+0.5;
      for(let i=0;i<S.hand.length;i++){const C=CARDS[S.hand[i]];if(C.c>S.sand||(C.r&&S.rage<C.r))continue;
        for(const t of this.targets(i)){
          const pre=sim(S,()=>commit(i,t));if(pre.out)continue;
          const v=pre.st.over?this.score(pre.st,hp0,ehp0):this.score2(sim(pre.st,L).out,hp0,ehp0);
          if(v>bs){bs=v;best=[i,t]}}}
      if(!best)break;
      commit(best[0],best[1]);if(S.over)return;
    }
  },
  endTurnSync(){const F=FL();S.discard.push(...S.hand);S.hand=[];
    for(let k=0;k<3;k++){stepBeat(S.beat+k);if(S.over)break}
    S.resolving=null;
    if(!S.over){F.turnEnd?.call(F);S.beat+=3;S.turn++;gen(S.beat+11);
      S.parriedPrev=S.parried;S.parried=false;S.dmgLast=S.dmgThis;S.dmgThis=0;S.foresight=false;
      S.lastPlayed=S.played;S.played=null;S.resThis=false;S.cry=false;S.smoke=[];
      S.sand=(CL().sand||3)-S.debt+(S.med?2:0);S.debt=0;S.med=false;S.barrier=0;S.iceArmor=false;
      F.turnStart?.call(F,false);S.sand=Math.max(0,S.sand);draw(S.drawN);S.drawN=5;}},
  fight(){while(!S.over&&S.turn<=60){this.turn();if(S.over)break;this.endTurnSync()}return S.over||'timeout'},
  // a whole climb; nextFight(run) is how the game moves to the next floor (so it follows the real rules)
  run(cls){SIM=true;newRun(0,cls);const out=[];
    for(;;){const h0=S.hp;const r=this.fight();out.push({f:S.stage,r,t:S.turn,hp:S.hp,max:S.maxhp,e:S.ehp,loss:h0-S.hp});
      if(r!=='win'||S.stage===TOWER.length-1)break;
      const pool=shuffle(CL().pool.slice()).slice(0,2).concat(shuffle(FL().reward.slice()).slice(0,1));
      const k=pool[Math.floor(Math.random()*pool.length)];
      if(typeof nextFloor==='function')nextFloor(k);else{const run=S.run;run.deck.push(k);run.maxhp+=5;run.stage++;startFight(run)}
    }
    SIM=false;return out}
};
