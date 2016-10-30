/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { BinaryReader } from "./BinaryReader";

/**
 * Read string group pointers from the given reader. Invalid pointers are filtered out as good as possible.
 *
 * @param reader  The reader to read the string group pointers from.
 * @return        The found string group pointers.
 */
function readGroupPointers(reader: BinaryReader): number[] {
    const pointers: number[] = [];
    const pointer = reader.readUint16();
    pointers.push(pointer);
    let numGroups = (pointer >> 1);
    for (let i = 1; i < numGroups; ++i) {
        const pointer = reader.readUint16();
        pointers.push(pointer);
    }
    return pointers;
}

/**
 * Decodes a single string from the given reader.
 *
 * @param dictionary  The dictionary to use to decode the string.
 * @param reader      The reader to read the string from.
 * @return            The read string or null if end of data is reached.
 */
function readString(dictionary: string, reader: BinaryReader): string | null {
    let upper = false;
    let high = false;
    let string = "";
    while (reader.hasData(0, 5)) {
        const index = reader.readBits(5, true);
        switch (index) {
            case 0x1f:
                high = true;
                break;

            case 0x1e:
                upper = true;
                break;

            default:
                const char = dictionary.charAt(index + (high ? 0x1e : 0));
                if (char === "\0") {
                    return string;
                }
                string += upper ? char.toUpperCase() : char;
                upper = false;
                high = false;
        }
    }
    return null;
}

/**
 * Reads compressed strings (As used in the WL.EXE and GAME1/GAME2 files from the given reader and returns them.
 *
 * @param reader  The reader to read the compressed strings from.
 * @return        The read strings.
 */
export function readStrings(reader: BinaryReader): string[] {
    const dictionary = reader.readString(60);
    const base = reader.getByteIndex();
    const pointers = readGroupPointers(reader);
    const strings: string[] = [];
    for (let pointer of pointers) {
        if (base + pointer < reader.getByteLength()) {
            reader.seek(base + pointer);
            for (let i = 0; i < 4; ++i) {
                const string = readString(dictionary, reader);
                if (string) {
                    strings.push(string);
                }
            }
        }
    }
    return strings;
}
