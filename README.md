# wastelib

A JavaScript library (Written in [TypeScript]) for reading the assets of the game [Wasteland]. Can be used in web-based or Node.js applications to easily parse all the images, animations, maps and other game  data from the original Wasteland files.

The library is based on the valuable information gathered by the members of the [Wasteland Deconstruction Wiki].

## Usage

Install wastelib as a standard NPM dependency:

```sh
npm install @kayahr/wastelib
```

And then simply import and use it:

```typescript
import { Title } from "@kayahr/wastelib";

const title = Title.fromBlob(titlePicBlob);
const width = title.getWidth();
const height = title.getHeight();
for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
        const rgbaPixel = title.getColor(x, y);
        // ...
    }
}
```

# Parsing assets

There are classes for each asset type of the game:

* `Cursors` - For parsing the mouse cursor images from the `CURS` file.
* `Ending` - For parsing the end animation from the `END.CPA` file.
* `Exe` - For fetching strings and offsets from the `WL.EXE` file.
* `Font` - For parsing the color font from the `COLORF.FNT` file.
* `Map` - For parsing map data from `GAME1` and `GAME2` files.
* `Portraits` - For parsing the portrait animations from the `ALLPICS1` and `ALLPICS2` files.
* `Savegame` - For parsing savegame data from `GAME1` and `GAME2` files.
* `ShopItemList` - For parsing shop item lists from `GAME1` and `GAME2` files.
* `Sprites` - For parsing the sprites from the `IC0_9.WLF` and `MASKS.WLF` files.
* `Tilesets` - For parsing the tilesets from the `ALLHTDS1` and `ALLHTDS2` files.
* `Title` - For parsing the title image from the `TITLE.PIC` file.

There are always two types of static methods to parse the files:

* The synchronous `fromArray()` method (or `fromArrays()` if data is read from multiple files) simply reads the data from a [Uint8Array]. How you fetched the data from the corresponding game files is up to you. In a browser you might want to [fetch] the data via HTTPS, while in Node.js you might want to read the files with [readFile].
* The asynchronous `fromBlob()` method (or `fromBlobs()` if data is read from multiple files) can be used with [Blob] or [File] objects which can for example be created by a file selector in the browser or with [openAsBlob] in Node.js.

## Canvas API

*wastelib* uses the Canvas API for generating image output but the API is build to not depend on a specific canvas implementation. So in a browser you can use the built-in canvas implementation and in Node.js you can use [node-canvas] instead.

Browser:

```typescript
import { Title } from "@kayahr/wastelib";

const title = await Title.fromBlob(await (await fetch("title.pic")).blob());
const canvas = title.toCanvas(document.createElement("canvas"));
document.appendChild(canvas);
```

Node.js:

```typescript
import { Title } from "@kayahr/wastelib";
import { createCanvas } from "canvas";
import { readFile, writeFile } from "node:fs/promises";

const title = await Title.fromArray(await readFile("title.pic"));
const canvas = title.toCanvas(createCanvas(0, 0));
await writeFile("/tmp/title.png", canvas.toBuffer());
```

So you always create an empty canvas object yourself (initial size doesn't matter) and pass it to the `toCanvas()` method which then fills the canvas with the image and returns it.


## Format documentation

* [Vertical XOR](https://github.com/kayahr/wastelib/blob/main/doc/formats/vertical-xor.md)
* [Huffman encoding](https://github.com/kayahr/wastelib/blob/main/doc/formats/huffman.md)
* [ALLHTDS format](https://github.com/kayahr/wastelib/blob/main/doc/formats/tilesets.md)
* [ALLPICS format](https://github.com/kayahr/wastelib/blob/main/doc/formats/allpics.md)
* [END.CPA format](https://github.com/kayahr/wastelib/blob/main/doc/formats/ending.md)


## See also

* [GitHub repository](https://github.com/kayahr/wastelib/)
* [API documentation](https://kayahr.github.io/wastelib/)
* [Wasteland Deconstruction Wiki]

[Wasteland Deconstruction Wiki]: https://wasteland.gamepedia.com/Wasteland:_The_Definitive_Deconstruction
[TypeScript]: https://www.typescriptlang.org/
[Wasteland]: https://en.wikipedia.org/wiki/Wasteland_(video_game)
[node-canvas]: https://www.npmjs.com/package/canvas
[IndexedDB API]: https://developer.mozilla.org/nl/docs/IndexedDB
[Uint8Array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array
[File]: https://developer.mozilla.org/en-US/docs/Web/API/File
[Blob]: https://developer.mozilla.org/en-US/docs/Web/API/Blob
[openAsBlob]: https://nodejs.org/api/fs.html#fsopenasblobpath-options
[fetch]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
[readFile]: https://nodejs.org/api/fs.html#fspromisesreadfilepath-options
