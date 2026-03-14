/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { type CanvasLike, type ToCanvas, getCanvasContext2D } from "../sys/canvas.ts";
import type { Tile } from "./Tile.ts";

/**
 * Container for a set of tiles read from an allhtds file.
 */
export class Tileset implements ToCanvas {
    /** The tiles in this set. */
    private readonly tiles: Tile[];

    /** The disk number. */
    private readonly disk: number;

    /**
     * Creates a new tileset with the given tiles.
     *
     * @param tiles  The tiles in this set.
     * @param disk   The disk number.
     */
    public constructor(tiles: Tile[], disk: number) {
        this.tiles = tiles;
        this.disk = disk;
    }

    /**
     * Returns array with all tiles of this set.
     *
     * @returns The tiles.
     */
    public getTiles(): Tile[] {
        return this.tiles.slice();
    }

    /**
     * Returns the disk number.
     *
     * @returns The disk number.
     */
    public getDisk(): number {
        return this.disk;
    }

    /**
     * Returns the number of tiles in this set.
     *
     * @returns The number of tiles.
     */
    public getNumTiles(): number {
        return this.tiles.length;
    }

    /**
     * Returns the tile with the given index.
     *
     * @param index  The index of the tile image to return.
     * @returns The tile image.
     */
    public getTile(index: number): Tile {
        if (index < 0 || index >= this.tiles.length) {
            throw new Error(`Index out of bounds: ${index}`);
        }
        return this.tiles[index];
    }

    /** @inheritdoc */
    public toCanvas<T extends CanvasLike>(canvas: T): T {
        const tiles = this.tiles;
        const numTiles = tiles.length;
        canvas.width = 256;
        canvas.height = Math.ceil(numTiles / 16) * 16;
        const ctx = getCanvasContext2D(canvas);
        for (let i = 0; i < numTiles; ++i) {
            this.getTile(i).draw(ctx, (i & 15) << 4, i >> 4 << 4);
        }
        return canvas;
    }
}
