/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { AbstractImage } from "./AbstractImage";
import { COLOR_PALETTE, TRANSPARENCY } from "./colors";

/**
 * Container for a single mouse cursor image.
 */
export class Cursor extends AbstractImage {
    /** The image data. */
    private data: ArrayLike<number>;

    /**
     * Creates a new mouse cursor image with the give image data.
     *
     * @param data
     *            The image data.
     */
    private constructor(data: ArrayLike<number>) {
        super(16, 16);
        this.data = data;
    }

    public getColor(x: number, y: number): number {
        if (x < 0 || y < 0 || x > 15 && y > 15) {
            throw new Error(`Coordinates outside of image boundary: ${x}, ${y}`);
        }

        const data = this.data;
        const i = (y << 2) + 3 - (x >> 3);
        const b = 7 - (x & 7);

        // The multi-component transparency mask can't be converted into RGBA but fortunately the game doesn't use
        // this feature anyway and all components in the cursor masks are set to the same value. So we simply check
        // for the blue component mask bit to decide if pixel is tranparent or not.
        if (((data[i - 2] >> b) & 1)) {
            const pixel = ((data[i] >> b) & 1)       // Blue
                | (((data[i + 64] >> b) & 1) << 1)   // Green
                | (((data[i + 128] >> b) & 1) << 2)  // Red
                | (((data[i + 192] >> b) & 1) << 3); // Intensity
            return COLOR_PALETTE[pixel];
        }
        return TRANSPARENCY;
    }

    /**
     * Parses a mouse cursor image from the given array buffer.
     *
     * @param buffer
     *            The array buffer containing the image data.
     * @param offset
     *            Optional buffer offset. Defaults to 0.
     * @return The parsed mouse cursor image.
     */
    public static fromArrayBuffer(buffer: ArrayBuffer, offset?: number): Cursor {
        return new Cursor(new Uint8Array(buffer, offset, 256));
    }
}
