//from google pose landmark web guide
import {PoseLandmarker, FilesetResolver} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs";

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
    //standard browser webcam API
    video.srcObject = await navigator.mediaDevices.getUserMedia({video:true});
    await new Promise((resolve) => (video.onloadeddata = resolve));
    await video.play();
}

export async function initPoseDetector(){
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
    );
    poseLandmarker = await PoseLandmarker.createFromOptions(vision, { //from google pose landmark web guide
        baseOptions: { //from google pose landmark web guide
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task",
        },
        runningMode: "VIDEO", //from google pose landmark web guide
        numPoses: 1, //from google pose landmark web guide
    });
}

export function startPoseDetection(video) {
    function detect() {
        // these lines were from the google pose landmark web guide
        const result = poseLandmarker.detectForVideo(video, performance.now());
        landmarks = result.landmarks[0] || null;
        requestAnimationFrame(detect);
    }
    detect();
}

export function getLandmarks() {
    // from google pose landmark web guide
    return landmarks;
}