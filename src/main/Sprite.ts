/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { AbstractImage } from "./AbstractImage";
import { COLOR_PALETTE, TRANSPARENCY } from "./colors";

/**
 * Container for a single sprite image.
 */
export class Sprite extends AbstractImage {
    /** The image data. */
    private data: ArrayLike<number>;

    /** The transparency mask data. */
    private maskData: ArrayLike<number>;

    /**
     * Creates a new sprite image for the given image and mask data.
     *
     * @param data
     *            The image data.
     * @param maskData
     *            The transparency mask data.
     */
    private constructor(data: ArrayLike<number>, maskData: ArrayLike<number>) {
        super(16, 16);
        this.data = data;
        this.maskData = maskData;
    }

    public getColor(x: number, y: number): number {
        if (x < 0 || y < 0 || x > 15 && y > 15) {
            throw new Error(`Coordinates outside of image boundary: ${x}, ${y}`);
        }
        const i = (y << 1) + (x >> 3);
        const b = 7 - (x % 8);
        if ((this.maskData[i] >> b) & 1) {
            return TRANSPARENCY;
        }
        const data = this.data;
        const pixel = (((data[i] >> b) & 1) << 0)  // Blue
            | (((data[i + 32] >> b) & 1) << 1)     // Green
            | (((data[i + 64] >> b) & 1) << 2)     // Red
            | (((data[i + 96] >> b) & 1) << 3);    // Intensity
        return COLOR_PALETTE[pixel];
    }

    /**
     * Parses a sprite from the given array buffers.
     *
     * @param dataBuffer
     *            The array buffer containing the image data.
     * @param maskBuffer
     *            The array buffer containing the mask data.
     * @param dataOffset
     *            Optional data offset. Defaults to 0.
     * @param maskOffset
     *            Optional mask offset. Defaults to 0.
     * @return The parsed sprite.
     */
    public static fromArrayBuffer(dataBuffer: ArrayBuffer, maskBuffer: ArrayBuffer, dataOffset?: number,
            maskOffset?: number): Sprite {
        return new Sprite(new Uint8Array(dataBuffer, dataOffset, 128), new Uint8Array(maskBuffer, maskOffset, 32));
    }
}
