import { defaultProctoringConfig } from "./proctoringConfig.js";
import { ProctoringEventTypes, ProctoringSeverity, EventUserMessages } from "./ProctoringEvents.js";
import { FaceMonitor } from "./FaceMonitor.js";
import { FullscreenMonitor } from "./FullscreenMonitor.js";
import { TabMonitor } from "./TabMonitor.js";
import { BrowserRestrictionMonitor } from "./BrowserRestrictionMonitor.js";

export class ProctoringManager {
  constructor(options = {}) {
    this.interviewId = options.interviewId || "";
    this.sessionId = options.sessionId || options.interviewId || "";
    this.apiRequest = options.apiRequest || (async () => {});
    this.config = { ...defaultProctoringConfig, ...(options.config || {}) };

    this.isRunning = false;
    this.listeners = new Set();
    this.queuedEvents = [];
    this.lastEventTimes = new Map();
    this.flushTimerId = null;

    // Local telemetry tally
    this.summary = {
      fullscreenExits: 0,
      tabSwitches: 0,
      multipleFaceEvents: 0,
      faceMissingEvents: 0,
      copyAttempts: 0,
      pasteAttempts: 0,
      windowBlurEvents: 0,
      contextMenuAttempts: 0,
      totalViolations: 0,
    };

    this.state = {
      status: "idle", // idle | initializing | active | warning | error
      faceCount: 1,
      isFullscreen: false,
      isVisible: true,
      activeWarning: null,
      warningCount: 0,
    };

    // Sub-monitors
    this.faceMonitor = new FaceMonitor(
      this.config.faceDetection,
      (evt) => this.record(evt),
      (st) => this.updateFaceStatus(st)
    );

    this.fullscreenMonitor = new FullscreenMonitor(
      this.config.fullscreen,
      (evt) => this.record(evt),
      (st) => this.updateFullscreenStatus(st)
    );

    this.tabMonitor = new TabMonitor(
      this.config.tabVisibility,
      (evt) => this.record(evt),
      (st) => this.updateTabStatus(st)
    );

    this.restrictionMonitor = new BrowserRestrictionMonitor(
      this.config.restrictions,
      (evt) => this.record(evt),
      (st) => this.notifyListeners()
    );
  }

  subscribe(callback) {
    this.listeners.add(callback);
    callback({ state: this.state, summary: this.summary });
    return () => {
      this.listeners.delete(callback);
    };
  }

  notifyListeners() {
    const payload = { state: { ...this.state }, summary: { ...this.summary } };
    for (const listener of this.listeners) {
      try {
        listener(payload);
      } catch (err) {
        console.error("Proctoring listener error:", err);
      }
    }
  }

  async start({ videoElement = null, stream = null, containerElement = null } = {}) {
    if (this.isRunning) return;
    this.isRunning = true;
    this.state.status = "initializing";
    this.notifyListeners();

    // Start monitors
    this.tabMonitor.start();
    this.restrictionMonitor.start();
    this.fullscreenMonitor.start(containerElement);

    if (this.config.faceDetection.enabled && (videoElement || stream)) {
      await this.faceMonitor.start(videoElement, stream);
    } else {
      this.state.status = "active";
      this.notifyListeners();
    }

    this.startBatchFlushTimer();
  }

  record(event) {
    if (!this.isRunning) return;

    const type = event.type;
    const severity = event.severity || ProctoringSeverity.WARNING;
    const now = event.timestamp || Date.now();

    // Cooldown check for duplicate warnings
    const lastTime = this.lastEventTimes.get(type) || 0;
    if (now - lastTime < this.config.eventCooldownMs && severity !== ProctoringSeverity.CRITICAL) {
      return;
    }
    this.lastEventTimes.set(type, now);

