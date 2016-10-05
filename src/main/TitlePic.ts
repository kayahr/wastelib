/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { decodeVxor } from "./vxor";
import { EgaImage } from "./EgaImage";

/**
 * Container for the title pic image.
 */
export class TitlePic extends EgaImage {
    /**
     * Creates a new title pic image with the given EGA image data.
     *
     * @param data
     *            The (vxor-decoded) EGA image data of the title.pic image.
     */
    public constructor(data: ArrayLike<number>) {
        super(data, 288, 128);
    }

    /**
     * Parses a title pic image from the given vxor encoded array and returns it.
     *
     * @param data
     *            The vxor encoded array.
     * @return The parsed title.pic image.
     */
    public static fromArray(data: ArrayLike<number>): TitlePic {
        return new TitlePic(decodeVxor(data, 144));
    }

    /**
     * Parses a title pic image from the given array buffer and returns it.
     *
     * @param data
     *            The vxor encoded array buffer.
     * @return The parsed title.pic image.
     */
    public static fromArrayBuffer(buffer: ArrayBuffer): TitlePic {
        return TitlePic.fromArray(new Uint8Array(buffer));
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
