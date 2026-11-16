/* Main js file for project, just set up for testing right now */
import { startWebcam, initPoseDetector, startPoseDetection, getLandmarks, LANDMARK } from "./pose-detection.js";

const video = document.getElementById("webcam");
const status = document.getElementById("status");

async function setup() {
    try {
        status.textContent = "starting...webcam...";
        await startWebcam(video)
        status.textContent = "Loading pose model..."
        await initPoseDetector();
        startPoseDetection(video);
        status.textContent = "Running";
    } catch (error) {
        status.textContent = "Error: " + error.message;
    }
}
setup();


setInterval(() => {
    const points = getLandmarks();
    if (points) console.log("nose:", points[LANDMARK.NOSE].x, points[LANDMARK.NOSE].y);
}, 1000);


// just commented out for my own testing
//const canvas = document.getElementById("pixel-canvas");
//const context = canvas.getContext("2d");
//context.fillStyle = "red";
//context.fillRect(10,10,5,5);
