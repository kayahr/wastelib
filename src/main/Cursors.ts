/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { Cursor } from "./Cursor";

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
     * Parses the mouse cursor images from the given array buffer and returns it.
     *
     * @param buffer
     *            The array buffer with the CURS file content to parse.
     * @return The parsed mouse cursors.
     */
    public static fromArrayBuffer(buffer: ArrayBuffer): Cursors {
        const cursors: Cursor[] = [];
        for (let i = 0; i < 8; ++i) {
            cursors.push(Cursor.fromArrayBuffer(buffer, i * 256));
        }
        return new Cursors(cursors);
    }

    /**
     * Parses mouse cursor images from the given file and returns it.
     *
     * @param file
     *            The CURS file to read.
     * @return The parsed mouse cursors.
     */
    public static fromFile(file: File): Promise<Cursors> {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();
                reader.onload = () => {
                    resolve(Cursors.fromArrayBuffer(reader.result));
                };
                reader.onerror = () => {
                    reject(new Error("Unable to read cursors from file " + file.name));
                };
                reader.readAsArrayBuffer(file);
            } catch (e) {
                reject(e);
            }
        });
    }
}
