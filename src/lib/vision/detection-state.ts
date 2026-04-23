import type { TriggerState, DetectionConfig } from "@/types/vision";

/**
 * Manages the detection state machine with hysteresis:
 *   idle → approaching → active → leaving → idle
 *
 * "active" = hand is near nose (animation should show)
 * Uses separate enter/exit frame counts to prevent flickering.
 */
export class DetectionStateMachine {
  private state: TriggerState = "idle";
  private consecutiveCloseFrames = 0;
  private consecutiveFarFrames = 0;
  private config: DetectionConfig;
  private onStateChange: ((active: boolean) => void) | null = null;

  /** Frames of "not close" required before hiding animation */
  private static readonly EXIT_FRAMES = 5;

  constructor(config: DetectionConfig) {
    this.config = config;
  }

  /** Register a callback for when active/inactive state changes */
  setOnStateChange(callback: (active: boolean) => void): void {
    this.onStateChange = callback;
  }

  /** Process a single frame result */
  processFrame(isClose: boolean): void {
    if (isClose) {
      this.consecutiveCloseFrames++;
      this.consecutiveFarFrames = 0;
    } else {
      this.consecutiveFarFrames++;
      this.consecutiveCloseFrames = 0;
    }

    switch (this.state) {
      case "idle":
        if (this.consecutiveCloseFrames >= this.config.requiredConsecutiveFrames) {
          this.state = "triggered";
          this.onStateChange?.(true);
        } else if (this.consecutiveCloseFrames > 0) {
          this.state = "approaching";
        }
        break;

      case "approaching":
        if (this.consecutiveCloseFrames >= this.config.requiredConsecutiveFrames) {
          this.state = "triggered";
          this.onStateChange?.(true);
        } else if (!isClose) {
          this.state = "idle";
        }
        break;

      case "triggered":
        // Stay active until enough far frames
        if (this.consecutiveFarFrames >= DetectionStateMachine.EXIT_FRAMES) {
          this.state = "cooldown";
          this.onStateChange?.(false);
          // Brief cooldown before re-detection
          setTimeout(() => {
            if (this.state === "cooldown") {
              this.state = "idle";
            }
          }, 500);
        }
        break;

      case "cooldown":
        // Wait for cooldown to finish (handled by timeout above)
        break;
    }
  }

  getState(): TriggerState {
    return this.state;
  }

  getConsecutiveFrames(): number {
    return this.consecutiveCloseFrames;
  }

  /** Clean up */
  destroy(): void {
    this.state = "idle";
    this.consecutiveCloseFrames = 0;
    this.consecutiveFarFrames = 0;
  }

  /** Update config at runtime */
  updateConfig(config: Partial<DetectionConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
