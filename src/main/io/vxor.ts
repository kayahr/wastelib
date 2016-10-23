/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

/**
 * Decodes a vertical xor encoded data block.
 *
 * @param data    The array containing the data to decode.
 * @param width   The line width in bytes (not pixels) for decoding.
 * @param size    The number of bytes to decode.
 * @param offset  Optional start offset in the data array to decode. Defaults to 0.
 * @return A new array with the decoded bytes.
 */
export function decodeVxor(data: ArrayLike<number>, width: number, size: number = data.length,
        offset: number = 0): Uint8Array {
    const result = new Uint8Array(size);
    for (let i = 0, j = -width, k = offset, max = size; i < max; ++i, ++j, ++k) {
        result[i] = result[j] ^ data[k];
    }
    return result;
}

/**
 * Decodes a vertical xor encoded data block inplace.
 *
 * @param data    The array containing the data to decode.
 * @param width   The line width in bytes (not pixels) for decoding.
 * @param size    The number of bytes to decode.
 * @param offset  Optional start offset in the data array to decode. Defaults to 0.
 * @return Reference to the passed data array now containing the decoded bytes.
 */
export function decodeVxorInplace(data: Uint8Array, width: number, size: number = data.length,
        offset: number = 0): Uint8Array  {
    for (let j = offset, i = j + width, max = size + offset; i < max; ++i, ++j) {
        data[i] ^= data[j];
    }
    return data;
}
