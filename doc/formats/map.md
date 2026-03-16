# GAME1 / GAME2 Map Format

This document describes the map block format used inside the Wasteland 1 `GAME1` and `GAME2` files.

It covers:

- how maps are located inside `GAME1` / `GAME2`
- the outer map block structure
- the pre-tile data region
- the tile map bitstream
- the central directory and variable data sections

The Huffman bitstream used for the tile image section is documented separately:

- [Huffman Encoding](huffman.md)

The rotating-XOR transform used by the pre-tile data region is documented separately:

- [Rotating-XOR](rotating-xor.md)

## Scope

`GAME1` and `GAME2` are not self-describing map archives.

The game locates maps by using tables stored in the executable:

- map start offsets
- map sizes (`32` or `64`)
- tile-map offsets within each map block

Those values are required to parse a map correctly. In particular:

- the map block itself does not reliably expose its total length
- the tile map offset is external metadata
- the map size only appears later inside the map-info structure, but the parser already needs it before that point

See [EXE Format](exe.md) for the structure and locations of those tables.

In the shipped Wasteland 1 data:

- `GAME1` contains `20` map blocks
- `GAME2` contains `22` map blocks

All multi-byte integer fields are little-endian.

## Map Block Header

Each map begins with a 4-byte ASCII header:

| Value | Meaning |
| --- | --- |
| `"msq0"` | Map block in `GAME1` |
| `"msq1"` | Map block in `GAME2` |

This header is unrelated to the Huffman-wrapped `"msq"` container used by some other Wasteland files.

Immediately after the header are two bytes used by the rotating-XOR decryption step:

| Offset | Type | Meaning |
| --- | --- | --- |
| `+0x00` | `char[4]` | Map header: `"msq0"` or `"msq1"` |
| `+0x04` | `u8` | XOR byte 1 |
| `+0x05` | `u8` | XOR byte 2 |
| `+0x06` | variable | Pre-tile data region |

## Outer Block Layout

The outer map block is:

```text
header
xor bytes
preTileData
unknownStringsByte
tileMapDecodedSize:u32
unknownTileMap:u32
tileMapHuffmanBitstream
```

The `tileMapDecodedSize` field must equal:

```text
mapSize * mapSize
```

The start of `tileMapDecodedSize` is not stored inside the map block. It comes from the executable's tile-map-offset table.

## Pre-Tile Data Region

The pre-tile data region starts immediately after the two XOR bytes and ends one byte before the `tileMapDecodedSize` field.

Its internal layout is:

```text
actionClassMap
actionMap
centralDirectory
mapInfo
variableDataSections
```

The final byte before the tile-map-size field is a currently-unknown byte:

| Field | Size |
| --- | --- |
| `unknownStringsByte` | `1` byte |

## Rotating-XOR Decoding

The pre-tile data region begins with a rotating-XOR encrypted prefix followed by plain data. The rotating-XOR algorithm itself is described in [Rotating-XOR](rotating-xor.md).

The exact size of the encrypted prefix is currently unknown.

Important caveat:

- stopping at the first checksum match is not reliable
- early checksum matches can occur before the true end of the encrypted area
- a better rule may exist in the executable metadata or loader code, but it is not yet documented here

Important detail:

- only the leading part of the pre-tile region is encrypted
- the remaining bytes up to `unknownStringsByte` are stored as plain data

So the pre-tile region should be treated as:

```text
encryptedPrefix + plainSuffix
```

## Fixed-Offset Sections

The first two sections of the decoded pre-tile region have sizes derived only from `mapSize`.

### Action Class Map

The action-class map contains one 4-bit action class per tile:

```text
size = mapSize * mapSize / 2
```

Packing:

- one byte stores two horizontally adjacent tiles
- high nibble = even `x`
- low nibble = odd `x`

### Action Map

The action map contains one byte per tile:

```text
size = mapSize * mapSize
```

This byte is the action parameter associated with the tile's action class.

## Central Directory

Immediately after the action-class map and the action map comes a fixed-size central directory of `42` bytes:

| Offset within directory | Type | Meaning |
| --- | --- | --- |
| `+0x00` | `u16` | `stringsOffset` |
| `+0x02` | `u16` | `mobNamesOffset` |
| `+0x04` | `u16` | `mobDataOffset` |
| `+0x06` | `u16[16]` | `actionClassOffsets` |
| `+0x26` | `u16` | `specialsOffset` |
| `+0x28` | `u16` | `npcOffset` |

All directory offsets are absolute offsets within the pre-tile data region, not relative to the directory itself.

The following offsets are described below:

- `stringsOffset`
- `mobNamesOffset`
- `mobDataOffset`
- `npcOffset`

The `actionClassOffsets` table and `specialsOffset` are present in the data, but their detailed substructure is currently unknown.

