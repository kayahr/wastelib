/*
 * Copyright (c) 2026 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from "node:test";
import { assertThrowWithMessage } from "@kayahr/assert";
import { readFile } from "node:fs/promises";
import { Portrait } from "../../main/portrait/Portrait.ts";

describe("PortraitScript", () => {
    describe("getLine", () => {
        it("throws exception if the index is out of bounds", async () => {
            const portrait = Portrait.fromArray(await readFile("src/test/data/allpics1"), 0);
            const script = portrait.getScript(0);
            assertThrowWithMessage(() => script.getLine(-1), RangeError, "Index out of bounds: -1");
            assertThrowWithMessage(() => script.getLine(12), RangeError, "Index out of bounds: 12");
        });
    });
});
