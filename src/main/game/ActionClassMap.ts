import { InputStream } from "../io/InputStream";
import { ActionClass } from "./ActionClass";

export class ActionClassMap {
    private readonly actionClasses: ActionClass[][];

    private constructor(actionClasses: ActionClass[][]) {
        this.actionClasses = actionClasses;
    }

    public static fromStream(stream: InputStream, mapSize: number): ActionClassMap {
        const actionClasses: ActionClass[][] = [];
        for (let y = 0; y < mapSize; ++y) {
            let row: ActionClass[] = [];
            for (let x = 0; x < mapSize; x += 2) {
                const value = stream.readByte();
                row.push(value >> 4);
                row.push(value & 0xf);
            }
            actionClasses.push(row);
        }
        return new ActionClassMap(actionClasses);
    }

    public getActionClass(x: number, y: number): ActionClass {
        const row = this.actionClasses[y];
        if (row) {
            const actionClass = row[x];
            if (actionClass !== undefined) {
                return actionClass;
            }
        }
        return ActionClass.NONE;
    }
}
