import type { NormalizedPoint } from "@/types/vision";

/** Color palette for debug drawing */
const COLORS = {
  nose: "#f43f5e",       // rose-500
  hand: "#3b82f6",       // blue-500
  connection: "#22c55e", // green-500
  proximity: "#facc15",  // yellow-400
  text: "#ffffff",
  bg: "rgba(0, 0, 0, 0.6)",
} as const;

/**
 * Draw a small circle at a normalized point on the canvas.
 */
export function drawPoint(
  ctx: CanvasRenderingContext2D,
  point: NormalizedPoint,
  width: number,
  height: number,
  color: string = COLORS.nose,
  radius: number = 6
): void {
  ctx.beginPath();
  ctx.arc(point.x * width, point.y * height, radius, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.8)";
  ctx.lineWidth = 2;
  ctx.stroke();
}

/**
 * Draw a dashed line between two normalized points.
 */
export function drawProximityLine(
  ctx: CanvasRenderingContext2D,
  from: NormalizedPoint,
  to: NormalizedPoint,
  width: number,
  height: number,
  isClose: boolean
): void {
  ctx.beginPath();
  ctx.setLineDash([6, 4]);
  ctx.moveTo(from.x * width, from.y * height);
  ctx.lineTo(to.x * width, to.y * height);
  ctx.strokeStyle = isClose ? COLORS.proximity : COLORS.connection;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.setLineDash([]);
}

/**
 * Draw complete debug overlay on the canvas.
 */
export function drawDebugOverlay(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  nose: NormalizedPoint | null,
  handPoint: NormalizedPoint | null,
  isClose: boolean
): void {
  // Draw nose point
  if (nose) {
    drawPoint(ctx, nose, canvasWidth, canvasHeight, COLORS.nose, 8);

    // Label
    ctx.font = "12px Inter, system-ui, sans-serif";
    ctx.fillStyle = COLORS.bg;
    const label = "NOSE";
    const textWidth = ctx.measureText(label).width;
    ctx.fillRect(
      nose.x * canvasWidth - textWidth / 2 - 4,
      nose.y * canvasHeight - 22,
      textWidth + 8,
      18
    );
    ctx.fillStyle = COLORS.text;
    ctx.textAlign = "center";
    ctx.fillText(label, nose.x * canvasWidth, nose.y * canvasHeight - 8);
  }

  // Draw hand point
  if (handPoint) {
    drawPoint(ctx, handPoint, canvasWidth, canvasHeight, COLORS.hand, 8);

    ctx.font = "12px Inter, system-ui, sans-serif";
    ctx.fillStyle = COLORS.bg;
    const label = "HAND";
    const textWidth = ctx.measureText(label).width;
    ctx.fillRect(
      handPoint.x * canvasWidth - textWidth / 2 - 4,
      handPoint.y * canvasHeight - 22,
      textWidth + 8,
      18
    );
    ctx.fillStyle = COLORS.text;
    ctx.textAlign = "center";
    ctx.fillText(label, handPoint.x * canvasWidth, handPoint.y * canvasHeight - 8);
  }

  // Draw proximity line if both points exist
  if (nose && handPoint) {
    drawProximityLine(ctx, nose, handPoint, canvasWidth, canvasHeight, isClose);
  }
}
