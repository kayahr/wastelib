# ALLPICS1 / ALLPICS2 Format

This document describes the portrait archive format used by the Wasteland 1 files `ALLPICS1` and `ALLPICS2`.

It covers:

- the top-level file layout
- the per-portrait container structure
- the decoded animation data layout
- the script and update encodings

## Scope

`ALLPICS1` and `ALLPICS2` use the same binary format. The only practical difference is which portraits each file contains.

All multi-byte integer fields are little-endian.

Portrait images are stored as packed 4-bit pixels:

- width: `96` pixels
- height: `84` pixels
- 2 pixels per byte
- row stride: `48` bytes
- full image size: `48 * 84 = 4032` bytes (`0x0FC0`)

## File Layout

An `ALLPICS` file is just a sequence of portrait records concatenated until end-of-file.

There is:

- no global file header
- no portrait count
- no top-level offset table

To parse the file, read portrait records until EOF is reached.

## Portrait Record Overview

Each portrait record contains two back-to-back `msq` blocks:

1. the base portrait image
2. the animation data

Both blocks use the same wrapper:

| Offset | Type | Meaning |
| --- | --- | --- |
| `+0x00` | `u32` | Decoded payload size in bytes |
| `+0x04` | `char[3]` | ASCII signature, always `"msq"` |
| `+0x07` | `u8` | MSQ disk byte |
| `+0x08` | bitstream | Huffman-coded payload |

Important details:

- the `u32` size is the size **after** [Huffman](huffman.md) decoding.
- the compressed payload length is not stored explicitly
- the parser must decode exactly that many bytes
- after decoding, the reader advances to the next full byte boundary before the next field begins

In the shipped Wasteland 1 portrait archives, the MSQ disk byte has a fixed value depending on file and block type:

- the animation block always uses `0`
- the base-image block in `ALLPICS1` always uses `0`
- the base-image block in `ALLPICS2` always uses `1`

## Base Image Block

The first `msq` block in each portrait record contains the base portrait frame.

### Decoded Payload

The decoded payload is a `4032`-byte packed image buffer for a `96x84` portrait.

The bytes are still [vertical-XOR encoded](vertical-xor.md) at this point. After Huffman decoding, the data must be vertical-XOR decoded with a row stride of `48` bytes.

After that step, the result is the final base image:

- row-major order
- packed 4-bit pixels
- high nibble = left pixel
- low nibble = right pixel

## Animation Block

The second `msq` block in each portrait record contains all animation scripts and all image update data for the portrait.

Unlike the base image block, the decoded animation payload is **not** vertical-XOR decoded.

### Decoded Payload Layout

The decoded animation block has this layout:

| Offset | Type | Meaning |
| --- | --- | --- |
| `+0x00` | `u16` | Size of the script section in bytes |
| `+0x02` | `u8[scriptsSize]` | Script section |
| `+0x02 + scriptsSize` | `u16` | Size of the update section in bytes |
| `+0x04 + scriptsSize` | `u8[updatesSize]` | Update section |

There is no footer, no padding, and no count field for either scripts or updates.

For a valid block:

```text
animDecodedSize = 2 + scriptsSize + 2 + updatesSize
```

## Script Section

The script section is a byte stream containing one script after another until exactly `scriptsSize` bytes have been consumed.

There is no stored script count.

### Script Encoding

Each script is a sequence of `(delay, updateIndex)` pairs terminated by a single byte `0xFF`.

| Type | Meaning |
| --- | --- |
| `u8 delay` | Delay value for this script step |
| `u8 updateIndex` | Zero-based index into the update table |

Parsing rule:

1. Read one byte.
2. If it is `0xFF`, the current script ends.
3. Otherwise that byte is `delay`, and the next byte is `updateIndex`.
4. Continue until the script terminator is found.
5. Start the next script immediately after the terminator.

Example:

```text
00 04 03 07 01 02 FF
```

This encodes one script with three lines:

1. `delay = 0`, `updateIndex = 4`
2. `delay = 3`, `updateIndex = 7`
3. `delay = 1`, `updateIndex = 2`

### Delay Semantics

The file format stores only the raw `u8` delay value. No additional timing multiplier or per-portrait speed field is present in the animation data.

A practical timing model is to treat the delay as an additional hold count on top of a base redraw tick:

```text
milliseconds = (delay + 1) * 54.925
```

This is based on the IBM PC timer tick rate of approximately `18.2065 Hz`, where one tick is about `54.925 ms`.

## Update Section

The update section is a byte stream containing one update after another until exactly `updatesSize` bytes have been consumed.

There is no stored update count.

Each update contains one or more patch records and ends with the 16-bit sentinel `0xFFFF`.

### Update Encoding

| Type | Meaning |
| --- | --- |
| `u16 sizeAndOffset` | Packed patch header |
| `u8[size] data` | XOR bytes for the patch |

If `sizeAndOffset == 0xFFFF`, the current update ends and no patch follows.

Otherwise the packed header is decoded as:

```text
size   = (sizeAndOffset >> 12) + 1
offset =  sizeAndOffset & 0x0FFF
```

This means:

- the upper 4 bits store `size - 1`
- the lower 12 bits store the byte offset into the image buffer
- patch sizes range from `1` to `16` bytes

### Patch Application

`offset` is measured in bytes within the packed `4032`-byte portrait buffer, not in pixels.

To apply one patch:

```text
for i in 0 .. size-1:
    image[offset + i] ^= data[i]
```

To apply one update, apply all of its patches in sequence.

Because the patches use XOR, applying the same update twice restores the original bytes for the affected region.

## Parsing Summary

A parser can read one portrait record like this:

1. Read the first `msq` block.
2. Huffman-decode its payload to the size given by the leading `u32`.
3. Vertical-XOR decode the resulting `4032` bytes with stride `48`.
4. Read the second `msq` block.
5. Huffman-decode its payload to the size given by the leading `u32`.
6. Read `scriptsSize`.
7. Parse scripts until exactly `scriptsSize` bytes have been consumed.
8. Read `updatesSize`.
9. Parse updates until exactly `updatesSize` bytes have been consumed.

Repeat until EOF to read the whole file.

## Validation Notes

Useful consistency checks when implementing a reader:

- each portrait record must start with an `msq` base-image block
- each animation block must also start with `msq`
- the base image should decode to `4032` bytes for Wasteland 1 portrait data
- script parsing must end exactly at `scriptsSize`
- update parsing must end exactly at `updatesSize`
- patch offsets and lengths must stay within the `4032`-byte image buffer
- the next portrait begins immediately after the second `msq` block ends

## See Also

- [Huffman Encoding](huffman.md)
- [Vertical XOR](vertical-xor.md)
