/*
 * Copyright (c) 2016 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import { Sprite } from "./Sprite.ts";

/**
 * Container for the 10 sprites defined in the ic0_9.wlf and masks.wlf files.
 */
export class Sprites implements Iterable<Sprite> {
    /** The character images of the font. */
    readonly #sprites: Sprite[];

    /**
     * Creates a new sprite set with the given sprites.
     *
     * @param sprites - The sprite images.
     */
    private constructor(sprites: Sprite[]) {
        this.#sprites = sprites;
    }

    /**
     * @yields The sprites.
     */
    public *[Symbol.iterator](): Generator<Sprite> {
        for (const sprite of this.#sprites) {
            yield sprite;
        }
    }

    /**
     * Returns the sprite image with the given index.
     *
     * @param index - The index of the sprite.
     * @returns The sprite image.
     * @throws {@link !RangeError} when index is out of bounds.
     */
    public getSprite(index: number): Sprite {
        if (index < 0 || index >= this.#sprites.length) {
            throw new RangeError(`Index out of bounds: ${index}`);
        }
        return this.#sprites[index];
    }

    /**
     * @returns The number of sprites.
     */
    public getSize(): number {
        return this.#sprites.length;
    }

    /**
     * Parses sprites from the given arrays and returns it.
     *
     * @param imageArray - The image data array with the ico0_9.wlf file content to parse.
     * @param maskArray  - The transparency mask array with the masks.wlf file content to parse.
     * @returns The parsed sprites.
     */
    public static fromArrays(imageArray: Uint8Array, maskArray: Uint8Array): Sprites {
        const sprites: Sprite[] = [];
        for (let i = 0; i < 10; ++i) {
            sprites.push(new Sprite(imageArray, maskArray, i * 128, i * 32));
        }
        return new Sprites(sprites);
    }

    /**
     * Reads sprites from the given blobs and returns it.
     *
     * @param imagesBlob - The IC0_9.WLF blob to read.
     * @param masksBlob  - The MASKS.WLF blob to read.
     * @returns The read sprites.
     */
    public static async fromBlobs(imagesBlob: Blob, masksBlob: Blob): Promise<Sprites> {
        return Sprites.fromArrays(new Uint8Array(await imagesBlob.arrayBuffer()), new Uint8Array(await masksBlob.arrayBuffer()));
    }
}
