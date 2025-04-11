/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { PicImage } from "../image/PicImage.js";
import { Portrait } from "./Portrait.js";
import { PortraitUpdate } from "./PortraitUpdate.js";

/**
 * Updatable portrait animation frame.
 */
export class PortraitFrame extends PicImage {
    /**
     * Creates a new updatable portrait animation frame initialized to the base frame of the given portrait image.
     *
     * @param portrait  The portrait image to initialize this frame with.
     */
    public constructor(portrait: Portrait) {
        super(portrait.getData(), 96, 84);
    }

    /**
     * Updates the animation frame.
     *
     * @param update  The update to apply.
     */
    public update(update: PortraitUpdate): void {
        update.getPatches().forEach(patch => {
            const offset = patch.getOffset();
            patch.getData().forEach((value, index) => {
                this.data[offset + index] ^= value;
            });
        });
    }
}
