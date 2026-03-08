/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

/**
 * Creates and returns a new HTML image element. In Node.js the special image implementation of node-canvas is
 * returned instead.
 *
 * @returns The created HTML image element.
 */
export function createImage(): HTMLImageElement {
    return new Image();
}
