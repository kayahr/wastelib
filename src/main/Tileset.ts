/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { Tile } from "./Tile";

/**
 * Container for a set of tiles read from an allhtds file.
 */
export class Tileset {
    /** The tiles in this set. */
    private tiles: Tile[];

    /** The disk number. */
    private disk: number;

    /**
     * Creates a new tileset with the given tiles.
     *
     * @param tiles
     *           The tiles in this set.
     * @param disk
     *           The disk number.
     */
    public constructor(tiles: Tile[], disk: number) {
        this.tiles = tiles;
        this.disk = disk;
    }

    /**
     * Returns array with all tiles of this set.
     *
     * @return The tiles.
     */
    public getTiles(): Tile[] {
        return this.tiles.slice();
    }

    /**
     * Returns the disk number.
     *
     * @return The disk number.
     */
    public getDisk(): number {
        return this.disk;
    }

    /**
     * Returns the number of tiles in this set.
     *
     * @return The number of tiles.
     */
    public getNumTiles(): number {
        return this.tiles.length;
    }

    /**
     * Returns the tile with the given index.
     *
     * @param index
     *            The index of the tile image to return.
     * @return The tile image.
     */
    public getTile(index: number): Tile {
        if (index < 0 || index >= this.tiles.length) {
            throw new Error("Index out of bounds: " + index);
        }
        return this.tiles[index];
    }
}
