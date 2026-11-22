/* Functions for drawing pixel art onto our canvas */

import { mapLandmark } from "./coord-map.js";

const GRID_SIZE = 32;


/* For drawing a single pixel on canvas */
export function drawPixel(context, x, y, colour) {
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) {
        return;
    }
    context.fillStyle = colour;
    context.fillRect(x, y, 1, 1);
}


/* For drawing thicker lines on canvas */
export function drawThickPixel(context, x, y, colour, thickness = 1) {
    const offset = Math.floor(thickness / 2);
    for (let row = 0; row < thickness; row++) {
        for (let col = 0; col < thickness; col++) {
            drawPixel(context, x - offset + col, y - offset + row, colour);
        }
    }
}



/* Draw a line between two points on the canvas using Bresenhams line algo */
export function drawLine(context, x1, y1, x2, y2, colour, thickness = 1) {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const stepX = x1 < x2 ? 1 : -1;
    const stepY = y1 < y2 ? 1 : -1;
    let error = dx - dy;
    while (true) {
        drawThickPixel(context, x1, y1, colour, thickness);
        if (x1 === x2 && y1 === y2) {
            break;
        }
        const doubledError = 2 * error;
        if (doubledError > -dy) {
            error -= dy;
            x1 += stepX;
        }
        if (doubledError < dx) {
            error += dx;
            y1 += stepY;
        }
    }
}


/* Connection b/w mediapipe landmarks, each pair is indices of two landmarks */
const BODY_CONNECTIONS = [
    /* Left arm */
    { start: 11, end: 13, colour: "#FF0000" },
    { start: 13, end: 15, colour: "#FF0000" },
    /* Right arm */
    { start: 12, end: 14, colour: "#0000FF" },
    { start: 14, end: 16, colour: "#0000FF" },
    /* Torso */
    { start: 11, end: 12, colour: "#3b82f6" },
    { start: 11, end: 23, colour: "#3b82f6" },
    { start: 12, end: 24, colour: "#3b82f6" },
    { start: 23, end: 24, colour: "#3b82f6" },
    /* Left leg */
    { start: 23, end: 25, colour: "#0000FF" },
    { start: 25, end: 27, colour: "#0000FF" },
    /* Right leg */
    { start: 24, end: 26, colour: "#FF0000" },
    { start: 26, end: 28, colour: "#FF0000" }
];


/* Draw skeleton using the mediapipe landmarks */
export function drawSkeleton(context, landmarks) {
    if (!landmarks) {
        return;
    }
    for (const connection of BODY_CONNECTIONS) {
        const start = landmarks[connection.start];
        const end = landmarks[connection.end];
        if (!start || !end) {
            continue;
        }
        const startPixel = mapLandmark(start);
        const endPixel = mapLandmark(end);
        drawLine(context, startPixel.x, startPixel.y, endPixel.x, endPixel.y, connection.colour, 3);
    }
}


/* Draw a head using the nose landmark */
export function drawHead(context, nose) {
    if (!nose) {
        return;
    }
    const nosePixel = mapLandmark(nose);
    const headWidth = 5;
    const headHeight = 6;
    const startX = nosePixel.x - Math.floor(headWidth / 2);
    const startY = nosePixel.y - Math.floor(headHeight / 2);
    for (let y = 0; y < headHeight; y++) {
        for (let x = 0; x < headWidth; x++) {
            drawPixel(context, startX + x, startY + y, "#fbbf24");
        }
    }
}


/* Draw torso using shoulder and hip landmarks */
export function drawTorso(context, landmarks) {
    const leftShoulder = landmarks?.[11];
    const rightShoulder = landmarks?.[12];
    const leftHip = landmarks?.[23];
    const rightHip = landmarks?.[24];
    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
        return;
    }
    const topLeft = mapLandmark(leftShoulder);
    const topRight = mapLandmark(rightShoulder);
    const bottomLeft = mapLandmark(leftHip);
    const bottomRight = mapLandmark(rightHip);
    context.fillStyle = "#3b82f6";
    context.beginPath();
    context.moveTo(topLeft.x, topLeft.y);
    context.lineTo(topRight.x, topRight.y);
    context.lineTo(bottomRight.x, bottomRight.y);
    context.lineTo(bottomLeft.x, bottomLeft.y);
    context.closePath();
    context.fill();
}


/* Render the complete character, bring together individual functions into one call */
export function drawCharacter(context, landmarks) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    if (!landmarks || landmarks.length === 0) {
        return;
    }
    drawSkeleton(context, landmarks);
    drawTorso(context, landmarks);
    drawHead(context, landmarks[0]);
}