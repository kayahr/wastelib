/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { AnimationPlayer } from "../image/AnimationPlayer";
import { Portrait } from "./Portrait";
import { PortraitFrame } from "./PortraitFrame";

/**
 * Player for a portrait animation.
 */
export class PortraitPlayer extends AnimationPlayer<Portrait, PortraitFrame> {
    /** The current script line indices. */
    private scriptPointers: number[];

    /** The current script delays. */
    private scriptDelays: number[];

    /**
     * Creates a new player for the given portrait animation.
     *
     * @param portrait
     *            The portrait animation to play.
     * @param onDraw
     *            Callback to call on each frame update. This callback is responsible for actually showing the
     *            animation frame to the user.
     */
    public constructor(portrait: Portrait, onDraw: (frame: PortraitFrame) => void) {
        super(portrait, onDraw);
    }

    protected init(portrait: Portrait): PortraitFrame {
        const numScripts = portrait.getNumScripts();
        this.scriptPointers = new Array(numScripts);
        this.scriptDelays = new Array(numScripts);
        console.log(portrait, numScripts);
        for (let i = 0; i < numScripts; ++i) {
            this.scriptPointers[i] = 0;
            this.scriptDelays[i] = portrait.getScript(i).getLine(0).getDelay();
        }
        return new PortraitFrame(portrait);
    }

    protected nextFrame(portrait: Portrait, frame: PortraitFrame): PortraitFrame {
        const timeDelta = this.getNextDelay();
        const numScripts = portrait.getNumScripts();
        for (let i = 0; i < numScripts; ++i) {
            this.scriptDelays[i] -= timeDelta;
            if (this.scriptDelays[i] <= 0) {
                const script = portrait.getScript(i);
                let lineIndex = this.scriptPointers[i];
                const scriptLine = script.getLine(lineIndex);
                const updateIndex = scriptLine.getUpdate();

                // Apply the image update
                frame.update(portrait.getUpdate(updateIndex));

                // Advance to next script line (Or go back to beginning)
                if (lineIndex < script.getNumLines() - 1) {
                    lineIndex = ++this.scriptPointers[i];
                } else {
                    lineIndex = this.scriptPointers[i] = 0;
                }

                // Read the next script delay
                this.scriptDelays[i] = script.getLine(lineIndex).getDelay();
            }
        }
        return frame;
    }

    protected getNextDelay(): number {
        return Math.min(...this.scriptDelays);
    }
}
