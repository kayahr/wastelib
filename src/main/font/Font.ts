/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { type CanvasLike, type ToCanvas, getCanvasContext2D } from "../sys/canvas.ts";
import { toError } from "../sys/error.ts";
import { FontChar } from "./FontChar.ts";

/**
 * Container for the 172 font characters of the COLORF.FNT file.
 */
export class Font implements ToCanvas {
    /** The character images of the font. */
    private readonly chars: FontChar[];

    /**
     * Creates a new font container with the given font characters.
     *
     * @param chars  The font character images.
     */
    private constructor(chars: FontChar[]) {
        this.chars = chars;
    }

    /**
     * Returns array with all font character images.
     *
     * @returns The font character images.
     */
    public getChars(): FontChar[] {
        return this.chars.slice();
    }

    /**
     * Returns the font character image with the given index.
     *
     * @param index  The index of the font character.
     * @returns The font character image.
     */
    public getChar(index: number): FontChar {
        if (index < 0 || index >= this.chars.length) {
            throw new Error(`Index out of bounds: ${index}`);
        }
        return this.chars[index];
    }

    /**
     * Returns the number of characters.
     *
     * @returns The number of characters.
     */
    public getNumChars(): number {
        return this.chars.length;
    }

    /**
     * Parses a font from the given array and returns it.
     *
     * @param array - The array with the colorf.fnt file content to parse.
     * @returns The parsed font.
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
     * @param blob  The COLORF.FNT blob to read.
     * @returns The read font.
     */
    public static fromBlob(blob: Blob): Promise<Font> {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();
                reader.addEventListener("load", event => {
                    resolve(Font.fromArray(new Uint8Array(reader.result as ArrayBuffer)));
                });
                reader.addEventListener("error", event => {
                    reject(new Error(`Unable to read color font from blob: ${reader.error}`));
                });
                reader.readAsArrayBuffer(blob);
            } catch (error) {
                reject(toError(error));
            }
        });
    }

    /** @inheritdoc */
    public toCanvas<T extends CanvasLike>(canvas: T): T {
        const chars = this.chars;
        const numChars = chars.length;
        canvas.width = 128;
        canvas.height = Math.ceil(numChars / 8) * 8;
        const ctx = getCanvasContext2D(canvas);
        for (let i = 0; i < numChars; ++i) {
            this.getChar(i).draw(ctx, (i & 15) << 3, i >> 4 << 3);
        }
        return canvas;
    }
}
