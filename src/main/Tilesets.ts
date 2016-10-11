/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { Tileset } from "./Tileset";
import { Tile } from "./Tile";
import { BinaryReader } from "./BinaryReader";
import { decodeHuffman } from "./huffman";

/**
 * Container for the tilesets of the two allhtds files.
 */
export class Tilesets {
    /** The tile sets. */
    private tilesets: Tileset[];

    /**
     * Creates a new tilesets container with the given tilesets.
     *
     * @parm chars
     *           The tilesets.
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
     * @param index
     *            The tileset index.
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
     * @param buffer
     *            The array to read the tilesets from.
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
     * Reads tilesets from the given file.
     *
     * @param file
     *            The file to read the tilesets from.
     * @return The read tilesets.
     */
    public static fromFile(file: File): Promise<Tilesets> {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();
                reader.onload = () => {
                    resolve(Tilesets.fromArray(new Uint8Array(reader.result)));
                };
                reader.onerror = () => {
                    reject(new Error("Unable to read tilesets from file " + file.name));
                };
                reader.readAsArrayBuffer(file);
            } catch (e) {
                reject(e);
            }
        });
    }

    public static fromFiles(file1: File, file2: File): Promise<Tilesets> {
        return Promise.all([this.fromFile(file1), this.fromFile(file2)]).then(tilesets => {
            return new Tilesets(...tilesets[0].tilesets, ...tilesets[1].tilesets);
        });
    }
}
