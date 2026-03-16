---
title: TITLE.PIC Format
---

# TITLE.PIC Format

This document describes the format of the Wasteland 1 `TITLE.PIC` file.

It covers:

- the file layout
- the image dimensions and pixel packing

The generic vertical-XOR transform is documented separately:

- [Vertical XOR](vertical-xor.md)

## Scope

`TITLE.PIC` contains a single static title image.

The image uses packed 4-bit pixels:

- width: `288` pixels
- height: `128` pixels
- 2 pixels per byte
- row stride: `144` bytes
- full image size: `144 * 128 = 18432` bytes (`0x4800`)

## File Layout

`TITLE.PIC` has no container structure.

There is:

- no header
- no signature
- no size field
- no compression wrapper
- no footer

The entire file is the image payload.

For the Wasteland 1 title image, the file size is therefore exactly `18432` bytes.

## Image Payload

The file content is a single packed image buffer stored in row-major order.

Each byte contains two 4-bit pixels:

- high nibble = left pixel
- low nibble = right pixel

However, the stored bytes are not yet the final pixel values. The complete `18432`-byte payload is [vertical-XOR encoded](vertical-xor.md) with a row stride of `144` bytes.

After vertical-XOR decoding, the result is the final `288x128` title image.

## Decoding

To decode `TITLE.PIC`:

1. Read the whole file as a byte array.
2. Verify that it contains `18432` bytes.
3. Vertical-XOR decode the entire array with a stride of `144` bytes.
4. Interpret the result as a packed `288x128` 4-bit image.

In pseudocode:

```text
decoded = decodeVxor(fileBytes, 144)
```

## Validation Notes

Useful consistency checks when implementing a reader:

- the file should contain exactly `18432` bytes
- decoding must use a vertical-XOR stride of `144` bytes
- the decoded image buffer must still be interpreted as packed 4-bit pixels, not as 8-bit indexed pixels
