/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { BaseAnimationPlayer } from "../image/BaseAnimationPlayer";
import { Ending } from "./Ending";
import { EndingFrame } from "./EndingFrame";
import { BaseImage } from "../image/BaseImage";

/**
 * Player for the ending animation.
 */
export class EndingPlayer extends BaseAnimationPlayer<Ending, EndingFrame> {
    /** The current frame index. */
    private frameIndex: number;

    /**
     * Creates a new player for the given ending animation.
     *
     * @param ending  The end animation to play
     * @param onDraw  Callback to call on each frame update. This callback is responsible for actually showing the
     *                animation frame to the user.
     */
    public constructor(ending: Ending, onDraw: (frame: BaseImage) => void) {
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
        frame.update(ending.getUpdate(this.frameIndex));
        return frame;
    }

    protected getNextDelayInUnits(ending: Ending): number {
        return ending.getUpdate(this.frameIndex).getDelay();
    }
}
