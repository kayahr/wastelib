# COLORF.FNT Format

This document describes the font format used by the Wasteland 1 `COLORF.FNT` file.

It covers:

- the top-level file layout
- the per-glyph record structure
- the bitplane layout
- color decoding

## Scope

`COLORF.FNT` contains a sequence of fixed-size font glyph records.

Each glyph is:

- width: `8` pixels
- height: `8` pixels

There is no header, no compression wrapper, and no per-glyph metadata.

## File Layout

The file is a simple concatenation of fixed-size glyph records until EOF.

- bytes per glyph: `32`
- glyph count: `fileSize / 32`

For a valid file, the total file size must be a multiple of `32`.

In the shipped Wasteland 1 data:

- `colorf.fnt` is `5504` bytes
- therefore it contains `172` glyph records

## Glyph Record Layout

Each glyph record is `32` bytes long and consists of four 1-bit planes of `8` bytes each:

| Offset | Size | Meaning |
| --- | --- | --- |
| `+0x00` | `8` | Blue plane |
| `+0x08` | `8` | Green plane |
| `+0x10` | `8` | Red plane |
| `+0x18` | `8` | Intensity plane |

Each plane stores one byte per image row:

- `8` rows
- `1` byte per row
- `8` pixels per byte

Bits are read most-significant-bit first within each byte.

## Pixel Addressing

For a pixel `(x, y)`:

```text
bitIndex = 7 - x
```

The plane bytes for row `y` are:

```text
blueByte      = data[y + 0]
greenByte     = data[y + 8]
redByte       = data[y + 16]
intensityByte = data[y + 24]
```

So each row is distributed across four different bytes, one in each plane.

## Color Decoding

The final 4-bit palette index is built from the four plane bits:

```text
blueBit      = (blueByte      >> bitIndex) & 1
greenBit     = (greenByte     >> bitIndex) & 1
redBit       = (redByte       >> bitIndex) & 1
intensityBit = (intensityByte >> bitIndex) & 1
```

Combined as:

```text
colorIndex =
    (blueBit      << 0) |
    (greenBit     << 1) |
    (redBit       << 2) |
    (intensityBit << 3)
```

This yields a 4-bit color value in the range `0..15`.

Unlike the sprite and cursor formats, `COLORF.FNT` does not contain a separate transparency mask. Every glyph pixel is always visible and is represented directly by its 4-bit palette index.

## Decoding Summary

To decode glyph `n`:

1. Read `32` bytes from the file at offset `n * 32`.
2. For each pixel `(x, y)`, read one bit from each of the four planes for row `y`.
3. Combine the four bits into the 4-bit palette index.

## Validation Notes

Useful consistency checks when implementing a reader:

- the file size should be a multiple of `32`
- each glyph record must be exactly `32` bytes
- each plane must contain exactly `8` bytes
- bits must be interpreted most-significant-bit first within each byte
