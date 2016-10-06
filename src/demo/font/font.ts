import { Font } from "../../main/Font";

const fileSelector = <HTMLInputElement>document.getElementById("file");
const output = <HTMLDivElement>document.getElementById("output");

fileSelector.addEventListener("change", () => {
    const files = fileSelector.files;
    if (files && files.length === 1) {
        Font.fromFile(files[0]).then(font => {
            font.getChars().forEach(char => {
                output.appendChild(char.toCanvas());
            });
        });
    }
});
