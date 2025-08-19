// ============================================================
// visualization.js — Orchestrator (responsive + event bus + state)
// ============================================================
import { CHART, STYLES, VIZ_COLUMNS } from './config.js';
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
  const margin = CHART.MARGIN;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = root.append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .attr('width', '100%')
    .attr('height', 'auto')
    .attr('aria-labelledby', 'chart-title chart-desc');

  svg.append('title').attr('id', 'chart-title').text(title);
  svg.append('desc').attr('id', 'chart-desc').text('Interactive, responsive line chart built with D3.');

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
  g.attr('data-inner-height', innerHeight);

  g.append('text')
    .attr('x', 0)
    .attr('y', -24)
    .attr('font-family', STYLES.FONT_FAMILY)
    .attr('font-size', STYLES.TITLE_SIZE)
    .attr('font-weight', STYLES.TITLE_WEIGHT)
    .text(title);

  const gridLayer = g.append('g').attr('class', 'grid-layer');
  const dataLayer = g.append('g').attr('class', 'data-layer');
  const uiLayer = g.append('g').attr('class', 'ui-layer');

  const legendHost = svg.append('g')
    .attr('transform', `translate(${width - margin.right + 12}, ${margin.top})`);

  const overlay = g.append('rect')
    .attr('class', 'overlay')
    .attr('width', innerWidth)
    .attr('height', innerHeight)
    .attr('fill', 'transparent')
    .style('pointer-events', 'all');

  const state = createInitialState(columns);
  const bus = d3.dispatch('hover', 'leave', 'toggle');

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

  let { x, y } = createScales(data, columns, innerWidth, innerHeight);
  renderAxes(g, x, y, innerWidth, innerHeight);
  drawGridlines(gridLayer, x, y, innerWidth, innerHeight);

  const { seriesMap } = drawLinesAndMarkers(dataLayer, data, columns, x, y);
  const { labelsMap } = addRightLabels(uiLayer, data, columns, x, y, innerWidth);
  const { sync: legendSync } = addLegend(legendHost, columns, state, bus);
  wireLabelHover(labelsMap, bus);
  applyVisibility(seriesMap, state);

  const tooltip = addTooltip(g, overlay, data, columns, x, y);

  Object.entries(seriesMap).forEach(([key, refs]) => {
    refs.line
      .style('pointer-events', 'stroke')
      .on('mouseenter', () => bus.call('hover', null, key))
      .on('mouseleave', () => bus.call('leave', null));
  });

  const ro = new ResizeObserver(() => { /* viewBox handles resizing */ });
  ro.observe(root.node());

  return { svg, destroy: () => { ro.disconnect(); tooltip.destroy(); } };
}
