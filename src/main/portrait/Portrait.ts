/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { PicImage } from "../image/PicImage";
import { BinaryReader } from "../io/BinaryReader";
import { decodeVxorInplace } from "../io/vxor";
import { decodeHuffman } from "../io/huffman";
import { PortraitUpdate } from "./PortraitUpdate";
import { PortraitScript } from "./PortraitScript";

/**
 * An animated portrait image. Contains the base frame image but also provides methods to access the animation
 * information. To simply play the animation it is recommended to use the [[PortraitPlayer]] class.
 */
export class Portrait extends PicImage {
    /** The animation scripts. */
    private scripts: PortraitScript[];

    /** The animation updates. */
    private updates: PortraitUpdate[];

    /**
     * Creates a new portrait with the given base frame, animation scripts and animation updates.
     *
     * @param baseFrame  The image data of the base frame.
     * @param scripts    The animation scripts.
     * @param updates    The animation updates.
     */
    private constructor(baseFrame: Uint8Array, scripts: PortraitScript[], updates: PortraitUpdate[]) {
        super(baseFrame, 96, 84);
        this.scripts = scripts;
        this.updates = updates;
    }

    /**
     * Returns the animation scripts.
     *
     * @return The animation scripts.
     */
    public getScripts(): PortraitScript[] {
        return this.scripts.slice();
    }

    /**
     * Returns the animation script with the given index.
     *
     * @param index  Animation script index.
     * @return The animation script.
     */
    public getScript(index: number): PortraitScript {
        if (index < 0 || index >= this.scripts.length) {
            throw new Error("Index out of bounds: " + index);
        }
        return this.scripts[index];
    }

    /**
     * Returns the number of animation scripts.
     *
     * @return The number of animation scripts.
     */
    public getNumScripts(): number {
        return this.scripts.length;
    }

    /**
     * Returns the animation updates.
     *
     * @return The animation updates.
     */
    public getUpdates(): PortraitUpdate[] {
        return this.updates.slice();
    }

    /**
     * Returns the animation update with the given index.
     *
     * @param index  Animation update index.
     * @return The animation update.
     */
    public getUpdate(index: number): PortraitUpdate {
        if (index < 0 || index >= this.updates.length) {
            throw new Error("Index out of bounds: " + index);
        }
        return this.updates[index];
    }

    /**
     * Returns the number of animation updates.
     *
     * @return The number of animation updates.
     */
    public getNumUpdates(): number {
        return this.updates.length;
    }

    /**
     * Reads a portrait from the given reader and returns it.
     *
     * @param reader  The reader to read the two encoded MSQ blocks with the base frame and animation data from.
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

        // Parse animation frames from second MSQ block
        const animSize = reader.readUint32();
        const animMsq = reader.readString(3);
        const animDisk = reader.readUint8();
        if (animMsq !== "msq" || animDisk !== 0) {
            throw new Error("Invalid animation data block: " + animMsq +  animDisk + imageDisk);
        }
        const animData = decodeHuffman(reader, animSize);
        const animReader = new BinaryReader(animData);

        // Parse animation scripts
        const scriptsSize = animReader.readUint16();
        const scripts: PortraitScript[] = [];
        while (animReader.getByteIndex() - 2 < scriptsSize) {
            scripts.push(PortraitScript.read(animReader));
        }

        // Parse animation update blocks
        const updatesSize = animReader.readUint16();
        const startIndex = animReader.getByteIndex();
        const updates: PortraitUpdate[] = [];
        while (animReader.getByteIndex() - startIndex < updatesSize) {
            updates.push(PortraitUpdate.read(animReader));
        }

        // Create the end animation
        return new Portrait(baseFrame, scripts, updates);
    }
}
