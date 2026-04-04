# Wasteland Combat

This document describes the combat system as it is currently reconstructed from the original game
data.

<!--
RE anchors for future work:
- order UI and hotkeys: 0x2176..0x226e, hotkey string at 0xa44d = "HAWRELU"
- order menu text: message string 0x37 = Run / Use / Hire / Evade / Attack / Weapon / Load/unjam
- hire execution: 0x34ac..0x35f2
- evade defense paths: 0xb269..0xb295, 0x2b82..0x2bb5
- weapon swap execution text: 0x32b1..0x32c5
- manual loaded fire path: 0x2f84..0x3258
- burst/auto selection UI: 0x23eb..0x245a, hotkey string at 0xa458 = "SBA"
- ranged threshold builder: 0x587f..0x58dd, 0x58de..0x5904, 0x3bce..0x3c36
- weapon damage core: 0x5955
- mob armor reduction: 0x5872
- player damage application: 0x59d6
- combat phase pointers at logical addresses 0x2d3c, 0x2780, 0xad70, 0x2cc0
- ranged / explosive family lookup table at ds:0xcd00 = [0x0d,0x0a,0x0b,0x0c,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,0xff]
- player ranged phase: file 0x2f3c..0x3258
- enemy ranged / explosive phase: file 0x2980..0x2b4a
- melee scheduler phase: file 0xaf70..0xb307
- scheduler player attack path: file 0xb118..0xb1f7
- scheduler enemy attack path: file 0xb1fd..0xb2d7
-->

## Combat Data Model

### Player Characters

Source: player character records in the save data.

Combat-relevant player values:

- `Strength`
- `Intelligence`
- `Luck`
- `Speed`
- `Agility`
- `Dexterity`
- `Charisma`
- `Armor Class`
- `Current CON`
- `Maximum CON`
- equipped weapon
- learned skill levels
- current weapon status

### Weapon Definitions

Combat-relevant weapon values:

- weapon family
- governing skill
- damage
- ammo capacity
- ammo item
- demolition flag

The `damage` value is the number of six-sided dice rolled for the weapon's base damage.

Weapon families:

| Type | Meaning |
| --- | --- |
| `1` | melee weapon |
| `2` | short-range single-shot weapon |
| `3` | medium-range single-shot weapon |
| `4` | long-range single-shot weapon |
| `5` | short-range burst/auto weapon |
| `6` | medium-range burst/auto weapon |
| `7` | long-range burst/auto weapon |
| `8` | medium-range rocket weapon |
| `9` | long-range rocket weapon |
| `10` | short-range energy weapon |
| `11` | medium-range energy weapon |
| `12` | long-range energy weapon |
| `13` | explosive weapon |

Examples of governing combat skills include `Brawling`, `Knife fight`, `Clip pistol`,
`Assault rifle`, `AT weapon`, `SMG`, and `Energy weapon`.

For combat sequencing, weapon families split into two major classes:

- melee: `1`
- ranged / explosive: `2..13`

That same family split is also used by enemy `Weapon Type`.

### Enemy Records

Combat-relevant enemy values:

- `Sturdiness`
- `Combat Rating`
- `Fixed Damage`
- `Random Damage`
- `Group Size Limit`
- `Armor Class`
- `Weapon Type`

Derived enemy values:

- Each spawned enemy rolls hit points from `Sturdiness` as
  `floor(sturdiness / 4) + ((rnd(highByte) << 8) | rnd(lowByte))`.
- `rnd(0) = 0`, `rnd(1) = 1`, and `rnd(n >= 2)` returns a uniform value in `1..n`.
- Killing an enemy grants `sturdiness * (armorClass + 1)` experience points.

<!--
RE anchors for sturdiness:
- HP roll: wlu.exe 0x47e3..0x4842
- rnd helper: wlu.exe 0x9041..0x905e
- XP award: wlu.exe 0x5bc7..0x5c18
-->

### Encounter Groups

An encounter can contain up to three enemy groups.

Each group has:

- an enemy record reference
- a current group size

Important behavior:

- fixed encounters may mark a group size as random
- that random flag is consumed the first time the encounter is initialized
- after that, the rolled size is stored as the group's current size
- random encounters are instantiated into dedicated random-encounter slots and only use group `1`
- a group becomes empty when its current size reaches `0`; at that point its enemy reference is
  also cleared

### Combat Sides

Combat does not operate directly on raw encounter actions.
Before a round starts, the engine turns source encounter groups into combat groups and assigns those
combat groups to combat sides.

