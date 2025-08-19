# ICEA V2 — D3 Option C (Responsive + Event Bus + State)

This bundle implements a production-grade D3.js architecture with:
- Responsive SVG (`viewBox`) + `ResizeObserver`
- Central event bus (`d3.dispatch('hover','leave','toggle')`)
- Centralized state for series visibility/hover
- Right-side labels with collision avoidance, hitboxes, and leader lines
- Accessible legend (mouse + keyboard)
- Tooltip with guideline; throttled `mousemove`

## Quick start

1. **Unzip** the folder.
2. Serve it with any static server (recommended to avoid CORS issues with ES modules):
   - VS Code: extension **Live Server**
   - Node: `npx http-server .` or `npx serve .`
3. Open `http://localhost:PORT/` and you should see the chart.

## Where to plug your data

- Replace the synthetic data in `main.js` with your real pipeline.
- Ensure your data objects include a `date: Date` and one numeric field per series key.
- Define your series in `config.js` under `VIZ_COLUMNS`:

```js
export const VIZ_COLUMNS = [
  { key: 'col1', label: 'Series A' },
  { key: 'col2', label: 'Series B' },
];
```

## Notes

- D3 is loaded via CDN in `index.html` as a global (`window.d3`).
- All app modules use ES modules with relative imports.
- If you embed this in a CMS (e.g., WordPress), keep the `viewBox` approach and container width at 100%.
