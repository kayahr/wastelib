/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

/**
 * Decodes vxor encoded data.
 *
 * @param data
 *            The array containing the vxor encoded data to decode.
 * @param lineWidth
 *            The line width (in bytes, not pixels) of the vxor encoded data.
 * @return A new array with the decoded data.
 */
export function decodeVxor(data: ArrayLike<number>, lineWidth: number): Uint8Array {
    const result = new Uint8Array(data);
    for (let i = lineWidth, j = 0, max = data.length; i < max; ++i, ++j) {
        result[i] ^= result[j];
    }
    return result;
}