Important rules:

- one encounter action can contribute up to three source groups
- groups are assigned to sides by side identity, not by encounter record
- multiple nearby encounters that belong to the same non-player side can therefore join one fight
- when they do, their source groups are appended as separate combat groups in one shared combat side
- those groups are not merged into one HP pool or one shared group size; they stay separate combat
  groups under the same side
- a combat side has `7` group slots
- a battle has at most `4` sides total
- one of those sides is always the player-controlled side
- so a normal battle can contain at most `3` non-player sides

This gives the hard runtime ceilings:

- maximum groups in one non-player side: `7`
- maximum enemy groups in one battle: `21`

That is why multi-encounter fights such as Darwin or Rail Nomads can involve more than the three
groups from one encounter action, but they still do not grow without bound.
The engine is not "all nearby encounters, unlimited". It is "up to three enemy sides, each with up
to seven active combat groups, with those groups potentially coming from several nearby encounter
actions".

<!--
RE anchors for combat sides:
- side records are 14-byte blocks rooted at 0x7131; 0x7208 maps current side index to record
- side record bytes 1..7 are occupied group/member references; 0x71e3 counts them
- 0x71d3 appends a new occupied reference into the first free slot 1..7
- 0x61a6 clears one whole 14-byte side record
- side-count ceiling: 0x5ea5..0x5eb1 blocks growth when 0x4657 == 3
- same-side grouping / processing markers: 0x1d48..0x1ead
- side merge / transfer helpers: 0x5dc4..0x5e76, 0x6018..0x6077
-->

## Shared Conventions

### Dice Notation

This document uses standard dice notation:

- `1d6` = roll one six-sided die
- `Nd6` = roll `N` six-sided dice and sum them

Most damage values in Wasteland are stored as dice counts, not as flat damage.

### Raw Values And Modifiers

This document uses two different terms for attributes:

- `attribute value`: the raw stored attribute number from the character record
- `attribute modifier`: the combat modifier derived from the table below

Unless a formula explicitly says `modifier`, it uses the raw value.
For the combat formulas documented here, the modifier curve tops out at `+3`. Values above `18`
do not gain a larger confirmed combat modifier.

### Attribute Modifier Table

The same modifier curve is used whenever combat asks for a `Luck`, `Dexterity`, `Agility`, or
`Strength` modifier:

| Attribute value | Modifier |
| --- | --- |
| `1..2` | `-4` |
| `3..4` | `-3` |
| `5..6` | `-2` |
| `7..8` | `-1` |
| `9..13` | `0` |
| `14..15` | `1` |
| `16..17` | `2` |
| `18+` | `3` |

## Combat Round Structure

Combat rounds are not resolved by one single global initiative formula.
They use four fixed phases, and only the third phase uses an initiative scheduler.

The phase order is:

1. player ranged and explosive attacks
2. enemy ranged and explosive attacks
3. melee scheduler
4. non-attack command execution

This structure is the key to understanding mixed combat:

- player ranged attacks can kill enemy ranged attackers before those enemies reach phase `2`
- enemy ranged attacks can kill player melee attackers before those players reach phase `3`
- player melee and enemy melee attacks do not happen in separate side phases; they are mixed
  together inside the scheduler
- non-attack commands such as `Hire`, `Evade`, `Load / unjam`, and `Use` happen only after all
  attack phases are done

The handbook claim that ranged attacks are always simultaneous does not match the decoded code path.
The actual code commits damage and deaths immediately between phases and also inside each phase.

### Phase Assignment

The `Attack` command first splits by attack family:

- player weapons with family `2..13` enter the player ranged / explosive phase
- enemy groups with `Weapon Type` `2..13` enter the enemy ranged / explosive phase
- everything else uses the melee scheduler

For players this also explains why melee is tied to the scheduler and firearms are not:

- ranged / explosive `Attack` commands are consumed in phase `1`
- melee `Attack` commands survive until phase `3`

So manual melee is not a mysterious second subsystem floating beside the main combat loop.
It is the dedicated phase-`3` attack subsystem for non-ranged attacks.

### Hire

`Hire` is a dedicated combat action for recruitable friendly NPCs. It is not a generic conversation
action.

Known hard restrictions:

- a full seven-member roster blocks hiring immediately
- the target must pass additional recruitability checks before the score contest happens

If the target's `Willingness` is `0`, the NPC joins automatically.

This action uses raw values, not attribute modifiers.

