// ============================================================
// state.js — Single source of truth for series visibility & hover
// ============================================================

export function createInitialState(columns) {
  const visible = Object.fromEntries(columns.map(c => [c.key, true]));
  return {
    visible,
    hoveredKey: null,
  };
}

export function setSeriesVisibility(state, key, isVisible) {
  state.visible[key] = !!isVisible;
}

export function toggleSeriesVisibility(state, key) {
  state.visible[key] = !state.visible[key];
}

export function setHoveredKey(state, key) {
  state.hoveredKey = key;
}
