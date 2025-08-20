// ============================================================
// axes-and-grid.js
// Combina funciones de ejes y grillas en un solo módulo.
// Exporta: renderAxes, drawGridlines
// ============================================================

import { STYLES, TICKS, Y_AXIS_FORMAT } from "./config.js";

/**
 * Renderiza los ejes X e Y dentro del grupo `g`.
 * @param {d3.Selection} g - Grupo SVG principal donde se dibujan los ejes.
 * @param {d3.Scale} x - Escala para el eje X.
 * @param {d3.Scale} y - Escala para el eje Y.
 * @param {number} innerWidth - Ancho interno del chart.
 * @param {number} innerHeight - Alto interno del chart.
 */
export function renderAxes(g, x, y, innerWidth, innerHeight) {
  // Eje X
  g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x).ticks(TICKS.X_NUM));

  // Eje Y (usa formato independiente definido en config.js → Y_AXIS_FORMAT)
  g.append('g')
    .attr('class', 'y-axis')
    .call(
      d3.axisLeft(y)
        .ticks(TICKS.Y_NUM)
        .tickFormat(Y_AXIS_FORMAT)
    );
}

/**
 * Dibuja líneas de grilla horizontales y verticales.
 * @param {d3.Selection} g - Grupo SVG principal donde se dibuja la grilla.
 * @param {d3.Scale} x - Escala para el eje X.
 * @param {d3.Scale} y - Escala para el eje Y.
 * @param {number} innerWidth - Ancho interno del chart.
 * @param {number} innerHeight - Alto interno del chart.
 */
export function drawGridlines(g, x, y, innerWidth, innerHeight) {
  // Grid horizontal (sobre eje Y)
  g.append('g')
    .attr('class', 'y-grid')
    .call(
      d3.axisLeft(y)
        .ticks(TICKS.Y_NUM)
        .tickSize(-innerWidth)
        .tickFormat('')
    )
    .call(s => s.selectAll('line').attr('stroke', STYLES.GRID_COLOR))
    .call(s => s.selectAll('path').remove());

  // Grid vertical (sobre eje X)
  g.append('g')
    .attr('class', 'x-grid')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(
      d3.axisBottom(x)
        .ticks(TICKS.X_NUM)
        .tickSize(-innerHeight)
        .tickFormat('')
    )
    .call(s => s.selectAll('line').attr('stroke', STYLES.GRID_COLOR))
    .call(s => s.selectAll('path').remove());
}
