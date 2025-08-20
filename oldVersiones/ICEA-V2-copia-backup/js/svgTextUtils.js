// svgTextUtils.js

/**
 * wrapSvgTextLabel
 * Hace un "wrap" (salto de línea automático) del texto SVG de un label.
 * textSel: selección D3 del nodo <text>
 * text: el string a mostrar
 * maxWidth: ancho máximo en px
 * lineHeight: separación vertical entre líneas en px
 */
export function wrapSvgTextLabel(textSel, text, maxWidth, lineHeight = 16) {
  textSel.text(null);
  const words = text.split(/\s+/).reverse();
  let line = [];
  let tspan = textSel.append("tspan")
    .attr("x", textSel.attr("x"))
    .attr("y", textSel.attr("y"))
    .attr("dy", "0.35em");

  while (words.length > 0) {
    line.unshift(words.pop());
    tspan.text(line.join(" "));

    if (tspan.node().getComputedTextLength() > maxWidth && line.length > 1) {
      line.shift();
      tspan.text(line.join(" "));
      line = [words.pop()];
      tspan = textSel.append("tspan")
        .attr("x", textSel.attr("x"))
        .attr("y", textSel.attr("y"))
        .attr("dy", lineHeight + "px")
        .text(line[0]);
    }
  }
}
