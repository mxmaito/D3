export function throttle(fn, wait = 16) {
  let last = 0, queuedArgs = null, ticking = false;
  const invoke = (args) => { last = performance.now(); ticking = false; fn(...args); };
  return (...args) => {
    const now = performance.now();
    const remaining = wait - (now - last);
    if (remaining <= 0 && !ticking) { invoke(args); }
    else if (!queuedArgs) { queuedArgs = args; if (!ticking) { ticking = true; setTimeout(() => { invoke(queuedArgs); queuedArgs = null; }, Math.max(1, remaining)); } }
  };
}
export function truncateTextToWidth(sel, maxWidth) {
  sel.each(function () {
    const text = d3.select(this); const full = text.text();
    let lo = 0, hi = full.length;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      text.text(full.slice(0, mid) + (mid < full.length ? '…' : ''));
      if (this.getComputedTextLength() <= maxWidth) lo = mid; else hi = mid - 1;
    }
    text.text(full.slice(0, lo) + (lo < full.length ? '…' : ''));
  });
}
