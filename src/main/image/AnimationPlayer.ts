/*
 * Copyright (c) 2016 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

/**
 * Shared interface for {@link EndingPlayer} and {@link PortraitPlayer}.
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
     * @returns the delay to wait before rendering the next frame.
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
     * @returns the animation speed in milliseconds per time unit. Default is 50.
     */
    getSpeed(): number;

    /**
     * Sets the animation speed in milliseconds per time unit. Default is 50.
     *
     * @param speed - The animation speed to set.
     */
    setSpeed(speed: number): void;

    /**
     * @returns the animation width in pixels.
     */
    getWidth(): number;

    /**
     * @returns the animation height in pixels.
     */
    getHeight(): number;
}
