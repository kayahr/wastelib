/*
 * Copyright (c) 2016 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import { unpackExe } from "./exepack.ts";
import { readStrings } from "../io/string.ts";
import { BinaryReader } from "../io/BinaryReader.ts";
import { Skill } from "./Skill.ts";

/** The offset of segment 2 in the unpacked WL.EXE file. */
const SEG2 = 0xd020;

/**
 * Provides information from the WL.EXE file.
 *
 * @see https://wasteland.fandom.com/wiki/WL.EXE
 * @see https://wasteland.fandom.com/wiki/WL.EXE_seg002
 */
export class Exe {
    /** The intro strings. */
    readonly #introStrings: string[];

    /** Various unsorted strings. */
    readonly #messageStrings: string[];

    /** Various strings mostly used in inventory, skills and attribute screens. */
    readonly #inventoryStrings: string[];

    /** Character creation strings. */
    readonly #characterCreationStrings: string[];

    /** Promotion strings. */
    readonly #promotionStrings: string[];

    /** Library strings. */
    readonly #libraryStrings: string[];

    /** Shop strings. */
    readonly #shopStrings: string[];

    /** Infirmary strings. */
    readonly #infirmaryStrings: string[];

    /** Ending strings. */
    readonly #endingStrings: string[];

    /** The map sizes of the maps in the two GAME files. */
    readonly #mapSizes: Uint8Array;

    /** The map offsets of the maps in the two GAME files. */
    readonly #mapOffsets: Uint32Array;

    /** The mapping from location index to disk+map index. */
    readonly #locationMapping: Uint8Array;

    /** The offsets to the tile maps. */
    readonly #tileMapOffsets: Uint16Array;

    /** The offsets of the save games in the two GAME files. */
    readonly #savegameOffsets: number[];

    /** The offsets of the five shop lists in the two GAME files (0-3 in GAME1, 4 in GAME2, 3 is not used in game and actually does not exist in GAME1). */
    readonly #shopItemListOffsets: number[];

    /** The portrait indices in ALLPICS1. */
    readonly #portraitIndices1: Uint8Array;

    /** The portrait indices in ALLPICS2. */
    readonly #portraitIndices2: Uint8Array;

    /** The cumulative tileset offsets across ALLHTDS1 and ALLHTDS2. */
    readonly #tilesetOffsets: Uint32Array;

    /** The compressed sizes of the tilesets in ALLHTDS1 and ALLHTDS2. */
    readonly #tilesetSizes: Uint16Array;

    /** The list of skills. */
    readonly #skills: Skill[];

    /**
     * Creates a new Exe information object from the given packed EXE content.
     *
     * @param data - The content of the WL.EXE file. Maybe compressed with EXEPACK.
     */
    private constructor(data: Uint8Array) {
        const expectedExeSize = 169824;
        const unpacked = data.length === expectedExeSize ? data : unpackExe(data);
        const exeSize = unpacked.length;
        if (exeSize !== expectedExeSize) {
            throw new Error(`Expected unpacked EXE of size ${expectedExeSize} but got ${exeSize}`);
        }

        // Decode global strings
        this.#introStrings = readStrings(new BinaryReader(unpacked, SEG2 + 0xa703, 527));
        this.#messageStrings = readStrings(new BinaryReader(unpacked, SEG2 + 0xab3e, 1661));
        this.#inventoryStrings = readStrings(new BinaryReader(unpacked, SEG2 + 0xb270, 1845));
        this.#characterCreationStrings = readStrings(new BinaryReader(unpacked, SEG2 + 0xce4B, 210));
        this.#promotionStrings = readStrings(new BinaryReader(unpacked, SEG2 + 0xd622, 1136));
        this.#libraryStrings = readStrings(new BinaryReader(unpacked, SEG2 + 0xdacc, 277));
        this.#shopStrings = readStrings(new BinaryReader(unpacked, SEG2 + 0xdbf8, 229));
        this.#infirmaryStrings = readStrings(new BinaryReader(unpacked, SEG2 + 0xdced, 369));
        this.#endingStrings = readStrings(new BinaryReader(unpacked, SEG2 + 0xd18e, 0x295));

        // Read the map sizes of the maps in the two GAME files.
        this.#mapSizes = unpacked.slice(SEG2 + 0xbf1c, SEG2 + 0xbf1c + 50);

        // Read the map offsets of the maps in the two GAME files.
        this.#mapOffsets = new Uint32Array(unpacked.slice(SEG2 + 0xbc7a, SEG2 + 0xbc7a + 42 * 4).buffer);

        // Read the location to disk+map mapping
        this.#locationMapping = unpacked.slice(SEG2 + 0xbec9, SEG2 + 0xbec9 + 50);

        // Read the offsets to the tile maps
        this.#tileMapOffsets = new Uint16Array(unpacked.slice(SEG2 + 0xbd22, SEG2 + 0xbd22 + 50 * 2).buffer);

        // Read the offsets of the two savegame blocks in the two GAME files
        this.#savegameOffsets = [
            new BinaryReader(unpacked, 0x880c, 2).readUint16() + (new BinaryReader(unpacked, 0x880f, 2).readUint16() << 16),
            new BinaryReader(unpacked, 0x8819, 2).readUint16() + (new BinaryReader(unpacked, 0x881c, 2).readUint16() << 16)
        ];

