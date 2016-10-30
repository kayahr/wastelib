/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { ActionClass } from "./ActionClass";

/**
 * Information about a single tile on a map.
 */
export class MapTile {
    private readonly actionClass: ActionClass;

    private readonly action: number;

    private readonly image: number;

    public constructor(actionClass: ActionClass, action: number, image: number) {
        this.actionClass = actionClass;
        this.action = action;
        this.image = image;
    }

    public getActionClass(): ActionClass {
        return this.actionClass;
    }

    public getAction(): number {
        return this.action;
    }

    public getImage(): number {
        return this.image;
    }
}
