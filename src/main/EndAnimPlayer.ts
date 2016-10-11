/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { EndAnim } from "./EndAnim";

/**
 * Player for the end animation.
 */
export class EndAnimPlayer {
    /** The canvas on which the animation is played. */
    private canvas: HTMLCanvasElement;

    /** The played end animation. */
    private endAnim: EndAnim;

    /** The rendering context. */
    private ctx: CanvasRenderingContext2D;

    /** The current frame index. */
    private frameIndex: number;

    /** The timer handle if animation is playing. Null otherwise, */
    private timer: any;

    /**
     * Creates a new player for the given end animation. The base frame is immediately rendered but the animation
     * is not started automatically. Call the `play()` method to start the animation.
     *
     * @param endAnim
     *            The end animation to play
     */
    public constructor(endAnim: EndAnim) {
        this.endAnim = endAnim;
        this.canvas = endAnim.toCanvas();
        this.ctx = <CanvasRenderingContext2D>this.canvas.getContext("2d");
        this.frameIndex = 0;
        this.timer = null;
    }

    /**
     * Returns the output canvas element. You can add this element to the DOM to see the animation or you can draw
     * it to your own canvas.
     *
     * @return The output canvas element.
     */
    public getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    /**
     * Renders the next frame of the animation.
     */
    public next(): void {
        this.frameIndex++;
        if (this.frameIndex === 15) {
            this.frameIndex = 11;
        }
        this.endAnim.getFrame(this.frameIndex).draw(this.ctx);
    }

    /**
     * Returns the delay to wait befor rendering the next frame.
     *
     * @return The delay in milliseconds.
     */
    private getDelay(): number {
        return this.endAnim.getFrame(this.frameIndex).getDelay() * 50;
    }

    /**
     * Starts the animation if not already running. After drawing a new frame the optional callback is called with the
     * updated canvas. You can use this to draw the new frame to your own canvas if you like.
     *
     * @param onUpdate
     *            Optional callback to call when the next frame has been rendered into the output canvas which is
     *            passed to the callback.
     */
    public start(onUpdate?: (canvas: HTMLCanvasElement) => void): void {
        if (this.timer == null) {
            const animate = () => {
                this.next();
                if (onUpdate) {
                    onUpdate(this.canvas);
                }
                this.timer = setTimeout(animate, this.getDelay());
            };
            this.timer = setTimeout(animate, this.getDelay());
        }
    }

    /**
     * Stops the animation if currently running.
     */
    public stop(): void {
        if (this.timer != null) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    /**
     * Stops and resets the animation to the base frame.
     */
    public reset(): void {
        this.stop();
        this.frameIndex = 0;
        this.endAnim.draw(this.ctx);
    }
}
