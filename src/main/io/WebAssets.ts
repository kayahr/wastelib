/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { Cursors } from "../cursor/Cursors.js";
import { Ending } from "../ending/Ending.js";
import { Font } from "../font/Font.js";
import { Portraits } from "../portrait/Portraits.js";
import { Sprites } from "../sprite/Sprites.js";
import { toError } from "../sys/error.js";
import { Tilesets } from "../tile/Tilesets.js";
import { Title } from "../title/Title.js";

/** The version of the indexed DB used to store the Wasteland files in the browser. */
const dbVersion = 1;

/** A type for wasteland filenames to ensure they are all written correctly. */
export type WastelandFilename = "ALLHTDS1" | "ALLHTDS2" | "ALLPICS1" | "ALLPICS2" | "COLORF.FNT" | "CURS" | "END.CPA"
    | "GAME1" | "GAME2" | "IC0_9.WLF" | "MASKS.WLF" | "TITLE.PIC";

/** The names of the Wasteland files which must be installed in the browser. */
const filenames: WastelandFilename[] = [
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
    "TITLE.PIC"
];

/**
 * Checks wether the given filename is a wasteland filename.
 *
 * @param filename  The filename to check.
 * @return True if filename is a wasteland filename, false if not.
 */
function isWastelandFilename(filename: string): filename is WastelandFilename {
    return (filenames as string[]).indexOf(filename) >= 0;
}

/**
 * Opens the indexed DB used to store Wasteland files. The database is automatically created if not already present.
 *
 * @return The opened database.
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
        } catch (e) {
            reject(toError(e));
        }
    });
}

/**
 * Returns a Wasteland file from the database.
 *
 * @param db    The database.
 * @param name  The name of the file to return.
 * @return The file read from the database. If file is not found then undefined is returned.
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
        } catch (e) {
            reject(toError(e));
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
        } catch (e) {
            reject(toError(e));
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
 * files. This callback is responsible for letting the user select the missing files and return them asynchronously.
 *
 * This function calls itself recursively until all files are present in the database.
 *
 * @param db            The database.
 * @param installFiles  The installation callback to call if not all Wasteland files were found in the database.
 * @return Array with all Wasteland files.
 */
async function getFiles(db: IDBDatabase, installFiles: (filenames: WastelandFilename[]) => Promise<File[]>):
        Promise<{ [name: string]: File }> {
    const files = await Promise.all(filenames.map(filename => getFile(db, filename)));
    const missing: WastelandFilename[] = [];
    const fileMap: { [name: string]: File } = {};
    for (let i = 0; i < filenames.length; ++i) {
        const file = files[i];
        if (file == null) {
            missing.push(filenames[i]);
        } else {
            fileMap[filenames[i]] = file;
        }
    }
    if (missing.length > 0) {
        return installFiles(missing).then(files => putFiles(db, files).then(() => getFiles(db, installFiles)));
    } else {
        return fileMap;
    }
}

/**
 * Web-based factory for all the Wasteland assets.
 */
export class WebAssets {
    /** The file map (Mapping filenames to actual Wasteland files). */
    private readonly files: { [name: string]: File };

    /**
     * Creates the web assets factory with the given file map.
     *
     * @param files  The file map mapping filenames to Wasteland files installed in the browser.
     */
    private constructor(files: { [name: string]: File }) {
        this.files = files;
    }

    /**
     * Creates the web assets factory.
     *
     * @param installFiles  Callback called when not all files are found in the browser. The callback must do some UI
     *                      work to let the user select the missing files (filenames of the missing files are passed to
     *                      the callback) and then the list of selected files must be returned asynchronously.
     *                      None-Wasteland files in the returned list are ignored. The callback is called again if
     *                      files are still missing.
     * @return The created web assets factory.
     */
    public static create(installFiles: (filenames: WastelandFilename[]) => Promise<File[]>): Promise<WebAssets> {
        return openDB().then(db => getFiles(db, installFiles).then(fileMap => new WebAssets(fileMap)));
    }

    /**
     * Returns the wasteland file with the given filename.
     *
     * @param filename  The name of the file to return.
     * @return The file.
     */
    private getFile(filename: WastelandFilename): File {
        return this.files[filename];
    }

    /**
     * Reads the mouse cursors from the CURS file and returns them.
     *
     * @return The mouse cursors.
     */
    public readCursors(): Promise<Cursors> {
        return Cursors.fromBlob(this.getFile("CURS"));
    }

    /**
     * Reads the end animation from the END.CPA file and returns them.
     *
     * @return The end animation.
     */
    public readEnding(): Promise<Ending> {
        return Ending.fromBlob(this.getFile("END.CPA"));
    }

    /**
     * Reads the color font from the COLORF.FNT file and returns it.
     *
     * @return The font.
     */
    public readFont(): Promise<Font> {
        return Font.fromBlob(this.getFile("COLORF.FNT"));
    }

    /**
     * Reads the portraits from the ALLPICS1 and ALLPICS2 files and returns them.
     *
     * @return The portraits.
     */
    public readPortraits(): Promise<Portraits> {
        return Portraits.fromBlobs(this.getFile("ALLPICS1"), this.getFile("ALLPICS2"));
    }

    /**
     * Reads the sprites from the IC0_9.WLF and MASKS.WLF files and returns them.
     *
     * @return The sprites.
     */
    public readSprites(): Promise<Sprites> {
        return Sprites.fromBlobs(this.getFile("IC0_9.WLF"), this.getFile("MASKS.WLF"));
    }

    /**
     * Reads the tilesets from the ALLHTDS1 and ALLHTDS2 files and returns them.
     *
     * @return The tilesets.
     */
    public readTilesets(): Promise<Tilesets> {
        return Tilesets.fromBlobs(this.getFile("ALLHTDS1"), this.getFile("ALLHTDS2"));
    }

    /**
     * Reads the title image from the TITLE.PIC file and returns it.
     *
     * @return The title image.
     */
    public readTitle(): Promise<Title> {
        return Title.fromBlob(this.getFile("TITLE.PIC"));
    }
}
