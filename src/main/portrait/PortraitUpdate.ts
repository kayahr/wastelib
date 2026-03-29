/*
 * Copyright (c) 2016 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import type { BinaryReader } from "../io/BinaryReader.ts";
import { PortraitPatch } from "./PortraitPatch.ts";

/**
 * A single update in a portrait animation.
 */
export class PortraitUpdate implements Iterable<PortraitPatch> {
    /** The patches to apply to the image. */
    readonly #patches: PortraitPatch[];

    /**
     * Creates an animation update with the given image patches.
     *
     * @param patches - The patches to apply on the image when this update is applied.
     */
    private constructor(patches: PortraitPatch[]) {
        this.#patches = patches;
    }

    /**
     * @yields The portrait animation patches.
     */
    public *[Symbol.iterator](): Generator<PortraitPatch> {
        yield* this.#patches;
    }

    /**
     * Reads an animation update from the given reader. If the end of the animation has been reached then `null` is
     * returned.
     *
     * @param reader  The reader to read the animation update from.
     * @returns The read animation update or null if end of animation has been reached.
     * @internal
     */
    public static read(reader: BinaryReader): PortraitUpdate {
        let update: PortraitPatch | null;
        const updates: PortraitPatch[] = [];
        while ((update = PortraitPatch.read(reader)) != null) {
            updates.push(update);
        }
        return new PortraitUpdate(updates);
    }
}
