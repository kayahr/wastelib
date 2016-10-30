/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { BinaryReader } from "../io/BinaryReader";

export class MapInfo {
    private readonly unknown1: number;
    private readonly unknown2: number;
    private readonly mapSize: number;
    private readonly unknown3: number;
    private readonly unknown4: number;
    private readonly encounterFrequency: number;
    private readonly tileset: number;
    private readonly randomMonsterTypes: number;
    private readonly maxRandomEncounters: number;
    private readonly borderTile: number;
    private readonly timePerStep: number;
    private readonly healRate: number;

    private constructor(unknown1: number, unknown2: number, mapSize: number, unknown3: number, unknown4: number,
            encounterFrequency: number, tileset: number, randomMonsterTypes: number, maxRandomEncounters: number,
            borderTile: number, timePerStep: number, healRate: number) {
        this.unknown1 = unknown1;
        this.unknown2 = unknown2;
        this.mapSize = mapSize;
        this.unknown3 = unknown3;
        this.unknown4 = unknown4;
        this.encounterFrequency = encounterFrequency;
        this.tileset = tileset;
        this.randomMonsterTypes = randomMonsterTypes;
        this.maxRandomEncounters = maxRandomEncounters;
        this.borderTile = borderTile;
        this.timePerStep = timePerStep;
        this.healRate = healRate;
    }

    public static read(reader: BinaryReader): MapInfo {
        const unknown1 = reader.readUint8();
        const unknown2 = reader.readUint8();
        const mapSize = reader.readUint8();
        const unknown3 = reader.readUint8();
        const unknown4 = reader.readUint8();
        const encounterFrequency = reader.readUint8();
        const tileset = reader.readUint8();
        const randomMonsterTypes = reader.readUint8();
        const maxRandomEncounters = reader.readUint8();
        const borderTile = reader.readUint8();
        const timePerStep = reader.readUint16();
        const healRate = reader.readUint8();
        return new MapInfo(unknown1, unknown2, mapSize, unknown3, unknown4, encounterFrequency, tileset,
            randomMonsterTypes, maxRandomEncounters, borderTile, timePerStep, healRate);
    }

    public getMapSize(): number {
        return this.mapSize;
    }
}
