/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

/** Module name of node-canvas. It is a separate variable so systemjs doesn't load it in a web environment. */
const canvasModule = "canvas";

/**
 * Creates and returns a new HTML image element. In Node.js the special image implementation of node-canvas is
 * returned instead.
 *
 * @return The creatd HTML image element.
 */
export function createImage(): HTMLImageElement {
    if (typeof Image === "undefined") {
        const Canvas: any = require(canvasModule);
        return new Canvas.Image();
    } else {
        return new Image();
    }
}