## Map Info Block

The map-info block follows immediately after the central directory and is always `50` bytes long.

Its offset within the pre-tile region is therefore fixed:

- `0x062A` for `32x32` maps
- `0x182A` for `64x64` maps

### Map Info Layout

| Offset within map-info | Type | Meaning |
| --- | --- | --- |
| `+0x00` | `u8` | Unknown, observed as `0` in all shipped maps |
| `+0x01` | `u8` | Unknown, observed as `0` in all shipped maps |
| `+0x02` | `u8` | Map size (`32` or `64`) |
| `+0x03` | `u8` | Unknown |
| `+0x04` | `u8` | Unknown |
| `+0x05` | `u8` | Random encounter frequency |
| `+0x06` | `u8` | Tileset index |
| `+0x07` | `u8` | Number of random monster types |
| `+0x08` | `u8` | Maximum concurrent random encounters |
| `+0x09` | `u8` | Border-tile image index |
| `+0x0A` | `u16` | Time per step |
| `+0x0C` | `u8` | Heal rate |
| `+0x0D` | `u8[37]` | Combat string IDs |

The map-info block repeats `mapSize`, which must match the value taken from the executable table.

## Variable Data Sections

Everything after the map-info block is a variable-layout area addressed through the central-directory offsets.

### NPC Section

If the first `u16` at `npcOffset` is not `0x0000`, the map contains no NPCs.

If it is `0x0000`, the NPC section begins with an implicit pointer table:

```text
0x0000
npcPointer[0]
npcPointer[1]
...
```

The table has no explicit count. It ends when the reader position reaches the smallest NPC pointer value.

Each NPC pointer is an absolute offset within the pre-tile data region and points to a `0x100`-byte character record.

The NPC record layout matches the character record used in savegame data. See [Savegame Format](savegame.md).

### Monster Name Section

At `mobNamesOffset`, the map stores `numMobs` consecutive NUL-terminated monster names.

The number of monster records is derived from the monster-body section:

```text
numMobs = (stringsOffset - mobDataOffset) / 8
```

### Monster Data Section

At `mobDataOffset`, the map stores `numMobs` monster records of `8` bytes each:

| Offset within record | Type | Meaning |
| --- | --- | --- |
| `+0x00` | `u16` | Base hit points |
| `+0x02` | `u8` | Hit chance |
| `+0x03` | `u8` | Random damage in D6 |
| `+0x04` | high nibble of `u8` | Max group size |
| `+0x04` | low nibble of `u8` | Armor class |
| `+0x05` | high nibble of `u8` | Fixed damage |
| `+0x05` | low nibble of `u8` | Damage type |
| `+0x06` | `u8` | Monster type |
| `+0x07` | `u8` | Portrait index |

### String Section

At `stringsOffset`, the map stores a compressed string group structure.

Its layout is:

| Field | Meaning |
| --- | --- |
| `char[60]` | Dictionary |
| `u16 firstPointer` | First group pointer; also determines pointer-table length |
| `u16[...]` | Remaining group pointers |
| bitstream | Up to 4 strings per group |

The number of group pointers is:

```text
numGroups = firstPointer / 2
```

Each group pointer is relative to the byte immediately after the 60-byte dictionary.

Each string is decoded from 5-bit codes:

- `0x1E` toggles uppercase for the next character
- `0x1F` switches to the upper half of the dictionary for the next character
- a decoded `NUL` character terminates the string

Each referenced group can contain up to 4 strings.

## Tile Map Section

The tile map is stored outside the pre-tile data region.

Its layout is:

| Offset relative to `tileMapOffset` | Type | Meaning |
| --- | --- | --- |
| `+0x00` | `u32` | Decoded tile-map size |
| `+0x04` | `u32` | Unknown value |
| `+0x08` | bitstream | Huffman-coded tile-map bytes |

The Huffman bitstream decodes to exactly:

```text
mapSize * mapSize
```

bytes.

Each decoded byte is the tile image index for one map position.

Interpretation:

- indices `0..9` reference sprites from `IC0_9.WLF`
- indices `>= 10` reference tiles in the active tileset, with tile index `image - 10`

## Building the Final Tile Grid

To build the final logical map tile at `(x, y)`:

1. Read the action class from the action-class map nibble.
2. Read the action byte from the action map.
3. Read the image byte from the decoded tile map.
4. Combine them into one tile record.

## Validation Notes

Useful consistency checks when implementing a reader:

- every map block must begin with `"msq0"` or `"msq1"`
- `tileMapDecodedSize` must equal `mapSize * mapSize`
- all central-directory offsets must point within the pre-tile data region
- the map-info `mapSize` byte must match the external `mapSize` metadata from `WL.EXE`
- NPC pointers, if present, should point to `0x100`-byte character records inside the pre-tile data region
