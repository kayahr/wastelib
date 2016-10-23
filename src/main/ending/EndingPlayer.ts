/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { AnimationPlayer } from "../image/AnimationPlayer";
import { Ending } from "./Ending";
import { EndingFrame } from "./EndingFrame";

/**
 * Player for the end animation.
 */
export class EndingPlayer extends AnimationPlayer<Ending, EndingFrame> {
    /** The current frame index. */
    private frameIndex: number;

    /**
     * Creates a new player for the given end animation. The base frame is immediately rendered but the animation
     * is not started automatically. Call the `play()` method to start the animation.
     *
     * @param ending
     *            The end animation to play
     */
    public constructor(ending: Ending, onDraw: (frame: EndingFrame) => void) {
        super(ending, onDraw);
    }

    protected init(ending: Ending): EndingFrame {
        this.frameIndex = 0;
        return new EndingFrame(ending);
    }

    protected nextFrame(ending: Ending, frame: EndingFrame): EndingFrame {
        this.frameIndex++;
        if (this.frameIndex === 15) {
            this.frameIndex = 11;
        }
        frame.update(ending.getFrame(this.frameIndex));
        return frame;
    }

    protected getNextDelayInUnits(ending: Ending): number {
        return ending.getFrame(this.frameIndex).getDelay();
    }
}
