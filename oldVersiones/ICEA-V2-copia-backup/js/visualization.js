// ================================
// visualization.js
// Visualización de datos con D3.js (líneas de tiempo)
// ================================

/* ================================================================
 * CONFIGURACIÓN MANUAL DE LA VISUALIZACIÓN
 * Modificá estos valores para cambiar la visualización y el estilo.
 * ================================================================
 */
// --- Series a visualizar (números de columna 1-indexed) ---
export const VIZ_COLUMNS = [2, 3, 5];
// --- Título del gráfico ---
export const CHART_TITLE = "ICEA Data Vis";
// --- Personalización de etiquetas de las series (null para usar nombres originales) ---
export const CUSTOM_LABELS = null;
// --- Colores personalizados de las series (null para usar paleta por defecto) ---
export const CUSTOM_COLORS = null;
// --- Dimensiones y márgenes ---
export const CHART_WIDTH = 800;
export const CHART_HEIGHT = 400;
export const CHART_MARGINS = { top: 140, right: 160, bottom: 80, left: 60 };
// --- Límites manuales de los ejes (null para automático) ---
export const Y_AXIS_MIN = 0; // Ej: 0 o -10 o null para auto
export const Y_AXIS_MAX = null; // Ej: 100 o null para auto
export const X_AXIS_MIN = null; // Ej: new Date(2021, 0, 1) o null para auto
export const X_AXIS_MAX = null; // Ej: new Date(2024, 11, 31) o null para auto
// --- Paleta de colores por defecto ---
export const DEFAULT_COLORS = [
  "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
  "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"
];

// --- Fuente general para todos los elementos del gráfico ---
export const FONT_FAMILY = "Roboto Condensed, sans-serif";

// --- Estilo de título del gráfico ---
export const TITLE_FONT_SIZE = "20px";
export const TITLE_FONT_WEIGHT = "bold";

// --- Estilo de etiquetas de ejes (labels), valores y ticks ---
export const LABEL_FONT_SIZE = "13px";
export const LABEL_FONT_WEIGHT = "normal";
export const LABEL_FONT_WEIGHT_WITH_HOVER = "600";

// --- Estilo de la leyenda ---
export const LEGEND_FONT_SIZE = "12px";
export const LEGEND_FONT_WEIGHT = "400";
export const LEGEND_FONT_WEIGHT_WITH_HOVER = "600";

// --- Estilo del tooltip (si se usa) ---
export const TOOLTIP_FONT_SIZE = "14px";
export const TOOLTIP_FONT_WEIGHT = "normal";
export const TOOLTIP_BG_COLOR = "#fff";
export const TOOLTIP_TEXT_COLOR = "#222";
export const TOOLTIP_BORDER_COLOR = "#aaa";
export const TOOLTIP_BORDER_RADIUS = "6px";
export const TOOLTIP_PADDING = "7px 12px";
export const TOOLTIP_BOX_SHADOW = "0 2px 12px rgba(0,0,0,0.14)";

// --- Configuración de guideline ---
export const TOOLTIP_GUIDELINE_COLOR = "#888";
export const TOOLTIP_GUIDELINE_WIDTH = 1;
export const TOOLTIP_GUIDELINE_OPACITY = 0.4;

// --- Configuración de MARKERS (marcadores de los puntos de cada serie) ---
export const MARKER_SHAPE = "circle";       // Opciones: "circle", "square", "triangle"
export const MARKER_SIZE = 0;               // Radio o tamaño base, en píxeles
export const MARKER_FILL_OPACITY = 0.9;     // Opacidad del relleno del marker (0-1)

// --- Separación mínima entre labels de la derecha (líneas guía) ---
export const LABEL_MIN_DISTANCE = 22;       // en píxeles (recomendado 18-24)

// --- Mostrar líneas guía ("leader lines") entre el final de la serie y el label de la derecha ---
export const SHOW_LEADER_LINES = false;     // true: muestra líneas guía; false: solo labels

