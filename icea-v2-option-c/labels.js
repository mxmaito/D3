// ============================================================
// labels.js — Right-hand labels with collision avoidance + hitboxes
// ============================================================
import { LABELS, STYLES, COLOR } from './config.js';
import { truncateTextToWidth } from './utils.js';

export function addRightLabels(g, data, columns, x, y, innerWidth) {
  const layer = g.append('g').attr('class', 'right-labels');
  const labelsMap = {}; // key -> <g>

  // Compute last defined value per series
  const lastByKey = Object.fromEntries(columns.map(c => [c.key, findLastDefined(data, c.key)]));

  // Target y positions
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

    // Text
    const text = group.append('text')
      .attr('x', 0)
      .attr('dy', '0.32em')
      .attr('font-size', LABELS.FONT_SIZE)
      .attr('font-weight', LABELS.FONT_WEIGHT)
      .attr('font-family', STYLES.FONT_FAMILY)
      .attr('fill', COLOR(key))
      .text(t.label);

    truncateTextToWidth(text, 140);

    // Hitbox
    const bbox = text.node().getBBox();
    group.insert('rect', 'text')
      .attr('x', bbox.x - 6)
      .attr('y', bbox.y - 4)
      .attr('width', bbox.width + 12)
      .attr('height', bbox.height + 8)
      .attr('fill', 'transparent')
      .style('pointer-events', 'all');

    // Leader line
    if (LABELS.SHOW_LEADER_LINES) {
      const x0 = x(findLastDate(data, key));
      const y0 = y(lastByKey[key]);
      const x1 = innerWidth + 2;
      layer.append('path')
        .attr('class', 'leader')
        .attr('d', `M${x0},${y0}L${x1},${t.y}`)
        .attr('stroke', COLOR(key))
        .attr('stroke-width', 1)
        .attr('fill', 'none')
        .attr('opacity', 0.6)
        .style('pointer-events', 'none');
    }

    labelsMap[key] = group;
  }

  return { labelsMap };
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
  // Simple one-pass relaxation from top to bottom
  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1];
    const cur = nodes[i];
    if (cur.y - prev.y < minGap) {
      cur.y = prev.y + minGap;
    }
  }
}

export function wireLabelHover(labelsMap, bus) {
  for (const [key, sel] of Object.entries(labelsMap)) {
    sel.on('mouseenter', () => bus.call('hover', null, key))
       .on('mouseleave', () => bus.call('leave', null))
       .on('click', () => bus.call('toggle', null, key));
  }
}
