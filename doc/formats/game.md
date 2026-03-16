---
title: GAME Format
---

# GAME Format

This document describes the overall container structure of the Wasteland 1 `GAME1` and `GAME2` files.

It covers:

- the role of `GAME1` and `GAME2`
- the top-level entry types stored in them
- how those entries are located
- the observed entry order in the shipped files

Detailed entry formats are documented separately:

- [EXE Format](exe.md)
- [Map Format](map.md)
- [Savegame Format](savegame.md)
- [Shop Item List Format](shopitemlist.md)

## Scope

`GAME1` and `GAME2` are container files.

They store three kinds of data:

- map blocks
- one savegame block
- shop item list blocks

They do **not** contain a global header or an in-file directory describing these entries.

## Key Property

`GAME1` and `GAME2` are only partially self-describing.

While each contained block starts with a small local header (`"msq0"` in `GAME1`, `"msq1"` in `GAME2`), the files do not provide enough metadata on their own to locate and parse everything robustly.

In practice, the game uses tables stored in the executable to obtain:

- map start offsets
- map sizes
- tile-map offsets within map blocks
- savegame block offsets
- shop item list offsets

See [EXE Format](exe.md) for the structure and locations of those tables.

## Top-Level Entry Types

### Map Blocks

Maps are variable-sized blocks at the beginning of each file.

They are identified by:

- `"msq0"` in `GAME1`
- `"msq1"` in `GAME2`

But that local header alone is not enough to parse them fully. Correct parsing also requires:

- the map size
- the offset of the tile-map section inside the block

Both come from the executable.

See [EXE Format](exe.md) and [Map Format](map.md).

### Savegame Block

Each file contains exactly one savegame block near the end of the file.

It also starts with:

- `"msq0"` in `GAME1`
- `"msq1"` in `GAME2`

Its location is taken from the executable.

See [EXE Format](exe.md) and [Savegame Format](savegame.md).

### Shop Item List Blocks

Shop lists are fixed-size blocks near the end of the files, after the savegame region.

They also start with:

- `"msq0"` in `GAME1`
- `"msq1"` in `GAME2`

Their locations are taken from the executable.

See [EXE Format](exe.md) and [Shop Item List Format](shopitemlist.md).

## Observed Entry Order

In the shipped Wasteland 1 files, the top-level order is:

### `GAME1`

1. `20` map blocks
2. `1` savegame block
3. `3` actual shop item list blocks

### `GAME2`

1. `22` map blocks
2. `1` savegame block
3. `1` actual shop item list block

This ordering is visible directly in the files because the entry offsets increase monotonically.

## Observed Block Starts

The top-level blocks in the shipped files begin at these offsets:

### `GAME1`

- maps: `0`, `10958`, `16697`, `26297`, `36394`, `44582`, `49112`, `59252`, `66522`, `73455`, `83203`, `93710`, `100598`, `105823`, `110061`, `115498`, `122394`, `131766`, `139891`, `145679`
- savegame: `152517`
- shop item lists: `157131`, `157897`, `158663`

### `GAME2`

- maps: `0`, `4320`, `9598`, `21955`, `29760`, `35167`, `40852`, `46793`, `51745`, `58006`, `66901`, `72935`, `84078`, `94274`, `102058`, `109750`, `118668`, `127156`, `137175`, `142703`, `151754`, `160761`
- savegame: `166855`
- shop item list: `171469`

## Absent In-File Directory

The important consequence of the format is:

- there is no central directory inside `GAME1` / `GAME2`
- entry counts are not stored in the files
- the boundaries of map blocks are not fully recoverable from the map blocks alone

So a complete reader should treat `GAME1` and `GAME2` as executable-assisted containers rather than as standalone archives.

## Relationship Between The Two Files

`GAME1` and `GAME2` use the same top-level block concept, but differ in content:

- `GAME1` contains disk-0 map blocks and the first group of shop lists
- `GAME2` contains disk-1 map blocks and the final shop list
- each file carries its own savegame block

The local block headers reflect this:

- blocks in `GAME1` use `"msq0"`
- blocks in `GAME2` use `"msq1"`

## Validation Notes

Useful consistency checks when implementing a container reader:

- every top-level block should begin with `"msq0"` or `"msq1"` according to the file
- the first block in both files starts at offset `0`
- map offsets should form a strictly increasing sequence
- the savegame block should start after the final map block
- the shop item list blocks should start after the savegame block
