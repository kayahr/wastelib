# ALLHTDS Format

This document describes the tileset archive format used by the Wasteland 1 files `ALLHTDS1` and `ALLHTDS2`.

It covers:

- the top-level file layout
- the per-tileset block structure
- the decoded tile data layout
- tile extraction from the decoded payload

The compression and tile post-processing used by these files are documented separately:

- [Huffman Encoding](huffman.md)
- [Vertical XOR](vertical-xor.md)

## Scope

`ALLHTDS1` and `ALLHTDS2` use the same binary format. The only practical difference is which tilesets they contain.

All multi-byte integer fields are little-endian.

Each tile is a packed 4-bit image:

- width: `16` pixels
- height: `16` pixels
- 2 pixels per byte
- row stride: `8` bytes
- bytes per tile: `8 * 16 = 128` bytes (`0x80`)

## File Layout

An `ALLHTDS` file is a sequence of compressed tileset blocks concatenated until EOF.

There is:

- no global file header
- no tileset count
- no block offset table

Each block represents exactly one tileset.

## Tileset Offsets

The `ALLHTDS` files themselves do not contain an internal offset table, but the Wasteland 1 executable keeps external lookup tables for `ALLHTDS1` and `ALLHTDS2`.

These tables allow direct random access to tilesets by ID without first walking the archive sequentially.

In the unpacked `WL.EXE`, the tables are stored at these file offsets:

- tileset cumulative start offsets: `0x18E1C` (`9 * u32`)
- tileset compressed sizes: `0x18E0A` (`9 * u16`)

Wasteland 1 uses global tileset IDs:

- `0..3` for `ALLHTDS1`
- `4..8` for `ALLHTDS2`

The executable stores these cumulative start offsets:

| Tileset ID | File | Local offset | Cumulative offset |
| --- | --- | --- | --- |
| `0` | `ALLHTDS1` | `0x0000` | `0x0000` |
| `1` | `ALLHTDS1` | `0x1402` | `0x1402` |
| `2` | `ALLHTDS1` | `0x3EE8` | `0x3EE8` |
| `3` | `ALLHTDS1` | `0x69FC` | `0x69FC` |
| `4` | `ALLHTDS2` | `0x0000` | `0x8603` |
| `5` | `ALLHTDS2` | `0x222C` | `0xA82F` |
| `6` | `ALLHTDS2` | `0x3C97` | `0xC29A` |
| `7` | `ALLHTDS2` | `0x5676` | `0xDC79` |
| `8` | `ALLHTDS2` | `0x70EB` | `0xF6EE` |

To get the local offset in ALLHTDS2 for tilesets >= 4 simply subtract the cumulative offset of tileset 4.

The executable also stores the compressed block sizes:

| Tileset ID | Compressed size |
| --- | --- |
| `0` | `0x1402` |
| `1` | `0x2AE6` |
| `2` | `0x2B14` |
| `3` | `0x1C07` |
| `4` | `0x222C` |
| `5` | `0x1A6B` |
| `6` | `0x19DF` |
| `7` | `0x1A75` |
| `8` | `0x2853` |

These EXE tables are not required for parsing, but they are useful when implementing true random access.

## Tileset Block

Each tileset block has this layout:

| Offset | Type | Meaning |
| --- | --- | --- |
| `+0x00` | `u32` | Decoded payload size in bytes |
| `+0x04` | `char[3]` | ASCII signature, always `"msq"` |
| `+0x07` | `u8` | Disk byte |
| `+0x08` | bitstream | Huffman-coded payload |

Important details:

- the `u32` size is the size after Huffman decoding
- the compressed payload length is not stored explicitly
- the parser must decode exactly that many bytes
- after decoding, the reader advances to the next full byte boundary before the next block begins

In the shipped Wasteland 1 tileset archives, the disk byte is constant per file:

- `ALLHTDS1` uses `0`
- `ALLHTDS2` uses `1`

## Decoded Payload

The decoded block payload is just the raw tile data for one tileset.

There is:

- no tile count field
- no per-tile headers
- no footer
- no padding between tiles

The payload is therefore a flat concatenation of fixed-size tile records.

## Tile Count

The number of tiles in a block is derived entirely from the decoded payload size:

```text
tileCount = decodedSize / 128
```

So a valid block size must be a multiple of `128`.

## Tile Encoding

Each tile occupies exactly `128` consecutive bytes in the decoded payload.

The bytes of one tile are still [vertical-XOR encoded](vertical-xor.md). To obtain the final tile image, each `128`-byte tile record must be vertical-XOR decoded independently with a row stride of `8` bytes.

After that step, the tile data is a packed `16x16` image:

- row-major order
- 2 pixels per byte
- high nibble = left pixel
- low nibble = right pixel

## Tile Layout Within a Block

If `decoded` is the fully Huffman-decoded payload, tile `n` starts at:

```text
tileOffset = n * 128
```

and occupies:

```text
decoded[tileOffset .. tileOffset + 127]
```

After vertical-XOR decoding with stride `8`, the tile can be interpreted as 16 rows of 8 bytes each.

## Parsing Summary

A parser can read one `ALLHTDS` file like this:

1. Read one tileset block header.
2. Verify the `"msq"` signature.
3. Huffman-decode the payload to the size given by the leading `u32`.
4. Derive `tileCount = decodedSize / 128`.
5. Split the decoded payload into `tileCount` records of `128` bytes each.
6. Vertical-XOR decode each tile record independently with stride `8`.
7. Repeat until EOF to read the remaining tilesets.

## Validation Notes

Useful consistency checks when implementing a reader:

- every block must start with the `"msq"` signature
- the decoded block size should be a multiple of `128`
- each extracted tile record must be exactly `128` bytes long
- tile decoding must use a vertical-XOR stride of `8` bytes per tile
- the next tileset begins immediately after the previous block ends
