# Wasteland Checks

This document describes the map-check mechanics as they are currently reconstructed from reverse
engineering of the original assembly code and game data.
It currently covers the confirmed behavior of:

- skill checks
- attribute checks
- item checks
- member-count checks
- money-threshold checks

It is therefore not guaranteed to be perfect and may still contain mistakes.

<!--
RE anchors for future work:
- check dispatcher: 0x4101..0x427d
- check type decode: 0x437f, 0x438a
- skill check core: 0x82f0..0x840b
- skill improvement: 0x838e..0x840b
- attribute check core: 0x840c..0x8487
- item-like / other check helper nearby: 0x8488..0x84db
- distinct d6 helper: 0x905f
- rnd helper: 0x9041..0x905e
- threshold builder: 0x9eac
- distinct2d6 builder: 0x9e84
- score compare helper: 0x9e69
-->

## Scope

This document describes how one individual check record resolves to pass or fail once a specific
character has already been chosen.

It does not yet cover:

- how the higher-level action layer chooses which party member is tested
- how multiple check records inside one action are combined
- fail-side effects such as damage or action redirection

## Check Record Model

Each check record has three gameplay fields:

- `type`
- `difficulty`
- `value`

Confirmed relevant check types:

| Type | Meaning | `value` meaning |
| --- | --- | --- |
| `0` | Skill | One-based skill ID |
| `1` | Item | Item ID |
| `2` | Attribute | Direct offset into the character record |
| `3` | Members | Exact required party size |
| `4` | Money-threshold check | Unsigned 8-bit money threshold |

The `difficulty` field is a 5-bit integer and should be treated as a value in `0..31`.

The `value` field is type-specific:

- for skill checks it is a one-based skill ID
- for item checks it is an item ID
- for attribute checks it is a direct byte offset into the character record, not a small enum
- for member-count checks it is the exact party size to test for
- for money-threshold checks it is the exact unsigned dollar threshold `0..255` used by the check

## Distinct 2d6

Skill checks and most attribute checks use a special two-die roll instead of standard `2d6`.

Exact algorithm:

```text
die1 = 1d6
die2 = 1d6
while die2 == die1:
    die2 = 1d6

distinct2d6 = die1 + die2
```

Consequences:

- sums range from `3` to `11`
- `2` and `12` are impossible
- this is not standard `2d6`
- if you want original probabilities then you should implement the reroll exactly as above

## Raw Values And Modifiers

This document uses two different terms for attributes:

- `attribute value`: the raw stored byte in the character record
- `attribute modifier`: a combat-only derived value

Checks documented here use raw values unless stated otherwise.
They do not use the combat modifier curve.

## Skill Checks

### Inputs

A skill check uses:

- the check `difficulty`
- the check `value` as a one-based skill ID
- the character's learned level for that skill
- the skill's linked attribute offset from the executable skill metadata
- the raw linked attribute value from the character record

Valid skill IDs are `1..35`.

The linked attribute for each skill is stored as a direct character-record offset:

| Offset | Attribute |
| --- | --- |
| `0x0E` | Strength |
| `0x0F` | IQ |
| `0x10` | Luck |
| `0x11` | Speed |
| `0x12` | Agility |
| `0x13` | Dexterity |
| `0x14` | Charisma |

### Resolution

Resolve a skill check in this order:

1. Look up the character's learned level for the specified skill.
2. If the learned level is `0`, the check fails immediately.
3. If `difficulty == 0`, the check succeeds immediately.
4. Roll `distinct2d6`.
5. If `distinct2d6 < 5`, the check fails immediately.
6. Read the raw linked attribute value.
7. Compute the threshold and score:

```text
threshold = 15 + 5 * difficulty

score =
    distinct2d6
  + linkedAttributeValue
  + 3 * skillLevel
```

8. The check succeeds if:

```text
score >= threshold
```

### Pseudocode

