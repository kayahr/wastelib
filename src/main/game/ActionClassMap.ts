/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { BinaryReader } from "../io/BinaryReader";
import { ActionClass } from "./ActionClass";

export class ActionClassMap {
    private readonly actionClasses: ActionClass[][];

    private constructor(actionClasses: ActionClass[][]) {
        this.actionClasses = actionClasses;
    }

    public static read(reader: BinaryReader, mapSize: number): ActionClassMap {
        const actionClasses: ActionClass[][] = [];
        for (let y = 0; y < mapSize; ++y) {
            let row: ActionClass[] = [];
            for (let x = 0; x < mapSize; x += 2) {
                const value = reader.readUint8();
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
