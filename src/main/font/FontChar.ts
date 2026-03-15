/*
 * Copyright (c) 2016 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import { BaseImage } from "../image/BaseImage.ts";
import { colorPalette } from "../image/colors.ts";

/**
 * Container for a single font character image.
 */
export class FontChar extends BaseImage {
    /**
     * The image data. 32 bytes. Each byte contains one color component for 8 pixels. So first pixel contains the red
     * component bits of the first image row, second pixel contains the green component bits, third bit contains the
     * blue component bits, forth bit contains the intensity bits and the next four bytes do the same for the second
     * image row and so on.
     */
    readonly #data: ArrayLike<number>;

    /**
     * Creates a new font character image for the given image data.
     *
     * @param array  - The array with the content of the colorf.fnt file.
     * @param offset - The offset in the array pointing to the font character.
     */
    public constructor(array: Uint8Array, offset = 0) {
        super(8, 8);
        this.#data = array.slice(offset, offset + 32);
    }

    /** @inheritdoc */
    public getColor(x: number, y: number): number {
        if (x < 0 || y < 0 || x > 7 || y > 7) {
            throw new RangeError(`Coordinates outside of image boundary: ${x}, ${y}`);
        }
        const bit = 7 - (x & 7);
        const data = this.#data;
        const pixel = (((data[y] >> bit) & 1) << 0) // Blue
            | (((data[y + 8] >> bit) & 1) << 1)     // Green
            | (((data[y + 16] >> bit) & 1) << 2)    // Red
            | (((data[y + 24] >> bit) & 1) << 3);   // Intensity
        return colorPalette[pixel];
    }
}
