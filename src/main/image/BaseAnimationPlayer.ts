/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { AnimationPlayer } from "./AnimationPlayer.js";
import { BaseImage } from "./BaseImage.js";

/**
 * Abstract base class for animation player implementations.
 */
export abstract class BaseAnimationPlayer<A extends BaseImage, T extends BaseImage> implements AnimationPlayer {
    /** The played animation. */
    private readonly animation: A;

    /** The current frame. */
    private frame!: T;

    /** The timer handle if animation is playing. Null otherwise, */
    private timer: unknown = null;

    /** The playing speed in milliseconds per time unit. */
    private speed: number = 50;

    /** Callback to call on each frame update. */
    private readonly onDraw: (frame: T) => void;

    /**
     * Creates a new animation player for the given animation and calling the given draw callback for each
     * animation frame.
     *
     * @param animation  The animation to play.
     * @param onDraw     Callback to call on each frame update. This callback is responsible for actually showing the
     *                   animation frame to the user.
     */
    protected constructor(animation: A, onDraw: (frame: T) => void) {
        this.animation = animation;
        this.onDraw = onDraw;
        this.reset();
    }

    /**
     * Initializes the player. Called for initialization when player is created and each time it is reset.
     *
     * @param animation  The animation to play.
     * @return The base frame to start the animation with.
     */
    protected abstract init(animation: A): T;

    /**
     * Stops and resets the animation to the base frame.
     */
    public reset(): void {
        this.stop();
        this.onDraw(this.frame = this.init(this.animation));
    }

    /**
     * Returns the current animation frame.
     *
     * @return The current animation frame.
     */
    public getFrame(): T {
        return this.frame;
    }

    /**
     * Creates and returns the next frame in the animation.
     *
     * TODO Do we need a return value here?
     *
     * @param animation     The animation to play.
     * @param currentFrame  The current frame.
     * @return The next frame.
     */
    protected abstract nextFrame(animation: A, currentFrame: T): T;

    /**
     * Advances the animation to the next frame.
     */
    public next(): void {
        this.onDraw(this.frame = this.nextFrame(this.animation, this.frame));
    }

    /**
     * Returns the number of time units to wait before rendering the next frame.
     *
     * @param animation  The animation to play.
     * @return The next delay in time units.
     */
    protected abstract getNextDelayInUnits(animation: A): number;

    /**
     * Returns the delay to wait before rendering the next frame.
     *
     * @return The next delay in milliseconds.
     */
    public getNextDelay(): number {
        return this.getNextDelayInUnits(this.animation) * this.speed;
    }

    /**
     * Starts the animation if not already running.
     */
    public start(): void {
        if (this.timer == null) {
            const animate = (): void => {
                this.next();
                this.timer = setTimeout(animate, this.getNextDelay());
            };
            this.timer = setTimeout(animate, this.getNextDelay());
        }
    }

    /**
     * Stops the animation if currently running.
     */
    public stop(): void {
        if (this.timer != null) {
            clearTimeout(this.timer as number);
            this.timer = null;
        }
    }

    /**
     * Returns the animation speed in milliseconds per time unit. Default is 50.
     *
     * @return The animation speed in milliseconds per time unit.
     */
    public getSpeed(): number {
        return this.speed;
    }

    /**
     * Sets the animation speed in milliseconds per time unit. Default is 50.
     *
     * @param speed  The animation speed to set.
     */
    public setSpeed(speed: number): void {
        this.speed = speed;
    }

    /**
     * Returns the animation width in pixels.
     *
     * @return The animation width in pixels.
     */
    public getWidth(): number {
        return this.animation.getWidth();
    }

    /**
     * Returns the animation height in pixels.
     *
     * @return The animation height in pixels.
     */
    public getHeight(): number {
        return this.animation.getHeight();
    }
}
