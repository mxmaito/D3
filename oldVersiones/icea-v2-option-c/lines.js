// ============================================================
// lines.js — Draw series lines + (optional) markers; return refs
// ============================================================
import { STYLES, COLOR } from './config.js';

export function drawLinesAndMarkers(g, data, columns, x, y) {
  const seriesMap = {}; // key -> { line, markers? }

  const lineGen = d3.line()
    .x(d => x(d.date));

  for (const col of columns) {
    const key = col.key;
    const seriesData = data.filter(d => d[key] != null && !Number.isNaN(d[key]));

    const line = g.append('path')
      .datum(seriesData)
      .attr('class', 'series-line')
      .attr('data-key', key)
      .attr('fill', 'none')
      .attr('stroke', COLOR(key))
      .attr('stroke-width', STYLES.LINE_WIDTH)
      .attr('d', lineGen.y(d => y(d[key])));

    // Optional markers (commented out for performance by default)
    // const markers = g.append('g')
    //   .attr('class', 'series-markers')
    //   .selectAll('circle')
    //   .data(seriesData)
    //   .join('circle')
    //   .attr('r', 2.5)
    //   .attr('cx', d => x(d.date))
    //   .attr('cy', d => y(d[key]))
    //   .attr('fill', COLOR(key))
    //   .attr('opacity', 0.9);

    seriesMap[key] = { line /*, markers*/ };
  }

  return { seriesMap };
}

export function applyHoverStyles(seriesMap, labelsMap, hoveredKey) {
  for (const [key, refs] of Object.entries(seriesMap)) {
    const on = hoveredKey && key === hoveredKey;
    refs.line
      .classed('is-hovered', on)
      .classed('is-dimmed', hoveredKey && !on)
      .attr('stroke-width', on ? STYLES.LINE_WIDTH + 1.5 : STYLES.LINE_WIDTH);
  }
  for (const [key, sel] of Object.entries(labelsMap)) {
    const on = hoveredKey && key === hoveredKey;
    sel.classed('is-hovered', on).classed('is-dimmed', hoveredKey && !on);
  }
}

export function applyVisibility(seriesMap, state) {
  for (const [key, refs] of Object.entries(seriesMap)) {
    const vis = state.visible[key];
    refs.line.attr('display', vis ? null : 'none');
  }
}
