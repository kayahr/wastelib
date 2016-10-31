/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { BinaryReader } from "../io/BinaryReader";
import { MapTile } from "./MapTile";
import { MapInfo } from "./MapInfo";
import { readStrings } from "../io/string";
import { decodeHuffman } from "../io/huffman";
import { Mob } from "./Mob";
import { Character } from "./Character";

/**
 * Container for a single map from on of the GAME files.
 *
 * @see http://wasteland.gamepedia.com/GameX
 */
export class Map {
    private constructor(
        private disk: number,
        private info: MapInfo,
        private npcs: Character[],
        private mobs: Mob[],
        private strings: string[],
        private tiles: MapTile[][],
        private unknown$strings: number,
        private unknown$tilemap: number
    ) {}

    /**
     * Reads a game map from the given array and offset. Unforunately maps are not completely self-contained and
     * some information from the Exe file (map size and tile map offset address) is needed in order to read the
     * map. You can get this data from the [[Exe]] class.
     *
     * @param array          The array to read the map from. This is usually the content of the file GAME1 or GAME2.
     * @param offset         The offset in the array where the map data starts.
     * @param mapSize        The size of the map to read. This is 32 for a 32x32 map or 64 for a 64x64 map.
     *                       This information can be read from the [[Exe.getMapSize]]() method.
     * @param tileMapOffset  The offset to the beginning of the tile map in the map data. This information ca be read
     *                       from the [[Exe.getTileMapOffset]]() method.
     * @return The read game map.
     */
    public static fromArray(array: Uint8Array, offset: number, mapSize: number, tileMapOffset: number): Map {
        let reader = new BinaryReader(array, offset);

        // Read and validate the header
        const header = reader.readString(4);
        if (header !== "msq0" && header !== "msq1") {
            throw new Error("Invalid map header: " + header);
        }
        const disk = header.charCodeAt(0) - 48;

        // Read and decrypt the map data up to the tile map offset. This includes the strings section which is
        // not encrypted but the decrypt algorithm automatically stops right before it.
        const enc1 = reader.readUint8();
        const enc2 = reader.readUint8();
        const data = reader.readUint8s(tileMapOffset - 4 - 2 - 1); // 4=MSQ header, 2=Encryption key, 1=Unknown
        let key = enc1 ^ enc2;
        const endChecksum = (enc2 << 8) | enc1;
        let checksum = 0;
        let i = 0;
        while (checksum !== endChecksum) {
            const decrypted = data[i] ^= key;
            checksum = (checksum - decrypted) & 0xffff;
            key = (key + 0x1f) & 0xff;
            i++;
        }

        // Read unknown byte between strings and tile map header
        const unknown$strings = reader.readUint8();

        // Read the tile map (And the unknown integer between header and compressed data)
        const tileMapSize = reader.readUint32();
        if (tileMapSize !== mapSize ** 2) {
            throw new Error("Invalid tile map size: " + tileMapSize);
        }
        const unknown$tilemap = reader.readUint32();
        const tileMap = decodeHuffman(reader, tileMapSize);

        // Form here on we read stuff from the decrypted data block
        reader = new BinaryReader(data);

        // Read action class map and actions
        const actionClassMap = reader.readUint8s(mapSize ** 2 >> 1);
        const actionMap = reader.readUint8s(mapSize ** 2);

        // Read central directory
        const stringsOffset = reader.readUint16();
        const mobNamesOffset = reader.readUint16();
        const mobDataOffset = reader.readUint16();
        const actionClassOffsets = reader.readUint16s(16);
        const specialsOffset = reader.readUint16();
        const npcOffset = reader.readUint16();

        // Read map info
        const mapInfo = MapInfo.read(reader);
        if (mapInfo.getMapSize() !== mapSize) {
            throw new Error("Map size mismatch: " + mapInfo.getMapSize() + " != " + mapSize);
        }

        // Read NPC pointers until the lowest pointer is reached. First pointer must always be 0. If it is not
        // then the map has no NPCs.
        reader.seek(npcOffset);
        const npcPointers: number[] = [];
        if (reader.readUint16() === 0) {
            let firstNpcPointer = NaN;
            do {
                const npcPointer = reader.readUint16();
                npcPointers.push(npcPointer);
                if (!(firstNpcPointer < npcPointer)) {
                    firstNpcPointer = npcPointer;
                }
            } while (reader.getByteIndex() < firstNpcPointer);
        }

        // Read NPCs
        const npcs = npcPointers.map(pointer => Character.read(reader.seek(pointer)));
        console.log(npcs);

        // Read mob data
        const numMobs = (stringsOffset - mobDataOffset) >> 3;
        reader.seek(mobNamesOffset);
        const mobNames = reader.readNullStrings(numMobs);
        reader.seek(mobDataOffset);
        const mobs = mobNames.map(name => Mob.read(reader, name));

        // Read the strings
        reader.seek(stringsOffset);
        const strings = readStrings(reader);

        // Join action class map, action map and tile map into a user-friendly structure
        const mapTiles: MapTile[][] = [];
        for (let y = 0, i = 0; y < mapSize; ++y, ++i) {
            const row: MapTile[] = [];
            for (let x = 0; x < mapSize; ++x) {
                const actionClass = x & 1 ? (actionClassMap[i >> 1] & 0xf) : (actionClassMap[i >> 1] >> 4);
                row[x] = new MapTile(actionClass, actionMap[i], tileMap[i]);
            }
            mapTiles.push(row);
        }

        return new Map(disk, mapInfo, npcs, mobs, strings, mapTiles, unknown$strings, unknown$tilemap);
    }

