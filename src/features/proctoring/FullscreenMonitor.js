import { ProctoringEventTypes, ProctoringSeverity } from "./ProctoringEvents.js";

export class FullscreenMonitor {
  constructor(config = {}, onEvent = () => {}, onStatus = () => {}) {
    this.config = {
      required: config.required ?? true,
      reenterPromptDelayMs: config.reenterPromptDelayMs || 1000,
    };
    this.onEvent = onEvent;
    this.onStatus = onStatus;
    this.isRunning = false;
    this.element = null;

    this.handleFullscreenChange = this.handleFullscreenChange.bind(this);
  }

  start(element = null) {
    if (this.isRunning) return;
    this.element = element || document.documentElement;
    this.isRunning = true;

    document.addEventListener("fullscreenchange", this.handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", this.handleFullscreenChange);

    const isCurrentlyFullscreen = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
    this.onStatus({ isFullscreen: isCurrentlyFullscreen });
  }

  async requestFullscreen(targetElement = null) {
    const el = targetElement || this.element || document.documentElement;
    try {
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen();
      } else if (el.msRequestFullscreen) {
        await el.msRequestFullscreen();
      }
      return true;
    } catch (err) {
      console.warn("Fullscreen request error:", err?.message || err);
      return false;
    }
  }

  async exitFullscreen() {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitFullscreenElement && document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      }
    } catch (err) {
      // Ignore exit fullscreen errors
    }
  }

  handleFullscreenChange() {
    if (!this.isRunning) return;

    const isFullscreen = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
    this.onStatus({ isFullscreen });

    if (!isFullscreen) {
      this.onEvent({
        type: ProctoringEventTypes.FULLSCREEN_EXIT,
        severity: ProctoringSeverity.WARNING,
        metadata: { timestamp: Date.now() },
      });
    } else {
      this.onEvent({
        type: ProctoringEventTypes.FULLSCREEN_ENTER,
        severity: ProctoringSeverity.INFO,
        metadata: { timestamp: Date.now() },
      });
    }
  }

  stop() {
    this.isRunning = false;
    document.removeEventListener("fullscreenchange", this.handleFullscreenChange);
    document.removeEventListener("webkitfullscreenchange", this.handleFullscreenChange);
    this.element = null;
  }

  dispose() {
    this.stop();
  }
}
