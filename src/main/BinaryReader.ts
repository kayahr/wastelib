/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

/**
 * Reader for binary data. Supports reading single bits, bytes, characters and strings and more.
 */
export class BinaryReader {
    /** Wrapped array to read from. */
    private data: ArrayLike<number>;

    /** The last byte index in the array. */
    private last: number;

    /** The current byte index. */
    private byte: number;

    /** The current bit index. */
    private bit: number;

    /**
     * Creates a new binary reader for the given data.
     *
     * @param data
     *            The data array to read from.
     * @param offset
     *            Optional start offset. Defaults to 0.
     * @param size
     *            Optional maximum number of bytes to read from data array. Defaults to size of data array.
     */
    public constructor(data: ArrayLike<number>, offset = 0, size = data.length) {
        this.data = data;
        this.last = offset + size;
        this.byte = offset;
        this.bit = 0;
    }

    /**
     * Synchronizes the reader so it points to a full byte if it currently doesn't.
     */
    public sync(): void {
        if (this.bit) {
            this.byte++;
            this.bit = 0;
        }
    }

    /**
     * Checks if there is more data to read. If this method returns false then there is no more data and the
     * next read operation results in an errors.
     *
     * @return True if there is still data to read, false if not.
     */
    public hasData(): boolean {
        return this.byte < this.last;
    }

    /**
     * Returns the current byte index.
     *
     * @return The current byte index.
     */
    public getByteIndex(): number {
        return this.byte;
    }

    /**
     * Returns the current bit index.
     *
     * @return The current bit index.
     */
    public getBitIndex(): number {
        return this.bit;
    }

    /**
     * Reads a single bit and returns it.
     *
     * @return The read bit.
     */
    public readBit(): number {
        if (this.byte >= this.last) {
            throw new Error("End of data");
        }
        const result = this.data[this.byte] >> (7 - this.bit) & 1;
        this.bit++;
        if (this.bit > 7) {
            this.bit = 0;
            this.byte++;
        }
        return result;
    }

    /**
     * Reads an unsigned 8 bit value (byte) and returns it.
     *
     * @return The read value.
     */
    public readUint8(): number {
        if (this.bit) {
            if (this.byte + 1 >= this.last) {
                throw new Error("End of data");
            }
            return this.data[this.byte] << this.bit & 0xff | this.data[++this.byte] >> 8 - this.bit;
        } else {
            if (this.byte >= this.last) {
                throw new Error("End of data");
            }
            return this.data[this.byte++] & 0xff;
        }
    }

    /**
     * Reads the specified number of unsigned 8 bit values and returns it.
     *
     * @param len
     *            The number of bytes to read.
     * @return The read bytes.
     */
    public readUint8s(len: number): number[] {
        const result: number[] = [];
        for (let i = 0; i < len; ++i) {
            result.push(this.readUint8());
        }
        return result;
    }

    /**
     * Reads an unsigned 16 bit value and returns it.
     *
     * @return The read value.
     */
    public readUint16(): number {
        return this.readUint8() | this.readUint8() << 8;
    }

    /**
     * Reads an unsigned 32 bit value and returns it.
     *
     * @return The read value.
     */
    public readUint32(): number {
        return this.readUint16() | this.readUint16() << 16;
    }

    /**
     * Reads a single character and returns it.
     *
     * @return The read character.
     */
    public readChar(): string {
        return String.fromCharCode(this.readUint8());
    }

    /**
     * Reads a string with the given length and returns it.
     *
     * @return The read string.
     */
    public readString(len: number): string {
        let result = "";
        for (let i = 0; i < len; ++i) {
            result += this.readChar();
        }
        return result;
    }
}