// --- Grosor de las líneas (en píxeles) ---
export const LINE_STROKE_WIDTH = 2;
export const LINE_STROKE_WIDTH_HOVER = 3; // (opcional, para hover)

// --- Cantidad o lista de ticks del eje Y ---
// Si Y_AXIS_TICKS_VALUES está definido (array de números), se usan esos valores.
// Si es null, se usan Y_AXIS_TICKS (número), y si ambos null, es automático.
export const Y_AXIS_TICKS = 6;
export const Y_AXIS_TICKS_VALUES = null; // Ejemplo: [0, 20, 50, 100] o null para automático

// --- Cantidad o lista de ticks del eje X ---
// Si X_AXIS_TICKS_VALUES está definido (array de fechas), se usan esos valores.
// Si es null, se usan X_AXIS_TICKS (número), y si ambos null, es automático.
export const X_AXIS_TICKS = 6; // Por ejemplo: 8, o null para automático
export const X_AXIS_TICKS_VALUES = null; // Ejemplo: [new Date(2023,0,1), new Date(2024,0,1)]

// --- Configuración de gridlines ---
export const SHOW_GRIDLINES = true;
export const GRIDLINE_COLOR = "#ccc";
export const GRIDLINE_OPACITY = 0.7;
export const GRIDLINE_HORIZONTAL_WIDTH = 1; // Grosor líneas horizontales
export const GRIDLINE_VERTICAL_WIDTH = 1;   // Grosor líneas verticales

// Altura donde se dibuja la línea del eje X (normalmente CHART_HEIGHT)
export const X_AXIS_Y = CHART_HEIGHT;

// Desplazamiento vertical SOLO de los labels del eje (px). Positivo = hacia abajo.
export const X_AXIS_LABEL_OFFSET = 5;

// Rotación (grados) de todos los labels del eje X
export const X_AXIS_LABEL_ROTATION = -45;

export const X_AXIS_EXTREME_LEFT_NUDGE  = -6;
export const X_AXIS_EXTREME_RIGHT_NUDGE =  6;





/* ================================================================
 * FUNCIÓN PRINCIPAL DE VISUALIZACIÓN
 * ================================================================
 */
