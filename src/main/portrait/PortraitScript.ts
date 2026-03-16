/*
 * Copyright (c) 2016 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import type { BinaryReader } from "../io/BinaryReader.ts";
import { PortraitScriptLine } from "./PortraitScriptLine.ts";

/**
 * A portrait animation script.
 */
export class PortraitScript {
    /** The script lines. */
    readonly #lines: PortraitScriptLine[];

    /**
     * Creates a portrait animation script.
     *
     * @param lines - The script lines.
     */
    private constructor(lines: PortraitScriptLine[]) {
        this.#lines = lines;
    }

    /**
     * Returns the animation script line with the given index.
     *
     * @param index - The index of the animation script line.
     * @returns The animation script line.
     * @throws {@link !RangeError} if the index is out of bounds.
     */
    public getLine(index: number): PortraitScriptLine {
        if (index < 0 || index >= this.#lines.length) {
           throw new RangeError(`Index out of bounds: ${index}`);
        }
        return this.#lines[index];
    }

    /**
     * @returns The number of script lines.
     */
    public getLineCount(): number {
        return this.#lines.length;
    }

    /**
     * Reads a portrait animation script.
     *
     * @param reader  The reader to read the script from.
     * @returns The read portrait animation script.
     * @internal
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