        // Read the save game size (needed to calculate shop item list offsets)
        const savegameSize = new BinaryReader(unpacked, 0x8820, 2).readUint16()

        // Read the offsets of the four shop item lists (lists 0-2 are in GAME1, list 3 is in GAME2)
        this.#shopItemListOffsets = [
            ...Array.from(new Uint16Array(unpacked.slice(SEG2 + 0xbe20, SEG2 + 0xbe20 + 4 * 2).buffer)),
            0
        ].map((offset, index) => this.#savegameOffsets[index < 4 ? 0 : 1] + savegameSize + offset);

        // Read portrait index mapping
        this.#portraitIndices1 = unpacked.slice(SEG2 + 0xbe2a, SEG2 + 0xbe2a + 80);
        this.#portraitIndices2 = unpacked.slice(SEG2 + 0xbe7a, SEG2 + 0xbe7a + 80);

        // Read tileset offsets and compressed sizes
        this.#tilesetOffsets = new Uint32Array(unpacked.slice(SEG2 + 0xbdfc, SEG2 + 0xbdfc + 9 * 4).buffer);
        this.#tilesetSizes = new Uint16Array(unpacked.slice(SEG2 + 0xbdea, SEG2 + 0xbdea + 9 * 2).buffer);

        // Read skill list
        const skills: Skill[] = [];
        for (let id = 1; id < 36; id++) {
            const offset = 0x18A40 + id * 2
            const b0 = unpacked[offset];
            const b1 = unpacked[offset + 1];
            skills.push(new Skill(
                id,
                this.#inventoryStrings[id],
                b0 >> 3,
                b0 & 0x07,
                b1 - 0xe
            ));
        }
        this.#skills = skills;
    }

    /**
     * Parses a WL.exe file and returns the information from it.
     *
     * @param data - The array containing the packed content of the WL.EXE file.
     * @returns The parsed information from the exe file.
     */
    public static fromArray(data: Uint8Array): Exe {
        return new Exe(data);
    }

    /**
     * Reads information from the given WL.EXE blob and returns it.
     *
     * @param blob - The WL.EXE blob.
     * @returns The exe information.
     */
    public static async fromBlob(blob: Blob): Promise<Exe> {
        return Exe.fromArray(new Uint8Array(await blob.arrayBuffer()));
    }

    /**
     * Returns the intro strings. They are used in the title of the game and contain the copyright message and
     * the small introduction before the game starts.
     *
     * @returns The intro strings.
     */
    public getIntroStrings(): string[] {
        return this.#introStrings.slice();
    }

    /**
     * Returns various unsorted strings like some encounter messages, loot messages, weapon reloading and more.
     *
     * @returns Various unsorted strings.
     */
    public getMessageStrings(): string[] {
        return this.#messageStrings.slice();
    }

    /**
     * Returns various strings which mostly have something to do with the players inventory but also contains
     * strings for skills and attributes.
     *
     * @returns Various strings mostly used in inventory, skills and attribute screens.
     */
    public getInventoryStrings(): string[] {
        return this.#inventoryStrings.slice();
    }

    /**
     * Returns the strings used during character creation.
     *
     * @returns Character creation strings.
     */
    public getCharacterCreationStrings(): string[] {
        return this.#characterCreationStrings.slice();
    }

    /**
     * @returns Strings used during promotions.
     */
    public getPromotionStrings(): string[] {
        return this.#promotionStrings.slice();
    }

    /**
     * @returns Strings used in libraries.
     */
    public getLibraryStrings(): string[] {
        return this.#libraryStrings.slice();
    }

    /**
     * @returns Strings used in shops.
     */
    public getShopStrings(): string[] {
        return this.#shopStrings.slice();
    }

    /**
     * @returns Strings used in infirmaries.
     */
    public getInfirmaryStrings(): string[] {
        return this.#infirmaryStrings.slice();
    }

    /**
     * @returns Strings used in the ending sequence.
     */
    public getEndingStrings(): string[] {
        return this.#endingStrings.slice();
    }

    /**
     * Returns the map size of the given map. This information is needed to load a map because the maps itself
     * do not know their size until the map info is read which is only available AFTER the map data has been parsed.
     *
     * @param disk - The disk index (0 or 1).
     * @param map  - The map index (0-19 for disk 0 and 0-21 for disk 1).
     * @returns The map size.
     */
    public getMapSize(disk: number, map: number): number {
        return this.#mapSizes[this.getLocation(disk, map)];
    }

    /**
     * Returns the offset from the beginning of the huffman compressed tile map within the map data. This information
     * is needed to load a map because the maps itself do not know where the tile map section begins.
     *
     * @param disk - The disk index (0 or 1).
     * @param map  - The map index (0-19 for disk 0 and 0-21 for disk 1).
     * @returns The tile map offset.
     */
    public getTileMapOffset(disk: number, map: number): number {
        return this.#tileMapOffsets[this.getLocation(disk, map)];
    }

    /**
     * Returns the map offset of the given map.
     *
     * @param disk - The disk index (0 or 1).
     * @param map  - The map index (0-19 for disk 0 and 0-21 for disk 1).
     * @returns The map offset.
     */
    public getMapOffset(disk: number, map: number): number {
        return this.#mapOffsets[disk * 20 + map];
    }

    /**
     * Returns the location index of the given map.
     *
     * @param disk - The disk index (0 or 1).
     * @param map  - The map index (0-19 for disk 0 and 0-21 for disk 1)
     * @returns The location index (0-49)
     */
    public getLocation(disk: number, map: number): number {
        return this.#locationMapping.indexOf((disk + 1 ^ 3) << 6 | map);
    }

    /**
     * Returns the disk index of the specified location.
     *
     * @param location - The location (0-49, but there are also invalid locations within this range).
     * @returns The disk index (0 or 1).
     */
    public getLocationDisk(location: number): number {
        const value = this.#locationMapping[location] >> 6;
        if (!value) {
            throw new Error(`Invalid location: ${location}`);
        }
        return (value ^ 3) - 1;
    }

    /**
     * Returns the map index of the specified location.
     *
     * @param location - The location index (0-49, but there are also invalid locations within this range).
     * @returns The map index (0-19 for disk 0 and 0-21 for disk 1).
     * @throws {@link !RangeError} if the location index is invalid.
     */
    public getLocationMap(location: number): number {
        const value = this.#locationMapping[location];
        if (!value) {
            throw new Error(`Invalid location: ${location}`);
        }
        return value & 0x3f;
    }

    /**
     * Returns the offset of the savegame data in either GAME1 or GAME2.
     *
     * @param disk - The disk index (0 for GAME1, 1 for GAME2).
     * @returns The savegame offset
     */
    public getSavegameOffset(disk: number): number {
        return this.#savegameOffsets[disk];
    }

    /**
     * Returns the shop item list offset in GAME1 or GAME2 for the specified shop number.
     *
     * @param shop - The shop number (0-3 in GAME1, 4 in GAME2, 3 is actually invalid because it does not exist and is not used in the game).
     * @returns The shop item list offset
     */
    public getShopItemListOffset(shop: number): number {
        return this.#shopItemListOffsets[shop];
    }

    /**
     * Returns the portrait index in ALLPICS1 (when disk is 0) or ALLPICS2 (when disk is 1) for the given portrait ID.
     *
     * @param disk       - This disk index (0 for GAME1, 1 for GAME2).
     * @param portraitId - The portrait ID as used in the game files.
     * @returns The portrait index in ALLPICS1 or ALLPICS2 (depending on disk parameter).
     */
    public getPortraitIndex(disk: number, portraitId: number): number {
        const index = (disk === 0 ? this.#portraitIndices1 : this.#portraitIndices2)[portraitId];
        if (index == null || index === 0x80) {
            throw new Error(`No portrait index found for disk ${disk} and portrait ID ${portraitId})`);
        }
        return index;
    }

    /**
     * Returns the tileset offset within the corresponding ALLHTDS file for the given tileset ID.
     *
     * @param tilesetId - The global tileset ID (0-8).
     * @returns The tileset offset within ALLHTDS1 or ALLHTDS2.
     */
    public getTilesetOffset(tilesetId: number): number {
        tilesetId = this.#validateTilesetId(tilesetId);
        const offset = this.#tilesetOffsets[tilesetId];
        return tilesetId < 4 ? offset : offset - this.#tilesetOffsets[4];
    }

    /**
     * Returns the disk number of the given tileset ID.
     *
     * @param tilesetId - The global tileset ID (0-8).
     * @returns 0 for ALLHTDS1 and 1 for ALLHTDS2.
     */
    public getTilesetDisk(tilesetId: number): number {
        this.#validateTilesetId(tilesetId);
        return tilesetId < 4 ? 0 : 1;
    }

    /**
     * Returns the compressed tileset size for the given tileset ID.
     *
     * @param tilesetId - The global tileset ID (0-8).
     * @returns The compressed tileset size in bytes.
     */
    public getTilesetSize(tilesetId: number): number {
        return this.#tilesetSizes[this.#validateTilesetId(tilesetId)];
    }

    /**
     * Returns the skill list. Note that the indices in the returned array are zero-based while skill IDs are one-based. So if you need to access
     * skill 2 for example then you have to access `skills[1]`.
     *
     * @returns The skill list.
     */
    public getSkills(): Skill[] {
        return this.#skills.slice();
    }

    /**
     * Validates the given tileset ID.
     *
     * @param tilesetId - The tileset ID to validate.
     * @returns The validated tileset ID.
     * @throws {@link !RangeError} if the tileset ID is invalid.
     */
    #validateTilesetId(tilesetId: number): number {
        if (tilesetId < 0 || tilesetId >= this.#tilesetOffsets.length) {
            throw new RangeError(`Invalid tileset ID: ${tilesetId}`);
        }
        return tilesetId;
    }
}
