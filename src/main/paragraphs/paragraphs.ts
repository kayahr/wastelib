/*
 * Copyright (C) 2026 Klaus Reimer
 * SPDX-License-Identifier: MIT
 *
 * This module extracts the Wasteland paragraphs from `paragraphs.bin` in the "modernized" Wasteland release "Wasteland 1 - The Original Classic".
 * That release runs the original DOS version inside a modified DOSBox build which detects paragraph references on the screen and then shows the
 * actual paragraph text as an overlay, so players do not have to look it up in some PDF.
 *
 * Now let us take a moment to appreciate the wonder that is `paragraphs.bin`:
 *
 * - You might reasonably expect inXile to store the paragraphs as text. But of course not. Every paragraph is stored as a 640-pixel-wide grayscale
 *   image. Uncompressed, naturally. That means 19 MiB wasted on your hard drive for something that would be about 64 KiB as uncompressed plain text.
 * - You might also expect that, if the paragraphs are already images, they would at least look decent. But no. They appear to have been generated
 *   by the most bare-bones text-to-image converter imaginable, complete with missing paragraph breaks and magnificent walls of text.
 * - And if a text-to-image converter was involved, you might hope it at least got a clean source text. Again, no. The text looks like it was OCR'd
 *   from some thoroughly battered copy of the original paragraph booklet by software that was clearly having a very bad day, so the resulting
 *   images are full of errors.
 *
 * Anyway, this is the mess we have to work with, so this module performs the following steps to reconstruct clean, correct text:
 *
 *   - Extract the paragraph images from the `paragraphs.bin` file.
 *   - Convert the pixels to text by matching glyph patterns.
 *   - Patch the texts to correct all the OCR errors.
 *   - Normalize every paragraph into one line and then add line breaks where they belong to recreate the original formatting used in the paragraph booklet.
 */

import type { FileHandleLike } from "../io/FileHandleLike.ts";

/** The constant line height used in the paragraph text images. */
const LINE_HEIGHT = 19;

/** Intensity threshold to convert grayscale to black-white bitmap. */
const THRESHOLD = 128;

/** The minimum number of empty columns needed to parse a white-space character. */
const SPACE_LEN = 9;

