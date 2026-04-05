/*
 * Copyright (c) 2026 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import type { BinaryReader } from "../../io/BinaryReader.ts";
import { Action } from "../Action.ts";
import { Check } from "../Check.ts";

/**
 * The check action defines a skill/check/attribute/... check.
 */
export class CheckAction extends Action {
    readonly #passable: boolean;
    readonly #autoCheck: boolean;
    readonly #party: boolean;
    readonly #damageAll: boolean;
    readonly #passAll: boolean;
    readonly #bypassArmor: boolean;
    readonly #startMessageIndex: number;
    readonly #passMessageIndex: number;
    readonly #failMessageIndex: number;
    readonly #passNewActionClass: number;
    readonly #passNewAction: number;
    readonly #failNewActionClass: number;
    readonly #failNewAction: number;
    readonly #fixedModifier: boolean;
    readonly #modifierTarget: number;
    readonly #modifier: number;
    readonly #checks: Check[];

    private constructor(
        passable: boolean,
        autoCheck: boolean,
        party: boolean,
        damageAll: boolean,
        passAll: boolean,
        bypassArmor: boolean,
        startMessageIndex: number,
        passMessageIndex: number,
        failMessageIndex: number,
        passNewActionClass: number,
        passNewAction: number,
        failNewActionClass: number,
        failNewAction: number,
        fixedModifier: boolean,
        modifierTarget: number,
        modifier: number,
        checks: Check[]
    ) {
        super();
        this.#passable = passable;
        this.#autoCheck = autoCheck;
        this.#party = party;
        this.#damageAll = damageAll;
        this.#passAll = passAll;
        this.#bypassArmor = bypassArmor;
        this.#startMessageIndex = startMessageIndex;
        this.#passMessageIndex = passMessageIndex;
        this.#failMessageIndex = failMessageIndex;
        this.#passNewActionClass = passNewActionClass;
        this.#passNewAction = passNewAction;
        this.#failNewActionClass = failNewActionClass;
        this.#failNewAction = failNewAction;
        this.#fixedModifier = fixedModifier;
        this.#modifierTarget = modifierTarget;
        this.#modifier = modifier;
        this.#checks = checks;
    }

    /**
     * @internal
     */
    public static read(reader: BinaryReader): CheckAction {
        const flags = reader.readUint8();
        const passable = (flags & 128) === 128;
        const autoCheck = (flags & 64) === 64;
        const party = (flags & 32) === 32;
        const damageAll = (flags & 16) === 16;
        const checkBased = (flags & 8) === 8;
        const passAll = (flags & 4) === 4;
        // Unknown: (flags & 2) == 2;
        const bypassArmor = (flags & 1) === 1;
        const startMessageIndex = reader.readUint8();
        const passMessageIndex = reader.readUint8();
        const failMessageIndex = reader.readUint8();
        const passNewActionClass = reader.readUint8();
        const passNewAction = reader.readUint8();
        const failNewActionClass = reader.readUint8();
        const failNewAction = reader.readUint8();
        const b1 = reader.readUint8();
        const fixedModifier = (b1 & 128) === 128;
        const modifierTarget = b1 & 127;
        const b2 = reader.readUint8();
        const modifier = (b2 & 127) * (((b2 & 128) === 128) ? -1 : 1);
        const checks: Check[] = [];
        let check: Check | null;
        while ((check = Check.read(reader)) != null) {
            checks.push(check);
        }

        // Read replacement data if present
        if (checkBased) {
            for (const check of checks) {
                check.readReplacement(reader);
            }
        }

        return new CheckAction(
            passable,
            autoCheck,
            party,
            damageAll,
            passAll,
            bypassArmor,
            startMessageIndex,
            passMessageIndex,
            failMessageIndex,
            passNewActionClass,
            passNewAction,
            failNewActionClass,
            failNewAction,
            fixedModifier,
            modifierTarget,
            modifier,
            checks
        );
    }

    /**
     * @returns The start message.
     */
    public getStartMessageIndex(): number {
        return this.#startMessageIndex;
    }

    /**
     * @returns The new action class to set when the check fails.
     */
    public getFailNewActionClass(): number {
        return this.#failNewActionClass;
    }

    /**
     * @returns The new action to set when the check fails.
     */
    public getFailNewAction(): number {
        return this.#failNewAction;
    }

    /**
     * @returns The fail message.
     */
    public getFailMessageIndex(): number {
        return this.#failMessageIndex;
    }

    /**
     * @returns The new action class to set when the check passes.
     */
    public getPassNewActionClass(): number {
        return this.#passNewActionClass;
    }

    /**
     * @returns The new action to set when the check passes.
     */
    public getPassNewAction(): number {
        return this.#passNewAction;
    }

    /**
     * @returns The pass message.
     */
    public getPassMessageIndex(): number {
        return this.#passMessageIndex;
    }

    /**
     * Returns the check with the specified index.
     *
     * @param index - The index.
     * @returns The check.
     */
    public getCheck(index: number): Check {
        if (index < 0 || index > this.#checks.length) {
            throw new RangeError(`Index out of bounds: ${index}`);
        }
        return this.#checks[index];
    }

    /**
     * @returns The number of checks.
     */
    public getChecksCount(): number {
        return this.#checks.length;
    }

    /**
     * @returns True if check triggers automatically, false it is triggered manually.
     */
    public isAutoCheck(): boolean {
        return this.#autoCheck;
    }

    /**
     * @returns True if check by-passes armor.
     */
    public isBypassArmor(): boolean {
        return this.#bypassArmor;
    }

    /**
     * @returns The checks
     */
    public getChecks(): Check[] {
        return this.#checks.slice();
    }

    /**
     * @returns True if failure damages the whole group, false if just one
     */
    public isDamageAll(): boolean {
        return this.#damageAll;
    }

    /**
     * @returns True if all party members are checked, false if only the first viable character is checked.
     */
    public isParty(): boolean {
        return this.#party;
    }

    /**
     * @returns True if the square is passable even without a successful check.
     */
    public isPassable(): boolean {
        return this.#passable;
    }

    /**
     * @returns True if all members must pass the check to succeed, false if one is enough.
     */
    public isPassAll(): boolean {
        return this.#passAll;
    }

    /**
     * @returns True if the modifier is a fixed value instead of a random dice role.
     */
    public isFixedModifier(): boolean {
        return this.#fixedModifier;
    }

    /**
     * @returns The modifier.
     */
    public getModifier(): number {
        return this.#modifier;
    }

    /**
     * @returns The modifier target
     */
    public getModifierTarget(): number {
        return this.#modifierTarget;
    }
}
