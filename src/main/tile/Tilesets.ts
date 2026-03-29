/*
 * Copyright (c) 2016 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import { BinaryReader } from "../io/BinaryReader.ts";
import { Tileset } from "./Tileset.ts";

/**
 * Container for the tilesets of the files ALLHTDS1 and ALLHTDS2.
 */
export class Tilesets implements Iterable<Tileset> {
    /** The tilesets. */
    readonly #tilesets: Tileset[];

    /**
     * Creates a new tilesets container with the given tilesets.
     *
     * @param chars  The tilesets.
     */
    private constructor(...tilesets: Tileset[]) {
        this.#tilesets = tilesets;
    }

    /**
     * @yields The tilesets.
     */
    public *[Symbol.iterator](): Generator<Tileset> {
        yield* this.#tilesets;
    }

    /**
     * @returns The number of tilesets.
     */
    public getTilesetCount(): number {
        return this.#tilesets.length;
    }

    /**
     * Returns the tileset with the given index.
     *
     * @param index - The tileset index.
     * @returns The tileset.
     * @throws {@link !RangeError} if the index is out of bounds.
     */
    public getTileset(index: number): Tileset {
        if (index < 0 || index >= this.#tilesets.length) {
            throw new RangeError(`Index out of bounds: ${index}`);
        }
        return this.#tilesets[index];
    }

    /**
     * Reads tilesets from the given array.
     *
     * @param array - The array to read the tilesets from.
     * @returns The read tilesets.
     */
    public static fromArray(array: Uint8Array): Tilesets {
        const reader = new BinaryReader(array);
        const tilesets: Tileset[] = [];
        while (reader.hasData()) {
            tilesets.push(Tileset.read(reader));
        }
        return new Tilesets(...tilesets);
    }

    /**
     * Reads tilesets from the given blob.
     *
     * @param blob - The ALLHTDS1 or ALLHTDS2 blob to read.
     * @returns The read tilesets.
     */
    public static async fromBlob(blob: Blob): Promise<Tilesets> {
        return this.fromArray(new Uint8Array(await blob.arrayBuffer()));
    }

    /**
     * Reads tilesets from the two given arrays.
     *
     * @param array1 - The array with the ALLHTDS1 file content.
     * @param array2 - The array with the ALLHTDS2 file content.
     * @returns The read tilesets.
     */
    public static fromArrays(array1: Uint8Array, array2: Uint8Array): Tilesets {
        return new this(...this.fromArray(array1).#tilesets, ...this.fromArray(array2).#tilesets);
    }

    /**
     * Reads tilesets from the two given blobs.
     *
     * @param blob1 - The ALLHTDS1 blob to read.
     * @param blob2 - The ALLHTDS2 blob to read
     * @returns The read tilesets.
     */
    public static async fromBlobs(blob1: Blob, blob2: Blob): Promise<Tilesets> {
        return new Tilesets(
            ...(await this.fromBlob(blob1)).#tilesets,
            ...(await this.fromBlob(blob2)).#tilesets
        );
    }
}
