---
title: Vertical XOR
---

# Vertical XOR

This document describes the generic vertical-XOR transform used by several Wasteland resource files.

It is a byte-wise predictor transform for two-dimensional data with a known row stride.

## Input and Output

The input is a byte buffer representing rows of fixed width.

The transform works on bytes, not on logical pixels or higher-level structures.

The caller must know the row stride in bytes from the surrounding file format.

## Meaning of "Vertical XOR"

The first row is stored literally.

Every byte in each following row is stored as the XOR difference to the byte directly above it.

If `encoded[x, y]` is the stored byte and `decoded[x, y]` is the final byte value, then:

```text
decoded[x, 0] = encoded[x, 0]
decoded[x, y] = encoded[x, y] XOR decoded[x, y - 1]
```

for all valid coordinates within the row width and height.

## Decoding Algorithm

Given a byte buffer and a row stride of `stride` bytes:

```text
for i from stride to end-1:
    data[i] = data[i] XOR data[i - stride]
```

This can be done in place because each row depends only on already-decoded bytes from the previous row.
