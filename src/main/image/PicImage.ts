/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { BaseImage } from "./BaseImage";
import { COLOR_PALETTE } from "./colors";

/**
 * Base class for images in pic layout (Each byte contains two 4-bit colors).
 */
export abstract class PicImage extends BaseImage {
    /** The image data. */
    protected data: Uint8Array;

    /**
     * Creates a new tile image with the given image data.
     *
     * @param data
     *            The image data (Each byte contains two 4-bit colors).
     * @param width
     *            The image width in pixels.
     * @param height
     *            The image height in pixels.
     */
    protected constructor(data: Uint8Array, width: number, height: number) {
        super(width, height);
        this.data = data;
    }

    /**
     * Returns a copy of the image data. Each byte contains two 4-bit colors.
     *
     * @return The image data.
     */
    public getData(): Uint8Array {
        return this.data.slice();
    }

    public getColor(x: number, y: number): number {
        if (x < 0 || y < 0 || x > this.width && y > this.height) {
            throw new Error(`Coordinates outside of image boundary: ${x}, ${y}`);
        }
        const pixelTuple = this.data[(x + y * this.width) >> 1];
        const pixel = x & 1 ? pixelTuple & 0xf : pixelTuple >> 4;
        return COLOR_PALETTE[pixel];
    }
}
