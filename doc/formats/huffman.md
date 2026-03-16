---
title: Huffman Encoding
---

# Huffman Encoding

This document describes the generic Huffman bitstream format used by several Wasteland resource files.

Some file formats wrap this bitstream in a container such as an `msq` block, but the encoding described here is the bitstream itself, independent of any specific file type.

All Huffman bits are read most-significant-bit first within each byte.

## Overview

The Huffman payload consists of:

1. a serialized binary tree
2. a data bitstream that references that tree until the requested decoded size has been produced

The decoded output size is not stored inside the Huffman bitstream itself. It must be known from the surrounding container or from the calling code.

## Tree Serialization

The tree is serialized recursively.

To read one node:

1. Read one bit.
2. If the bit is `1`, the node is a leaf and the next byte is the symbol value.
3. If the bit is `0`, the node is an internal node.
4. For an internal node:
   1. read the left child recursively
   2. read and ignore one separator bit
   3. read the right child recursively

In pseudocode:

```text
readNode():
    if readBit() == 1:
        return readByte()
    else:
        left = readNode()
        readBit()
        right = readNode()
        return Node(left, right)
```

Important detail:

- the separator bit between the left and right child of an internal node is present in the bitstream but ignored by the decoder

## Data Decoding

After the tree has been read, the remaining bits encode the payload bytes.

To decode one output byte:

1. Start at the root node.
2. Read one bit.
3. `0` means go to the left child.
4. `1` means go to the right child.
5. Repeat until a leaf is reached.
6. Emit the leaf byte value.

Repeat until exactly `decodedSize` bytes have been produced.

In pseudocode:

```text
for i in 0 .. decodedSize-1:
    node = root
    while node is not a leaf:
        if readBit() == 0:
            node = node.left
        else:
            node = node.right
    output[i] = node.value
```

## Bit Alignment

The tree and the compressed payload are a single continuous bitstream. There is no byte alignment between them.

After the required number of decoded bytes has been produced, a container format may advance to the next full byte boundary before reading the next field.
