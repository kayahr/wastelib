/*
 * Copyright (c) 2016 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import type { BinaryReader } from "../io/BinaryReader.ts";

/**
 * Image update patch.
 */
export class EndingPatch {
    /** The image offset to update. */
    readonly #offset: number;

    /** The patch data (Four bytes with eight 4-bit colors). */
    readonly #data: Uint8Array;

    /**
     * Creates a new update patch,
     *
     * @param offset - The image update offset.
     * @param data   - The patch data (Four bytes with eight 4-bit colors).
     */
    private constructor(offset: number, data: Uint8Array) {
        this.#offset = offset;
        this.#data = data;
    }

    /**
     * @returns The byte offset in the image data array to update.
     */
    public getOffset(): number {
        return this.getY() * 144 + (this.getX() >> 1);
    }

    /**
     * @returns The horizontal update position in pixels relative to the image.
     */
    public getX(): number {
        return this.#offset * 8 % 320;
    }

    /**
     * @returns The vertical update position in pixels relative to the image.
     */
    public getY(): number {
        return (this.#offset * 8 / 320) | 0;
    }

    /**
     * @returns the patch data to apply to the image. Always four bytes with eight 4-bit colors.
     */
    public getData(): Uint8Array {
        return this.#data.slice();
    }

    /**
     * Reads an update patch from the given reader. If end of animation update block is reached then `null` is
     * returned.
     *
     * @param reader - The reader to read the update patch from.
     * @returns The read update patch or null if end of update block is reached.
     * @internal
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
