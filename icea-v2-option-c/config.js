// ============================================================
// config.js — Centralized tunables for layout, styles, behavior
// All comments in English to teach D3.js usage.
// ============================================================

export const CHART = {
  WIDTH: 920,
  HEIGHT: 520,
  MARGIN: { top: 56, right: 160, bottom: 52, left: 64 },
};

export const STYLES = {
  FONT_FAMILY: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
  TITLE_SIZE: 18,
  TITLE_WEIGHT: 700,
  AXIS_FONT_SIZE: 12,
  AXIS_COLOR: '#4b5563',
  GRID_COLOR: '#e5e7eb',
  LINE_WIDTH: 2,
  DIMMED_OPACITY: 0.2,
};

export const INTERACTION = {
  TOOLTIP_THROTTLE_MS: 24, // ~40fps
  HOVER_STROKE_EXTRA: 1.5,
};

// Define your series (order controls legend/labels order)
export const VIZ_COLUMNS = [
  { key: 'col1', label: 'Series A' },
  { key: 'col2', label: 'Series B' },
  { key: 'col3', label: 'Series C' },
];

// Color palette — global d3 is available via <script src="...d3@7"></script>
export const COLOR = d3.scaleOrdinal()
  .range(['#2563eb','#16a34a','#ef4444','#a855f7','#db2777','#f59e0b','#059669']);

// Axis ticks & formatting
export const TICKS = {
  X_NUM: 6,
  Y_NUM: 5,
  Y_FORMAT: d3.format(',.2f'),
};

// Right-side labels
export const LABELS = {
  FONT_SIZE: 12,
  FONT_WEIGHT: 600,
  MIN_DISTANCE: 16,
  SHOW_LEADER_LINES: true,
};

// Tooltip formatting
export const TOOLTIP = {
  DATE_FORMAT: d3.timeFormat('%b %d, %Y'),
  NUM_FORMAT: d3.format(',.2f'),
};
