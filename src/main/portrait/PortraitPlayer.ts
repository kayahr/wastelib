/*
 * Copyright (c) 2016 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import { BaseAnimationPlayer } from "../image/BaseAnimationPlayer.ts";
import type { Portrait } from "./Portrait.ts";
import { PortraitFrame } from "./PortraitFrame.ts";

/**
 * Player for a portrait animation.
 */
export class PortraitPlayer extends BaseAnimationPlayer<Portrait, PortraitFrame> {
    /** The current script line indices. */
    #scriptPointers: number[] = [];

    /** The current script delays. */
    #scriptDelays: number[] = [];

    /**
     * Creates a new player for the given portrait animation.
     *
     * @param portrait - The portrait animation to play.
     * @param onDraw   - Callback to call on each frame update. This callback is responsible for actually showing the animation frame to the user.
     */
    public constructor(portrait: Portrait, onDraw: (frame: PortraitFrame) => void) {
        super(portrait, onDraw);
        this.reset();
    }

    /** @inheritdoc */
    protected init(portrait: Portrait): PortraitFrame {
        const numScripts = portrait.getScriptCount();
        this.#scriptPointers = Array.from({ length: numScripts });
        this.#scriptDelays = Array.from({ length: numScripts });
        for (let i = 0; i < numScripts; ++i) {
            this.#scriptPointers[i] = 0;
            this.#scriptDelays[i] = portrait.getScript(i).getLine(0).getDelay();
        }
        return new PortraitFrame(portrait);
    }

    /** @inheritdoc */
    protected nextFrame(portrait: Portrait, frame: PortraitFrame): PortraitFrame {
        const timeDelta = this.getNextDelayInUnits();
        const numScripts = portrait.getScriptCount();
        for (let i = 0; i < numScripts; ++i) {
            this.#scriptDelays[i] -= timeDelta;
            if (this.#scriptDelays[i] <= 0) {
                const script = portrait.getScript(i);
                let lineIndex = this.#scriptPointers[i];
                const scriptLine = script.getLine(lineIndex);
                const updateIndex = scriptLine.getUpdate();

                // Apply the image update
                frame.update(portrait.getUpdate(updateIndex));

                // Advance to next script line (Or go back to beginning)
                lineIndex = lineIndex < script.getLineCount() - 1 ? ++this.#scriptPointers[i] : this.#scriptPointers[i] = 0;

                // Read the next script delay
                this.#scriptDelays[i] = script.getLine(lineIndex).getDelay();
            }
        }
        return frame;
    }

    /** @inheritdoc */
    protected getNextDelayInUnits(): number {
        return Math.min(...this.#scriptDelays);
    }
}
