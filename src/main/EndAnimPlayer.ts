/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { AnimationPlayer } from "./AnimationPlayer";
import { EndAnim } from "./EndAnim";
import { EndAnimFrame } from "./EndAnimFrame";

/**
 * Player for the end animation.
 */
export class EndAnimPlayer extends AnimationPlayer<EndAnim, EndAnimFrame> {
    /** The current frame index. */
    private frameIndex: number;

    /**
     * Creates a new player for the given end animation. The base frame is immediately rendered but the animation
     * is not started automatically. Call the `play()` method to start the animation.
     *
     * @param endAnim
     *            The end animation to play
     */
    public constructor(endAnim: EndAnim, onDraw: (frame: EndAnimFrame) => void) {
        super(endAnim, onDraw);
    }

    protected init(endAnim: EndAnim): EndAnimFrame {
        this.frameIndex = 0;
        return new EndAnimFrame(endAnim);
    }

    protected nextFrame(endAnim: EndAnim, frame: EndAnimFrame): EndAnimFrame {
        this.frameIndex++;
        if (this.frameIndex === 15) {
            this.frameIndex = 11;
        }
        frame.update(endAnim.getFrame(this.frameIndex));
        return frame;
    }

    protected getNextDelayInUnits(endAnim: EndAnim): number {
        return endAnim.getFrame(this.frameIndex).getDelay();
    }
}