```text
function resolveSkillCheck(character, skillId, difficulty, skillMeta):
    skillLevel = character.skillLevel(skillId)
    if skillLevel == 0:
        return false

    if difficulty == 0:
        return true

    roll = distinct2d6()
    if roll < 5:
        return false

    attributeOffset = skillMeta[skillId].linkedAttributeOffset
    attributeValue = character.byte[attributeOffset]

    threshold = 15 + 5 * difficulty
    score = roll + attributeValue + 3 * skillLevel
    return score >= threshold
```

### Skill Improvement After Success

After a successful skill check, the game may increase the checked skill by `1`.

No improvement attempt is made when either of the following is true:

- `skillLevel >= characterLevel`
- `skillLevel >= difficulty`

Otherwise the game computes:

```text
improvementTarget = floor((difficulty - skillLevel) / 2) + 1
improvementRoll = 1d10
```

The skill increases by `1` if:

```text
improvementRoll <= improvementTarget
```

Notes:

- this improvement step only happens after a successful skill check
- `difficulty == 0` takes the immediate-success branch, so it does not go through this
  improvement roll
- there is no analogous confirmed attribute-growth mechanic for attribute checks

## Item Checks

### Inputs

An item check uses:

- the check `value` as an item ID
- the character's `30` item slots
- the second byte of the matching slot as the item's current count / ammo / status byte

The `difficulty` field is ignored.

### Resolution

Resolve an item check in this order:

1. Scan the character's item slots for the first slot whose item ID equals `value`.
2. If no such item slot exists, the check fails.
3. If a matching slot exists, the check succeeds.
4. After success, inspect the low 6 bits of the slot's second byte.

If the low 6 bits are `0`:

- leave the item slot unchanged

If the low 6 bits are nonzero:

- decrement the low 6 bits by `1`
- preserve the upper 2 bits unchanged

If that decrement makes the low 6 bits become `0`:

- clear the whole item slot
- if the removed item was equipped as weapon, clear the equipped-weapon slot reference
- if the removed item was equipped as armor, clear the equipped-armor slot reference and reset armor
  class to `0`

So an item check is both:

- an inventory possession check
- and, for count-based items, a consumption step

### Pseudocode

```text
function resolveItemCheck(character, itemId):
    slot = first character item slot whose itemId matches
    if slot does not exist:
        return false

    count = slot.statusByte & 0x3f
    flags = slot.statusByte & 0xc0

    if count == 0:
        return true

    count -= 1
    if count == 0:
        clear slot
        if slot was equipped weapon:
            clear equipped weapon slot
        if slot was equipped armor:
            clear equipped armor slot
            armorClass = 0
        return true

    slot.statusByte = flags | count
    return true
```

### Notes

- the check uses the first matching slot found
- the `difficulty` field is not consulted
- the high 2 bits of the status byte are preserved when a count-based item is decremented
- whether the item is consumed is controlled by the matching inventory slot's second byte, not by a
    separate item-definition flag
- if the low 6 bits of that second byte are `0`, the item acts as a pure possession key and is not
    removed by the check
- this is the reason reusable quest items such as security passes can open many doors without being
    consumed

## Member Checks

### Inputs

A member check uses:

- the current party size
- the check `value` as the exact required party size

The `difficulty` field is ignored.

### Resolution

The check succeeds if and only if:

```text
currentPartySize == value
```

Otherwise it fails.

This is an exact-equality check, not a `>=` check.

### Pseudocode

```text
function resolveMemberCheck(currentPartySize, value):
    return currentPartySize == value
```

### Notes

- most normal shipped uses have small values such as `1`, `2`, `3`, and `4`
- a few shipped records contain implausible values such as `107` and `120`; these are best treated
  as malformed data, not as evidence for a different mechanic

## Attribute Checks

### What `value` Means

For attribute checks, the `value` field is a direct offset into the character record.

Confirmed intended values:

| `value` | Meaning |
| --- | --- |
| `0x0E` | Strength |
| `0x0F` | IQ |
| `0x10` | Luck |
| `0x11` | Speed |
| `0x12` | Agility |
| `0x13` | Dexterity |
| `0x14` | Charisma |
| `0x18` | Gender |
| `0x24` | Level |

