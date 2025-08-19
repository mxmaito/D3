// ============================================================
// gridlines.js — Gridlines
// ============================================================
import { STYLES, TICKS } from './config.js';
export function drawGridlines(g, x, y, innerWidth, innerHeight) {
  g.append('g').attr('class', 'y-grid').call(d3.axisLeft(y).ticks(TICKS.Y_NUM).tickSize(-innerWidth).tickFormat('')).call(s => s.selectAll('line').attr('stroke', STYLES.GRID_COLOR)).call(s => s.selectAll('path').remove());
  g.append('g').attr('class', 'x-grid').attr('transform', `translate(0,${innerHeight})`).call(d3.axisBottom(x).ticks(TICKS.X_NUM).tickSize(-innerHeight).tickFormat('')).call(s => s.selectAll('line').attr('stroke', STYLES.GRID_COLOR)).call(s => s.selectAll('path').remove());
}
