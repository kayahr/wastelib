/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { Cursor } from "./Cursor";
import { createCanvas } from "./canvas";
import { createImage } from "./image";

/**
 * Container for the 8 mouse cursors in the CURS file.
 */
export class Cursors {
    /** The mouse cursor images. */
    private cursors: Cursor[];

    /**
     * Creates a new mouse cursor container with the given cursors.
     *
     * @parm chars
     *           The mouse cursor images.
     */
    private constructor(cursors: Cursor[]) {
        this.cursors = cursors;
    }

    /**
     * Returns array with all mouse cursor images.
     *
     * @return The mouse cursor images.
     */
    public getCursors(): Cursor[] {
        return this.cursors.slice();
    }

    /**
     * Returns the mouse cursor image with the given index.
     *
     * @param index
     *            The index of the mouse cursor image.
     * @return The mouse cursor image.
     */
    public getCursor(index: number): Cursor {
        if (index < 0 || index >= this.cursors.length) {
            throw new Error("Index out of bounds: " + index);
        }
        return this.cursors[index];
    }

    /**
     * Returns the number of mouse cursors.
     *
     * @return THe number of mouse cursors.
     */
    public getNumCursors(): number {
        return this.cursors.length;
    }

    /**
     * Parses the mouse cursor images from the given array and returns it.
     *
     * @param buffer
     *            The array with the CURS file content to parse.
     * @return The parsed mouse cursors.
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
     * @param file
     *            The CURS blob to read.
     * @return The read mouse cursors.
     */
    public static fromBlob(blob: Blob): Promise<Cursors> {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();
                reader.onload = event => {
                    resolve(Cursors.fromArray(new Uint8Array(reader.result)));
                };
                reader.onerror = event => {
                    reject(new Error("Unable to read cursors from blob: " + event.error));
                };
                reader.readAsArrayBuffer(blob);
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * Creates and returns a new canvas containing all the mouse cursors.
     *
     * @return The created canvas.
     */
    public toCanvas(): HTMLCanvasElement {
        const cursors = this.cursors;
        const numCursors = cursors.length;
        const canvas = createCanvas(256, Math.ceil(numCursors / 16) * 16);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
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
     * @param type
     *            Optional image mime type. Defaults to image/png.
     * @param args
     *            Optional additional encoder parameters. For image/jpeg this is the image quality between 0 and 1
     *            with a default value of 0.92.
     * @return The created data URL.
     */
    public toDataUrl(type?: string, ...args: any[]): string {
        return this.toCanvas().toDataURL(type, ...args);
    }

    /**
     * Creates and returns a HTML image with all mouse cursors.
     *
     * @param type
     *            Optional image mime type. Defaults to image/png.
     * @param args
     *            Optional additional encoder parameters. For image/jpeg this is the image quality between 0 and 1
     *            with a default value of 0.92.
     * @return The created HTML image.
     */
    public toImage(type?: string, ...args: any[]): HTMLImageElement {
        const image = createImage();
        image.src = this.toDataUrl(type, ...args);
        return image;
    }
}