So despite the type name, this category is really closer to `character stat check` than strictly
`attribute check`.

The original game data also contains a few isolated type-2 records with values outside this set.
Those do not match the confirmed mechanics below and are best treated as malformed data rather than
as intended gameplay rules.

### Normal Attribute Checks

For the normal raw attributes `0x0E..0x14`, the game resolves the check as follows:

1. Roll `distinct2d6`.
2. If `distinct2d6 < 5`, the check fails immediately.
3. Read the raw attribute value from the character record.
4. Compute:

```text
threshold = 15 + 5 * difficulty

score =
    distinct2d6
  + attributeValue
```

5. The check succeeds if:

```text
score >= threshold
```

This uses the raw stored attribute value, not the combat attribute modifier.

### Special Case: Level Check

When `value == 0x24`, the check does not roll dice.

Instead it succeeds if:

```text
characterLevel >= difficulty
```

### Special Case: Gender Check

When `value == 0x18`, the check does not roll dice.

Instead it succeeds if:

```text
characterGender == difficulty
```

Confirmed gender encoding:

| Value | Meaning |
| --- | --- |
| `0` | Male |
| `1` | Female |

### Pseudocode

```text
function resolveAttributeCheck(character, value, difficulty):
    if value == 0x24:
        return character.level >= difficulty

    if value == 0x18:
        return character.gender == difficulty

    if value not in {0x0E, 0x0F, 0x10, 0x11, 0x12, 0x13, 0x14}:
        error "unsupported or malformed attribute-check value"

    roll = distinct2d6()
    if roll < 5:
        return false

    attributeValue = character.byte[value]
    threshold = 15 + 5 * difficulty
    score = roll + attributeValue
    return score >= threshold
```

## Money-Threshold Check

This is the check type encoded as `4`.

### Inputs

This check uses:

- the character's current money as a 24-bit unsigned value
- the check `value` as an 8-bit unsigned threshold

The `difficulty` field is ignored.

### Resolution

The game writes the 8-bit check `value` into the low byte of a temporary 24-bit money value and
explicitly clears the upper two bytes to `0` before comparing.

So the threshold is:

```text
threshold = value
```

with no scaling, decimal packing, or lookup-table conversion.

That means:

- `10` means exactly `$10`
- `255` means exactly `$255`
- this mechanic cannot express thresholds above `$255`

The exact individual-check rule is:

```text
pass if currentMoney < threshold
fail if currentMoney >= threshold
```

So this is not an `enough money` check.
It is the opposite: it passes only when the character has strictly less money than the threshold.

### Pseudocode

```text
function resolveMoneyThresholdCheck(characterMoney, value):
        threshold = value
        return characterMoney < threshold
```

### Notes

- this check has its own dedicated branch and is not an item-check alias
- only the 8-bit `value` byte is used; `difficulty` is ignored
- the compare is done against the real 24-bit stored money field, but the check threshold itself is
    only an unscaled 8-bit dollar amount
- in the shipped maps, the only confirmed real type-`4` record currently observed uses `value = 10`
- the surrounding action can still apply separate modifiers or redirects after the check, so this
    comparison alone does not tell you what the full gameplay outcome is

## Implementation Notes

- Skill checks and normal attribute checks share the same threshold formula:

```text
15 + 5 * difficulty
```

- Skill checks add `3 * skillLevel`; normal attribute checks do not.
- Item checks, member checks, and money-threshold checks ignore `difficulty`.
- Skill checks have a special `difficulty == 0` auto-success, but only if the skill is actually
  learned.
- Normal attribute checks do not have a `difficulty == 0` auto-success. They still roll dice and
  still compare against threshold `15`.
- Both skill checks and normal attribute checks use the same automatic failure rule:

```text
distinct2d6 < 5
```

- This means sums `3` and `4` fail before the threshold comparison even happens.
- Member checks use exact equality with party size.
- Money-threshold checks pass only when `currentMoney < value`, where `value` is a literal dollar
    threshold `0..255`.
