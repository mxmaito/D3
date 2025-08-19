// ============================================================
// legend.js — Interactive legend; emits bus events; keyboard-friendly
// ============================================================
import { COLOR, STYLES } from './config.js';

export function addLegend(g, columns, state, bus) {
  const layer = g.append('g').attr('class', 'legend');
  const itemH = 22;

  const items = layer.selectAll('g.legend-item')
    .data(columns)
    .join('g')
    .attr('class', 'legend-item')
    .attr('transform', (d, i) => `translate(0, ${i * itemH})`)
    .attr('tabindex', 0)
    .style('cursor', 'pointer')
    .on('mouseenter', (_, d) => bus.call('hover', null, d.key))
    .on('mouseleave', () => bus.call('leave', null))
    .on('click',       (_, d) => bus.call('toggle', null, d.key))
    .on('keydown', (event, d) => { if (event.key === 'Enter' || event.key === ' ') bus.call('toggle', null, d.key); });

  items.append('rect')
    .attr('width', 12)
    .attr('height', 12)
    .attr('y', -9)
    .attr('rx', 2)
    .attr('fill', d => COLOR(d.key));

  items.append('text')
    .attr('x', 18)
    .attr('dy', '0.32em')
    .attr('font-family', STYLES.FONT_FAMILY)
    .attr('font-size', 12)
    .text(d => d.label ?? d.key);

  // Sync visibility styles
  function sync() {
    items.attr('opacity', d => state.visible[d.key] ? 1 : 0.4);
  }
  sync();

  return { sync };
}
