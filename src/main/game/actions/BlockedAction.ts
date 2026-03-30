/*
 * Copyright (c) 2026 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import type { BinaryReader } from "../../io/BinaryReader.ts";
import { Action } from "../Action.ts";

/**
 * Action marking a tile as impassable.
 */
export class BlockedAction extends Action {
    readonly #messageIndex: number;
    readonly #newActionClass: number | null;
    readonly #newAction: number | null;

    private constructor(message: number, newActionClass: number | null, newAction: number | null) {
        super();
        this.#messageIndex = message;
        this.#newActionClass = newActionClass;
        this.#newAction = newAction;
    }

    /**
     * @internal
     */
    public static read(reader: BinaryReader): BlockedAction {
        const message = reader.readUint8();
        const newActionClass = reader.readUint8();
        const newAction = newActionClass < 253 ? reader.readUint8() : null;
        return new BlockedAction(message, newActionClass === 255 ? null : newActionClass, newAction);
    }

    /**
     * @returns The index of the message to print.
     */
    public getMessageIndex(): number {
        return this.#messageIndex;
    }

    /**
     * @returns The replacement action class to set. Null if none.
     */
    public getNewActionClass(): number | null{
        return this.#newActionClass;
    }

    /**
     * @returns The replacement action to set. Null if none.
     */
    public getNewAction(): number | null{
        return this.#newAction;
    }
}
