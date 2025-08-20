// ================================
// data.js
// Trabajo con los datos: carga, inspección, parsing, resumen
// ================================

// ========== CONFIGURACIÓN MANUAL DEL PROCESAMIENTO DE DATOS ==========
export const DATE_FORMAT = "mmmYY";                  // Formato esperado de fecha (ej: "mmmYY" para "Jan-20")
export const DATE_COLUMN_NUMBER = 1;                 // Número de columna de fecha (1-indexed)
export const COLUMN_NUMBERS_TO_INCLUDE = [2,3,4,5,6];// Números de columnas numéricas a incluir (1-indexed)
// =====================================================================

/* ================================================================
 * SECCIÓN 1: CARGA DE DATOS
 * ================================================================
 */

/**
 * Carga los datos desde un archivo CSV remoto.
 * Objetivo: Obtener los datos en formato array de objetos, usando d3.csv.
 * Lógica: Llama a d3.csv con la URL y retorna el resultado asincrónico.
 */
export async function loadData() {
  const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSc7Lss59TkKCCtT68RGxLwCuvCAzNFP0qfIeYy_Pf_yIJ4MyRBk_r6-qsk_cgItkEMB838GI6-9jYb/pub?gid=0&single=true&output=csv";
  const data = await d3.csv(url);
  display("Dataset loaded successfully!");
  display(`Number of rows: ${data.length}`);
  return data;
}

/* ================================================================
 * SECCIÓN 2: INSPECCIÓN INICIAL DE DATOS CRUDOS
 * ================================================================
 */

/**
 * Realiza una inspección inicial de los datos crudos cargados.
 * Objetivo: Permitir al usuario entender la estructura y valores de los datos originales.
 * Lógica: Imprime por consola nombres de columnas, algunas filas (primeras y últimas),
 *         y valores únicos de las primeras columnas.
 */
export function inspectData(data) {
  display("=== DATA INSPECTION (RAW) ===");
  display(`Total rows: ${data.length}`);
  display("Column names:");
  display(Object.keys(data[0]));

  // ---- Vista rápida de filas relevantes ----
  display("First 5 rows:");
  display(data.slice(0, 5));
  display("First 10 rows:");
  display(data.slice(0, 10));
  display("Last 5 rows:");
  display(data.slice(-5));

  // ---- Análisis simple de columnas principales ----
  const firstCol = Object.keys(data[0])[0];
  const secondCol = Object.keys(data[0])[1];
  display(`First column (${firstCol}) unique values (first 10):`);
  display([...new Set(data.map(d => d[firstCol]))].slice(0, 10));
  display(`Second column (${secondCol}) sample values:`);
  display(data.slice(0, 10).map(d => d[secondCol]));
}

/* ================================================================
 * SECCIÓN 3: FUNCIONES DE PARSING Y TRANSFORMACIÓN DE DATOS
 * ================================================================
 */

/**
 * Parsea una fecha en string a objeto Date según el formato definido.
 * Objetivo: Convertir strings de fecha en formatos varios (ej: "Jan-20") a objetos Date válidos de JS.
 * Lógica: Usa expresiones regulares para identificar el formato y construir el Date adecuado.
 *         Retorna null si no logra parsear la fecha.
 */
export function parseDate(dateString, format) {
  if (!dateString || dateString.trim() === '') return null;
  const cleanDate = dateString.trim();

  // ==== Parsing por tipo de formato ====
  try {
    switch (format) {
      case "mmmYY":
        // Maneja fechas como "Jan-20" o "Jan20"
        const mmmYYMatch = cleanDate.match(/^([A-Za-z]{3})-?(\d{2})$/);
        if (mmmYYMatch) {
          const [, month, year] = mmmYYMatch;
          // Año: <50 = 2000+, >50 = 1900+
          const fullYear = parseInt(year) + (parseInt(year) > 50 ? 1900 : 2000);
          const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
          const monthIndex = monthNames.findIndex(m => m === month.toLowerCase());
          if (monthIndex !== -1) return new Date(fullYear, monthIndex, 1);
        }
        break;
      case "monthYear":
        // Maneja fechas tipo "January 2020"
        const monthYearMatch = cleanDate.match(/^([A-Za-z]+)\s+(\d{4})$/);
        if (monthYearMatch) return new Date(`${monthYearMatch[1]} 1, ${monthYearMatch[2]}`);
        break;
      case "yearMonth":
        // Maneja fechas tipo "2020-01"
        const yearMonthMatch = cleanDate.match(/^(\d{4})[-\/](\d{1,2})$/);
        if (yearMonthMatch) return new Date(parseInt(yearMonthMatch[1]), parseInt(yearMonthMatch[2]) - 1, 1);
        break;
      case "monthSlashYear":
        // Maneja fechas tipo "01/2020"
        const monthSlashYearMatch = cleanDate.match(/^(\d{1,2})\/(\d{4})$/);
        if (monthSlashYearMatch) return new Date(parseInt(monthSlashYearMatch[2]), parseInt(monthSlashYearMatch[1]) - 1, 1);
        break;
      case "yearOnly":
        // Maneja solo año
        const yearOnlyMatch = cleanDate.match(/^(\d{4})$/);
        if (yearOnlyMatch) return new Date(parseInt(yearOnlyMatch[1]), 0, 1);
        break;
      case "auto":
        // Delega al parser nativo de JS
        const autoDate = new Date(cleanDate);
        if (!isNaN(autoDate.getTime())) return autoDate;
        break;
    }
  } catch (error) {
    console.warn(`Failed to parse date "${dateString}" with format "${format}":`, error);
  }
  // Si no pudo parsear, retorna null
  return null;
}

