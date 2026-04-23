import type { NormalizedPoint } from "@/types/vision";

/**
 * Exponential Moving Average (EMA) smoother for 2D points.
 * Reduces jitter in landmark positions across frames.
 */
export class LandmarkSmoother {
  private prevPoint: NormalizedPoint | null = null;
  private alpha: number;

  /**
   * @param alpha - Smoothing factor (0-1). Higher = more responsive, lower = smoother.
   *                0.4 is a good balance for real-time tracking.
   */
  constructor(alpha: number = 0.4) {
    this.alpha = Math.max(0, Math.min(1, alpha));
  }

  /** Apply EMA smoothing to a new point */
  smooth(point: NormalizedPoint): NormalizedPoint {
    if (!this.prevPoint) {
      this.prevPoint = { ...point };
      return point;
    }

    const smoothed: NormalizedPoint = {
      x: this.alpha * point.x + (1 - this.alpha) * this.prevPoint.x,
      y: this.alpha * point.y + (1 - this.alpha) * this.prevPoint.y,
    };

    this.prevPoint = { ...smoothed };
    return smoothed;
  }

  /** Reset the smoother state */
  reset(): void {
    this.prevPoint = null;
  }
}

/**
 * Smooths a single scalar value (e.g., distance) using EMA.
 */
export class ScalarSmoother {
  private prevValue: number | null = null;
  private alpha: number;

  constructor(alpha: number = 0.3) {
    this.alpha = Math.max(0, Math.min(1, alpha));
  }

  smooth(value: number): number {
    if (this.prevValue === null) {
      this.prevValue = value;
      return value;
    }

    const smoothed = this.alpha * value + (1 - this.alpha) * this.prevValue;
    this.prevValue = smoothed;
    return smoothed;
  }

  reset(): void {
    this.prevValue = null;
  }
}
