# 怪物立绘生成提示词（给 Codex / 图像模型）

目标：替换 16 只怪物的代码 SVG 剪影，风格对齐黑铁骑士立绘（img/knight.jpg、img/knight_portrait.jpg）。

## 每只怪物要两张图

| 文件 | 用途 | 尺寸 | 构图 |
|---|---|---|---|
| `img/foe_<key>.jpg` | 战斗场景右半边 | 1200×400（3:1） | 怪物居中偏上，头部在画面上 1/3，左右留背景 |
| `img/foe_<key>_p.jpg` | 怪物资料面板竖图 | 480×1000（约 1:2） | 仰视全身像，头部在画面顶部 20% 以内 |

JPG，质量 85，单张不超过 250KB，不要文字、不要边框、不要水印。

## 公共风格（每条提示词前都加上）

> Dark fantasy painted game illustration, same style as a gothic clockwork tower RPG: dramatic low-angle view, rich black and bronze palette with burnished gold highlights, glowing amber eyes and rim light, ornate antique clock faces with Roman numerals and brass gears floating in the background, drifting embers and golden sparks, deep crimson accents, night sky with spires of a clock tower, painterly digital art, high detail, cinematic lighting, centered single creature, no text, no frame.

## 每只怪物

| key | 名字 | 层 | 主体描述（接在公共风格后） |
|---|---|---|---|
| wolf | 灰鬃野狼 | 1 | a huge gaunt grey-maned wolf snarling, ragged fur, scars, bronze collar with a broken clock key, crouched to pounce on dusty tower stairs |
| bat | 吸血蝠 | 1 | a giant vampire bat hanging from a brass clock beam, wings half spread with veins lit by amber light, needle fangs, red glowing eyes |
| skeleton | 骷髅兵 | 1 | an undead skeleton soldier in rusted bronze half-armor and a torn crimson tabard, notched sword and round shield, standing guard on a spiral staircase |
| beetle | 铁壳甲虫 | 2 | a massive armored beetle with a black iron carapace riveted like plate armor, gold filigree seams, horn like a clock hand |
| spider | 剧毒织蛛 | 2 | a venomous spider weaving glowing green-gold webs between giant brass gears, dripping poison, eight amber eyes |
| gargoyle | 钟楼石像鬼 | 2 | a stone gargoyle crouched on a cathedral clock ledge, cracked granite skin with molten gold in the cracks, bat wings, horns |
| slime | 分裂史莱姆 | 3 | a large translucent amber-gold slime splitting into smaller blobs, swallowed gears and clock hands visible inside, glossy surface |
| mirror | 镜之妖精 | 3 | a slender fae spirit emerging from a shattered clock-face glass, body of mirror shards reflecting golden light, eerie smile |
| puppet | 发条傀儡 | 3 | a clockwork marionette doll with porcelain mask face, exposed brass gears in its chest, wind-up key on its back, jointed limbs on strings |
| treant | 荆棘树人 | 4 | an ancient thorn-covered treant, bark twisted around a cracked clock face in its trunk, long thorned branch arms, amber glow in its hollow eyes |
| ogre | 独眼巨魔 | 4 | a hulking one-eyed ogre carrying a giant bronze bell-hammer over its shoulder, iron bands on its arms, brutish snarl |
| banshee | 哀泣女妖 | 4 | a wailing banshee ghost with long flowing silver hair and tattered pale robes, mouth open in a scream, translucent body, spectral bells around her |
| shaman | 哥布林萨满 | 5 | a goblin shaman hiding behind a carved totem pole topped with a clock, bone staff, feathers and skull trinkets, casting golden runes |
| thief | 时之窃贼 | 5 | a masked hooded thief in a dark cloak lined with stolen pocket watches, holding a curved dagger and a glowing hourglass, crouched |
| golem | 熔核魔像 | 5 | a hulking golem of black iron and boiler plates with a molten orange core glowing through cracks, steam venting, fists like forge hammers |
| king | 永夜魔王 | 塔顶 | the Demon King of Eternal Night on a throne built from a colossal broken clock, black horned crown, flowing dark robes with gold embroidery, holding a scepter shaped like a clock hand, overwhelming menace |

## 接入游戏

把图放到 `img/` 后，在 `index.html` 里把对应 key 加进 `PAINTED`：

```js
const PAINTED=new Set(['wolf','bat',...]);
```

没加进去的怪物继续用原来的 SVG。
