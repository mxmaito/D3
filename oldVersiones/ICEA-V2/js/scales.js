// ============================================================
// scales.js
// Crea escalas X/Y a partir de los datos preparados y límites manuales.
// ============================================================

import {
  CHART_WIDTH, CHART_HEIGHT,
  X_AXIS_MIN, X_AXIS_MAX, Y_AXIS_MIN, Y_AXIS_MAX
} from "./config.js";

/**
 * createScales
 * - Recibe preparedData.data (arreglo de {date, values:{colN: number}})
 * - Retorna xScale, yScale y xDomain aplicado.
 */
export function createScales(preparedArray, valueColumns = null) {
  // Dominio X (tiempo)
  const xDomain = d3.extent(preparedArray, d => d.date);
  if (X_AXIS_MIN != null) xDomain[0] = X_AXIS_MIN;
  if (X_AXIS_MAX != null) xDomain[1] = X_AXIS_MAX;
  const xScale = d3.scaleTime().domain(xDomain).range([0, CHART_WIDTH]);

  // Dominio Y (numérico) considerando todas las series visibles
  const cols = valueColumns ?? Object.keys(preparedArray[0]?.values ?? {});
  const allValues = [];
  preparedArray.forEach(row => {
    cols.forEach(k => {
      const v = row.values[k];
      if (v != null && !isNaN(v)) allValues.push(v);
    });
  });

  let yDomain = d3.extent(allValues);
  if (Y_AXIS_MIN != null) yDomain[0] = Y_AXIS_MIN;
  if (Y_AXIS_MAX != null) yDomain[1] = Y_AXIS_MAX;

  const yScale = d3.scaleLinear().domain(yDomain).nice().range([CHART_HEIGHT, 0]);

  return { xScale, yScale, xDomain, yDomain };
}
