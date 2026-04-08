# Savegame Format

This document describes the savegame block format used inside the Wasteland 1 `GAME1` and `GAME2` files.

It covers:

- how the savegame block is located
- the outer block structure
- the rotating-XOR decoded prefix
- party-group data
- character record layout

## Scope

Each of `GAME1` and `GAME2` contains one savegame block near the end of the file.

The block location and reserved block size are not self-describing. The game uses executable metadata from the executable to locate them.

See [EXE Format](exe.md) for the structure and locations of those tables.

In the shipped Wasteland 1 data:

- the savegame block in `GAME1` begins at offset `152517`
- the savegame block in `GAME2` begins at offset `166855`
- the reserved savegame block size is `0x1206` bytes in both files

All multi-byte integer fields are little-endian.

The rotating-XOR algorithm used by the encrypted payload is documented separately:

- [Rotating-XOR](rotating-xor.md)

## Outer Block Layout

The savegame block begins with a 4-byte header:

| Value | Meaning |
| --- | --- |
| `"msq0"` | Savegame block in `GAME1` |
| `"msq1"` | Savegame block in `GAME2` |

The currently understood structure is:

```text
header
rotatingXorPrefix
reservedTail
```

### Known Prefix

The understood prefix is exactly `0x806` bytes long:

| Offset | Type | Meaning |
| --- | --- | --- |
| `+0x00` | `char[4]` | `"msq0"` or `"msq1"` |
| `+0x04` | `u8` | XOR byte 1 |
| `+0x05` | `u8` | XOR byte 2 |
| `+0x06` | `u8[0x800]` | Rotating-XOR encrypted payload |

### Reserved Tail

The remainder of the reserved block is currently of unknown structure:

```text
0x1206 - 0x806 = 0x0A00 bytes
```

In the shipped Wasteland 1 `GAME1` and `GAME2` files, this entire trailing `0x0A00`-byte region is zero-filled.

So the currently understood savegame data is the decoded `0x800`-byte payload immediately after the two XOR bytes.

## Rotating-XOR Decoding

The `0x800`-byte payload uses the rotating-XOR decoding described in [Rotating-XOR](rotating-xor.md).

Decode exactly `0x800` bytes after the two XOR bytes and verify that the final checksum equals `endChecksum`.

## Decoded Payload Layout

The decoded payload has a fixed size of `0x800` bytes:

| Offset | Size | Meaning |
| --- | --- | --- |
| `0x000` | `0x038` | Four party-group records |
| `0x038` | `0x040` | Unknown |
| `0x078` | `0x001` | Viewport X |
| `0x079` | `0x001` | Viewport Y |
| `0x07A` | `0x003` | Unknown |
| `0x07D` | `0x001` | Current member count |
| `0x07E` | `0x001` | Current party index |
| `0x07F` | `0x001` | Current map/location byte |
| `0x080` | `0x001` | Total member count |
| `0x081` | `0x001` | Extra group count |
| `0x082` | `0x001` | Unknown |
| `0x083` | `0x001` | Minute |
| `0x084` | `0x001` | Hour |
| `0x085` | `0x001` | Combat scroll speed |
| `0x086` | `0x06F` | Unknown |
| `0x0F5` | `0x004` | Save serial number |
| `0x0F9` | `0x007` | Unknown |
| `0x100` | `0x700` | Seven character records |

## Party Group Record

The savegame contains four party-group records of `14` bytes each.

Layout:

| Offset within record | Type | Meaning |
| --- | --- | --- |
| `+0x00` | `u8` | Unused / unknown |
| `+0x01` | `u8[7]` | Party order |
| `+0x08` | `u8` | X position |
| `+0x09` | `u8` | Y position |
| `+0x0A` | `u8` | Current map/location byte |
| `+0x0B` | `u8` | Previous X |
| `+0x0C` | `u8` | Previous Y |
| `+0x0D` | `u8` | Previous map/location byte |

Party order semantics:

- values `1..7` reference one of the seven character slots
- `0` means an empty slot

## Character Record

Each character record is exactly `0x100` bytes.

The savegame payload contains seven of them, starting at offset `0x100`.

The same `0x100`-byte structure is also used for NPC records stored inside map blocks. See [Map Format](map.md).

### Character Layout

| Offset | Type | Meaning |
| --- | --- | --- |
| `0x00` | `char[14]` | NUL-terminated name |
| `0x0E` | `u8` | Strength |
| `0x0F` | `u8` | Intelligence |
| `0x10` | `u8` | Luck |
| `0x11` | `u8` | Speed |
| `0x12` | `u8` | Agility |
| `0x13` | `u8` | Dexterity |
| `0x14` | `u8` | Charisma |
| `0x15` | `u24` | Money |
| `0x18` | `u8` | Gender |
| `0x19` | `u8` | Nationality |
| `0x1A` | `u8` | Armor class |
| `0x1B` | `u16` | Maximum constitution |
| `0x1D` | `u16` | Current constitution |
| `0x1F` | `u8` | Equipped weapon slot |
| `0x20` | `u8` | Unspent skill points |
| `0x21` | `u24` | Experience |
| `0x24` | `u8` | Level |
| `0x25` | `u8` | Equipped armor slot |
| `0x26` | `u16` | Last constitution before incapacitation |
| `0x28` | `u8` | Afflictions bitmap |
| `0x29` | `u8` | NPC flag |
| `0x2A` | `u8` | Unknown |
| `0x2B` | `u8` | Item-refusal value |
| `0x2C` | `u8` | Skill-refusal value |
| `0x2D` | `u8` | Attribute-refusal value |
| `0x2E` | `u8` | Trade-refusal value |
| `0x2F` | `u8` | Unknown |
| `0x30` | `u8` | Join-string ID |
| `0x31` | `u8` | Willingness |
| `0x32` | `char[25]` | NUL-terminated rank string |
| `0x4B` | `u8` | Game-won flag |
| `0x4C` | `u8` | Special-promotion flag |
| `0x4D` | `u8[51]` | Unknown |
| `0x80` | `u8[60]` | Skill slots |
| `0xBC` | `u8` | Unknown |
| `0xBD` | `u8[60]` | Item slots |
| `0xF9` | `u8[7]` | Unknown |

### Skill Slots

The skill area consists of `30` two-byte slots:

| Byte | Meaning |
| --- | --- |
| `+0` | Skill ID |
| `+1` | Skill level |

Slot semantics:

- `id = 0` means unused
- otherwise the slot is occupied

### Item Slots

The item area also consists of `30` two-byte slots:

| Byte | Meaning |
| --- | --- |
| `+0` | Item ID |
| `+1` | Ammo / status byte |

Slot semantics:

- `id = 0` means unused
- otherwise the slot is occupied
- bit `7` of the second byte indicates whether the equipped weapon is jammed
- if bit `7` is clear, bits `0..6` store the current ammo / load value
- if bit `7` is set, the byte no longer represents usable ammo; observed jammed values are
  `0x80..0x85`, where the low bits encode a jam severity from `0` to `5`

## Validation Notes

Useful consistency checks when implementing a reader:

- the block must begin with `"msq0"` or `"msq1"`
- the understood prefix is exactly `0x806` bytes long
- the rotating-XOR checksum must match after decoding `0x800` bytes
- the character area begins at decoded offset `0x100`
- each character record must be exactly `0x100` bytes
- in the shipped game data, the trailing `0x0A00` bytes after the understood prefix are all zero
