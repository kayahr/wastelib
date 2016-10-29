/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { InputStream, eos } from "./InputStream";

/**
 * Reader for binary data. Supports reading single bits, bytes, characters and strings and more.
 */
export class ArrayInputStream extends InputStream {
    /** Wrapped array to read from. */
    private data: ArrayLike<number>;

    /** The last byte index in the array. */
    private end: number;

    /** The current byte index. */
    private current: number;

    /**
     * Creates a new input stream reading from the given array.
     *
     * @param data    The array to read from.
     * @param offset  Optional start offset. Defaults to 0.
     * @param size    Optional maximum number of bytes to read from data array. Defaults to size of data array minus
     *                the offset.
     */
    public constructor(data: ArrayLike<number>, offset = 0, size = data.length - offset) {
        super();
        this.data = data;
        this.position = offset;
        this.end = offset + size;
    }

    protected read(): number {
        if (this.position >= this.end) {
            throw eos;
        }
        return this.data[this.position];
    }

    public skip(size: number = 1): void {
        this.position += size;
    }
}
