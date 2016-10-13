/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

/**
 * A portrait animation script line.
 */
export class PortraitScriptLine {
    /** The delay in time units. */
    private readonly delay: number;

    /** The index of the animation update to apply. */
    private readonly update: number;

    /**
     * Creates a portrait animation script line.
     *
     * @param delay
     *            The delay in time units.
     * @param update
     *            The index of the animation update to apply.
     */
    public constructor(delay: number, update: number) {
        this.delay = delay;
        this.update = update;
    }

    /**
     * Returns the delay in time units. It is unknown how long a time unit really is in the game but a good
     * approximation is 50 milliseconds.
     *
     * @return The delay in time units.
     */
    public getDelay(): number {
        return this.delay;
    }

    /**
     * Returns the index of the animation update to apply.
     *
     * @return The animation update index.
     */
    public getUpdate(): number {
        return this.update;
    }
}
