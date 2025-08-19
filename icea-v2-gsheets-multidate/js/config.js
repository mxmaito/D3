// js/config.js — Tunables + data source (ONLY THIS FILE)
// -----------------------------------------------------------
// NOTE: I cannot read your Google Sheet headers from here.
// Paste the EXACT names of the first 4 data columns (after the date column)
// into VIZ_COLUMNS below. Accents, spaces, and case must match 1:1.

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
  TOOLTIP_THROTTLE_MS: 24,
  HOVER_STROKE_EXTRA: 1.5,
};

// -----------------------------------------------------------
// VIZ COLUMNS — Replace the 4 keys with your EXACT column names
// (first four columns AFTER the date column in your Google Sheet)
// Example: if headers are: Fecha, Trigo, Maíz, Soja, Girasol, ...
// then set keys: 'Trigo', 'Maíz', 'Soja', 'Girasol'
export const VIZ_COLUMNS = [
  { key: 'Nivel General', label: 'COL_1' },
  { key: 'COL_2', label: 'COL_2' },
  { key: 'COL_3', label: 'COL_3' },
  { key: 'COL_4', label: 'COL_4' },
];

// Color palette (global d3 provided via CDN)
export const COLOR = d3.scaleOrdinal()
  .range(['#2563eb','#16a34a','#ef4444','#a855f7','#db2777','#f59e0b','#059669']);

export const TICKS = {
  X_NUM: 6,
  Y_NUM: 5,
  Y_FORMAT: d3.format(',.2f'),
};

export const LABELS = {
  FONT_SIZE: 12,
  FONT_WEIGHT: 600,
  MIN_DISTANCE: 16,
  SHOW_LEADER_LINES: true,
};

export const TOOLTIP = {
  DATE_FORMAT: d3.timeFormat('%b %d, %Y'),
  NUM_FORMAT: d3.format(',.2f'),
};

// -----------------------------------------------------------
// Data source — uses your published CSV (auto-updating)
export const DATA_CONFIG = {
  SOURCE: 'csv_url',
  CSV_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSc7Lss59TkKCCtT68RGxLwCuvCAzNFP0qfIeYy_Pf_yIJ4MyRBk_r6-qsk_cgItkEMB838GI6-9jYb/pub?gid=0&single=true&output=csv',
  DATA_FORMAT: 'wide',

  // Leave DATE_FIELD null to auto-detect; or set to exact header (e.g., 'Fecha')
  DATE_FIELD: null,

  // Multi-format date parsing; supports mmm-yy and Spanish month names
  DATE_PARSE_FORMATS: [
    '%Y-%m-%d','%d/%m/%Y','%m/%d/%Y','%d-%m-%Y','%Y/%m/%d',
    '%b-%y','%b %Y','%Y-%m','%d %b %Y','%d %b %y','%b %d, %Y'
  ],

  // Only for long format
  CATEGORY_FIELD: 'series',
  VALUE_FIELD: 'value',

  DEBUG: true,
};
