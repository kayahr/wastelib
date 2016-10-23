/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { FontChar } from "./FontChar";
import { createCanvas } from "../sys/canvas";
import { createImage } from "../sys/image";

/**
 * Container for the 172 font characters of the colorf.fnt file.
 */
export class Font {
    /** The character images of the font. */
    private chars: FontChar[];

    /**
     * Creates a new font container with the given font characters.
     *
     * @parm chars
     *           The font character images.
     */
    private constructor(chars: FontChar[]) {
        this.chars = chars;
    }

    /**
     * Returns array with all font character images.
     *
     * @return The font character images.
     */
    public getChars(): FontChar[] {
        return this.chars.slice();
    }

    /**
     * Returns the font character image with the given index.
     *
     * @param index
     *            The index of the font character.
     * @return The font character image.
     */
    public getChar(index: number): FontChar {
        if (index < 0 || index >= this.chars.length) {
            throw new Error("Index out of bounds: " + index);
        }
        return this.chars[index];
    }

    /**
     * Returns the number of characters.
     *
     * @return THe number of characters.
     */
    public getNumChars(): number {
        return this.chars.length;
    }

    /**
     * Parses a font from the given array and returns it.
     *
     * @param buffer
     *            The array with the colorf.fnt file content to parse.
     * @return The parsed font.
     */
    public static fromArray(array: Uint8Array): Font {
        const chars: FontChar[] = [];
        for (let i = 0; i < 172; ++i) {
            chars.push(FontChar.fromArray(array, i * 32));
        }
        return new Font(chars);
    }

    /**
     * Reads the color font from the given blob and returns it.
     *
     * @param blob
     *            The COLORF.FNT blob to read.
     * @return The read font.
     */
    public static fromBlob(blob: Blob): Promise<Font> {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();
                reader.onload = event => {
                    resolve(Font.fromArray(new Uint8Array(reader.result)));
                };
                reader.onerror = event => {
                    reject(new Error("Unable to read color font from blob: " + event.error));
                };
                reader.readAsArrayBuffer(blob);
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * Creates and returns a new canvas containing all characters of the font. 16 characters per row.
     *
     * @return The created canvas.
     */
    public toCanvas(): HTMLCanvasElement {
        const chars = this.chars;
        const numChars = chars.length;
        const canvas = createCanvas(128, Math.ceil(numChars / 8) * 8);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Unable to create 2D rendering context");
        }
        for (let i = 0; i < numChars; ++i) {
            this.getChar(i).draw(ctx, (i & 15) << 3, i >> 4 << 3);
        }
        return canvas;
    }

    /**
     * Creates and returns a font image data URL. 16 font characters per row.
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
     * Creates and returns a HTML image of the font. 16 font characters per row.
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
