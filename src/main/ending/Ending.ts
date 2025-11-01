/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import type { Animation } from "../image/Animation.ts";
import type { BaseImage } from "../image/BaseImage.ts";
import { PicImage } from "../image/PicImage.ts";
import { BinaryReader } from "../io/BinaryReader.ts";
import { decodeHuffman } from "../io/huffman.ts";
import { decodeVxorInplace } from "../io/vxor.ts";
import { toError } from "../sys/error.ts";
import { EndingPlayer } from "./EndingPlayer.ts";
import { EndingUpdate } from "./EndingUpdate.ts";

/**
 * Contains the base frame of the ending animation but also provides methods to access the animation information.
 * To simply play the animation it is recommended to use the [[EndingPlayer]] class.
 */
export class Ending extends PicImage implements Animation {
    /** The animation updates. */
    private readonly updates: EndingUpdate[];

    /**
     * Creates a new end animation with the given image and animation data.
     *
     * @param baseFrame  The (vxor-decoded) image data of the base frame of the end animation.
     * @param updates    The animation updates.
     */
    private constructor(baseFrame: Uint8Array, updates: EndingUpdate[]) {
        super(baseFrame, 288, 128);
        this.updates = updates;
    }

    /**
     * Returns the animation updates.
     *
     * @returns The animation updates.
     */
    public getUpdates(): EndingUpdate[] {
        return this.updates.slice();
    }

    /**
     * Returns the animation update with the given index.
     *
     * @param index  Animation update index.
     * @returns The animation update.
     */
    public getUpdate(index: number): EndingUpdate {
        if (index < 0 || index >= this.updates.length) {
            throw new Error(`Index out of bounds: ${index}`);
        }
        return this.updates[index];
    }

    /**
     * Returns the number of animation updates.
     *
     * @returns The number of animation updates.
     */
    public getNumUpdates(): number {
        return this.updates.length;
    }

    public createPlayer(onDraw: (frame: BaseImage) => void): EndingPlayer {
        return new EndingPlayer(this, onDraw);
    }

    /**
     * Parses a end animation from the given array and returns it.
     *
     * @param array - The array containing the two encoded MSQ blocks with the base frame and animation data.
     * @returns The parsed end animation.
     */
    public static fromArray(array: Uint8Array): Ending {
        const reader = new BinaryReader(array);

        // Parse base frame from first MSQ block
        const imageSize = reader.readUint32();
        const imageMsq = reader.readString(3);
        const imageDisk = reader.readUint8();
        if (imageMsq !== "msq" || imageDisk !== 0) {
            throw new Error("Invalid base frame data block");
        }
        const baseFrame = decodeVxorInplace(decodeHuffman(reader, imageSize), 144);

        // Parse animation updates from second MSQ block
        const animSize = reader.readUint32();
        const [ m, s, q ] = reader.readUint8s(3);
        const animDisk = reader.readUint8();
        if (m !== 0x08 || s !== 0x67 || q !== 0x01 || animDisk !== 0) {
            throw new Error("Invalid animation data block");
        }
        const animData = decodeHuffman(reader, animSize);
        const animReader = new BinaryReader(animData);
        const animSize2 = animReader.readUint16();
        if (animSize2 !== animSize - 4) {
            throw new Error("Invalid animation data block size");
        }
        const updates: EndingUpdate[] = [];
        let update: EndingUpdate | null;
        while ((update = EndingUpdate.read(animReader)) != null) {
            updates.push(update);
        }
        if (animReader.readUint16() !== 0) {
            throw new Error("Invalid animation data block end");
        }

        // Create the end animation
        return new Ending(baseFrame, updates);
    }

    /**
     * Reads the end animation from the given blob and returns it.
     *
     * @param blob  The END.CPA blob.
     * @returns The read end animation.
     */
    public static fromBlob(blob: Blob): Promise<Ending> {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();
                reader.addEventListener("load", event => {
                    resolve(Ending.fromArray(new Uint8Array(reader.result as ArrayBuffer)));
                });
                reader.addEventListener("error", event => {
                    reject(new Error(`Unable to read end animation from blob: ${reader.error}`));
                });
                reader.readAsArrayBuffer(blob);
            } catch (error) {
                reject(toError(error));
            }
        });
    }
}
