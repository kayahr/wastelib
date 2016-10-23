/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { BinaryReader } from "../io/BinaryReader";
import { EndingPatch } from "./EndingPatch";

/**
 * A single ending animation update.
 */
export class EndingUpdate {
    /** The delay before applying this update. */
    private delay: number;

    /** A set of update patches. */
    private patches: EndingPatch[];

    /**
     * Creates an end animation update with the given delay and patches.
     *
     * @param delay
     *            The delay before applying this update.
     * @param patches
     *            The set of update patches.
     */
    private constructor(delay: number, patches: EndingPatch[]) {
        this.delay = delay;
        this.patches = patches;
    }

    /**
     * Returns the delay to wait before applying this update. The unit is unknown but good results can be achieved
     * by multiplying this value with 50 to get a millisecond value.
     *
     * @return The delay in time units.
     */
    public getDelay(): number {
        return this.delay;
    }

    /**
     * Returns the set of update patches.
     *
     * @return The set of update patches.
     */
    public getPatches(): EndingPatch[] {
        return this.patches.slice();
    }

    /**
     * Returns the update patch with the given index.
     *
     * @param index
     *            Update patch index.
     * @return The animation patch.
     */
    public getPatch(index: number): EndingPatch {
        if (index < 0 || index >= this.patches.length) {
            throw new Error("Index out of bounds: " + index);
        }
        return this.patches[index];
    }

    /**
     * Returns the number of update patches.
     *
     * @return The number of update patches.
     */
    public getNumPatches(): number {
        return this.patches.length;
    }

    /**
     * Reads an animation update from the given reader. If the end of the animation has been reached then `null` is
     * returned.
     *
     * @param reader
     *            The reader to read the animation frame from.
     * @return The read animation update or null if end of animation has been reached.
     */
    public static read(reader: BinaryReader): EndingUpdate | null {
        const delay = reader.readUint16();
        if (delay === 0xffff) {
            return null;
        }
        let update: EndingPatch | null;
        let updates: EndingPatch[] = [];
        while (update = EndingPatch.read(reader)) {
            updates.push(update);
        }
        return new EndingUpdate(delay, updates);
    }
}
