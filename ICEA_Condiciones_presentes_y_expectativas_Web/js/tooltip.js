// js/tooltip.js — visibility-aware tooltip + strict overlay bounds
import { TOOLTIP, INTERACTION, COLOR } from './config.js';
import { throttle } from './utils.js';

/**
 * @param {d3.Selection} rootG
 * @param {d3.Selection} overlay
 * @param {Array} data
 * @param {Array} columns - [{key,label}]
 * @param {d3.Scale} x
 * @param {d3.Scale} y
 * @param {Object} state - { visible: { [key]: boolean } }
 * @param {d3.Dispatch} bus
 */
export function addTooltip(rootG, overlay, data, columns, x, y, state, bus) {
  overlay.attr('pointer-events', 'all').style('pointer-events', 'all');

  const layer = rootG.append('g').attr('class', 'tooltip-layer').style('pointer-events', 'none');

  const guideline = layer.append('line')
    .attr('y1', 0)
    .attr('y2', +rootG.attr('data-inner-height'))
    .attr('stroke', '#111827')
    .attr('stroke-dasharray', '3,3')
    .attr('opacity', 0);

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

  const isVisible = (key) => !state?.visible || state.visible[key] !== false;

  const hideAll = () => {
    box.style('opacity', 0);
    dots.attr('opacity', 0);
    guideline.attr('opacity', 0);
  };

  const onMove = throttle((event) => {
    const [mx, my] = d3.pointer(event, overlay.node());
    const ow = +overlay.attr('width');
    const oh = +overlay.attr('height');
    if (!(mx >= 0 && mx <= ow && my >= 0 && my <= oh)) return hideAll();

    const date = x.invert(mx);
    const i = bisect(data, date);
    const d = data[i];
    if (!d) return hideAll();

    const gx = x(d.date);
    guideline.attr('x1', gx).attr('x2', gx).attr('opacity', 0.6);

    dots.each(function (key) {
      const v = d[key];
      const show = isVisible(key) && v != null && !Number.isNaN(v);
      d3.select(this)
        .attr('cx', gx)
        .attr('cy', show ? y(v) : null)
        .attr('opacity', show ? 1 : 0);
    });

    const html = [
      `<div style="font-weight:600;margin-bottom:4px;">${TOOLTIP.DATE_FORMAT(d.date)}</div>`,
      columns.map(c => {
        const k = c.key; const v = d[k];
        if (!isVisible(k) || v == null || Number.isNaN(v)) return '';
        return `<div style="display:flex;align-items:center;gap:6px;">
          <span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${COLOR(k)};"></span>
          <span>${c.label ?? k}</span>
          <span style="margin-left:auto;font-variant-numeric:tabular-nums;">${TOOLTIP.NUM_FORMAT(v)}</span>
        </div>`;
      }).join('')
    ].join('');

    if (!html.trim()) return hideAll();

    const { clientX, clientY } = event;
    box.html(html)
       .style('left', `${clientX + 12}px`)
       .style('top',  `${clientY + 12}px`)
       .style('opacity', 1);
  }, INTERACTION.TOOLTIP_THROTTLE_MS);

  overlay.on('pointermove', onMove).on('pointerleave', hideAll);
  rootG.on('pointerleave', hideAll);

  const overlayEl = overlay.node();
  const onDocPointerMove = throttle((e) => {
    if (!overlayEl) return;
    const [mx, my] = d3.pointer(e, overlayEl);
    const ow = +overlay.attr('width');
    const oh = +overlay.attr('height');
    if (!(mx >= 0 && mx <= ow && my >= 0 && my <= oh)) hideAll();
  }, Math.max(16, INTERACTION.TOOLTIP_THROTTLE_MS));

  document.addEventListener('pointermove', onDocPointerMove, { passive: true });
  document.addEventListener('pointerdown', hideAll, { passive: true });
  window.addEventListener('blur', hideAll);
  document.addEventListener('visibilitychange', () => { if (document.hidden) hideAll(); });

  if (bus && bus.on) {
    bus.on('toggle.tooltip', () => hideAll());
  }

  return {
    destroy: () => {
      box.remove();
      document.removeEventListener('pointermove', onDocPointerMove);
      document.removeEventListener('pointerdown', hideAll);
      window.removeEventListener('blur', hideAll);
      if (bus && bus.on) bus.on('toggle.tooltip', null);
    }
  };
}