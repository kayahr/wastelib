/*
 * Copyright (c) 2016 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import { Cursors } from "../main/cursor/Cursors.ts";
import { Ending } from "../main/ending/Ending.ts";
import { Font } from "../main/font/Font.ts";
import { Portraits } from "../main/portrait/Portraits.ts";
import { Sprites } from "../main/sprite/Sprites.ts";
import { Tilesets } from "../main/tile/Tilesets.ts";
import { Title } from "../main/title/Title.ts";
import { Exe } from "../main/exe/Exe.ts";
import { Map } from "../main/game/Map.ts";
import { Savegame } from "../main/game/Savegame.ts";
import { ShopItemList } from "../main/game/ShopItemList.ts";

/** The version of the indexed DB used to store the Wasteland files in the browser. */
const dbVersion = 1;

/** A type for wasteland filenames to ensure they are all written correctly. */
export type WastelandFilename = "ALLHTDS1" | "ALLHTDS2" | "ALLPICS1" | "ALLPICS2" | "COLORF.FNT" | "CURS" | "END.CPA"
    | "GAME1" | "GAME2" | "IC0_9.WLF" | "MASKS.WLF" | "TITLE.PIC" | "WL.EXE";

/** The names of the Wasteland files which must be installed in the browser. */
const ALL_FILES: WastelandFilename[] = [
    "ALLHTDS1",
    "ALLHTDS2",
    "ALLPICS1",
    "ALLPICS2",
    "COLORF.FNT",
    "CURS",
    "END.CPA",
    "GAME1",
    "GAME2",
    "IC0_9.WLF",
    "MASKS.WLF",
    "TITLE.PIC",
    "WL.EXE"
];

/**
 * Checks wether the given filename is a wasteland filename.
 *
 * @param filename  The filename to check.
 * @returns True if filename is a wasteland filename, false if not.
 */
function isWastelandFilename(filename: string): filename is WastelandFilename {
    return ALL_FILES.includes(filename as WastelandFilename);
}

function toError(e: unknown): Error {
    return e instanceof Error ? e : new Error(String(e));
}

/**
 * Opens the indexed DB used to store Wasteland files. The database is automatically created if not already present.
 *
 * @returns The opened database.
 */
function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        try {
            const request = indexedDB.open("wastelib", dbVersion);
            request.addEventListener("success", () => {
                const db: IDBDatabase = request.result;
                resolve(db);
            });
            request.addEventListener("error", event => {
                reject(toError(request.error));
            });
            request.addEventListener("upgradeneeded", event => {
                const db: IDBDatabase = request.result;
                db.createObjectStore("files");
            });
        } catch (error) {
            reject(toError(error));
        }
    });
}

/**
 * Returns a Wasteland file from the database.
 *
 * @param db    The database.
 * @param name  The name of the file to return.
 * @returns The file read from the database. If file is not found then undefined is returned.
 */
function getFile(db: IDBDatabase, name: WastelandFilename): Promise<File | undefined> {
    return new Promise<File | undefined>((resolve, reject) => {
        try {
            const trans = db.transaction([ "files" ]);
            const store = trans.objectStore("files");
            const request = store.get(name);
            request.addEventListener("success", () => {
                const file = request.result as File | undefined;
                resolve(file);
            });
            request.addEventListener("error", event => {
                reject(toError(request.error));
            });
        } catch (error) {
            reject(toError(error));
        }
    });
}

/**
 * Stores a file in the database. None-Wasteland files are ignored.
 *
 * @param db    The database.
 * @param file  The file to store.
 */
function putFile(db: IDBDatabase, file: File): Promise<void> {
    const fileName = file.name.toUpperCase();
    if (!isWastelandFilename(fileName)) {
        return Promise.resolve();
    }
    return new Promise<void>((resolve, reject) => {
        try {
            const trans = db.transaction([ "files" ], "readwrite");
            const store = trans.objectStore("files");
            const request = store.put(file, fileName);
            request.addEventListener("success", () => {
                resolve();
            });
            request.addEventListener("error", event => {
                reject(toError(request.error));
            });
        } catch (error) {
            reject(toError(error));
        }
    });
}

/**
 * Stores multiple files in the database. None-Wasteland files are ignored.
 *
 * @param db     The database.
 * @param files  The files to store.
 */
async function putFiles(db: IDBDatabase, files: File[]): Promise<void> {
    for (const file of files) {
        await putFile(db, file);
    }
}

/**
 * Fetches all Wasteland files from the database and returns a map with the filename as key and the file as value.
 * If not all files are found in the database then the specified callback is called with the names of the missing
 * files and the present files. This callback is responsible for letting the user select the missing files and return
 * them asynchronously.
 *
 * This function calls itself recursively until all files are present in the database.
 *
 * @param db            The database.
 * @param installFiles  The installation callback to call if not all Wasteland files were found in the database.
 * @returns Array with all Wasteland files.
 */
async function getFiles(db: IDBDatabase,
        installFiles: (missing: WastelandFilename[], present: WastelandFilename[]) => Promise<File[]>,
        filenames: WastelandFilename[] = ALL_FILES): Promise<Record<string, File>> {
    const files = await Promise.all(filenames.map(filename => getFile(db, filename)))
    const missing: WastelandFilename[] = [];
    const present: WastelandFilename[] = [];
    const fileMap: Record<string, File> = {};
    for (let i = 0; i < filenames.length; ++i) {
        const file = files[i];
        if (!file) {
            missing.push(filenames[i]);
        } else {
            fileMap[filenames[i]] = file;
            present.push(filenames[i]);
        }
    }
    if (missing.length) {
        const files = await installFiles(missing, present);
        return putFiles(db, files).then(() => getFiles(db, installFiles));
    } else {
        return fileMap;
    }
}

