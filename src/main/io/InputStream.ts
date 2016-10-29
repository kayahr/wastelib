/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

export const eos = new Error("End of stream");

export abstract class InputStream {
    protected position = 0;

    protected abstract read(): number;

    public readByte(): number {
        const byte = this.read();
        this.position++;
        return byte;
    }

    public getPosition(): number {
        return this.position;
    }

    public seek(offset: number): void {
        this.skip(offset - this.position);
    }

    public readBytes(size: number): Uint8Array {
        const bytes = new Uint8Array(size);
        for (let i = 0; i < size; ++i) {
            bytes[i] = this.readByte();
        }
        return bytes;
    }

    public skip(size: number = 1): void {
        if (size < 0) {
            throw new Error("Stream can only seek forwards. Diff=" + size);
        }
        for (let i = 0; i < size; ++i) {
            this.readByte();
        }
    }
}
