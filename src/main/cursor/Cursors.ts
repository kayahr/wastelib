/*
 * Copyright (c) 2016 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import { type CanvasLike, type ToCanvas, getCanvasContext2D } from "../sys/canvas.ts";
import { toError } from "../sys/error.ts";
import { Cursor } from "./Cursor.ts";

/**
 * Container for the 8 mouse cursors in the CURS file.
 */
export class Cursors implements ToCanvas {
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

    /** @inheritdoc */
    public toCanvas<T extends CanvasLike>(canvas: T): T {
        const cursors = this.cursors;
        const numCursors = cursors.length;
        canvas.width = 256;
        canvas.height = Math.ceil(numCursors / 16) * 16;
        const ctx = getCanvasContext2D(canvas);
        for (let i = 0; i < numCursors; ++i) {
            this.getCursor(i).draw(ctx, (i & 15) << 4, i >> 4 << 4);
        }
        return canvas;
    }
}
