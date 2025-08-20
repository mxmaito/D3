//----------------------------------
// js/labels.js — Right labels (toggle-aware + full cleanup)
//----------------------------------
// Al hacer click en un label, además de ocultar la línea,
// este módulo ahora también oculta el propio label y su leader line.
// Expone labelsMap y registra listeners sobre el bus para reaccionar a 'toggle'.

import { LABELS, STYLES, COLOR, SHOW_RIGHT_LABELS } from './config.js';
import { truncateTextToWidth } from './utils.js';

export function addRightLabels(g, data, columns, x, y, innerWidth, state, bus) {
  if (!SHOW_RIGHT_LABELS) return { labelsMap: {} };

  const layer = g.append('g').attr('class', 'right-labels');
  const labelsMap = {};
  const leadersMap = {};

  const lastByKey = Object.fromEntries(columns.map(c => [c.key, findLastDefined(data, c.key)]));
  const targets = columns
    .map(c => ({ key: c.key, label: c.label ?? c.key, y: lastByKey[c.key] != null ? y(lastByKey[c.key]) : null }))
    .filter(t => t.y != null)
    .sort((a, b) => a.y - b.y);

  resolveVerticalCollisions(targets, LABELS.MIN_DISTANCE);

  for (const t of targets) {
    const key = t.key;
    const group = layer.append('g')
      .attr('class', 'right-label')
      .attr('data-key', key)
      .attr('transform', `translate(${innerWidth + 8}, ${t.y})`)
      .style('pointer-events', 'all');

    const text = group.append('text')
      .attr('x', 0)
      .attr('dy', '0.32em')
      .attr('font-size', LABELS.FONT_SIZE)
      .attr('font-weight', LABELS.FONT_WEIGHT)
      .attr('font-family', STYLES.FONT_FAMILY)
      .attr('fill', COLOR(key))
      .text(t.label);

    truncateTextToWidth(text, 140);
    const bbox = text.node().getBBox();

    group.insert('rect', 'text')
      .attr('x', bbox.x - 6)
      .attr('y', bbox.y - 4)
      .attr('width', bbox.width + 12)
      .attr('height', bbox.height + 8)
      .attr('fill', 'transparent')
      .style('pointer-events', 'all');

    if (LABELS.SHOW_LEADER_LINES) {
      const x0 = x(findLastDate(data, key));
      const y0 = y(lastByKey[key]);
      const x1 = innerWidth + 2;
      const leader = layer.append('path')
        .attr('class', 'leader')
        .attr('data-key', key)
        .attr('d', `M${x0},${y0}L${x1},${t.y}`)
        .attr('stroke', COLOR(key))
        .attr('stroke-width', 1)
        .attr('fill', 'none')
        .attr('opacity', 0.6)
        .style('pointer-events', 'none');
      leadersMap[key] = leader;
    }

    labelsMap[key] = group;
  }

  // Estado inicial acorde a visibilidad
  applyVisibility(labelsMap, leadersMap, state);

  // Wiring de interactividad en labels (hover/click)
  wireLabelHover(labelsMap, bus);

  // ✅ Reaccionar a toggles globales: ocultar/mostrar label + leader
  if (bus && bus.on) {
    bus.on('toggle.labels', (key) => {
      const visible = state?.visible?.[key] !== false;
      const g = labelsMap[key];
      const leader = leadersMap[key];
      if (g) g.attr('display', visible ? null : 'none');
      if (leader) leader.attr('display', visible ? null : 'none');
    });
  }

  return { labelsMap };
}

function applyVisibility(labelsMap, leadersMap, state) {
  if (!state || !state.visible) return;
  for (const key of Object.keys(labelsMap)) {
    const visible = state.visible[key] !== false;
    labelsMap[key].attr('display', visible ? null : 'none');
    const leader = leadersMap[key];
    if (leader) leader.attr('display', visible ? null : 'none');
  }
}

function findLastDefined(data, key) {
  for (let i = data.length - 1; i >= 0; i--) {
    const v = data[i][key];
    if (v != null && !Number.isNaN(v)) return v;
  }
  return null;
}
function findLastDate(data, key) {
  for (let i = data.length - 1; i >= 0; i--) {
    const v = data[i][key];
    if (v != null && !Number.isNaN(v)) return data[i].date;
  }
  return data[data.length - 1]?.date;
}
function resolveVerticalCollisions(nodes, minGap) {
  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1];
    const cur = nodes[i];
    if (cur.y - prev.y < minGap) cur.y = prev.y + minGap;
  }
}
export function wireLabelHover(labelsMap, bus) {
  for (const [key, sel] of Object.entries(labelsMap)) {
    sel
      .on('mouseenter', () => bus.call('hover', null, key))
      .on('mouseleave', () => bus.call('leave', null))
      .on('click', () => bus.call('toggle', null, key));
  }
}
