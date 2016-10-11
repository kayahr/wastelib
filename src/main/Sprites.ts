/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { Sprite } from "./Sprite";

/**
 * Container for the 10 sprites defined in the ic0_9.wlf and masks.wlf files.
 */
export class Sprites {
    /** The character images of the font. */
    private sprites: Sprite[];

    /**
     * Creates a new sprite set with the given sprites.
     *
     * @parm sprites
     *           The sprite images.
     */
    private constructor(sprites: Sprite[]) {
        this.sprites = sprites;
    }

    /**
     * Returns array with all sprite images.
     *
     * @return The sprite images.
     */
    public getSprites(): Sprite[] {
        return this.sprites.slice();
    }

    /**
     * Returns the sprite image with the given index.
     *
     * @param index
     *            The index of the sprite.
     * @return The sprite image.
     */
    public getSprite(index: number): Sprite {
        if (index < 0 || index >= this.sprites.length) {
            throw new Error("Index out of bounds: " + index);
        }
        return this.sprites[index];
    }

    /**
     * Returns the number of srpites.
     *
     * @return The number of sprites.
     */
    public getNumSprites(): number {
        return this.sprites.length;
    }

    /**
     * Parses sprites from the given arrays and returns it.
     *
     * @param imageArray
     *            The image data array with the ico0_9.wlf file content to parse.
     * @param maskArray
     *            The transparency mask array with the masks.wlf file content to parse.
     * @return The parsed sprites.
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
     * @param imagesBlob
     *            The IC0_9.WLF blob to read.
     * @param masksFile
     *            The MASKS.WLF blob to read.
     * @return The read sprites.
     */
    public static fromBlobs(imagesBlob: Blob, masksBlob: Blob): Promise<Sprites> {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();
                reader.onload = event => {
                    try {
                        const masksReader = new FileReader();
                        masksReader.onload = event => {
                            resolve(Sprites.fromArrays(new Uint8Array(reader.result),
                                new Uint8Array(masksReader.result)));
                        };
                        masksReader.onerror = event => {
                            reject(new Error("Unable to read sprite masks from blob: " + event.error));
                        };
                        masksReader.readAsArrayBuffer(masksBlob);
                    } catch (e) {
                        reject(e);
                    }
                };
                reader.onerror = event => {
                    reject(new Error("Unable to read sprite images from blob: " + event.error));
                };
                reader.readAsArrayBuffer(imagesBlob);
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * Creates and returns a new canvas containing all the sprites.
     *
     * @return The created canvas.
     */
    public toCanvas(): HTMLCanvasElement {
        const cursors = this.sprites;
        const numSprites = cursors.length;
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = Math.ceil(numSprites / 16) * 16;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Unable to create 2D rendering context");
        }
        for (let i = 0; i < numSprites; ++i) {
            this.getSprite(i).draw(ctx, (i & 15) << 4, i >> 4 << 4);
        }
        return canvas;
    }

    /**
     * Creates and returns an image data URL of an image with all sprites.
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
     * Creates and returns a HTML image with all sprites.
     *
     * @param type
     *            Optional image mime type. Defaults to image/png.
     * @param args
     *            Optional additional encoder parameters. For image/jpeg this is the image quality between 0 and 1
     *            with a default value of 0.92.
     * @return The created HTML image.
     */
    public toImage(type?: string, ...args: any[]): HTMLImageElement {
        const image = new Image();
        image.src = this.toDataUrl(type, ...args);
        return image;
    }
}
