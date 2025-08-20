// ============================================================
// config.js
// Archivo de CONFIGURACIÓN GLOBAL para la visualización
// Aquí se definen todas las constantes de estilo, dimensiones,
// series a graficar y parámetros generales.
// ============================================================

// --- Series a visualizar (números de columna 1-indexed) ---
export const VIZ_COLUMNS = [2, 3, 5];

// --- Título del gráfico ---
export const CHART_TITLE = "ICEA Data Vis";

// --- Personalización de etiquetas de las series ---
export const CUSTOM_LABELS = null; // null = usar nombres originales

// --- Colores personalizados ---
export const CUSTOM_COLORS = null; // null = usar paleta por defecto

// --- Dimensiones y márgenes ---
export const CHART_WIDTH = 800;
export const CHART_HEIGHT = 400;
export const CHART_MARGINS = { top: 140, right: 160, bottom: 80, left: 60 };

// --- Límites manuales de ejes (null = automático) ---
export const Y_AXIS_MIN = 0;
export const Y_AXIS_MAX = null;
export const X_AXIS_MIN = null;
export const X_AXIS_MAX = null;

// --- Paleta de colores por defecto ---
export const DEFAULT_COLORS = [
  "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
  "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"
];

// --- Fuente general ---
export const FONT_FAMILY = "Roboto Condensed, sans-serif";

// --- Estilo de título ---
export const TITLE_FONT_SIZE = "20px";
export const TITLE_FONT_WEIGHT = "bold";

// --- Estilo de etiquetas ---
export const LABEL_FONT_SIZE = "12px";
export const LABEL_FONT_WEIGHT = "400";
export const LABEL_FONT_WEIGHT_WITH_HOVER = "600";

// --- Estilo de leyenda ---
export const LEGEND_FONT_SIZE = "12px";
export const LEGEND_FONT_WEIGHT = "400";
export const LEGEND_FONT_WEIGHT_WITH_HOVER = "600";

// --- Tooltip ---
export const TOOLTIP_FONT_SIZE = "12px";
export const TOOLTIP_FONT_WEIGHT = "normal";
export const TOOLTIP_BG_COLOR = "#fff";
export const TOOLTIP_TEXT_COLOR = "#222";
export const TOOLTIP_BORDER_COLOR = "#aaa";
export const TOOLTIP_BORDER_RADIUS = "6px";
export const TOOLTIP_PADDING = "7px 12px";
export const TOOLTIP_BOX_SHADOW = "0 2px 12px rgba(0,0,0,0.14)";

// --- Guideline del tooltip ---
export const TOOLTIP_GUIDELINE_COLOR = "#888";
export const TOOLTIP_GUIDELINE_WIDTH = 1;
export const TOOLTIP_GUIDELINE_OPACITY = 0.4;

// --- Marcadores ---
export const MARKER_SHAPE = "circle";
export const MARKER_SIZE = 0;
export const MARKER_FILL_OPACITY = 0.9;

// --- Labels de la derecha ---
export const LABEL_MIN_DISTANCE = 22;
export const SHOW_LEADER_LINES = false;

// --- Grosor de líneas ---
export const LINE_STROKE_WIDTH = 2;
export const LINE_STROKE_WIDTH_HOVER = 3;

// --- Ticks de ejes ---
export const Y_AXIS_TICKS = 6;
export const Y_AXIS_TICKS_VALUES = null;
export const X_AXIS_TICKS = 6;
export const X_AXIS_TICKS_VALUES = null;

// --- Gridlines ---
export const SHOW_GRIDLINES = true;
export const GRIDLINE_COLOR = "#ccc";
export const GRIDLINE_OPACITY = 0.7;
export const GRIDLINE_HORIZONTAL_WIDTH = 1;
export const GRIDLINE_VERTICAL_WIDTH = 1;

// --- Altura y ajustes de labels de eje X ---
export const X_AXIS_Y = CHART_HEIGHT;
export const X_AXIS_LABEL_OFFSET = 5;
export const X_AXIS_LABEL_ROTATION = -45;
export const X_AXIS_EXTREME_LEFT_NUDGE  = -6;
export const X_AXIS_EXTREME_RIGHT_NUDGE =  6;
