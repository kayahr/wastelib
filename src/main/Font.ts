/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { FontChar } from "./FontChar";

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
     * Parses a font from the given array buffer and returns it.
     *
     * @param buffer
     *            The array buffer with the colorf.fnt file content to parse.
     * @return The parsed font.
     */
    public static fromArrayBuffer(buffer: ArrayBuffer): Font {
        const chars: FontChar[] = [];
        for (let i = 0; i < 172; ++i) {
            chars.push(FontChar.fromArrayBuffer(buffer, i * 32));
        }
        return new Font(chars);
    }

    /**
     * Parses a font from the given file and returns it.
     *
     * @param file
     *            The colorf.fnt file to read.
     * @return The parsed font.
     */
    public static fromFile(file: File): Promise<Font> {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();
                reader.onload = () => {
                    resolve(Font.fromArrayBuffer(reader.result));
                };
                reader.onerror = () => {
                    reject(new Error("Unable to read font from file " + file.name));
                };
                reader.readAsArrayBuffer(file);
            } catch (e) {
                reject(e);
            }
        });
    }
}
