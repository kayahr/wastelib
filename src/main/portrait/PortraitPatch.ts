/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { BinaryReader } from "../io/BinaryReader.js";

/**
 * A single portrait animation patch.
 */
export class PortraitPatch {
    /** The image offset where to apply the patch. */
    private readonly offset: number;

    /** The patch data (XOR values to apply at the image offset). */
    private readonly data: number[];

    /**
     * Creates a portrait animation patch.
     *
     * @param offset  The image offset where to apply the patch.
     * @param data    The patch data (XOR values to apply at the image offset).
     */
    private constructor(delay: number, data: number[]) {
        this.offset = delay;
        this.data = data;
    }

    /**
     * Returns the image offset to patch. This is the raw offset value from the allpics file measured in bytes
     * relative to the 96 pixels (48 bytes) wide portrait image. It's recommended to use the [[getX]]() and
     * [[getY]]() methods which converts this offset into pixel coordinates.
     *
     * @return The image offset to patch.
     */
    public getOffset(): number {
        return this.offset;
    }

    /**
     * The horizontal patch position in pixels relative to the image.
     *
     * @return The horizontal patch position.
     */
    public getX(): number {
        return this.offset % 48;
    }

    /**
     * The vertical patch position in pixels relative to the image.
     *
     * @return The vertical update position.
     */
    public getY(): number {
        return (this.offset / 48) | 0;
    }

    /**
     * Returns the patch data. The data consists of one or more XOR values to apply to the current image data.
     *
     * @return The patch data.
     */
    public getData(): number[] {
        return this.data.slice();
    }

    /**
     * Reads a portrait animation patch from the given reader and returns it. If the end of an animation update
     * has been reached then `null` is returned
     *
     * @param reader  The reader to read the animation patch from.
     * @return The read portrait animation patch or `null` if end of animation update has been reached.
     */
    public static read(reader: BinaryReader): PortraitPatch | null {
        const sizeAndOffset = reader.readUint16();
        if (sizeAndOffset === 0xffff) {
            return null;
        }
        const size = (sizeAndOffset >> 12) + 1;
        const offset = sizeAndOffset & 0x0fff;
        const data = reader.readUint8s(size);
        return new PortraitPatch(offset, data);
    }
}
