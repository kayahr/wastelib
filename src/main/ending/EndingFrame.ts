/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { PicImage } from "../image/PicImage";
import { Ending } from "./Ending";
import { EndingUpdate } from "./EndingUpdate";

export class EndingFrame extends PicImage {
    public constructor(ending: Ending) {
        super(ending.getData(), ending.getWidth(), ending.getHeight());
    }

    public update(update: EndingUpdate): void {
        update.getUpdates().forEach(patch => {
            const offset = patch.getOffset();
            patch.getUpdate().forEach((value, index) => {
                this.data[offset + index] = value;
            });
        });
    }
}
