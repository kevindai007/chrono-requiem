/* Rules data and shared helpers: cards, classes, stitches, knots, woven foes, fates, SVG glyphs, the foes and the tower.
   Loaded first; every later script reads these globals. */
const CARDS={
  swift:{n:'迅步',c:1,t:'挪移',d:'选择你的一次攻击，提前 1 拍。',tg:'h'},
  slow:{n:'迟滞',c:1,t:'挪移',d:'选择敌人的一个行动，延后 1 拍。',tg:'e'},
  swap:{n:'错位',c:1,t:'挪移',d:'选择一拍，与下一拍的全部内容互换。',tg:'pair'},
  echo:{n:'回响',c:2,t:'共鸣',d:'复制你的一次攻击，放在同一拍，触发共鸣。',tg:'h'},
  gather:{n:'收束',c:2,t:'共鸣',d:'在本回合起 4 拍内选一拍，这 4 拍内你的攻击全部移到那里。',tg:'b4'},
  charge:{n:'蓄时',c:1,t:'共鸣',d:'选择你的一次攻击，延后 2 拍，伤害 +8。',tg:'h'},
  stasis:{n:'静滞领域',c:2,t:'节奏',d:'本回合 3 拍内，敌人未锁定的行动全部延后 1 拍。'},
  haste:{n:'疾时',c:2,t:'节奏',d:'接下来 4 拍，每一拍都有你的一次攻击（6）。'},
  ghost:{n:'残影',c:1,t:'守御',d:'在一拍放置残影。敌人在该拍的攻击落空，你反击 6 点。',tg:'any'},
  rewind:{n:'回溯',c:2,t:'守御',d:'恢复上回合受到的全部伤害。',x:1},
  foresee:{n:'预知',c:0,t:'守御',d:'抽 2 张牌，本回合可多看 4 拍。'},
  stop:{n:'时停',c:3,t:'禁术',d:'敌人的时间轴整体冻结 2 拍，锁定的行动也不例外。',x:1},
  unity:{n:'万象归一',c:3,t:'禁术',d:'视野内你的全部攻击立刻一起结算，每多一次伤害再 +50%。',x:1},
  paradox:{n:'悖论',c:0,t:'禁术',d:'本回合 +2 时之砂，下回合 −3。'},
  // a curse from the road: it only clogs the hand, and paying 1 sand clears it for the rest of the fight
  tangle:{n:'乱线',c:1,t:'诅咒',d:'没有效果。打出后本场战斗不再出现。',x:1,glyph:'KNOT'},
  // warrior: rage (r) is spent instead of, or as well as, sand
  // a: the archetype (CLASSES[cls].arch) a class card belongs to; rewards lean toward the one you have taken most
  shield:{n:'举盾',c:1,t:'战士',a:'wall',d:'在一拍举盾。该拍敌人的每次攻击 −6，每挡下 1 点得 1 怒气。',tg:'any'},
  bash:{n:'盾击',c:2,t:'战士',a:'wall',d:'在一个举盾的拍追加一次攻击，伤害等于该拍敌人的伤害（4~12）。',tg:'any'},
  taunt:{n:'挑衅',c:1,t:'战士',a:'wall',d:'选择敌人的一个行动，提前 1 拍。',tg:'e'},
  cleave:{n:'裂地斩',c:0,r:4,t:'战士',a:'rage',d:'在一拍放下一次 20 点重击。重击不能被挪动。',tg:'any'},
  warcry:{n:'战吼',c:0,r:3,t:'战士',a:'rage',d:'本回合 3 拍内，你的每次攻击 +4。'},
  backwater:{n:'背水',c:0,t:'战士',a:'blood',d:'生命不到一半时才能用：你最近的一次攻击伤害翻倍。'},
  ironwall:{n:'铁壁',c:2,t:'战士',a:'wall',d:'视野内敌人最重的一次攻击伤害减半，立刻得到 5 怒气。'},
  frenzy:{n:'狂怒',c:0,r:2,ra:1,t:'战士',a:'rage',d:'消耗全部怒气，立刻造成 怒气×3 点伤害。'},
  riposte:{n:'反击架势',c:1,t:'战士',a:'wall',d:'本回合你的盾每挡下 1 点伤害，立刻反击 2 点。'},
  towershield:{n:'塔盾',c:2,t:'战士',a:'wall',d:'在一拍竖起塔盾。该拍敌人的每次攻击 −12，每挡下 1 点得 1 怒气。',tg:'any'},
  lure:{n:'引战',c:1,t:'战士',a:'wall',d:'在本回合起 4 拍内选一拍，这 4 拍内敌人未锁定的攻击全部挪到那里。',tg:'b4'},
  wrath:{n:'狂暴之心',c:1,t:'战士',a:'rage',d:'本场战斗怒气上限变为 20。',x:1},
  skybreaker:{n:'天崩',c:0,r:8,t:'战士',a:'rage',d:'在一拍放下一次 38 点重击。重击不能被挪动。',tg:'any'},
  whet:{n:'磨刃',c:1,t:'战士',a:'rage',d:'获得 4 怒气，抽 1 张牌。'},
  bloodlust:{n:'血怒',c:1,t:'战士',a:'blood',d:'本场战斗中，你生命不到一半时，每次攻击 +5。',x:1},
  gamble:{n:'搏命',c:0,t:'战士',a:'blood',d:'失去 6 点生命（不会致死），获得 5 怒气。'},
  drain:{n:'饮血',c:1,t:'战士',a:'blood',d:'本回合你每次弹反，回复造成伤害的一半。'},
  undying:{n:'不屈',c:2,t:'战士',a:'blood',d:'本场战斗第一次受到致命伤时，保留 1 点生命并回复 15 点。',x:1},
  // ks: a keystone changes one rule for the rest of the fight; rewards offer at most one, and only from the third pick on
  steadfast:{n:'不动如山',c:2,t:'战士',a:'wall',ks:1,x:1,d:'本场战斗，你的盾挡下攻击后留到下一拍（最多连留 3 拍）。'},
  breaker:{n:'破军',c:1,t:'战士',a:'rage',ks:1,x:1,d:'本场战斗，重击砸掉同一拍未锁定的敌人攻击，每砸一次 +2 怒气。'},
  quake:{n:'震地',c:0,r:3,t:'战士',a:'rage',d:'在一拍放下一次 12 点重击，命中后敌人下一次行动延后 1 拍。重击不能被挪动。',tg:'any'},
  bloodwar:{n:'血战',c:1,t:'战士',a:'blood',ks:1,x:1,d:'本场战斗，拼刀输了你那一击照样打出；拼刀赢了回复 3。'},
  grudge:{n:'怨报',c:2,t:'战士',a:'blood',d:'在一拍放一次攻击，伤害等于你上回合受到的伤害（最多 30）。',tg:'any'},
  // assassin
  dodge:{n:'闪身',c:1,t:'刺客',a:'combo',d:'选一拍，敌人在该拍的攻击落空，连击不中断。',tg:'any'},
  poison:{n:'淬毒',c:1,t:'刺客',a:'venom',d:'敌人 +4 层毒。'},
  shadow:{n:'影袭',c:1,t:'刺客',a:'mark',d:'在一拍插入一次 6 点攻击。',tg:'any'},
  finisher:{n:'绝杀',c:2,t:'刺客',a:'combo',d:'消耗全部连击，每层立刻造成 4 点伤害。'},
  smoke:{n:'烟幕',c:2,t:'刺客',a:'venom',d:'本回合 3 拍内，敌人每次攻击的伤害减半。'},
  boomerang:{n:'回旋刃',c:1,t:'刺客',a:'mark',d:'在一拍放一次 5 点攻击，2 拍后再命中一次。',tg:'any'},
  mark:{n:'标记',c:1,t:'刺客',a:'mark',d:'标记一拍，那一拍你的伤害翻倍。',tg:'any'},
  assassinate:{n:'暗杀',c:3,t:'刺客',a:'mark',d:'敌人生命低于 25% 时直接击杀（魔王改为 40 点伤害）。',x:1},
  momentum:{n:'余势',c:1,t:'刺客',a:'combo',d:'本场战斗连击上限变为 12，连击中断时只掉一半。',x:1},
  vanish:{n:'影遁',c:2,t:'刺客',a:'combo',d:'本回合 3 拍你全部闪身。'},
  flurry:{n:'乱刃',c:1,t:'刺客',a:'combo',d:'本回合 3 拍，每拍多一次 2 点攻击（与普攻共鸣）。'},
  ready:{n:'蓄势',c:0,t:'刺客',a:'combo',d:'连击 +2。'},
  venomblade:{n:'毒刃',c:1,t:'刺客',a:'venom',d:'本回合你的攻击每命中一次，敌人 +2 层毒。'},
  corrode:{n:'蚀骨',c:1,t:'刺客',a:'venom',d:'敌人的毒层数翻倍。'},
  detonate:{n:'毒爆',c:2,t:'刺客',a:'venom',d:'立刻造成 毒层×2 点伤害，毒层不减。'},
  converge:{n:'聚刃',c:1,t:'刺客',a:'mark',d:'选一个标记过的拍，本回合起 4 拍内你的攻击全部挪到那里。',tg:'any'},
  expose:{n:'破绽',c:2,t:'刺客',a:'mark',d:'标记一拍，那一拍你的伤害 ×3。',tg:'any'},
  clone:{n:'分影',c:1,t:'刺客',a:'mark',d:'在一拍插入两次 4 点攻击（自带共鸣）。',tg:'any'},
  shift:{n:'换影',c:1,t:'刺客',a:'combo',d:'选敌人的一次攻击，挪到它后面最近的另一次敌人攻击的拍上。',tg:'e'},
  zanshin:{n:'残心',c:1,t:'刺客',a:'combo',ks:1,x:1,d:'本场战斗，你每闪开一次攻击，连击 +1，并反刺 3 点。'},
  toxin:{n:'毒发',c:1,t:'刺客',a:'venom',d:'本回合你的连击每 +1，敌人 +1 层毒。'},
  plague:{n:'瘟疫',c:2,t:'刺客',a:'venom',ks:1,x:1,d:'本场战斗，毒上限 30，不再每拍减层，改为每回合结束减半。'},
  omen:{n:'死兆',c:1,t:'刺客',a:'mark',ks:1,x:1,d:'本场战斗，标记的拍上你打出了伤害，标记就移到下一拍。'},
  // mage: a spell with cast:n takes n beats; it goes off on the last one unless a hit lands inside the window
  fireball:{n:'火球',c:1,t:'法师',a:'chain',cast:2,el:'火',dmg:16,d:'吟唱 2 拍，造成 16 点火焰伤害。',tg:'cast'},
  icelance:{n:'寒冰枪',c:1,t:'法师',a:'ice',cast:1,el:'冰',dmg:9,frz:1,d:'吟唱 1 拍，9 点冰伤，敌人下一次攻击延后 1 拍。',tg:'cast'},
  chain:{n:'雷链',c:2,t:'法师',a:'grand',cast:3,el:'雷',dmg:10,hits:3,d:'吟唱 3 拍，连续 3 次 10 点雷伤。',tg:'cast'},
  meteor:{n:'流星',c:3,t:'法师',a:'grand',cast:5,el:'火',dmg:40,d:'吟唱 5 拍，40 点火焰伤害。',tg:'cast'},
  barrier:{n:'法力屏障',c:1,t:'法师',a:'grand',d:'本回合内，你的吟唱第一次被打中时不会中断。'},
  quick:{n:'瞬发',c:0,t:'法师',a:'chain',d:'下一张法术的吟唱时间 −2（最少 1 拍）。'},
  meditate:{n:'冥想',c:0,t:'法师',a:'grand',d:'跳过你最近的一次普通攻击，下回合 +2 时之砂。'},
  frostarmor:{n:'冰甲',c:1,t:'法师',a:'ice',d:'本回合你受到的每次伤害 −3。'},
  spark:{n:'电火花',c:0,t:'法师',a:'chain',cast:1,el:'雷',dmg:4,d:'吟唱 1 拍，4 点雷伤。',tg:'cast'},
  ember:{n:'余烬',c:0,t:'法师',a:'chain',cast:1,el:'火',dmg:4,d:'吟唱 1 拍，4 点火焰伤害。',tg:'cast'},
  prism:{n:'棱镜',c:1,t:'法师',a:'chain',d:'本回合隔 2 拍的法术也能反应，连锁每层再 +4。'},
  trinity:{n:'三相咒',c:2,t:'法师',a:'chain',cast:3,el:'火',dmg:6,tri:1,d:'吟唱 3 拍，这 3 拍依次释放火、冰、雷，各 6 点（自带两次反应）。',tg:'cast'},
  overcharge:{n:'超载',c:1,t:'法师',a:'grand',d:'下一张法术的吟唱时间 +2，伤害翻倍。'},
  manaflow:{n:'法力回流',c:0,t:'法师',a:'grand',d:'本回合吟唱被打断时，下回合返还它的时之砂。'},
  aria:{n:'时之咏叹',c:2,t:'法师',a:'grand',cast:4,el:'雷',dmg:30,d:'吟唱 4 拍，30 点雷伤。',tg:'cast'},
  glacier:{n:'冰川',c:2,t:'法师',a:'ice',cast:2,el:'冰',dmg:10,frz:2,d:'吟唱 2 拍，10 点冰伤，敌人接下来两次攻击各延后 1 拍。',tg:'cast'},
  nova:{n:'霜冻新星',c:1,t:'法师',a:'ice',d:'霜冻 +2。'},
  rime:{n:'寒霜印记',c:1,t:'法师',a:'ice',d:'本场战斗中，敌人的行动每被你推迟一次，受到 4 点冰伤。',x:1},
  tide:{n:'元素潮汐',c:1,t:'法师',a:'chain',ks:1,x:1,d:'本场战斗，每次元素反应让下回合 +1 沙（每回合最多 +3）。'},
  linger:{n:'余韵',c:2,t:'法师',a:'grand',ks:1,x:1,d:'本场战斗，吟唱 4 拍以上的法术释放后，下一拍再响一次，伤害减半。'},
  zero:{n:'绝对零度',c:2,t:'法师',a:'ice',ks:1,x:1,d:'本场战斗，被冻碎的攻击以 ×2 伤害反噬敌人，并算一次冰法术。'},
  frostfire:{n:'霜火',c:1,t:'法师',a:'ice',d:'消耗全部霜冻，每层让你下一张火焰法术 +6 伤害。'}
};
// two spells of different elements going off on the same or adjacent beats react; reactions in a row build a chain, +CHAIN per link
const CHAIN=4;
// the mage's frost: each delay you put on an enemy action adds one; at FROST the enemy's next attack shatters
const FROST=3;
const REACT={'火冰':{n:'碎裂',dmg:10},'冰火':{n:'碎裂',dmg:10},'冰雷':{n:'感电',dmg:8,frz:1},'雷冰':{n:'感电',dmg:8,frz:1},'雷火':{n:'爆燃',dmg:12},'火雷':{n:'爆燃',dmg:12}};
// the time cards are shared by every class; each class starts with the same five
const GENERAL=['swift','slow','swap','ghost','foresee'];
const CLASSES={
  warrior:{n:'战士',hp:80,atk:{every:2,dmg:7},
    sub:'迎着刀上，以伤换伤',
    rule:'你每 <b>2 拍</b>自动攻击一次（7 点）。<b>怒气</b>：举盾挡下伤害、被打中（+2）、弹反（+2）都会攒怒气，上限 10，整场战斗不清空。红色费用的牌花的是怒气。',
    arch:{wall:'铁壁',rage:'重击',blood:'背水'},
    pitch:'想要敌人出手的拍。把盾放在敌人的攻击上，挡下的伤害变成怒气，再用怒气打出不能挪动的重击。',
    deck:['shield','shield','shield','bash','grudge','taunt','cleave','warcry','ironwall'],
    pool:['shield','bash','taunt','cleave','warcry','backwater','ironwall','frenzy','riposte','towershield','lure','wrath','skybreaker','whet','bloodlust','gamble','drain','undying','steadfast','breaker','quake','bloodwar','grudge']},
  rogue:{n:'刺客',hp:70,atk:{every:1,dmg:2},
    sub:'在缝隙里连刺',
    rule:'你<b>每一拍</b>都自动攻击一次（2 点）。<b>连击</b>：没有敌人干扰的拍命中一次，连击 +1，每 2 层让每拍伤害 +1（上限 8 层）。你那一拍被敌人攻击（哪怕拼刀赢了）或没攻击，连击归零。<b>背刺</b>：敌人不出手的拍，伤害 +1。<b>毒</b>：敌人每拍受到 毒层数 点伤害（无视护甲），然后毒减 1 层，最多 15 层。',
    arch:{combo:'连击',venom:'淬毒',mark:'标记'},
    pitch:'想要连续的空拍。避开敌人的攻击拍，在中间连续出手，越连越痛。和敌人拼刀反而会断掉连击。',
    deck:['dodge','dodge','poison','shift','shadow','finisher','boomerang','mark','smoke'],
    pool:['dodge','poison','shadow','finisher','smoke','boomerang','mark','assassinate','momentum','vanish','flurry','ready','venomblade','corrode','detonate','converge','expose','clone','shift','zanshin','toxin','plague','omen']},
  mage:{n:'法师',hp:90,sand:4,atk:{every:3,dmg:4},
    sub:'守住时间的空窗',
    rule:'你每 <b>3 拍</b>自动攻击一次（4 点），每回合 <b>4 粒时之砂</b>。<b>吟唱</b>：法术要吟唱好几拍，在最后一拍释放；吟唱期间你被敌人打中就会中断，法术作废、沙不退。<b>释放那一拍法术也参与拼刀</b>：法术伤害高过敌人那一击就弹反，挡下它。<b>元素反应</b>：火、冰、雷两种不同元素在同一拍或相邻两拍释放，触发碎裂（火+冰 +10）、感电（冰+雷 +8，敌人下一击延后）或爆燃（雷+火 +12）。<b>连锁</b>：反应一个接一个，每多一环反应伤害 +4。<b>霜冻</b>：你每把敌人的行动推迟一次，霜冻 +1，到 3 层时敌人下一次未锁定的攻击被冻碎。',
    arch:{chain:'连锁',grand:'大咒',ice:'冰封'},
    pitch:'想要敌人不出手的空窗。把吟唱塞进敌人两次攻击之间，用迟滞、寒冰枪把攻击推出窗口，再排好元素的先后。',
    deck:['fireball','fireball','icelance','icelance','chain','barrier','quick','meditate','frostarmor'],
    pool:['fireball','icelance','chain','meteor','barrier','quick','meditate','frostarmor','spark','ember','prism','trinity','overcharge','manaflow','aria','glacier','nova','rime','tide','linger','zero','frostfire']}
};
/* ---------- The weavery's stitches: a stitched card is its own entry, CARDS['fireball+edge'], built from the base card ---------- */
// base: the card it was stitched from (its art and rules), st: its stitch. A card takes one stitch at most
const EDGE=['echo','shadow','clone','boomerang','cleave','skybreaker','quake','bash','grudge','frenzy','finisher','detonate'];
const STITCH={
  light:{n:'轻线',d:'费用 −1（怒气牌 −1 怒气）',sd:'费用 −1',no:'费用已经最低了',ok:C=>C.c>0||(C.r||0)>1},
  edge:{n:'锋线',d:'这张牌打出的每次伤害 +4',sd:'每次伤害 +4',no:'只有造成伤害的牌能绣',ok:(C,k)=>!!C.cast||EDGE.includes(k)},
  loop:{n:'回线',d:'打出后放回牌库顶，而不是弃牌堆',sd:'打出后回到牌库顶',no:'消耗牌不能绣',ok:C=>!C.x}
};
const baseOf=k=>k.split('+')[0];
function card(k){
  if(CARDS[k])return CARDS[k];
  const [b,st]=k.split('+'),B=CARDS[b],C={...B,base:b,st};
  if(st==='light'){if(B.c>0)C.c=B.c-1;else C.r=B.r-1}
  return CARDS[k]=C;
}
const stitchesFor=k=>CARDS[k].st||CARDS[k].t==='诅咒'?[]:Object.keys(STITCH).filter(s=>STITCH[s].ok(CARDS[k],k));
/* ---------- Knots: passives that last the whole run, each bending one small rule ---------- */
// cls: only offered to that class. The hooks read hasK(key) where the rule lives
const KNOTS={
  hourglass:{n:'沙漏坠',d:'每场战斗第一回合 +1 时之砂。'},
  shuttle:{n:'金梭',d:'每回合第一张挪移牌不花时之砂。'},
  shears:{n:'断线剪',d:'每场战斗第一次弹反，额外造成 12 点伤害。'},
  spyglass:{n:'望远线',d:'时间轴视野永久 +2 拍。'},
  rope:{n:'打结绳',d:'每场战斗中，生命低于 30% 后受到的第一次伤害减半。'},
  spindle:{n:'纺锤',d:'每场战斗开局多抽 1 张牌。'},
  abacus:{n:'算盘线',d:'胜利拿到的金线 +30%。'},
  black:{n:'黑线',d:'每场战斗敌人开局少 10% 生命；但层与层之间不再回复生命。'},
  jar:{n:'沙罐',d:'回合结束时没用完的时之砂，留 1 粒到下回合。'},
  rustnail:{n:'锈盾钉',cls:'warrior',d:'每场战斗开局有 3 点怒气。'},
  whetstone:{n:'磨石',cls:'warrior',d:'每回合你放下的第一次重击伤害 +6。'},
  venomsac:{n:'毒囊',cls:'rogue',d:'每场战斗开局敌人带 5 层毒。'},
  silk:{n:'蛛丝',cls:'rogue',d:'每回合第一次连击中断，最多只掉 2 层。'},
  starthread:{n:'星辰线',cls:'mage',d:'每场战斗第一次元素反应伤害翻倍。'},
  mute:{n:'静音织物',cls:'mage',d:'每场战斗第一次吟唱被打中时不会中断。'}
};
const hasK=k=>!!S.run.knots?.includes(k);

