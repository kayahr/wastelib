/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { createCanvas } from "../sys/canvas.js";
import { createImage } from "../sys/image.js";
import { Tile } from "./Tile.js";

/**
 * Container for a set of tiles read from an allhtds file.
 */
export class Tileset {
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
     * @param index  The index of the tile image to return.
     * @return The tile image.
     */
    public getTile(index: number): Tile {
        if (index < 0 || index >= this.tiles.length) {
            throw new Error("Index out of bounds: " + index);
        }
        return this.tiles[index];
    }

    /**
     * Creates and returns a new canvas containing the tileset image. 16 tilesets per row.
     *
     * @return The created canvas.
     */
    public toCanvas(): HTMLCanvasElement {
        const tiles = this.tiles;
        const numTiles = tiles.length;
        const canvas = createCanvas(256, Math.ceil(numTiles / 16) * 16);
        const ctx = canvas.getContext("2d");
        if (ctx == null) {
            throw new Error("Unable to create 2D rendering context");
        }
        for (let i = 0; i < numTiles; ++i) {
            this.getTile(i).draw(ctx, (i & 15) << 4, i >> 4 << 4);
        }
        return canvas;
    }

    /**
     * Creates and returns a tileset image data URL. 16 tiles per row.
     *
     * @param type    - Optional image mime type. Defaults to image/png.
     * @param quality - Optional quality parameter for encoder. For image/jpeg this is the image quality between 0 and
     *                  1 with a default value of 0.92.
     * @return The created data URL.
     */
    public toDataUrl(type?: string, quality?: number): string {
        const canvas = this.toCanvas();
        return canvas.toDataURL(type, quality);
    }

    /**
     * Creates and returns a HTML image of the tileset. 16 tiles per row.
     *
     * @param type    - Optional image mime type. Defaults to image/png.
     * @param quality - Optional quality parameter for encoder. For image/jpeg this is the image quality between 0 and
     *                  1 with a default value of 0.92.
     * @return The created HTML image.
     */
    public toImage(type?: string, quality?: number): HTMLImageElement {
        const image = createImage();
        image.src = this.toDataUrl(type, quality);
        return image;
    }
}
