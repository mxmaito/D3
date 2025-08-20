// data.js — GSheets CSV + reshape + multi-format dates + auto-detect
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

function buildParsers(patterns) { return patterns.map(p => d3.timeParse(p)).filter(Boolean); }

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

function autodetectDateField(rows, parsers) {
  if (!rows || !rows.length) return null;
  const keys = Object.keys(rows[0] || {});
  const sampleCount = Math.min(rows.length, 50);
  let best = { key: null, score: -1 };
  for (const k of keys) {
    let ok = 0;
    for (let i = 0; i < sampleCount; i++) {
      const d = parseDateAuto(rows[i][k], parsers);
      if (d instanceof Date && !isNaN(+d)) ok++;
    }
    const score = ok / sampleCount;
    if (score > best.score) best = { key: k, score };
  }
  return best.score >= 0.5 ? best.key : null;
}

function coerceNumber(v) {
  if (v == null || v === '') return null;
  const s = String(v).trim().replace(/\./g, '').replace(/,/g, '.'); // 1.234,56 -> 1234.56
  const n = +s;
  return Number.isNaN(n) ? null : n;
}

export async function loadDataFromConfig() {
  let url = DATA_CONFIG.CSV_URL;
  if (!url && DATA_CONFIG.SOURCE === 'google_sheets') {
    if (!DATA_CONFIG.SHEET_ID) throw new Error('DATA_CONFIG.SHEET_ID is missing');
    url = gsheetsCsvUrl(DATA_CONFIG.SHEET_ID, DATA_CONFIG.GID || '0');
  }
  if (!url) throw new Error('No CSV URL configured. Provide DATA_CONFIG.CSV_URL or SHEET_ID/GID.');

  const raw = await d3.csv(url);
  if (DATA_CONFIG.DEBUG) console.log('[data.js] Raw headers:', Object.keys(raw[0] || {}));

  const patterns = (DATA_CONFIG.DATE_PARSE_FORMATS && DATA_CONFIG.DATE_PARSE_FORMATS.length)
    ? DATA_CONFIG.DATE_PARSE_FORMATS : ['%Y-%m-%d'];
  const parsers = buildParsers(patterns);

  const dateField = DATA_CONFIG.DATE_FIELD || autodetectDateField(raw, parsers);
  if (!dateField) { console.error('[data.js] Could not detect date column'); return []; }
  if (DATA_CONFIG.DEBUG) console.log('[data.js] Using date field:', dateField);

  let prepared;
  if (DATA_CONFIG.DATA_FORMAT === 'long') {
    const cat = DATA_CONFIG.CATEGORY_FIELD || 'series';
    const val = DATA_CONFIG.VALUE_FIELD || 'value';
    prepared = prepareLong(raw, { dateField, categoryField: cat, valueField: val, parsers });
  } else {
    prepared = prepareWide(raw, { dateField, parsers, columns: VIZ_COLUMNS });
  }

  prepared = prepared.filter(d => d.date instanceof Date && !isNaN(+d.date));
  prepared.sort((a, b) => a.date - b.date);
  if (!prepared.length) console.error('[data.js] No rows after parsing. Sample:', raw.slice(0,3));
  return prepared;
}

// Wide format
function prepareWide(rows, { dateField, parsers, columns }) {
  return rows.map(r => {
    const out = { date: parseDateAuto(r[dateField], parsers) };
    columns.forEach(c => { out[c.key] = coerceNumber(r[c.key]); });
    return out;
  });
}

// Long format -> pivot
function prepareLong(rows, { dateField, categoryField, valueField, parsers }) {
  const normalized = rows.map(r => ({
    date: parseDateAuto(r[dateField], parsers),
    series: r[categoryField],
    value: coerceNumber(r[valueField]),
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
