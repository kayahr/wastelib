/*
 * Copyright (c) 2016 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import { BinaryReader } from "../io/BinaryReader.ts";
import { decodeHuffman } from "../io/huffman.ts";
import { Tile } from "./Tile.ts";

/**
 * Container for a set of tiles read from the ALLHTDS1 or ALLHTDS2 file.
 */
export class Tileset implements Iterable<Tile> {
    /** The tiles in this set. */
    readonly #tiles: Tile[];

    /** The disk number. */
    readonly #disk: number;

    /**
     * Creates a new tileset with the given tiles.
     *
     * @param tiles  The tiles in this set.
     * @param disk   The disk number.
     */
    public constructor(tiles: Tile[], disk: number) {
        this.#tiles = tiles;
        this.#disk = disk;
    }

    /**
     * @yields The tiles.
     */
    public *[Symbol.iterator](): Generator<Tile> {
        yield* this.#tiles;
    }

    /**
     * @returns The disk number.
     */
    public getDisk(): number {
        return this.#disk;
    }

    /**
     * @returns The number of tiles.
     */
    public getTileCount(): number {
        return this.#tiles.length;
    }

    /**
     * Returns the tile with the given index.
     *
     * @param index - The index of the tile image to return.
     * @returns The tile image.
     * @throws {@link !RangeError} if the index is out of bounds.
     */
    public getTile(index: number): Tile {
        if (index < 0 || index >= this.#tiles.length) {
            throw new RangeError(`Index out of bounds: ${index}`);
        }
        return this.#tiles[index];
    }

    /**
     * Reads one tileset block from the given reader.
     *
     * @param reader - The reader to read from.
     * @returns The read tileset.
     * @internal
     */
    public static read(reader: BinaryReader): Tileset {
        const blockSize = reader.readUint32();
        const msq = reader.readString(3);
        if (msq !== "msq") {
            throw new Error("Invalid data block");
        }
        const disk = reader.readUint8();
        const decoded = decodeHuffman(reader, blockSize);
        const numOfTiles = blockSize >> 7;
        const tiles: Tile[] = [];
        for (let i = 0; i < numOfTiles; ++i) {
            tiles.push(new Tile(decoded, i * 128));
        }
        return new Tileset(tiles, disk);
    }

    /**
     * Reads a single tileset block from the given array.
     *
     * @param array  - The array to read the tileset from.
     * @param offset - The byte offset of the tileset block.
     * @returns The read tileset.
     */
    public static fromArray(array: Uint8Array, offset: number): Tileset {
        return this.read(new BinaryReader(array, offset));
    }

    /**
     * Reads tileset from the given blob.
     *
     * @param blob   - The ALLHTDS1 or ALLHTDS2 blob to read.
     * @param offset - The byte offset of the tileset block.
     * @returns The read tileset.
     */
    public static async fromBlob(blob: Blob, offset: number): Promise<Tileset> {
        return this.fromArray(new Uint8Array(await blob.arrayBuffer()), offset);
    }
}
