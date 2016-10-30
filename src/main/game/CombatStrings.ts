/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { BinaryReader } from "../io/BinaryReader";

export class CombatStringMap {
    private readonly ids: number[];

    private constructor(ids: Uint8Array) {
        this.ids = Array.prototype.slice.call(ids);
    }

    public static read(reader: BinaryReader): CombatStringMap {
        return new CombatStringMap(reader.readUint8s(37));
    }

    public toString(): string {
        let result = "";

        for (let i = 0; i < this.ids.length; i++) {
            const v = this.ids[i];
            result += v >> 2;
            result += ":" + (v & 3);
            result += "\n";
        }

        return result;
    }

    public getMaxIndex(): number {
        return Math.max(...this.ids);
    }
}
