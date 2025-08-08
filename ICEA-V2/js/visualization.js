// ============================================================
// visualization.js
// Punto de entrada de la visualización (coordinador).
// - Crea el SVG y el grupo interior.
// - Construye escalas.
// - Renderiza ejes + gridlines.
// - Dibuja líneas y labels finales.
// - Agrega leyenda e interactividad.
// - Agrega tooltip flotante con guideline.
// ============================================================

import {
  VIZ_COLUMNS, CHART_TITLE,
  CUSTOM_LABELS, CUSTOM_COLORS, DEFAULT_COLORS,
  CHART_WIDTH, CHART_HEIGHT, CHART_MARGINS,
  FONT_FAMILY, TITLE_FONT_SIZE, TITLE_FONT_WEIGHT
} from "./config.js";

import { createScales } from "./scales.js";
import { renderAxes } from "./axes.js";
import { drawGridlines } from "./gridlines.js";
import { drawLinesAndMarkers } from "./lines.js";
import { addRightLabels } from "./labels.js";
import { addLegend } from "./legend.js";
import { addTooltip } from "./tooltip.js";

export function visualizeData(preparedData, rawData) {
  if (!preparedData || preparedData.count === 0) {
    console.warn("❌ No data available for visualization");
    return;
  }

  // --- Colores y etiquetas (resuelve custom o default) ---
  const colors = CUSTOM_COLORS && CUSTOM_COLORS.length >= VIZ_COLUMNS.length
    ? CUSTOM_COLORS.slice(0, VIZ_COLUMNS.length)
    : DEFAULT_COLORS.slice(0, VIZ_COLUMNS.length);

  const labels = CUSTOM_LABELS && CUSTOM_LABELS.length >= VIZ_COLUMNS.length
    ? CUSTOM_LABELS.slice(0, VIZ_COLUMNS.length)
    : VIZ_COLUMNS.map(colNum => {
        const colName = Object.keys(rawData[0])[colNum - 1];
        return colName || `Column ${colNum}`;
      });

  // --- Crear SVG raíz ---
  const svg = d3.create("svg")
    .attr("width", CHART_WIDTH + CHART_MARGINS.left + CHART_MARGINS.right)
    .attr("height", CHART_HEIGHT + CHART_MARGINS.top + CHART_MARGINS.bottom)
    .style("background-color", "#fff")
    .style("border", "1px solid #ddd")
    .style("font-family", FONT_FAMILY);

  // --- Grupo interior (zona de dibujo) ---
  const g = svg.append("g")
    .attr("transform", `translate(${CHART_MARGINS.left},${CHART_MARGINS.top})`);

  // --- Título ---
  svg.append("text")
    .attr("x", (CHART_WIDTH + CHART_MARGINS.left + CHART_MARGINS.right) / 2)
    .attr("y", 40)
    .attr("text-anchor", "middle")
    .style("font-size", TITLE_FONT_SIZE)
    .style("font-weight", TITLE_FONT_WEIGHT)
    .style("fill", "#333")
    .text(CHART_TITLE);

  // --- Escalas ---
  const { xScale, yScale, xDomain } = createScales(preparedData.data);

  // --- Ejes (y obtener ticks X reales para gridlines) ---
  const xGridTicks = renderAxes(g, xScale, yScale, xDomain);

  // --- Gridlines (usa los mismos ticks que el eje) ---
  const yTicks = yScale.ticks ? yScale.ticks() : []; // si definiste Y_AXIS_TICKS_VALUES manuales, los calcula axes.js
  drawGridlines(g, yScale, xScale, yTicks, xGridTicks);

  // --- Líneas y markers ---
  const lineElements = drawLinesAndMarkers(g, preparedData.data, colors, xScale, yScale);

  // --- Labels derechos (anti-colisión + leader lines opcionales) ---
  addRightLabels(g, preparedData.data, labels, colors, lineElements, yScale);

  // --- Leyenda interactiva ---
  addLegend(svg, g, labels, colors, lineElements);

  // --- Tooltip flotante + guideline vertical ---
  addTooltip(g, preparedData.data, xScale, yScale, colors, labels, xGridTicks);

  // --- Montar en el DOM ---
  const mount = document.getElementById("visualization");
  if (mount) mount.appendChild(svg.node());
}
