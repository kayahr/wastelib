/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { BinaryReader } from "../io/BinaryReader";
import { decodeHuffman } from "../io/huffman";

export class TileMap {
    private mapSize: number;

    private constructor(mapSize: number) {
        this.mapSize = mapSize;
    }

    public static read(reader: BinaryReader): TileMap {
        const size = reader.readUint32();
        const mapSize = Math.sqrt(size);
        if (mapSize !== 64 && mapSize !== 32) {
            throw new Error("Invalid map size: " + mapSize);
        }
        console.log(reader.readUint32());
        const data = decodeHuffman(reader, size);
        for (let y = 0; y < mapSize; y++) {
            let s = "";
            for (let x = 0; x < mapSize; x++) {
                s += (("0" + (data[y * mapSize + x].toString(16))).substr(-2)).replace("00", "..");
            }
            console.log(s);
        }
        return new TileMap(mapSize);
    }

    public getMapSize(): number {
        return this.mapSize;
    }
}
