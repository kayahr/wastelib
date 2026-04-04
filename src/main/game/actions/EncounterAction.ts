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
    /** The minimum distance in feet for the encounter to start */
    readonly #visibleDistance: number;

    /** The minimum hit distance for the monsters in the encounter */
    readonly #hitDistance: number;

    /** The message to print when the encounter begins */
    readonly #message: number;

    /** The monster type of the first group */
    readonly #monster1: number;

    /** If the number of monsters in the first group is random */
    readonly #random1: boolean;

    /** The number of monsters in the first group */
    readonly #maxGroupSize1: number;

    /** The monster type of the second group */
    readonly #monster2: number;

    /** If the number of monsters in the second group is random */
    readonly #random2: boolean;

    /** The number of monsters in the second group */
    readonly #maxGroupSize2: number;

    /** The monster type of the third group */
    readonly #monster3: number;

    /** If the number of monsters in the third group is random */
    readonly #random3: boolean;

    /** The number of monsters in the third group */
    readonly #maxGroupSize3: number;

    /** If the proper name should be displayed instead of a generic one */
    readonly #properName: boolean;

    /** If the monster is friendly until attacked */
    readonly #friendly: boolean;

    /** The NPC number (0 if not hireable) */
    readonly #npc: number;

    /** The new action class to set after the encounter */
    readonly #newActionClass: number | null;

    /** The action class to set after the encounter */
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
        npc: number,
        newActionClass: number | null,
        newAction: number | null
    ) {
        super();
        this.#visibleDistance = visibleDistance;
        this.#hitDistance = hitDistance;
        this.#message = message;
        this.#monster1 = monster1;
        this.#random1 = random1;
        this.#maxGroupSize1 = maxGroupSize1;
        this.#monster2 = monster2;
        this.#random2 = random2;
        this.#maxGroupSize2 = maxGroupSize2;
        this.#monster3 = monster3;
        this.#random3 = random3;
        this.#maxGroupSize3 = maxGroupSize3;
        this.#properName = properName;
        this.#friendly = friendly;
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
        if ((b & 4) === 4) {
            console.warn("Encounter action unknown093 is set!");
        }
        if ((b & 8) === 8) {
            console.warn("Encounter action unknown094 is set!");
        }
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
            npc,
            newActionClass === 255 ? null : newActionClass,
            newAction
        );
    }

    public getVisibleDistance(): number {
        return this.#visibleDistance;
    }

    public getHitDistance(): number {
        return this.#hitDistance;
    }

    public getMessage(): number {
        return this.#message;
    }

    public getMonster1(): number {
        return this.#monster1;
    }

    public isRandom1(): boolean {
        return this.#random1;
    }

    public getMaxGroupSize1(): number {
        return this.#maxGroupSize1;
    }

    public getMonster2(): number {
        return this.#monster2;
    }

    public isRandom2(): boolean {
        return this.#random2;
    }

    public getMaxGroupSize2(): number {
        return this.#maxGroupSize2;
    }

    public getMonster3(): number {
        return this.#monster3;
    }

    public isRandom3(): boolean {
        return this.#random3;
    }

    public getMaxGroupSize3(): number {
        return this.#maxGroupSize3;
    }

    public isProperName(): boolean {
        return this.#properName;
    }

    public isFriendly(): boolean {
        return this.#friendly;
    }

    public getNpc(): number {
        return this.#npc;
    }

    public getNewActionClass(): number | null {
        return this.#newActionClass;
    }

    public getNewAction(): number | null {
        return this.#newAction;
    }

}
