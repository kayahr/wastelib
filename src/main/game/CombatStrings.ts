import { InputStream } from "../io/InputStream";

export class CombatStringsMap {
    private readonly ids: number[];

    private constructor(ids: Uint8Array) {
        this.ids = Array.prototype.slice.call(ids);
    }

    public static fromStream(stream: InputStream): CombatStringsMap {
        return new CombatStringsMap(stream.readBytes(37));
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
