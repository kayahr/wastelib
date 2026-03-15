/*
 * Copyright (c) 2026 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from "node:test";
import { type CanvasLike, getCanvasContext2D } from "../../main/sys/canvas.ts";
import { assertThrowWithMessage } from "@kayahr/assert";

describe("canvas", () => {
    describe("getCanvasContext2D", () => {
        it("throws exception when canvas has no 2D context", () => {
            const brokenCanvas: CanvasLike = {
                width: 0,
                height: 0,
                getContext: () => null
            };
            assertThrowWithMessage(() => getCanvasContext2D(brokenCanvas), Error, "Unable to create 2D rendering context");
        });
    });
});
