import * as tf from "@tensorflow/tfjs";
import * as faceDetection from "@tensorflow-models/face-detection";
import "@tensorflow/tfjs-backend-webgl";
import { ProctoringEventTypes, ProctoringSeverity } from "./ProctoringEvents.js";

let sharedDetector = null;
let detectorInitPromise = null;

async function getOrCreateDetector() {
  if (sharedDetector) return sharedDetector;
  if (detectorInitPromise) return detectorInitPromise;

  detectorInitPromise = (async () => {
    try {
      await tf.setBackend("webgl");
      await tf.ready();
    } catch {
      await tf.setBackend("cpu");
      await tf.ready();
    }

    sharedDetector = await faceDetection.createDetector(
      faceDetection.SupportedModels.MediaPipeFaceDetector,
      {
        runtime: "tfjs",
        modelType: "short",
        maxFaces: 4,
      }
    );
    return sharedDetector;
  })();

  return detectorInitPromise;
}

export class FaceMonitor {
  constructor(config = {}, onEvent = () => {}, onStatus = () => {}) {
    this.config = {
      processIntervalMs: config.processIntervalMs || 280,
      minFaceGracePeriodMs: config.minFaceGracePeriodMs || 3500,
      minDetectionConfidence: config.minDetectionConfidence || 0.55,
    };
    this.onEvent = onEvent;
    this.onStatus = onStatus;

    this.isRunning = false;
    this.videoElement = null;
    this.stream = null;
    this.timerId = null;
    this.isProcessingFrame = false;

    this.lastProcessedTime = 0;
    this.missingFaceStartTime = null;
    this.multipleFacesStartTime = null;
    this.lastFaceCount = 1;
  }

  async start(videoElement, stream) {
    if (this.isRunning) return;
    this.videoElement = videoElement;
    this.stream = stream;
    this.isRunning = true;

    try {
      this.onStatus({ status: "initializing", faceCount: 1 });
      await getOrCreateDetector();

      if (!this.isRunning) return;

      // Monitor camera stream track health
      if (this.stream) {
        const videoTracks = this.stream.getVideoTracks();
        if (videoTracks.length > 0) {
          videoTracks[0].onended = () => {
            if (this.isRunning) {
              this.onEvent({
                type: ProctoringEventTypes.CAMERA_DISCONNECTED,
                severity: ProctoringSeverity.CRITICAL,
                metadata: { reason: "Video track ended" },
              });
            }
          };
        }
      }

      this.onStatus({ status: "active", faceCount: 1 });
      this.scheduleNextLoop();
    } catch (err) {
      console.warn("FaceMonitor initialization failed:", err?.message || err);
      this.onStatus({ status: "error", error: err?.message });
    }
  }

  scheduleNextLoop() {
    if (!this.isRunning) return;

    this.timerId = setTimeout(() => {
      this.processFrame().finally(() => {
        this.scheduleNextLoop();
      });
    }, this.config.processIntervalMs);
  }

  async processFrame() {
    if (!this.isRunning || this.isProcessingFrame) return;
    if (!this.videoElement || this.videoElement.readyState < 2) return;

    const now = Date.now();
    this.isProcessingFrame = true;

    try {
      const detector = await getOrCreateDetector();
      const faces = await detector.estimateFaces(this.videoElement, {
        flipHorizontal: false,
      });

      const validFaces = (faces || []).filter(
        (f) => (f.score ?? 1) >= this.config.minDetectionConfidence
      );
      const faceCount = validFaces.length;

      this.handleFaceCount(faceCount, now);
      this.lastProcessedTime = now;
    } catch (err) {
      // Ignore transient frame read errors
    } finally {
      this.isProcessingFrame = false;
    }
  }

  handleFaceCount(faceCount, now) {
    this.lastFaceCount = faceCount;

    if (faceCount === 0) {
      if (!this.missingFaceStartTime) {
        this.missingFaceStartTime = now;
      } else if (now - this.missingFaceStartTime >= this.config.minFaceGracePeriodMs) {
        this.onEvent({
          type: ProctoringEventTypes.FACE_NOT_DETECTED,
          severity: ProctoringSeverity.WARNING,
          metadata: { durationMissingMs: now - this.missingFaceStartTime },
        });
      }
      this.multipleFacesStartTime = null;
      this.onStatus({ status: "warning", message: "Face not detected", faceCount: 0 });
    } else if (faceCount >= 2) {
      this.missingFaceStartTime = null;
      if (!this.multipleFacesStartTime) {
        this.multipleFacesStartTime = now;
      }
      this.onEvent({
        type: ProctoringEventTypes.MULTIPLE_FACES,
        severity: ProctoringSeverity.WARNING,
        metadata: { faceCount },
      });
      this.onStatus({ status: "warning", message: "Multiple faces detected", faceCount });
    } else {
      // 1 face (Normal)
      this.missingFaceStartTime = null;
      this.multipleFacesStartTime = null;
      this.onStatus({ status: "active", message: "Face detected", faceCount: 1 });
    }
  }

  stop() {
    this.isRunning = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.videoElement = null;
    this.stream = null;
    this.missingFaceStartTime = null;
    this.multipleFacesStartTime = null;
  }

  dispose() {
    this.stop();
  }
}
