/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { BinaryReader } from "./BinaryReader";

/**
 * Decrypter for the Rotating-XOR encryption of the game maps.
 */
export class Decrypter {
    /** The underlying reader to read the encrypted bytes from. */
    private reader: BinaryReader;

    /** The current decryption key. */
    private key: number;

    /** The end checksum. */
    private endChecksum: number;

    /** The current checksum. */
    private checksum: number;

    /**
     * Creates a new decrypter reading data from the given reader.
     *
     * @param reader   The reader to read encrypted data from.
     */
    public constructor(reader: BinaryReader) {
        this.reader = reader;

        // Get encryption byte and checksum end marker
        const e1 = this.reader.readUint8();
        const e2 = this.reader.readUint8();
        this.key = e1 ^ e2;
        this.endChecksum = e1 | (e2 << 8);

        // Initialize checksum
        this.checksum = 0;
    }

    /**
     * Reads and decrypts a byte.
     *
     * @return The decrypted byte.
     */
    public readByte(): number {
        // Read encrypted byte
        const encrypted = this.reader.readUint8();

        // Decrypt the byte
        const decrypted = encrypted ^ this.key;

        // Update checksum
        this.checksum = (this.checksum - decrypted) & 0xffff;

        // Updated decryption key
        this.key = (this.key + 0x1f) & 0xff;

        // Return the decrypted byte
        return decrypted;
    }

    /**
     * Read and decrypts multiple bytes and returns them.
     *
     * @param size  The number of bytes to read and decrypt.
     * @return The decrypted bytes.
     */
    public readBytes(size: number): Uint8Array {
        const result = new Uint8Array(size);
        for (let i = 0; i < size; ++i) {
            result[i] = this.readByte();
        }
        return result;
    }
}
