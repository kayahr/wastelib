/*
 * Copyright (c) 2026 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import type { BinaryReader } from "../io/BinaryReader.ts";
import type { Action } from "./Action.ts";
import { ActionClass } from "./ActionClass.ts";
import { BlockedAction } from "./actions/BlockedAction.ts";
import { MaskAction } from "./actions/MaskAction.ts";
import { PrintAction } from "./actions/PrintAction.ts";
import { TransitionAction } from "./actions/TransitionAction.ts";

/**
 * Actions container.
 */
export class Actions {
    readonly #actions: Array<Action | null>;

    private constructor(actions: Array<Action | null>) {
        this.#actions = actions;
    }

    /**
     * Creates and returns an empty Actions instance.
     *
     * @internal
     */
    static createEmpty(): Actions {
        return new Actions([]);
    }

    static #readAction(reader: BinaryReader, actionClass: number, specialActionTable: Uint16Array): Action | null {
        switch (actionClass) {
            case ActionClass.PRINT:
                return PrintAction.read(reader);

            case ActionClass.BLOCKED:
                return BlockedAction.read(reader);

            case ActionClass.TRANSITION:
                return TransitionAction.read(reader);

            case ActionClass.MASK:
                return MaskAction.read(reader);

            default:
                console.warn("Unhandled action class:", actionClass);
                return null;
        }
    }

    /**
     * Parses actions from a reader and returns them.
     *
     * @param reader             - The reader to read the actions from.
     * @param actionClass        - The action class the actions are for.
     * @param specialActionTable - The special action table for actions which need it.
     * @internal
     */
    public static read(reader: BinaryReader, actionClass: number, specialActionTable: Uint16Array): Actions {
        // Read the action offsets
        let pos = reader.getByteIndex();
        const offsets: number[] = [];
        let endOffset = 0;
        while (pos !== endOffset) {
            const offset = reader.readUint16();
            offsets.push(offset);
            pos += 2;
            if (offset !== 0 && (endOffset === 0 || offset < endOffset)) {
                endOffset = offset;
            }
        }

        // Count the actions
        const quantity = offsets.length;

        // Read the actions
        const actions: Array<Action | null> = [];
        for (let i = 0; i < quantity; i++) {
            let action;
            const actionOffset = offsets[i];
            if (actionOffset !== 0) {
                reader.seek(actionOffset);
                action = this.#readAction(reader, actionClass, specialActionTable);
            } else {
                action = null;
            }

            actions.push(action);
        }

        return new Actions(actions);
    }

    /**
     * @returns The number of actions.
     */
    public getSize(): number {
        return this.#actions.length;
    }

    /**
     * Returns the action with the given index.
     *
     * @param index - The action index.
     * @returns The action or null if there is none with this index.
     */
    public getAction(index: number): Action | null {
        return this.#actions[index] ?? null;
    }
}
