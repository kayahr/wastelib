# Rotating-XOR

This document describes the rotating-XOR transform used by several Wasteland 1 `GAME1` / `GAME2` data blocks.

It covers:

- the common XOR/key schedule
- the checksum calculation
- rotating-XOR decoding

All multi-byte integer fields are little-endian.

## Input Header

The rotating-XOR data is preceded by two bytes:

| Offset | Type | Meaning |
| --- | --- | --- |
| `+0x00` | `u8` | XOR byte 1 |
| `+0x01` | `u8` | XOR byte 2 |

These two bytes initialize the decoder:

```text
key         = xor1 XOR xor2
endChecksum = xor1 | (xor2 << 8)
checksum    = 0
```

## Byte Transform

For each encrypted byte:

```text
decoded  = encoded XOR key
checksum = (checksum - decoded) & 0xFFFF
key      = (key + 0x1F) & 0xFF
```

The checksum is accumulated over the decoded bytes, not the encoded bytes.

## Decoding

Decoding procedure:

1. Read `xor1` and `xor2`.
2. Decode exactly `N` bytes with the byte transform above.
3. Verify that the final checksum equals `endChecksum`.

This decoding is used by:

- [Savegame Format](savegame.md)
- [Shop Item List Format](shopitemlist.md)
