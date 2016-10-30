/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { unpackExe } from "./exepack";
import { readStrings } from "../io/string";
import { BinaryReader } from "../io/BinaryReader";

/** The offset of segment 2 in the unpacked WL.EXE file. */
const SEG2 = 0xd020;

/**
 * Provides information from the WL.EXE file.
 */
export class Exe {
    /** The intro strings. */
    private readonly introStrings: string[];

    /** Various unsorted strings. */
    private readonly messageStrings: string[];

    /** Various strings mostly used in inventory, skills and attribute screens. */
    private readonly inventoryStrings: string[];

    /** Character creation strings. */
    private readonly characterCreationStrings: string[];

    /** Promition strings. */
    private readonly promotionStrings: string[];

    /** Library strings. */
    private readonly libraryStrings: string[];

    /** Shop strings. */
    private readonly shopStrings: string[];

    /** Infirmary strings. */
    private readonly infirmaryStrings: string[];

    /** The map sizes of the maps in the two GAME files. */
    private readonly mapSizes: Uint8Array;

    /** The map offsets of the maps in the two GAME files. */
    private readonly mapOffsets: Uint32Array;

    /** The mapping from location index to disk+map index. */
    private readonly locationMapping: Uint8Array;

    /** The offsets to the tile maps. */
    private readonly tileMapOffsets: Uint16Array;

    /**
     * Creates a new Exe information object from the given packed EXE content.
     *
     * @param data  The packed content of the WL.EXE file.
     */
    private constructor(data: Uint8Array) {
        const unpacked = unpackExe(data);

        // Decode global strings
        this.introStrings = readStrings(new BinaryReader(unpacked, SEG2 + 0xa703, 527));
        this.messageStrings = readStrings(new BinaryReader(unpacked, SEG2 + 0xab3e, 1661));
        this.inventoryStrings = readStrings(new BinaryReader(unpacked, SEG2 + 0xb270, 1845));
        this.characterCreationStrings = readStrings(new BinaryReader(unpacked, SEG2 + 0xce4B, 210));
        this.promotionStrings = readStrings(new BinaryReader(unpacked, SEG2 + 0xd622, 1136));
        this.libraryStrings = readStrings(new BinaryReader(unpacked, SEG2 + 0xdacc, 277));
        this.shopStrings = readStrings(new BinaryReader(unpacked, SEG2 + 0xdbf8, 229));
        this.infirmaryStrings = readStrings(new BinaryReader(unpacked, SEG2 + 0xdced, 369));

        // Read the map sizes of the maps in the two GAME files.
        this.mapSizes = unpacked.slice(SEG2 + 0xbf1c, SEG2 + 0xbf1c + 50);

        // Read the map offsets of the maps in the two GAME files.
        this.mapOffsets = new Uint32Array(unpacked.slice(SEG2 + 0xbc7a, SEG2 + 0xbc7a + 42 * 4).buffer);

        // Read the location to disk+map mapping
        this.locationMapping = unpacked.slice(SEG2 + 0xbec9, SEG2 + 0xbec9 + 50);

        // Read the offsets to the tile maps
        this.tileMapOffsets = new Uint16Array(unpacked.slice(SEG2 + 0xbd22, SEG2 + 0xbd22 + 50 * 2).buffer);
    }

    /**
     * Parses a WL.exe file and returns the information from it.
     *
     * @param data  The array containing the packed content of the WL.EXE file.
     * @return The parsed information from the exe file.
     */
    public static fromArray(data: Uint8Array): Exe {
        return new Exe(data);
    }

