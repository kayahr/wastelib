/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { PicImage } from "../image/PicImage.js";
import { decodeVxor, decodeVxorInplace } from "../io/vxor.js";
import { toError } from "../sys/error.js";

/**
 * Container for the title image.
 */
export class Title extends PicImage {
    /**
     * Creates a new title image with the given image data.
     *
     * @param data  The (vxor-decoded) image data of the title.pic image (Each byte contains two 4-bit colors).
     */
    private constructor(data: Uint8Array) {
        super(data, 288, 128);
    }

    /**
     * Parses a title image from the given array and returns it.
     *
     * @param array - The vxor encoded array.
     * @return The parsed title.pic image.
     */
    public static fromArray(array: Uint8Array): Title {
        return new Title(decodeVxor(array, 144));
    }

    /**
     * Reads the title image from the given blob and returns it.
     *
     * @param blob  The TITLE.PIC blob to read.
     * @return The read title image.
     */
    public static fromBlob(blob: Blob): Promise<Title> {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();
                reader.onload = event => {
                    resolve(new Title(decodeVxorInplace(new Uint8Array(reader.result as ArrayBuffer), 144)));
                };
                reader.onerror = event => {
                    reject(new Error("Unable to read title image from blob: " + reader.error));
                };
                reader.readAsArrayBuffer(blob);
            } catch (e) {
                reject(toError(e));
            }
        });
    }
}
