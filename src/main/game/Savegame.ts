/*
 * Copyright (C) 2026 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { decodeRotatingXor } from "../io/xor.ts";
import { BinaryReader } from "../io/BinaryReader.ts";
import { PartyGroup } from "./PartyGroup.ts";
import { Character } from "./Character.ts";

/** The party of seven characters. */
export type Party = readonly [ Character, Character, Character, Character, Character, Character, Character ];

/** The four party groups. */
export type PartyGroups = readonly [ PartyGroup, PartyGroup, PartyGroup, PartyGroup ];

/**
 * Save game.
 */
export class Savegame {
    private readonly parties: PartyGroups;
    private readonly viewportX: number;
    private readonly viewportY: number;
    private readonly currentMembers: number;
    private readonly currentParty: number;
    private readonly currentMap: number;
    private readonly totalMembers: number;
    private readonly extraGroups: number;
    private readonly minute: number;
    private readonly hour: number;
    private readonly combatScrollSpeed: number;
    private readonly serial: number;
    private readonly party: Party;

    private constructor(array: Uint8Array, offset: number) {
        const reader = new BinaryReader(array, offset);

        // Read and validate the header
        const header = reader.readString(4);
        if (header !== "msq0" && header !== "msq1") {
            throw new Error(`Invalid savegame header: ${header}`);
        }
        const data = decodeRotatingXor(reader.readUint8s(0x802));
        const dataReader = new BinaryReader(data);
        this.parties = [ PartyGroup.read(dataReader), PartyGroup.read(dataReader), PartyGroup.read(dataReader), PartyGroup.read(dataReader) ] as const;
        dataReader.skip(64); // Skip 64 unknown bytes at 0x38 - 0x77
        this.viewportX = dataReader.readUint8();
        this.viewportY = dataReader.readUint8();
        dataReader.skip(3); // Skip unknown bytes 0x7a - 0x7c
        this.currentMembers = dataReader.readUint8();
        this.currentParty = dataReader.readUint8();
        this.currentMap = dataReader.readUint8();
        this.totalMembers = dataReader.readUint8();
        this.extraGroups = dataReader.readUint8();
        dataReader.skip(1); // Skip unknown byte 0x82
        this.minute = dataReader.readUint8();
        this.hour = dataReader.readUint8();
        this.combatScrollSpeed = dataReader.readUint8();
        dataReader.skip(111); // Skip 111 unknown bytes at 0x86 - 0xf4
        this.serial = dataReader.readUint32();
        dataReader.skip(7); // Skip 7 unknown bytes at 0xf9 - 0xff
        this.party = [
            new Character(dataReader),
            new Character(dataReader),
            new Character(dataReader),
            new Character(dataReader),
            new Character(dataReader),
            new Character(dataReader),
            new Character(dataReader)
        ] as const;
    }

    /**
     * Reads savegame from the given blob at given offset.
     *
     * @param blob   - The blob from which to read the savegame (GAME1 or GAME2).
     * @param offset - The offset within the blob pointing the beginning of the MSQ block of the savegame.
     * @returns The read savegame.
     */
    public static async fromBlob(blob: Blob, offset: number): Promise<Savegame> {
        return new Savegame(new Uint8Array(await blob.arrayBuffer()), offset);
    }

    /**
     * @returns The four party groups.
     */
    public getPartyGroups(): PartyGroups {
        return this.parties;
    }

    /**
     * @returns The left edge of the viewport.
     */
    public getViewportX(): number {
        return this.viewportX;
    }

    /**
     * @returns The top edge of the viewport.
     */
    public getViewportY(): number {
        return this.viewportY;
    }

    /**
     * @returns The number of members of the current party.
     */
    public getCurrentMembers(): number {
        return this.currentMembers;
    }

    /**
     * @returns The index of the currently active party.
     */
    public getCurrentParty(): number {
        return this.currentParty;
    }

    /**
     * @returns The map on which the current active party is located.
     */
    public getCurrentMap(): number {
        return this.currentMap;
    }

    /**
     * @returns The total number of party members.
     */
    public getTotalMembers(): number {
        return this.totalMembers;
    }

    /**
     * @returns The number of extra party groups. 0 if there only exists one party group.
     */
    public getExtraGroups(): number {
        return this.extraGroups;
    }

    /**
     * @returns The minute of the current time.
     */
    public getMinute(): number {
        return this.minute;
    }

    /**
     * @returns The hour of the current time.
     */
    public getHour(): number {
        return this.hour;
    }

    /**
     * @returns The combat scroll speed.
     */
    public getCombatScrollSpeed(): number {
        return this.combatScrollSpeed;
    }

    /**
     * @returns The savegame serial number.
     */
    public getSerial(): number {
        return this.serial;
    }

    /**
     * @returns The seven characters of the party.
     */
    public getParty(): Party {
        return this.party;
    }
}