/** The font glyphs used in the paragraph images, sorted by number of occurrence. The bitmasks represent the glyph pixels per column. */
const glyphs = [
    { char: "e", bitmasks: [ 224, 496, 856, 584, 584, 584, 840, 472, 208 ] },
    { char: "t", bitmasks: [ 512, 512, 8176, 8184, 520, 520, 520, 16 ] },
    { char: "o", bitmasks: [ 224, 496, 792, 520, 520, 520, 792, 496, 224 ] },
    { char: "a", bitmasks: [ 48, 632, 584, 584, 592, 1016, 504, 8 ] },
    { char: "s", bitmasks: [ 408, 984, 712, 712, 616, 888, 816 ] },
    { char: "n", bitmasks: [ 520, 1016, 1016, 264, 512, 520, 1016, 504, 8 ] },
    { char: "r", bitmasks: [ 520, 520, 1016, 1016, 264, 520, 520, 768, 256 ] },
    { char: "h", bitmasks: [ 4104, 8184, 8184, 264, 512, 520, 1016, 504, 8 ] },
    { char: "i", bitmasks: [ 8, 520, 520, 7160, 7160, 8, 8, 8 ] },
    { char: "l", bitmasks: [ 8, 4104, 4104, 8184, 8184, 8, 8, 8 ] },
    { char: "d", bitmasks: [ 224, 496, 792, 520, 520, 4368, 8184, 8184, 8 ] },
    { char: "u", bitmasks: [ 512, 1008, 1016, 8, 520, 528, 1016, 1016, 8 ] },
    { char: "'", bitmasks: [ 3072, 3968, 3072 ] },
    { char: "c", bitmasks: [ 224, 496, 792, 520, 520, 520, 280, 944 ] },
    { char: "m", bitmasks: [ 520, 1016, 1016, 512, 1016, 1016, 768, 1016, 504, 8 ] },
    { char: "y", bitmasks: [ 512, 769, 961, 755, 31, 61, 752, 960, 768, 512 ] },
    { char: "f", bitmasks: [ 520, 520, 4088, 8184, 4616, 4616, 4616, 4096, 4096 ] },
    { char: "g", bitmasks: [ 224, 496, 793, 521, 521, 273, 1023, 1022, 512 ] },
    { char: ".", bitmasks: [ 24, 24 ] },
    { char: "w", bitmasks: [ 512, 960, 1016, 568, 112, 224, 112, 568, 1016, 960, 512 ] },
    { char: "w", bitmasks: [ 960, 1016, 568, 112, 224, 112, 568, 1016, 960, 512 ] },
    { char: "p", bitmasks: [ 513, 1023, 1023, 273, 521, 520, 792, 496, 224 ] },
    { char: "b", bitmasks: [ 4104, 8184, 8184, 272, 520, 520, 792, 496, 224 ] },
    { char: ",", bitmasks: [ 7, 28, 16 ] },
    { char: "k", bitmasks: [ 4104, 8184, 8184, 192, 1000, 824, 536, 520, 8 ] },
    { char: "v", bitmasks: [ 512, 896, 992, 632, 56, 632, 992, 896, 512 ] },
    { char: "T", bitmasks: [ 3840, 2056, 2056, 4088, 4088, 2056, 2056, 3840 ] },
    { char: "I", bitmasks: [ 2056, 2056, 2056, 4088, 4088, 2056, 2056, 2056 ] },
    { char: "H", bitmasks: [ 2056, 4088, 4088, 2184, 128, 2184, 4088, 4088, 2056 ] },
    { char: "A", bitmasks: [ 8, 2104, 2552, 4040, 3136, 3136, 4040, 504, 56, 8 ] },
    { char: "S", bitmasks: [ 1848, 4024, 2432, 2184, 2248, 3832, 3696 ] },
    { char: "Y", bitmasks: [ 2048, 3072, 3592, 2824, 504, 504, 2824, 3592, 3072, 2048 ] },
    { char: "F", bitmasks: [ 2056, 4088, 4088, 2184, 2184, 2496, 2048, 2048, 3584 ] },
    { char: "W", bitmasks: [ 2048, 3968, 4088, 2168, 2544, 896, 2544, 2168, 4088, 3968, 2048 ] },
    { char: "W", bitmasks: [ 3968, 4088, 2168, 2544, 896, 2544, 2168, 4088, 3968, 2048 ] },
    { char: "B", bitmasks: [ 2056, 4088, 4088, 2184, 2184, 2184, 4088, 1904 ] },
    { char: "M", bitmasks: [ 2056, 4088, 4088, 776, 456, 96, 456, 776, 4088, 4088, 2056 ] },
    { char: "x", bitmasks: [ 520, 520, 792, 1016, 224, 1016, 792, 520, 520 ] },
    { char: "-", bitmasks: [ 128, 128, 128, 128, 128, 128, 128, 0 ] },
    { char: "O", bitmasks: [ 992, 2032, 1040, 2056, 2056, 2056, 1048, 2032, 992 ] },
    { char: "C", bitmasks: [ 992, 2032, 3096, 2056, 2056, 2056, 8, 1040, 3616 ] },
    { char: "D", bitmasks: [ 2056, 4088, 4088, 2056, 2056, 2056, 3096, 2032, 992 ] },
    { char: "R", bitmasks: [ 2056, 4088, 4088, 2184, 2184, 2240, 3952, 1816, 8, 8 ] },
    { char: "z", bitmasks: [ 792, 568, 616, 584, 712, 904, 792 ] },
    { char: "q", bitmasks: [ 224, 496, 792, 520, 521, 273, 1023, 1023, 513 ] },
    { char: "j", bitmasks: [ 513, 513, 513, 6657, 7167, 1022 ] },
    { char: "N", bitmasks: [ 2056, 4088, 4088, 776, 448, 2144, 4088, 4088, 2048 ] },
    { char: "P", bitmasks: [ 2056, 4088, 4088, 2120, 2120, 2120, 4032, 1920 ] },
    { char: "E", bitmasks: [ 2056, 4088, 4088, 2184, 2184, 2504, 2056, 3640 ] },
    { char: "!", bitmasks: [ 8136, 8136 ] },
    { char: "L", bitmasks: [ 2056, 2056, 4088, 4088, 2056, 2056, 8, 8, 120 ] },
    { char: "?", bitmasks: [ 1536, 3584, 2152, 2280, 2176, 3968, 1792 ] },
    { char: "G", bitmasks: [ 992, 2032, 3096, 2056, 2120, 2120, 1144, 3696, 64 ] },
    { char: "0", bitmasks: [ 2016, 4080, 6168, 4104, 6168, 4080, 2016 ] },
    { char: "V", bitmasks: [ 2048, 3584, 4032, 2552, 56, 2552, 4032, 3584, 2048 ] },
    { char: "U", bitmasks: [ 2048, 4080, 4088, 2056, 8, 2056, 4088, 4080, 2048 ] },
    { char: "1", bitmasks: [ 2056, 2056, 2056, 8184, 8184, 8, 8, 8 ] },
    { char: "K", bitmasks: [ 2056, 4088, 4088, 2248, 448, 2912, 3640, 3096, 2056 ] },
    { char: "\u2013", bitmasks: [ 128, 128, 128, 128, 128, 128, 128, 128, 128 ] },
    { char: ":", bitmasks: [ 792, 792 ] },
    { char: "2", bitmasks: [ 1560, 3640, 6248, 4296, 4488, 3848, 1544 ] },
    { char: "J", bitmasks: [ 112, 120, 2056, 2056, 2056, 4088, 4080, 2048, 2048 ] },
    { char: "3", bitmasks: [ 2064, 6168, 4360, 4360, 4360, 7064, 4080, 3312 ] },
    { char: "9", bitmasks: [ 3848, 8072, 6536, 4248, 6576, 4080, 1984 ] },
    { char: "Q", bitmasks: [ 480, 2032, 3098, 2062, 2062, 2058, 1050, 2038, 996 ] },
    { char: "7", bitmasks: [ 6144, 4096, 4096, 4152, 5112, 8128, 7168 ] },
    { char: "5", bitmasks: [ 16, 8072, 7944, 4360, 4360, 4600, 4336 ] },
    { char: "$", bitmasks: [ 3640, 3896, 5000, 12686, 4552, 7416, 7280 ] },
    { char: "Z", bitmasks: [ 3608, 2104, 2152, 2504, 2824, 3592, 3128 ] },
    { char: "(", bitmasks: [ 1008, 2044, 7710, 6150 ] },
    { char: ")", bitmasks: [ 6150, 7710, 4088, 1008 ] },
    { char: "wr", bitmasks: [ 512, 960, 1016, 568, 112, 224, 112, 568, 1016, 960, 520, 520, 1016, 1016, 264, 520, 520, 768, 256 ] },
    { char: "wo", bitmasks: [ 512, 960, 1016, 568, 112, 224, 112, 568, 1016, 960, 736, 496, 792, 520, 520, 520, 792, 496, 224 ] },
    { char: "6", bitmasks: [ 992, 2032, 3480, 6408, 4488, 4600, 4336 ] },
    { char: "/", bitmasks: [ 6, 30, 120, 224, 896, 3840, 15360, 12288 ] },
    { char: "4", bitmasks: [ 96, 480, 1832, 7208, 8184, 8184, 40 ] },
    { char: "#", bitmasks: [ 320, 508, 8188, 8000, 508, 8188, 8000, 320 ] },
    { char: "wh", bitmasks: [ 512, 960, 1016, 568, 112, 224, 112, 568, 1016, 960, 4616, 8184, 8184, 264, 512, 520, 1016, 504, 8 ] },
    { char: "we", bitmasks: [ 512, 960, 1016, 568, 112, 224, 112, 568, 1016, 960, 736, 496, 856, 584, 584, 584, 840, 472, 208 ] },
    { char: "AM", bitmasks: [ 8, 2104, 2552, 4040, 3136, 3136, 4040, 504, 56, 2056, 4088, 4088, 776, 456, 96, 456, 776, 4088, 4088, 2056 ] },
    { char: "RM", bitmasks: [ 2056, 4088, 4088, 2184, 2184, 2240, 3952, 1816, 8, 2056, 4088, 4088, 776, 456, 96, 456, 776, 4088, 4088, 2056 ] },
    { char: "X", bitmasks: [ 2056, 3096, 3640, 3048, 448, 3048, 3640, 3096, 2056 ] },
    { char: "Aw", bitmasks: [ 8, 2104, 2552, 4040, 3136, 3136, 4040, 504, 56, 520, 960, 1016, 568, 112, 224, 112, 568, 1016, 960, 512 ] },
    { char: ";", bitmasks: [ 6, 24, 784, 768] }
] as const;

