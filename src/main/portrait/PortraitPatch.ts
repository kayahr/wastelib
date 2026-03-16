/*
 * Copyright (c) 2016 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import type { BinaryReader } from "../io/BinaryReader.ts";

/**
 * A single portrait animation patch.
 */
export class PortraitPatch implements Iterable<number>{
    /** The image offset where to apply the patch. */
    readonly #offset: number;

    /** The patch data (XOR values to apply at the image offset). */
    readonly #data: Uint8Array;

    /**
     * Creates a portrait animation patch.
     *
     * @param offset - The image offset where to apply the patch.
     * @param data   - The patch data (XOR values to apply at the image offset).
     */
    private constructor(delay: number, data: Uint8Array) {
        this.#offset = delay;
        this.#data = data;
    }

    /**
     * Returns the image offset to patch. This is the raw offset value from the allpics file measured in bytes
     * relative to the 96 pixels (48 bytes) wide portrait image.
     *
     * @returns The image offset to patch.
     */
    public getOffset(): number {
        return this.#offset;
    }

    /**
     * @yields The patch data.
     */
    public *[Symbol.iterator](): Generator<number> {
        yield* this.#data;
    }

    /**
     * Reads a portrait animation patch from the given reader and returns it. If the end of an animation update
     * has been reached then `null` is returned
     *
     * @param reader - The reader to read the animation patch from.
     * @returns The read portrait animation patch or `null` if end of animation update has been reached.
     * @internal
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
