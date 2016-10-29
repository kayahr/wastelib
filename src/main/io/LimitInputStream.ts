/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { InputStream, eos } from "./InputStream";

export class LimitInputStream extends InputStream {
    private readonly stream: InputStream;

    private readonly size: number;

    public constructor(stream: InputStream, size: number) {
        super();
        this.stream = stream;
        this.size = size;
    }

    protected read(): number {
        if (this.position >= this.size) {
            throw eos;
        }
        return this.stream.readByte();
    }
}
