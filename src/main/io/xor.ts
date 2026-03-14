/*
 * Copyright (C) 2026 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

/**
 * Decodes a rotating xor encoded data block.
 *
 * @param data   - The array containing the data to decode.
 * @param size   - Optional number of bytes to decode. Defaults to size of data minus two bytes header.
 * @param offset - Optional start offset in the data array to decode. Defaults to 0.
 * @returns A new array with the decoded bytes.
 */
export function decodeRotatingXor(data: ArrayLike<number>, size: number = data.length - 2, offset = 0): Uint8Array {
    // Get encryption byte and checksum end marker
    const e1 = data[offset++];
    const e2 = data[offset++];
    let enc = e1 ^ e2;
    const endChecksum = e1 | (e2 << 8);

    // Initialize checksum
    let checksum = 0;

    const result = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
        // Read encoded byte
        const encoded = data[offset++];

        // Decode the byte
        const decoded = encoded ^ enc;

        // Update checksum
        checksum = (checksum - decoded) & 0xffff;

        // Updated encryption byte
        enc = (enc + 0x1f) % 0x100;

        // Save decoded byte
        result[i] = decoded;
    }

    if (checksum !== endChecksum) {
        throw new Error("Checksum error while decoding rotated xor");
    }

    return result;
}
