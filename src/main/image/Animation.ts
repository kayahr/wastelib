/*
 * Copyright (c) 2016 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import type { AnimationPlayer } from "./AnimationPlayer.ts";
import type { BaseImage } from "./BaseImage.ts";

/**
 * Shared interface for {@link Ending} and {@link Portrait} animation.
 */
export interface Animation {
    /**
     * Creates and returns an animation player for this animation. The actual drawing is done by the specified
     * callback which is called for each frame and receives the image to render.
     *
     * @param onDraw - Callback to call on each frame update. This callback is responsible for actually showing the animation frame to the user.
     * @returns The created animation player. You have to call the start() method on it to start the animation.
     */
    createPlayer(onDraw: (frame: BaseImage) => void): AnimationPlayer;

    /**
     * @returns the animation width in pixels.
     */
    getWidth(): number;

    /**
     * @returns the animation height in pixels.
     */
    getHeight(): number;
}