/** A map with text patches. Hopefully they do not violate any copyrights... I tried to keep the patch data as short as possible. */
const patches = new Map<string | RegExp, string>([
        /*: cSpell:disable: */
        [ /''/g, '"' ],
        [ /  +/g, " " ],
        [ / +\./g, "." ],
        [ "\"'", '"' ],
        [ "LD..", "ID" ],
        [ "\"In", "In" ],
        [ "st pr", "st-pr" ],
        [ "t at.", "t at all." ],
        [ "tights", "lights" ],
        [ "ear- piercing", "ear-piercing" ],
        [ "fails", "falls" ],
        [ "osity", "ousity" ],
        [ "Bear", "bear" ],
        [ /- ([eflmdipTbtrv])/g, "$1" ],
        [ "- abl", "abl" ],
        [ "- a", "-a" ],
        [ "Jell-O", "jello" ],
        [ "y, st", "y st" ],
        [ "?.", "?" ],
        [ "us,\"", "us.\"" ],
        [ "ke bi", "kebi" ],
        [ "od st", "odst" ],
        [ "pan,", "part," ],
        [ "vou", "you" ],
        [ "01", "of" ],
        [ "rnal", "mal" ],
        [ /\bhobo\b/, "Hobo" ],
        [ "ve..", "ves.." ],
        [ "y..", "y," ],
        [ "'s wra", "-wra" ],
        [ "Spare", "Spam" ],
        [ "fight a", "right a" ],
        [ "fieg", "feg" ],
        [ "Bess", "Boss" ],
        [ "sa.v", "say" ],
        [ "IamlookinatmywordsinthisisokandIamproud", "I am lookin at my words in this book and I am proud" ],
        [ "IdintnoIcudriteso", "I dint no I cud rite so" ],
        [ "d,,,", "dy" ],
        [ ":m", "m" ],
        [ ",,", "a" ],
        [ " stem", " seem" ],
        [ "v h", "wh" ],
        [ "..j", ". J" ],
        [ "er. '", "er.'" ],
        [ "r. '", "r.' " ],
        [ "flown", "frown" ],
        [ "sdfs ", "" ],
        [ "hiper", "hipper" ],
        [ "wastel", "Wastel" ],
        [ "l kn", "I kn" ],
        [ "re sh", "re-sh" ],
        [ "rF", "rp" ],
        [ "tail", "tall" ],
        [ "visible yo", "visible, yo" ],
        [ "in part ", "in part, " ],
        [ "bones", "bone" ],
        [ "sset", "ssel" ],
        [ "Ham", "Flam" ],
        [ "yous", "vous" ],
        [ "ch b", "chb" ],
        [ " l k", " I k" ],
        [ "d mi", "dmi" ],
        [ "e, fig", "e fig" ],
        [ " Of", " of" ],
        [ "t,.", "n" ],
        [ "or qu", "or your qu" ],
        [ "thorn", "than" ],
        [ ". y", ". Rubbing it against y" ],
        [ "ray b", "my b" ],
        [ "lier,", "lier." ],
        [ "y. F", "y.\" F" ],
        [ "mands. I", "mands. \"I" ],
        [ ", U", ", \"U" ],
        [ "9.", "9.\"" ]
        /*: cSpell:enable: */
]);

