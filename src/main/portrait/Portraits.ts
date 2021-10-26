/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { BinaryReader } from "../io/BinaryReader";
import { Portrait } from "./Portrait";

/**
 * Container for the portraits of an allpics file.
 */
export class Portraits {
    /** The portraits. */
    private readonly portraits: Portrait[];

    /**
     * Creates a new set of portraits.
     *
     * @param portraits  The portraits.
     * @param disk       The disk number.
     */
    public constructor(...portraits: Portrait[]) {
        this.portraits = portraits;
    }

    /**
     * Returns array with all portraits.
     *
     * @return The portraits.
     */
    public getPortraits(): Portrait[] {
        return this.portraits.slice();
    }

    /**
     * Returns the number of portraits.
     *
     * @return The number of portraits.
     */
    public getNumPortraits(): number {
        return this.portraits.length;
    }

    /**
     * Returns the portrait with the given index.
     *
     * @param index  The index of the portrait to return.
     * @return The portrait.
     */
    public getPortrait(index: number): Portrait {
        if (index < 0 || index >= this.portraits.length) {
            throw new Error("Index out of bounds: " + index);
        }
        return this.portraits[index];
    }

    /**
     * Reads portraits from the given array.
     *
     * @param array  The array to read the portraits from.
     * @return The read portraits.
     */
    public static fromArray(array: Uint8Array): Portraits {
        const reader = new BinaryReader(array);

        const portraits: Portrait[] = [];
        while (reader.hasData()) {
            portraits.push(Portrait.read(reader));
        }
        return new Portraits(...portraits);
    }

    /**
     * Reads portraits from the given blob.
     *
     * @param blob  The ALLPICS1 or ALLPICS2 blob to read.
     * @return The read portraits.
     */
    public static fromBlob(blob: Blob): Promise<Portraits> {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();
                reader.onload = event => {
                    resolve(Portraits.fromArray(new Uint8Array(reader.result as ArrayBuffer)));
                };
                reader.onerror = event => {
                    reject(new Error("Unable to read portraits from blob: " + reader.error));
                };
                reader.readAsArrayBuffer(blob);
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * Reads portraits from the two given arrays.
     *
     * @param array1  The array with the ALLPICS1 file content.
     * @param array2  The array with the ALLPICS2 file content.
     * @return The read portraits.
     */
    public static fromArrays(array1: Uint8Array, array2: Uint8Array): Portraits {
        return new Portraits(...this.fromArray(array1).portraits, ...this.fromArray(array2).portraits);
    }

    /**
     * Reads portraits from the two given blobs.
     *
     * @param blob1  The ALLPICS1 blob to read.
     * @param blob2  The ALLPICS2 blob to read
     * @return The read portraits.
     */
    public static async fromBlobs(blob1: Blob, blob2: Blob): Promise<Portraits> {
        return new Portraits(
            ...(await this.fromBlob(blob1)).portraits,
            ...(await this.fromBlob(blob2)).portraits
        );
    }
}
