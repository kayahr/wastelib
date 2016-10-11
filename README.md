wastelib
========

A JavaScript library (Written in [TypeScript]) for reading the assets of the game [Wasteland]. Can be used in web-based
or Node.js applications to easily parse all the images, animations, maps and other game data from the original
Wasteland files.


TODO
----

This library is currently under development and the following features are not yet implemented:

* Read encounter animations
* Read game data (Maps, shop item lists, savegame)
* Node.js compatibility
* Create namespaced bundle for simple web deployment
* Write unit tests


Build
-----

To build the project simply run `npm install`. This downloads the dependencies and then transpiles the typescript
sources in the `src` directory to JavaScript in the `lib` directory.


Usage
-----

### Web:

Copy the `wastelib.js` bundle from the `lib` directory to your website and include it. It provides the `wastelib`
namespace with all the classes and functions of the library. **TODO: This bundle doesn't exist yet!**

### Node.js:

Install wastelib as a standard NPM dependency into your NPM project:

```sh
npm install --save wastelib
```

And then simply require it:

```javascript
var wastelib = require("wastelib");
// Use wastelib.TitlePic class for example
```

You can also use ES6 imports if you are using *TypeScript* or some other transpiler supporting it::

```typescript
import { EndAnim, EndAnimPlayer } from "wastelib";
```


Canvas API and Node.js
----------------------

*wastelib* uses the Canvas API for generating image output so a Node.js application benefits from using [node-canvas].
But this is not a requirement. Without the Canvas API you simply can't use the various `toCanvas()` and `toImage()`
methods but you still can parse the Wasteland assets and manually convert them into whatever image format you like by
calling `getWidth()`, `getHeight()` and `getColor(x, y)` methods.


Parsing assets
--------------

There are classes for each asset type of the game:

* `Cursors` - For parsing the mouse cursor images from the `CURS` file.
* `EndAnim` - For parsing the end animation from the `END.CPA` file.
* `Font` - For parsing the color font from the `COLORF.FNT` file.
* `Sprites` - For parsing the sprites from the `IC0_9.WLF` and `MASKS.WLF` files.
* `Tilesets` - For parsing the tilesets from the `ALLHTDS1` and `ALLHTDS2` files.
* `TitlePic` - For parsing the title image from the `TITLE.PIC` file.

There are always two static methods to parse the files. The `fromFile()` method can be used with a `File` object
which can be created by a file selector in the browser. The method asynchronously returns the parsed asset (Using
the Promise API)

```javascript
const file = document.getElementById("selector").files[0];

TitlePic.fromFile(file).then(titlePic => {
    ...
});
```

The `fromArray()` method can be used to parse a file which is already read into an array like structure. It can be
a normal JavaScript array, a `Uint8Array` or a Node.js `Buffer` object. The asset is returned synchronously:

```javascript
const data = fs.readFileSync("title.pic");
const titlePic = TitlePic.fromArray(data);
```

For parsing Sprites you have to specify two files:

Sprites 

Assets
------

## title.pic

The *title.pic* file contains the



[TypeScript]: https://www.typescriptlang.org/
[Wasteland]: https://en.wikipedia.org/wiki/Wasteland_(video_game)
[node-canvas]: https://www.npmjs.com/package/canvas