/*
 * Copyright (c) 2016 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import type { Tile } from "./Tile.ts";

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
        for (const tile of this.#tiles) {
            yield tile;
        }
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
    public getSize(): number {
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
}
