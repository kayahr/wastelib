/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { PicImage } from "./PicImage";
import { EndAnim } from "./EndAnim";
import { EndAnimUpdate } from "./EndAnimUpdate";

export class EndAnimFrame extends PicImage {
    public constructor(endAnim: EndAnim) {
        super(endAnim.getData(), endAnim.getWidth(), endAnim.getHeight());
    }

    public update(update: EndAnimUpdate): void {
        update.getUpdates().forEach(patch => {
            const offset = patch.getOffset();
            patch.getUpdate().forEach((value, index) => {
                this.data[offset + index] = value;
            });
        });
    }
}
