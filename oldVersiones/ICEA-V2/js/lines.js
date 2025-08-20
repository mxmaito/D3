// ============================================================
// lines.js
// Dibuja las líneas (series) y, opcionalmente, marcadores.
// Devuelve referencias a los <path> para interactividad.
// ============================================================

import {
  VIZ_COLUMNS, DEFAULT_COLORS, CUSTOM_COLORS,
  LINE_STROKE_WIDTH, MARKER_SHAPE, MARKER_SIZE, MARKER_FILL_OPACITY
} from "./config.js";

/**
 * drawLinesAndMarkers
 * - g: grupo principal
 * - data: preparedData.data
 * - colors: vector de colores (si no lo pasás, se calcula acá)
 * - xScale, yScale
 * - Devuelve: array con los path de cada serie (lineElements)
 */
export function drawLinesAndMarkers(g, data, colorsIn, xScale, yScale) {
  const colors = (CUSTOM_COLORS && CUSTOM_COLORS.length >= VIZ_COLUMNS.length)
    ? CUSTOM_COLORS.slice(0, VIZ_COLUMNS.length)
    : (colorsIn || DEFAULT_COLORS).slice(0, VIZ_COLUMNS.length);

  const line = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.value))
    .defined(d => d.value != null && !isNaN(d.value))
    .curve(d3.curveMonotoneX);

  const lineElements = [];

  VIZ_COLUMNS.forEach((colNum, i) => {
    const seriesData = data.map(d => ({
      date: d.date, value: d.values[`col${colNum}`]
    })).filter(d => d.value != null && !isNaN(d.value));

    if (!seriesData.length) {
      lineElements.push(null);
      return;
    }

    const lineEl = g.append("path")
      .datum(seriesData)
      .attr("fill", "none")
      .attr("stroke", colors[i])
      .attr("stroke-width", LINE_STROKE_WIDTH)
      .attr("d", line);

    lineElements.push(lineEl);

    // Markers (opcionales: si MARKER_SIZE > 0)
    if (MARKER_SIZE > 0) {
      const mg = g.append("g").attr("class", `markers markers-${i}`);
      seriesData.forEach(p => {
        const x = xScale(p.date);
        const y = yScale(p.value);
        const color = colors[i];
        if (MARKER_SHAPE === "circle") {
          mg.append("circle")
            .attr("cx", x).attr("cy", y).attr("r", MARKER_SIZE)
            .attr("fill", color).attr("fill-opacity", MARKER_FILL_OPACITY)
            .attr("stroke", "#fff").attr("stroke-width", 1);
        } else if (MARKER_SHAPE === "square") {
          mg.append("rect")
            .attr("x", x - MARKER_SIZE).attr("y", y - MARKER_SIZE)
            .attr("width", MARKER_SIZE * 2).attr("height", MARKER_SIZE * 2)
            .attr("fill", color).attr("fill-opacity", MARKER_FILL_OPACITY)
            .attr("stroke", "#fff").attr("stroke-width", 1);
        } else if (MARKER_SHAPE === "triangle") {
          const path = d3.path();
          path.moveTo(x, y - MARKER_SIZE);
          path.lineTo(x - MARKER_SIZE, y + MARKER_SIZE);
          path.lineTo(x + MARKER_SIZE, y + MARKER_SIZE);
          path.closePath();
          mg.append("path")
            .attr("d", path.toString())
            .attr("fill", color).attr("fill-opacity", MARKER_FILL_OPACITY)
            .attr("stroke", "#fff").attr("stroke-width", 1);
        }
      });
    }
  });

  return lineElements;
}
