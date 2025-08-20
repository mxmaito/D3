// ============================================================
// axes.js
// Renderiza eje X e Y, aplica rotación/offset a labels y
// agrega etiquetas manuales a los extremos del eje X.
// ============================================================

import {
  FONT_FAMILY, LABEL_FONT_SIZE, LABEL_FONT_WEIGHT,
  X_AXIS_Y, X_AXIS_LABEL_OFFSET, X_AXIS_LABEL_ROTATION,
  X_AXIS_TICKS, X_AXIS_TICKS_VALUES,
  Y_AXIS_TICKS, Y_AXIS_TICKS_VALUES,
  X_AXIS_EXTREME_LEFT_NUDGE, X_AXIS_EXTREME_RIGHT_NUDGE
} from "./config.js";

import { formatDate } from "./utils.js";

/**
 * renderAxes
 * - g: grupo principal
 * - xScale, yScale
 * - xDomain: [minDate, maxDate]
 * - Retorna: xGridTicks (para gridlines verticales)
 */
export function renderAxes(g, xScale, yScale, xDomain) {
  // Eje X: ticks manuales u automáticos
  let xGridTicks, xAxis;
  if (X_AXIS_TICKS_VALUES && Array.isArray(X_AXIS_TICKS_VALUES)) {
    xGridTicks = X_AXIS_TICKS_VALUES.slice();
    if (+xGridTicks[0] !== +xDomain[0]) xGridTicks.unshift(xDomain[0]);
    if (+xGridTicks.at(-1) !== +xDomain[1]) xGridTicks.push(xDomain[1]);
    xAxis = d3.axisBottom(xScale).tickValues(xGridTicks).tickFormat(formatDate);
  } else {
    xAxis = d3.axisBottom(xScale).ticks(X_AXIS_TICKS || undefined).tickFormat(formatDate);
    xGridTicks = xScale.ticks(X_AXIS_TICKS || undefined);
  }

  // Grupo del eje X a la altura definida (mueve línea y ticks, no los labels)
  const xAxisGroup = g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${X_AXIS_Y})`)
    .call(xAxis);

  // Desplazar y rotar SOLO los labels (centrales)
  xAxisGroup.selectAll("text")
    .attr("transform", `translate(0, ${X_AXIS_LABEL_OFFSET}) rotate(${X_AXIS_LABEL_ROTATION})`)
    .style("text-anchor", "end")
    .style("font-size", LABEL_FONT_SIZE)
    .style("font-weight", LABEL_FONT_WEIGHT)
    .style("fill", "#666")
    .style("font-family", FONT_FAMILY);

  // Extremos manuales (dentro de xAxisGroup, con nudge horizontal)
  xAxisGroup.append("text")
    .attr("class", "x-axis-extreme")
    .attr("x", xScale(xDomain[0]) + X_AXIS_EXTREME_LEFT_NUDGE)
    .attr("y", X_AXIS_LABEL_OFFSET + 12)
    .attr("text-anchor", "end")
    .style("font-size", LABEL_FONT_SIZE)
    .style("font-family", FONT_FAMILY)
    .style("fill", "#666")
    .text(formatDate(xDomain[0]));

  xAxisGroup.append("text")
    .attr("class", "x-axis-extreme")
    .attr("x", xScale(xDomain[1]) + X_AXIS_EXTREME_RIGHT_NUDGE)
    .attr("y", X_AXIS_LABEL_OFFSET + 12)
    .attr("text-anchor", "end")
    .style("font-size", LABEL_FONT_SIZE)
    .style("font-family", FONT_FAMILY)
    .style("fill", "#666")
    .text(formatDate(xDomain[1]));

  // Eje Y: manual o automático
  const yAxis = Y_AXIS_TICKS_VALUES && Array.isArray(Y_AXIS_TICKS_VALUES)
    ? d3.axisLeft(yScale).tickValues(Y_AXIS_TICKS_VALUES)
    : d3.axisLeft(yScale).ticks(Y_AXIS_TICKS || undefined);

  g.append("g")
    .attr("class", "y-axis")
    .call(yAxis)
    .selectAll("text")
    .style("font-size", LABEL_FONT_SIZE)
    .style("font-weight", LABEL_FONT_WEIGHT)
    .style("fill", "#666")
    .style("font-family", FONT_FAMILY);

  return xGridTicks;
}
