/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { BinaryReader } from "../io/BinaryReader";
import { decodeHuffman } from "../io/huffman";
import { Tile } from "./Tile";
import { Tileset } from "./Tileset";

/**
 * Container for the tilesets of the two allhtds files.
 */
export class Tilesets {
    /** The tile sets. */
    private readonly tilesets: Tileset[];

    /**
     * Creates a new tilesets container with the given tilesets.
     *
     * @param chars  The tilesets.
     */
    private constructor(...tilesets: Tileset[]) {
        this.tilesets = tilesets;
    }

    /**
     * Returns array with all tilesets.
     *
     * @return The tilesets.
     */
    public getTilesets(): Tileset[] {
        return this.tilesets.slice();
    }

    /**
     * Returns the number of tilesets.
     *
     * @return The number of tilesets.
     */
    public getNumTilesets(): number {
        return this.tilesets.length;
    }

    /**
     * Returns the tileset with the given index.
     *
     * @param index  The tileset index.
     * @return The tileset.
     */
    public getTileset(index: number): Tileset {
        if (index < 0 || index >= this.tilesets.length) {
            throw new Error("Index out of bounds: " + index);
        }
        return this.tilesets[index];
    }

    /**
     * Reads tilesets from the given array.
     *
     * @param buffer  The array to read the tilesets from.
     * @return The read tilesets.
     */
    public static fromArray(array: Uint8Array): Tilesets {
        const reader = new BinaryReader(array);

        const tilesets: Tileset[] = [];
        while (reader.hasData()) {
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
                tiles.push(Tile.fromArray(decoded, i * 128));
            }
            tilesets.push(new Tileset(tiles, disk));
        }
        return new Tilesets(...tilesets);
    }

    /**
     * Reads tilesets from the given blob.
     *
     * @param blob  The ALLHTDS1 or ALLHTDS2 blob to read.
     * @return The read tilesets.
     */
    public static fromBlob(blob: Blob): Promise<Tilesets> {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();
                reader.onload = event => {
                    resolve(Tilesets.fromArray(new Uint8Array(reader.result as ArrayBuffer)));
                };
                reader.onerror = event => {
                    reject(new Error("Unable to read tilesets from blob: " + reader.error));
                };
                reader.readAsArrayBuffer(blob);
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * Reads tilesets from the two given arrays.
     *
     * @param array1  The array with the ALLHTDS1 file content.
     * @param array2  The array with the ALLHTDS2 file content.
     * @return The read tilesets.
     */
    public static fromArrays(array1: Uint8Array, array2: Uint8Array): Tilesets {
        return new Tilesets(...this.fromArray(array1).tilesets, ...this.fromArray(array2).tilesets);
    }

    /**
     * Reads tilesets from the two given blobs.
     *
     * @param blob1  The ALLHTDS1 blob to read.
     * @param blob2  The ALLHTDS2 blob to read
     * @return The read tilesets.
     */
    public static async fromBlobs(blob1: Blob, blob2: Blob): Promise<Tilesets> {
        return new Tilesets(
            ...(await this.fromBlob(blob1)).tilesets,
            ...(await this.fromBlob(blob2)).tilesets
        );
    }
}
