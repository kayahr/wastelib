/*
 * Copyright (c) 2016 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

/**
 * A portrait animation script line.
 */
export class PortraitScriptLine {
    /** The delay in time units. */
    readonly #delay: number;

    /** The index of the animation update to apply. */
    readonly #update: number;

    /**
     * Creates a portrait animation script line.
     *
     * @param delay  - The delay in time units.
     * @param update - The index of the animation update to apply.
     */
    public constructor(delay: number, update: number) {
        this.#delay = delay;
        this.#update = update;
    }

    /**
     * Returns the delay in time units. It is unknown how long a time unit really is in the game but a good
     * approximation is 50 milliseconds.
     *
     * @returns The delay in time units.
     */
    public getDelay(): number {
        return this.#delay;
    }

    /**
     * @returns The index of the animation update to apply.
     */
    public getUpdate(): number {
        return this.#update;
    }
}
