# Speed Dungeon - Audio Assets Package

## What's In Here

137 curated sound effects organized into 24 categories, ready for review and integration into Speed Dungeon. Each category has 2-7 options to choose from.

Reference the full SFX plan at `AUDIO_SFX_PLAN.md` in the repo root to see where each sound maps to a game action.

## Folder Structure

```
categorized/
├── combat-swings/       (7)  Sword whooshes, knife slices, chops
├── combat-impacts/     (15)  Plate, punch, soft, wood hit variants
├── combat-hit-outcomes/ (7)  Metal clashes, shield blocks (parry/block/counter)
├── combat-death/        (3)  Body fall thuds
├── combat-bow/          (2)  Bow release, arrow miss
├── combat-spell/        (2)  Magic cast variants
├── spell-fire/          (1)  Flames
├── spell-ice/           (1)  Frost
├── spell-misc/          (6)  Curse, darkness, shock, smite, teleport, water
├── conditions/          (3)  Burning loop, ice applied, debuff applied
├── healing-potions/     (4)  Bottle, bubble variants (autoinjectors)
├── equip-weapon/        (7)  Sword draws, knife draws, metal click
├── equip-armor/         (9)  Chainmail, cloth, light armor, headwear
├── equip-accessory/     (5)  Beads, ring, small metal (rings/amulets)
├── inventory-items/     (6)  Leather handle, belt, drop, wood
├── coins-shards/        (5)  Coin jingles, handle coins (shards)
├── crafting/            (6)  Smithing hammer, metal pot, metal latch
├── doors-exploration/   (9)  Door opens/closes, creaks (room exploration)
├── book-scroll/         (6)  Book open/close/flip, scroll (skill books)
├── level-up/            (1)  Level up fanfare
├── footsteps/           (6)  Footstep variants (movement animations)
├── monsters/            (8)  Bites, beast growls, wolf, bee, witch
├── ui-clicks/           (6)  RPG interface click variants
└── ui-interface/       (12)  Button, switch, toggle UI sounds
```

## How to Review

1. Open the `categorized/` folder
2. Each subfolder corresponds to a game action category
3. Listen to the options in each folder and pick your favorites
4. Mark which ones to keep, which to replace, and which categories need more/different sounds

## Gaps to Fill

These categories are light and may need additional sourcing:
- **combat-bow** (2) — could use more draw/release/arrow flight variants
- **spell-fire** (1) — need fireball whoosh, impact, and firewall crackle
- **spell-ice** (1) — need ice bolt launch, shatter, ice burst explosion
- **level-up** (1) — may want a more triumphant/distinctive fanfare
- **combat-death** (3) — could use armor rattle on top of body thud
- **battle-start / battle-victory / party-wipe** — no jingles/stings yet (not in these packs)
- **evade swoosh / miss whiff** — distinct from weapon swings, not yet sourced

## What's NOT Included Yet

Per the full SFX plan, we still need sounds for:
- Battle start/victory/defeat stings
- Experience gain tick
- Character creation/deletion
- Player join/leave lobby
- Vending machine interaction
- Pet summon/dismiss
- Error/denied buzzer
- Alert/notification ping

These will likely come from custom work or additional packs.

---

## Credits & Licenses

### CC0 (Public Domain) — No Attribution Required

**Kenney.nl**
https://kenney.nl

Used packs:
- RPG Audio (50 files) — footsteps, doors, knives, cloth, books, coins, metal
- Impact Sounds (130 files) — plate, metal, punch, soft, wood impacts
- UI Audio (50 files) — button clicks, switches
- Interface Sounds (100 files) — UI interaction sounds

License: Creative Commons CC0 1.0 Universal
https://creativecommons.org/publicdomain/zero/1.0/

These are free to use in personal, educational, and commercial projects with no attribution required. Kenney appreciates credit but does not require it.

---

**artisticdude (OpenGameArt)**
https://opengameart.org/content/rpg-sound-pack

Used pack:
- RPG Sound Pack (95 files) — battle swings, sword unsheathes, spells, interface clicks, inventory sounds (armor, cloth, coins, chainmail, bottles), NPC/monster sounds, door

License: Creative Commons CC0 1.0 Universal
https://creativecommons.org/publicdomain/zero/1.0/

---

**Kenney.nl via OpenGameArt**
https://opengameart.org/content/50-rpg-sound-effects

Used pack:
- 50 RPG Sound Effects — metal, cloth, book, footstep, creak, coin, knife sounds

License: Creative Commons CC0 1.0 Universal
Attribution to "Kenney.nl" or "www.kenney.nl" appreciated but not required.

---

### CC-BY 3.0 — Attribution Required

**Tuomo Untinen (Heroes of Hawks Haven)**
https://opengameart.org/content/rpg-sound-package

Used pack:
- RPG Sound Package (53 files) — combat (bow, hit, swing), spells (flames, frost, shock, smite, level up, curse, darkness, teleport, water), inventory (door, headwear, ring, scroll), monsters (animated objects, brain monster, giant bee, witch), environment (smithing)

License: Creative Commons Attribution 3.0 Unported (CC-BY 3.0)
https://creativecommons.org/licenses/by/3.0/

**Required attribution:**
Sound effects from "Heroes of Hawks Haven" by Tuomo Untinen, licensed under CC-BY 3.0.

This attribution must appear in the game's credits or an accessible attribution file.

---

## Summary of License Obligations

| Source | License | Attribution Required? |
|--------|---------|----------------------|
| Kenney.nl (all packs) | CC0 | No |
| artisticdude RPG Sound Pack | CC0 | No |
| Kenney 50 RPG SFX | CC0 | No |
| Tuomo Untinen RPG Sound Package | CC-BY 3.0 | **Yes** |

**Action needed:** Add a credits line for Tuomo Untinen in the game's about/credits section if any sounds from the `opengameart_rpg-sound-package` are used in the final game.
