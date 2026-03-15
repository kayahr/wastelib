/*
 * Copyright (c) 2016 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import { BaseImage } from "../image/BaseImage.ts";
import { colorPalette, transparency } from "../image/colors.ts";

/**
 * Container for a single sprite image.
 */
export class Sprite extends BaseImage {
    /** The image data. */
    readonly #data: Uint8Array;

    /** The transparency mask data. */
    readonly #maskData: Uint8Array;

    /**
     * Creates a new sprite image for the given image and mask data.
     *
     * @param dataArray  - The array containing the image data.
     * @param maskArray  - The array containing the mask data.
     * @param dataOffset - Optional data offset. Defaults to 0.
     * @param maskOffset - Optional mask offset. Defaults to 0.
     */
    public constructor(dataArray: Uint8Array, maskArray: Uint8Array, dataOffset = 0, maskOffset = 0) {
        super(16, 16);
        this.#data = dataArray.slice(dataOffset, dataOffset + 128);
        this.#maskData = maskArray.slice(maskOffset, maskOffset + 32);
    }

    /** @inheritdoc */
    public override getColor(x: number, y: number): number {
        if (x < 0 || y < 0 || x > 15 || y > 15) {
            throw new RangeError(`Coordinates outside of image boundary: ${x}, ${y}`);
        }
        const i = (y << 1) + (x >> 3);
        const b = 7 - (x % 8);
        if (((this.#maskData[i] >> b) & 1) !== 0) {
            return transparency;
        }
        const data = this.#data;
        const pixel = (((data[i] >> b) & 1) << 0)  // Blue
            | (((data[i + 32] >> b) & 1) << 1)     // Green
            | (((data[i + 64] >> b) & 1) << 2)     // Red
            | (((data[i + 96] >> b) & 1) << 3);    // Intensity
        return colorPalette[pixel];
    }
}
