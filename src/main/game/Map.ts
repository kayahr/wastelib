/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { InputStream } from "../io/InputStream";
import { LimitInputStream } from "../io/LimitInputStream";
import { ArrayInputStream } from "../io/ArrayInputStream";
import { BinaryReader } from "../io/BinaryReader";
import { DataReader } from "../io/DataReader";
import { DecryptStream } from "./DecryptStream";
import { fromCharCodes } from "../io/string";
import { ActionClass } from "./ActionClass";
import { ActionClassMap } from "./ActionClassMap";
import { ActionMap } from "./ActionMap";
import { TileMap } from "./TileMap";
import { CombatStringsMap } from "./CombatStrings";
import { readStrings } from "../io/string";

/**
 * Container for the tilesets of the two allhtds files.
 */
export class Map {
    private disk: number;

    /**
     * Creates a new tilesets container with the given tilesets.
     *
     * @param chars  The tilesets.
     */
    public constructor(disk: number) {
        this.disk = disk;
    }

    public static fromStream(stream: InputStream, mapSize: number, tileMapOffset: number): Map {
        const reader = new DataReader(stream);

        // Read MSQ header
        const msq = reader.readString(3);
        if (msq !== "msq") {
            throw new Error("Invalid msq identifier: " + msq);
        }
        const diskChar = reader.readChar();
        if (diskChar !== "0" && diskChar !== "1") {
            throw new Error("Invalid msq disk number: " + diskChar);
        }
        const disk = diskChar.charCodeAt(0) - 48;

        // Everything up to the strings is encrypted so we read this stuff from a decrypt stream
        const decryptStream = new DecryptStream(stream);
        const base = stream.getPosition();

        // Read action class map and actions
        const actionClassMap = ActionClassMap.fromStream(decryptStream, mapSize);
        const actionMap = ActionMap.fromStream(decryptStream, mapSize);

        // Read the offsets to other sections of the map
        const decryptReader = new DataReader(decryptStream);
        const stringsOffset = decryptReader.readUint16();
        const monsterNamesOffset = decryptReader.readUint16();
        const monsterDataOffset = decryptReader.readUint16();
        const actionClassOffsets = decryptReader.readUint16s(16);
        const specialsOffset = decryptReader.readUint16();
        const npcOffset = decryptReader.readUint16();

        // Next two bytes are unknown, so we skip it
        decryptStream.skip(2);

        // Read the map size. We already know it so we just use it for validation
        const realMapSize = decryptReader.readUint8();
        if (realMapSize !== mapSize) {
            throw new Error("Map size mismatch: " + realMapSize + " != " + mapSize);
        }

        // Skip two more unknown bytes
        decryptStream.skip(2);

        // Read various global map information
        const encounterFrequency = decryptReader.readUint8();
        const tileset = decryptReader.readUint8();
        const randomMonsterTypes = decryptReader.readUint8();
        const maxRandomEncounters = decryptReader.readUint8();
        const borderTile = decryptReader.readUint8();
        const timePerStep = decryptReader.readUint16();
        const healRate = decryptReader.readUint8();

        console.log("Enc Freq:", encounterFrequency);
        console.log("Tileset:", tileset);
        console.log("Random Monster Types:", randomMonsterTypes);
        console.log("Max Random Encounters:", maxRandomEncounters);
        console.log("borderTile:", borderTile);
        console.log("Time per step:", timePerStep);
        console.log("Heal Time:", healRate);

        const combatStringMap = CombatStringsMap.fromStream(decryptStream);

        // Read strings (Not encrypted)
        stream.seek(base + stringsOffset);
        const stringsSize = tileMapOffset - stringsOffset - 4 /* MSQ Header */ - 2 /* Enc header */ - 1 /* Unknown */;
        const strings = readStrings(new LimitInputStream(stream, stringsSize));

        // Unknown byte between strings and tile map
        stream.skip();

        // Read tile map (Not encrypted, but huffman compressed)
        const tileMap = TileMap.fromStream(stream);

        return new Map(disk);
    }

    public getDisk(): number {
        return this.disk;
    }
}

import * as fs from "fs";
import { Exe } from "../exe/Exe";
const exe = Exe.fromArray(fs.readFileSync("/home/k/.steam/steam/SteamApps/common/Wasteland/rom/WL.EXE"));
for (let g = 0; g < 2; g++) {
    const data = fs.readFileSync("/home/k/.steam/steam/SteamApps/common/Wasteland/rom/data/GAME" + (g + 1));
    for (let i = 0; i < (g ? 22 : 20); i++) {
        const offset = exe.getMapOffset(g, i);
        const tileMapOffset = exe.getTileMapOffset(g, i);
        const size = exe.getMapSize(g, i);
        console.log("=== Disk " + g + " Map " + i + " === " + offset);
        const map = Map.fromStream(new ArrayInputStream(data, offset), size, tileMapOffset);
    }
}
