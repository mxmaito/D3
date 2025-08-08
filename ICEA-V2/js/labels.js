// ============================================================
// labels.js
// Labels derechos de cada serie con anti-colisión y leader lines.
// ============================================================

import {
  CHART_WIDTH, CHART_MARGINS, LABEL_MIN_DISTANCE,
  SHOW_LEADER_LINES, LABEL_FONT_SIZE, LABEL_FONT_WEIGHT, FONT_FAMILY
} from "./config.js";

import { truncateTextToWidth } from "./utils.js";

/**
 * addRightLabels
 * - g: grupo principal
 * - data: preparedData.data
 * - labels: nombres de series
 * - colors: colores de series
 * - lineElements: refs a paths (para hover externo, etc.)
 * - yScale
 */
export function addRightLabels(g, data, labels, colors, lineElements, yScale) {
  // Construir posiciones objetivo (último valor de cada serie)
  let targets = labels.map((lbl, i) => {
    const last = [...data].reverse().find(d => {
      const colKey = `col${i + 1}`; // OJO: labels viene alineado con VIZ_COLUMNS en visualization.js
      return d.values[colKey] != null && !isNaN(d.values[colKey]);
    });
    // En modules: preferimos computar por VIZ_COLUMNS en visualization.js y pasar ya el array correcto.
    return null; // No usamos este camino genérico aquí.
  });

  // Recalcular correctamente usando las series que realmente dibujamos:
  // Para evitar ambigüedades con índices, pedimos los valores a partir de lineElements length.
  targets = lineElements.map((pathEl, i) => {
    if (!pathEl) return null;
    // Necesitamos el último punto visible de la serie i: lo leemos del pathEl.__data__
    const series = pathEl.datum ? pathEl.datum() : (pathEl.node && pathEl.node().__data__);
    if (!series || !series.length) return null;
    const lastPoint = series[series.length - 1];
    return {
      index: i,
      label: labels[i],
      color: colors[i],
      lastValue: lastPoint.value,
      yIdeal: yScale(lastPoint.value)
    };
  }).filter(Boolean);

  // Ordenar por Y creciente
  targets.sort((a, b) => a.yIdeal - b.yIdeal);

  // Anti-colisión simple: empujar hacia abajo si se solapan
  for (let i = 1; i < targets.length; i++) {
    if (targets[i].yIdeal - targets[i - 1].yIdeal < LABEL_MIN_DISTANCE) {
      targets[i].yIdeal = targets[i - 1].yIdeal + LABEL_MIN_DISTANCE;
    }
  }

  // Dibujar leader lines y labels truncados a ancho de margen derecho
  const labelX = CHART_WIDTH + 10;
  const maxLabelWidth = CHART_MARGINS.right - 5;

  targets.forEach(t => {
    const series = lineElements[t.index].datum();
    const lastPoint = series[series.length - 1];
    const lastX = CHART_WIDTH;
    const lastY = yScale(lastPoint.value);

    if (SHOW_LEADER_LINES) {
      g.append("line")
        .attr("x1", lastX).attr("y1", lastY)
        .attr("x2", labelX).attr("y2", t.yIdeal)
        .attr("stroke", "#888").attr("stroke-width", 1)
        .attr("stroke-opacity", 0.45);
    }

    const textSel = g.append("text")
      .attr("x", labelX + 2)
      .attr("y", t.yIdeal)
      .attr("dy", "0.35em")
      .style("font-size", LABEL_FONT_SIZE)
      .style("font-weight", LABEL_FONT_WEIGHT)
      .style("fill", t.color)
      .style("font-family", FONT_FAMILY)
      .style("text-anchor", "start")
      .style("cursor", "pointer");

    truncateTextToWidth(textSel, t.label, maxLabelWidth);

    // Guardar referencia para interactividad externa
    if (lineElements[t.index]) {
      lineElements[t.index].rightLabel = textSel;
    }
  });
}
