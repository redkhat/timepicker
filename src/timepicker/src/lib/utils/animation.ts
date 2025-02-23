export function cubicBezier(p1x: number, p1y: number, p2x: number, p2y: number, t: number): number {
  const cx = 3.0 * p1x;
  const bx = 3.0 * (p2x - p1x) - cx;
  const ax = 1.0 - cx - bx;
  const cy = 3.0 * p1y;
  const by = 3.0 * (p2y - p1y) - cy;
  const ay = 1.0 - cy - by;

  let x = t;
  for (let i = 0; i < 4; i++) {
      const t_0 = x * x * x * ax + x * x * bx + x * cx;
      const t_1 = 3 * x * x * ax + 2 * x * bx + cx;
      x = x - (t_0 - t) / t_1;
  }
  return x * x * x * ay + x * x * by + x * cy;
}
