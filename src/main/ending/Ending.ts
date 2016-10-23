/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { PicImage } from "../image/PicImage";
import { BinaryReader } from "../io/BinaryReader";
import { decodeVxorInplace } from "../io/vxor";
import { decodeHuffman } from "../io/huffman";
import { EndingUpdate } from "./EndingUpdate";

/**
 * The end animation. Contains the base frame image but also provides methods to access the animation information.
 * To simply play the animation it is recommended to use the `EndingPlayer` class.
 */
export class Ending extends PicImage {
    /** The animation frames. */
    private updates: EndingUpdate[];

    /**
     * Creates a new end animation with the given image and animation data.
     *
     * @param baseFrame
     *            The (vxor-decoded) image data of the base frame of the end animation.
     * @param frames
     *            The animation frames.
     */
    private constructor(baseFrame: Uint8Array, updates: EndingUpdate[]) {
        super(baseFrame, 288, 128);
        this.updates = updates;
    }

    /**
     * Returns the animation frames.
     *
     * @return The animation frames
     */
    public getFrames(): EndingUpdate[] {
        return this.updates.slice();
    }

    /**
     * Returns the animation frame with the given index.
     *
     * @param index
     *            Animation frame index.
     * @return The animation frame.
     */
    public getFrame(index: number): EndingUpdate {
        if (index < 0 || index >= this.updates.length) {
            throw new Error("Index out of bounds: " + index);
        }
        return this.updates[index];
    }

    /**
     * Returns the number of animation frames (Base frame not included).
     *
     * @return THe number of animation frames.
     */
    public getNumFrames(): number {
        return this.updates.length;
    }

    /**
     * Parses a end animation from the given array and returns it.
     *
     * @param data
     *            The array containing the two encoded MSQ blocks with the base frame and animation data.
     * @return The parsed end animation.
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

        // Parse animation frames from second MSQ bloack
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
        const frames: EndingUpdate[] = [];
        let frame: EndingUpdate | null;
        while (frame = EndingUpdate.read(animReader)) {
            frames.push(frame);
        }
        if (animReader.readUint16() !== 0) {
            throw new Error("Invalid animation data block end");
        }

        // Create the end animation
        return new Ending(baseFrame, frames);
    }

    /**
     * Reads the end animation from the given blob and returns it.
     *
     * @param blob
     *            The END.CPA blob.
     * @return The read end animation.
     */
    public static fromBlob(blob: Blob): Promise<Ending> {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();
                reader.onload = event => {
                    resolve(Ending.fromArray(new Uint8Array(reader.result)));
                };
                reader.onerror = event => {
                    reject(new Error("Unable to read end animation from blob: " + event.error));
                };
                reader.readAsArrayBuffer(blob);
            } catch (e) {
                reject(e);
            }
        });
    }
}