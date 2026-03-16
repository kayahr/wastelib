/*
 * Copyright (c) 2016 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import { Cursor } from "./Cursor.ts";

/**
 * Container for the 8 mouse cursors in the CURS file.
 */
export class Cursors implements Iterable<Cursor> {
    /** The mouse cursor images. */
    readonly #cursors: Cursor[];

    /**
     * Creates a new mouse cursor container with the given cursors.
     *
     * @param cursors - The mouse cursor images.
     */
    private constructor(cursors: Cursor[]) {
        this.#cursors = cursors;
    }

    /**
     * @yields The cursors.
     */
    public *[Symbol.iterator](): Generator<Cursor> {
        yield* this.#cursors;
    }

    /**
     * Returns the mouse cursor image with the given index.
     *
     * @param index - The index of the mouse cursor image.
     * @returns The mouse cursor image.
     * @throws {@link !RangeError} if the index is out of bounds.
     */
    public getCursor(index: number): Cursor {
        if (index < 0 || index >= this.#cursors.length) {
            throw new RangeError(`Index out of bounds: ${index}`);
        }
        return this.#cursors[index];
    }

    /**
     * @returns The number of mouse cursors.
     */
    public getCursorCount(): number {
        return this.#cursors.length;
    }

    /**
     * Parses the mouse cursor images from the given array and returns it.
     *
     * @param array - The array with the CURS file content to parse.
     * @returns The parsed mouse cursors.
     */
    public static fromArray(array: Uint8Array): Cursors {
        const cursors: Cursor[] = [];
        const numCursors = array.length / 256;
        for (let i = 0; i < numCursors; ++i) {
            cursors.push(new Cursor(array, i * 256));
        }
        return new Cursors(cursors);
    }

    /**
     * Reads mouse cursor images from the given blob and returns it.
     *
     * @param blob - The CURS blob to read.
     * @returns The read mouse cursors.
     */
    public static async fromBlob(blob: Blob): Promise<Cursors> {
        return Cursors.fromArray(new Uint8Array(await blob.arrayBuffer()));
    }
}
