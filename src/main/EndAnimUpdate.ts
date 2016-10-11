/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { BinaryReader } from "./BinaryReader";
import { COLOR_PALETTE } from "./colors";

/**
 * Image update of an end animation frame.
 */
export class EndAnimUpdate {
    /** The image offset to update. */
    private offset: number;

    /** The image update (Four bytes with eight 4-bit colors). */
    private update: number[];

    /**
     * Creates a new end animation frame image update,
     *
     * @param offset
     *            The image update offset.
     * @param update
     *            The image update (Four bytes with eight 4-bit colors).
     */
    private constructor(offset: number, update: number[]) {
        this.offset = offset;
        this.update = update;
    }

    /**
     * Returns the image offset to update. This is the raw offset value from the end.cpa file measured in 8 byte
     * blocks relative to a 320 pixels wide screen. Too complex to use. So it's recommended to use the `getX()` and
     * `getY()` methods which converts this offset into pixel coordinates relative to the image.
     *
     * @return The raw image update offset.
     */
    public getOffset(): number {
        return this.offset;
    }

    /**
     * The horizontal update position in pixels relative to the image.
     *
     * @return The horizontal update position.
     */
    public getX(): number {
        return this.offset * 8 % 320;
    }

    /**
     * The vertical update position in pixels relative to the image.
     *
     * @return The vertical update position.
     */
    public getY(): number {
        return this.offset * 8 / 320;
    }

    /**
     * Returns the image update to apply to the image. Always four bytes with eight 4-bit colors.
     *
     * @return The update color bytes.
     */
    public getUpdate(): number[] {
        return this.update.slice();
    }

    /**
     * Returns the RGBA color at the specified position.
     *
     * @param x
     *            The horizontal pixel position.
     * @return The RGBA color at the specified position.
     */
    public getColor(x: number): number {
        const pixelTuple = this.update[x >> 1];
        const pixel = x & 1 ? pixelTuple & 0xf : pixelTuple >> 4;
        return COLOR_PALETTE[pixel];
    }

    /**
     * Reads an image update from the given reader. If end of animation frame is reached then `null` is returned.
     *
     * @param reader
     *            The readet to read the image update from.
     * @return The read image update or null if end of animation frame is reached.
     */
    public static read(reader: BinaryReader): EndAnimUpdate | null {
        const offset = reader.readUint16();
        if (offset === 0xffff) {
            return null;
        }
        const pixels = reader.readUint8s(4);
        return new EndAnimUpdate(offset, pixels);
    }

    /**
     * Draws this image update into the specified rendering context. The canvas must already contain the full
     * image of the previous frame.
     *
     * @param ctx
     *            The rendering context.
     */
    public draw(ctx: CanvasRenderingContext2D) {
        const imageData = ctx.createImageData(8, 1);
        const pixels = imageData.data;
        let rgbaIndex = 0;
        for (let x = 0; x < 8; ++x) {
            const color = this.getColor(x);
            pixels[rgbaIndex++] = (color >> 24) & 0xff;
            pixels[rgbaIndex++] = (color >> 16) & 0xff;
            pixels[rgbaIndex++] = (color >> 8) & 0xff;
            pixels[rgbaIndex++] = color & 0xff;
        }
        ctx.putImageData(imageData, this.getX(), this.getY());
    }
}
