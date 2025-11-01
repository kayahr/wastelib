/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import type { BinaryReader } from "../io/BinaryReader.ts";
import { PortraitScriptLine } from "./PortraitScriptLine.ts";

/**
 * A portrait animation script.
 */
export class PortraitScript {
    /** The script lines. */
    private readonly lines: PortraitScriptLine[];

    /**
     * Creates a portrait animation script.
     *
     * @param lines  The script lines.
     */
    private constructor(lines: PortraitScriptLine[]) {
        this.lines = lines;
    }

    /**
     * Returns the animation script lines.
     *
     * @returns The animation script lines.
     */
    public getLines(): PortraitScriptLine[] {
        return this.lines.slice();
    }

    /**
     * Returns the animation script line with the given index.
     *
     * @param index  The index of the animation script line.
     * @returns The animation script line.
     */
    public getLine(index: number): PortraitScriptLine {
        if (index < 0 || index >= this.lines.length) {
           throw new Error(`Index out of bounds: ${index}`);
        }
        return this.lines[index];
    }

    /**
     * Returns the number of script lines.
     *
     * @returns The number of script lines.
     */
    public getNumLines(): number {
        return this.lines.length;
    }

    /**
     * Reads a portrait animation script.
     *
     * @param reader  The reader to read the script from.
     * @returns The read portrait animation script.
     */
    public static read(reader: BinaryReader): PortraitScript {
        let delay: number;
        const lines: PortraitScriptLine[] = [];
        while ((delay = reader.readUint8()) !== 0xff) {
            const update = reader.readUint8();
            lines.push(new PortraitScriptLine(delay, update));
        }
        return new PortraitScript(lines);
    }
}
