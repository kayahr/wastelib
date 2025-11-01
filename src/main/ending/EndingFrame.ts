/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { PicImage } from "../image/PicImage.ts";
import type { Ending } from "./Ending.ts";
import type { EndingUpdate } from "./EndingUpdate.ts";

/**
 * Updatable ending animation frame.
 */
export class EndingFrame extends PicImage {
    /**
     * Creates a new updatable ending animation frame initialized to the base frame of the given ending
     * animation.
     *
     * @param ending  The ending animation to initialize this frame with.
     */
    public constructor(ending: Ending) {
        super(ending.getData(), ending.getWidth(), ending.getHeight());
    }

    /**
     * Updates the animation frame.
     *
     * @param update  The update to apply.
     */
    public update(update: EndingUpdate): void {
        update.getPatches().forEach(patch => {
            const offset = patch.getOffset();
            patch.getData().forEach((value, index) => {
                this.data[offset + index] = value;
            });
        });
    }
}
