/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { BinaryReader } from "../io/BinaryReader";

/**
 * Various additional information about a game map.
 *
 * The map info block is located directly after the Central MSQ Directory. So for 64x64 maps its located at offset
 * 0x182A (0x1830 with the MSQ header) and for 32x32 maps its located at offset 0x062A (0x0630 with MSQ header).
 * The block is always 50 bytes long.
 *
 * @see http://wasteland.gamepedia.com/Map_Info
 */
export class MapInfo {
    private constructor(
        private readonly unknown$00: number,
        private readonly unknown$01: number,
        private readonly mapSize: number,
        private readonly unknown$03: number,
        private readonly unknown$04: number,
        private readonly encounterFrequency: number,
        private readonly tileset: number,
        private readonly randomMonsterTypes: number,
        private readonly maxRandomEncounters: number,
        private readonly borderTile: number,
        private readonly timePerStep: number,
        private readonly healRate: number,
        private readonly combatStringIDs: number[]
    ) {}

    /**
     * Reads map information from the given reader.
     *
     * @param reader  The reader to read the map information from
     * @return        The read map information.
     */
    public static read(reader: BinaryReader): MapInfo {
        const unknown$00 = reader.readUint8();
        const unknown$01 = reader.readUint8();
        const mapSize = reader.readUint8();
        const unknown$03 = reader.readUint8();
        const unknown$04 = reader.readUint8();
        const encounterFrequency = reader.readUint8();
        const tileset = reader.readUint8();
        const randomMonsterTypes = reader.readUint8();
        const maxRandomEncounters = reader.readUint8();
        const borderTile = reader.readUint8();
        const timePerStep = reader.readUint16();
        const healRate = reader.readUint8();
        const combatStringsIDs = Array.prototype.slice.call(reader.readUint8s(37));
        return new MapInfo(unknown$00, unknown$01, mapSize, unknown$03, unknown$04, encounterFrequency, tileset,
            randomMonsterTypes, maxRandomEncounters, borderTile, timePerStep, healRate, combatStringsIDs);
    }

    /**
     * Returns the map size. This is either 32 or 64.
     *
     * @return The map size (32 or 64).
     */
    public getMapSize(): number {
        return this.mapSize;
    }

    /**
     * Returns the random encounter frequency. If it's set to 0 then no random encounters occur. 1 means a random
     * encounter on every move. The higher the number the more seldom a random encounter occurs.
     *
     * @return The random encounter frequency.
     */
    public getEncounterFrequency(): number {
        return this.encounterFrequency;
    }

    /**
     * Returns the tileset to use to display the map. 0 means the first tileset in ALLHTDS1, 1 means the second in
     * ALLHTDS1, 4 is the first tileset in ALLHTDS2, 5 is the second and so on.
     *
     * @return The tileset to use to display the map.
     */
    public getTileset(): number {
        return this.tileset;
    }

    /**
     * Returns the number of used random monster types. If it's set to 1 then only the first monster defined in the
     * monster data of the map appears in random encounters. If set to 3 then the first three monsters can appear in
     * random encounters, and so on. This also makes clear that random encounter monsters always must be defined at
     * the top of the monster list.
     *
     * @return The number of used random monster types.
     */
    public getRandomMonsterTypes(): number {
        return this.randomMonsterTypes;
    }

    /**
     * Returns how many random encounters can be on the map at once. This means: When this is set to 2 and you run away
     * from an encounter then you may run into another encounter. But if you run away from this one, too, then you have
     * your freedom until you go back to the still unfinished random encounters and kill the monsters. This byte is
     * directly connected to the Random Encounter Data of action class 0x0F. If this byte is set to 3 then you need
     * three random encounter data blocks in the map.
     *
     * @return How many random encounters can be on the map at once.
     */
    public getMaxRandomEncounters(): number {
        return this.maxRandomEncounters;
    }

    /**
     * Returns the tile with which the frame around the map is filled. For the world map this is 31. Subtract 10 from
     * it (because tiles 0-9 are the 10 sprites from IC0_9.WLF) and you get 19. And if you take a look at the first
     * tileset in ALLHTDS1 you'll see that the tile with this id is a desert tile.
     *
     * @return The tile with which the frame aroudn the map is filled.
     */
    public getBorderTile(): number {
        return this.borderTile;
    }

    /**
     * Returns the time that passes when the user moves one square on the map (or presses the ESC key). Divide by
     * 256 to get the time in minutes. So 256 is one minute, 512 is two minutes, 128 is 30 seconds and so on.
     *
     * @return The time that passes on each step.
     */
    public getTimePerStep(): number {
        return this.timePerStep;
    }

    /**
     * Returns how quickly you heal over time (Divide 128 by this number to find the number of steps to heal 1 CON
     * point).
     *
     * @return How quickly you heal over time.
     */
    public getHealRate(): number {
        return this.healRate;
    }

    /**
     * Returns the string IDs for all the strings used during combat (like "x hits y" and "x is reduced to a red paste"
     * and so on).
     *
     * @return The combat string IDs.
     */
    public getCombatStringsIDs(): number[] {
        return this.combatStringIDs.slice();
    }

    /**
     * Returns the combat string ID with the given index.
     *
     * @param index  The combat string index.
     * @return       The combat string ID.
     */
    public getCombatStringID(index: number): number {
        if (index < 0 || index >= this.combatStringIDs.length) {
            throw new Error("Index out of bounds: " + index);
        }
        return this.combatStringIDs[index];
    }

    /**
     * Returns the unknown byte at offset 0x00 in the map info block. It is 0 in all maps.
     *
     * @return Unknown byte.
     */
    public getUnknown$00(): number {
        return this.unknown$00;
    }

    /**
     * Returns the unknown byte at offset 0x01 in the map info block. It is 0 in all maps.
     *
     * @return Unknown byte.
     */
    public getUnknown$01(): number {
        return this.unknown$01;
    }

    /**
     * Returns the unknown byte at offset 0x03 in the map info block.
     *
     * @return Unknown byte.
     */
    public getUnknown$03(): number {
        return this.unknown$03;
    }

    /**
     * Returns the unknown byte at offset 0x04 in the map info block.
     *
     * @return Unknown byte.
     */
    public getUnknown$04(): number {
        return this.unknown$04;
    }
}
