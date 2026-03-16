# Rotating-XOR

This document describes the rotating-XOR transform used by several Wasteland 1 `GAME1` / `GAME2` data blocks.

It covers:

- the common XOR/key schedule
- the checksum calculation
- the decoding modes used by different container formats

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

## Whole-Block Decoding

In the simplest case, the surrounding format tells the reader exactly how many bytes are encrypted.

Decoding procedure:

1. Read `xor1` and `xor2`.
2. Decode exactly `N` bytes with the byte transform above.
3. Verify that the final checksum equals `endChecksum`.

This decoding mode is used by:

- [Savegame Format](savegame.md)
- [Shop Item List Format](shopitemlist.md)

## Prefix Decoding Within a Known-Size Section

Some formats contain a section whose total size is known, but only a leading prefix of that section is rotating-XOR encrypted.

Decoding procedure:

1. Read `xor1` and `xor2`.
2. Begin decoding bytes at the start of the section body.
3. Stop decoding as soon as the running checksum equals `endChecksum`.
4. Treat the remaining bytes in the section body as plain data.

In this mode, the checksum determines where the encrypted prefix ends. The surrounding format still provides the total size of the whole section.

This decoding mode is used by:

- [Map Format](map.md)
