/*
 * Copyright (c) 2016 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import { PicImage } from "../image/PicImage.ts";
import { decodeVxorInplace } from "../io/vxor.ts";

/**
 * Container for a single tile.
 */
export class Tile extends PicImage {
    /**
     * Creates a new tile with the given image data.
     *
     * @param array  - The array buffer containing the image data.
     * @param offset - Optional data offset. Defaults to 0.
     */
    public constructor(array: Uint8Array, offset = 0) {
        super(decodeVxorInplace(array.slice(offset, offset + 128), 8), 16, 16);
    }
}
