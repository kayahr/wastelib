import { type CanvasContext2DLike, type CanvasLike, type ImageDataLike, getCanvasContext2D } from "../../main/sys/canvas.ts";

export function createCanvas(): CanvasLike & { dump(): ImageDataLike } {
    let data: ImageDataLike;
    return {
        width: 320,
        height: 200,
        dump: () => data,
        getContext(id: string): CanvasContext2DLike {
            return {
                putImageData(imageData: ImageDataLike, x: number, y: number): void {
                    data = imageData;
                },
                createImageData(width: number, height: number): ImageDataLike {
                    return {
                        width,
                        height,
                        data: new Uint8ClampedArray(width * height * 4)
                    }
                }
            }
        }
    }
}

export function createCanvasContext2D(): CanvasContext2DLike {
    return getCanvasContext2D(createCanvas());
}
