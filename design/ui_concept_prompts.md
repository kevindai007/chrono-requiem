# UI concept art prompts (for Codex image generation)

Goal: concept mockups for a full UI restyle of 时之勇者 · CHRONO REQUIEM, a single-page web card game.
The look must match kevin's reference images in `design/ref/` — study them first, especially
`pick_screen.jpg` (class pick) and `card_design_sheet.jpg` (card design spec). These are the target quality bar.

## Shared style (prepend to every prompt)
Premium anime dark-fantasy card game UI, 16:10 landscape screen mockup, 1600x1000.
Theme: gothic clock tower, clockwork, Roman-numeral clock dials, compass-star emblems, time sand.
Palette: warm ivory parchment (#f3ead4) panels with thin gilded gold filigree borders and ornate corner
pieces; deep midnight navy (#141a33 to #0a0910) night-sky areas with soft blue glow (#5aa8ff); burnished
gold (#d4a54a / #f7dc96); accent crimson (#9a2414) for warrior, teal (#1d6a5c) for assassin, royal blue
(#26408f) for mage. Painted anime illustrations of the hero: a blond boy in silver-and-navy armour with a
white-and-navy cloak and gold clockwork details (see design/ref). Chinese serif display titles (bold,
wide letter spacing) paired with small Cinzel all-caps English subtitles. Layered, ornate but airy,
high-end mobile game polish (like Honkai / Arknights / Fate Grand Order menus), soft light, crisp UI
edges. All Chinese text must be legible and correct; keep text minimal and only use the strings given.

## Screens
1. **ui_brief.png — 战前情报 (floor briefing before a fight).** Title "灰鬃野狼", kicker "第 1 层 · FLOOR I".
   Large painted monster (a grey-maned wolf) framed in an ornate gold arch on the left over a night sky and clock dial.
   Right side: a seven-floor tower progress path (circular medallions linked by a gold line, current floor glowing),
   a parchment panel "敌方行动 FOE PATTERN" with 3 short bullet lines, a panel "你的职业 YOUR CLASS" with the warrior
   crest, and buttons "换职业重来" (dark) and "开 战" (big royal-blue-and-gold).
2. **ui_victory.png — 胜利结算 + 选牌 (victory and card reward).** Banner "VICTORY · 胜利", title "灰鬃野狼倒下了".
   Hero illustration on the left. Three ornate stat medallions: "回合 3", "生命 52 → 74", "下一层 铁壳甲虫".
   Section "战利品 SPOILS" with three upright parchment cards (gold frame, cost gem in top-left corner, art on top,
   name and short text below) and a fourth card-shaped "直接上楼" skip option. Celebratory gold light rays.
3. **ui_defeat.png — 失败 (defeat).** Banner "DEFEAT · 败北", title "时间终结". Same layout as victory but desaturated,
   crimson accents, cracked clock motif, the monster looming on the left, buttons "重新选职业" and "重试本层".
4. **ui_battle.png — 战斗界面 (battle).** Follow `design/ref/battle_screen.jpg` closely: hero vs monster split arena
   with VS medallion, the "命运织机 LOOM OF FATE" timeline grid (rows 敌方 / 交锋 / 勇者, columns I–VIII),
   a hand of five parchment cards, the round sand medallion "时之砂 3" and a big "推进时间" button.

Save to `design/concepts/` with the file names above.
