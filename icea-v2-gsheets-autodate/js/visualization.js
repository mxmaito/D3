//----------------------------------
// js/visualization.js — Orchestrator
//----------------------------------
// The layout is computed from config switches:
// - If legend is below the title, we measure its height and push the
//   plot area down.
// - If right labels are on, we add extra right padding so labels fit.

import { CHART, STYLES, VIZ_COLUMNS, LEGEND_POSITION, SHOW_LEGEND, SHOW_RIGHT_LABELS } from './config.js';
import { createInitialState, setHoveredKey, toggleSeriesVisibility } from './state.js';
import { createScales } from './scales.js';
import { renderAxes } from './axes.js';
import { drawGridlines } from './gridlines.js';
import { drawLinesAndMarkers, applyHoverStyles, applyVisibility } from './lines.js';
import { addRightLabels, wireLabelHover } from './labels.js';
import { addLegend } from './legend.js';
import { addTooltip } from './tooltip.js';

export function visualizeData({ container, data, columns = VIZ_COLUMNS, title = 'Line Chart' }) {
  const root = d3.select(container).attr('role', 'graphics-document');
  const width = CHART.WIDTH, height = CHART.HEIGHT;

  // 1) Start from base margins and derive runtime margins
  const margin = { ...CHART.MARGIN_BASE };
  if (SHOW_RIGHT_LABELS) {
    margin.right = CHART.MARGIN_BASE.right + (CHART.RIGHT_LABEL_PADDING || 0);
  }

  // 2) Create the SVG *before* legend to allow measuring
  const svg = root.append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .attr('width', '100%')
    .attr('height', 'auto')
    .attr('aria-labelledby', 'chart-title chart-desc');

  svg.append('title').attr('id', 'chart-title').text(title);
  svg.append('desc').attr('id', 'chart-desc').text('Interactive, responsive line chart built with D3.');

  // Title at top-left (consistent, readable)
  svg.append('text')
    .attr('x', margin.left)
    .attr('y', 24)
    .attr('font-family', STYLES.FONT_FAMILY)
    .attr('font-size', STYLES.TITLE_SIZE)
    .attr('font-weight', STYLES.TITLE_WEIGHT)
    .text(title);

  // 3) Legend host and rendering
  let legendHost = null;
  if (SHOW_LEGEND) {
    if (LEGEND_POSITION === 'below-title') {
      legendHost = svg.append('g').attr('transform', `translate(${margin.left}, 44)`);
    } else {
      legendHost = svg.append('g').attr('transform', `translate(${width - margin.right + 12}, ${margin.top || 56})`);
    }
  }

  // State + bus for interactions
  const state = createInitialState(columns);
  const bus = d3.dispatch('hover', 'leave', 'toggle');

  let seriesMap = {}, labelsMap = {}, legendSync = () => {};
  if (legendHost) ({ sync: legendSync } = addLegend(legendHost, columns, state, bus));

  // 4) Compute dynamic top margin if legend is below the title
  let plotTop = margin.top;
  if (SHOW_LEGEND && LEGEND_POSITION === 'below-title' && legendHost) {
    const bbox = legendHost.node().getBBox();
    const legendHeight = bbox.height || 0;
    // Title baseline at 24px, legend starts at y=44px, then add measured height + a gap
    plotTop = Math.max(plotTop, 44 + legendHeight + 16);
  }

  const innerWidth  = width  - margin.left - margin.right;
  const innerHeight = height - plotTop      - margin.bottom;

  const g = svg.append('g').attr('transform', `translate(${margin.left},${plotTop})`);
  g.attr('data-inner-height', innerHeight);

  // Layers
  const gridLayer = g.append('g').attr('class', 'grid-layer');
  const dataLayer = g.append('g').attr('class', 'data-layer');
  const uiLayer   = g.append('g').attr('class', 'ui-layer');

  // Overlay for pointer events
  const overlay = g.append('rect')
    .attr('class', 'overlay')
    .attr('width', innerWidth)
    .attr('height', innerHeight)
    .attr('fill', 'transparent')
    .style('pointer-events', 'all');

  // Bus reactions
  bus.on('hover.viz', (key) => { setHoveredKey(state, key); applyHoverStyles(seriesMap, labelsMap, state.hoveredKey); });
  bus.on('leave.viz', () => { setHoveredKey(state, null); applyHoverStyles(seriesMap, labelsMap, state.hoveredKey); });
  bus.on('toggle.viz', (key) => { toggleSeriesVisibility(state, key); applyVisibility(seriesMap, state); legendSync(); });

  // Scales + axes + gridlines
  const { x, y } = createScales(data, columns, innerWidth, innerHeight);
  renderAxes(g, x, y, innerWidth, innerHeight);
  drawGridlines(gridLayer, x, y, innerWidth, innerHeight);

  // Series + labels (honors SHOW_RIGHT_LABELS) + tooltip
  ({ seriesMap } = drawLinesAndMarkers(dataLayer, data, columns, x, y));
  ({ labelsMap } = addRightLabels(uiLayer, data, columns, x, y, innerWidth));
  applyVisibility(seriesMap, state);

  const tooltip = addTooltip(g, overlay, data, columns, x, y);

  // Stroke-hover affordance
  Object.entries(seriesMap).forEach(([key, refs]) => {
    refs.line.style('pointer-events', 'stroke')
      .on('mouseenter', () => bus.call('hover', null, key))
      .on('mouseleave', () => bus.call('leave', null));
  });

  const ro = new ResizeObserver(() => { /* viewBox handles resizing; reflow not needed */ });
  ro.observe(root.node());

  return { svg, destroy: () => { ro.disconnect(); tooltip.destroy(); } };
}