Otherwise the game compares:

```text
npcResistance =
    targetWillingness
  + targetLevel

rangerAppeal =
    floor((rangerCharismaValue + rangerIntelligenceValue) / 2)
  + rangerCharismaValue
  + rangerLevel
  + distinct2d6
```

The hire attempt succeeds if:

```text
rangerAppeal >= npcResistance
```

So `Charisma` matters, but not by itself. `Intelligence` and the ranger's level also feed into the
hire roll.

On success:

- the NPC is moved into the party roster
- the NPC's join string is shown
- the NPC stops using its encounter-side control state and becomes a normal party member

On failure the game logs that the ranger tried to hire the target and failed.

### Evade

`Evade` is a defense command.

Its main confirmed effect is to make enemy attacks less likely to hit.

For the direct enemy attack resolver, the hit threshold uses:

| Player command | Base |
| --- | --- |
| `Evade` | `60` |
| `Attack` | `50` |
| all other known commands | `40` |

Higher threshold values are better for the defender because enemy attacks hit only when:

```text
random(1..100) >= threshold
```

So `Evade` is explicitly better defense than `Attack`, and `Attack` is explicitly better defense
than the other known non-evade commands.

There is also a second confirmed evade rule in one enemy damage-application path:

- if the defender is using `Evade`
- and the pending damage is below `6`

then the hit is completely negated and the combat log reports that the defender nimbly evaded it.

This is not a global enemy-attack rule.
The `< 6` auto-dodge is implemented in the normal enemy ranged / explosive phase before the shared
enemy damage routine is called.
Enemy melee uses the same downstream damage routine, but it does not perform this pre-check.
For an implementation, the safe rule is:

- apply the `< 6` full-dodge only to the normal enemy ranged / explosive phase
- do not apply it automatically to enemy melee attacks

### Load / unjam

`Load / unjam` is a combined action:

- if the equipped weapon is jammed, the game tries to clear the jam first
- only if the weapon is not jammed afterward does the action continue into the normal reload step

The unjam attempt is not a pure random coin flip. It uses the current weapon's governing combat
skill and the attacker's `Intelligence`.

Known jam behavior:

- a newly jammed weapon starts at jam severity `0`
- each failed unjam attempt raises the jam severity by `1`
- jam severity is capped at `5`
- higher jam severity makes future unjam attempts harder

The unjam roll is:

```text
unjamDifficulty =
    15
  + 5 * jamSeverity

unjamScore =
    distinct2d6
  + Intelligence value
  + 3 * current weapon skill level
```

The jam is cleared if:

```text
distinct2d6 >= 5
and
unjamScore >= unjamDifficulty
```

So the current weapon skill absolutely matters. This is not a repair-skill check and not a simple
flat chance.

Practical consequences:

- the first unjam attempt is the easiest one because a fresh jam starts at severity `0`
- repeated failures make the same jam progressively worse
- a successful unjam clears the jammed state before the reload step runs
- in the combat `Load / unjam` action, the weapon is then reloaded normally if compatible ammo is
  available

<!--
RE anchors for load/unjam:
- combat load/unjam dispatcher: 0x3428..0x3462
- jam-state check: 0x5e96
- unjam formula: 0x9ccd..0x9d4e
- weapon skill lookup helper: 0x84fa..0x8519
- skill-level multiplier by 3: 0x9ecc
- jam creation with initial severity 0: 0x36b2..0x36f4
-->

## Player Ranged And Explosive Attacks

### Preconditions

The ranged / explosive resolver is used when all of the following are true:

- the player's command is `Attack`
- the equipped weapon is a ranged, rocket, energy, or explosive weapon
- the weapon is loaded and not jammed

If those conditions are not met, the game falls back to a much weaker improvised attack with some
ranged weapons.

### Hit Check

A loaded ranged attack hits if:

```text
attackRoll >= defenderThreshold
```

#### Attack Roll

```text
attackRoll =
    distinct2d6
  + Dexterity value
  + 3 * current weapon skill level
  + situational bonuses
```

Known situational bonuses:

- explosives add `10`
- `Auto` fire adds the current weapon's current load as an accuracy bonus

This bonus uses the weapon's load before the shot consumes ammunition.

#### Defender Threshold

First compute:

```text
distanceBand = floor(distance / 5)
```

Then derive the weapon's range class:

| Range class | Weapon types |
| --- | --- |
| `0` | `2`, `5`, `10`, `13` |
| `1` | `3`, `6`, `8`, `11` |
| `2` | `4`, `7`, `9`, `12` |

