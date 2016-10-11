/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { createCanvas } from "./canvas";
import { createImage } from "./image";

/**
 * Base class for all images.
 */
export abstract class BaseImage {
    /** The image width in pixels. */
    protected width: number;

    /** The image height in pixels. */
    protected height: number;

    /**
     * Creates a new image with the given size.
     *
     * @param width
     *            The image width in pixels.
     * @param height
     *            The image height in pixels.
     */
    protected constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    /**
     * Returns the image width in pixels.
     *
     * @return The image width in pixels.
     */
    public getWidth(): number {
        return this.width;
    }

    /**
     * Returns the image height in pixels.
     *
     * @return The image height in pixels.
     */
    public getHeight(): number {
        return this.height;
    }

    /**
     * Returns the RGBA color at the specified position.
     *
     * @param x
     *            The horizontal pixel position.
     * @param y
     *            The vertical pixel position.
     * @return The RGBA color at the specified position.
     */
    public abstract getColor(x: number, y: number): number;

    /**
     * Draws the image onto the given rendering context.
     *
     * @param ctx
     *            The rendering context to draw the image to.
     * @param x
     *            Optional horizontal target position. Defaults to 0.
     * @param y
     *            Optional vertical target position. Defaults to 0.
     */
    public draw(ctx: CanvasRenderingContext2D, x: number = 0, y: number = 0): void {
        const width = this.width;
        const height = this.height;
        const imageData = ctx.createImageData(width, height);
        const pixels = imageData.data;
        let rgbaIndex = 0;
        for (let y = 0; y < height; ++y) {
            for (let x = 0; x < width; ++x) {
                const color = this.getColor(x, y);
                pixels[rgbaIndex++] = (color >> 24) & 0xff;
                pixels[rgbaIndex++] = (color >> 16) & 0xff;
                pixels[rgbaIndex++] = (color >> 8) & 0xff;
                pixels[rgbaIndex++] = color & 0xff;
            }
        }
        ctx.putImageData(imageData, x, y);
    }

    /**
     * Creates and returns a new canvas containing the image.
     *
     * @return The created canvas.
     */
    public toCanvas(): HTMLCanvasElement {
        const canvas = createCanvas(this.width, this.height);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Unable to create 2D rendering context");
        }
        this.draw(ctx);
        return canvas;
    }

    /**
     * Creates and returns an image data URL.
     *
     * @param type
     *            Optional image mime type. Defaults to image/png.
     * @param args
     *            Optional additional encoder parameters. For image/jpeg this is the image quality between 0 and 1
     *            with a default value of 0.92.
     * @return The created data URL.
     */
    public toDataUrl(type?: string, ...args: any[]): string {
        return this.toCanvas().toDataURL(type, ...args);
    }

    /**
     * Creates and returns a HTML image.
     *
     * @param type
     *            Optional image mime type. Defaults to image/png.
     * @param args
     *            Optional additional encoder parameters. For image/jpeg this is the image quality between 0 and 1
     *            with a default value of 0.92.
     * @return The created HTML image.
     */
    public toImage(type?: string, ...args: any[]): HTMLImageElement {
        const image = createImage();
        image.src = this.toDataUrl(type, ...args);
        return image;
    }
}
