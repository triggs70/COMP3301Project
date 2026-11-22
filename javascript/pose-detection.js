//from google pose landmark web guide
import { PoseLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs";

export const LANDMARK = {
    // named indexs with theyre numbers from mediapipe landmark map
    NOSE: 0, 
    LEFT_SHOULDER: 11, RIGHT_SHOULDER: 12,  
    LEFT_ELBOW: 13, RIGHT_ELBOW: 14,  
    LEFT_WRIST: 15, RIGHT_WRIST: 16, 
    LEFT_HIP: 23, RIGHT_HIP: 24, 
    LEFT_KNEE: 25, RIGHT_KNEE: 26, 
    LEFT_ANKLE: 27, RIGHT_ANKLE: 28, 
};

let poseLandmarker;
let landmarks = null;

export async function startWebcam(video) {
    video.srcObject = await navigator.mediaDevices.getUserMedia({ video : true });
    await new Promise((resolve) => (video.onloadeddata = resolve));
    await video.play();
}

export async function initPoseDetector() {
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
    );
    poseLandmarker = await PoseLandmarker.createFromOptions(vision, { 
        baseOptions: { 
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task",
        },
        runningMode: "VIDEO",
        numPoses: 1,
    });
}


/* Continuously detect body landmarks from the webcam */
export function startPoseDetection(video) {

    let lastVideoTime = -1;
    let totalDetectionTime = 0;
    let detectionCount = 0;
    let lastPerformanceReport = performance.now();

    function detect() {
        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            if (video.currentTime !== lastVideoTime) {
                lastVideoTime = video.currentTime;
                const startTime = performance.now();
                const result = poseLandmarker.detectForVideo(video, performance.now());
                const endTime = performance.now();
                const detectionTime = endTime - startTime;
                totalDetectionTime += detectionTime;
                detectionCount++;
                landmarks = result.landmarks[0] || null;
            }
        }
        const currentTime = performance.now();
        if (currentTime - lastPerformanceReport >= 1000) {
            if (detectionCount > 0) {
                const averageDetectionTime = totalDetectionTime / detectionCount;
                const elapsedSeconds = (currentTime - lastPerformanceReport) / 1000;
                const detectionFPS = detectionCount / elapsedSeconds;
                console.log(`MediaPipe: ${averageDetectionTime.toFixed(1)} ms/frame, ` + `${detectionFPS.toFixed(1)} detection FPS`);
            }
            totalDetectionTime = 0;
            detectionCount = 0;
            lastPerformanceReport = currentTime;
        }
        requestAnimationFrame(detect);
    }
    requestAnimationFrame(detect);
}


export function getLandmarks() {
    return landmarks;
}