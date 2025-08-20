// ============================================================
// utils.js
// Utilidades compartidas: formateo, truncado a ancho, búsqueda.
// ============================================================

// --- Formateador de fecha centralizado (ej: "Jan 2024") ---
export const formatDate = d3.timeFormat("%b %Y");

/**
 * truncateTextToWidth
 * Crea/actualiza un nodo <text> con contenido truncado con "…" si excede un ancho.
 * - textSel: d3 selection del <text> (ya insertado)
 * - fullText: string original
 * - maxWidth: ancho máximo en px
 */
export function truncateTextToWidth(textSel, fullText, maxWidth) {
  textSel.text(fullText);
  const node = textSel.node();
  if (!node) return;
  if (node.getComputedTextLength() <= maxWidth) return;

  let truncated = fullText;
  while (truncated.length > 0 && node.getComputedTextLength() > maxWidth) {
    truncated = truncated.slice(0, -1);
    textSel.text(truncated + "…");
  }
}

/**
 * nearestByDate
 * Devuelve el objeto de data cuya fecha (propiedad .date) es más cercana a targetDate.
 */
export function nearestByDate(array, targetDate) {
  if (!array || !array.length) return null;
  let best = array[0];
  let bestDelta = Math.abs(array[0].date - targetDate);
  for (let i = 1; i < array.length; i++) {
    const delta = Math.abs(array[i].date - targetDate);
    if (delta < bestDelta) {
      best = array[i];
      bestDelta = delta;
    }
  }
  return best;
}
