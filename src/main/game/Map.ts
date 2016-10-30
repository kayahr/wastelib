/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { BinaryReader } from "../io/BinaryReader";
import { ActionClassMap } from "./ActionClassMap";
import { ActionMap } from "./ActionMap";
import { TileMap } from "./TileMap";
import { CombatStringMap } from "./CombatStrings";
import { MapInfo } from "./MapInfo";
import { readStrings } from "../io/string";

function decrypt(data: Uint8Array, key: number): number {
    for (let i = 0, max = data.length; i < max; ++i) {
        data[i] ^= key;
        key = (key + 0x1f) & 0xff;
    }
    return key;
}

/**
 * Container for the tilesets of the two allhtds files.
 */
export class Map {
    private disk: number;
    private actionClassMap: ActionClassMap;
    private actionMap: ActionMap;
    private mapInfo: MapInfo;
    private combatStringMap: CombatStringMap;
    private strings: string[];
    private tileMap: TileMap;

    private constructor(disk: number, actionClassMap: ActionClassMap, actionMap: ActionMap, mapInfo: MapInfo,
            combatStringMap: CombatStringMap, strings: string[], tileMap: TileMap) {
        this.disk = disk;
        this.actionClassMap = actionClassMap;
        this.actionMap = actionMap;
        this.mapInfo = mapInfo;
        this.combatStringMap = combatStringMap;
        this.strings = strings;
        this.tileMap = tileMap;
    }

    public static fromArray(array: Uint8Array, offset: number, mapSize: number,
            tileMapOffset: number): Map {
        let reader = new BinaryReader(array, offset);

        // Read and validate the header
        const header = reader.readString(4);
        if (header !== "msq0" && header !== "msq1") {
            throw new Error("Invalid map header: " + header);
        }
        const disk = header.charCodeAt(0) - 48;

        // Initialize decryption key
        let key = reader.readUint8() ^ reader.readUint8();

        // We don't know the size of the encrypted data yet so we start by reading the fixed-size sections first
        // (Action class map, action map, central directory, map infos and combat string map
        const data1Size = mapSize * mapSize / 2 // Action class map size
            + mapSize * mapSize // Action map size
            + 42 // Central directory size
            + 13 // Map info size
            + 37; // Combat string map
        const data1 = reader.readUint8s(data1Size);
        key = decrypt(data1, key);
        reader = new BinaryReader(data1);

        // Read action class map and actions
        const actionClassMap = ActionClassMap.read(reader, mapSize);
        const actionMap = ActionMap.read(reader, mapSize);

        // Read central directory
        const stringsOffset = reader.readUint16();
        const monsterNamesOffset = reader.readUint16();
        const monsterDataOffset = reader.readUint16();
        const actionClassOffsets = reader.readUint16s(16);
        const specialsOffset = reader.readUint16();
        const npcOffset = reader.readUint16();

        // Read map info
        const mapInfo = MapInfo.read(reader);
        if (mapInfo.getMapSize() !== mapSize) {
            throw new Error("Map size mismatch: " + mapInfo.getMapSize() + " != " + mapSize);
        }

        // Read combat string map
        const combatStringMap = CombatStringMap.read(reader);

        // const stringsOffset = (data1[data1Size - 1] << 8) | data1[data1Size - 2];
        // const data2 = reader.readUint8s(stringsOffset - data1Size);
        // decrypt(data2, key);

        // Now we have the fixed size and the dynamic sized encrypted data and we can concatenate the two arrays
        // const data = new Uint8Array(data1.byteLength + data2.byteLength);
        // data.set(data1, 0);
        // data.set(data2, data1Size);

        // Read the strings
        const stringsSize = tileMapOffset - stringsOffset - 4 /* MSQ Header */ - 2 /* Enc header */ - 1 /* Unknown */;
        reader = new BinaryReader(array, offset + 6 + stringsOffset, stringsSize);
        const strings = readStrings(reader);
        // console.log(strings);

        // Read the tile map
        reader = new BinaryReader(array, offset + tileMapOffset, array.byteLength - offset - tileMapOffset);
        console.log(offset + tileMapOffset);
        const tileMap = TileMap.read(reader);
        if (tileMap.getMapSize() !== mapSize) {
            throw new Error("Tile map size mismatch: " + tileMap.getMapSize() + " != " + mapSize);
        }

        return new Map(disk, actionClassMap, actionMap, mapInfo, combatStringMap, strings, tileMap);
    }
}
