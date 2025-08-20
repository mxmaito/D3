// ============================================================
// legend.js
// Leyenda vertical, con hover (highlight) y toggle de visibilidad.
// ============================================================

import {
  CHART_MARGINS, LEGEND_FONT_SIZE, LEGEND_FONT_WEIGHT,
  LEGEND_FONT_WEIGHT_WITH_HOVER, LINE_STROKE_WIDTH, LINE_STROKE_WIDTH_HOVER
} from "./config.js";

/**
 * addLegend
 * - svg: svg raíz (no el grupo g)
 * - g: grupo principal (para buscar markers y labels derechos)
 * - labels, colors, lineElements
 * Devuelve: array seriesVisible (booleans)
 */
export function addLegend(svg, g, labels, colors, lineElements) {
  const seriesVisible = lineElements.map(() => true);

  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${CHART_MARGINS.left}, 50)`);

  labels.forEach((label, i) => {
    const item = legend.append("g")
      .attr("class", `legend-item legend-item-${i}`)
      .attr("transform", `translate(0, ${i * 22})`)
      .style("cursor", "pointer");

    item.append("rect")
      .attr("x", 0).attr("y", -8)
      .attr("width", 14).attr("height", 14)
      .attr("rx", 3).attr("ry", 3)
      .style("fill", colors[i]);

    const labelText = item.append("text")
      .attr("x", 22).attr("y", 0).attr("dy", "0.35em")
      .style("font-size", LEGEND_FONT_SIZE)
      .style("font-weight", LEGEND_FONT_WEIGHT)
      .style("fill", "#333")
      .text(label);

    // Hover: resalta una serie, atenúa las demás
    item.on("mouseover", () => {
      lineElements.forEach((l, idx) => {
        if (!l) return;
        if (idx === i) {
          l.style("stroke-width", LINE_STROKE_WIDTH_HOVER).style("opacity", 1);
          const rl = l.rightLabel;
          if (rl) rl.style("font-weight", LEGEND_FONT_WEIGHT_WITH_HOVER).style("opacity", 1);
          g.select(`.markers-${idx}`).style("opacity", 1);
        } else {
          l.style("opacity", 0.15);
          const rl = l.rightLabel;
          if (rl) rl.style("opacity", 0.2);
          g.select(`.markers-${idx}`).style("opacity", 0.15);
        }
      });
      labelText.style("font-weight", LEGEND_FONT_WEIGHT_WITH_HOVER);
    });

    item.on("mouseout", () => {
      lineElements.forEach((l, idx) => {
        if (!l) return;
        l.style("stroke-width", LINE_STROKE_WIDTH).style("opacity", seriesVisible[idx] ? 1 : 0.15);
        const rl = l.rightLabel;
        if (rl) rl.style("font-weight", LEGEND_FONT_WEIGHT).style("opacity", seriesVisible[idx] ? 1 : 0.15);
        g.select(`.markers-${idx}`).style("opacity", seriesVisible[idx] ? 1 : 0.15);
      });
      labelText.style("font-weight", LEGEND_FONT_WEIGHT);
    });

    // Click: toggle de visibilidad
    item.on("click", (ev) => {
      ev.stopPropagation();
      seriesVisible[i] = !seriesVisible[i];
      const l = lineElements[i];
      if (!l) return;

      l.style("opacity", seriesVisible[i] ? 1 : 0.15);
      const rl = l.rightLabel;
      if (rl) rl.style("opacity", seriesVisible[i] ? 1 : 0.15);
      g.select(`.markers-${i}`).style("opacity", seriesVisible[i] ? 1 : 0.15);

      item.select("rect").style("opacity", seriesVisible[i] ? 1 : 0.3);
      labelText.style("opacity", seriesVisible[i] ? 1 : 0.3);
    });
  });

  return seriesVisible;
}
