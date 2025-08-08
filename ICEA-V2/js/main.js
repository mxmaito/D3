// ================================
// main.js
// Ejecuta el pipeline de análisis y visualización
// ================================
import { loadData, inspectData, prepareData, inspectPreparedData } from "./data.js";
import { visualizeData } from "./visualization.js";

// Display function global (para todos los módulos)
window.display = function(msg, type = "log") {
  const viz = document.getElementById('visualization');
  if (type === "log") console.log(msg);
  if (type === "visualization" && msg instanceof Node) viz.appendChild(msg);
};

async function main() {
  const rawData = await loadData();
  inspectData(rawData);
  const preparedData = prepareData(rawData);
  visualizeData(preparedData, rawData);
  inspectPreparedData(preparedData);
}

main();
