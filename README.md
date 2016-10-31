wastelib
========

A JavaScript library (Written in [TypeScript]) for reading the assets of the game [Wasteland]. Can be used in web-based
or Node.js applications to easily parse all the images, animations, maps and other game data from the original
Wasteland files.

The library is based on the valuable information gathered by the members of the
[Wasteland Deconstruction Wiki].


TODO
----

This library is currently under development and the following features are not yet implemented:

* Read game data (Maps, shop item lists, savegame)
* Write unit tests


Build
-----

To build the project simply run `npm install`.

This downloads the dependencies and then compiles the typescript sources in the `src` directory to JavaScript in the `lib` directory for usage in Node.js applications.

It also creates a UMD bundle `lib/wastelib.js` which can be used in web applications.


Usage
-----

### Web:

Copy the `wastelib.js` bundle from the `lib` directory to your website and include it. It provides the `wastelib`
namespace with all the classes and functions of the library.

### Node.js:

Install wastelib as a standard NPM dependency into your NPM project:

```sh
npm install --save wastelib
```

And then simply require it:

```javascript
var wastelib = require("wastelib");
// Use wastelib.EndingPlayer class for example
```

You can also use ES6 imports if you are using *TypeScript* or some other compiler supporting it::

```javascript
import { Ending, EndingPlayer } from "wastelib";
```


Canvas API and Node.js
----------------------

*wastelib* uses the Canvas API for generating image output so a Node.js application benefits from using [node-canvas].
But this is not a requirement. Without the Canvas API you simply can't use the various `toCanvas()` and `toImage()`
methods but you can still parse the Wasteland assets and manually convert them into whatever image format you like by
calling `getWidth()`, `getHeight()` and `getColor(x, y)` methods.


Parsing assets
--------------

There are classes for each asset type of the game:

* `Cursors` - For parsing the mouse cursor images from the `CURS` file.
* `Ending` - For parsing the end animation from the `END.CPA` file.
* `Font` - For parsing the color font from the `COLORF.FNT` file.
* `Portraits` - For parsing the portrait animations from the `ALLPICS1` and `ALLPICS2` files.
* `Sprites` - For parsing the sprites from the `IC0_9.WLF` and `MASKS.WLF` files.
* `Tilesets` - For parsing the tilesets from the `ALLHTDS1` and `ALLHTDS2` files.
* `Title` - For parsing the title image from the `TITLE.PIC` file.

There are always two types of static methods to parse the files. The `fromBlob()` (and/or `fromBlobs()`) method
can be used with `Blob` or `File` objects which can be created by a file selector in the browser. The methods
asynchronously return the parsed assets (Using the Promise API). Example:

```javascript
const file = document.getElementById("selector").files[0];

Title.fromBlob(file).then(title => {
    ...
});
```

The `fromArray()` (and/or `fromArrays()`) methods can be used to parse files which are already read into
`Uint8Array` objects. Node.js buffers are derived from this data type so it can be used as input as well. The assets
are returned synchronously. Example:

```javascript
const data = fs.readFileSync("title.pic");
const title = Title.fromArray(data);
```


Web Assets
----------

Because of copyright issues you don't want to include the Wasteland files in your web application and you want to rely
on the users installation of Wasteland. But this means the user has to select the files in the browser so JavaScript
can read them. To improve the usability of the library in a web environment wastelib provides a class called
`WebAssets`. This class is an asset factory which can be used to store and retrieve all the original Wasteland files in
the browser by using the [IndexedDB API].

The user has to select all the files on the local system once and this selection is a UI specific task and not the
responsibility of wastelib. But you only need to implement a single callback function for this which then
asynchronously provides the selected files. Everything else is handled by wastelib.

Here is a very simplistic example implementation:

```javascript
// This installer callback is only called if files are missing in the database
function installer(filenames) {
    return new Promise(function(resolve, reject) {
        // Display some UI telling the user to select the Wasteland files with the provided file input element
        var selector = document.createElement("input");
        selector.type = "file";
        document.body.appendChild(selector);
        selector.onchange = function() {
            document.body.removeChild(selector);
            resolve(Array.prototype.slice.call(selector.files));
        };
    });
}

WebAssets.create(installer).then(function(assets) {
    assets.readTitle().then(function(title) {
        // Do something with the title image
    });
    assets.readTilesets().then(function(tilesets) {
        // Do something with the tilesets
    });
    // ... and so on ...
});
```


Unknown data
------------

Even though we deciphered most of the data there is still unknown stuff especially in the game maps. Wastelib exports
the unknown data with methods like `getUnknown$03()` where the part after the dollar sign is the hexadecimal
offset in the data block or some human readable identifier if there is no fixed offset. If you find out the purpose of
this data then please let me know!


See also
--------

* [GitHub repository](https://github.com/kayahr/wastelib/)
* [NPM repository](https://www.npmjs.com/package/wastelib/)
* [API documentation](https://kayahr.github.io/wastelib/api/)

[Wasteland Deconstruction Wiki]: http://wasteland.gamepedia.com/Wasteland:_The_Definitive_Deconstruction
[TypeScript]: https://www.typescriptlang.org/
[Wasteland]: https://en.wikipedia.org/wiki/Wasteland_(video_game)
[node-canvas]: https://www.npmjs.com/package/canvas
[IndexedDB API]: https://developer.mozilla.org/nl/docs/IndexedDB