Then derive the defender column from the enemy's `Weapon Type`:

- use column `1` if the `Weapon Type` is one of `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`,
  `10`, `11`, `12`, or `13`
- use column `0` otherwise

Finally use this threshold table:

| Range class | Column `0` | Column `1` |
| --- | --- | --- |
| `0` | `5 * distanceBand` | `5 * distanceBand + 7` |
| `1` | `10 + 2 * distanceBand` | `17 + 2 * distanceBand` |
| `2` | `20 + distanceBand` | `27 + distanceBand` |

### Damage

#### Normal Firearms and Energy Weapons

For normal loaded firearms and energy weapons:

```text
rawDamage = weaponDamage d6 + Luck modifier
armorSoak = enemyArmorClass d6
finalDamage = max(0, rawDamage - armorSoak)
```

#### Rockets

Rockets use a special damage rule:

```text
if weaponDamage < enemyArmorClass:
    rocketDice = weaponDamage
else:
    rocketDice = 2 * weaponDamage - enemyArmorClass
```

Then:

```text
finalDamage = rocketDice d6 + Luck modifier
```

Rockets do not apply the normal enemy armor soak roll afterward.
They also stay on the normal single-target ranged path. They do not enter the explosive
area-of-effect path.

#### Unloaded or Jammed Fallback

If the weapon is in a ranged family but the loaded ranged resolver cannot be used, the game falls
back to a weaker attack:

- weapon types `2` and `10`: `1d6`
- all other ranged-family weapon types: `2d6`

This fallback is not the real firearm damage model. It is the penalty case for a non-usable ranged
weapon.

Weapon types `2` and `10` are used by projectile pistols and laser pistols, so the intent appears
to be that a small empty ranged weapon does less damage than a larger empty ranged weapon.

### Timing And Interruptibility

Player ranged / explosive fire is always phase `1`.

What is clear:

- loaded player ranged attacks are resolved one attacker after another, not as a deferred end-of-
  phase damage batch
- damage to enemy members is written into the live encounter runtime state immediately
- if that damage kills a target, the corresponding runtime member slot is cleared immediately

- player ranged attackers fire before enemy ranged attackers and before any melee scheduler events
- if a player ranged attacker kills an enemy before phase `2`, that enemy does not get its own
  ranged attack later in the round
- after a player's ranged / explosive attack finishes, that attack command is consumed and does not
  also enter the melee scheduler

<!--
RE anchors for timing / interruptibility:
- player ranged phase outer loop: 0x2f3c..0x2f83
- player ranged resolver: 0x2f84..0x325e
- player ranged completion clears the order: 0x3258 -> 0x2fc2 -> 0x3652
- per-hit mob damage application: 0x5c9d..0x5d82
- mob HP subtraction and slot clear on death: 0x5d17..0x5d4c
-->

## Fire Modes

Weapons with fire-mode selection use three modes:

| Mode | Meaning |
| --- | --- |
| `0` | single |
| `1` | burst |
| `2` | auto |

Fire-mode selection is available only for weapon types:

- `5`, `6`, `7`
- `10`, `11`, `12`

Mode requirements:

- `Burst` requires at least `3` rounds loaded.
- `Auto` requires more than `3` rounds loaded.

### Accuracy Bonus

Only `Auto` fire gets an extra accuracy bonus:

```text
autoFireAccuracyBonus = currentLoad
```

`Single` and `Burst` do not get this bonus.

### Ammo Consumption

Ammo spent per attack action:

- `Single`: `1`
- `Burst`: `3`
- `Auto`: the entire current load

### Successful Hit Applications

The game performs one accuracy check for the attack action first.
If that check succeeds, the number of actual damage applications depends on fire mode:

- `Single`: exactly `1`
- `Burst`: `random(1..3)`
- `Auto`: `sum(max(1, floor(currentLoad / 4)) d4)`

So `Burst` is not "always three hits".
It is "spend three rounds, then roll how many hits from the burst actually land".

`Auto` also does not convert bullets directly into hits. It compresses the current load into a much
smaller number of hit applications.

Targeting by fire mode:

- `Single`: the successful hit application stays on the selected enemy group
- `Burst`: all successful hit applications stay on the selected enemy group
- `Auto`: each successful hit application can be redistributed across the available enemy groups on
  the current target side

