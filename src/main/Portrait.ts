/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { PicImage } from "./PicImage";
import { BinaryReader } from "./BinaryReader";
import { decodeVxorInplace } from "./vxor";
import { decodeHuffman } from "./huffman";
import { PortraitFrame } from "./PortraitFrame";

/**
 * An animated portrait. Contains the base frame image but also provides methods to access the animation information.
 * To simply play the animation it is recommended to use the `PortraitPlayer` class.
 */
export class Portrait extends PicImage {
    /** The animation frames. */
    private frames: PortraitFrame[];

    /**
     * Creates a new portrait with the given base frame and animation frames.
     *
     * @param baseFrame
     *            The image data of the base frame.
     * @param frames
     *            The animation frames.
     */
    private constructor(baseFrame: ArrayLike<number>, frames: PortraitFrame[]) {
        super(baseFrame, 96, 84);
        this.frames = frames;
    }

    /**
     * Returns the animation frames.
     *
     * @return The animation frames
     */
    public getFrames(): PortraitFrame[] {
        return this.frames.slice();
    }

    /**
     * Returns the animation frame with the given index.
     *
     * @param index
     *            Animation frame index.
     * @return The animation frame.
     */
    public getFrame(index: number): PortraitFrame {
        if (index < 0 || index >= this.frames.length) {
            throw new Error("Index out of bounds: " + index);
        }
        return this.frames[index];
    }

    /**
     * Returns the number of animation frames (Base frame not included).
     *
     * @return THe number of animation frames.
     */
    public getNumFrames(): number {
        return this.frames.length;
    }

    /**
     * Reads a portrait from the given reader and returns it.
     *
     * @param reader
     *            The reader to read the two encoded MSQ blocks with the base frame and animation data from.
     * @return The parsed portrait.
     */
    public static read(reader: BinaryReader): Portrait {

        // Parse base frame from first MSQ block
        const imageSize = reader.readUint32();
        const imageMsq = reader.readString(3);
        const imageDisk = reader.readUint8();
        if (imageMsq !== "msq" || (imageDisk !== 0 && imageDisk !== 1)) {
            throw new Error("Invalid base frame data block");
        }
        const baseFrame = decodeVxorInplace(decodeHuffman(reader, imageSize), 48);

        // Parse animation frames from second MSQ bloack
        const animSize = reader.readUint32();
        const animMsq = reader.readString(3);
        const animDisk = reader.readUint8();
        if (animMsq !== "msq" || animDisk !== 0) {
            throw new Error("Invalid animation data block: " + animMsq +  animDisk + imageDisk);
        }
        const animData = decodeHuffman(reader, animSize);
        /*
        const animReader = new BinaryReader(animData);
        const animSize2 = animReader.readUint16();
        if (animSize2 !== animSize - 4) {
            throw new Error("Invalid animation data block size");
        }
        const frames: EndAnimFrame[] = [];
        let frame: EndAnimFrame | null;
        while (frame = EndAnimFrame.read(animReader)) {
            frames.push(frame);
        }
        if (animReader.readUint16() !== 0) {
            throw new Error("Invalid animation data block end");
        }
        */

        // Create the end animation
        return new Portrait(baseFrame, []);
    }
}
