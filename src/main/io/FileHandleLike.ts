/*
 * Copyright (C) 2026 Klaus Reimer
 * SPDX-License-Identifier: GPL-3.0-only
 */

/**
 * Minimal interface for the return value of {@link FileHandleLike#read}.
 */
export interface FileReadResultLike {
    /**
     * Indicates how many bytes have actually been read. Can be lower (even 0) than the requested number of bytes to read if end
     * of file has been reached.
     */
    bytesRead: number;
}

/**
 * Minimal FileHandle interface for random read access to a file. In Node.js a standard file handle already fulfills this contract. In Browsers it might be
 * needed to read the whole file into memory and then write a simple implementation of this interface to copy the corresponding data to the given output
 * buffer.
 */
export interface FileHandleLike {
    /**
     * Reads bytes from file and copies them into the given output buffer.
     *
     * @param buffer - The output buffer to fill.
     * @param offset - Offset with the output buffer to start filling.
     * @param length - The number of bytes to read into the output buffer.
     * @param position - The position within the file to start reading at.
     * @returns The file read result.
     */
    read(buffer: Uint8Array, offset: number, length: number, position: number): Promise<FileReadResultLike>
}
