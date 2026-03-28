#!/usr/bin/env node
import { spawn } from "node:child_process";
import { once } from "node:events";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
    characterCreationStrings,
    endingStrings,
    infirmaryStrings,
    introStrings,
    inventoryStrings,
    libraryStrings,
    locationMapping,
    mapOffsets,
    mapSizes,
    messageStrings,
    promotionStrings,
    savegameOffset0,
    savegameOffset1,
    savegameSize,
    shopItemListBaseOffsets,
    shopStrings,
    tileMapOffsets
} from "../exe/exe-data.ts";

const baseDir = import.meta.dirname;

const helloExe = join(baseDir, "hello.exe");
const wlExe = join(baseDir, "wl.exe");
const wluExe = join(baseDir, "wlu.exe");

const SEG2 = 0xd020;

const stringBlocks = [
    { offset: SEG2 + 0xa703, length: 527, strings: introStrings },
    { offset: SEG2 + 0xab3e, length: 1661, strings: messageStrings },
    { offset: SEG2 + 0xb270, length: 1845, strings: inventoryStrings },
    { offset: SEG2 + 0xce4b, length: 210, strings: characterCreationStrings },
    { offset: SEG2 + 0xd622, length: 1136, strings: promotionStrings },
    { offset: SEG2 + 0xdacc, length: 277, strings: libraryStrings },
    { offset: SEG2 + 0xdbf8, length: 229, strings: shopStrings },
    { offset: SEG2 + 0xdced, length: 369, strings: infirmaryStrings },
    { offset: SEG2 + 0xd18e, length: 0x295, strings: endingStrings }
];

async function runExepack(input, output) {
    const [ code ] = await once(spawn("exepack", [ input, output ], { stdio: "inherit" }), "close");
    if (code !== 0) {
        throw new Error("exepack failed");
    }
}

function createDictionary(strings) {
    const dictionary = ["\0"];
    const seen = new Set(dictionary);
    for (const string of strings) {
        for (const char of string.toLowerCase()) {
            if (!seen.has(char)) {
                seen.add(char);
                dictionary.push(char);
            }
        }
    }
    if (dictionary.length > 60) {
        throw new Error(`String dictionary too large: ${dictionary.length}`);
    }
    while (dictionary.length < 60) {
        dictionary.push("\0");
    }
    return dictionary;
}

function createIndexMap(dictionary) {
    const map = new Map();
    for (let i = 0; i < dictionary.length; ++i) {
        if (!map.has(dictionary[i])) {
            map.set(dictionary[i], i);
        }
    }
    return map;
}

function encodeStringGroup(strings, indexMap) {
    const values = [];
    for (const string of strings) {
        for (const char of string) {
            const lower = char.toLowerCase();
            const index = indexMap.get(lower);
            if (index == null) {
                throw new Error(`Character missing from dictionary: ${char}`);
            }
            if (char !== lower) {
                values.push(0x1e);
            }
            if (index >= 30) {
                values.push(0x1f);
            }
            values.push(index % 30);
        }
        values.push(0);
    }

    const bytes = new Uint8Array(Math.ceil(values.length * 5 / 8));
    let bitPos = 0;
    for (const value of values) {
        for (let bit = 0; bit < 5; ++bit) {
            bytes[bitPos >> 3] |= ((value >> bit) & 1) << (bitPos & 7);
            bitPos++;
        }
    }
    return bytes;
}

function encodeStrings(strings) {
    if (strings.length === 0 || strings.length % 4 !== 0) {
        throw new Error("String groups must contain 4 strings each");
    }

    const dictionary = createDictionary(strings);
    const indexMap = createIndexMap(dictionary);
    const groups = [];
    for (let i = 0; i < strings.length; i += 4) {
        groups.push(encodeStringGroup(strings.slice(i, i + 4), indexMap));
    }

    const pointerTable = new Uint8Array(groups.length * 2);
    const pointerView = new DataView(pointerTable.buffer);
    let offset = pointerTable.length;
    for (let i = 0; i < groups.length; ++i) {
        pointerView.setUint16(i * 2, offset, true);
        offset += groups[i].length;
    }

    const encoded = new Uint8Array(60 + pointerTable.length + groups.reduce((sum, group) => sum + group.length, 0));
    for (let i = 0; i < 60; ++i) {
        encoded[i] = dictionary[i].charCodeAt(0);
    }
    encoded.set(pointerTable, 60);

    let pos = 60 + pointerTable.length;
    for (const group of groups) {
        encoded.set(group, pos);
        pos += group.length;
    }
    return encoded;
}

function writeBlock(data, offset, length, block) {
    if (block.length > length) {
        throw new Error(`Block too large for region at 0x${offset.toString(16)}: ${block.length} > ${length}`);
    }
    data.fill(0, offset, offset + length);
    data.set(block, offset);
}

function writeUint16Array(view, offset, values) {
    for (let i = 0; i < values.length; ++i) {
        view.setUint16(offset + i * 2, values[i], true);
    }
}

function writeUint32Array(view, offset, values) {
    for (let i = 0; i < values.length; ++i) {
        view.setUint32(offset + i * 4, values[i], true);
    }
}

// Create empty executable data and initialize it with test data.
const data = await readFile(helloExe);
const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

for (const block of stringBlocks) {
    writeBlock(data, block.offset, block.length, encodeStrings(block.strings));
}

writeBlock(data, SEG2 + 0xbf1c, 50, Uint8Array.from(mapSizes));
writeBlock(data, SEG2 + 0xbc7a, 42 * 4, new Uint8Array(42 * 4));
writeBlock(data, SEG2 + 0xbd22, 50 * 2, new Uint8Array(50 * 2));
writeBlock(data, SEG2 + 0xbec9, 50, Uint8Array.from(locationMapping));
writeBlock(data, SEG2 + 0xbe20, 4 * 2, new Uint8Array(4 * 2));

writeUint32Array(view, SEG2 + 0xbc7a, mapOffsets);
writeUint16Array(view, SEG2 + 0xbd22, tileMapOffsets);
writeUint16Array(view, SEG2 + 0xbe20, shopItemListBaseOffsets);

view.setUint16(0x880c, savegameOffset0 & 0xffff, true);
view.setUint16(0x880f, savegameOffset0 >>> 16, true);
view.setUint16(0x8819, savegameOffset1 & 0xffff, true);
view.setUint16(0x881c, savegameOffset1 >>> 16, true);
view.setUint16(0x8820, savegameSize, true);

// Write wlu.exe
await writeFile(wluExe, data);

// Create compressed wl.exe
await runExepack(wluExe, wlExe);
