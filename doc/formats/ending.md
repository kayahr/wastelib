---
title: END.CPA Format
---

# END.CPA Format

This document describes the format of the Wasteland 1 `END.CPA` file.

It covers:

- the top-level file layout
- the base image block
- the animation block
- the update and patch encodings
- the special offset semantics used by animation patches

The compression and base-image post-processing used by this file are documented separately:

- [Huffman Encoding](huffman.md)
- [Vertical XOR](vertical-xor.md)

## Scope

`END.CPA` contains a single animated ending image.

The image uses packed 4-bit pixels:

- width: `288` pixels
- height: `128` pixels
- 2 pixels per byte
- row stride: `144` bytes
- full image size: `144 * 128 = 18432` bytes (`0x4800`)

All multi-byte integer fields are little-endian.

## File Layout

The file contains exactly two back-to-back compressed blocks:

1. the base image block
2. the animation block

There is no global file header, no block table, and no per-frame offset table.

## Base Image Block

The first block contains the base ending image.

### Block Header

| Offset | Type | Meaning |
| --- | --- | --- |
| `+0x00` | `u32` | Decoded payload size in bytes |
| `+0x04` | `char[3]` | ASCII signature, always `"msq"` |
| `+0x07` | `u8` | Disk byte, always `0` |
| `+0x08` | bitstream | Huffman-coded payload |

Important details:

- the `u32` size is the size after Huffman decoding
- the compressed payload length is not stored explicitly
- the parser must decode exactly that many bytes
- after decoding, the reader advances to the next full byte boundary before the next block begins

### Decoded Payload

The decoded payload is the `18432`-byte packed base image.

After Huffman decoding it is still [vertical-XOR encoded](vertical-xor.md). It must be vertical-XOR decoded with a row stride of `144` bytes to produce the final base frame.

## Animation Block

The second block contains the animation update stream.

Unlike the base image block, this block does not use the ASCII `"msq"` signature.

### Block Header

| Offset | Type | Meaning |
| --- | --- | --- |
| `+0x00` | `u32` | Decoded payload size in bytes |
| `+0x04` | `u8[3]` | Fixed magic bytes `08 67 01` |
| `+0x07` | `u8` | Disk byte, always `0` |
| `+0x08` | bitstream | Huffman-coded payload |

The decoded animation payload is not vertical-XOR encoded.

### Decoded Payload Layout

The decoded animation block has this layout:

| Offset | Type | Meaning |
| --- | --- | --- |
| `+0x00` | `u16` | Animation content size |
| `+0x02` | variable | Update stream |
| `+0x02 + contentSize` | `u16` | Final end marker, always `0x0000` |

The `contentSize` field must equal:

```text
decodedAnimationSize - 4
```

So it excludes:

- its own 2-byte length field
- the trailing 2-byte `0x0000` end marker

The `contentSize` region contains all updates plus the update-list terminator.

## Update Stream

The update stream is a sequence of updates terminated by `0xFFFF`.

It is best described as:

```text
updateStream := update* 0xFFFF
```

Each update has this layout:

```text
update := delay:u16 patch* 0xFFFF
```

So the same sentinel value `0xFFFF` is used at two levels:

- to terminate the patch list of one update
- to terminate the whole update stream when a new update delay would otherwise begin

At the end of the decoded animation payload, the structure therefore ends with:

```text
... 0xFFFF 0xFFFF 0x0000
```

Meaning:

1. end of last update's patch list
2. end of update stream
3. final animation-block end marker

## Update Encoding

Each update begins with a delay field:

| Type | Meaning |
| --- | --- |
| `u16 delay` | Delay before this update is applied |

The file format stores only the raw delay value. A practical playback model is:

```text
milliseconds = (delay + 1) * 54.925
```

based on the IBM PC timer tick rate of about `18.2065 Hz`.

## Patch Encoding

Each patch has this layout:

| Type | Meaning |
| --- | --- |
| `u16 offset` | Patch position in a 320-pixel-wide logical screen grid |
| `u8[4] data` | Four replacement bytes, representing 8 pixels |

Patch data is copied into the current frame as raw bytes. It is not XOR-applied.

In pseudocode:

```text
for i in 0 .. 3:
    image[imageByteOffset + i] = data[i]
```

## Offset Semantics

This is the unusual part of the format.

The patch `offset` is **not** measured relative to the `288`-pixel-wide ending image. Instead, it is measured in units of one 8-pixel patch cell on a **320-pixel-wide logical screen**.

That means:

- one logical row contains `320 / 8 = 40` patch cells
- the ending image itself only uses `288 / 8 = 36` visible patch cells per row

The raw offset therefore wraps every `40` cells, not every `36` cells.

### Coordinate Conversion

Given a raw patch offset:

```text
cellX = offset % 40
y     = floor(offset / 40)
x     = cellX * 8
```

This yields the patch position in pixels within the logical 320-pixel-wide screen grid.

To convert this to a byte offset inside the packed `288x128` image:

```text
imageByteOffset = y * 144 + cellX * 4
```

This works because:

- each patch is `8` pixels wide
- packed pixels use `2` pixels per byte
- so one patch always covers exactly `4` image bytes

Equivalent formulas are:

```text
x = (offset * 8) % 320
y = floor((offset * 8) / 320)
imageByteOffset = y * 144 + x / 2
```

### Example

For `offset = 41`:

```text
cellX = 41 % 40 = 1
y     = floor(41 / 40) = 1
x     = 1 * 8 = 8
imageByteOffset = 1 * 144 + 1 * 4 = 148
```

So the patch replaces 8 pixels starting at:

- pixel position `x = 8`, `y = 1`
- byte position `148` in the packed image buffer

## Parsing Summary

A parser can read `END.CPA` like this:

1. Read the base image block header.
2. Huffman-decode the base image payload to the size given by the leading `u32`.
3. Vertical-XOR decode the result with stride `144`.
4. Read the animation block header.
5. Huffman-decode the animation payload to the size given by the leading `u32`.
6. Read `contentSize`.
7. Parse updates until the update-stream terminator `0xFFFF` is reached.
8. Read the final trailing `0x0000`.

## Validation Notes

Useful consistency checks when implementing a reader:

- the base image block must use `"msq"` and disk byte `0`
- the base image should decode to `18432` bytes
- the animation block must use the fixed magic bytes `08 67 01`
- the animation block disk byte must be `0`
- `contentSize` must equal `decodedAnimationSize - 4`
- each patch must contain exactly 4 data bytes
- the update stream must end with `0xFFFF`
- the decoded animation payload must end with a trailing `0x0000`
- converted patch coordinates must stay inside the `288x128` image area