/**
 * Parsea un valor string a número flotante, eliminando signos y separadores.
 * Objetivo: Convertir cualquier string que represente un número en un float usable.
 * Lógica: Remueve $, % y comas, luego usa parseFloat. Devuelve null si no es numérico.
 */
export function parseNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  // Remueve caracteres típicos de formato de números
  const cleanValue = value.toString().replace(/[$,\s%]/g, '');
  const num = parseFloat(cleanValue);
  return isNaN(num) ? null : num;
}

/* ================================================================
 * SECCIÓN 4: PREPARACIÓN Y REFORMATEO PRINCIPAL DE LOS DATOS
 * ================================================================
 */

/**
 * Prepara los datos para su uso en la visualización.
 * Objetivo: Transformar el array de datos crudo en un array de objetos con fechas parseadas
 *           y columnas numéricas ya convertidas.
 * Lógica:
 *   - Utiliza las configuraciones de fecha y columnas definidas arriba.
 *   - Filtra las filas sin fecha válida.
 *   - Por cada fila válida, parsea la fecha y cada valor de columna seleccionada.
 *   - Devuelve un objeto con los datos transformados y metadatos útiles.
 */
export function prepareData(data) {
  // --------- Determinación de columnas relevantes ---------
  const columnNames = Object.keys(data[0]);
  const dateColumnName = columnNames[DATE_COLUMN_NUMBER - 1];
  const validColumnNumbers = COLUMN_NUMBERS_TO_INCLUDE.filter(num => num <= columnNames.length);

  display(`Using date column: "${dateColumnName}" (column ${DATE_COLUMN_NUMBER})`);
  display(`Including data columns: ${validColumnNumbers.map(num => `"${columnNames[num - 1]}" (col ${num})`).join(', ')}`);

  // --------- Filtrado de filas válidas (con fecha) ---------
  const validRows = data.filter(row => {
    const dateValue = row[dateColumnName];
    return dateValue && dateValue.toString().trim() !== '';
  });

  display(`Filtered data: ${validRows.length} rows with valid dates (from ${data.length} total rows)`);

  // --------- Transformación: Parsing y armado de estructura ---------
  const transformedData = validRows.map((row, index) => {
    const dateValue = row[dateColumnName];
    const parsedDate = parseDate(dateValue, DATE_FORMAT);
    if (!parsedDate) {
      console.warn(`Failed to parse date at row ${index + 1}: "${dateValue}"`);
      return null;
    }
    // Arma objeto con las columnas numéricas seleccionadas
    const values = {};
    validColumnNumbers.forEach((colNum) => {
      const colName = columnNames[colNum - 1];
      if (colName && row.hasOwnProperty(colName)) {
        const rawValue = row[colName];
        const numericValue = parseNumber(rawValue);
        const colKey = `col${colNum}`;
        values[colKey] = numericValue;
      }
    });
    return {
      date: parsedDate,       // Date JS
      category: dateValue,    // String original de la fecha (útil para debugging)
      values: values          // Diccionario de valores numéricos por columna
    };
  }).filter(d => d !== null); // Filtra cualquier fila que no se haya podido parsear

  // --------- Ordenamiento final por fecha ---------
  transformedData.sort((a, b) => a.date - b.date);

  display(`Successfully prepared ${transformedData.length} data points`);
  display("Sample prepared data:");
  display(transformedData.slice(0, 3));

  // --------- Estructura final de salida ---------
  return {
    data: transformedData,      // Array principal, para graficar
    type: "timeSeries",         // Metadato: tipo de datos preparado
    count: transformedData.length,
    columns: validColumnNumbers,
    dateColumn: dateColumnName
  };
}

/* ================================================================
 * SECCIÓN 5: INSPECCIÓN Y RESUMEN DE DATOS PREPARADOS
 * ================================================================
 */

/**
 * Inspecciona y resume los datos ya preparados para visualización.
 * Objetivo: Permitir ver cómo quedó el set de datos final, incluyendo estadísticas básicas.
 * Lógica:
 *   - Muestra cantidad de registros y rango de fechas.
 *   - Calcula y muestra estadísticos (mínimo, máximo, media) para cada columna numérica.
 *   - Imprime por consola las primeras 20 filas del array resultante.
 */
export function inspectPreparedData(preparedData) {
  if (!preparedData || preparedData.count === 0) {
    display("❌ No prepared data available for inspection");
    return;
  }
  display("=== DATA INSPECTION (PREPARED) ===");
  display(`Data Type: ${preparedData.type}`);
  display(`Total Records: ${preparedData.count}`);

  // ---- Resumen de fechas (si es time series) ----
  if (preparedData.type === "timeSeries") {
    const dateRange = d3.extent(preparedData.data, d => d.date);
    display(`Date Range: ${dateRange[0].toLocaleDateString()} to ${dateRange[1].toLocaleDateString()}`);
  }

  // ---- Estadísticas para cada columna numérica ----
  const firstRow = preparedData.data[0];
  if (firstRow && firstRow.values) {
    display("COLUMN STATISTICS:");
    Object.keys(firstRow.values).forEach(colKey => {
      const values = preparedData.data.map(d => d.values[colKey]).filter(v => v !== null && !isNaN(v));
      const displayName = firstRow.displayNames && firstRow.displayNames[colKey]
        ? firstRow.displayNames[colKey]
        : colKey.replace('col', 'Column ');
      if (values.length > 0) {
        const min = d3.min(values);
        const max = d3.max(values);
        const mean = d3.mean(values);
        display(`${displayName}: Min=${min}, Max=${max}, Mean=${mean?.toFixed(2)}, Valid=${values.length}/${preparedData.count}`);
      } else {
        display(`${displayName}: No valid numeric data`);
      }
    });
  }

  // ---- Ejemplo: primeras 20 filas ----
  display("First 20 rows of prepared data:");
  display(preparedData.data.slice(0, 20));
}
