/*
 * Copyright (c) 2016 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import { FontChar } from "./FontChar.ts";

/**
 * Container for the font characters of the COLORF.FNT file.
 */
export class Font implements Iterable<FontChar> {
    /** The character images of the font. */
    readonly #chars: FontChar[];

    /**
     * Creates a new font container with the given font characters.
     *
     * @param chars  The font character images.
     */
    private constructor(chars: FontChar[]) {
        this.#chars = chars;
    }

     /**
     * @yields The font characters.
     */
    public *[Symbol.iterator](): Generator<FontChar> {
        for (const char of this.#chars) {
            yield char;
        }
    }

    /**
     * Returns the font character image with the given index.
     *
     * @param index - The index of the font character.
     * @returns The font character image.
     * @throws {@link !RangeError} if the index is out of bounds.
     */
    public getChar(index: number): FontChar {
        if (index < 0 || index >= this.#chars.length) {
            throw new RangeError(`Index out of bounds: ${index}`);
        }
        return this.#chars[index];
    }

    /**
     * @returns The number of characters.
     */
    public getSize(): number {
        return this.#chars.length;
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
            chars.push(new FontChar(array, i * 32));
        }
        return new Font(chars);
    }

    /**
     * Reads the color font from the given blob and returns it.
     *
     * @param blob - The COLORF.FNT blob to read.
     * @returns The read font.
     */
    public static async fromBlob(blob: Blob): Promise<Font> {
        return Font.fromArray(new Uint8Array(await blob.arrayBuffer()));
    }
}
