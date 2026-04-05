/*
 * Copyright (c) 2026 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import type { BinaryReader } from "../../io/BinaryReader.ts";
import { Action } from "../Action.ts";

/**
 * The encounter action is used for fixed (class 3) and random (class 15) encounters.
 */
export class EncounterAction extends Action {
    readonly #visibleDistance: number;
    readonly #hitDistance: number;
    readonly #messageIndex: number;
    readonly #mobIndex1: number;
    readonly #random1: boolean;
    readonly #maxGroupSize1: number;
    readonly #mobIndex2: number;
    readonly #random2: boolean;
    readonly #maxGroupSize2: number;
    readonly #mobIndex3: number;
    readonly #random3: boolean;
    readonly #maxGroupSize3: number;
    readonly #properName: boolean;
    readonly #friendly: boolean;
    readonly #immobile: boolean;
    readonly #npc: number;
    readonly #newActionClass: number | null;
    readonly #newAction: number | null;

    private constructor(
        visibleDistance: number,
        hitDistance: number,
        message: number,
        monster1: number,
        random1: boolean,
        maxGroupSize1: number,
        monster2: number,
        random2: boolean,
        maxGroupSize2: number,
        monster3: number,
        random3: boolean,
        maxGroupSize3: number,
        properName: boolean,
        friendly: boolean,
        immobile: boolean,
        npc: number,
        newActionClass: number | null,
        newAction: number | null
    ) {
        super();
        this.#visibleDistance = visibleDistance;
        this.#hitDistance = hitDistance;
        this.#messageIndex = message;
        this.#mobIndex1 = monster1;
        this.#random1 = random1;
        this.#maxGroupSize1 = maxGroupSize1;
        this.#mobIndex2 = monster2;
        this.#random2 = random2;
        this.#maxGroupSize2 = maxGroupSize2;
        this.#mobIndex3 = monster3;
        this.#random3 = random3;
        this.#maxGroupSize3 = maxGroupSize3;
        this.#properName = properName;
        this.#friendly = friendly;
        this.#immobile = immobile;
        this.#npc = npc;
        this.#newActionClass = newActionClass;
        this.#newAction = newAction;
    }

    /**
     * @internal
     */
    public static read(reader: BinaryReader): EncounterAction {
        const visibleDistance = reader.readUint8();
        const hitDistance = reader.readUint8();
        const message = reader.readUint8();
        const monster1 = reader.readUint8();
        let b = reader.readUint8();
        const random1 = (b & 128) === 128;
        const maxGroupSize1 = b & 127;
        const monster2 = reader.readUint8();
        b = reader.readUint8();
        const random2 = (b & 128) === 128;
        const maxGroupSize2 = b & 127;
        const monster3 = reader.readUint8();
        b = reader.readUint8();
        const random3 = (b & 128) === 128;
        const maxGroupSize3 = b & 127;
        b = reader.readUint8();
        const properName = (b & 1) === 1;
        const friendly = (b & 2) === 2;
        const immobile = (b & 4) === 4;
        // Unknown bit: b & 8
        const npc = b >> 4;

        // Read new action class
        const newActionClass = reader.readUint8();
        const newAction = newActionClass < 253 ? reader.readUint8() : null;

        return new EncounterAction(
            visibleDistance,
            hitDistance,
            message,
            monster1,
            random1,
            maxGroupSize1,
            monster2,
            random2,
            maxGroupSize2,
            monster3,
            random3,
            maxGroupSize3,
            properName,
            friendly,
            immobile,
            npc,
            newActionClass === 255 ? null : newActionClass,
            newAction
        );
    }

    /**
     * @returns The minimum distance in feet for the encounter to start.
     */
    public getVisibleDistance(): number {
        return this.#visibleDistance;
    }

    /**
     * @returns The minimum hit distance for the mobs in this encounter.
     */
    public getHitDistance(): number {
        return this.#hitDistance;
    }

    /**
     * @returns The index of the message to print when encounter starts.
     */
    public getMessageIndex(): number {
        return this.#messageIndex;
    }

    /**
     * @returns The index of the referenced mob on map in group 1.
     */
    public getMobIndex1(): number {
        return this.#mobIndex1;
    }

    /**
     * @returns True if size of group 1 is random, false if it is fixed.
     */
    public isRandom1(): boolean {
        return this.#random1;
    }

    /**
     * @returns The maximum size for group 1 if random flag is set. Otherwise this is the fixed group size. 0 if group is empty.
     */
    public getMaxGroupSize1(): number {
        return this.#maxGroupSize1;
    }


    /**
     * @returns The index of the referenced mob on map in group 2.
     */
    public getMobIndex2(): number {
        return this.#mobIndex2;
    }

    /**
     * @returns True if size of group 2 is random, false if it is fixed.
     */
    public isRandom2(): boolean {
        return this.#random2;
    }

    /**
     * @returns The maximum size for group 2 if random flag is set. Otherwise this is the fixed group size. 0 if group is empty.
     */
    public getMaxGroupSize2(): number {
        return this.#maxGroupSize2;
    }

    /**
     * @returns The index of the referenced mob on map in group 3.
     */
    public getMobIndex3(): number {
        return this.#mobIndex3;
    }

    /**
     * @returns True if size of group 3 is random, false if it is fixed.
     */
    public isRandom3(): boolean {
        return this.#random3;
    }

    /**
     * @returns The maximum size for group 3 if random flag is set. Otherwise this is the fixed group size. 0 if group is empty.
     */
    public getMaxGroupSize3(): number {
        return this.#maxGroupSize3;
    }

    /** @returns True if the proper name should be displayed instead of a generic one. */
    public isProperName(): boolean {
        return this.#properName;
    }

    /**
     * @returns True if mob is friendly until attacked. False if it is hostile and attacks itself.
     */
    public isFriendly(): boolean {
        return this.#friendly;
    }

    /**
     * @returns True if mob is immobile and cannot move during combat.
     */
    public isImmobile(): boolean {
        return this.#immobile;
    }

    /**
     * @returns The NPC index if hirable. 0 if not hirable.
     */
    public getNpc(): number {
        return this.#npc;
    }

    /**
     * Checks if this is a hireable NPC.
     *
     * @returns True if this is a hireable NPC, false if not.
     */
    public isHireable(): boolean {
        return this.#npc !== 0;
    }

    /**
     * @returns The new action class to set after the encounter. Null for none.
     */
    public getNewActionClass(): number | null {
        return this.#newActionClass;
    }

    /**
     * @returns The new action to set after the encounter. Null for none.
     */
    public getNewAction(): number | null {
        return this.#newAction;
    }
}
