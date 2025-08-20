// ============================================================
// ICEA V2 — Config-driven legend & right-label toggles + auto margins
// Files: js/config.js, js/legend.js, js/labels.js, js/visualization.js
// ============================================================

//----------------------------------
// js/config.js — Central switches
//----------------------------------

export const CHART = {
  WIDTH: 920,
  HEIGHT: 520,
  MARGIN_BASE: { top: 56, right: 64, bottom: 52, left: 64 },
  RIGHT_LABEL_PADDING: 96,
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

export const SHOW_LEGEND = true;
export const LEGEND_POSITION = 'below-title';
export const SHOW_RIGHT_LABELS = true;

export const VIZ_COLUMNS = [
  { key: 'Nivel General', label: 'Nivel General' },
  { key: 'Situación económica general', label: 'Situación económica general' },
  { key: 'COL_3', label: 'COL_3' },
  { key: 'COL_4', label: 'COL_4' },
];

export const COLOR = d3.scaleOrdinal()
  .range(['#2563eb','#16a34a','#ef4444','#a855f7','#db2777','#f59e0b','#059669']);

// ----------------------------------
// Locale argentino/es-AR
// ----------------------------------
const locale = d3.formatLocale({
  decimal: ",",      // separador decimal
  thousands: ".",    // separador de miles
  grouping: [3],     // cada 3 dígitos
  currency: ["$", ""]
});

// ----------------------------------
// Axes
// ----------------------------------
export const TICKS = { 
  X_NUM: 6, 
  Y_NUM: 5 
};

// Formato exclusivo para el eje Y (independiente del tooltip)
export const Y_AXIS_FORMAT = locale.format(',.0f'); // Ejemplo: 8.049,9

// ----------------------------------
// Labels
// ----------------------------------
export const LABELS = {
  FONT_SIZE: 12,
  FONT_WEIGHT: 600,
  MIN_DISTANCE: 16,
  SHOW_LEADER_LINES: true,
};

// ----------------------------------
// Tooltip
// ----------------------------------
export const TOOLTIP = {
  DATE_FORMAT: d3.timeFormat('%b, %Y'),
  NUM_FORMAT: locale.format(',.2f'), // Ejemplo: 8.049,90
};

// ----------------------------------
// Data source
// ----------------------------------
export const DATA_CONFIG = {
  SOURCE: 'csv_url',
  CSV_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSc7Lss59TkKCCtT68RGxLwCuvCAzNFP0qfIeYy_Pf_yIJ4MyRBk_r6-qsk_cgItkEMB838GI6-9jYb/pub?gid=0&single=true&output=csv',
  DATA_FORMAT: 'wide',
  DATE_FIELD: null,
  DATE_PARSE_FORMATS: [
    '%Y-%m-%d','%d/%m/%Y','%m/%d/%Y','%d-%m-%Y','%Y/%m/%d',
    '%b-%y','%b %Y','%Y-%m','%d %b %Y','%d %b %y','%b %d, %Y'
  ],
  CATEGORY_FIELD: 'series',
  VALUE_FIELD: 'value',
  DEBUG: true,
};
