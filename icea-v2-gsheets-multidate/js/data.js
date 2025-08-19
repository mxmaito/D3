// ============================================================
// data.js — Load CSV from Google Sheets + reshape + multi-format dates
// ============================================================
import { VIZ_COLUMNS, DATA_CONFIG } from './config.js';

function gsheetsCsvUrl(sheetId, gid) {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
}

// Normalize Spanish month abbreviations to English (for d3.timeParse)
function normalizeMonthLocale(str) {
  if (!str || typeof str !== 'string') return str;
  const map = {
    'ene': 'jan', 'feb': 'feb', 'mar': 'mar', 'abr': 'apr', 'may': 'may', 'jun': 'jun',
    'jul': 'jul', 'ago': 'aug', 'sep': 'sep', 'set': 'sep', 'oct': 'oct', 'nov': 'nov', 'dic': 'dec',
    'sept': 'sep'
  };
  return str.replace(/\b([a-záéíóúñ]{3,4})\b/gi, (m) => {
    const key = m.toLowerCase();
    return map[key] ? map[key] : m;
  });
}

function buildParsers(patterns) {
  return patterns.map(p => d3.timeParse(p)).filter(Boolean);
}

function parseDateAuto(raw, formats) {
  if (raw instanceof Date) return raw;
  let s = String(raw).trim();
  if (!s) return null;
  s = normalizeMonthLocale(s);
  for (const parse of formats) {
    const d = parse(s);
    if (d instanceof Date && !isNaN(+d)) return d;
  }
  const fallback = new Date(s);
  if (fallback instanceof Date && !isNaN(+fallback)) return fallback;
  return null;
}

export async function loadDataFromConfig() {
  let url = DATA_CONFIG.CSV_URL;
  if (!url && DATA_CONFIG.SOURCE === 'google_sheets') {
    if (!DATA_CONFIG.SHEET_ID) throw new Error('DATA_CONFIG.SHEET_ID is missing');
    url = gsheetsCsvUrl(DATA_CONFIG.SHEET_ID, DATA_CONFIG.GID || '0');
  }
  if (!url) throw new Error('No CSV URL configured. Provide DATA_CONFIG.CSV_URL or SHEET_ID/GID.');

  const raw = await d3.csv(url);
  const patterns = DATA_CONFIG.DATE_PARSE_FORMATS && DATA_CONFIG.DATE_PARSE_FORMATS.length
    ? DATA_CONFIG.DATE_PARSE_FORMATS
    : ['%Y-%m-%d'];
  const parsers = buildParsers(patterns);

  let prepared;
  if (DATA_CONFIG.DATA_FORMAT === 'long') {
    prepared = prepareLong(raw, {
      dateField: DATA_CONFIG.DATE_FIELD || 'date',
      categoryField: DATA_CONFIG.CATEGORY_FIELD || 'series',
      valueField: DATA_CONFIG.VALUE_FIELD || 'value',
      parsers,
    });
  } else {
    prepared = prepareWide(raw, {
      dateField: DATA_CONFIG.DATE_FIELD || 'date',
      parsers,
      columns: VIZ_COLUMNS,
    });
  }

  prepared = prepared.filter(d => d.date instanceof Date && !isNaN(+d.date));
  prepared.sort((a, b) => a.date - b.date);
  return prepared;
}

// Wide format
function prepareWide(rows, { dateField, parsers, columns }) {
  return rows.map(r => {
    const out = { date: parseDateAuto(r[dateField], parsers) };
    columns.forEach(c => {
      const val = r[c.key];
      out[c.key] = val === '' || val == null ? null : +val;
    });
    return out;
  });
}

// Long format -> pivot to wide
function prepareLong(rows, { dateField, categoryField, valueField, parsers }) {
  const normalized = rows.map(r => ({
    date: parseDateAuto(r[dateField], parsers),
    series: r[categoryField],
    value: r[valueField] === '' || r[valueField] == null ? null : +r[valueField],
  })).filter(d => d.date instanceof Date && !isNaN(+d.date));

  const byDate = d3.group(normalized, d => +d.date);
  const wide = [];
  for (const [ts, arr] of byDate) {
    const row = { date: new Date(+ts) };
    for (const d of arr) row[d.series] = d.value;
    wide.push(row);
  }
  return wide;
}
