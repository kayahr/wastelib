/*
 * Copyright (c) 2016 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import { BaseAnimationPlayer } from "../image/BaseAnimationPlayer.ts";
import type { BaseImage } from "../image/BaseImage.ts";
import type { Ending } from "./Ending.ts";
import { EndingFrame } from "./EndingFrame.ts";

/**
 * Player for the ending animation.
 */
export class EndingPlayer extends BaseAnimationPlayer<Ending, EndingFrame> {
    /** The index of the next animation update to apply. */
    #updateIndex = 0;

    /**
     * Creates a new player for the given ending animation.
     *
     * @param ending - The end animation to play
     * @param onDraw - Callback to call on each frame update. This callback is responsible for actually showing the animation frame to the user.
     */
    public constructor(ending: Ending, onDraw: (frame: BaseImage) => void) {
        super(ending, onDraw);
        this.reset();
    }

    /** @inheritdoc */
    protected init(ending: Ending): EndingFrame {
        this.#updateIndex = 0;
        return new EndingFrame(ending);
    }

    /** @inheritdoc */
    protected nextFrame(ending: Ending, frame: EndingFrame): EndingFrame {
        frame.update(ending.getUpdate(this.#updateIndex));
        this.#updateIndex++;

        // Loop the last four frames
        const size = ending.getSize();
        if (this.#updateIndex === size) {
            this.#updateIndex = size - 4;
        }
        return frame;
    }

    /** @inheritdoc */
    protected getNextDelayInUnits(ending: Ending): number {
        return ending.getUpdate(this.#updateIndex).getDelay();
    }
}
