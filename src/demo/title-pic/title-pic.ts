import { TitlePic } from "../../main/TitlePic";

const fileSelector = <HTMLInputElement>document.getElementById("file");
const output = <HTMLDivElement>document.getElementById("output");

fileSelector.addEventListener("change", () => {
    const files = fileSelector.files;
    if (files && files.length === 1) {
        TitlePic.fromFile(files[0]).then(titlePic => {
            output.appendChild(titlePic.toCanvas());
        });
    }
});
