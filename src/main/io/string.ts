/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { BinaryReader } from "./BinaryReader";

/** A string group with up to four strings. */
export type StringGroup = string[];

/** A set of string groups. */
export type StringGroups = StringGroup[];

/**
 * Read the string dictionary from the given reader. This is always a string of 60 characters.
 *
 * @param reader  The reader to read the string dictionary from.
 * @return The read dictionary as a string with 60 characters.
 */
function readDictionary(reader: BinaryReader): string {
    return reader.readString(60);
}

/**
 * Read string group pointers from the given reader. Invalid pointers are filtered out as good as possible.
 *
 * @param reader  The reader to read the string group pointers from.
 * @return The found string group pointers.
 */
function readPointers(reader: BinaryReader): number[] {
    const pointers: number[] = [];
    let pointer = reader.readUint16();
    pointers.push(pointer);
    let numPointers = pointer >> 1;
    for (let i = 1; i < numPointers; ++i) {
        pointer = reader.readUint16();
        if (pointer >= reader.getSize() - 60) {
            continue;
        }
        pointers.push(pointer);
        numPointers = Math.min(numPointers, pointer >> 1);
    }
    return pointers;
}

/**
 * Decodes a string group read from the given reader.
 *
 * @param dictionary  The dictionary to use to decode the strings.
 * @param reader      The reader to read the strings from.
 * @return Array with up to four strings. May contain less than four if end of stream is reached.
 */
function decodeStringGroup(dictionary: string, reader: BinaryReader): StringGroup {
    let upper = false;
    let high = false;
    let stringGroup: StringGroup = [];
    let string = "";
    while (reader.hasData(5) && stringGroup.length < 4) {
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
                    stringGroup.push(string);
                    string = "";
                    break;
                }
                string += upper ? char.toUpperCase() : char;
                upper = false;
                high = false;
        }
    }
    return stringGroup;
}

/**
 * Decodes string groups from the given data.
 *
 * @param data  The data array to read the string groups from.
 * @param offset  The starting offset where to find the string groups to read.
 * @param size    The size of the block to decode.
 * @return The decoded string groups.
 */
export function decodeStringGroups(data: Uint8Array, offset: number, size: number): StringGroups {
    const reader = new BinaryReader(data, offset, size);
    const dictionary = readDictionary(reader);
    const pointers = readPointers(reader);
    return pointers.map(pointer => decodeStringGroup(dictionary, reader.seek(offset + 60 + pointer)));
}
