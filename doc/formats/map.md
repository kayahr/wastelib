# Map Format

This document describes the map block format used inside the Wasteland 1 `GAME1` and `GAME2` files.

It covers:

- how maps are located inside `GAME1` / `GAME2`
- the outer map block structure
- the map-data section
- the tile-map section
- the central directory and variable data sections

The Huffman bitstream used for the tile-map section is documented separately:

- [Huffman Encoding](huffman.md)

The rotating-XOR transform used by the map-data section is documented separately:

- [Rotating-XOR](rotating-xor.md)

## Scope

`GAME1` and `GAME2` are not self-describing map archives.

The game locates maps by using tables stored in the executable:

- map start offsets
- map sizes (`32` or `64`)
- tile-map offsets within each map block

Those values are required to parse a map correctly. In particular:

- the map block itself does not reliably expose its total length
- the offset of the tile-map header is external metadata
- the map size only appears later inside the map-info structure, but the parser already needs it before that point

See [EXE Format](exe.md) for the structure and locations of those tables.

In the shipped Wasteland 1 data:

- `GAME1` contains `20` map blocks
- `GAME2` contains `22` map blocks

All multi-byte integer fields are little-endian.

## Top-Level Block Layout

The map block contains these top-level parts:

| Offset | Type | Meaning |
| --- | --- | --- |
| `+0x00` | `char[4]` | `"msq0"` in `GAME1`, `"msq1"` in `GAME2` |
| `+0x04` | `u8[tileMapOffset - 4]` | Map-data section |
| `+tileMapOffset` | variable | Tile-map section |

The executable's tile-map-offset table provides the offset of the tile-map section within each map block.

## Map-Data Section

The map-data section begins immediately after the 4-byte block header and ends one byte before the tile-map section.

Its layout is:

| Offset within map-data section | Type | Meaning |
| --- | --- | --- |
| `+0x00` | `u8` | XOR byte 1 |
| `+0x01` | `u8` | XOR byte 2 |
| `+0x02` | `u8[tileMapOffset - 7]` | Map-data body |
| `+(tileMapOffset - 5)` | `u8` | Unknown byte before the tile-map section |

The XOR bytes are plain header bytes for this section. They initialize the rotating-XOR decoder. The encrypted data begins at offset `+0x02` within the map-data section.

## Map-Data Body

The map-data body begins immediately after the two XOR bytes and ends one byte before the tile-map section.

Its total size is known:

```text
mapDataBodySize = tileMapOffset - 7
```

This is the size of the whole body, not the size of the rotating-XOR encrypted prefix at its start.

Its internal layout is:

```text
actionClassMap
actionMap
centralDirectory
mapInfo
variableDataSections
```

The single byte immediately before the tile-map section is currently unknown.

## Rotating-XOR Decoding

The map-data body begins with a rotating-XOR encrypted prefix followed by plain data. The rotating-XOR algorithm itself is described in [Rotating-XOR](rotating-xor.md).

The total size of the map-data body is known from `tileMapOffset - 7`, but the encrypted prefix length is not stored as a separate field.

Important detail:

- only the leading part of the map-data body is encrypted
- the remaining bytes up to the unknown byte before the tile-map section are stored as plain data

The reader processes the map-data body from the start and applies the rotating-XOR transform until the running checksum first equals `endChecksum`. At that point the encrypted prefix ends.

So the map-data body is treated as:

```text
encryptedPrefix + plainSuffix
```

## Tile-Map Section

The tile-map section begins at the executable-provided `tileMapOffset`.

Its layout is:

| Offset within tile-map section | Type | Meaning |
| --- | --- | --- |
| `+0x00` | `u32` | Tile-map decoded size |
| `+0x04` | `u32` | Unknown dword before the tile-map bitstream |
| `+0x08` | bitstream | Huffman-coded tile-map data |

The first field in this section, `tileMapDecodedSize`, must equal:

```text
mapSize * mapSize
```

## Fixed-Offset Sections

The first two sections of the decoded map-data body have sizes derived only from `mapSize`.

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

All directory offsets are absolute offsets within the map-data body, not relative to the directory itself.

The following offsets are described below:

- `stringsOffset`
- `mobNamesOffset`
- `mobDataOffset`
- `npcOffset`

The `actionClassOffsets` table and `specialsOffset` are present in the data, but their detailed substructure is currently unknown.

## Map Info Block

The map-info block follows immediately after the central directory and is always `50` bytes long.

Its offset within the map-data body is therefore fixed:

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

Each NPC pointer is an absolute offset within the map-data body and points to a `0x100`-byte character record.

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

## Decoded Tile Map

The tile map is stored in the tile-map section, outside the map-data body.

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
- all central-directory offsets must point within the map-data body
- the map-info `mapSize` byte must match the external `mapSize` metadata from `WL.EXE`
- NPC pointers, if present, should point to `0x100`-byte character records inside the map-data body
