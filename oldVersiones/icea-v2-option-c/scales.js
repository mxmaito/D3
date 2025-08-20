// ============================================================
// scales.js — Build x/y scales based on data + config
// ============================================================

export function createScales(data, columns, innerWidth, innerHeight) {
  // X: time scale from min/max date across rows
  const x = d3.scaleTime()
    .domain(d3.extent(data, d => d.date))
    .range([0, innerWidth]);

  // Y: numeric domain considering all series
  const yExtent = columns.reduce((acc, c) => {
    for (const d of data) {
      const v = d[c.key];
      if (v == null || Number.isNaN(v)) continue;
      acc[0] = Math.min(acc[0], v);
      acc[1] = Math.max(acc[1], v);
    }
    return acc;
  }, [Infinity, -Infinity]);

  const y = d3.scaleLinear()
    .domain(yExtent[0] === Infinity ? [0, 1] : yExtent)
    .nice()
    .range([innerHeight, 0]);

  return { x, y };
}
