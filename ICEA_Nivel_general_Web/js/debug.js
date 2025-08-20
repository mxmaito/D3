// ============================================================
// debug.js
// Archivo auxiliar para verificar que todo funciona.
// Incluilo en index.html SOLO cuando quieras debuggear.
// ============================================================

import { renderAxes, drawGridlines } from "./axes-and-grid.js";
import { createInitialState, toggleSeriesVisibility, setHoveredKey } from "./state.js";
import { throttle, truncateTextToWidth } from "./utils.js";

console.log("✅ Debug mode ON");

// Test funciones clave
console.log("renderAxes:", typeof renderAxes);
console.log("drawGridlines:", typeof drawGridlines);
console.log("toggleSeriesVisibility:", typeof toggleSeriesVisibility);
console.log("setHoveredKey:", typeof setHoveredKey);
console.log("throttle:", typeof throttle);
console.log("truncateTextToWidth:", typeof truncateTextToWidth);

// Escuchar eventos globales para ver si se disparan
window.addEventListener("resize", throttle(() => {
  console.log("📏 Window resized:", window.innerWidth, "x", window.innerHeight);
}, 200));

document.addEventListener("mousemove", throttle(e => {
  console.log("🖱 Mouse:", e.clientX, e.clientY);
}, 500));
