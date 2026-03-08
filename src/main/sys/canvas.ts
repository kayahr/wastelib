/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

/**
 * Creates a canvas with the given optional size. In Node.js a node-canvas is created and returned.
 *
 * @param width  Optional width in pixels.
 * @param height Optional height in pixels.
 * @returns The created canvas.
 */
export function createCanvas(width?: number, height?: number): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    if (width != null && height != null) {
        canvas.width = width;
        canvas.height = height;
    }
    return canvas;
}
