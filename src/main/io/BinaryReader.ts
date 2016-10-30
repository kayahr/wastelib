/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

/**
 * Reader for reading binary data in various formats and sizes.
 */
export class BinaryReader {
    /** Wrapped array to read from. */
    private data: Uint8Array;

    /** The data size in bytes. */
    private byteLength: number;

    /** The current byte index. */
    private byte: number;

    /** The current bit index. */
    private bit: number;

    /**
     * Creates a new binary reader for the given data.
     *
     * @param data    The data array to read from.
     * @param offset  Optional start offset. Defaults to 0.
     * @param size    Optional maximum number of bytes to read from data array. Defaults to size of data array
     *                minus the offset.
     */
    public constructor(data: Uint8Array, offset = 0, size = data.byteLength - offset) {
        this.data = new Uint8Array(data.buffer, data.byteOffset + offset, size);
        this.byteLength = size;
        this.byte = 0;
        this.bit = 0;
    }

    /**
     * Synchronizes the reader so it points to a full byte if it currently doesn't.
     *
     * @return This reader for method chaining.
     */
    public sync(): this {
        if (this.bit) {
            this.byte++;
            this.bit = 0;
        }
        return this;
    }

    /**
     * Seeks to the given index.
     *
     * @param byte         The byte index to set. Must not be outside of the data array range.
     * @param bit          Optional bit index (0-7) to set. Defaults to 0.
     * @return             This reader for method chaining.
     * @throws RangeError  If index is out of range.
     */
    public seek(byte: number, bit: number = 0): this {
        // Normalize byte/bit offset
        byte += bit >> 3;
        bit &= 7;

        if (byte < 0 || byte > this.byteLength) {
            throw new RangeError("Invalid byte index: " + byte);
        } else if (byte === this.byteLength && bit !== 0) {
            throw new RangeError("Invalid byte index: " + byte + " (+ " + bit + " bit)");
        }

        this.byte = byte;
        this.bit = bit;
        return this;
    }

    /**
     * Checks if there is enough data to read. If this method returns false then the next read operation with the same
     * length results in an error.
     *
     * @return True if there is enough data to read, false if not.
     */
    public hasData(bytes: number = 1, bits: number = 0): boolean {
        return (this.data.length - this.byte << 3) - this.bit >= bits + (bytes << 3);
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
     * Returns the size of the data to read in bytes.
     *
     * @return The data size in bytes
     */
    public getByteLength(): number {
        return this.byteLength;
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
     * @param reverse      Set to true to read bit in reverse order (Starting with the lowest bit instead of the
     *                     highest bit). Defaults to false.
     * @return             The read bit.
     * @throws RangeError  If reached the end of the data.
     */
    public readBit(reverse: boolean = false): number {
        if (this.byte >= this.byteLength) {
            throw new RangeError("End of data");
        }
        const result = (reverse
            ? (this.data[this.byte] >> (this.bit))
            : (this.data[this.byte] >> (7 - this.bit))) & 1;
        this.bit++;
        if (this.bit > 7) {
            this.bit = 0;
            this.byte++;
        }
        return result;
    }

    /**
     * Reads the given number of bits and returns them.
     *
     * @param count        The number of bits to read.
     * @param reverse      Set to true to read bits in reverse order (Starting with the lowest bit instead of the
     *                     highest bit). Defaults to false.
     * @return             The read bits.
     * @throws RangeError  If reached the end of the data.
     */
    public readBits(count: number, reverse: boolean = false): number {
        let result = 0;
        for (let i = 0; i < count; i++) {
            const bit = this.readBit(reverse);
            if (reverse) {
                result = result | (bit << i);
            } else {
                result = (result << 1) | bit;
            }
        }
        return result;
    }

    /**
     * Reads an unsigned 8 bit value (byte) and returns it.
     *
     * @return             The read value.
     * @throws RangeError  If reached the end of the data.
     */
    public readUint8(): number {
        if (this.bit) {
            // Slow lane: Need to construct the byte from two parts
            if (this.byte + 1 >= this.byteLength) {
                throw new RangeError("End of data");
            }
            return this.data[this.byte] << this.bit & 0xff | this.data[++this.byte] >> 8 - this.bit;
        } else {
            // Fast lane: Return byte directly
            if (this.byte >= this.byteLength) {
                throw new RangeError("End of data");
            }
            return this.data[this.byte++] & 0xff;
        }
    }

    /**
     * Reads the specified number of unsigned 8 bit values (bytes) and returns them.
     *
     * @param count        The number of bytes to read.
     * @return             The read bytes.
     * @throws RangeError  If reached the end of the data.
     */
    public readUint8s(count: number): Uint8Array {
        let result: Uint8Array;
        if (this.bit) {
            // Slow lane: Need to read the data byte by byte
            result = new Uint8Array(count);
            for (let i = 0; i < count; ++i) {
                result[i] = this.readUint8();
            }
        } else {
            // Fast lane: Read whole data block directly
            if (this.byte + count > this.byteLength) {
                throw new RangeError("End of data");
            }
            result = this.data.slice(this.byte, this.byte += count);
        }
        return result;
    }

    /**
     * Reads an unsigned 16 bit value and returns it.
     *
     * @return             The read value.
     * @throws RangeError  If reached the end of the data.
     */
    public readUint16(): number {
        return this.readUint8() | this.readUint8() << 8;
    }

    /**
     * Reads the specified number of unsigned 16 bit values and returns them.
     *
     * @param count        The number of values to read.
     * @return             The read values.
     * @throws RangeError  If reached the end of the data.
     */
    public readUint16s(count: number): Uint16Array {
        let result: Uint16Array;
        if (this.bit) {
            result = new Uint16Array(count);
            for (let i = 0; i < count; ++i) {
                result[i] = this.readUint16();
            }
        } else {
            result = new Uint16Array(this.data.slice(this.byte, this.byte += count * 2).buffer);
        }
        return result;
    }

    /**
     * Reads an unsigned 32 bit value and returns it.
     *
     * @return             The read value.
     * @throws RangeError  If reached the end of the data.
     */
    public readUint32(): number {
        return this.readUint16() | this.readUint16() << 16;
    }

    /**
     * Reads a single character and returns it.
     *
     * @return             The read character.
     * @throws RangeError  If reached the end of the data.
     */
    public readChar(): string {
        return String.fromCharCode(this.readUint8());
    }

    /**
     * Reads a string with the given length and returns it.
     *
     * @param len          The length of the string to read.
     * @return             The read string.
     * @throws RangeError  If reached the end of the data.
     */
    public readString(len: number): string {
        let result = "";
        for (let i = 0; i < len; ++i) {
            result += this.readChar();
        }
        return result;
    }

    /**
     * Reads a null-terminated string and returns it.
     *
     * @return The read string.
     */
    public readNullString(): string {
        let result = "";
        let c: number;
        while ((c = this.readUint8())) {
            result += String.fromCharCode(c);
        }
        return result;
    }

    /**
     * Reads the specified number of null-terminated strings and returns them.
     *
     * @param num  The number of null-terminated strings to read.
     * @return     The read strings.
     */
    public readNullStrings(num: number): string[] {
        let result: string[] = [];
        for (let i = 0; i < num; ++i) {
            result.push(this.readNullString());
        }
        return result;
    }
}