    // Update Telemetry Tally
    if (type === ProctoringEventTypes.FULLSCREEN_EXIT) {
      this.summary.fullscreenExits += 1;
      this.summary.totalViolations += 1;
    } else if (type === ProctoringEventTypes.TAB_SWITCH || type === ProctoringEventTypes.PAGE_HIDDEN) {
      this.summary.tabSwitches += 1;
      this.summary.totalViolations += 1;
    } else if (type === ProctoringEventTypes.MULTIPLE_FACES) {
      this.summary.multipleFaceEvents += 1;
      this.summary.totalViolations += 1;
    } else if (type === ProctoringEventTypes.FACE_NOT_DETECTED) {
      this.summary.faceMissingEvents += 1;
      this.summary.totalViolations += 1;
    } else if (type === ProctoringEventTypes.COPY_ATTEMPT || type === ProctoringEventTypes.CUT_ATTEMPT) {
      this.summary.copyAttempts += 1;
      this.summary.totalViolations += 1;
    } else if (type === ProctoringEventTypes.PASTE_ATTEMPT) {
      this.summary.pasteAttempts += 1;
      this.summary.totalViolations += 1;
    } else if (type === ProctoringEventTypes.WINDOW_BLUR) {
      this.summary.windowBlurEvents += 1;
    } else if (type === ProctoringEventTypes.CONTEXT_MENU_ATTEMPT) {
      this.summary.contextMenuAttempts += 1;
      this.summary.totalViolations += 1;
    }

    if (severity === ProctoringSeverity.WARNING || severity === ProctoringSeverity.CRITICAL) {
      this.state.warningCount += 1;
      this.state.activeWarning = EventUserMessages[type] || `Policy warning: ${type}`;
      this.state.status = "warning";
    }

    const structuredEvent = {
      type,
      severity,
      timestamp: now,
      metadata: event.metadata || {},
    };

    this.queuedEvents.push(structuredEvent);
    this.notifyListeners();

    if (this.queuedEvents.length >= this.config.maxBufferedEvents) {
      this.flushEvents();
    }
  }

  clearActiveWarning() {
    this.state.activeWarning = null;
    if (this.state.status === "warning") {
      this.state.status = "active";
    }
    this.notifyListeners();
  }

  async requestFullscreen(targetElement) {
    return await this.fullscreenMonitor.requestFullscreen(targetElement);
  }

  startBatchFlushTimer() {
    if (this.flushTimerId) clearInterval(this.flushTimerId);
    this.flushTimerId = setInterval(() => {
      this.flushEvents();
    }, this.config.batchFlushIntervalMs);
  }

  async flushEvents() {
    if (this.queuedEvents.length === 0 || !this.interviewId) return;

    const batch = [...this.queuedEvents];
    this.queuedEvents = [];

    try {
      await this.apiRequest(`/service/interviews/${this.interviewId}/proctoring/events`, {
        method: "POST",
        body: JSON.stringify({
          sessionId: this.sessionId,
          events: batch,
        }),
        credentials: "include",
      });
    } catch (err) {
      // Re-queue non-duplicate events if transient network error
      this.queuedEvents = [...batch.slice(-20), ...this.queuedEvents];
    }
  }

  updateFaceStatus(st) {
    if (st.faceCount !== undefined) this.state.faceCount = st.faceCount;
    if (st.status === "active") {
      if (this.state.status === "initializing" || this.state.status === "warning") {
        this.state.status = "active";
      }
    }
    this.notifyListeners();
  }

  updateFullscreenStatus(st) {
    if (st.isFullscreen !== undefined) this.state.isFullscreen = st.isFullscreen;
    this.notifyListeners();
  }

  updateTabStatus(st) {
    if (st.isVisible !== undefined) this.state.isVisible = st.isVisible;
    this.notifyListeners();
  }

  stop() {
    this.isRunning = false;

    if (this.flushTimerId) {
      clearInterval(this.flushTimerId);
      this.flushTimerId = null;
    }

    // Flush any remaining events
    this.flushEvents().catch(() => {});

    this.faceMonitor.stop();
    this.fullscreenMonitor.stop();
    this.tabMonitor.stop();
    this.restrictionMonitor.stop();

    this.state.status = "idle";
    this.notifyListeners();
  }

  dispose() {
    this.stop();
    this.listeners.clear();
  }
}
