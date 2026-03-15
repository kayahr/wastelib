/*
 * Copyright (c) 2026 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from "node:test";
import { assertEquals } from "@kayahr/assert";
import { readFile } from "node:fs/promises";
import { assertMatchImage } from "../support/image.ts";
import { createCanvasContext2D } from "../support/canvas.ts";
import { Ending } from "../../main/ending/Ending.ts";

describe("Ending", () => {
    describe("fromArray", () => {
        it("reads END.CPA from array", async () => {
            const array = await readFile("src/test/data/end.cpa");
            console.log(array.length);
            const ending = Ending.fromArray(array);
            assertEquals(ending.getWidth(), 288);
            assertEquals(ending.getHeight(), 128);
            await assertMatchImage(ending.toImageData(createCanvasContext2D()), "ending/000");
        });
    });
});
