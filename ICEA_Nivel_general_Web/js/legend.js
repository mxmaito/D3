//----------------------------------
// js/legend.js — Multi-column legend (per-column widths + word wrap)
//----------------------------------
// Config local: elegí 1, 2 o 3 columnas SIN depender de config.js
// Podés definir anchos distintos por COLUMNA y el texto hace wrap
// automáticamente dentro de cada columna.

import { COLOR, STYLES, SHOW_LEGEND } from './config.js';

// ✅ Cambiá este valor a 1, 2 o 3
const LEGEND_COLUMNS_OVERRIDE = 1;

// Layout por cantidad de columnas (colWidth puede ser número o array por-columna)
// colGap puede ser número (igual para todos) o array de (cols-1) longitudes
const LAYOUT_CONFIG = {
  1: { colWidth: 700,                colGap: 0 },
  2: { colWidth: [200, 160],         colGap: 24 },
  3: { colWidth: [200, 210, 200],    colGap: [18, 18] },
};

// Constantes de layout/texto
const ITEM_MIN_HEIGHT = 22;   // altura mínima de un item
const ROW_GAP = 2;            // separación vertical entre filas (px)
const TEXT_X = 18;            // offset del texto dentro del item (a la derecha del swatch)
const TEXT_LINE_DY = 1.1;     // multiplicador de interlínea para tspan

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
function toInt(v, def = 1) { const n = Number(v); return Number.isFinite(n) ? Math.trunc(n) : def; }

function getLayoutForCols(cols) {
  const cfg = LAYOUT_CONFIG[cols] || LAYOUT_CONFIG[1];
  // Normalizar widths a array de longitud = cols
  let widths = Array.isArray(cfg.colWidth)
    ? cfg.colWidth.slice(0, cols)
    : Array(cols).fill(Number(cfg.colWidth || 160));
  if (widths.length < cols) {
    const last = widths.length ? widths[widths.length - 1] : 160;
    while (widths.length < cols) widths.push(last);
  }
  // Normalizar gaps a array de longitud = cols-1
  let gaps;
  if (Array.isArray(cfg.colGap)) {
    gaps = cfg.colGap.slice(0, Math.max(0, cols - 1));
    const last = gaps.length ? gaps[gaps.length - 1] : 0;
    while (gaps.length < Math.max(0, cols - 1)) gaps.push(last);
  } else {
    gaps = Array(Math.max(0, cols - 1)).fill(Number(cfg.colGap || 0));
  }
  return { widths, gaps };
}

function xOffsetForCol(colIndex, widths, gaps) {
  let x = 0;
  for (let c = 0; c < colIndex; c++) {
    x += widths[c];
    if (c < gaps.length) x += gaps[c];
  }
  return x;
}

// —— Word wrap para <text> usando <tspan> ————————————————
function wrapText(textSel, maxWidth) {
  textSel.each(function () {
    const text = d3.select(this);
    const raw = text.text();
    const words = raw.split(/\s+/).filter(Boolean);
    text.text(null);

    let line = [];
    let tspan = text.append('tspan')
      .attr('x', TEXT_X)
      .attr('dy', '0.32em');

    words.forEach((word, idx) => {
      line.push(word);
      tspan.text(line.join(' '));
      if (tspan.node().getComputedTextLength() > maxWidth) {
        // La palabra actual no entra, cerramos la línea anterior
        line.pop();
        tspan.text(line.join(' '));
        // Nueva línea con la palabra que no entró
        line = [word];
        tspan = text.append('tspan')
          .attr('x', TEXT_X)
          .attr('dy', `${TEXT_LINE_DY}em`)
          .text(word);
      }
    });
  });
}

export function addLegend(host, columns, state, bus) {
  if (!SHOW_LEGEND) return { sync: () => {} };

  const layer = host.append('g').attr('class', 'legend');

  // Determinar cantidad de columnas efectiva (1..3)
  const colsCount = clamp(toInt(LEGEND_COLUMNS_OVERRIDE, 1), 1, 3);
  const { widths, gaps } = getLayoutForCols(colsCount);

  // Primero creamos un grupo por item (posición preliminar)
  const items = layer
    .selectAll('g.legend-item')
    .data(columns)
    .join('g')
    .attr('class', 'legend-item')
    .attr('tabindex', 0)
    .style('cursor', 'pointer')
    .on('mouseenter', (_, d) => bus.call('hover', null, d.key))
    .on('mouseleave', () => bus.call('leave', null))
    .on('click', (_, d) => {
      const key = d.key;
      // toggle local del estado de visibilidad
      if (!state.visible) state.visible = {};
      state.visible[key] = !(state.visible[key] === false);

      // eventos para que el resto sincronice
      if (bus) {
        bus.call('toggle', null, key);          // lo que ya tenías
        bus.call('toggle.labels', null, key);   // ← para labels.js
        bus.call('toggle.tooltip', null, key);  // ← para tooltip.js (cierra/refresca)
      }
    })
    .on('keydown', (event, d) => { if (event.key === 'Enter' || event.key === ' ') bus.call('toggle', null, d.key); });

  // Swatch y texto
  items.append('rect')
    .attr('width', 12)
    .attr('height', 12)
    .attr('y', -7)
    .attr('rx', 2)
    .attr('fill', d => COLOR(d.key));

  items.append('text')
    .attr('x', TEXT_X)
    .attr('dy', '0.32em')
    .attr('font-family', STYLES.FONT_FAMILY)
    .attr('font-size', 12)
    .text(d => d.label ?? d.key);

  // —— Wrap del texto según el ancho real de CADA columna ——
  items.each(function (d, i) {
    const col = i % colsCount;
    const maxTextW = Math.max(0, widths[col] - TEXT_X - 2); // 2px de respiro
    const textSel = d3.select(this).select('text');
    wrapText(textSel, maxTextW);
  });

  // Medimos alto resultante de cada item (tras el wrap)
  const itemHeights = [];
  items.each(function (d, i) {
    const bbox = this.getBBox();
    itemHeights[i] = Math.max(ITEM_MIN_HEIGHT, bbox.height);
  });

  // Calculamos altura por fila (máximo de sus columnas)
  const rows = Math.ceil(columns.length / colsCount);
  const rowHeights = new Array(rows).fill(0);
  for (let i = 0; i < columns.length; i++) {
    const row = Math.floor(i / colsCount);
    rowHeights[row] = Math.max(rowHeights[row], itemHeights[i]);
  }

  // Prefijos acumulados (y-offset por fila)
  const yOffsets = new Array(rows).fill(0);
  for (let r = 1; r < rows; r++) {
    yOffsets[r] = yOffsets[r - 1] + rowHeights[r - 1] + ROW_GAP;
  }

  // Posición final de cada item usando: x por columna variable + y por fila acumulada
  items.attr('transform', (d, i) => {
    const col = i % colsCount;
    const row = Math.floor(i / colsCount);
    const x = xOffsetForCol(col, widths, gaps);
    const y = yOffsets[row];
    return `translate(${x}, ${y})`;
  });

  function sync() {
    items.attr('opacity', d => (state.visible[d.key] ? 1 : 0.4));
  }
  sync();

  return { sync };
}
