// ============================================================
// ICEA V2 — Config-driven legend & right-label toggles + auto margins
// Files: js/config.js, js/legend.js, js/labels.js, js/visualization.js
// All comments written as if mentoring a D3 student.
// ============================================================

//----------------------------------
// js/config.js — Central switches
//----------------------------------
// Why: Put all layout/feature decisions in one place so you can tweak
// the visualization WITHOUT touching rendering code.

export const CHART = {
  WIDTH: 920,
  HEIGHT: 520,
  // Base margins used as a starting point. visualization.js will
  // adjust these dynamically depending on legend placement and whether
  // right-side labels are shown.
  MARGIN_BASE: { top: 56, right: 64, bottom: 52, left: 64 },
  // Extra space on the right WHEN right labels are enabled (added to base)
  RIGHT_LABEL_PADDING: 96, // effective right = MARGIN_BASE.right + this when labels are on
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

// Feature toggles — flip these without touching rendering modules
export const SHOW_LEGEND = true;         // master toggle for legend
export const LEGEND_POSITION = 'below-title'; // 'below-title' | 'right'
export const SHOW_RIGHT_LABELS = true;   // master toggle for right-side labels

// Series to draw (keys must match CSV headers exactly)
export const VIZ_COLUMNS = [
  { key: 'Nivel General', label: 'Nivel General' },
  { key: 'Situación económica general', label: 'Situación económica general' },
  { key: 'COL_3', label: 'COL_3' },
  { key: 'COL_4', label: 'COL_4' },
];

// Palette
export const COLOR = d3.scaleOrdinal()
  .range(['#2563eb','#16a34a','#ef4444','#a855f7','#db2777','#f59e0b','#059669']);

// Axes
export const TICKS = { X_NUM: 6, Y_NUM: 5, Y_FORMAT: d3.format(',.2f') };

// Labels on the right end of each line
export const LABELS = {
  FONT_SIZE: 12,
  FONT_WEIGHT: 600,
  MIN_DISTANCE: 16,
  SHOW_LEADER_LINES: true,
};

// Tooltip
export const TOOLTIP = {
  DATE_FORMAT: d3.timeFormat('%b, %Y'),
  NUM_FORMAT: d3.format(',.2f'),
};

// Data source (kept here for completeness)
export const DATA_CONFIG = {
  SOURCE: 'csv_url',
  CSV_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSc7Lss59TkKCCtT68RGxLwCuvCAzNFP0qfIeYy_Pf_yIJ4MyRBk_r6-qsk_cgItkEMB838GI6-9jYb/pub?gid=0&single=true&output=csv',
  DATA_FORMAT: 'wide',
  DATE_FIELD: null,
  DATE_PARSE_FORMATS: ['%Y-%m-%d','%d/%m/%Y','%m/%d/%Y','%d-%m-%Y','%Y/%m/%d','%b-%y','%b %Y','%Y-%m','%d %b %Y','%d %b %y','%b %d, %Y'],
  CATEGORY_FIELD: 'series',
  VALUE_FIELD: 'value',
  DEBUG: true,
};