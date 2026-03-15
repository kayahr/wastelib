/*
 * Copyright (c) 2026 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import type { BinaryReader } from "../io/BinaryReader.ts";

/**
 * Order of the (up to) seven party members in the group. 1 to 7 references a character, 0 means no character. So when all entries are 0 then the group
 * is empty.
 */
export type PartyOrder = [ number, number, number, number, number, number, number ];

/**
 * Party is a container for party members (Which are just the member ids).
 */
export class PartyGroup {
    private readonly order: PartyOrder;

    /** X position on the map */
    private readonly x: number;

    /** Y position on the map */
    private readonly y: number;

    /** The current map */
    private readonly map: number;

    /** The previous X position on the previous map (For FF transitions) */
    private readonly prevX: number;

    /** The previous Y position on the previous map (For FF transitions) */
    private readonly prevY: number;

    /** The previous map (For FF transitions) */
    private readonly prevMap: number;

    private constructor(order: PartyOrder, x: number, y: number, map: number, prevX: number, prevY: number, prevMap: number) {
        this.order = order;
        this.x = x;
        this.y = y;
        this.map = map;
        this.prevX = prevX;
        this.prevY = prevY;
        this.prevMap = prevMap;
    }


    /**
     * Creates a new party be reading its data from the specified reader.
     *
     * @param reader - The reader to read the party data from.
     * @returns The read party.
     */
    public static read(reader: BinaryReader): PartyGroup {
        // Skip unused byte
        reader.skip(1);
        return new PartyGroup(
            Array.from(reader.readUint8s(7)) as PartyOrder,
            reader.readUint8(),
            reader.readUint8(),
            reader.readUint8(),
            reader.readUint8(),
            reader.readUint8(),
            reader.readUint8()
        );
    }

    /**
     * @returns The map.
     */
    public getMap(): number {
        return this.map;
    }

    /**
     * @returns The previous map (For FF transitions).
     */
    public getPrevMap(): number {
        return this.prevMap;
    }

    /**
     * @returns The previous X position on the previous map (For FF transitions).
     */
    public getPrevX(): number {
        return this.prevX;
    }

    /**
     * @returns The previous Y position on the previous map (For FF transitions).
     */
    public getPrevY(): number {
        return this.prevY;
    }

    /**
     * @returns The x position on the map.
     */
    public getX(): number {
        return this.x;
    }

    /**
     * @returns The y position on the map.
     */
    public getY(): number {
        return this.y;
    }

    /**
     * @returns The party order.
     */
    public getOrder(): PartyOrder {
        return this.order.slice() as PartyOrder;
    }
}
