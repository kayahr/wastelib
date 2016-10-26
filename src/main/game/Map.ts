/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { BinaryReader } from "../io/BinaryReader";

/**
 * Container for the tilesets of the two allhtds files.
 */
export class Map {
    /**
     * Creates a new tilesets container with the given tilesets.
     *
     * @param chars  The tilesets.
     */
    private constructor() {
    }

    /**
     * Reads game data from the given array.
     *
     * @param buffer  The array to read the game data from.
     * @return The read game data.
     */
    public static read(reader: BinaryReader): Map {
        const msq = reader.readString(3);
        if (msq !== "msq") {
            throw new Error("Invalid msq header: " + msq);
        }
        const disk = reader.readChar();
        if (disk !== "0" && disk !== "1") {
            throw new Error("Invalid msq disk number: " + disk);
        }
        throw new Error("Not implemented");
    }
}
