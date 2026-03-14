/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { type CanvasLike, type ToCanvas, getCanvasContext2D } from "../sys/canvas.ts";
import { toError } from "../sys/error.ts";
import { Sprite } from "./Sprite.ts";

/**
 * Container for the 10 sprites defined in the ic0_9.wlf and masks.wlf files.
 */
export class Sprites implements ToCanvas {
    /** The character images of the font. */
    private readonly sprites: Sprite[];

    /**
     * Creates a new sprite set with the given sprites.
     *
     * @param sprites  The sprite images.
     */
    private constructor(sprites: Sprite[]) {
        this.sprites = sprites;
    }

    /**
     * Returns array with all sprite images.
     *
     * @returns The sprite images.
     */
    public getSprites(): Sprite[] {
        return this.sprites.slice();
    }

    /**
     * Returns the sprite image with the given index.
     *
     * @param index  The index of the sprite.
     * @returns The sprite image.
     */
    public getSprite(index: number): Sprite {
        if (index < 0 || index >= this.sprites.length) {
            throw new Error(`Index out of bounds: ${index}`);
        }
        return this.sprites[index];
    }

    /**
     * Returns the number of sprites.
     *
     * @returns The number of sprites.
     */
    public getNumSprites(): number {
        return this.sprites.length;
    }

    /**
     * Parses sprites from the given arrays and returns it.
     *
     * @param imageArray  The image data array with the ico0_9.wlf file content to parse.
     * @param maskArray   The transparency mask array with the masks.wlf file content to parse.
     * @returns The parsed sprites.
     */
    public static fromArrays(imageArray: Uint8Array, maskArray: Uint8Array): Sprites {
        const sprites: Sprite[] = [];
        for (let i = 0; i < 10; ++i) {
            sprites.push(Sprite.fromArray(imageArray, maskArray, i * 128, i * 32));
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
    public static fromBlobs(imagesBlob: Blob, masksBlob: Blob): Promise<Sprites> {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();
                reader.addEventListener("load", event => {
                    try {
                        const masksReader = new FileReader();
                        masksReader.addEventListener("load", event => {
                            resolve(Sprites.fromArrays(new Uint8Array(reader.result as ArrayBuffer),
                                new Uint8Array(masksReader.result as ArrayBuffer)));
                        });
                        masksReader.addEventListener("error", event => {
                            reject(new Error(`Unable to read sprite masks from blob: ${reader.error}`));
                        });
                        masksReader.readAsArrayBuffer(masksBlob);
                    } catch (error) {
                        reject(toError(error));
                    }
                });
                reader.addEventListener("error", event => {
                    reject(new Error(`Unable to read sprite images from blob: ${reader.error}`));
                });
                reader.readAsArrayBuffer(imagesBlob);
            } catch (error) {
                reject(toError(error));
            }
        });
    }

    /** @inheritdoc */
    public toCanvas<T extends CanvasLike>(canvas: T): T {
        const cursors = this.sprites;
        const numSprites = cursors.length;
        canvas.width = 256;
        canvas.height = Math.ceil(numSprites / 16) * 16;
        const ctx = getCanvasContext2D(canvas);
        for (let i = 0; i < numSprites; ++i) {
            this.getSprite(i).draw(ctx, (i & 15) << 4, i >> 4 << 4);
        }
        return canvas;
    }
}
