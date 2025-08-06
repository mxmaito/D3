// ==========================================
// SECTION 1: DATA RESHAPING AND PREPARATION
// ==========================================

// Esta función transforma y prepara los datos en base a configuración manual.
// Recibe un array de objetos (cada objeto es una fila del CSV).
function prepareData(data) {
  console.log("[prepareData] Inicia preparación de datos. Data recibida:", data);

  // Formato de la fecha (manual, ajustar según tus datos)
  const DATE_FORMAT = "mmmYY";

  // Número de columna (empezando desde 1) que contiene la fecha
  const DATE_COLUMN_NUMBER = 1;

  // Qué columnas (numéricas) incluir en la visualización (empezando desde 1)
  const COLUMN_NUMBERS_TO_INCLUDE = [2, 3];

  // Obtiene nombres de columnas desde la primer fila
  const columnNames = Object.keys(data[0]);
  console.log("[prepareData] Columnas detectadas:", columnNames);

  const dateColumnName = columnNames[DATE_COLUMN_NUMBER - 1];
  console.log("[prepareData] Columna de fecha:", dateColumnName);

  display(`Using date column: "${dateColumnName}" (column ${DATE_COLUMN_NUMBER})`);
  display(`Including data columns: ${COLUMN_NUMBERS_TO_INCLUDE.map(num => `"${columnNames[num - 1]}" (col ${num})`).join(', ')}`);

  // Función interna para parsear fechas, devuelve objeto Date o null.
  function parseDate(dateString, format) {
    // Verifica que haya un string válido.
    if (!dateString || dateString.trim() === '') return null;
    const cleanDate = dateString.trim();

    try {
      switch (format) {
        case "mmmYY":
          // "Jan-20", "Feb-21", etc.
          const mmmYYMatch = cleanDate.match(/^([A-Za-z]{3})-?(\d{2})$/);
          if (mmmYYMatch) {
            const [, month, year] = mmmYYMatch;
            const fullYear = parseInt(year) + (parseInt(year) > 50 ? 1900 : 2000);
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthIndex = monthNames.findIndex(m => m.toLowerCase() === month.toLowerCase());
            if (monthIndex !== -1) {
              return new Date(fullYear, monthIndex, 1);
            }
          }
          break;
        // Otros formatos de fecha omitidos por claridad, pero podés agregarlos igual.
        case "auto":
          const autoDate = new Date(cleanDate);
          if (!isNaN(autoDate.getTime())) {
            return autoDate;
          }
          break;
      }
    } catch (error) {
      console.warn(`Failed to parse date "${dateString}" with format "${format}":`, error);
    }
    return null;
  }

  // Convierte strings numéricos a números reales.
  function parseNumber(value) {
    if (value === null || value === undefined || value === '') return null;
    // Quita símbolos comunes
    const cleanValue = value.toString().replace(/[$,\s%]/g, '');
    const num = parseFloat(cleanValue);
    return isNaN(num) ? null : num;
  }

  // Preparación de datos principal (filtrado, transformación)
  try {
    // Filtra filas sin fecha válida
    const validRows = data.filter(row => {
      const dateValue = row[dateColumnName];
      return dateValue && dateValue.toString().trim() !== '';
    });
    console.log("[prepareData] Filas válidas (con fecha):", validRows.length);

    display(`Filtered data: ${validRows.length} rows with valid dates (from ${data.length} total rows)`);

    // Mapea filas a objetos con fecha parseada y columnas seleccionadas
    const transformedData = validRows.map((row, index) => {
      const dateValue = row[dateColumnName];
      const parsedDate = parseDate(dateValue, DATE_FORMAT);

      if (!parsedDate) {
        console.warn(`Failed to parse date at row ${index + 1}: "${dateValue}"`);
        return null;
      }

      // Extrae los valores de las columnas seleccionadas
      const values = {};
      COLUMN_NUMBERS_TO_INCLUDE.forEach((colNum) => {
        const colName = columnNames[colNum - 1];
        const rawValue = row[colName];
        const numericValue = parseNumber(rawValue);
        const colKey = `col${colNum}`;
        values[colKey] = numericValue;
        console.log(`[prepareData] Row ${index + 1}, Col ${colNum}: ${rawValue} -> ${numericValue}`);
      });

      return {
        date: parsedDate,
        category: dateValue, // Guarda el texto original
        values: values
      };
    }).filter(d => d !== null); // Quita filas con error de fecha

    // Ordena por fecha ascendente
    transformedData.sort((a, b) => a.date - b.date);

    display(`Successfully prepared ${transformedData.length} data points`);
    display("Sample prepared data:");
    display(transformedData.slice(0, 3));
    console.log("[prepareData] Data transformada final:", transformedData);

    // Devuelve objeto listo para usar en la visualización
    return {
      data: transformedData,
      type: "timeSeries",
      count: transformedData.length
    };

  } catch (error) {
    display(`❌ Error preparing data: ${error.message}`);
    console.error("Data preparation error:", error);
    return {
      data: [],
      type: "error",
      count: 0,
      error: error.message
    };
  }
}
