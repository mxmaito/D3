// ============================================================
// main.js — Bootstraps the visualization with sample data
// ============================================================
import { visualizeData } from './visualization.js';
import { VIZ_COLUMNS } from './config.js';

(async function main() {
  const data = await loadSample();

  if (VIZ_COLUMNS.length === 0) {
    throw new Error('Please define VIZ_COLUMNS in config.js');
  }

  visualizeData({
    container: '#visualization',
    data,
    columns: VIZ_COLUMNS,
    title: 'ICEA — Multi-Series Time Lines',
  });
})();

async function loadSample() {
  // Synthetic dataset with daily cadence for ~60 days
  const start = d3.timeDay.offset(new Date(2025, 0, 1), 0);
  const days = d3.range(0, 60).map(i => d3.timeDay.offset(start, i));
  return days.map((date, i) => ({
    date,
    col1: 50 + 10*Math.sin(i/6),
    col2: 40 + 12*Math.cos(i/9),
    col3: i % 7 === 0 ? null : 55 + 8*Math.sin(i/12 + 1.2), // some gaps
  }));
}
