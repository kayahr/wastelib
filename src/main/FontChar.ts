/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { AbstractImage } from "./AbstractImage";
import { COLOR_PALETTE } from "./colors";

/**
 * Container for a single font character image.
 */
export class FontChar extends AbstractImage {
    /**
     * The image data. 32 bytes. Each byte contains one color component for 8 pixels. So first pixel contains the red
     * component bits of the first image row, second pixel contains the green component bits, third bit contains the
     * blue component bits, forth bit contains the intensity bits and the next four bytes do the same for the second
     * image row and so on.
     */
    private data: ArrayLike<number>;

    /**
     * Creates a new font character image for the given image data.
     *
     * @param data
     *            The image data.
     */
    private constructor(data: ArrayLike<number>) {
        super(8, 8);
        this.data = data;
    }

    public getColor(x: number, y: number): number {
        if (x < 0 || y < 0 || x > 7 && y > 7) {
            throw new Error(`Coordinates outside of image boundary: ${x}, ${y}`);
        }
        const bit = 7 - (x & 7);
        const data = this.data;
        const pixel = (((data[y] >> bit) & 1) << 0) // Blue
            | (((data[y + 8] >> bit) & 1) << 1)     // Green
            | (((data[y + 16] >> bit) & 1) << 2)    // Red
            | (((data[y + 24] >> bit) & 1) << 3);   // Intensity
        return COLOR_PALETTE[pixel];
    }

    /**
     * Parses a font from the given file and returns it.
     *
     * @param file
     *            The colorf.fnt file to read.
     * @return The parsed font.
     */
    public static fromArrayBuffer(buffer: ArrayBuffer, offset?: number): FontChar {
        return new FontChar(new Uint8Array(buffer, offset, 32));
    }
}
