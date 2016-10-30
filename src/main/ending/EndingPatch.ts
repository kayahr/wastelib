/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { BinaryReader } from "../io/BinaryReader";
import { COLOR_PALETTE } from "../image/colors";

/**
 * Image update patch.
 */
export class EndingPatch {
    /** The image offset to update. */
    private offset: number;

    /** The patch data (Four bytes with eight 4-bit colors). */
    private data: Uint8Array;

    /**
     * Creates a new update patch,
     *
     * @param offset  The image update offset.
     * @param data    The patch data (Four bytes with eight 4-bit colors).
     */
    private constructor(offset: number, data: Uint8Array) {
        this.offset = offset;
        this.data = data;
    }

    /**
     * Returns the raw offset to update. This is the raw offset value from the END.CPA file measured in 8 byte
     * blocks relative to a 320 pixels wide screen. Too complex to use. So it's recommended to use the
     * [[getX]]() and [[getY]]() methods which converts this offset into pixel coordinates relative to
     * the image. Or use the [[getOffset]]() method which returns the offset byte address in the image data.
     *
     * @return The raw image update offset.
     */
    public getRawOffset(): number {
        return this.offset;
    }

    /**
     * Returns the byte offset in the image data array to update.
     *
     * @return The byte offset in the image data array to update.
     */
    public getOffset(): number {
        return this.getY() * 144 + (this.getX() >> 1);
    }

    /**
     * The horizontal update position in pixels relative to the image.
     *
     * @return The horizontal update position.
     */
    public getX(): number {
        return this.offset * 8 % 320;
    }

    /**
     * The vertical update position in pixels relative to the image.
     *
     * @return The vertical update position.
     */
    public getY(): number {
        return (this.offset * 8 / 320) | 0;
    }

    /**
     * Returns the patch data to apply to the image. Always four bytes with eight 4-bit colors.
     *
     * @return The patch data.
     */
    public getData(): Uint8Array {
        return this.data.slice();
    }

    /**
     * Returns the RGBA color at the specified position.
     *
     * @param x  The horizontal pixel position.
     * @return The RGBA color at the specified position.
     */
    public getColor(x: number): number {
        const pixelTuple = this.data[x >> 1];
        const pixel = x & 1 ? pixelTuple & 0xf : pixelTuple >> 4;
        return COLOR_PALETTE[pixel];
    }

    /**
     * Reads an update patch from the given reader. If end of animation update block is reached then `null` is
     * returned.
     *
     * @param reader  The reader to read the update patch from.
     * @return The read update patch or null if end of update block is reached.
     */
    public static read(reader: BinaryReader): EndingPatch | null {
        const offset = reader.readUint16();
        if (offset === 0xffff) {
            return null;
        }
        const pixels = reader.readUint8s(4);
        return new EndingPatch(offset, pixels);
    }
}
