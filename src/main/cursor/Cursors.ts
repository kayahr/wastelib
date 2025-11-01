/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { createCanvas } from "../sys/canvas.ts";
import { toError } from "../sys/error.ts";
import { createImage } from "../sys/image.ts";
import { Cursor } from "./Cursor.ts";

/**
 * Container for the 8 mouse cursors in the CURS file.
 */
export class Cursors {
    /** The mouse cursor images. */
    private readonly cursors: Cursor[];

    /**
     * Creates a new mouse cursor container with the given cursors.
     *
     * @param chars  The mouse cursor images.
     */
    private constructor(cursors: Cursor[]) {
        this.cursors = cursors;
    }

    /**
     * Returns array with all mouse cursor images.
     *
     * @returns The mouse cursor images.
     */
    public getCursors(): Cursor[] {
        return this.cursors.slice();
    }

    /**
     * Returns the mouse cursor image with the given index.
     *
     * @param index  The index of the mouse cursor image.
     * @returns The mouse cursor image.
     */
    public getCursor(index: number): Cursor {
        if (index < 0 || index >= this.cursors.length) {
            throw new Error(`Index out of bounds: ${index}`);
        }
        return this.cursors[index];
    }

    /**
     * Returns the number of mouse cursors.
     *
     * @returns THe number of mouse cursors.
     */
    public getNumCursors(): number {
        return this.cursors.length;
    }

    /**
     * Parses the mouse cursor images from the given array and returns it.
     *
     * @param array - The array with the CURS file content to parse.
     * @returns The parsed mouse cursors.
     */
    public static fromArray(array: Uint8Array): Cursors {
        const cursors: Cursor[] = [];
        for (let i = 0; i < 8; ++i) {
            cursors.push(Cursor.fromArray(array, i * 256));
        }
        return new Cursors(cursors);
    }

    /**
     * Reads mouse cursor images from the given blob and returns it.
     *
     * @param blob - The CURS blob to read.
     * @returns The read mouse cursors.
     */
    public static fromBlob(blob: Blob): Promise<Cursors> {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();
                reader.addEventListener("load", event => {
                    resolve(Cursors.fromArray(new Uint8Array(reader.result as ArrayBuffer)));
                });
                reader.addEventListener("error", event => {
                    reject(new Error(`Unable to read cursors from blob: ${reader.error}`));
                });
                reader.readAsArrayBuffer(blob);
            } catch (error) {
                reject(toError(error));
            }
        });
    }

    /**
     * Creates and returns a new canvas containing all the mouse cursors.
     *
     * @returns The created canvas.
     */
    public toCanvas(): HTMLCanvasElement {
        const cursors = this.cursors;
        const numCursors = cursors.length;
        const canvas = createCanvas(256, Math.ceil(numCursors / 16) * 16);
        const ctx = canvas.getContext("2d");
        if (ctx == null) {
            throw new Error("Unable to create 2D rendering context");
        }
        for (let i = 0; i < numCursors; ++i) {
            this.getCursor(i).draw(ctx, (i & 15) << 4, i >> 4 << 4);
        }
        return canvas;
    }

    /**
     * Creates and returns an image data URL of an image with all mouse cursors.
     *
     * @param type    - Optional image mime type. Defaults to image/png.
     * @param quality - Optional quality parameter for encoder. For image/jpeg this is the image quality between 0 and
     *                  1 with a default value of 0.92.
     * @returns The created data URL.
     */
    public toDataUrl(type?: string, quality?: number): string {
        const canvas = this.toCanvas();
        return canvas.toDataURL(type, quality);
    }

    /**
     * Creates and returns a HTML image with all mouse cursors.
     *
     * @param type    - Optional image mime type. Defaults to image/png.
     * @param quality - Optional quality parameter for encoder. For image/jpeg this is the image quality between 0 and
     *                  1 with a default value of 0.92.
     * @returns The created HTML image.
     */
    public toImage(type?: string, quality?: number): HTMLImageElement {
        const image = createImage();
        image.src = this.toDataUrl(type, quality);
        return image;
    }
}
