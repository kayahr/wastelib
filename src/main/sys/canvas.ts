/*
 * Copyright (c) 2016 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

/**
 * Interface for classes which provide a `toCanvas` method to convert an image into a canvas.
 */
export interface ToCanvas {
    /**
     * Resets the given canvas to the image size and fills the canvas with the image. This does not create a new canvas so any canvas implementation can be
     * used and existing canvas objects can be re-used.
     *
     * In a browser you do this:
     *
     * ```typescript
     * const canvas = image.toCanvas(document.createElement("canvas"))`;
     * ```
     *
     * In Node.js (with node-canvas) you do this:
     *
     * ```typescript
     * import { createCanvas} from "canvas";
     *
     * const canvas = image.toCanvas(createCanvas());
     * ```
     *
     * @param canvas - The canvas to reset and fill.
     * @returns The passed canvas for method chaining.
     */
    toCanvas<T extends CanvasLike>(canvas: T): T;
}

/** Minimal interface for image data. */
export interface ImageDataLike {
    /** Width of the image data in pixels. */
    width: number;

    /** Height of the image data in pixels. */
    height: number;

    /** RGBA pixel data. */
    data: Uint8ClampedArray;
}

/**
 * Minimal interface for a 2D canvas rendering context.
 */
export interface CanvasContext2DLike {
    /**
     * Returns image data at the given position.
     *
     * @param x      - The horizontal position of the image data to return.
     * @param y      - The vertical position of the image data to return.
     * @param width  - The width of the image data to return.
     * @param height - The height of the image data to return.
     * @returns The read image data.
     */
    getImageData(x: number, y: number, width: number, height: number): ImageDataLike;

    /**
     * Draws the given image data to the given position.
     *
     * @param imageData - The image data to draw.
     * @param x         - The horizontal position where to draw the image data.
     * @param y         - The vertical position where to draw the image data.
     */
    putImageData(imageData: ImageDataLike, x: number, y: number): void;

    /**
     * Creates an empty image data container with the given size.
     *
     * @param width - The width in pixels.
     * @param height - The height in pixels.
     * @returns The created image data container.
     */
    createImageData(width: number, height: number): ImageDataLike;
}

/**
 * Minimal interface for a canvas.
 */
export interface CanvasLike {
    /** The width of the canvas in pixels. */
    width: number;

    /** The height of the canvas in pixels. */
    height: number;

    /**
     * @returns The 2D rendering context of the canvas or null if canvas does not support 2D rendering.
     */
    getContext(contextId: "2d"): CanvasContext2DLike | null;
}

/**
 * Returns the 2D rendering context of the given canvas and throws exception it no 2D rendering is supported.
 *
 * @param canvas - The canvas.
 * @returns The 2D rendering context of the given canvas.
 * @throws {@link !Error} if canvas does not support 2D rendering.
 */
export function getCanvasContext2D(canvas: CanvasLike): CanvasContext2DLike {
    const ctx = canvas.getContext("2d");
    if (ctx == null) {
        throw new Error("Unable to create 2D rendering context");
    }
    return ctx;
}
