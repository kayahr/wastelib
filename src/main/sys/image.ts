/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

/**
 * Creates and returns a new HTML image element. In Node.js the special image implementation of node-canvas is
 * returned instead.
 *
 * @return The created HTML image element.
 */
export function createImage(): HTMLImageElement {
    if (typeof Image === "undefined") {
        const Canvas: any = module.require("canvas");
        return new Canvas.Image();
    } else {
        return new Image();
    }
}
