import { ProctoringEventTypes, ProctoringSeverity } from "./ProctoringEvents.js";

export class TabMonitor {
  constructor(config = {}, onEvent = () => {}, onStatus = () => {}) {
    this.config = config;
    this.onEvent = onEvent;
    this.onStatus = onStatus;
    this.isRunning = false;
    this.hiddenStartTime = null;

    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    document.addEventListener("visibilitychange", this.handleVisibilityChange);
    this.onStatus({ isVisible: document.visibilityState === "visible" });
  }

  handleVisibilityChange() {
    if (!this.isRunning) return;

    const isHidden = document.visibilityState === "hidden" || document.hidden;
    const now = Date.now();

    this.onStatus({ isVisible: !isHidden });

    if (isHidden) {
      this.hiddenStartTime = now;
      this.onEvent({
        type: ProctoringEventTypes.TAB_SWITCH,
        severity: ProctoringSeverity.WARNING,
        metadata: { state: "hidden", timestamp: now },
      });
      this.onEvent({
        type: ProctoringEventTypes.PAGE_HIDDEN,
        severity: ProctoringSeverity.INFO,
        metadata: { timestamp: now },
      });
    } else {
      const durationSeconds = this.hiddenStartTime
        ? Math.round((now - this.hiddenStartTime) / 1000)
        : 0;
      this.hiddenStartTime = null;

      this.onEvent({
        type: ProctoringEventTypes.PAGE_VISIBLE,
        severity: ProctoringSeverity.INFO,
        metadata: { durationSeconds, timestamp: now },
      });
    }
  }

  stop() {
    this.isRunning = false;
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    this.hiddenStartTime = null;
  }

  dispose() {
    this.stop();
  }
}
