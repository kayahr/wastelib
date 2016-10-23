/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { BaseImage } from "./BaseImage";
import { AnimationPlayer } from "./AnimationPlayer";

/**
 * Shared interface for [[Ending]] and [[Portrait]] animation.
 */
export interface Animation {
    /**
     * Creates and returns an animation player for this animation. The actual drawing is done by the specified
     * callback which is called for each frame and receives the image to render.
     *
     * @param onDraw   Callback to call on each frame update. This callback is responsible for actually showing the
     *                 animation frame to the user.
     * @return The created animation player. You have to call the start() method on it to start the animation.
     */
    createPlayer(onDraw: (frame: BaseImage) => void): AnimationPlayer;

    /**
     * Returns the animation width in pixels.
     *
     * @return The animation width in pixels.
     */
    getWidth(): number;

    /**
     * Returns the animation height in pixels.
     *
     * @return The animation height in pixels.
     */
    getHeight(): number;
}
