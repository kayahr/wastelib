/*
 * Copyright (c) 2016 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import { type CanvasContext2DLike, type CanvasLike, type ImageDataLike, type ToCanvas, getCanvasContext2D } from "../sys/canvas.ts";

/**
 * Base class for all images.
 */
export abstract class BaseImage implements ToCanvas {
    /** The image width in pixels. */
    protected readonly width: number;

    /** The image height in pixels. */
    protected readonly height: number;

    /**
     * Creates a new image with the given size.
     *
     * @param width  - The image width in pixels.
     * @param height - The image height in pixels.
     */
    protected constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    /**
     * @returns The image width in pixels.
     */
    public getWidth(): number {
        return this.width;
    }

    /**
     * @returns The image height in pixels.
     */
    public getHeight(): number {
        return this.height;
    }

    /**
     * Returns the RGBA color at the specified position.
     *
     * @param x - The horizontal pixel position.
     * @param y - The vertical pixel position.
     * @returns The RGBA color at the specified position.
     * @throws {@link !RangeError} if coordinates are outside of the image boundaries.
     */
    public abstract getColor(x: number, y: number): number;

    /**
     * Copies the opaque pixels of this image into the given image data and returns the modified image data.
     *
     * @param imageData - The image data to copy the opaque pixels of this image to.
     * @returns The image data.
     */
    public toImageData(imageData: ImageDataLike): ImageDataLike {
        const width = this.width;
        const height = this.height;
        const pixels = imageData.data;
        let i = 0;
        for (let y = 0; y < height; ++y) {
            for (let x = 0; x < width; ++x) {
                const color = this.getColor(x, y);
                if ((color & 0xff) === 0) {
                    // Pixel is transparent, ignore it
                    i += 4;
                } else {
                    pixels[i++] = (color >> 24) & 0xff;
                    pixels[i++] = (color >> 16) & 0xff;
                    pixels[i++] = (color >> 8) & 0xff;
                    pixels[i++] = color & 0xff;
                }
            }
        }
        return imageData;
    }

    /**
     * Draws the image onto the given rendering context.
     *
     * @param ctx - The rendering context to draw the image to.
     * @param x   - Optional horizontal target position. Defaults to 0.
     * @param y   - Optional vertical target position. Defaults to 0.
     */
    public draw(ctx: CanvasContext2DLike, x = 0, y = 0): void {
        const imageData = ctx.getImageData(x, y, this.getWidth(), this.getHeight());
        ctx.putImageData(this.toImageData(imageData), x, y);
    }

    /** @inheritdoc */
    public toCanvas<T extends CanvasLike>(canvas: T): T {
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = getCanvasContext2D(canvas);
        this.draw(ctx);
        return canvas;
    }
}
