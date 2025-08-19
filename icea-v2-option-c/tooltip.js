// ============================================================
// tooltip.js — Guideline + live values; throttled mousemove
// ============================================================
import { TOOLTIP, INTERACTION, COLOR } from './config.js';
import { throttle } from './utils.js';

export function addTooltip(rootG, overlay, data, columns, x, y) {
  const layer = rootG.append('g').attr('class', 'tooltip-layer').style('pointer-events', 'none');
  const guideline = layer.append('line')
    .attr('y1', 0).attr('y2', +rootG.attr('data-inner-height'))
    .attr('stroke', '#111827').attr('stroke-dasharray', '3,3').attr('opacity', 0.6);

  const dots = layer.selectAll('circle.dot')
    .data(columns.map(c => c.key))
    .join('circle')
    .attr('class', 'dot')
    .attr('r', 3.5)
    .attr('fill', k => COLOR(k))
    .attr('stroke', '#fff')
    .attr('stroke-width', 1.25)
    .attr('opacity', 0);

  const box = d3.select('body').append('div')
    .attr('class', 'd3-tooltip')
    .style('position', 'fixed')
    .style('background', 'rgba(17,24,39,.95)')
    .style('color', '#fff')
    .style('padding', '8px 10px')
    .style('border-radius', '8px')
    .style('font', '12px/1.2 system-ui, sans-serif')
    .style('pointer-events', 'none')
    .style('opacity', 0);

  const bisect = d3.bisector(d => d.date).center;

  const onMove = throttle(function (event) {
    const [mx] = d3.pointer(event, overlay.node());
    const date = x.invert(mx);
    const i = bisect(data, date);
    const d = data[i];
    if (!d) return;

    guideline.attr('x1', x(d.date)).attr('x2', x(d.date));

    dots.each(function (key) {
      const v = d[key];
      const show = v != null && !Number.isNaN(v);
      d3.select(this)
        .attr('cx', x(d.date))
        .attr('cy', y(v))
        .attr('opacity', show ? 1 : 0);
    });

    box.html(`
      <div style="font-weight:600;margin-bottom:4px;">${TOOLTIP.DATE_FORMAT(d.date)}</div>
      ${columns.map(c => {
        const v = d[c.key];
        if (v == null || Number.isNaN(v)) return '';
        return `<div style="display:flex;align-items:center;gap:6px;">
          <span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${COLOR(c.key)};"></span>
          <span>${c.label ?? c.key}</span>
          <span style="margin-left:auto;font-variant-numeric:tabular-nums;">${TOOLTIP.NUM_FORMAT(v)}</span>
        </div>`;
      }).join('')}
    `);

    const { clientX, clientY } = event;
    box.style('left', `${clientX + 12}px`).style('top', `${clientY + 12}px`).style('opacity', 1);
  }, INTERACTION.TOOLTIP_THROTTLE_MS);

  const onLeave = () => {
    box.style('opacity', 0);
    dots.attr('opacity', 0);
  };

  overlay.on('mousemove', onMove).on('mouseleave', onLeave);

  return { destroy: () => { box.remove(); } };
}