/** Map with the positions where to insert line-breaks in the normalized paragraph texts to recreate the layout of the original paragraphs in the booklet. */
const breaks = new Map([
    [ 0, [ 323 ] ],
    [ 6, [ 289, 329, 369, 816, 1236, 2083, 2218, 2668, 2970, 3080 ] ],
    [ 7, [ 283, 742 ] ],
    [ 12, [ 125, 307, 483, 799 ] ],
    [ 13, [ 338, 616, 1022 ] ],
    [ 14, [ 231, 601 ] ],
    [ 20, [ 458, 737, 1197 ] ],
    [ 57, [ 314 ] ],
    [ 58, [ 534 ] ],
    [ 61, [ 241, 616 ] ],
    [ 63, [ 374, 648 ] ],
    [ 64, [ 363, 390, 502, 680, 958, 1276, 1400 ] ],
    [ 71, [ 233 ] ],
    [ 73, [ 320, 368 ] ],
    [ 75, [ 63, 224, 335, 510, 806 ] ],
    [ 77, [ 258, 277 ] ],
    [ 83, [ 485, 796 ] ],
    [ 107, [ 220, 326 ] ],
    [ 110, [ 77, 104 ] ],
    [ 111, [ 335 ] ],
    [ 114, [ 281 ] ],
    [ 130, [ 304, 762, 1185, 2021, 2150, 2692, 3097, 3244 ] ],
    [ 132, [ 348 ] ],
    [ 133, [ 352, 401 ] ],
    [ 134, [ 231 ] ],
    [ 156, [ 170 ] ]
]);

