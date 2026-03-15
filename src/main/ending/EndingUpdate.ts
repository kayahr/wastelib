/*
 * Copyright (c) 2016 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import type { BinaryReader } from "../io/BinaryReader.ts";
import { EndingPatch } from "./EndingPatch.ts";

/**
 * A single ending animation update.
 */
export class EndingUpdate implements Iterable<EndingPatch> {
    /** The delay before applying this update. */
    readonly #delay: number;

    /** A set of update patches. */
    readonly #patches: readonly EndingPatch[];

    /**
     * Creates an end animation update with the given delay and patches.
     *
     * @param delay   - The delay before applying this update.
     * @param patches - The set of update patches.
     */
    private constructor(delay: number, patches: EndingPatch[]) {
        this.#delay = delay;
        this.#patches = patches;
    }

    /**
     * @yields The ending animation update patches.
     */
    public *[Symbol.iterator](): Generator<EndingPatch> {
        for (const patch of this.#patches) {
            yield patch;
        }
    }

    /**
     * Returns the update patch with the given index.
     *
     * @param index - Update patch index.
     * @returns The animation patch.
     * @throws {@link !RangeError} if the index is out of bounds.
     */
    public getPatch(index: number): EndingPatch {
        if (index < 0 || index >= this.#patches.length) {
            throw new RangeError(`Index out of bounds: ${index}`);
        }
        return this.#patches[index];
    }

    /**
     * @returns The number of update patches.
     */
    public getSize(): number {
        return this.#patches.length;
    }

    /**
     * Returns the delay to wait before applying this update. The unit is unknown but good results can be achieved
     * by multiplying this value with 50 to get a millisecond value.
     *
     * @returns The delay in time units.
     */
    public getDelay(): number {
        return this.#delay;
    }

    /**
     * Reads an animation update from the given reader. If the end of the animation has been reached then `null` is
     * returned.
     *
     * @param reader - The reader to read the animation frame from.
     * @returns The read animation update or null if end of animation has been reached.
     */
    public static read(reader: BinaryReader): EndingUpdate | null {
        const delay = reader.readUint16();
        if (delay === 0xffff) {
            return null;
        }
        let update: EndingPatch | null;
        const updates: EndingPatch[] = [];
        while ((update = EndingPatch.read(reader)) != null) {
            updates.push(update);
        }
        return new EndingUpdate(delay, updates);
    }
}
