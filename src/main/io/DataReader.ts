/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { InputStream } from "./InputStream";

/**
 * Reader for binary data. Supports reading single bits, bytes, characters and strings and more.
 */
export class DataReader {
    private stream: InputStream;

    private buffer: number;

    /** The current bit index. */
    private bit: number;

    /**
     * Creates a new binary reader for the given data.
     *
     * @param stream
     */
    public constructor(stream: InputStream) {
        this.stream = stream;
        this.bit = 0;
    }

    /**
     * Synchronizes the reader so it points to a full byte if it currently doesn't.
     */
    public sync(): this {
        this.bit = 0;
        return this;
    }

    /**
     * Reads a single bit and returns it.
     *
     * @return The read bit.
     */
    public readBit(reverse: boolean = false): number {
        if (this.bit === 0) {
            this.buffer = this.stream.readByte();
        }
        const result = (reverse ? (this.buffer >> (this.bit)) : (this.buffer >> (7 - this.bit))) & 1;
        this.bit = (this.bit + 1) & 7;
        return result;
    }

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
     * @return The read value.
     */
    public readUint8(): number {
        if (this.bit) {
            return this.buffer << this.bit & 0xff | (this.buffer = this.stream.readByte()) >> 8 - this.bit;
        } else {
            return this.stream.readByte() & 0xff;
        }
    }

    /**
     * Reads the specified number of unsigned 8 bit values and returns it.
     *
     * @param len  The number of bytes to read.
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
     * Reads the specified number of unsigned 16 bit values and returns it.
     *
     * @param len  The number of value to read.
     * @return The read values.
     */
    public readUint16s(len: number): number[] {
        const result: number[] = [];
        for (let i = 0; i < len; ++i) {
            result.push(this.readUint16());
        }
        return result;
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
