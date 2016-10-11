/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

export function createCanvas(width?: number, height?: number): HTMLCanvasElement {
    let canvas: HTMLCanvasElement;
    if (typeof HTMLCanvasElement === "undefined") {
        const module = "canvas";
        const Canvas: any = require(module);
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
