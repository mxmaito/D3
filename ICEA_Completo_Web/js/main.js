import { visualizeData } from './visualization.js';
import { VIZ_COLUMNS } from './config.js';
import { loadDataFromConfig } from './data.js';

(async function main() {
  const data = await loadDataFromConfig();
  if (!Array.isArray(data) || !data.length) {
    throw new Error('No data loaded. Check DATA_CONFIG in config.js');
  }
  visualizeData({
    container: '#visualization',
    data,
    columns: VIZ_COLUMNS,
    title: '',
  });
})();