    /**
     * Returns the number of the disk this map belongs to.
     *
     * @return The disk number.
     */
    public getDisk(): number {
        return this.disk;
    }

    /**
     * Returns information about the map.
     *
     * @return The map information.
     */
    public getInfo(): MapInfo {
        return this.info;
    }

    /**
     * Returns the string with the given index.
     *
     * @param index  The string index.
     * @return       The string
     */
    public getString(index: number): string {
        if (index < 0 || index >= this.strings.length) {
            throw new Error("Index out of bounds: " + index);
        }
        return this.strings[index];
    }

    /**
     * Returns the number of strings in this map.
     *
     * @return The number of strings.
     */
    public getNumStrings(): number {
        return this.strings.length;
    }

    /**
     * Returns all strings defined in this map.
     *
     * @return All map strings.
     */
    public getStrings(): string[] {
        return this.strings.slice();
    }

    /**
     * Returns the mob with the given index.
     *
     * @param index  The mob index.
     * @return       The mob.
     */
    public getMob(index: number): Mob {
        if (index < 0 || index >= this.mobs.length) {
            throw new Error("Index out of bounds: " + index);
        }
        return this.mobs[index];
    }

    /**
     * Returns the number of mobs in this map.
     *
     * @return The number of mobs.
     */
    public getNumMobs(): number {
        return this.mobs.length;
    }

    /**
     * Returns all mobs defined in this map.
     *
     * @return All mobs.
     */
    public getMobs(): Mob[] {
        return this.mobs.slice();
    }

    /**
     * Returns the NPC with the given index.
     *
     * @param index  The NPC index.
     * @return       The NPC.
     */
    public getNPC(index: number): Character {
        if (index < 0 || index >= this.npcs.length) {
            throw new Error("Index out of bounds: " + index);
        }
        return this.npcs[index];
    }

    /**
     * Returns the number of NPCs in this map.
     *
     * @return The number of NPCs.
     */
    public getNumNPcs(): number {
        return this.npcs.length;
    }

    /**
     * Returns all NPCs defined in this map.
     *
     * @return All NPCs.
     */
    public getNPCs(): Character[] {
        return this.npcs.slice();
    }

    /**
     * Returns the map tile at the given position.
     *
     * @param x  The horizontal position on the map.
     * @param y  The vertical position on the map.
     * @return   The map tile.
     */
    public getTile(x: number, y: number): MapTile {
        const mapSize = this.info.getMapSize();
        if (x < 0 || x >= mapSize || y < 0 || y >= mapSize) {
            throw new Error("Invalid X position: " + x + "/" + y);
        }
        return this.tiles[y][x];
    }

    /**
     * Returns the unknown byte between the strings and the header of the compressed tile map.
     *
     * @return The unknown data.
     */
    public getUnknown$strings(): number {
        return this.unknown$strings;
    }

    /**
     * Returns the unknown 32 bit value between the huffman compressed tilemap data and the 32 bit value before
     * it which contains the uncompressed size of the compressed data.
     *
     * @return The unknown data.
     */
    public getUnknown$tilemap(): number {
        return this.unknown$tilemap;
    }
}