/* ---------- Woven foes: beat a foe and, instead of a card, weave one of its traits into the loom (three at most) ---------- */
// each becomes a damask motif in the loom's ground cloth; wvFx lights the motif on the beat where its trait just fired
const WEAVES={
  wolf:{n:'狂性',d:'生命不到 30% 时，你的每次攻击 +3。'},
  bat:{n:'吸血',d:'每次弹反，回复 3 点生命。'},
  skeleton:{n:'重组',d:'每场战斗第一次受到致命伤时，留 1 点生命并回复 10 点。'},
  beetle:{n:'铁甲',d:'单次低于 4 点的伤害对你无效。'},
  spider:{n:'蛛毒',d:'每回合你的攻击第一次命中，敌人 +2 层毒。'},
  gargoyle:{n:'石肤',d:'你不出手的拍，受到的每次伤害 −2。'},
  slime:{n:'分裂',d:'单次造成 15 点及以上伤害时抽 1 张牌（每回合一次）。'},
  mirror:{n:'镜饲',d:'一回合没受到伤害，回合结束回复 4 点生命。'},
  puppet:{n:'上弦',d:'本回合敌人的行动每被你延后一次，你的攻击 +1（最多 +5）。'},
  treant:{n:'荆棘',d:'敌人每次打中你，反刺 2 点。'},
  ogre:{n:'震荡',d:'每次弹反，敌人的下一次行动延后 1 拍。'},
  banshee:{n:'虚体',d:'单次受到的伤害最多 15 点。'},
  shaman:{n:'图腾',d:'每场战斗开局立起一面 10 点的图腾，替你挡伤害。'},
  thief:{n:'窃时',d:'每回合第一次弹反，下回合 +1 时之砂。'},
  golem:{n:'升温',d:'每回合结束热度 +1（最多 5），你的每次攻击 +热度；被打中热度清零。'},
  knight:{n:'盾反',d:'你的反击（残影、残心、反击架势）伤害 +4。'}
};
const WEAVE_MAX=3;
const hasW=k=>!!S.run.woven?.includes(k);
function wvFx(k,b){const at=b??S.resolving??S.beat-1;(S.wfx??={})[at]=k;flt('hero',WEAVES[k].n,'info')}
// which woven motif shows in the cloth under beat b: one every third beat, cycling through the woven foes
function wvAt(b){const ws=S.run.woven||[];const lit=S.wfx?.[b];if(lit)return {k:lit,lit:true};if(!ws.length||b%3!==2)return null;return {k:ws[Math.floor(b/3)%ws.length]}}
const wvHtml=b=>{const w=wvAt(b);return w?`<i class="wv ${w.lit?'lit':''}" style="--wv:url(${art(`img/weaves/${w.k}.png`)})" aria-hidden="true"></i>`:''};

