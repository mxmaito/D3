// ============================================================
// gridlines.js
// Dibuja las líneas de grilla horizontales y verticales.
// ============================================================

import {
  SHOW_GRIDLINES, GRIDLINE_COLOR, GRIDLINE_OPACITY,
  GRIDLINE_HORIZONTAL_WIDTH, GRIDLINE_VERTICAL_WIDTH,
  CHART_WIDTH, CHART_HEIGHT
} from "./config.js";

/**
 * drawGridlines
 * - g: grupo principal de la zona de dibujo
 * - yScale, xScale
 * - yTicks: array de valores del eje Y (números)
 * - xTicks: array de fechas del eje X
 */
export function drawGridlines(g, yScale, xScale, yTicks, xTicks) {
  if (!SHOW_GRIDLINES) return;

  // Horizontales (paralelas a X)
  g.selectAll(".y-gridline")
    .data(yTicks)
    .join("line")
    .attr("class", "y-gridline")
    .attr("x1", 0).attr("x2", CHART_WIDTH)
    .attr("y1", d => yScale(d)).attr("y2", d => yScale(d))
    .attr("stroke", GRIDLINE_COLOR)
    .attr("stroke-width", GRIDLINE_HORIZONTAL_WIDTH)
    .attr("opacity", GRIDLINE_OPACITY);

  // Verticales (paralelas a Y)
  g.selectAll(".x-gridline")
    .data(xTicks)
    .join("line")
    .attr("class", "x-gridline")
    .attr("y1", 0).attr("y2", CHART_HEIGHT)
    .attr("x1", d => xScale(d)).attr("x2", d => xScale(d))
    .attr("stroke", GRIDLINE_COLOR)
    .attr("stroke-width", GRIDLINE_VERTICAL_WIDTH)
    .attr("opacity", GRIDLINE_OPACITY);
}
