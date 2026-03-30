/*
 * Copyright (c) 2026 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import type { BinaryReader } from "../../io/BinaryReader.ts";
import { Action } from "../Action.ts";

/**
 * Action for printing messages and optionally setting a new action.
 */
export class PrintAction extends Action {
    readonly #messageIndices: number[];
    readonly #newActionClass: number | null;
    readonly #newAction: number | null;

    private constructor(messageIndices: number[], newActionClass: number | null, newAction: number | null) {
        super();
        this.#messageIndices = messageIndices;
        this.#newActionClass = newActionClass;
        this.#newAction = newAction;
    }

    /**
     * @internal
     */
    public static read(reader: BinaryReader): PrintAction {
        // Read messages
        const messageIndices: number[] = [];
        let b;
        do {
            b = reader.readUint8();
            messageIndices.push(b & 0x7f);

        } while ((b & 0x80) === 0);

        // Read new action class
        const newActionClass = reader.readUint8();
        const newAction = newActionClass < 253 ? reader.readUint8() : null;

        return new PrintAction(messageIndices, newActionClass === 255 ? null : newActionClass, newAction);
    }

    /**
     * @returns The messages indices to print.
     */
    public getMessageIndices(): number[] {
        return this.#messageIndices.slice();
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
