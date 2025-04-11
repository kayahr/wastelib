/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { BinaryReader } from "../io/BinaryReader.js";

/**
 * Interface of a single huffman node with a left and right branch connected to other huffman nodes or payload
 * bytes.
 */
interface Node {
    left: Node | number;
    right: Node | number;
}

/**
 * Recursively reads a huffman node (or payload byte) from the given reader and returns it.
 *
 * @param reader  The reader to read the huffman node from.
 * @return The huffman node. Can also be the payload byte of a node.
 */
function readNode(reader: BinaryReader): Node | number {
    if (reader.readBit() !== 0) {
        return reader.readUint8();
    } else {
        const left = readNode(reader);
        reader.readBit();
        const right = readNode(reader);
        return { left, right };
    }
}

/**
 * Decodes huffman encoded data read from the given reader and returns the decoded data.
 *
 * @param reader  The reader to read the encoded data from. The current position of the reader must point to the
 *                beginning of the huffman tree. After decoding the reader position is set to the next full byte after
 *                the encoded data.
 * @param size    The number of bytes to decode. Defines the size of the returned array.
 * @return The decoded data.
 */
export function decodeHuffman(reader: BinaryReader, size: number): Uint8Array {
    const rootNode = readNode(reader);
    const data = new Uint8Array(size);
    for (let i = 0; i < size; ++i) {
        let node = rootNode;
        while (typeof node !== "number") {
            node = reader.readBit() !== 0 ? node.right : node.left;
        }
        data[i] = node;
    }
    reader.sync();
    return data;
}
