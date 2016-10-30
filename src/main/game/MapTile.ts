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

    /**
     * Creates a new map tile.
     *
     * @param actionClass  The action class of this tile.
     * @param action       The action to execute when player enters the tile.
     * @param image        The index of the image of the active tileset to display.
     */
    public constructor(actionClass: ActionClass, action: number, image: number) {
        this.actionClass = actionClass;
        this.action = action;
        this.image = image;
    }

    /**
     * Returns the action class of this tile.
     *
     * @return The action class.
     */
    public getActionClass(): ActionClass {
        return this.actionClass;
    }

    /**
     * Returns the action to execute when player enters the tile.
     *
     * @return The action
     */
    public getAction(): number {
        return this.action;
    }

    /**
     * Returns the index of the image of the active tileset to display for this tile. Actually the index 0-9 references
     * a sprite from the IC0_9.WLF while indices >= 10 reference the tiles in the tileset (minus 10).
     *
     * @return The index of the image to display.
     */
    public getImage(): number {
        return this.image;
    }
}
