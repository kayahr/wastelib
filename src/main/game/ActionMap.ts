import { InputStream } from "../io/InputStream";

export class ActionMap {
    private readonly actions: Uint8Array[];

    private constructor(actions: Uint8Array[]) {
        this.actions = actions;
    }

    public static fromStream(stream: InputStream, size: number) {
        const actions: Uint8Array[] = [];
        for (let y = 0; y < size; ++y) {
            actions.push(stream.readBytes(size));
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
