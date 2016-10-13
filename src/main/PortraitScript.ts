/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { BinaryReader } from "./BinaryReader";
import { PortraitScriptLine } from "./PortraitScriptLine";

/**
 * A portrait animation script.
 */
export class PortraitScript {
    /** The script lines. */
    private lines: PortraitScriptLine[];

    /**
     * Creates a portrait animation script.
     *
     * @param lines
     *            The script lines.
     */
    private constructor(lines: PortraitScriptLine[]) {
        this.lines = lines;
    }

    /**
     * Returns the animation script lines.
     *
     * @return The animation script lines.
     */
    public getLines(): PortraitScriptLine[] {
        return this.lines.slice();
    }

    /**
     * Reads a portrait animation script.
     *
     * @param reader
     *            The reader to read the script from.
     * @return The read portrait animation script.
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
