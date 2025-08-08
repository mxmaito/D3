const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSc7Lss59TkKCCtT68RGxLwCuvCAzNFP0qfIeYy_Pf_yIJ4MyRBk_r6-qsk_cgItkEMB838GI6-9jYb/pub?gid=0&single=true&output=csv';

// Función para renderizar (dibujar) el gráfico dentro del div#chart
function renderChart() {
  console.log("[main.js] Llamando a renderChart()");
  const chartDiv = document.getElementById('chart');
  chartDiv.innerHTML = '';  // Limpia el gráfico anterior si existe
  const svgNode = window.createVisualization();  // Usa window para asegurar el scope global
  console.log("[main.js] svgNode devuelto por createVisualization:", svgNode);
  if (svgNode) chartDiv.appendChild(svgNode);
  else console.warn("[main.js] svgNode es null; no se agregó nada al chart.");
}

// Carga los datos desde Google Sheets y los prepara
d3.csv(csvUrl).then(rawData => {
  console.log("[main.js] Datos CSV descargados:", rawData);
  window.data = rawData;  // Deja los datos crudos en variable global
  window.preparedData = window.prepareData(window.data); // Prepara los datos para graficar
console.log("DEBUG preparedData:", window.preparedData);
if (!window.preparedData || !window.preparedData.data || window.preparedData.count === 0) {
  console.error("❌ Datos preparados no válidos:", window.preparedData);
}  renderChart();  // Dibuja el gráfico con los datos listos
}).catch(error => {
  console.error("[main.js] Error al descargar o procesar CSV:", error);
  const chartDiv = document.getElementById('chart');
  chartDiv.innerHTML = '❌ Error al cargar los datos.';
});

// Hace que el gráfico sea responsive (se vuelve a dibujar si cambia el tamaño de la ventana)
window.addEventListener('resize', () => {
  console.log("[main.js] Evento resize detectado. Redibujando gráfico.");
  renderChart();
});