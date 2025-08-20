// ============================================================
// tooltip.js
// Tooltip HTML flotante + guideline vertical.
// - Captura la posición del mouse sobre el área del gráfico.
// - Busca la fecha más cercana en los datos preparados.
// - Muestra un tooltip con los valores de cada serie en esa fecha.
// - Dibuja una línea vertical (guideline) en la X correspondiente.
// ============================================================

import {
  FONT_FAMILY,
  TOOLTIP_FONT_SIZE, TOOLTIP_FONT_WEIGHT,
  TOOLTIP_BG_COLOR, TOOLTIP_TEXT_COLOR,
  TOOLTIP_BORDER_COLOR, TOOLTIP_BORDER_RADIUS, TOOLTIP_PADDING, TOOLTIP_BOX_SHADOW,
  TOOLTIP_GUIDELINE_COLOR, TOOLTIP_GUIDELINE_WIDTH, TOOLTIP_GUIDELINE_OPACITY,
  CHART_WIDTH, CHART_HEIGHT,
  VIZ_COLUMNS
} from "./config.js";

import { nearestByDate, formatDate } from "./utils.js";

/**
 * addTooltip
 * Coloca un overlay invisible sobre el área del gráfico para escuchar el mouse
 * y actualiza un div HTML posicionado de manera absoluta.
 *
 * @param {d3.Selection} g        - Grupo <g> principal ya trasladado por márgenes
 * @param {Array}        data     - preparedData.data [{ date: Date, values: {col2: num, ...} }]
 * @param {Function}     xScale   - d3.scaleTime()
 * @param {Function}     yScale   - d3.scaleLinear() (no se usa directo aquí, pero queda por si se necesita)
 * @param {Array}        colors   - Colores de las series (en el mismo orden que VIZ_COLUMNS)
 * @param {Array}        labels   - Etiquetas de las series (en el mismo orden que VIZ_COLUMNS)
 * @param {Array<Date>}  xGridTicks - (opcional) ticks de X ya usados para gridlines (no obligatorio aquí)
 */
export function addTooltip(g, data, xScale, yScale, colors, labels, xGridTicks) {
  // 1) Crear el contenedor HTML del tooltip si no existe
  let tooltip = document.getElementById("d3-tooltip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.id = "d3-tooltip";
    document.body.appendChild(tooltip);
  }

  // Estilos del tooltip (inline para que siempre ganen)
  Object.assign(tooltip.style, {
    position: "absolute",
    pointerEvents: "none",
    background: TOOLTIP_BG_COLOR,
    color: TOOLTIP_TEXT_COLOR,
    border: `1px solid ${TOOLTIP_BORDER_COLOR}`,
    borderRadius: TOOLTIP_BORDER_RADIUS,
    padding: TOOLTIP_PADDING,
    fontFamily: FONT_FAMILY,
    fontSize: TOOLTIP_FONT_SIZE,
    fontWeight: TOOLTIP_FONT_WEIGHT,
    boxShadow: TOOLTIP_BOX_SHADOW,
    opacity: 0,
    zIndex: 9999
  });

  // 2) Overlay invisible (captura mousemove)
  const overlay = g.append("rect")
    .attr("class", "tooltip-overlay")
    .attr("width", CHART_WIDTH)
    .attr("height", CHART_HEIGHT)
    .style("fill", "none")
    .style("pointer-events", "all");

  // 3) Guideline vertical
  const guideline = g.append("line")
    .attr("class", "tooltip-guideline")
    .attr("y1", 0)
    .attr("y2", CHART_HEIGHT)
    .style("stroke", TOOLTIP_GUIDELINE_COLOR)
    .style("stroke-width", TOOLTIP_GUIDELINE_WIDTH)
    .style("opacity", 0)
    .style("pointer-events", "none");

  // 4) Interacción
  overlay
    .on("mousemove", function (event) {
      const [mouseX] = d3.pointer(event, this);
      const mouseDate = xScale.invert(mouseX);

      const closest = nearestByDate(data, mouseDate);
      if (!closest) return;

      const xPos = xScale(closest.date);
      guideline
        .attr("x1", xPos)
        .attr("x2", xPos)
        .style("opacity", TOOLTIP_GUIDELINE_OPACITY);

      // Construcción del HTML del tooltip
      let html = `<div style="margin-bottom:4px;"><b>${formatDate(closest.date)}</b></div>`;
      VIZ_COLUMNS.forEach((colNum, i) => {
        const val = closest.values[`col${colNum}`];
        if (val !== undefined && val !== null && !isNaN(val)) {
          const color = colors[i];
          const label = labels[i];
          html += `
            <div style="white-space:nowrap;line-height:1.25;">
              <span style="display:inline-block;width:10px;height:10px;background:${color};margin-right:6px;"></span>
              ${label}: <b>${val}</b>
            </div>`;
        }
      });

      tooltip.innerHTML = html;
      tooltip.style.left = (event.pageX + 16) + "px";
      tooltip.style.top  = (event.pageY - 30) + "px";
      tooltip.style.opacity = 1;
    })
    .on("mouseleave", function () {
      guideline.style("opacity", 0);
      tooltip.style.opacity = 0;
    });
}
