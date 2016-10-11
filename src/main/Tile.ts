/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { PicImage } from "./PicImage";
import { decodeVxorInplace } from "./vxor";

/**
 * Container for a single tile.
 */
export class Tile extends PicImage {
    /**
     * Creates a new tile with the given image data.
     *
     * @param data
     *            The image data.
     */
    private constructor(data: ArrayLike<number>) {
        super(data, 16, 16);
    }

    /**
     * Parses a tile from the given array buffer.
     *
     * @param array
     *            The array buffer containing the image data.
     * @param offset
     *            Optional data offset. Defaults to 0.
     * @return The parsed tile.
     */
    public static fromArray(array: Uint8Array, offset?: number): Tile {
        return new Tile(decodeVxorInplace(array.slice(offset, offset + 128), 8));
    }
}