/**
 * Reads single text paragraph from the given gray scale image.
 *
 * @param pixels - The grayscale pixels.
 * @param width  - The image width.
 * @param height - The image height.
 * @param breaks - Optional array with line break positions in the parsed paragraph text.
 * @returns The read text paragraph.
 */
function readParagraph(pixels: Uint8Array, width: number, height: number, breaks: number[] = []): string {
    let paragraph = "";
    for (let y = 0; y < height; y += LINE_HEIGHT) {
        let line = "";
        let bitmasks: number[] = [];
        let start = true;
        let candidates = glyphs.slice();
        let column = 0;
        let emptyCount = 0;
        for (let x = 0; x < width; x++) {
            let bitmask = 0;
            for (let b = 3; b < LINE_HEIGHT - 2; b++) {
                bitmask = (bitmask << 1) | (pixels[(y + b) * width + x] > THRESHOLD ? 1 : 0);
            }
            if (bitmask === 0 && start) {
                // Still scanning for beginning of next character in line
                emptyCount++;
                if (emptyCount === SPACE_LEN) {
                    line += " ";
                    emptyCount = 0;
                }
                continue;
            }

            // Filter out not matching glyphs
            candidates = candidates.filter(glyph => glyph.bitmasks[column] === bitmask);

            column++;

            // Check for a matching glyph
            const glyph = candidates.find(glyph => glyph.bitmasks.length === column);
            if (glyph) {
                line += glyph.char;
                column = 0;
                start = true;
                bitmasks = [];
                candidates = glyphs.slice();
                emptyCount = 0;
                continue;
            }

            start = false;
            bitmasks.push(bitmask);
        }
        paragraph += `${line.trim()} `;
    }
    paragraph = paragraph.trim()
    for (const [ search, replace ] of patches) {
        paragraph = paragraph.replace(search, replace);
    }

    // Add linebreaks
    for (const pos of breaks) {
        paragraph = `${paragraph.slice(0, pos)}\n${paragraph.slice(pos + 1)}`;
    }

    return paragraph;
}

/**
 * Reads bytes from the given file position.
 *
 * @param reader - The file reader to read the bytes from.
 * @param data   - The output array to copy the read bytes to.
 * @param offset - The file offset to start reading from.
 * @throws {@link !Error} on unexpected end of file or I/O problems.
 */
async function readBytes(reader: FileHandleLike, data: Uint8Array, offset: number): Promise<void> {
    const { bytesRead } = await reader.read(data, 0, data.byteLength, offset);
    if (bytesRead !== data.byteLength) {
        throw new Error("Unexpected EOF");
    }
}

/**
 * Reads the 162 text paragraphs from the given `paragraphs.bin` file.
 *
 * @param file - The `paragraphs.bin` file to read the paragraphs from.
 * @returns The read text paragraphs.
 * @throws {@link !Error} if paragraphs could not be read from the file.
 */
export async function readParagraphs(file: FileHandleLike): Promise<string[]> {
    let offset = 0;
    const sizeHeader = new Uint8Array(8);
    const sizeView = new DataView(sizeHeader.buffer);

    // Skip images until 0x0 separator is found
    while (true) {
        await readBytes(file, sizeHeader, offset);
        const width = sizeView.getUint32(0, true);
        const height = sizeView.getUint32(4, true);
        offset += 8;
        offset += width * height;
        offset += (-(width * height)) & 3; // 4 Byte Boundary Padding
        if (width === 0 && height === 0) {
            break;
        }
    }

    // Read 162 paragraph images
    const paragraphs: string[] = [];
    for (let i = 0; i < 162; i++) {
        await readBytes(file, sizeHeader, offset);
        const width = sizeView.getUint32(0, true);
        const height = sizeView.getUint32(4, true);
        if (width !== 640 || height === 0) {
            throw new Error(`Unexpected image size in paragraph ${i + 1}: ${width}x${height}`);
        }
        offset += 8;
        const pixels = new Uint8Array(width * height);
        await readBytes(file, pixels, offset);
        offset += width * height;
        offset += (-(width * height)) & 3; // 4 Byte Boundary Padding
        paragraphs.push(readParagraph(pixels, width, height, breaks.get(i)));
    }

    return paragraphs;
}