export function visualizeData(preparedData, rawData) {
  // ======================================
  // SECCIÓN: INICIALIZACIÓN Y CHEQUEOS
  // ======================================
  const viz = document.getElementById('visualization');
  function display(msg, type = "log") {
    if (type === "log") console.log(msg);
    if (type === "visualization" && msg instanceof Node) viz.appendChild(msg);
  }

  if (!preparedData || preparedData.count === 0) {
    display("❌ No data available for visualization");
    return;
  }
  display("✅ Creating complete visualization...");

  // ======================================
  // SECCIÓN: CONFIGURACIÓN DE ESCALAS, COLORES Y ETIQUETAS
  // ======================================
  const vizData = preparedData.data;
  const colors = CUSTOM_COLORS && CUSTOM_COLORS.length >= VIZ_COLUMNS.length
    ? CUSTOM_COLORS.slice(0, VIZ_COLUMNS.length)
    : DEFAULT_COLORS.slice(0, VIZ_COLUMNS.length);
  const labels = CUSTOM_LABELS && CUSTOM_LABELS.length >= VIZ_COLUMNS.length
    ? CUSTOM_LABELS.slice(0, VIZ_COLUMNS.length)
    : VIZ_COLUMNS.map(colNum => {
        const colName = Object.keys(rawData[0])[colNum - 1];
        return colName || `Column ${colNum}`;
      });

  // Escala de tiempo para eje X con límites opcionales
  const xDomain = d3.extent(vizData, d => d.date);
  if (X_AXIS_MIN !== null && X_AXIS_MIN !== undefined) xDomain[0] = X_AXIS_MIN;
  if (X_AXIS_MAX !== null && X_AXIS_MAX !== undefined) xDomain[1] = X_AXIS_MAX;

  const xScale = d3.scaleTime()
    .domain(xDomain)
    .range([0, CHART_WIDTH]);

  // Escala lineal para eje Y con límites opcionales
  let allValues = [];
  VIZ_COLUMNS.forEach(colNum => {
    const columnValues = vizData
      .map(d => d.values[`col${colNum}`])
      .filter(v => v !== null && v !== undefined && !isNaN(v));
    allValues = allValues.concat(columnValues);
  });
  let yDomain = d3.extent(allValues);
  if (Y_AXIS_MIN !== null && Y_AXIS_MIN !== undefined) yDomain[0] = Y_AXIS_MIN;
  if (Y_AXIS_MAX !== null && Y_AXIS_MAX !== undefined) yDomain[1] = Y_AXIS_MAX;

  const yScale = d3.scaleLinear()
    .domain(yDomain)
    .nice()
    .range([CHART_HEIGHT, 0]);

  // ======================================
  // SECCIÓN: CREACIÓN DEL SVG Y ESTRUCTURA BÁSICA
  // ======================================
  const svg = d3.create("svg")
    .attr("width", CHART_WIDTH + CHART_MARGINS.left + CHART_MARGINS.right)
    .attr("height", CHART_HEIGHT + CHART_MARGINS.top + CHART_MARGINS.bottom)
    .style("background-color", "#fff")
    .style("border", "1px solid #ddd")
    .style("font-family", FONT_FAMILY);

  const g = svg.append("g")
    .attr("transform", `translate(${CHART_MARGINS.left},${CHART_MARGINS.top})`);

  // Título del gráfico
  svg.append("text")
    .attr("x", (CHART_WIDTH + CHART_MARGINS.left + CHART_MARGINS.right) / 2)
    .attr("y", 40)
    .attr("text-anchor", "middle")
    .style("font-size", TITLE_FONT_SIZE)
    .style("font-weight", TITLE_FONT_WEIGHT)
    .style("fill", "#333")
    .style("font-family", FONT_FAMILY)
    .text(CHART_TITLE);

  // Leyenda de series (grupo contenedor)
  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${CHART_MARGINS.left}, 50)`);
  const legendItemWidth = CHART_WIDTH / VIZ_COLUMNS.length;

// ======================================
// SECCIÓN: CREACIÓN DE EJES
// ======================================
let xAxis;
let xGridTicks;
if (X_AXIS_TICKS_VALUES && Array.isArray(X_AXIS_TICKS_VALUES)) {
  // Incluye siempre extremos
  xGridTicks = X_AXIS_TICKS_VALUES.slice();
  const minDate = xScale.domain()[0];
  const maxDate = xScale.domain()[1];
  if (+xGridTicks[0] !== +minDate) xGridTicks = [minDate, ...xGridTicks];
  if (+xGridTicks[xGridTicks.length - 1] !== +maxDate) xGridTicks = [...xGridTicks, maxDate];

  xAxis = d3.axisBottom(xScale)
    .tickValues(xGridTicks)
    .tickFormat(d3.timeFormat("%b %Y"));
} else {
  xAxis = d3.axisBottom(xScale)
    .tickFormat(d3.timeFormat("%b %Y"))
    .ticks(X_AXIS_TICKS || undefined);

  xGridTicks = xScale.ticks(X_AXIS_TICKS || undefined);
}

// 1) Dibujo del eje X: mover SOLO el grupo del eje a la altura fija del eje
const xAxisGroup = g.append("g")
  .attr("class", "x-axis")
  .attr("transform", `translate(0,${X_AXIS_Y})`)   // <<-- ALTURA DEL EJE (línea). NO TOCAR PARA MOVER LABELS
  .call(xAxis);

// 2) Aplicar desplazamiento y rotación SOLO a los labels (centrales):
xAxisGroup.selectAll("text")
  .attr("transform", `translate(0, ${X_AXIS_LABEL_OFFSET}) rotate(${X_AXIS_LABEL_ROTATION})`)
  .style("text-anchor", "end")
  .style("font-size", LABEL_FONT_SIZE)
  .style("font-weight", LABEL_FONT_WEIGHT)
  .style("fill", "#666")
  .style("font-family", FONT_FAMILY);

// 3) Etiquetas manuales para primer y último valor, DENTRO del mismo grupo del eje
const formatX = d3.timeFormat("%b %Y");
const xPos0 = xScale(xDomain[0]);
const xPos1 = xScale(xDomain[1]);

// Primer extremo
xAxisGroup.append("text")                          // <<-- IMPORTANTE: en xAxisGroup, no en g
  .attr("class", "x-axis-extreme")
  .attr("x", xPos0)
  .attr("y", 0)                                   // y=0 porque el grupo ya está en X_AXIS_Y
  .attr("text-anchor", "end")
  .attr("transform", `translate(0, ${X_AXIS_LABEL_OFFSET+12}) rotate(${X_AXIS_LABEL_ROTATION},${xPos0},0)`)
  .style("font-size", LABEL_FONT_SIZE)
  .style("font-weight", LABEL_FONT_WEIGHT)
  .style("font-family", FONT_FAMILY)
  .style("fill", "#666")
  .text(formatX(xDomain[0]));

// Último extremo
xAxisGroup.append("text")
  .attr("class", "x-axis-extreme")
  .attr("x", xPos1)
  .attr("y", 0)
  .attr("text-anchor", "end")
  .attr("transform", `translate(0, ${X_AXIS_LABEL_OFFSET+12}) rotate(${X_AXIS_LABEL_ROTATION},${xPos1},0)`)
  .style("font-size", LABEL_FONT_SIZE)
  .style("font-weight", LABEL_FONT_WEIGHT)
  .style("font-family", FONT_FAMILY)
  .style("fill", "#666")
  .text(formatX(xDomain[1]));



    let yAxis;
    if (Y_AXIS_TICKS_VALUES && Array.isArray(Y_AXIS_TICKS_VALUES)) {
    yAxis = d3.axisLeft(yScale)
        .tickValues(Y_AXIS_TICKS_VALUES);
    } else {
    yAxis = d3.axisLeft(yScale)
        .ticks(Y_AXIS_TICKS || undefined);
    }

  g.append("g")
    .attr("class", "y-axis")
    .call(yAxis)
    .selectAll("text")
    .style("font-size", LABEL_FONT_SIZE)
    .style("font-weight", LABEL_FONT_WEIGHT)
    .style("fill", "#666")
    .style("font-family", FONT_FAMILY);
    

  // Etiquetas de eje Y y eje X
  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - CHART_MARGINS.left)
    .attr("x", 0 - (CHART_HEIGHT / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-size", LABEL_FONT_SIZE)
    .style("font-weight", LABEL_FONT_WEIGHT)
    .style("fill", "#666")
    .style("font-family", FONT_FAMILY)
    .text("Value");

  g.append("text")
    .attr("transform", `translate(${CHART_WIDTH / 2}, ${CHART_HEIGHT + CHART_MARGINS.bottom - 10})`)
    .style("text-anchor", "middle")
    .style("font-size", LABEL_FONT_SIZE)
    .style("font-weight", LABEL_FONT_WEIGHT)
    .style("fill", "#666")
    .style("font-family", FONT_FAMILY)
    .text("Date");

    // ======================================
  // SECCIÓN: GRIDLINES (opcional)
  // ======================================
    if (SHOW_GRIDLINES) {
    // Gridlines horizontales (paralelas al eje X, sobre ticks del eje Y)
    g.selectAll(".y-gridline")
    .data(
        Y_AXIS_TICKS_VALUES && Array.isArray(Y_AXIS_TICKS_VALUES)
        ? Y_AXIS_TICKS_VALUES
        : yScale.ticks(Y_AXIS_TICKS || undefined)
           )
        .join("line")
        .attr("class", "y-gridline")
        .attr("x1", 0)
        .attr("x2", CHART_WIDTH)
        .attr("y1", d => yScale(d))
        .attr("y2", d => yScale(d))
        .attr("stroke", GRIDLINE_COLOR)
        .attr("stroke-width", GRIDLINE_HORIZONTAL_WIDTH)
        .attr("opacity", GRIDLINE_OPACITY)
        .lower();
        

    // Gridlines verticales (paralelas al eje Y, sobre ticks del eje X)
    g.selectAll(".x-gridline")
        .data(xGridTicks)
        .join("line")
        .attr("class", "x-gridline")
        .attr("y1", 0)
        .attr("y2", CHART_HEIGHT)
        .attr("x1", d => xScale(d))
        .attr("x2", d => xScale(d))
        .attr("stroke", GRIDLINE_COLOR)
        .attr("stroke-width", GRIDLINE_VERTICAL_WIDTH)
        .attr("opacity", GRIDLINE_OPACITY)
        .lower();
    }
  

  // ======================================
  // SECCIÓN: GENERADOR Y DIBUJO DE LÍNEAS
  // ======================================
  const line = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.value))
    .defined(d => d.value !== null && d.value !== undefined && !isNaN(d.value))
    .curve(d3.curveMonotoneX);

  const lineElements = [];
  VIZ_COLUMNS.forEach((colNum, index) => {
    const columnData = vizData.map(d => ({
      date: d.date,
      value: d.values[`col${colNum}`]
    })).filter(d => d.value !== null && d.value !== undefined && !isNaN(d.value));
    if (columnData.length > 0) {
      const lineElement = g.append("path")
        .datum(columnData)
        .attr("fill", "none")
        .attr("stroke", colors[index])
        .attr("stroke-width", LINE_STROKE_WIDTH)
        .attr("d", line);
      lineElements.push(lineElement);
    }
  });

  // ======================================
  // SECCIÓN: DIBUJO DE MARKERS EN LOS PUNTOS DE LAS LÍNEAS
  // ======================================
  VIZ_COLUMNS.forEach((colNum, index) => {
    const columnData = vizData.map(d => ({
      date: d.date,
      value: d.values[`col${colNum}`]
    })).filter(d => d.value !== null && d.value !== undefined && !isNaN(d.value));

    if (columnData.length > 0) {
      const markerGroup = g.append("g").attr("class", `markers markers-${index}`);

      columnData.forEach(d => {
        const x = xScale(d.date);
        const y = yScale(d.value);
        const color = colors[index];

        if (MARKER_SHAPE === "circle") {
          markerGroup.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", MARKER_SIZE)
            .attr("fill", color)
            .attr("fill-opacity", MARKER_FILL_OPACITY)
            .attr("stroke", "#fff")
            .attr("stroke-width", 1);
        } else if (MARKER_SHAPE === "square") {
          markerGroup.append("rect")
            .attr("x", x - MARKER_SIZE)
            .attr("y", y - MARKER_SIZE)
            .attr("width", MARKER_SIZE * 2)
            .attr("height", MARKER_SIZE * 2)
            .attr("fill", color)
            .attr("fill-opacity", MARKER_FILL_OPACITY)
            .attr("stroke", "#fff")
            .attr("stroke-width", 1);
        } else if (MARKER_SHAPE === "triangle") {
          const path = d3.path();
          path.moveTo(x, y - MARKER_SIZE);
          path.lineTo(x - MARKER_SIZE, y + MARKER_SIZE);
          path.lineTo(x + MARKER_SIZE, y + MARKER_SIZE);
          path.closePath();
          markerGroup.append("path")
            .attr("d", path)
            .attr("fill", color)
            .attr("fill-opacity", MARKER_FILL_OPACITY)
            .attr("stroke", "#fff")
            .attr("stroke-width", 1);
        }
      });
    }
  });

  // ======================================
  // SECCIÓN: ETIQUETAS FINALES DE LÍNEA CON LÍNEAS GUÍA ("LEADER LINES")
  // ======================================
  // --- 1. Calculá la posición ideal de cada label (evita superposición)
  let labelTargets = VIZ_COLUMNS.map((colNum, index) => {
    const columnData = vizData.map(d => ({
      date: d.date,
      value: d.values[`col${colNum}`]
    })).filter(d => d.value !== null && d.value !== undefined && !isNaN(d.value));
    if (columnData.length === 0) return null;
    const lastPoint = columnData[columnData.length - 1];
    return {
      index,
      y: yScale(lastPoint.value),
      label: labels[index],
      color: colors[index],
      value: lastPoint.value
    };
  });

  // Ordená por Y (de arriba a abajo)
  labelTargets = labelTargets.filter(l => l !== null).sort((a, b) => a.y - b.y);

  // "Empujá" los labels para que no se toquen (mínimo LABEL_MIN_DISTANCE entre centros)
  for (let i = 1; i < labelTargets.length; i++) {
    if (labelTargets[i].y - labelTargets[i - 1].y < LABEL_MIN_DISTANCE) {
      labelTargets[i].y = labelTargets[i - 1].y + LABEL_MIN_DISTANCE;
    }
  }

  // Dibujá la línea guía (si está activado) y el label
  labelTargets.forEach(l => {
    // Coordenadas
    const lastX = CHART_WIDTH;
    const labelX = CHART_WIDTH + 10;
    const lastY = yScale(l.value);

    if (SHOW_LEADER_LINES) {
      g.append("line")
        .attr("x1", lastX)
        .attr("y1", lastY)
        .attr("x2", labelX)
        .attr("y2", l.y)
        .attr("stroke", "#888")      // color gris medio
        .attr("stroke-width", 1)
        .attr("stroke-opacity", 0.45); // opacidad más baja
    }

    // Label
    const maxLabelWidth = CHART_MARGINS.right - 5;
    let txt = l.label;
    const maxChars = 20; // o el número que prefieras
    // Si el texto es demasiado largo, recortalo
    if (txt.length > maxChars) {
    txt = txt.slice(0, maxChars - 1) + "…";
    }

    // Crea el nodo <text> con el texto completo
    const labelEl = g.append("text")
    .attr("x", labelX + 2)
    .attr("y", l.y)
    .attr("dy", "0.35em")
    .style("font-size", LABEL_FONT_SIZE)
    .style("font-weight", LABEL_FONT_WEIGHT) // <- muy importante
    .style("fill", l.color)
    .style("font-family", FONT_FAMILY)
    .style("text-anchor", "start")
    .style("cursor", "pointer")
    .text(txt);

    // Si el texto es demasiado largo, recorta y agrega "…"
    if (labelEl.node().getComputedTextLength() > maxLabelWidth) {
    let truncated = txt;
    while (truncated.length > 0 && labelEl.node().getComputedTextLength() > maxLabelWidth) {
        truncated = truncated.slice(0, -1);
        labelEl.text(truncated + "…");
    }
    }

    // Para interactividad highlight
    lineElements[l.index].rightLabel = labelEl;
  });

  // ======================================
  // SECCIÓN: LEYENDA INTERACTIVA
  // ======================================
  const seriesVisible = VIZ_COLUMNS.map(() => true);

  VIZ_COLUMNS.forEach((colNum, index) => {
    const legendItem = legend.append("g")
      .attr("class", `legend-item legend-item-${index}`)
      .attr("transform", `translate(0, ${index * 22})`)
      .style("cursor", "pointer");

    legendItem.append("rect")
      .attr("x", 0)
      .attr("y", -8)
      .attr("width", 14)
      .attr("height", 14)
      .attr("rx", 3)        // Esquinas redondeadas
      .attr("ry", 3)
      .style("fill", colors[index])
      .style("stroke", "none");

    legendItem.append("text")
      .attr("x", 22)
      .attr("y", 0)
      .attr("dy", "0.35em")
      .style("font-size", LEGEND_FONT_SIZE)
      .style("font-weight", LEGEND_FONT_WEIGHT)
      .style("fill", "#333")
      .style("stroke", "none")
      .style("font-family", FONT_FAMILY)
      .text(labels[index]);


      // --- Interactividad hover ---
        legendItem
        .on("mouseover", function() {
            lineElements.forEach((l, i) => {
            if (i === index) {
                l.style("stroke-width", LINE_STROKE_WIDTH_HOVER).style("opacity", 1);
                if (lineElements[i].rightLabel)
                lineElements[i].rightLabel
                    .style("font-weight", LABEL_FONT_WEIGHT_WITH_HOVER)
                    .style("opacity", 1);
                g.select(`.markers-${i}`).style("opacity", 1);
                legendItem.select("text").style("font-weight", LEGEND_FONT_WEIGHT_WITH_HOVER);
            } else {
                l.style("opacity", 0.15);
                if (lineElements[i].rightLabel)
                lineElements[i].rightLabel.style("opacity", 0.2);
                g.select(`.markers-${i}`).style("opacity", 0.15);
            }
            });
        })
        .on("mouseout", function() {
            lineElements.forEach((l, i) => {
            l.style("stroke-width", LINE_STROKE_WIDTH).style("opacity", seriesVisible[i] ? 1 : 0.15);
            if (lineElements[i].rightLabel)
                lineElements[i].rightLabel
                .style("font-weight", LABEL_FONT_WEIGHT)
                .style("opacity", seriesVisible[i] ? 1 : 0.15);
            g.select(`.markers-${i}`).style("opacity", seriesVisible[i] ? 1 : 0.15);
            });
            legendItem.select("text").style("font-weight", LEGEND_FONT_WEIGHT);
        });


    const lineElement = lineElements[index];
    const markerGroup = g.select(`.markers-${index}`);
    const rightLabel = lineElements[index]?.rightLabel;

    // --- Mostrar/Ocultar serie (toggle) con clic en la leyenda ---
    legendItem.on("click", function(event) {
      event.stopPropagation();
      seriesVisible[index] = !seriesVisible[index];
      if (lineElement) lineElement.style("opacity", seriesVisible[index] ? 1 : 0.15);
      if (!markerGroup.empty()) markerGroup.style("opacity", seriesVisible[index] ? 1 : 0.15);
      if (rightLabel) rightLabel.style("opacity", seriesVisible[index] ? 1 : 0.15);
      legendItem.select("rect").style("opacity", seriesVisible[index] ? 1 : 0.3);
      legendItem.select("text")
        .style("opacity", seriesVisible[index] ? 1 : 0.3)
        .style("text-decoration", "none");
    });
  });

  // ======================================
  // SECCIÓN: HOVER EN LABELS DERECHOS (HIGHLIGHT)
  // ======================================
  VIZ_COLUMNS.forEach((colNum, index) => {
    const rightLabel = lineElements[index]?.rightLabel;
    if (!rightLabel) return;

    rightLabel
      .style("cursor", "pointer")
      .on("mouseover", function() {
        if (!seriesVisible[index]) return;
        lineElements.forEach((l, i) => {
            if (i === index) {
            l.style("stroke-width", LINE_STROKE_WIDTH_HOVER).style("opacity", 1);
            if (lineElements[i].rightLabel)
                lineElements[i].rightLabel
                .style("font-weight", LABEL_FONT_WEIGHT_WITH_HOVER)
                .style("opacity", 1);
            g.select(`.markers-${i}`).style("opacity", 1);
            } else {
            l.style("opacity", 0.15);
            if (lineElements[i].rightLabel)
                lineElements[i].rightLabel.style("opacity", 0.2);
            g.select(`.markers-${i}`).style("opacity", 0.15);
            }
         });
    })
    .on("mouseout", function() {
      lineElements.forEach((l, i) => {
        l.style("stroke-width", LINE_STROKE_WIDTH)
        .style("opacity", seriesVisible[i] ? 1 : 0.15);
        if (lineElements[i].rightLabel) {
          lineElements[i].rightLabel
            .style("font-weight", LABEL_FONT_WEIGHT)
            .style("opacity", seriesVisible[i] ? 1 : 0.15);
        }
        g.select(`.markers-${i}`).style("opacity", seriesVisible[i] ? 1 : 0.15);
      });
    });
  });

  // ======================================
  // SECCIÓN: TOOLTIP FLOTANTE CON VERTICAL GUIDELINE
  // ======================================

  // Crea el tooltip HTML (una sola vez)
  let tooltip = document.getElementById('d3-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = "d3-tooltip";
    document.body.appendChild(tooltip);
  }
  tooltip.style.position = 'absolute';
  tooltip.style.pointerEvents = 'none';
  tooltip.style.background = TOOLTIP_BG_COLOR;
  tooltip.style.color = TOOLTIP_TEXT_COLOR;
  tooltip.style.border = `1px solid ${TOOLTIP_BORDER_COLOR}`;
  tooltip.style.borderRadius = TOOLTIP_BORDER_RADIUS;
  tooltip.style.padding = TOOLTIP_PADDING;
  tooltip.style.fontFamily = FONT_FAMILY;
  tooltip.style.fontSize = TOOLTIP_FONT_SIZE;
  tooltip.style.fontWeight = TOOLTIP_FONT_WEIGHT;
  tooltip.style.boxShadow = TOOLTIP_BOX_SHADOW;
  tooltip.style.opacity = 0;
  tooltip.style.zIndex = 9999;

  // Overlay invisible para capturar mouse y guideline
  const overlay = g.append("rect")
    .attr("class", "tooltip-overlay")
    .attr("width", CHART_WIDTH)
    .attr("height", CHART_HEIGHT)
    .style("fill", "none")
    .style("pointer-events", "all");

  const guideline = g.append("line")
    .attr("class", "tooltip-guideline")
    .attr("y1", 0)
    .attr("y2", CHART_HEIGHT)
    .style("stroke", TOOLTIP_GUIDELINE_COLOR)
    .style("stroke-width", TOOLTIP_GUIDELINE_WIDTH)
    .style("opacity", 0)
    .style("pointer-events", "none");

  overlay.on("mousemove", function(event) {
    // Mouse X dentro del área
    const [mouseX] = d3.pointer(event, this);
    // Fecha más cercana
    const mouseDate = xScale.invert(mouseX);
    let closest = vizData.reduce((a, b) => (
      Math.abs(a.date - mouseDate) < Math.abs(b.date - mouseDate) ? a : b
    ));
    // X guideline
    const xPos = xScale(closest.date);

    guideline
      .attr("x1", xPos)
      .attr("x2", xPos)
      .style("opacity", TOOLTIP_GUIDELINE_OPACITY);

    // Tooltip HTML
    let html = `<b>${d3.timeFormat("%b %Y")(closest.date)}</b><br>`;
    VIZ_COLUMNS.forEach((colNum, i) => {
      const val = closest.values[`col${colNum}`];
      const color = colors[i];
      const label = labels[i];
      if (val !== undefined && val !== null && !isNaN(val)) {
        html += `<span style="color:${color};font-weight:bold;">&#9632;</span> ${label}: <b>${val}</b><br>`;
      }
    });

    tooltip.innerHTML = html;
    tooltip.style.opacity = 1;
    tooltip.style.left = (event.pageX + 16) + "px";
    tooltip.style.top = (event.pageY - 30) + "px";
  })
  .on("mouseleave", function() {
    guideline.style("opacity", 0);
    tooltip.style.opacity = 0;
  });

  // ======================================
  // SECCIÓN: MOSTRAR EL SVG EN LA PÁGINA
  // ======================================
  display(svg.node(), "visualization");
}
