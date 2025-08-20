// js/visualization.js — Orchestrator (config‑driven legend/labels + safe margins)
// -----------------------------------------------------------------------------
import {
  CHART, STYLES, VIZ_COLUMNS,
  SHOW_LEGEND, LEGEND_POSITION, SHOW_RIGHT_LABELS
} from './config.js';

import { createInitialState, setHoveredKey, toggleSeriesVisibility } from './state.js';
import { createScales }   from './scales.js';       // -> ({ x, y })
import { renderAxes }     from './axes.js';         // (g, x, y, innerW, innerH)
import { drawGridlines }  from './gridlines.js';    // (g, x, y, innerW, innerH)
import {
  drawLinesAndMarkers, applyHoverStyles, applyVisibility
} from './lines.js';                                // drawLinesAndMarkers(...)->{seriesMap}
import { addRightLabels, wireLabelHover } from './labels.js';  // -> {labelsMap}
import { addLegend }     from './legend.js';        // (legendHost, columns, state, bus)->{sync}
import { addTooltip }    from './tooltip.js';       // (g, overlay, data, columns, x, y)

export function visualizeData({
  container = '#visualization',
  data,
  columns = VIZ_COLUMNS,
  title = 'ICEA — Multi-Series Time Lines'
}) {
  if (!Array.isArray(data) || !data.length) {
    throw new Error('No data loaded. Check DATA_CONFIG in config.js');
  }

  const root = d3.select(container).attr('role', 'graphics-document');
  root.selectAll('*').remove();

  const width  = CHART.WIDTH;
  const height = CHART.HEIGHT;

  // ---- Safe margins (start from base; add extras per config)
  const margin = CHART?.MARGIN_BASE
    ? { ...CHART.MARGIN_BASE }
    : { top: 56, right: 64, bottom: 52, left: 64 };

  if (SHOW_RIGHT_LABELS) {
    margin.right += (CHART.RIGHT_LABEL_PADDING || 96);
  }

  // SVG (responsive via viewBox; NO height="auto")
  const svg = root.append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .style('width', '100%')
    .attr('aria-labelledby', 'chart-title chart-desc');

  svg.append('title').attr('id', 'chart-title').text(title);
  svg.append('desc').attr('id', 'chart-desc').text('Interactive, responsive line chart built with D3.');

  // Title (arriba a la izquierda)
  svg.append('text')
    .attr('x', margin.left)
    .attr('y', 24)
    .attr('font-family', STYLES.FONT_FAMILY)
    .attr('font-size', STYLES.TITLE_SIZE)
    .attr('font-weight', STYLES.TITLE_WEIGHT)
    .text(title);

  // ---- Event bus + state (antes de legend para wiring)
  const state = createInitialState(columns);
  const bus = d3.dispatch('hover', 'leave', 'toggle');

  // ---- Legend host (debajo del título o a la derecha)
  let legendSync = () => {};
  let legendHost = null;

  if (SHOW_LEGEND) {
    if (LEGEND_POSITION === 'below-title') {
      legendHost = svg.append('g').attr('transform', `translate(${margin.left}, 44)`);
    } else {
      legendHost = svg.append('g').attr('transform',
        `translate(${width - margin.right + 12}, ${margin.top || 56})`);
    }
    ({ sync: legendSync } = addLegend(legendHost, columns, state, bus));
  }

  // ---- Si la leyenda va debajo del título, medimos su altura real
  let plotTop = margin.top;
  if (SHOW_LEGEND && LEGEND_POSITION === 'below-title' && legendHost) {
    const bbox = legendHost.node().getBBox();
    const legendH = bbox?.height || 0;
    // Título a y=24, leyenda empieza a y=44, sumamos alto real + gap
    plotTop = Math.max(plotTop, 44 + legendH + 16);
  }

  const innerWidth  = width  - margin.left - margin.right;
  const innerHeight = height - plotTop      - margin.bottom;

  // Grupo interior
  const g = svg.append('g').attr('transform', `translate(${margin.left},${plotTop})`);
  g.attr('data-inner-height', innerHeight);

  // Capas
  const gridLayer = g.append('g').attr('class', 'grid-layer');
  const dataLayer = g.append('g').attr('class', 'data-layer');
  const uiLayer   = g.append('g').attr('class', 'ui-layer');

  // Overlay para interacciones
  const overlay = g.append('rect')
    .attr('class', 'overlay')
    .attr('width', innerWidth)
    .attr('height', innerHeight)
    .attr('fill', 'transparent')
    .style('pointer-events', 'all');

  // ---- Bus → reacciones
  let seriesMap = {}, labelsMap = {};
  bus.on('hover.viz', (key) => {
    setHoveredKey(state, key);
    applyHoverStyles(seriesMap, labelsMap, state.hoveredKey);
  });
  bus.on('leave.viz', () => {
    setHoveredKey(state, null);
    applyHoverStyles(seriesMap, labelsMap, state.hoveredKey);
  });
  bus.on('toggle.viz', (key) => {
    toggleSeriesVisibility(state, key);
    applyVisibility(seriesMap, state);
    legendSync();
  });

  // ---- Scales + axes + grid
  const { x, y } = createScales(data, columns, innerWidth, innerHeight);
  renderAxes(g, x, y, innerWidth, innerHeight);
  drawGridlines(gridLayer, x, y, innerWidth, innerHeight);

  // ---- Líneas + labels + tooltip
  ({ seriesMap } = drawLinesAndMarkers(dataLayer, data, columns, x, y));

  ({ labelsMap } = addRightLabels(uiLayer, data, columns, x, y, innerWidth));
  applyVisibility(seriesMap, state);

  const tooltip = addTooltip(g, overlay, data, columns, x, y);

  // Hover por trazo
  Object.entries(seriesMap).forEach(([key, refs]) => {
    refs.line
      .style('pointer-events', 'stroke')
      .on('mouseenter', () => bus.call('hover', null, key))
      .on('mouseleave', () => bus.call('leave', null));
  });

  // Resize (viewBox se encarga; no hay reflow caro)
  const ro = new ResizeObserver(() => {});
  ro.observe(root.node());

  return { svg, destroy: () => { ro.disconnect(); tooltip.destroy(); } };
}