    /**
     * Reads information from the given WL.EXE blob and returns it.
     *
     * @param blob  The WL.EXE blob.
     * @return The exe information.
     */
    public static fromBlob(blob: Blob): Promise<Exe> {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();
                reader.onload = event => {
                    resolve(Exe.fromArray(new Uint8Array(reader.result)));
                };
                reader.onerror = event => {
                    reject(new Error("Unable to read WL.EXE: " + reader.error));
                };
                reader.readAsArrayBuffer(blob);
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * Returns the intro strings. They are used in the title of the game and contain the copyight message and
     * the small introduction befor ethe game starts.
     *
     * @return The intro strings.
     */
    public getIntroStrings(): string[] {
        return this.introStrings;
    }

    /**
     * Returns various unsorted strings like some encounter messages, loot messages, weapon reloading and more.
     *
     * @return Various unsorted strings.
     */
    public getMessageStrings(): string[] {
        return this.messageStrings;
    }

    /**
     * Returns various strings which mostly have something to do with the players inventory but also contains
     * strings for skills and attributes.
     *
     * @return Various strings mostly used in inventory, skills and attribute screens.
     */
    public getInventoryStrings(): string[] {
        return this.inventoryStrings;
    }

    /**
     * Returns the strings used during character creation.
     *
     * @return Character creation strings.
     */
    public getCharacterCreationStrings(): string[] {
        return this.characterCreationStrings;
    }

    /**
     * Returns strings used during promitions.
     *
     * @return Promition strings.
     */
    public getPromotionStrings(): string[] {
        return this.promotionStrings;
    }

    /**
     * Returns strings used in libraries.
     *
     * @return Library strings.
     */
    public getLibraryStrings(): string[] {
        return this.libraryStrings;
    }

    /**
     * Returns strings used in shops.
     *
     * @return Shop strings.
     */
    public getShopStrings(): string[] {
        return this.shopStrings;
    }

    /**
     * Returns strings used in infirmaries.
     *
     * @return Infirmary strings.
     */
    public getInfirmaryStrings(): string[] {
        return this.infirmaryStrings;
    }

    /**
     * Returns the map size of the given map. This information is needed to load a map because the maps itself
     * do not know their size until the map info is read which is only available AFTER the map data has been parsed.
     *
     * @param disk  The disk index (0 or 1).
     * @param map   The map index (0-19 for disk 0 and 0-21 for disk 1).
     * @return The map size.
     */
    public getMapSize(disk: number, map: number) {
        return this.mapSizes[this.getLocation(disk, map)];
    }

    /**
     * Returns the offset from the beginning of the huffman compressed tile map within the map data. This information
     * is needed to load a map because the maps itself do not know where the tile map section begins.
     *
     * @param disk  The disk index (0 or 1).
     * @param map   The map index (0-19 for disk 0 and 0-21 for disk 1).
     * @return The tile map offset.
     */
    public getTileMapOffset(disk: number, map: number) {
        return this.tileMapOffsets[this.getLocation(disk, map)];
    }

    /**
     * Returns the map offset of the given map.
     *
     * @param disk  The disk index (0 or 1).
     * @param map   The map index (0-19 for disk 0 and 0-21 for disk 1).
     * @return The map offset.
     */
    public getMapOffset(disk: number, map: number) {
        return this.mapOffsets[disk * 20 + map];
    }

    /**
     * Returns the location index of the given map.
     *
     * @param disk  The disk index (0 or 1).
     * @param map   The map index (0-19 for disk 0 and 0-21 for disk 1)
     * @return The location index (0-49)
     */
    public getLocation(disk: number, map: number): number {
        return this.locationMapping.indexOf((disk + 1 ^ 3) << 6 | map);
    }

    /**
     * Returns the disk index of the specified location.
     *
     * @param location  The location (0-49, but there are also invalid locations within this range).
     * @return The disk index (0 or 1).
     */
    public getLocationDisk(location: number): number {
        const value = this.locationMapping[location] >> 6;
        if (!value) {
            throw new Error("Invalid location: " + location);
        }
        return (value ^ 3) - 1;
    }

    /**
     * Returns the map index of the specified location.
     *
     * @param location  The location index (0-49, but there are also invalid locations within this range).
     * @return The map index (0-19 for disk 0 and 0-21 for disk 1).
     */
    public getLocationMap(location: number): number {
        const value = this.locationMapping[location];
        if (!value) {
            throw new Error("Invalid location: " + location);
        }
        return value & 0x3f;
    }
}
