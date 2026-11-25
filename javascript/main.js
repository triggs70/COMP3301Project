/* Main script */

import { startWebcam, initPoseDetector, startPoseDetection, getLandmarks } from "./pose-detection.js";
import { drawCharacter } from "./pixel-render.js";


const video = document.getElementById("webcam");
const status = document.getElementById("status");
const canvas = document.getElementById("pixel-canvas");
const ctx = canvas.getContext("2d");
const fpsCounter = document.getElementById("fps-counter");
let frameCount = 0;
let lastFpsUpdate = performance.now();
const pauseButton = document.getElementById("pause-button");
let isPaused = false;
let frozenLandmarks = null;
let demoMode = false;
const mockLandmarks = createMockLandmarks();
const testButton = document.getElementById("test-button");
const testResult = document.getElementById("test-result");
const testDuration = 30000;
let isTesting = false;
let testStart = 0;
let testFrames = 0;


pauseButton.addEventListener("click", () => {
    isPaused = !isPaused;
    pauseButton.textContent = isPaused ? "Resume Character" : "Pause Character";
    testButton.disabled = isPaused;
    if (!isPaused) {
        frozenLandmarks = null;
    }
});

testButton.addEventListener("click", startTest);


/* Calculate the rendering frames per second */
function updateFps(currentTime) {
    frameCount++;
    const elapsedTime = currentTime - lastFpsUpdate;
    if (elapsedTime >= 1000) {
        const elapsedSeconds = elapsedTime / 1000;
        const fps = frameCount / elapsedSeconds;
        fpsCounter.textContent = `FPS: ${Math.round(fps)}`;
        frameCount = 0;
        lastFpsUpdate = currentTime;
    }
}


/* FPS test start function */
function startTest() {
    if (isPaused || isTesting) {
        return;
    }
    isTesting = true;
    testStart = performance.now();
    testFrames = 0;
    testButton.disabled = true;
    pauseButton.disabled = true;
    testButton.textContent = "Testing";
    testResult.textContent = "Testing FPS: 30s remaining";
}


/*FPS test update function */
function updateTest() {
    if (!isTesting) {
        return;
    }
    testFrames++;
    const elapsedTestTime = performance.now() - testStart;
    if (elapsedTestTime >= testDuration) {
        finishTest(elapsedTestTime);
        return;
    }
    const remainingTime = Math.ceil((testDuration - elapsedTestTime) / 1000);
    testResult.textContent = `Test time remaining: ${remainingTime}s`;
}


/* Finalize FPS Test */
function finishTest(elapsedTestTime) {
    isTesting = false;
    const elapsedSeconds = elapsedTestTime / 1000;
    const avgFps = testFrames / elapsedSeconds;
    testResult.textContent = `Average FPS: ${avgFps.toFixed(2)}`;
    testButton.disabled = false;
    pauseButton.disabled = false;
    testButton.textContent = "Start FPS Test";
}


/* Create fake landmarks for no webcam */
function createMockLandmarks() {
    const points = new Array(33).fill(null);

    /* Nose */
    points[0] = { x: 0.5, y: 0.15 };
    /* Shoulders */
    points[11] = { x: 0.35, y: 0.30 };
    points[12] = { x: 0.65, y: 0.30 };
    /* Elbows and wrists */
    points[13] = { x: 0.25, y: 0.45 };
    points[14] = { x: 0.75, y: 0.45 };
    points[15] = { x: 0.20, y: 0.60 };
    points[16] = { x: 0.80, y: 0.60 };
    /* Hips */
    points[23] = { x: 0.40, y: 0.55 };
    points[24] = { x: 0.60, y: 0.55 };
    /* Knees and ankles */
    points[25] = { x: 0.38, y: 0.75 };
    points[26] = { x: 0.62, y: 0.75 };
    points[27] = { x: 0.35, y: 0.95 };
    points[28] = { x: 0.65, y: 0.95 };
    return points;
}


/* Animate a human pose without a webcam */
function updateMockPose(elapsedTime) {
    const seconds = elapsedTime / 1000;
    const armMovement = Math.sin(seconds * 2);
    const legMovement = Math.sin(seconds * 1.5);
    const bodyMovement = Math.sin(seconds) * 0.03;
    mockLandmarks[15].y = 0.35 + armMovement * 0.25;
    mockLandmarks[16].y = 0.35 + armMovement * 0.25;
    mockLandmarks[13].y = 0.35 + armMovement * 0.10;
    mockLandmarks[14].y = 0.35 + armMovement * 0.10;
    mockLandmarks[25].x = 0.38 + legMovement * 0.08;
    mockLandmarks[26].x = 0.62 - legMovement * 0.08;
    mockLandmarks[0].x = 0.50 + bodyMovement;
    mockLandmarks[11].x = 0.35 + bodyMovement;
    mockLandmarks[12].x = 0.65 + bodyMovement;
}



/** Continually render character */
function renderFrame(elapsedTime) {
    if (demoMode && !isPaused) {
        updateMockPose(elapsedTime);
    }
    const currentLandmarks = demoMode ? mockLandmarks : getLandmarks();
    if (isPaused) {
        if (frozenLandmarks === null && currentLandmarks) {
            frozenLandmarks = currentLandmarks.map(landmark => landmark ? { ...landmark } : null);
        }
        drawCharacter(ctx, frozenLandmarks);
    } else {
        drawCharacter(ctx, currentLandmarks);
    }
    updateFps(elapsedTime);
    updateTest();
    requestAnimationFrame(renderFrame);
}



/* set up app */
async function setup() {
    requestAnimationFrame(renderFrame);
    try {
        status.textContent = "Starting webcam...";
        await startWebcam(video);
        status.textContent = "Loading MediaPipe...";
        await initPoseDetector();
        startPoseDetection(video);
        status.textContent = "Live pose detection running";
    } catch (error) {
        console.error("Initialization error:", error);
        demoMode = true;
        status.textContent = "Demo mode - Webcam unavailable";
        console.log("Running with simulated landmarks.");
    }
}


// Start the app
setup();