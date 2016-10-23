/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

/** Module name of node-canvas. It is a separate variable so systemjs doesn't load it in a web environment. */
const canvasModule = "canvas";

/**
 * Creates a canvas with the given optional size. In Node.js a node-canvas is created and returned.
 *
 * @param width
 *            Optional width in pixels.
 * @param height
 *            Optional height in pixels.
 * @return The created canvas.
 */
export function createCanvas(width?: number, height?: number): HTMLCanvasElement {
    let canvas: HTMLCanvasElement;
    if (typeof HTMLCanvasElement === "undefined") {
        const Canvas: any = require(canvasModule);
        canvas = new Canvas();
    } else {
        canvas = document.createElement("canvas");

    }
    if (width != null && height != null) {
        canvas.width = width;
        canvas.height = height;
    }
    return canvas;
}
