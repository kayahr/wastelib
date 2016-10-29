/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { InputStream } from "../io/InputStream";

/**
 * Decrypter for the Rotating-XOR encryption of the game maps.
 */
export class DecryptStream extends InputStream {
    /** The underlying reader to read the encrypted bytes from. */
    private readonly stream: InputStream;

    /** The current decryption key. */
    private key: number;

    /**
     * Creates a new decrypter reading data from the given reader.
     *
     * @param reader   The reader to read encrypted data from.
     */
    public constructor(stream: InputStream) {
        super();
        this.stream = stream;
        this.key = this.stream.readByte() ^ this.stream.readByte();
    }

    /**
     * Reads and decrypts a byte.
     *
     * @return The decrypted byte.
     */
    protected read(): number {
        const encrypted = this.stream.readByte();
        const decrypted = encrypted ^ this.key;
        this.key = (this.key + 0x1f) & 0xff;
        return decrypted;
    }
}
