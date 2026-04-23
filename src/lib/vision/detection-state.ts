import type { TriggerState, DetectionConfig } from "@/types/vision";

/**
 * Manages the detection state machine:
 *   idle → approaching → triggered → cooldown → idle
 *
 * Provides debounce (consecutive frame requirement) and cooldown
 * to prevent flickering and spam triggers.
 */
export class DetectionStateMachine {
  private state: TriggerState = "idle";
  private consecutiveCloseFrames = 0;
  private cooldownTimer: ReturnType<typeof setTimeout> | null = null;
  private config: DetectionConfig;
  private onTrigger: (() => void) | null = null;

  constructor(config: DetectionConfig) {
    this.config = config;
  }

  /** Register a callback for when a trigger fires */
  setOnTrigger(callback: () => void): void {
    this.onTrigger = callback;
  }

  /** Process a single frame result */
  processFrame(isClose: boolean): void {
    switch (this.state) {
      case "idle":
        if (isClose) {
          this.consecutiveCloseFrames++;
          if (this.consecutiveCloseFrames >= this.config.requiredConsecutiveFrames) {
            this.fire();
          } else {
            this.state = "approaching";
          }
        } else {
          this.consecutiveCloseFrames = 0;
        }
        break;

      case "approaching":
        if (isClose) {
          this.consecutiveCloseFrames++;
          if (this.consecutiveCloseFrames >= this.config.requiredConsecutiveFrames) {
            this.fire();
          }
        } else {
          // Lost proximity, reset
          this.consecutiveCloseFrames = 0;
          this.state = "idle";
        }
        break;

      case "triggered":
      case "cooldown":
        // Do nothing, wait for cooldown to expire
        break;
    }
  }

  private fire(): void {
    this.state = "triggered";
    this.onTrigger?.();

    // Enter cooldown
    this.cooldownTimer = setTimeout(() => {
      this.state = "idle";
      this.consecutiveCloseFrames = 0;
      this.cooldownTimer = null;
    }, this.config.cooldownMs);

    // Transition to cooldown state after a short display period
    setTimeout(() => {
      if (this.state === "triggered") {
        this.state = "cooldown";
      }
    }, 500);
  }

  getState(): TriggerState {
    return this.state;
  }

  getConsecutiveFrames(): number {
    return this.consecutiveCloseFrames;
  }

  /** Clean up timers */
  destroy(): void {
    if (this.cooldownTimer) {
      clearTimeout(this.cooldownTimer);
      this.cooldownTimer = null;
    }
    this.state = "idle";
    this.consecutiveCloseFrames = 0;
  }

  /** Update config at runtime */
  updateConfig(config: Partial<DetectionConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
