/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { AbstractImage } from "./AbstractImage";

/** The RGBA values of the EGA palette. */
const egaPalette = [
    0x000000ff,
    0x0000aaff,
    0x00aa00ff,
    0x00aaaaff,
    0xaa0000ff,
    0xaa00aaff,
    0xaa5500ff,
    0xaaaaaaff,
    0x555555ff,
    0x5555ffff,
    0x55ff55ff,
    0x55ffffff,
    0xff5555ff,
    0xff55ffff,
    0xffff55ff,
    0xffffffff
];

/**
 * Image where each byte contains two pixels referencing a color in the EGA palette.
 */
export class EgaImage extends AbstractImage {
    /** The EGA image data. */
    private data: ArrayLike<number>;

    /**
     * Creates a new EGA image with the given image data and size.
     *
     * @param data
     *            The image data (Two EGA pixels per byte).
     * @param width
     *            The image width in pixels.
     * @param height
     *            The image height in pixels.
     */
    public constructor(data: ArrayLike<number>, width: number, height: number) {
        super(width, height);
        this.data = new Uint8Array(data);
    }

    /**
     * Returns the palette index of the pixel at the specified position. If position is outside of the image then
     * palette index 0 (black) is returned.
     *
     * @param x
     *            The horizontal pixel position.
     * @param y
     *            The vertical pixel position.
     * @return The palette index of the pixel at the specified position.
     */
    public getPaletteIndex(x: number, y: number): number {
        const byte = this.data[(x + y * this.width) >> 1];
        return x & 1 ? byte & 0xf : byte >> 4;
    }

    /**
     * Returns the RGBA color at the specified position. If position is outside of the image then a solid black is
     * returned.
     *
     * @param x
     *            The horizontal pixel position.
     * @param y
     *            The vertical pixel position.
     * @return The RGBA color at the specified position.
     */
    public getColor(x: number, y: number): number {
        return egaPalette[this.getPaletteIndex(x, y)];
    }
}
