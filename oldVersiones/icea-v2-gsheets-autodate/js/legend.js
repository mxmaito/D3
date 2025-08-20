//----------------------------------
// js/legend.js — Single-column legend
//----------------------------------
// What this does: renders one legend item per row (clean, scannable),
// and wires hover/click to the global dispatch so the rest of the
// chart can react (highlight/toggle visibility).

import { COLOR, STYLES, SHOW_LEGEND } from './config.js';

export function addLegend(host, columns, state, bus) {
  if (!SHOW_LEGEND) {
    // No-op: return a dummy sync so callers don't branch
    return { sync: () => {} };
  }

  const layer = host.append('g').attr('class', 'legend');
  const vSpacing = 22;

  const items = layer.selectAll('g.legend-item')
    .data(columns)
    .join('g')
    .attr('class', 'legend-item')
    .attr('transform', (d, i) => `translate(0, ${i * vSpacing})`)
    .attr('tabindex', 0)
    .style('cursor', 'pointer')
    .on('mouseenter', (_, d) => bus.call('hover', null, d.key))
    .on('mouseleave', () => bus.call('leave', null))
    .on('click',       (_, d) => bus.call('toggle', null, d.key))
    .on('keydown', (event, d) => { if (event.key === 'Enter' || event.key === ' ') bus.call('toggle', null, d.key); });

  items.append('rect').attr('width', 12).attr('height', 12).attr('y', -9).attr('rx', 2).attr('fill', d => COLOR(d.key));
  items.append('text').attr('x', 18).attr('dy', '0.32em').attr('font-family', STYLES.FONT_FAMILY).attr('font-size', 12).text(d => d.label ?? d.key);

  function sync() { items.attr('opacity', d => state.visible[d.key] ? 1 : 0.4); }
  sync();
  return { sync };
}