/* ---------- Threads of fate: a wager offered before a fight; taken and kept, the fight's gold doubles, broken, −5 life ---------- */
const FATES={
  peak:{d:s=>`本场某一拍打出 ${30+5*s} 点以上`,ok:()=>(S.best?.d||0)>=30+5*S.stage},
  parry:{d:s=>`本场弹反至少 ${s<3?2:3} 次`,ok:()=>(S.parries||0)>=(S.stage<3?2:3)},
  quick:{d:s=>`${6+Math.floor(s/2)} 回合内获胜`,ok:()=>S.turn<=6+Math.floor(S.stage/2)},
  hale:{d:s=>`本场生命最多少 ${15+3*s} 点`,ok:()=>S.hp0-S.hp<=15+3*S.stage}
};
// true kept, false broken, null when no wager was taken
const fateRes=()=>S.fate?.on?FATES[S.fate.k].ok():null;
function payFate(run){const r=fateRes();if(r===true)run.gold+=loot();else if(r===false)run.hp=Math.max(1,run.hp-5)}
const knotPool=run=>Object.keys(KNOTS).filter(k=>!run.knots.includes(k)&&(!KNOTS[k].cls||KNOTS[k].cls===run.cls));
const knotRow=run=>run.knots.length?`<span class="knots">${run.knots.map(k=>`<i title="${KNOTS[k].n}：${KNOTS[k].d}">${SVG.KNOT}</i>`).join('')}</span>`:'';
// the sand a card costs right now: the golden shuttle makes the turn's first move card free
const costOf=C=>C.t==='挪移'&&S.shuttle?0:C.c;
const castLen=C=>Math.max(1,C.cast-(S.quick?2:0)+(S.surge?2:0));
const CL=()=>CLASSES[S.run.cls];
const HINTS={h:'点选时间轴上你的一次攻击（金框），或点选它要挪到的那一拍',e:'点选时间轴上敌人的一个行动（红框），或点选它要挪到的那一拍',pair:'点选一拍，它会与下一拍互换',b4:'点选本回合起 4 拍内的一拍',any:'点选时间轴上的一拍',cast:'点选法术释放的那一拍（前面要留出吟唱的拍数）'};
const ROM=['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
const roman=n=>{const k=((n-1)%12)+1;const lap=Math.floor((n-1)/12);return ROM[k]+(lap?'·'+(lap+1):'')};
const $=id=>document.getElementById(id);
// an image path made absolute: a url() handed to a CSS variable would otherwise resolve against css/, not the page
const art=p=>new URL(p,document.baseURI).href;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

/* Embroidered glyphs, all drawn in currentColor so a patch or tab can dye them */
const star=(cx,cy,n,ro,ri)=>'M'+Array.from({length:n*2},(_,i)=>{const r=i%2?ri:ro,a=Math.PI*i/n-Math.PI/2;return (cx+r*Math.cos(a)).toFixed(1)+' '+(cy+r*Math.sin(a)).toFixed(1)}).join('L')+'Z';
const SVG={
  KNOT:`<svg viewBox="0 0 48 48"><path d="${star(24,24,8,23,15)}" fill="currentColor"/><g fill="none" stroke="#f1e7d1" stroke-width="1.6"><rect x="15" y="15" width="18" height="18"/><rect x="15" y="15" width="18" height="18" transform="rotate(45 24 24)"/><circle cx="24" cy="24" r="4.5"/></g></svg>`,
  GEAR:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1"/><circle cx="12" cy="12" r="6.5"/></svg>',
  REDO:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 3.5v5h-5"/></svg>',
  FLEUR:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-2 3-2.5 6-1 9-2-1-5-1-6.5 1 1.5 0 3 .5 4 2-2 0-3 1-3.5 2.5 2-.5 4-.2 5.5 1.5L12 22l1.5-4c1.5-1.7 3.5-2 5.5-1.5-.5-1.5-1.5-2.5-3.5-2.5 1-1.5 2.5-2 4-2-1.5-2-4.5-2-6.5-1 1.5-3 1-6-1-9z"/></svg>',
  ROUNDEL:`<svg viewBox="0 0 120 120"><g class="rays" stroke="#cfa95f" stroke-width="1.6">${Array.from({length:32},(_,i)=>{const a=i*Math.PI/16,r1=48,r2=i%2?55:62;return `<line x1="${(60+r1*Math.cos(a)).toFixed(1)}" y1="${(60+r1*Math.sin(a)).toFixed(1)}" x2="${(60+r2*Math.cos(a)).toFixed(1)}" y2="${(60+r2*Math.sin(a)).toFixed(1)}"/>`}).join('')}</g>
    <circle cx="60" cy="60" r="44" fill="#202d3a" fill-opacity=".72" stroke="#cfa95f" stroke-width="2.4"/><circle cx="60" cy="60" r="39" fill="none" stroke="#b28a45" stroke-dasharray="3 3"/>
    <path d="M26 92q34-12 68 0v4H26z" fill="#69745c"/>
    <g fill="#e8d9b9"><path d="M60 8l-6 22h12z"/><path d="M54 30h12v14H54z"/><path d="M51 44h18v20H51z"/><path d="M48 64h24v30H48z"/><path d="M38 94V74h9v20zM73 94V74h9v20z"/><path d="M42.5 64l-4.5 10h9zM77.5 64l-4.5 10h9z"/></g>
    <g fill="#202d3a"><rect x="58" y="34" width="4" height="7" rx="2"/><rect x="57" y="49" width="6" height="10" rx="3"/><rect x="56" y="72" width="8" height="14" rx="4"/><rect x="41" y="79" width="3" height="6" rx="1.5"/><rect x="76" y="79" width="3" height="6" rx="1.5"/></g>
    <g fill="#ead39a"><path d="${star(32,40,4,5,1.4)}"/><path d="${star(88,36,4,4,1.2)}"/><path d="${star(86,64,4,3,1)}"/><path d="${star(30,66,4,3,1)}"/></g></svg>`,
  GLASS:`<svg viewBox="0 0 84 110" fill="currentColor"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M24 8h36M24 102h36"/><path d="M29 8c0 26 13 30 13 47S29 76 29 102M55 8c0 26-13 30-13 47s13 21 13 47"/></g><path d="M34 30h16c-2 7-8 11-8 18 0-7-6-11-8-18z" opacity=".75"/><path d="M42 70c-6 6-9 14-10 26h20c-1-12-4-20-10-26z"/>
    <g fill="none" stroke="#69745c" stroke-width="1.6"><path d="M14 104C4 76 4 40 16 10M70 104C80 76 80 40 68 10"/></g><g fill="#69745c">${[20,34,48,62,76,90].map(y=>`<ellipse cx="${y<50?11:8}" cy="${y}" rx="5" ry="2.2" transform="rotate(-35 ${y<50?11:8} ${y})"/><ellipse cx="${84-(y<50?11:8)}" cy="${y}" rx="5" ry="2.2" transform="rotate(35 ${84-(y<50?11:8)} ${y})"/>`).join('')}</g></svg>`,
  SHUTTLE:'<svg viewBox="0 0 120 50"><path d="M2 42C28 12 46 48 64 26" fill="none" stroke="#ead39a" stroke-width="1.6" stroke-dasharray="4 3"/><g class="shuttle"><path d="M16 27C40 12 82 11 116 20 84 33 42 39 16 27z" fill="#e8d9b9" stroke="#ead39a" stroke-width="1.6"/><path d="M28 26c22-7 52-8 74-5" fill="none" stroke="#b28a45" stroke-width="1.2"/><rect x="50" y="19" width="24" height="9" rx="2" fill="#73302a" stroke="#ead39a" stroke-width="1.2"/><path d="M55 19v9M60 19v9M65 19v9M70 19v9" stroke="#ead39a" stroke-width=".9"/></g></svg>',
  CLAW:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 3c3 6 3 12-1 18M12 2c3 7 3 13-1 20M18 3c3 6 3 12-1 18"/></svg>',
  BURST:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="${star(12,12,8,11,4.6)}"/></svg>`,
  SWORD:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 3l-9.5 9.5M20 3h-4.5M20 3v4.5"/><path d="M6.5 11.5l6 6M8.5 15.5l-5 5"/></svg>',
  SHIELD:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.5l8 3v6.5c0 4.5-3.4 7.6-8 9.5-4.6-1.9-8-5-8-9.5V5.5z"/><path d="M12 7l1.3 3.5H17l-3 2.2 1.1 3.6L12 14l-3.1 2.3 1.1-3.6-3-2.2h3.7z" fill="currentColor" stroke="none"/></svg>',
  FIRE:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3-1-3 0-6 1-9z"/></svg>',
  ICE:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7M9 4l3 2 3-2M9 20l3-2 3 2"/></svg>',
  BOLT:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2L5 14h6l-2 8 10-13h-6z"/></svg>',
  HEART:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"/></svg>',
  SAND:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9"/><path d="M9.5 18.5h5l-2.5-3z" fill="currentColor"/></svg>',
  STAIRS:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 20h5v-5h5v-5h5V5h3"/></svg>',
  TOWER:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1l-3 6h6zM9.5 7h5v4h-5zM8.5 11h7v5h-7zM7 16h10v6H7z"/></svg>',
  CARDS:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="6" width="11" height="15" rx="1" transform="rotate(-10 8.5 13.5)"/><rect x="10" y="3" width="11" height="15" rx="1"/></svg>',
  FLAG:`<svg viewBox="0 0 64 120"><path d="M2 0h60v104l-30-18-30 18z" fill="#923f35"/><path d="M8 6h48v88l-24-14-24 14z" fill="none" stroke="#cfa95f" stroke-width="1.6" stroke-dasharray="3 2"/><path d="${star(32,44,8,18,8)}" fill="#e8d9b9"/><circle cx="32" cy="44" r="5" fill="#923f35" stroke="#cfa95f" stroke-width="1.5"/></svg>`,
  SKIP:'<svg viewBox="0 0 96 120"><path d="M10 120V48a38 38 0 0 1 76 0v72" fill="none" stroke="currentColor" stroke-width="2"/><path d="M48 16l-3 14h6z" fill="#b28a45"/><path d="M48 6v8M44 10h8" stroke="#b28a45" stroke-width="1.6"/><path d="M42 30h12v14H42zM38 44h20v16H38zM34 60h28v14H34zM24 74h48v12H24zM16 86h64v14H16zM10 100h76v20H10z" fill="currentColor" opacity=".85"/><g fill="#e8d9b9"><rect x="46" y="34" width="4" height="6" rx="2"/><rect x="45" y="48" width="6" height="8" rx="3"/></g></svg>'
};
const crest=(cls,col)=>{const em={warrior:`<path d="${star(48,48,8,22,11)}" fill="#e8d9b9"/><circle cx="48" cy="48" r="6" fill="${col}" stroke="#cfa95f" stroke-width="2"/>`,
    rogue:'<path d="M58 22a26 26 0 1 0 0 52 20 20 0 1 1 0-52z" fill="#e8d9b9"/><path d="M30 76l36-36M34 40l30 30" stroke="#cfa95f" stroke-width="3" stroke-linecap="round"/>',
    mage:`<path d="${star(48,48,4,26,7)}" fill="#e8d9b9"/><path d="${star(48,48,4,14,4)}" fill="#cfa95f" transform="rotate(45 48 48)"/>`}[cls];
  return `<svg viewBox="0 0 96 110"><path d="M5 5h86v42c0 30-21 50-43 60C26 97 5 77 5 47z" fill="${col}" stroke="#b28a45" stroke-width="3"/><path d="M12 12h72v35c0 25-17 42-36 51-19-9-36-26-36-51z" fill="none" stroke="#cfa95f" stroke-width="1.4" stroke-dasharray="3 2.5"/>${em}</svg>`};
document.querySelectorAll('[data-svg]').forEach(e=>{e.innerHTML=SVG[e.dataset.svg];e.removeAttribute('data-svg')});
const DIAM=SVG.KNOT;

// how much one raised shield blocks (a tower shield carries its own v)
const SHIELD=6;
const blkAt=b=>Math.max(0,...at(b,'w').map(w=>w.v||SHIELD));
// poison stacks on the enemy: each beat deals its stacks, then one wears off
const POISON_MAX=15;
const addPoison=n=>{S.poison=Math.min(S.plague?30:POISON_MAX,S.poison+n)};
// every way the assassin's combo goes up runs through here (毒发 turns each step into poison)
function addCombo(n){const was=S.combo;S.combo=Math.min(S.comboMax,S.combo+n);const up=S.combo-was;if(up>0&&S.toxin)addPoison(up);return up}
const armored=x=>x<10?Math.floor(x/2):x;
const mult=n=>n<=1?1:n===2?1.5:2;
// "now" for mid-resolution changes: the beat being resolved, or just before this turn when a card triggers it
const cur=()=>S.resolving||S.beat-1;
const foeE=(f)=>S.events.filter(e=>e.side==='e'&&(!f||f(e)));
// enemy actions that actually attack (a curl or other stance is na)
const atkE=b=>at(b,'e').filter(e=>!e.na);
const gainRage=(n,why)=>{if(S.run.cls!=='warrior'||n<=0)return;const was=S.rage;S.rage=Math.min(S.rageMax,S.rage+n);if(S.rage>was)flt('hero',`怒气 +${S.rage-was}`,'info')};

/* ---------- The foes: floors 1-5 each draw one of three, then the knight and the Demon King ---------- */
const FOES=[
 {key:'wolf',floor:'第 1 层',name:'灰鬃野狼',lane:'野狼',hp:70,
  rules:['<b>扑咬</b>：每 3 拍里扑咬 2 次，每次 9 点。','<b>狂性</b>：生命 ≤ 30 后每一拍都咬，每次 7 点。','战士：每一口都是怒气。刺客：咬的那拍会断连击，用「闪身」躲开。'],
  reward:['echo','charge','haste'],stagger:2,
  open:'黑暗里亮起一双眼睛。开战。',
  init:()=>({mad:false}),
  beat(b){if(S.E.mad)ev({beat:b,side:'e',label:'咬',dmg:7});else if(b%3!==0)ev({beat:b,side:'e',label:'咬',dmg:9})},
  onDealt(){if(!S.E.mad&&S.ehp<=30&&S.ehp>0){S.E.mad=true;const c=cur();S.events=S.events.filter(e=>!(e.side==='e'&&e.beat>c));for(let b=c+1;b<=S.genUpTo;b++)this.beat(b);log('野狼红了眼，每一拍都扑上来！');banner('狂性','FRENZY',true)}},
  status:()=>S.E.mad?'<span class="tag p2">狂性</span>':'',
  rage:()=>S.E.mad},

 {key:'bat',floor:'第 1 层',name:'吸血蝠',lane:'蝙蝠',hp:65,
  rules:['<b>撕咬</b>：每 3 拍里咬 2 次，每次 9 点。','<b>吸血</b>：撕咬真正打到你身上的伤害，蝙蝠全部回给自己。格挡、闪身、残影、弹反都能让它喝不到血。','战士：盾放在撕咬上，挡下的就是它喝不到的。刺客：第 III、VI、IX 拍它不咬，正好背刺。法师：吟唱被咬断就是双亏，先用寒冰枪把撕咬推开。'],
  reward:['echo','charge','ghost'],stagger:2,
  open:'头顶传来一阵扑翅声。开战。',
  init:()=>({}),
  beat(b){if(b%3!==0)ev({beat:b,side:'e',label:'咬',dmg:9})},
  onHeroHit(es,x){if(!es.length||x<=0||S.ehp<=0)return;const h=Math.min(x,S.emax-S.ehp);if(h){S.ehp+=h;flt('enemy','吸血 +'+h,'heal');log(`吸血：蝙蝠回复 ${h} 点生命。`)}},
  status:()=>'<span class="tag">吸血 · 咬到多少回多少</span>'},

 {key:'skeleton',floor:'第 1 层',name:'骷髅兵',lane:'骷髅',hp:55,
  rules:['<b>骨刃</b>：每 3 拍里砍 2 次，每次 10 点。','<b>重组</b>：第一次被打倒时，骨头会拼回去，带着 25 点生命再站起来。','<b>粉碎</b>：打倒它的那一下如果单次 15 点及以上（共鸣、蓄时、裂地斩、火球……），骨头直接碎掉，不会重组。','战士留一记共鸣或裂地斩收尾；刺客攒一手绝杀；法师把火球留到最后。'],
  reward:['echo','charge','haste'],
  open:'一堆白骨咔咔作响地站了起来。开战。',
  init:()=>({up:false}),
  beat(b){if(b%3!==1)ev({beat:b,side:'e',label:'砍',dmg:10})},
  onDealt(x){if(S.ehp>0||S.E.up)return;S.E.up=true;if(x>=15){log(`粉碎！${x} 点的一击把骨头砸成了粉。`);banner('粉碎','SHATTER');return}
    S.ehp=25;flt('enemy','重组','info');log('骷髅散了架……又咔咔地拼了回去，带着 25 点生命站起来。');banner('重组','REASSEMBLE',true)},
  status:()=>S.E.up?'<span class="tag p2">已重组</span>':'<span class="tag">重组 · 最后一击 ≥15 才能粉碎</span>',
  rage:()=>S.E.up},

 {key:'beetle',floor:'第 2 层',name:'铁壳甲虫',lane:'甲虫',hp:95,
  rules:['<b>铁甲</b>：单拍低于 7 点的伤害无效。毒伤无视铁甲。','<b>蜷缩</b>：每 4 拍蜷成一团（灰色「缩」），那一拍你的攻击全部无效。蜷缩可以被「迟滞」「错位」挪开。','<b>撞击</b>：每 3 拍里撞 2 次，每次 11 点。','刺客的小刀很难打穿它，靠共鸣、标记和淬毒。'],
  reward:['stasis','gather','rewind'],
  open:'铁壳摩擦石地，发出刺耳的声音。开战。',
  init:()=>({}),
  beat(b){if(b%4===0)ev({beat:b,side:'e',label:'缩',dmg:0,na:true});if(b%3!==1)ev({beat:b,side:'e',label:'撞',dmg:11})},
  mod:(x,o)=>{if(o.src==='poison'||o.src==='true')return x;if(o.beat&&at(o.beat,'e').some(e=>e.na))return 0;return x<7?0:x},modNote:'铁甲 · 无效',modShort:'铁甲',
  status:()=>'<span class="tag">铁甲 · 低于 7 无效</span>'},

 {key:'spider',floor:'第 2 层',name:'剧毒织蛛',lane:'蜘蛛',hp:90,
  rules:['<b>毒牙</b>：每 3 拍里咬 2 次，每次 8 点。','<b>蛛毒</b>：毒牙咬中你，你身上叠 3 层毒（最多 6 层）；之后每拍掉 1 点生命、毒减 1 层。蛛毒不会打断吟唱，也不给怒气。','别让它咬到：战士举盾、拼刀；刺客闪身；法师用寒冰枪和迟滞把毒牙推开。「回溯」也能把毒掉的血一起拿回来。'],
  reward:['stasis','gather','rewind'],
  open:'齿轮缝里垂下一根发亮的丝。开战。',
  init:()=>({tox:0}),
  beat(b){if(b%3!==0)ev({beat:b,side:'e',label:'毒牙',dmg:8})},
  onHeroHit(es,x){if(es.length&&x>0&&S.E.tox<6){S.E.tox=Math.min(6,S.E.tox+3);flt('hero','蛛毒','info')}},
  afterBeat(){if(S.E.tox>0&&!S.over){S.E.tox--;log('蛛毒发作，你掉了 1 点生命。');dealHero(1,[],{thorn:true})}},
  status:()=>'<span class="tag">毒牙 · 咬中叠 3 层毒</span>'+(S.E.tox?`<span class="tag p2">你中毒 ${S.E.tox}</span>`:'')},

 {key:'gargoyle',floor:'第 2 层',name:'钟楼石像鬼',lane:'石像鬼',hp:95,
  rules:['<b>俯扑</b>：每 3 拍里扑 2 次，每次 11 点。','<b>石肤</b>：它不俯扑的拍，以及立刻结算的牌，伤害减半。只有它俯扑的那一拍吃全额伤害。毒伤无视石肤。','战士：普攻撞上俯扑就是全额，用战吼、蓄时把拼刀打赢。刺客：在俯扑拍闪身白打，或者靠淬毒。法师：把释放拍对准俯扑，用屏障护住吟唱。'],
  reward:['stasis','gather','rewind'],
  open:'檐角的石像慢慢转过了脖子。开战。',
  init:()=>({}),
  beat(b){if(b%3!==1)ev({beat:b,side:'e',label:'扑',dmg:11})},
  mod:(x,o)=>{if(o.src==='poison'||(o.beat&&atkE(o.beat).length))return x;return Math.floor(x/2)},modNote:'石肤 · 减半',modShort:'石肤',
  status:()=>'<span class="tag">石肤 · 只有俯扑拍吃全额</span>'},

 {key:'slime',floor:'第 3 层',name:'分裂史莱姆',lane:'史莱姆',hp:100,
  rules:['<b>黏击</b>：每 3 拍里黏 2 次，基础 9 点。','<b>分裂</b>：单次受到 15 点及以上的伤害就分裂一次（最多 3 次），之后每次黏击 +3。','<b>细碎</b>：低于 15 的伤害不会让它分裂。刺客的连击、毒、小刀都很合适；战士的裂地斩和大共鸣要算好时机再用。'],
  reward:['unity','stop','paradox'],
  open:'一团软泥蠕动着挡住了楼梯。开战。',
  init:()=>({split:0}),
  dmgNow(){return 9+3*S.E.split},
  beat(b){if(b%3!==0)ev({beat:b,side:'e',label:'黏',dmg:this.dmgNow()})},
  onDealt(x,o){if(x>=15&&S.E.split<3&&S.ehp>0&&o.src!=='poison'){S.E.split++;const d=this.dmgNow();foeE(e=>e.label==='黏').forEach(e=>e.dmg=d);log(`史莱姆被打裂了！分裂 ${S.E.split}/3，黏击升到 ${d} 点。`);flt('enemy','分裂！','info')}},
  status:()=>`<span class="tag">分裂 ${S.E.split}/3</span>`,
  rage:()=>S.E.split>=3},

 {key:'mirror',floor:'第 3 层',name:'镜之妖精',lane:'妖精',hp:90,
  rules:['<b>镜影</b>：第 III、VI、IX、XII 拍各有一面镜影，那一拍你的攻击全部被吞掉；法术、毒和残影反击不受影响。用「迅步」「蓄时」把攻击挪出去，或用「错位」把镜影换走。','<b>镜饲</b>：镜影每吞掉一拍攻击，妖精回复 6 点生命。','<b>碎光</b>：镜影之间的两拍各一次，每次 9 点。','法师几乎不怕镜影；战士和刺客得学会挪动自己的攻击。'],
  reward:['unity','stop','paradox'],
  open:'钟面玻璃里，有个影子对你眨了眨眼。开战。',
  init:()=>({}),
  beat(b){if(b%3===0)ev({beat:b,side:'m'});else ev({beat:b,side:'e',label:'碎光',dmg:9})},
  onMirror(){const h=Math.min(6,S.emax-S.ehp);if(h){S.ehp+=h;flt('enemy','+'+h,'heal');log(`镜饲：妖精回复 ${h} 点生命。`)}},
  status:()=>'<span class="tag">镜影 · 每 3 拍吞掉攻击</span>'},

 {key:'puppet',floor:'第 3 层',name:'发条傀儡',lane:'傀儡',hp:100,
  rules:['<b>锤击</b>：每 3 拍里锤 2 次，基础 8 点。','<b>上弦</b>：它的行动每被你的牌延后一次（迟滞、错位、静滞领域、时停、寒冰枪、感电），发条就拧紧一圈，之后每次锤击 +2（最多 5 圈）。','<b>松弦</b>：拼刀弹反它，发条松掉 2 圈。','别拖它，正面接：战士举盾拼刀；刺客用闪身和残影；法师少用冰，靠屏障硬扛。'],
  reward:['echo','haste','ghost'],
  open:'咔哒、咔哒，傀儡背上的发条转了起来。开战。',
  init:()=>({wind:0}),
  dmgNow(){return 8+2*S.E.wind},
  retune(){const d=this.dmgNow();foeE(e=>e.label==='锤').forEach(e=>e.dmg=d)},
  beat(b){if(b%3!==2)ev({beat:b,side:'e',label:'锤',dmg:this.dmgNow()})},
  onDelay(src){if(src==='stagger'||S.E.wind>=5)return;S.E.wind++;this.retune();flt('enemy',`上弦 ${S.E.wind}`,'info');log(`上弦：发条拧紧一圈，锤击升到 ${this.dmgNow()} 点。`)},
  onParry(){if(!S.E.wind)return;S.E.wind=Math.max(0,S.E.wind-2);this.retune();log(`松弦：弹反震松了发条，锤击降到 ${this.dmgNow()} 点。`)},
  status:()=>`<span class="tag ${S.E.wind>=4?'p2':''}">上弦 ${S.E.wind}/5</span>`,
  rage:()=>S.E.wind>=4},

 {key:'treant',floor:'第 4 层',name:'荆棘树人',lane:'树人',hp:110,
  rules:['<b>荆棘</b>：每次受到伤害，反刺你 2 点（毒伤除外）。反刺不会打断吟唱，也不给怒气。','<b>横扫</b>：每 5 拍一次 22 点，很慢但很痛。','<b>藤鞭</b>：横扫之间连抽 2 次，每次 7 点。','<b>生长</b>：每回合结束回复 6 点生命。','刺客出手次数多，被扎得最狠，靠淬毒和绝杀；战士举盾挡横扫；法师一发大火球最划算。'],
  reward:['stasis','haste','rewind'],
  open:'枝条沙沙作响，荆棘一根根竖起。开战。',
  init:()=>({}),
  beat(b){if(b%5===4)ev({beat:b,side:'e',label:'扫',dmg:22});else if(b%5===1||b%5===2)ev({beat:b,side:'e',label:'鞭',dmg:7})},
  take(x,o){if(x>0&&o.src!=='poison'){dealHero(2,[],{thorn:true});log('荆棘反刺你 2 点。')}return x},
  turnEnd(){const h=Math.min(6,S.emax-S.ehp);if(h){S.ehp+=h;flt('enemy','+'+h,'heal');log(`生长：树人回复 ${h} 点生命。`)}},
  status:()=>'<span class="tag">荆棘 · 每击反刺 2</span><span class="tag">每回合回 5</span>'},

 {key:'ogre',floor:'第 4 层',name:'独眼巨魔',lane:'巨魔',hp:140,
  rules:['<b>连拳</b>：每 6 拍里连打 3 拳，每拳 8 点。','<b>钟锤</b>：连拳之后隔一拍砸下钟锤，26 点，被时间锁定。','<b>震荡</b>：钟锤打到你身上，下回合少 1 粒时之砂。','血厚但慢：战士把盾放在钟锤上；刺客在钟锤拍闪身；法师在两锤之间吟唱大法术。'],
  reward:['stasis','haste','rewind'],
  open:'地板随着它的脚步一下下震动。开战。',
  init:()=>({daze:0}),
  beat(b){const m=b%6;if(m===3)ev({beat:b,side:'e',kind:'j',label:'钟锤',dmg:26,locked:true});else if(m===5||m===0||m===1)ev({beat:b,side:'e',label:'拳',dmg:8})},
  onHeroHit(es,x){if(x>0&&!S.E.daze&&es.some(e=>e.label==='钟锤')){S.E.daze=1;flt('hero','震荡','info');log('震荡：你被砸得眼冒金星，下回合少 1 粒时之砂。')}},
  turnStart(first){if(!first&&S.E.daze){S.sand--;S.E.daze=0;log('震荡：这回合少了 1 粒时之砂。')}},
  status:()=>'<span class="tag">钟锤 · 锁定</span>'+(S.E.daze?'<span class="tag p2">你被震荡</span>':''),
  rage:()=>foeE(e=>e.label==='钟锤'&&e.beat<S.beat+3).length>0},

 {key:'banshee',floor:'第 4 层',name:'哀泣女妖',lane:'女妖',hp:115,
  rules:['<b>虚体</b>：单次伤害最多 12 点，多出来的穿体而过（毒伤除外）。','<b>冥爪</b>：每 6 拍里抓 3 次，每次 9 点。','<b>尖啸</b>：每 6 拍一次 14 点，紧跟在第一爪后面。尖啸打到你身上，下回合少抽 1 张牌。','大招打她很亏：刺客的多段和毒最合适；战士多拼刀、少攒重击；法师用雷链和元素反应凑多段。'],
  reward:['echo','haste','ghost'],
  open:'钟声里混进了一声长长的哭嚎。开战。',
  init:()=>({hush:0}),
  beat(b){const m=b%6;if(m===1||m===4||m===5)ev({beat:b,side:'e',label:'爪',dmg:9});else if(m===2)ev({beat:b,side:'e',label:'尖啸',dmg:14})},
  mod:(x,o)=>o.src==='poison'?x:Math.min(x,12),modNote:'虚体 · 穿透',modShort:'虚体',
  onHeroHit(es,x){if(x>0&&!S.E.hush&&es.some(e=>e.label==='尖啸')){S.E.hush=1;S.drawN=4;flt('hero','尖啸','info');log('尖啸：你的耳朵嗡嗡作响，下回合少抽 1 张牌。')}},
  turnStart(first){if(!first)S.E.hush=0},
  status:()=>'<span class="tag">虚体 · 单次最多 12</span>'+(S.E.hush?'<span class="tag p2">下回合少抽 1</span>':'')},

 {key:'shaman',floor:'第 5 层',name:'哥布林萨满',lane:'萨满',hp:110,
  rules:['<b>图腾</b>（12 点）：图腾在的时候，你的每一下伤害都先打在图腾上，打碎图腾那一下不会溢出到萨满身上。图腾在场时萨满每回合结束回复 6 点。','<b>重立图腾</b>：图腾碎了，每 3 回合会重新立起来。','<b>巫火</b>：每 3 拍里 2 次，每次 11 点。','战士难攒怒气；刺客的多段小刀砸图腾最快；法师的一发大招打在图腾上很浪费，先用小法术或普攻敲碎它。'],
  reward:['unity','stop','paradox'],
  open:'图腾上的眼睛亮了。开战。',
  init:()=>({totem:12,broke:0}),
  beat(b){if(b%3!==0)ev({beat:b,side:'e',label:'巫火',dmg:11})},
  take(x,o){if(S.E.totem<=0||x<=0)return x;const a=Math.min(S.E.totem,x);S.E.totem-=a;flt('enemy',`图腾 −${a}`,'info');if(S.E.totem<=0){S.E.broke=S.turn;log('图腾被砸碎了！');banner('图腾碎裂','TOTEM')}else log(`图腾挡下 ${a} 点（还剩 ${S.E.totem}）。`);return 0},
  turnEnd(){if(S.E.totem>0){const h=Math.min(6,S.emax-S.ehp);if(h){S.ehp+=h;flt('enemy','+'+h,'heal');log(`图腾庇佑：萨满回复 ${h} 点生命。`)}}},
  turnStart(first){if(!first&&S.E.totem<=0&&S.turn-S.E.broke>=3){S.E.totem=12;log('萨满重新立起了图腾。');flt('enemy','图腾','info')}},
  status:()=>S.E.totem>0?`<span class="tag sh">图腾 ${S.E.totem}/12</span>`:`<span class="tag ok">图腾已碎 · ${Math.max(0,3-(S.turn-S.E.broke))} 回合后重立</span>`},

 {key:'thief',floor:'第 5 层',name:'时之窃贼',lane:'窃贼',hp:115,
  rules:['<b>快刀</b>：每 3 拍里 2 刀，基础 10 点。','<b>窃时</b>：快刀打到你身上，你的下一次普通攻击延后 1 拍（重击不受影响）。','<b>得手</b>：每偷到一次，快刀永久 +1（最多 +4）。','开局要稳：战士趁刀还轻，用战吼、蓄时多拼刀弹反；刺客用闪身保住连击；法师怕他打断吟唱，屏障和寒冰枪要早用。'],
  reward:['stasis','gather','rewind'],
  open:'影子里有人轻轻笑了一声。开战。',
  init:()=>({stole:0}),
  dmgNow(){return 10+Math.min(4,S.E.stole)},
  beat(b){if(b%3!==1)ev({beat:b,side:'e',label:'刀',dmg:this.dmgNow()})},
  onHeroHit(es,x){if(!es.length||x<=0)return;const c=cur(),h=S.events.filter(e=>e.side==='h'&&!e.fx&&e.beat>c).sort((a,b)=>a.beat-b.beat)[0];
    if(h)h.beat++;S.E.stole++;const d=this.dmgNow();foeE(e=>e.label==='刀').forEach(e=>e.dmg=d);flt('hero','窃时','info');
    log(`窃时：${h?`你第 ${roman(h.beat-1)} 拍的攻击被偷到第 ${roman(h.beat)} 拍，`:''}快刀升到 ${d} 点。`)},
  status:()=>`<span class="tag ${S.E.stole>=4?'p2':''}">得手 ${Math.min(4,S.E.stole)}/4</span>`,
  rage:()=>S.E.stole>=4},

 {key:'golem',floor:'第 5 层',name:'熔核魔像',lane:'魔像',hp:120,
  rules:['<b>熔拳</b>：每 3 拍里 2 拳，每拳 8 点 + 热度。','<b>升温</b>：每回合结束热度 +1（最多 8）。','<b>冷却</b>：单次 15 点及以上的伤害，或寒冰枪命中，热度清零。','<b>熔甲</b>：单拍低于 4 点的伤害无效（毒伤除外）。','战士用共鸣和裂地斩定时降温；刺客攒连击、上毒，用绝杀降温；法师的寒冰枪是天生的克星。'],
  reward:['unity','stop','paradox'],
  open:'锅炉门被一拳砸开，热浪扑面而来。开战。',
  init:()=>({heat:0}),
  dmgNow(){return 8+S.E.heat},
  retune(){const d=this.dmgNow();foeE(e=>e.label==='熔拳').forEach(e=>e.dmg=d)},
  beat(b){if(b%3!==0)ev({beat:b,side:'e',label:'熔拳',dmg:this.dmgNow()})},
  mod:(x,o)=>o.src==='poison'||x>=4?x:0,modNote:'熔甲 · 无效',modShort:'熔甲',
  onDealt(x,o){if(S.E.heat&&S.ehp>0&&(x>=15||o.el==='冰')){S.E.heat=0;this.retune();flt('enemy','冷却','info');log(`冷却：${o.el==='冰'?'寒冰':'重击'}让魔像的热度归零，熔拳回到 ${this.dmgNow()} 点。`)}},
  turnEnd(){if(S.E.heat<8){S.E.heat++;this.retune();log(`升温：魔像热度 ${S.E.heat}，熔拳升到 ${this.dmgNow()} 点。`)}},
  status:()=>`<span class="tag">熔甲 · 低于 4 无效</span><span class="tag ${S.E.heat>=5?'p2':''}">热度 ${S.E.heat}/8</span>`,
  rage:()=>S.E.heat>=5},

 {key:'knight',floor:'第 6 层',name:'黑铁骑士',lane:'骑士',hp:180,
 moods:true,
  rules:['<b>重甲</b>：单拍伤害低于 10 会被减半。','<b>盾反</b>：灰色「盾」的那一拍，你打过去的伤害一半弹回你身上，骑士不受伤。盾可以被「迟滞」「错位」挪开。','<b>斩击</b>：除了举盾的拍，每 3 拍里斩 2 次，每次 10 点。','<b>重劈</b>：每 12 拍一次 28 点，被时间锁定。','<b>怒斩</b>：血量过半后斩击变成 13 点。','三个职业都得用上全部本事：没有专门针对谁。'],
  reward:['echo','haste','ghost','charge'],
  open:'黑铁甲胄轰然落地。开战。',
  init:()=>({phase:1}),
  beat(b){const m=b%12;if(m===0)ev({beat:b,side:'e',kind:'j',label:'重劈',dmg:28,locked:true});else if(m%3!==0&&m!==4&&m!==10)ev({beat:b,side:'e',label:'斩',dmg:S.E.phase===2?13:10});else if(m===4||m===10)ev({beat:b,side:'e',label:'盾',dmg:0,na:true,sh:true})},
  mod:(x,o)=>{if(o.beat&&at(o.beat,'e').some(e=>e.sh)&&o.src!=='poison'&&o.src!=='true')return 0;return armored(x)},modNote:'重甲 · 减半',modShort:'重甲',
  take(x,o,raw){if(o.beat&&at(o.beat,'e').some(e=>e.sh)&&o.src!=='poison'&&o.src!=='true'){const r=Math.floor(raw/2);flt('enemy','盾反！','info');if(r>0){log(`盾反：骑士把 ${r} 点伤害弹了回来。`);dealHero(r,[],{thorn:true})}return 0}return x},
  onDealt(){if(S.E.phase===1&&S.ehp<=90&&S.ehp>0){S.E.phase=2;foeE(e=>e.label==='斩').forEach(e=>e.dmg=13);log('骑士扔掉了披风，第二阶段·怒斩！斩击变成 13 点。');flt('enemy','怒斩！','info');banner('怒斩','PHASE II · 第二阶段',true)}},
  status:()=>'<span class="tag">重甲</span>'+(S.E.phase===2?'<span class="tag p2">怒斩</span>':''),
  rage:()=>S.E.phase===2,
  mood:()=>S.E.phase===2?'rage':foeE(e=>e.label==='重劈'&&e.beat<S.beat+3).length?'judge':'calm'},

 {key:'king',floor:'塔顶',name:'永夜魔王',lane:'魔王',hp:320,
 boss:true,
  rules:['<b>齿轮护甲</b>：全程单拍低于 10 的伤害减半。','<b>一·倒转钟面</b>：刻刃每 3 拍里 2 次，每次 10 点。每 2 回合把你视野内最晚的一次攻击标成「逆」，逆攻击会给他回血，除非它共鸣或拼刀赢了。','<b>二·看穿</b>（≤225）：你布下的残影、盾、闪身、标记和蓄时加成被抹掉，审判每 8 拍一次（锁定）。他会看穿你的职业：<br>对战士，刻刃放慢到每 3 拍一次（10 点），他边打边蓄力，每回合蓄力 +3（上限 8），审判改为每 6 拍一次，伤害 = 25 + 3×蓄力，单次打他 15 点以上能打散 2 层蓄力；<br>对刺客，他披上反甲，每挨一下反刺 1 点（毒伤除外）；<br>对法师，刻刃变成每 2 拍 6 点，专打你的吟唱。','<b>三·永夜</b>（≤120）：视野缩到 6 拍，刻刃变成每 2 拍 14 点。15 拍后终焉钟鸣 99 点，残影无效，每次弹反推迟 1 拍。'],
  reward:[],
  open:'钟针归零。永夜魔王，开战。',
  init:()=>({phase:1,jNext:0,charge:0}),
  jDmg:()=>S.run.cls==='warrior'?25+3*S.E.charge:35,
  retune(){const d=this.jDmg();foeE(e=>e.label==='审判').forEach(e=>e.dmg=d)},
  view:()=>S.E.phase===3?6:8,
  beat(b){const k=S.run.cls;
    if(S.E.phase===3){if(b%2===1)ev({beat:b,side:'e',label:'刻',dmg:14});return}
    if(S.E.phase===2&&k==='warrior'){if(b%3===0)ev({beat:b,side:'e',label:'刻',dmg:10});return}
    if(S.E.phase===2&&k==='mage'){if(b%2===1)ev({beat:b,side:'e',label:'刻',dmg:6});return}
    if(b%3!==0)ev({beat:b,side:'e',label:'刻',dmg:10})},
  fill(h){if(S.E.phase!==2)return;while(S.E.jNext<=h){ev({beat:S.E.jNext,side:'e',kind:'j',label:'审判',dmg:this.jDmg(),locked:true});S.E.jNext+=S.run.cls==='warrior'?6:8}},
  take(x,o){if(S.E.phase===2&&S.run.cls==='rogue'&&x>0&&o.src!=='poison'){dealHero(1,[],{thorn:true});log('反甲刺了你 1 点。')}return x},
  turnEnd(){if(S.E.phase===2&&S.run.cls==='warrior'&&S.E.charge<8){S.E.charge=Math.min(8,S.E.charge+3);this.retune();log(`魔王蓄力到 ${S.E.charge} 层，审判升到 ${this.jDmg()} 点。`);flt('enemy','蓄力','info')}},
  mod:(x)=>armored(x),modNote:'齿轮护甲 · 减半',modShort:'护甲',
  onParry(){const f=foeE(e=>e.fin)[0];if(f){f.beat++;log(`弹反震开了钟针，终焉钟鸣推迟到第 ${roman(f.beat)} 拍。`)}},
  onDealt(x,o){
    const c=cur();
    if(S.E.phase===2&&S.run.cls==='warrior'&&x>=15&&S.E.charge>0){S.E.charge=Math.max(0,S.E.charge-2);this.retune();log(`重击打散了蓄力，还剩 ${S.E.charge} 层。`);flt('enemy','蓄力 −2','info')}
    if(S.E.phase===1&&S.ehp<=225&&S.ehp>0){
      S.E.phase=2;S.E.jNext=c+4;
      S.events=S.events.filter(e=>!['g','w','d','k'].includes(e.side)&&!(e.side==='e'&&e.beat>c));
      S.events.forEach(e=>{if(e.side==='h'){e.rev=false;if(e.ch){e.dmg=Math.max(6,e.dmg-8);e.ch=false}}});
      for(let b=c+1;b<=S.genUpTo;b++)this.beat(b);
      this.fill(S.genUpTo);
      const how={warrior:'刻刃放慢了，他开始蓄力。',rogue:'他披上了反甲。',mage:'刻刃变快了，专等你吟唱。'}[S.run.cls];
      log(`回拨：魔王拨动钟面，你布下的残影、盾、闪身、标记和蓄时全部归零。第二阶段·看穿！${how}`);banner('看穿','PHASE II · 第二阶段',true);
    }
    if(S.E.phase===2&&S.ehp<=120&&S.ehp>0){
      S.E.phase=3;
      S.events=S.events.filter(e=>!((e.side==='e'&&e.beat>c&&!e.fin)||e.side==='m'));
      for(let b=c+1;b<=S.genUpTo;b++)this.beat(b);
      ev({beat:c+15,side:'e',kind:'j',label:'终焉',dmg:99,locked:true,noGhost:true,fin:true});
      log('永夜降临：视野缩短，刻刃加速。终焉钟鸣在 15 拍后落下！');banner('永夜','PHASE III · 终焉倒数',true);
    }
  },
  turnStart(){
    if(S.E.phase===1&&S.turn%2===1){
      const hs=S.events.filter(e=>e.side==='h'&&!e.rev&&e.beat>=S.beat&&e.beat<S.beat+W()).sort((a,b)=>b.beat-a.beat);
      if(hs[0]){hs[0].rev=true;log(`逆针：你第 ${roman(hs[0].beat)} 拍的攻击被倒转了，单独命中会给魔王回血。`);flt('enemy','逆针','info')}
    }
  },
  status(){const f=foeE(e=>e.fin)[0];return `<span class="tag">齿轮护甲</span><span class="tag p2">${['','倒转钟面','看穿','永夜'][S.E.phase]}</span>`+(S.E.phase===2?`<span class="tag mr">${{warrior:`蓄力 ${S.E.charge}/8`,rogue:'反甲 · 每击反刺 1',mage:'刻刃每 2 拍'}[S.run.cls]}</span>`:'')+(f?`<span class="tag p2">终焉 ${f.beat-S.beat+1} 拍</span>`:'')},
  rage:()=>S.E.phase===3}
];
const FOE=Object.fromEntries(FOES.map(f=>[f.key,f]));
/* Tapestry art (tools/art/tapestry_art_brief.md): img/foes/<key>.jpg is the right half of the arena frieze (2:1), img/foes/<key>_p.jpg the briefing hunt scene */
FOES.forEach(f=>{f.img=`img/foes/${f.key}.jpg`;f.portrait=`img/foes/${f.key}_p.jpg`});
const TOWER=[['wolf','bat','skeleton'],['beetle','spider','gargoyle'],['slime','mirror','puppet'],['treant','ogre','banshee'],['shaman','thief','golem'],['knight'],['king']];
const rollFoes=()=>TOWER.map(p=>p[Math.floor(Math.random()*p.length)]);
const FL=()=>FOE[S.foeKey||S.run.foes[S.stage]];
// between floors: max HP +5, and only part of the lost HP comes back
const FLOOR_HEAL=.2;
