/*
 * Copyright (c) 2016 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

/**
 * An item carried by a character.
 */
export class Item {
    /** The item ID. */
    private readonly id: number;

    /** The item load (ammunition). */
    private readonly load: number;

    /** If item is jammed. */
    private readonly jammed: boolean;

    /**
     * Creates a new item carried by a character.
     *
     * @param id      The item ID.
     * @param load    The item load (ammunition).
     * @param jammed  If item is jammed.
     */
    public constructor(id: number, load: number, jammed: boolean) {
        this.id = id;
        this.load = load;
        this.jammed = jammed;
    }

    /**
     * Returns the item ID.
     *
     * @returns the item ID.
     */
    public getId(): number {
        return this.id;
    }

    /**
     * Returns the item load (ammunition) when weapon is not jammed. If weapon is jammed then the weapon is effectively no longer loaded and
     * the returned value reflects the jam severity (0-5). See `combat.md` for details.
     *
     * @returns The item load or jam severity.
     */
    public getLoad(): number {
        return this.load;
    }

    /**
     * Checks if item is jammed.
     *
     * @returns True if item is jammed, false if not.
     */
    public isJammed(): boolean {
        return this.jammed;
    }
}
