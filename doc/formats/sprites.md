# Sprites Format

This document describes the sprites format used by the Wasteland 1 files `IC0_9.WLF` and `MASKS.WLF`.

It covers:

- the top-level file layout
- the relationship between the image file and the mask file
- the per-sprite record layout
- the planar pixel encoding
- the transparency mask encoding

## Scope

Sprites are stored in two separate files:

- `IC0_9.WLF` contains the 4-bit sprite image data
- `MASKS.WLF` contains the 1-bit transparency masks

Each sprite is:

- width: `16` pixels
- height: `16` pixels

There is no header, no compression wrapper, and no per-sprite metadata in either file.

## File Layout

Both files are simple concatenations of fixed-size sprite records until EOF.

### `IC0_9.WLF`

`IC0_9.WLF` stores one image record per sprite:

- bytes per sprite image: `128`
- sprite count: `fileSize / 128`

### `MASKS.WLF`

`MASKS.WLF` stores one transparency-mask record per sprite:

- bytes per sprite mask: `32`
- sprite count: `fileSize / 32`

For a valid sprite set, both files must contain the same number of sprite records.

In the shipped Wasteland 1 data:

- `IC0_9.WLF` is `1280` bytes, so it contains `10` sprite images
- `MASKS.WLF` is `320` bytes, so it contains `10` sprite masks

## Sprite Pairing

Sprite `n` is formed by combining:

- image record `n` from `IC0_9.WLF`
- mask record `n` from `MASKS.WLF`

The record offsets are:

```text
imageOffset = n * 128
maskOffset  = n * 32
```

## Image Record Layout

Each sprite image record is `128` bytes long and consists of four 1-bit planes of `32` bytes each:

| Offset | Size | Meaning |
| --- | --- | --- |
| `+0x00` | `32` | Bitplane 0: blue bit |
| `+0x20` | `32` | Bitplane 1: green bit |
| `+0x40` | `32` | Bitplane 2: red bit |
| `+0x60` | `32` | Bitplane 3: intensity bit |

Each plane stores a `16x16` bitmap:

- `16` rows
- `2` bytes per row
- `8` pixels per byte
- bits are read most-significant-bit first within each byte

So one plane uses:

```text
16 rows * 2 bytes = 32 bytes
```

## Mask Record Layout

Each sprite mask record is `32` bytes long and consists of a single 1-bit plane with the same geometry:

- `16` rows
- `2` bytes per row
- `8` pixels per byte
- bits are read most-significant-bit first within each byte

Mask bit meaning:

- `1` = transparent pixel
- `0` = visible pixel

## Pixel Addressing

For a pixel at coordinates `(x, y)`:

```text
byteIndex = y * 2 + floor(x / 8)
bitIndex  = 7 - (x % 8)
```

So each row is stored in two bytes:

- byte 0 covers pixels `0..7`
- byte 1 covers pixels `8..15`

Within each byte, the leftmost pixel is stored in bit 7 and the rightmost in bit 0.

## Color Decoding

If the mask bit at `(x, y)` is `1`, the pixel is transparent and the color planes are ignored.

Otherwise the 4-bit palette index is built from the four image bitplanes:

```text
blue      = bit from plane 0
green     = bit from plane 1
red       = bit from plane 2
intensity = bit from plane 3
```

Combined as:

```text
colorIndex =
    (blue      << 0) |
    (green     << 1) |
    (red       << 2) |
    (intensity << 3)
```

This yields a 4-bit color value in the range `0..15`.

## Decoding Summary

To decode sprite `n`:

1. Read `128` bytes from `IC0_9.WLF` at `n * 128`.
2. Read `32` bytes from `MASKS.WLF` at `n * 32`.
3. For each pixel `(x, y)`, compute the byte and bit position within the row.
4. If the mask bit is `1`, output transparency.
5. Otherwise read the corresponding bit from each of the four image planes.
6. Combine those bits into the 4-bit palette index.

## Validation Notes

Useful consistency checks when implementing a reader:

- `IC0_9.WLF` size should be a multiple of `128`
- `MASKS.WLF` size should be a multiple of `32`
- both files must contain the same number of records
- each image record must be exactly `128` bytes
- each mask record must be exactly `32` bytes