For `Auto`, the game rerolls the random target-group pick until it lands on a living group. The
spray is therefore distributed across the live runtime groups on the current target side, not
across map positions.

## Explosives

Explosives use a separate area-of-effect path.
This confirmed blast path is selected by weapon family `13`.
Weapon families `8` and `9` are rockets, but they stay on the normal single-target ranged path.

Rules:

- one raw damage roll is made as `weaponDamage d6`
- the extra `Luck` damage bonus is not applied in this path
- each affected target still gets its own `enemyArmorClass d6` soak roll
- the blast scans the affected enemy groups on the target side
- within each group, the engine checks up to `10` runtime member slots
- every occupied slot found in that scan is hit by that same raw damage roll

This is why explosives can hit extremely hard while still obeying the same basic `Nd6` damage
storage model as other weapons.

Practical consequences:

- explosives are not limited to the originally selected enemy group
- damage does not get "split" across targets; each affected target resolves the full raw roll
  against its own armor soak
- if a fight somehow had more than `10` living members in one group, this path would only iterate
  over the first `10` runtime member slots

## Enemy Ranged And Explosive Attacks

Enemy groups with `Weapon Type` `2..13` are resolved in phase `2`, after player ranged fire and
before the melee scheduler.

Practical consequences:

- if player ranged fire killed the enemy shooter in phase `1`, that shooter does not attack in
  phase `2`
- if enemy ranged fire kills a player who chose melee, that player never reaches the melee
  scheduler in phase `3`
- like player ranged fire, enemy ranged fire works against live runtime state and is therefore
  interruptible by earlier committed kills

Unlike phase `1`, this is not a weapon-and-ammo system. Enemy groups do not carry magazines or
select fire modes. Instead, the engine derives a hardcoded firing profile directly from `Weapon Type`.

### Range Class

Enemy ranged families use the same three range classes as player weapons:

| Range class | Weapon Types |
| --- | --- |
| `0` | `2`, `5`, `10`, `13` |
| `1` | `3`, `6`, `8`, `11` |
| `2` | `4`, `7`, `9`, `12` |

### Hit Check

The engine uses a per-encounter range value and buckets it in 5-step bands.

```text
rangeBand = floor(range / 5)
```

The defender threshold is then:

```text
if rangeClass == 0:
    defenderThreshold = 5 * rangeBand
else if rangeClass == 1:
    defenderThreshold = 10 + 2 * rangeBand
else:
    defenderThreshold = 20 + rangeBand
```

The enemy attack roll is:

```text
attackRoll =
    distinct2d6
  + Combat Rating
  + familyAccuracyBonus
```

Where:

- `distinct2d6` is the same two-distinct-d6 roll used elsewhere in combat
- rolls of `2` or `3` auto-miss before the threshold check
- `familyAccuracyBonus` depends on `Weapon Type`

Accuracy bonus by family:

| Weapon Types | Bonus |
| --- | --- |
| `2`, `3`, `4`, `8`, `9`, `13` | `0` |
| `5`, `6`, `7`, `10` | `8` |
| `11`, `12` | `16` |

The shot hits when:

```text
attackRoll >= defenderThreshold
```

### Hit Applications By Family

If the attack hits, the engine converts it into one or more actual damage applications:

| Weapon Types | Hit applications on a successful hit |
| --- | --- |
| `2`, `3`, `4`, `8`, `9`, `13` | exactly `1` |
| `5`, `6`, `7`, `10` | `random(1..3)` |
| `11`, `12` | `3d4` |

This is the important distinction from player weapons:

- enemy burst-like families are hardcoded as `random(1..3)` applications
- enemy auto-like families are hardcoded as `3d4` applications
- enemy `Weapon Type 13` is not an area-of-effect blast here; it is a single successful damage
  application with short-range accuracy

### Target Selection

Each damage application chooses one random living player from the current party side.

This means:

- repeated applications from the same enemy group can hit the same player multiple times
- repeated applications can also distribute across different players
- dead or empty player slots are skipped and rerolled

There is no phase-`2` logic that splashes across multiple enemy groups, because phase `2` is the
enemy attack phase against player characters, not the player attack phase against encounter groups.

### Damage

Each successful damage application rolls raw damage as:

```text
rawDamage = Fixed Damage + Random Damage d6
```

The defender then rolls armor soak:

```text
armorSoak = playerArmorClass d6
finalDamage = max(rawDamage - armorSoak, 0)
```

Confirmed evade special case:

```text
if playerCommand == Evade and rawDamage < 6:
    finalDamage = 0
```

