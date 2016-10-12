/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { BinaryReader } from "./BinaryReader";
import { EndAnimUpdate } from "./EndAnimUpdate";

/**
 * A single end animation frame.
 */
export class PortraitFrame {
    /** The delay before showing this frame. */
    private delay: number;

    /** The image updates to apply to the previous frame to get this frame. */
    private updates: EndAnimUpdate[];

    /**
     * Creates an end animation frame with the given delay and image updates.
     *
     * @param delay
     *            The delay before showing this frame.
     * @param updates
     *            The image updates to apply to the previous frame to get this frame.
     */
    private constructor(delay: number, updates: EndAnimUpdate[]) {
        this.delay = delay;
        this.updates = updates;
    }

    /**
     * Returns the delay to wait before showing this frame. The unit is unknown but good results can be achieved
     * by multiplying this value with 50 to get a millisecond value.
     *
     * @return The delay.
     */
    public getDelay(): number {
        return this.delay;
    }

    /**
     * Returns the image updates to apply to the previous frame to get this frame.
     *
     * @return The image updates to apply to the previous frame to get this frame.
     */
    public getUpdates(): EndAnimUpdate[] {
        return this.updates.slice();
    }

    /**
     * Draws this animation frame on the given rendering context. The canvas must already contain the full image of
     * the previous frame because the existing pixels are just updated and not completely redrawn.
     *
     * @param ctx
     *            The rendering context to update.
     */
    public draw(ctx: CanvasRenderingContext2D) {
        this.updates.forEach(update => {
            update.draw(ctx);
        });
    }

    /**
     * Reads an animation frame from the given reader. If the end of the animation has been reached then `null` is
     * returned.
     *
     * @param reader
     *            The reader to read the animation frame from.
     * @return The read animation frame or null if end of animation has been reached.
     */
    public static read(reader: BinaryReader): PortraitFrame | null {
        const delay = reader.readUint16();
        if (delay === 0xffff) {
            return null;
        }
        let update: EndAnimUpdate | null;
        let updates: EndAnimUpdate[] = [];
        while (update = EndAnimUpdate.read(reader)) {
            updates.push(update);
        }
        return new PortraitFrame(delay, updates);
    }
}
