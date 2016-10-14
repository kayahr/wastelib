/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { BinaryReader } from "./BinaryReader";
import { PortraitPatch } from "./PortraitPatch";

/**
 * A single update in a portrait animation.
 */
export class PortraitUpdate {
    /** The patches to apply to the image. */
    private patches: PortraitPatch[];

    /**
     * Creates an animation update with the given image patches.
     *
     * @param patches
     *            The patches to apply on the image when this update is applied.
     */
    private constructor(patches: PortraitPatch[]) {
        this.patches = patches;
    }

    /**
     * Returns the patches to apply to the image.
     *
     * @return The patches to apply to the image.
     */
    public getPatches(): PortraitPatch[] {
        return this.patches.slice();
    }

    /**
     * Returns the patch with the given index.
     *
     * @param index
     *            The index of the patch to return.
     * @return The patch.
     */
    public getPatch(index: number): PortraitPatch {
        if (index < 0 || index >= this.patches.length) {
           throw new Error("Index out of bounds: " + index);
        }
        return this.patches[index];
    }

    /**
     * Returns the number of patches.
     *
     * @return The number of patches.
     */
    public getNumPatches(): number {
        return this.patches.length;
    }

    /**
     * Reads an animation update from the given reader. If the end of the animation has been reached then `null` is
     * returned.
     *
     * @param reader
     *            The reader to read the animation update from.
     * @return The read animation update or null if end of animation has been reached.
     */
    public static read(reader: BinaryReader): PortraitUpdate {
        let update: PortraitPatch | null;
        let updates: PortraitPatch[] = [];
        while (update = PortraitPatch.read(reader)) {
            updates.push(update);
        }
        return new PortraitUpdate(updates);
    }
}
