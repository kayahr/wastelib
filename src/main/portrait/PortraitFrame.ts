/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { PicImage } from "../image/PicImage";
import { Portrait } from "./Portrait";
import { PortraitUpdate } from "./PortraitUpdate";

export class PortraitFrame extends PicImage {
    public constructor(portrait: Portrait) {
        super(portrait.getData(), 96, 84);
    }

    public update(update: PortraitUpdate): void {
        update.getPatches().forEach(patch => {
            const offset = patch.getOffset();
            patch.getData().forEach((value, index) => {
                this.data[offset + index] ^= value;
            });
        });
    }
}
