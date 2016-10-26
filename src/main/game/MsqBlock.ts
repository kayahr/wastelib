/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

export class MsqBlock {
    /** The MSQ block offset */
    private readonly offset: number;

    /** The MSQ block size */
    private readonly size: number;

    /**
     * Creates a new MSQ block with the given offset and size in the GAME file.
     *
     * @param offset  The MSQ block offset.
     * @param size    The MSQ block size.
     */
    public constructor(offset: number, size: number) {
        this.offset = offset;
        this.size = size;
    }

    /**
     * Returns the MSQ block offset.
     *
     * @return The MSQ block offset.
     */
    public getOffset(): number {
        return this.offset;
    }

    /**
     * Returns the MSQ block size.
     *
     * @return The MSQ block size
     */
    public getSize(): number {
        return this.size;
    }
}
