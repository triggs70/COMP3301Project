/* Converts MediaPipe landmark coords into integer positions on our pixel canvas */

const CANVAS_SIZE = 32;


export function mapCoords(value) {
    const scaled = Math.floor(value * CANVAS_SIZE);
    return Math.max(0, Math.min(CANVAS_SIZE - 1, scaled));
}


export function mapLandmark(landmark) {
    return {
        x: mapCoords(landmark.x),
        y: mapCoords(landmark.y)
    };
}