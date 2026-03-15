/*
 * Copyright (c) 2016 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import { BaseImage } from "../image/BaseImage.ts";
import { colorPalette, transparency } from "../image/colors.ts";

/**
 * Container for a single mouse cursor image.
 */
export class Cursor extends BaseImage {
    /** The image data. */
    readonly #data: ArrayLike<number>;

    /**
     * Creates a new mouse cursor image with the give image data.
     *
     * @param array  - The array containing the image data.
     * @param offset - Optional start offset within the array. Defaults to 0.
     */
    public constructor(array: Uint8Array, offset = 0) {
        super(16, 16);
        this.#data = array.slice(offset, offset + 256);
    }

    /** @inheritdoc */
    public override getColor(x: number, y: number): number {
        if (x < 0 || y < 0 || x > 15 || y > 15) {
            throw new RangeError(`Coordinates outside of image boundary: ${x}, ${y}`);
        }

        const data = this.#data;
        const i = (y << 2) + 3 - (x >> 3);
        const b = 7 - (x & 7);

        // The multi-component transparency mask can't be converted into RGBA but fortunately the game doesn't use
        // this feature anyway and all components in the cursor masks are set to the same value. So we simply check
        // for the blue component mask bit to decide if pixel is transparent or not.
        if ((((data[i - 2] >> b) & 1) === 1)) {
            const pixel = ((data[i] >> b) & 1)       // Blue
                | (((data[i + 64] >> b) & 1) << 1)   // Green
                | (((data[i + 128] >> b) & 1) << 2)  // Red
                | (((data[i + 192] >> b) & 1) << 3); // Intensity
            return colorPalette[pixel];
        }
        return transparency;
    }
}
