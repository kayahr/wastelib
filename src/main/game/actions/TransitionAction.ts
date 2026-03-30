/*
 * Copyright (c) 2026 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import type { BinaryReader } from "../../io/BinaryReader.ts";
import { Action } from "../Action.ts";

/**
 * Action for transitioning to a new location.
 */
export class TransitionAction extends Action {
    readonly #relative: boolean;
    readonly #confirm: boolean;
    readonly #messageIndex: number;
    readonly #targetX: number;
    readonly #targetY: number;
    readonly #targetLocation: number | null;
    readonly #newActionClass: number | null;
    readonly #newAction: number | null;

    private constructor(relative: boolean, confirm: boolean, messageIndex: number, targetX: number, targetY: number,
            targetLocation: number | null, newActionClass: number | null, newAction: number | null) {
        super();
        this.#relative = relative;
        this.#confirm = confirm;
        this.#messageIndex = messageIndex;
        this.#newActionClass = newActionClass;
        this.#newAction = newAction;
        this.#targetX = targetX;
        this.#targetY = targetY;
        this.#targetLocation = targetLocation;
    }

    /**
     * @internal
     */
    public static read(reader: BinaryReader): TransitionAction {
        const flags = reader.readUint8();
        const relative = (flags & 0x80) !== 0;
        const confirm = (flags & 0x40) !== 0;
        const messageIndex = flags & 0x3f;
        const targetX = reader.readInt8();
        const targetY = reader.readInt8();
        const targetLocation = reader.readUint8();
        const newActionClass = reader.readUint8();
        const newAction = newActionClass < 253 ? reader.readUint8() : null;
        return new TransitionAction(relative, confirm, messageIndex, targetX, targetY, targetLocation === 255 ? null : targetLocation,
            newActionClass === 255 ? null : newActionClass, newAction);
    }

    /**
     * @returns True if positioning is relative, false if absolute.
     */
    public isRelative(): boolean {
        return this.#relative;
    }

    /**
     * @returns True if transition must be confirmed by the user, false if not.
     */
    public isConfirm(): boolean {
        return this.#confirm;
    }


    /**
     * @returns The index of the message to print.
     */
    public getMessageIndex(): number {
        return this.#messageIndex;
    }

    /**
     * @returns The target x position (relative or absolute).
     */
    public getTargetX(): number {
        return this.#targetX;
    }

    /**
     * @returns The target x position (relative or absolute).
     */
    public getTargetY(): number {
        return this.#targetY;
    }

    /**
     * @returns The target location. Null for previous map.
     */
    public getTargetLocation(): number | null {
        return this.#targetLocation;
    }

    /**
     * @returns The new action class to set. Null if none.
     */
    public getNewActionClass(): number | null {
        return this.#newActionClass;
    }

    /**
     * @returns The new action to set. Null if none.
     */
    public getNewAction(): number | null{
        return this.#newAction;
    }
}