The application is then committed immediately to the player's live hit points.

## Melee Scheduler

The melee scheduler is phase `3`.

It is the resolver for:

- player `Attack` commands that did not qualify as ranged / explosive fire
- enemy groups whose `Weapon Type` is `1`

This is the part of the combat system where `Brawling`, `Speed`, repeated attacks, and mixed
player-versus-enemy initiative actually matter.

### Initiative

Melee attack order is determined by initiative rolls, from highest initiative to lowest.

Player initiative:

```text
playerInitiative =
    distinct2d6
  + Speed
  + 3 * Brawling
```

Enemy initiative:

```text
enemyInitiative =
    distinct2d6
  + 8 * Combat Rating
```

<!--
RE anchors for queue encoding:
- queue write helpers: 0xb0da..0xb107
- scheduler selection loads token/score from 0x7931/0x7932: 0xaeae..0xaee0
- token class split at 0xaf0d..0xaf27
-->

### Player Melee Attack Count, Accuracy, And Damage

Player melee attack count:

```text
playerMeleeAttackCount = floor(Brawling / 2) + 1
```

Player melee hit chance:

```text
hitChance =
    meleeBase
  + 3 * Brawling
  + Agility modifier
  - defenseTerm
```

Where:

```text
if enemyAttackType == 1:
    defenseTerm = 4 * enemyCombatRating
else:
    defenseTerm = 5
```

The code clamps `hitChance` into the `0..100` range.

The hit roll is:

```text
hit if random(1..100) < hitChance
```

The decoded code uses two possible melee base values:

- `50`
- `60`

Use `60` when the target enemy group is already locked into close combat with the attacker's side.
Use `50` when the target enemy group is not already locked into that close engagement.

Player melee raw damage:

```text
rawDamage =
    weaponDamage d6
  + 3 * current weapon skill level
  + Dexterity modifier
  + Strength modifier
  + Luck modifier
```

Then:

```text
armorSoak = enemyArmorClass d6
finalDamage = max(0, rawDamage - armorSoak)
```

### Enemy Melee Attack Count, Accuracy, And Damage

Enemy melee attack count:

```text
enemyMeleeAttackCount = Combat Rating
```

Enemy melee threshold:

```text
threshold =
    base
  + 3 * playerBrawling
  + Agility modifier
  - defenseTerm
```

Where:

```text
if enemyAttackType == 1:
    defenseTerm = 4 * Combat Rating
else:
    defenseTerm = 5
```

Like the player version, this threshold is built through the same bounded accumulator logic and
therefore effectively stays inside the `0..100` range.

The base depends on the defending player's current command:

| Player command | Base |
| --- | --- |
| `Evade` | `60` |
| `Attack` | `50` |
| all other known commands | `40` |

The enemy hit roll is:

```text
hit if random(1..100) >= threshold
```

Enemy melee raw damage:

```text
rawDamage = Fixed Damage + Random Damage d6
```

Then:

```text
armorSoak = playerArmorClass d6
finalDamage = max(0, rawDamage - armorSoak)
```

### Scheduler Interruptibility

The scheduler works against live combat state.

That means:

- if a player dies before the player's queued melee activation resolves, that activation is dropped
- if an enemy runtime slot is empty before its queued melee activation resolves, that activation is
  dropped
- melee kills can therefore interrupt later unresolved melee activations in the same round

This is also why mixed combat behaves the way it does:

- player ranged can prevent later enemy ranged or enemy melee
- enemy ranged can prevent later player melee
- once phase `3` begins, remaining melee attacks are interleaved by scheduler score, not by side

<!--
RE anchors for scheduler:
- phase dispatch: 0x2751..0x2789
- phase 1 = logical 0x2d3c => file 0x2f3c
- phase 2 = logical 0x2780 => file 0x2980
- phase 3 = logical 0xad70 => file 0xaf70
- phase 4 = logical 0x2cc0 => file 0x2ec0
- ranged / explosive classifier helper: 0x9f2f against ds:0xcd00
- player melee queue build: 0xb064..0xb09b
- enemy melee queue build skips ranged / explosive types: 0xafd8..0xafe1
- scheduler selection / dispatch: 0xb0ae..0xb115
- player scheduled attack: 0xb118..0xb1f7
- enemy scheduled attack: 0xb1fd..0xb2d7
- enemy phase-2 evade pre-check before shared damage resolver: 0x2982..0x29ac
-->
