---
title: CURS Format
---

# CURS Format

This document describes the mouse cursor format used by the Wasteland 1 `CURS` file.

It covers:

- the top-level file layout
- the per-cursor record structure
- the per-component row layout
- color and mask decoding

## Scope

`CURS` contains a sequence of fixed-size mouse cursor records.

Each cursor is:

- width: `16` pixels
- height: `16` pixels

There is no header, no compression wrapper, and no per-cursor metadata.

## File Layout

The file is a simple concatenation of fixed-size cursor records until EOF.

- bytes per cursor: `256`
- cursor count: `fileSize / 256`

For a valid file, the total file size must be a multiple of `256`.

In the shipped Wasteland 1 data:

- `curs` is `2048` bytes
- therefore it contains `8` cursor records

## Cursor Record Overview

One cursor record is `256` bytes long and consists of four component blocks of `64` bytes each:

| Offset | Size | Meaning |
| --- | --- | --- |
| `+0x00` | `64` | Blue component block |
| `+0x40` | `64` | Green component block |
| `+0x80` | `64` | Red component block |
| `+0xC0` | `64` | Intensity component block |

Each component block stores:

- one 1-bit mask plane
- one 1-bit data plane

interleaved row by row.

## Component Block Layout

Each 64-byte component block contains `16` row records of `4` bytes each.

For row `y`, the 4 bytes are:

| Row-relative offset | Meaning |
| --- | --- |
| `+0` | mask bits for pixels `x = 8..15` |
| `+1` | mask bits for pixels `x = 0..7` |
| `+2` | data bits for pixels `x = 8..15` |
| `+3` | data bits for pixels `x = 0..7` |

So the row order inside the record is unusual:

- right half first
- left half second

and that applies both to the mask bytes and the data bytes.

## Pixel Addressing

For a pixel `(x, y)`:

```text
half     = floor(x / 8)        // 0 for left half, 1 for right half
bitIndex = 7 - (x % 8)
rowBase  = y * 4
```

Within one component block:

```text
maskByte = rowBase + (1 - half)
dataByte = rowBase + (3 - half)
```

Bits are read most-significant-bit first within each byte.

## Component Meaning

The four component blocks correspond to the 4-bit Wasteland palette index:

| Component | Bit |
| --- | --- |
| Blue | bit 0 |
| Green | bit 1 |
| Red | bit 2 |
| Intensity | bit 3 |

If a pixel is visible, the final 4-bit color index is:

```text
colorIndex =
    (blueBit      << 0) |
    (greenBit     << 1) |
    (redBit       << 2) |
    (intensityBit << 3)
```

## Mask Semantics

Unlike the sprite format, the cursor format stores a separate 1-bit mask plane for each of the four components.

So in the general format, visibility is technically component-specific rather than a single shared transparency mask.

In the shipped Wasteland 1 `CURS` data, the four mask planes are identical for every pixel. In practice this means the file behaves like it has one ordinary 1-bit transparency mask:

- `1` = visible pixel
- `0` = transparent pixel

Because of that, a decoder can treat the blue-component mask plane as the effective visibility mask for the whole pixel.

## Decoding Summary

To decode cursor `n`:

1. Read `256` bytes from the file at offset `n * 256`.
2. For each pixel `(x, y)`, compute `half`, `bitIndex`, and the row-local byte offsets.
3. Read the mask bit for each component block.
4. In the shipped data, use the blue-component mask bit as the effective visibility bit.
5. If the pixel is not visible, output transparency.
6. Otherwise read one data bit from each of the four component blocks.
7. Combine those four bits into the 4-bit palette index.

## Validation Notes

Useful consistency checks when implementing a reader:

- the file size should be a multiple of `256`
- each cursor record must be exactly `256` bytes
- each component block must be exactly `64` bytes
- each component block must contain `16` row records of `4` bytes
- if you expect the shipped Wasteland 1 behavior, the four component mask planes should match
