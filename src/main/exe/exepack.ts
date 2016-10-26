/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 *
 * This file provides a function used to unpack the WL.EXE file. It is based on
 * [unexepack.c](https://sourceforge.net/p/openkb/code/ci/master/tree/src/tools/unexecomp.c) written by
 * Vitaly Driedfruit.
 */

/**
 * Unpacks the given data. This is the actual unpacking algorithm used in EXEPACK.
 *
 * @param src        The packed source data.
 * @param finalSize  The final size of the unpacked data.
 * @return The unpacked data.
 */
function unpackData(src: Uint8Array, finalSize: number): Uint8Array {
    const dst = new Uint8Array(finalSize);
    dst.fill(0xff);
    dst.set(src, 0);

    let dstPos = finalSize - 1;
    let srcPos = src.length - 1;
    const lastPos = srcPos;

    // Skip all 0xff bytes (they're just padding to make the packed exe's size a multiple of 16
    while (src[srcPos] === 0xff) {
        srcPos--;
    }

    // Unpack
    let commandByte: number, lengthWord: number, fillByte: number, i: number, n = 0;
    do {
        commandByte = src[srcPos--];
        switch (commandByte & 0xFE) {
            // (byte)value (word)length (byte)0xb0
            // writes a run of <length> bytes with a value of <value>
            case 0xb0:
                lengthWord = (src[srcPos--]) * 0x100;
                lengthWord += src[srcPos--];
                fillByte = src[srcPos--];
                for (i = 0; i < lengthWord; i++) {
                    dst[dstPos--] = fillByte;
                }
                n += lengthWord;
                break;
            // (word)length (byte)0xb2
            // copies the next <length> bytes
            case 0xb2:
                lengthWord = (src[srcPos--]) * 0x100;
                lengthWord += src[srcPos--];
                for (i = 0; i < lengthWord; i++) {
                    dst[dstPos--] = src[srcPos--];
                }
                n += lengthWord;
                break;

            // Unknown command
            default:
                throw new Error("Unknown command " + commandByte + " at position " + (lastPos - srcPos));
        }
    } while ((commandByte & 1) !== 1); // lowest bit set => last block

    return dst;
}

/**
 * Unpacks the specified EXEPACK packed file content and returns the unpacked file content.
 *
 * @param data
 *            The content of the EXEPACK packed file.
 * @return The unpacked file content.
 */
export function unpackExe(data: Uint8Array): Uint8Array {
    // Read necessary parts from EXE header
    const header = new Uint16Array(data.buffer, 0, 12);
    const signature = header[0];
    if (signature !== 0x5a4d) {
        throw new Error("No EXE file");
    }
    const bytesInLastBlock = header[1];
    const blocksInFile = header[2];
    const headerParagraphs = header[4];
    const cs = header[11];

    // Calculate some offsets and sizes
    const exeDataStart = headerParagraphs * 16;
    let extraDataStart = blocksInFile * 512;
    if (bytesInLastBlock) {
        extraDataStart -= (512 - bytesInLastBlock);
    }
    const firstOffset = cs * 16;
    const exeLen = firstOffset;

    // Read unpacker data
    const unpackerDataLen = 18;
    const unpacker = new Uint16Array(data.buffer, exeDataStart + exeLen, unpackerDataLen / 2);
    const packSignature = unpacker[8];
    if (packSignature !== 0x4252) {
        throw new Error("Not an EXEPACK file");
    }
    const realStartOffset = unpacker[0];
    const realStartSegment = unpacker[1];
    const unpackerLen = unpacker[3];
    const realStackOffset = unpacker[4];
    const realStackSegment = unpacker[5];
    const destLen = unpacker[6];
    const finalSize = destLen * 16;

    // Unpack data
    const packedData = new Uint8Array(data.buffer, exeDataStart, exeLen);
    const unpackedData = unpackData(packedData, finalSize);

    // Unpack relocation table
    const unpackerSize = 0x105;
    const errLen = 0x16;
    const packBuffer = unpackerLen - unpackerDataLen;
    const pbuffer = new Uint8Array(data.buffer, exeDataStart + exeLen + unpackerDataLen, packBuffer);
    const relocTableSize = unpackerLen - errLen - unpackerSize - unpackerDataLen;
    const relocNumEntries = (relocTableSize - 32) >> 1;
    const relocTableFull = relocNumEntries * 4;
    let p = (unpackerSize + errLen);
    const relocTable = new Uint8Array(relocTableFull);
    let relocSize = 0;
    for (let section = 0; section < 16; section++) {
        const numEntries = (pbuffer[p + 1] << 8) + pbuffer[p]; p += 2;
        if (numEntries === 0) break;
        for (let k = 0; k < numEntries; k++) {
            const entry = (pbuffer[p + 1] << 8) + pbuffer[p]; p += 2;
            const patchSegment = 0x1000 * section;
            const patchOffset = entry;
            relocTable[relocSize] = patchOffset & 0xff; relocSize++;
            relocTable[relocSize] = patchOffset >> 8; relocSize++;
            relocTable[relocSize] = patchSegment & 0xff; relocSize++;
            relocTable[relocSize] = patchSegment >> 8; relocSize++;
        }
    }

    // Create new unpacked EXE
    const mzSize = 28;
    const headerSize = mzSize + relocSize;
    const mzGarbage = 0;
    let newHeaderParagraphs = headerSize >> 4;
    newHeaderParagraphs = ((newHeaderParagraphs >> 5 ) + 1) << 5;
    const needHeaderSize = newHeaderParagraphs << 4;
    const relocGarbage = needHeaderSize - headerSize - mzGarbage;
    const fullSize = mzSize + mzGarbage + relocSize + relocGarbage + finalSize;
    const unpacked = new Uint8Array(fullSize);
    const newExe = new Uint16Array(unpacked.buffer, 0, 14);
    newExe[0] = 0x5a4d;
    newExe[1] = fullSize % 512;
    newExe[2] = (fullSize >> 9) + 1;
    newExe[3] = relocSize >> 2;
    newExe[4] = newHeaderParagraphs;
    newExe[5] = fullSize / 60;
    newExe[6] = 0xffff;
    newExe[7] = realStackSegment;
    newExe[8] = realStackOffset;
    newExe[10] = realStartOffset;
    newExe[11] = realStartSegment;
    newExe[12] = mzSize + mzGarbage;
    newExe[13] = 0;
    unpacked.set(relocTable, mzSize + mzGarbage);
    unpacked.set(unpackedData, mzSize + mzGarbage + relocSize + relocGarbage);
    return unpacked;
}
