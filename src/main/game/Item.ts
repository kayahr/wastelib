/*
 * Copyright (c) 2016 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import type { BinaryReader } from "../io/BinaryReader.ts";

/**
 * An item carried by a character.
 */
export class Item {
    readonly #id: number;
    readonly #load: number;
    readonly #jammed: boolean;

    private constructor(id: number, load: number, jammed: boolean) {
        this.#id = id;
        this.#load = load;
        this.#jammed = jammed;
    }

    /** @internal */
    public static read(reader: BinaryReader): Item | null {
        const id = reader.readUint8();
        const ammoAndStatus = reader.readUint8();
        const load = ammoAndStatus & 0x7f;
        const jammed = (ammoAndStatus & 0x80) !== 0;
        return id === 0 ? null : new Item(id, load, jammed);
    }

    /**
     * @returns The item ID.
     */
    public getId(): number {
        return this.#id;
    }

    /**
     * Returns the item load (ammunition) when weapon is not jammed. If weapon is jammed then the weapon is effectively no longer loaded and
     * the returned value reflects the jam severity (0-5). See `combat.md` for details.
     *
     * @returns The item load or jam severity.
     */
    public getLoad(): number {
        return this.#load;
    }

    /**
     * @returns True if item is jammed, false if not.
     */
    public isJammed(): boolean {
        return this.#jammed;
    }
}
