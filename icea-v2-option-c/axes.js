// ============================================================
// axes.js — Render axes with formatting and layout rules
// ============================================================
import { STYLES, TICKS } from './config.js';

export function renderAxes(g, x, y, innerWidth, innerHeight) {
  // X Axis (bottom)
  const gx = g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x).ticks(TICKS.X_NUM));

  gx.selectAll('text')
    .attr('font-size', STYLES.AXIS_FONT_SIZE)
    .attr('fill', STYLES.AXIS_COLOR);

  // Y Axis (left)
  const gy = g.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(y).ticks(TICKS.Y_NUM).tickFormat(TICKS.Y_FORMAT));

  gy.selectAll('text')
    .attr('font-size', STYLES.AXIS_FONT_SIZE)
    .attr('fill', STYLES.AXIS_COLOR);

  return { gx, gy };
}
