import { Sprites } from "../../main/Sprites";

const fileSelector = <HTMLInputElement>document.getElementById("file");
const output = <HTMLDivElement>document.getElementById("output");

fileSelector.addEventListener("change", () => {
    const files = fileSelector.files;
    if (files && files.length === 2) {
        const [ dataFile, masksFile ] = [files[0], files[1]].sort((a, b) => b.size - a.size);
        Sprites.fromFile(dataFile, masksFile).then(sprites => {
            sprites.getSprites().forEach(sprite => {
                output.appendChild(sprite.toCanvas());
            });
        });
    }
});
