/*
 * Copyright (c) 2026 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import type { BinaryReader } from "../../io/BinaryReader.ts";
import { Action } from "../Action.ts";

/**
 * Action masking a tile, optionally making it impassable.
 */
export class MaskAction extends Action {
    readonly #messageIndex: number;
    readonly #impassable: boolean;
    readonly #tile: number;
    readonly #newActionClass: number | null;
    readonly #newAction: number | null;

    private constructor(message: number, impassable: boolean, tile: number, newActionClass: number | null, newAction: number | null) {
        super();
        this.#messageIndex = message;
        this.#impassable = impassable;
        this.#tile = tile;
        this.#newActionClass = newActionClass;
        this.#newAction = newAction;
    }

    /**
     * @internal
     */
    public static read(reader: BinaryReader): MaskAction {
        const messageIndex = reader.readUint8();
        const byte = reader.readUint8();
        const impassable = (byte & 0x80) === 0x80;
        const tile = byte & 0x7f;
        const newActionClass = reader.readUint8();
        const newAction = newActionClass < 253 ? reader.readUint8() : null;
        return new MaskAction(messageIndex, impassable, tile, newActionClass === 255 ? null : newActionClass, newAction);
    }

    /**
     * @returns The index of the message to print.
     */
    public getMessageIndex(): number {
        return this.#messageIndex;
    }

    /**
     * Checks if masked tile is impassable.
     *
     * @returns True if impassable, false if not.
     */
    public isImpassable(): boolean {
        return this.#impassable;
    }

    /**
     * @returns The tile image.
     */
    public getTile(): number {
        return this.#tile;
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
