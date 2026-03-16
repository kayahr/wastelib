# EXE Format

This document describes the executable metadata stored in Wasteland 1 `WL.EXE`.

It covers:

- packed versus unpacked executable form
- the string tables read from the executable
- the GAME-file metadata tables
- how those tables relate to maps, savegames, and shop item lists

## Packed And Unpacked EXE

The `WL.EXE` file shipped with the game is compressed with **EXEPACK**.

The offsets documented here refer to the **unpacked** executable image, not to the packed on-disk `WL.EXE` file.

Expected unpacked size:

```text
169824 bytes
```

To reproduce the offsets in this document, first unpack `WL.EXE` with an EXEPACK tool such as [`exepack`](https://www.bamsoftware.com/software/exepack/).

All offsets in this document are **absolute file offsets within the unpacked executable image**.

## String Table Format

The executable contains several compressed string tables using the same format as the map string sections.

Each string table begins with:

| Field | Meaning |
| --- | --- |
| `char[60]` | Dictionary |
| `u16 firstPointer` | First group pointer; also determines pointer-table length |
| `u16[...]` | Remaining group pointers |
| bitstream | 5-bit encoded string groups |

The number of group pointers is:

```text
numGroups = firstPointer / 2
```

Each group pointer is relative to the byte immediately after the 60-byte dictionary.

Each referenced group can contain up to 4 strings.

The 5-bit codes use these special values:

- `0x1E`: uppercase the next character
- `0x1F`: select the upper half of the dictionary for the next character
- decoded `NUL`: end of string

## String Table Locations

The executable contains at least these string tables:

| Name | Absolute offset | Size in bytes | Observed string count | Purpose |
| --- | --- | --- | --- | --- |
| Intro strings | `0x17723` | `527` | `18` | Title and intro text |
| Message strings | `0x17B5E` | `1661` | `107` | General messages |
| Inventory strings | `0x18290` | `1845` | `170` | Inventory, skills, attributes |
| Character creation strings | `0x19E6B` | `210` | `8` | Character creation |
| Promotion strings | `0x1A642` | `1136` | `63` | Promotion text |
| Library strings | `0x1AAEC` | `277` | `11` | Library text |
| Shop strings | `0x1AC18` | `229` | `10` | Shop text |
| Infirmary strings | `0x1AD0D` | `369` | `25` | Infirmary text |

The sizes above are the raw encoded byte spans inside the executable, not decoded character counts.

## GAME Metadata Tables

The executable also contains the tables needed to parse `GAME1` and `GAME2`.

### Map Offset Table

Location:

```text
0x18C9A
```

Format:

```text
u32_le mapOffsets[42]
```

Interpretation:

- entries `0..19` are the `20` map offsets in `GAME1`
- entries `20..41` are the `22` map offsets in `GAME2`

Indexing:

```text
GAME1 map N -> mapOffsets[N]
GAME2 map N -> mapOffsets[20 + N]
```

### Tile-Map Offset Table

Location:

```text
0x18D42
```

Format:

```text
u16_le tileMapOffsets[50]
```

This table is indexed by **location index**, not directly by `(disk, map)`.

Each value is the offset, within a map block, of the 4-byte `tileMapDecodedSize` field documented in [Map Format](map.md).

### Location Mapping Table

Location:

```text
0x18EE9
```

Format:

```text
u8 locationMapping[50]
```

Each byte encodes a `(disk, map)` pair:

- bits `0..5`: map index
- bits `6..7`: encoded disk selector

Observed disk encoding:

- `2` means `GAME1`
- `1` means `GAME2`
- `0` means invalid / unused location slot

So the encoded value is:

```text
locationCode = (diskCode << 6) | mapIndex
```

where:

- `diskCode = 2` for `GAME1`
- `diskCode = 1` for `GAME2`

This encoding is odd but intentional.

### Map Size Table

Location:

```text
0x18F3C
```

Format:

```text
u8 mapSizes[50]
```

This table is indexed by **location index**, not directly by `(disk, map)`.

Observed values are the map edge length:

- `32`
- `64`

## Savegame Metadata

The executable stores the savegame offsets as split low/high words rather than one packed `u32`.

### GAME1 Savegame Offset

| Field | Absolute offset | Type |
| --- | --- | --- |
| Low word | `0x880C` | `u16_le` |
| High word | `0x880F` | `u16_le` |

Combined as:

```text
savegameOffset0 = low + (high << 16)
```

Observed value:

```text
0x253C5
```

### GAME2 Savegame Offset

| Field | Absolute offset | Type |
| --- | --- | --- |
| Low word | `0x8819` | `u16_le` |
| High word | `0x881C` | `u16_le` |

Combined as:

```text
savegameOffset1 = low + (high << 16)
```

Observed value:

```text
0x28BC7
```

### Savegame Size

Location:

```text
0x8820
```

Format:

```text
u16_le savegameSize
```

Observed value:

```text
0x1206
```

### Shop Item List Relative Offset Table

Location:

```text
0x18E40
```

Format:

```text
u16_le shopListRelOffsets[4]
```

Observed values in the shipped executable:

```text
0x0000, 0x02FE, 0x05FC, 0x08FA
```

Interpretation:

- these offsets are relative to the end of the `GAME1` savegame block
- they point to the three real shop lists in `GAME1`
- the fourth offset points to the end of `GAME1` and does not correspond to a real shop block in the shipped data
- there is no separate relative-offset table entry for the real `GAME2` shop list; that block starts immediately after the `GAME2` savegame block

## Relationship To GAME Files

The tables described here are the reason `GAME1` and `GAME2` are not standalone self-describing archives.

For the container-level view, see:

- [GAME Format](game.md)

For the individual block formats, see:

- [Map Format](map.md)
- [Savegame Format](savegame.md)
- [Shop Item List Format](shopitemlist.md)
