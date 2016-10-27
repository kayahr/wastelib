/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { unpackExe } from "./exepack";
import { StringGroups, decodeStringGroups } from "../io/string";

/** The offset of segment 2 in the unpacked WL.EXE file. */
const SEG2 = 0xd020;

/**
 * Provides information from the WL.EXE file.
 */
export class Exe {
    /** The intro strings. */
    private introStrings: StringGroups;

    /** Various unsorted strings. */
    private messageStrings: StringGroups;

    /** Various strings mostly used in inventory, skills and attribute screens. */
    private inventoryStrings: StringGroups;

    /** Character creation strings. */
    private characterCreationStrings: StringGroups;

    /** Promition strings. */
    private promotionStrings: StringGroups;

    /** Library strings. */
    private libraryStrings: StringGroups;

    /** Shop strings. */
    private shopStrings: StringGroups;

    /** Infirmary strings. */
    private infirmaryStrings: StringGroups;

    /** The map sizes of the maps in the two GAME files. */
    private mapSizes: Uint8Array;

    /** The map offsets of the maps in the two GAME files. */
    private mapOffsets: Uint32Array;

    /**
     * Creates a new Exe information object from the given packed EXE content.
     *
     * @param data  The packed content of the WL.EXE file.
     */
    private constructor(data: Uint8Array) {
        const unpacked = unpackExe(data);

        // Decode global strings
        this.introStrings = decodeStringGroups(unpacked, SEG2 + 0xa703, 527);
        this.messageStrings = decodeStringGroups(unpacked, SEG2 + 0xab3e, 1661);
        this.inventoryStrings = decodeStringGroups(unpacked, SEG2 + 0xb270, 1845);
        this.characterCreationStrings = decodeStringGroups(unpacked, SEG2 + 0xce4B, 210);
        this.promotionStrings = decodeStringGroups(unpacked, SEG2 + 0xd622, 1136);
        this.libraryStrings = decodeStringGroups(unpacked, SEG2 + 0xdacc, 277);
        this.shopStrings = decodeStringGroups(unpacked, SEG2 + 0xdbf8, 229);
        this.infirmaryStrings = decodeStringGroups(unpacked, SEG2 + 0xdced, 369);

        // Read the map sizes of the maps in the two GAME files.
        this.mapSizes = new Uint8Array(unpacked.buffer, SEG2 + 0xbf1c, 42);

        // Read the map offsets of the maps in the two GAME files.
        this.mapOffsets = new Uint32Array(unpacked.slice(SEG2 + 0xbc7a, SEG2 + 0xbc7a + 42 * 4).buffer);
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
    public getIntroStrings(): StringGroups {
        return this.introStrings;
    }

    /**
     * Returns various unsorted strings like some encounter messages, loot messages, weapon reloading and more.
     *
     * @return Various unsorted strings.
     */
    public getMessageStrings(): StringGroups {
        return this.messageStrings;
    }

    /**
     * Returns various strings which mostly have something to do with the players inventory but also contains
     * strings for skills and attributes.
     *
     * @return Various strings mostly used in inventory, skills and attribute screens.
     */
    public getInventoryStrings(): StringGroups {
        return this.inventoryStrings;
    }

    /**
     * Returns the strings used during character creation.
     *
     * @return Character creation strings.
     */
    public getCharacterCreationStrings(): StringGroups {
        return this.characterCreationStrings;
    }

    /**
     * Returns strings used during promitions.
     *
     * @return Promition strings.
     */
    public getPromotionStrings(): StringGroups {
        return this.promotionStrings;
    }

    /**
     * Returns strings used in libraries.
     *
     * @return Library strings.
     */
    public getLibraryStrings(): StringGroups {
        return this.libraryStrings;
    }

    /**
     * Returns strings used in shops.
     *
     * @return Shop strings.
     */
    public getShopStrings(): StringGroups {
        return this.shopStrings;
    }

    /**
     * Returns strings used in infirmaries.
     *
     * @return Infirmary strings.
     */
    public getInfirmaryStrings(): StringGroups {
        return this.infirmaryStrings;
    }

    /**
     * Returns the map size of the given map.
     *
     * @param disk  The disk index (0 or 1).
     * @param map   The map index (0-19 for disk 0 and 0-21 for disk 1).
     * @return The map size.
     */
    public getMapSize(disk: number, map: number) {
        return this.mapSizes[disk * 20 + map];
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
}
