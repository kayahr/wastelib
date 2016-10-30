import { BinaryReader } from "../io/BinaryReader";

export class ActionMap {
    private readonly actions: Uint8Array[];

    private constructor(actions: Uint8Array[]) {
        this.actions = actions;
    }

    public static read(reader: BinaryReader, size: number) {
        const actions: Uint8Array[] = [];
        for (let y = 0; y < size; ++y) {
            actions.push(reader.readUint8s(size));
        }
        return new ActionMap(actions);
    }

    public getAction(x: number, y: number): number {
        const row = this.actions[y];
        if (row) {
            const action = row[x];
            if (action !== undefined) {
                return action;
            }
        }
        return 0;
    }
}
