// =======================================
// SECTION 3: DATA VISUALIZATION (D3.js)
// =======================================

// Configuración de columnas, etiquetas, colores y estilos del gráfico
const VIZ_COLUMNS = [2, 3];  // Columnas a graficar (ajustar si es necesario)
const CUSTOM_LABELS = null;  // Nombres de series (null = automático)
const CUSTOM_COLORS = null;
const LINE_WIDTH = 2;
const LINE_STYLE = "solid";
const LINE_OPACITY = 1.0;
const MARKER_SIZE = 4;
const SHOW_MARKERS = true;

// Devuelve el label a mostrar para la columna/serie
function getColumnLabel(colNum, index) {
  // Si hay etiquetas personalizadas, usarlas
  if (CUSTOM_LABELS && Array.isArray(CUSTOM_LABELS) &&
      CUSTOM_LABELS.length === VIZ_COLUMNS.length &&
      CUSTOM_LABELS[index]) {
    return CUSTOM_LABELS[index];
  }
  // Si no, toma el nombre original de la columna
  const columnNames = Object.keys(window.data[0]);
  return columnNames[colNum - 1] || `Column ${colNum}`;
}

// Función principal de visualización
function createVisualization() {
  console.log("[createVisualization] Iniciando visualización.");
  // Verifica si hay datos preparados y válidos
  if (!preparedData || preparedData.count === 0) {
    display("❌ No prepared data available for visualization");
    console.warn("[createVisualization] No hay datos preparados o count = 0");
    return null;
  }
  console.log("[createVisualization] preparedData:", preparedData);

  // Responsive: obtiene el tamaño real del contenedor
  const container = document.getElementById('chart');
  const containerWidth = container ? container.offsetWidth : window.innerWidth;
  const containerHeight = container ? container.offsetHeight : Math.round(window.innerHeight * 0.8);

  const margin = { top: 20, right: 80, bottom: 40, left: 60 };
  const width = containerWidth - margin.left - margin.right;
  const height = containerHeight - margin.top - margin.bottom;
  console.log(`[createVisualization] width: ${width}, height: ${height}`);

  // Crea el SVG con viewBox para que sea responsive
  const svg = d3.create("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet");
  console.log("[createVisualization] SVG creado.");

  // Grupo principal del gráfico (todo adentro de márgenes)
  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Extrae el array de datos listos
  const vizData = preparedData.data;
  console.log("[createVisualization] vizData:", vizData);

  // Escala X (tiempo, fechas)
  const xScale = d3.scaleTime()
    .domain(d3.extent(vizData, d => d.date))
    .range([0, width]);

  // Prepara todos los valores para la escala Y
  let allValues = [];
  VIZ_COLUMNS.forEach(colNum => {
    const colKey = `col${colNum}`;
    const values = vizData.map(d => d.values[colKey]).filter(v => v !== null);
    allValues = allValues.concat(values);
    console.log(`[createVisualization] Columna ${colNum} valores:`, values);
  });

  // Escala Y
  const yScale = d3.scaleLinear()
    .domain(d3.extent(allValues)).nice()
    .range([height, 0]);

  // Generador de líneas
  const line = d3.line()
    .x(d => xScale(d.date))
    .y((d, i, arr) => {
      const colKey = arr.colKey;
      return yScale(d.values[colKey]);
    })
    .defined(d => d.values[d.colKey] !== null);

  // Define el estilo de línea según configuración
  let strokeDasharray = "none";
  if (LINE_STYLE === "dashed") strokeDasharray = "5,5";
  else if (LINE_STYLE === "dotted") strokeDasharray = "2,2";

  // Paleta de colores (por defecto, 10 colores)
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  // Dibuja cada serie/columna seleccionada
  VIZ_COLUMNS.forEach((colNum, index) => {
    const colKey = `col${colNum}`;
    const color = CUSTOM_COLORS && CUSTOM_COLORS[index] ? CUSTOM_COLORS[index] : colorScale(index);
    const label = getColumnLabel(colNum, index);

    // Filtra valores nulos para esta columna
    const columnData = vizData.filter(d => d.values[colKey] !== null);
    columnData.colKey = colKey;
    console.log(`[createVisualization] Serie ${label}, datos:`, columnData);

    // Dibuja la línea
    g.append("path")
      .datum(columnData)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", LINE_WIDTH)
      .attr("stroke-dasharray", strokeDasharray)
      .attr("opacity", LINE_OPACITY)
      .attr("d", line);

    // Dibuja los puntos/markers si está habilitado
    if (SHOW_MARKERS) {
      g.selectAll(`.marker-${index}`)
        .data(columnData)
        .enter().append("circle")
        .attr("class", `marker-${index}`)
        .attr("cx", d => xScale(d.date))
        .attr("cy", d => yScale(d.values[colKey]))
        .attr("r", MARKER_SIZE)
        .attr("fill", color)
        .attr("opacity", LINE_OPACITY);
    }

    // Leyenda para cada serie
    const legendY = 20 + index * 20;
    g.append("line")
      .attr("x1", width + 10)
      .attr("x2", width + 30)
      .attr("y1", legendY)
      .attr("y2", legendY)
      .attr("stroke", color)
      .attr("stroke-width", LINE_WIDTH)
      .attr("stroke-dasharray", strokeDasharray);

    g.append("text")
      .attr("x", width + 35)
      .attr("y", legendY)
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .text(label);
  });

  // Eje X (fecha)
  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale));

  // Eje Y (valor)
  g.append("g")
    .call(d3.axisLeft(yScale));

  // Etiqueta de eje Y (vertical)
  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Valor");

  // Etiqueta de eje X (horizontal)
  g.append("text")
    .attr("transform", `translate(${width / 2}, ${height + margin.bottom})`)
    .style("text-anchor", "middle")
    .text("Fecha");

  console.log("[createVisualization] SVG final:", svg.node());

  // Devuelve el nodo SVG para insertarlo en el DOM
  return svg.node();
}
