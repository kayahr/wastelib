/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

/**
 * Shared interface for [[EndingAnimationPlayer]] and [[PortraitAnimationPlayer]].
 */
export interface AnimationPlayer {
    /**
     * Stops and resets the animation to the base frame.
     */
    reset(): void;

    /**
     * Advances the animation to the next frame.
     */
    next(): void;

    /**
     * Returns the delay to wait before rendering the next frame.
     *
     * @returns The next delay in milliseconds.
     */
    getNextDelay(): number;

    /**
     * Starts the animation if not already running.
     */
    start(): void;

    /**
     * Stops the animation if currently running.
     */
    stop(): void;

    /**
     * Returns the animation speed in milliseconds per time unit. Default is 50.
     *
     * @returns The animation speed in milliseconds per time unit.
     */
    getSpeed(): number;

    /**
     * Sets the animation speed in milliseconds per time unit. Default is 50.
     *
     * @param speed  The animation speed to set.
     */
    setSpeed(speed: number): void;

    /**
     * Returns the animation width in pixels.
     *
     * @returns The animation width in pixels.
     */
    getWidth(): number;

    /**
     * Returns the animation height in pixels.
     *
     * @returns The animation height in pixels.
     */
    getHeight(): number;
}
