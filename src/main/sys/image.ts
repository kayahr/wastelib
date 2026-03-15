/*
 * Copyright (c) 2016 Klaus Reimer
 * SPDX-License-Identifier: MIT
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
