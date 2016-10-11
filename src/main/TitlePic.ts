/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { PicImage } from "./PicImage";
import { decodeVxor, decodeVxorInplace } from "./vxor";

/**
 * Container for the title pic image.
 */
export class TitlePic extends PicImage {
    /**
     * Creates a new title pic image with the given EGA image data.
     *
     * @param data
     *            The (vxor-decoded) EGA image data of the title.pic image.
     */
    private constructor(data: Uint8Array) {
        super(data, 288, 128);
    }

    /**
     * Parses a title pic image from the given array and returns it.
     *
     * @param data
     *            The vxor encoded array.
     * @return The parsed title.pic image.
     */
    public static fromArray(array: Uint8Array): TitlePic {
        return new TitlePic(decodeVxor(array, 144));
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
                    resolve(new TitlePic(decodeVxorInplace(new Uint8Array(reader.result), 144)));
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
