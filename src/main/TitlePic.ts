/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { AbstractImage } from "./AbstractImage";
import { COLOR_PALETTE } from "./colors";

/**
 * Container for the title pic image.
 */
export class TitlePic extends AbstractImage {
    /** The image data. Each byte contains two pixels. */
    private data: ArrayLike<number>;

    /**
     * Creates a new title pic image with the given EGA image data.
     *
     * @param data
     *            The (vxor-decoded) EGA image data of the title.pic image.
     */
    private constructor(data: ArrayLike<number>) {
        super(288, 128);
        this.data = data;
    }

    public getColor(x: number, y: number): number {
        if (x < 0 || y < 0 || x > 287 && y > 127) {
            throw new Error(`Coordinates outside of image boundary: ${x}, ${y}`);
        }
        const pixelTuple = this.data[(x + y * this.width) >> 1];
        const pixel = x & 1 ? pixelTuple & 0xf : pixelTuple >> 4;
        return COLOR_PALETTE[pixel];
    }

    /**
     * Parses a title pic image from the given array buffer and returns it.
     *
     * @param data
     *            The vxor encoded array buffer.
     * @return The parsed title.pic image.
     */
    public static fromArrayBuffer(buffer: ArrayBuffer): TitlePic {
        const data = new Uint8Array(buffer);
        for (let i = 144, j = 0, max = data.length; i < max; ++i, ++j) {
            data[i] ^= data[j];
        }
        return new TitlePic(data);
    }

    /**
     * Parses a title pic image from the given file and returns it.
     *
     * @param file
     *            The vxor encoded file.
     * @return The parsed title.pic image.
     */
    public static fromFile(file: File): Promise<TitlePic> {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();
                reader.onload = () => {
                    resolve(TitlePic.fromArrayBuffer(reader.result));
                };
                reader.onerror = () => {
                    reject(new Error("Unable to read title pic image from file " + file.name));
                };
                reader.readAsArrayBuffer(file);
            } catch (e) {
                reject(e);
            }
        });
    }
}