/**
 * Web-based factory for all the Wasteland assets.
 */
export class WebAssets {
    /** The file map (Mapping filenames to actual Wasteland files). */
    private readonly files: Record<string, File>;

    /**
     * Creates the web assets factory with the given file map.
     *
     * @param files  The file map mapping filenames to Wasteland files installed in the browser.
     */
    private constructor(files: Record<string, File>) {
        this.files = files;
    }

    /**
     * Creates the web assets factory.
     *
     * @param installFiles  Callback called when not all files are found in the browser. The callback must do some UI
     *                      work to let the user select the missing files (filenames of the missing files and the
     *                      present files are passed to the callback) and then the list of selected files must be
     *                      returned asynchronously. None-Wasteland files in the returned list are ignored. The
     *                      callback is called again if files are still missing.
     * @param filenames     Optional list of filenames to install. If not specified then all supported Wasteland
     *                      files are installed.
     * @returns The created web assets factory.
     */
    public static async create(
            installFiles: (missing: WastelandFilename[], present: WastelandFilename[]) => Promise<File[]>,
            filenames: WastelandFilename[] = ALL_FILES): Promise<WebAssets> {
        const db = await openDB();
        const fileMap = await getFiles(db, installFiles, filenames)
        return new WebAssets(fileMap);
    }

    /**
     * Returns the wasteland file with the given filename.
     *
     * @param filename  The name of the file to return.
     * @returns The file.
     */
    private getFile(filename: WastelandFilename): File {
        return this.files[filename];
    }

    /**
     * Reads the mouse cursors from the CURS file and returns them.
     *
     * @returns The mouse cursors.
     */
    public readCursors(): Promise<Cursors> {
        return Cursors.fromBlob(this.getFile("CURS"));
    }

    /**
     * Reads the end animation from the END.CPA file and returns them.
     *
     * @returns The end animation.
     */
    public readEnding(): Promise<Ending> {
        return Ending.fromBlob(this.getFile("END.CPA"));
    }

    /**
     * Reads the color font from the COLORF.FNT file and returns it.
     *
     * @returns The font.
     */
    public readFont(): Promise<Font> {
        return Font.fromBlob(this.getFile("COLORF.FNT"));
    }

    /**
     * Reads the portraits from the ALLPICS1 and ALLPICS2 files and returns them.
     *
     * @returns The portraits.
     */
    public readPortraits(): Promise<Portraits> {
        return Portraits.fromBlobs(this.getFile("ALLPICS1"), this.getFile("ALLPICS2"));
    }

    /**
     * Reads the sprites from the IC0_9.WLF and MASKS.WLF files and returns them.
     *
     * @returns The sprites.
     */
    public readSprites(): Promise<Sprites> {
        return Sprites.fromBlobs(this.getFile("IC0_9.WLF"), this.getFile("MASKS.WLF"));
    }

    /**
     * Reads the tilesets from the ALLHTDS1 and ALLHTDS2 files and returns them.
     *
     * @returns The tilesets.
     */
    public readTilesets(): Promise<Tilesets> {
        return Tilesets.fromBlobs(this.getFile("ALLHTDS1"), this.getFile("ALLHTDS2"));
    }

    /**
     * Reads the title image from the TITLE.PIC file and returns it.
     *
     * @returns The title image.
     */
    public readTitle(): Promise<Title> {
        return Title.fromBlob(this.getFile("TITLE.PIC"));
    }

    /**
     * Reads the game information from the WL.EXE file and returns it.
     *
     * @returns The global game data from the WL.EXE file.
     */
    public readExe(): Promise<Exe> {
        return Exe.fromBlob(this.getFile("WL.EXE"));
    }

    /**
     * Reads a map from GAME1 or GAME2.
     *
     * @param location - The map location (0-49)
     * @returns the read map.
     */
    public async readMap(location: number): Promise<Map> {
        const exe = await this.readExe();
        const map = exe.getLocationMap(location);
        const disk  = exe.getLocationDisk(location);
        const offset = exe.getMapOffset(disk, map);
        const mapSize = exe.getMapSize(disk, map);
        const tileMapOffset = exe.getTileMapOffset(disk, map);
        return Map.fromBlob(this.getFile(disk === 0 ? "GAME1" : "GAME2"), offset, mapSize, tileMapOffset);
    }

    /**
     * Reads a shop item list from GAME1 or GAME2.
     *
     * @param shop - The shop number (0-2 is in GAME1, 4 is in GAME2, 3 is invalid)
     * @returns The read shop item list.
     */
    public async readShopItemList(shop: number): Promise<ShopItemList> {
        const exe = await this.readExe();
        const offset = exe.getShopItemListOffset(shop);
        return ShopItemList.fromBlob(this.getFile(shop === 4 ? "GAME2" : "GAME1"), offset);
    }

    /**
     * @returns the savegame from GAME1 or GAME2 (depending on which savegame has the higher serial number.
     */
    public async readSavegame(): Promise<Savegame> {
        const exe = await this.readExe();
        const savegame1 = await Savegame.fromBlob(this.getFile("GAME1"), exe.getSavegameOffset(0));
        const savegame2 = await Savegame.fromBlob(this.getFile("GAME2"), exe.getSavegameOffset(0));
        return savegame1.getSerial() >= savegame2.getSerial() ? savegame1 : savegame2;
    }
}
