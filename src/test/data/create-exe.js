#!/usr/bin/env node
import { spawn } from "node:child_process";
import { once } from "node:events";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
    savegameOffset0,
    savegameOffset1
} from "../exe/exe-data.ts";

const baseDir = import.meta.dirname;

const helloExe = join(baseDir, "hello.exe");
const wlExe = join(baseDir, "wl.exe");
const wluExe = join(baseDir, "wlu.exe");

// Create empty executable data and initialize it with a minimal Hello World program
const data = await readFile(helloExe);

// Fill exe with test data
const view = new DataView(data.buffer);
view.setUint16(0x880c, savegameOffset0 & 0xffff, true);
view.setUint16(0x880f, savegameOffset0 >> 16, true);
view.setUint16(0x8819, savegameOffset1 & 0xffff, true);
view.setUint16(0x881c, savegameOffset1 >> 16, true);

// Write wlu.exe
await writeFile(wluExe, data);

// Create compressed wl.exe
const [ code ] = await once(spawn("exepack", [ wluExe, wlExe ], { stdio: "inherit" }), "close");
if (code !== 0) {
    throw new Error("exepack failed");
}
