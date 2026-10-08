# Charts with nd-echarts.js

Load ECharts yourself (`<script src="vendor/echarts.min.js">` or CDN); Nerdesign does not ship it.
```js
import * as nd from './nd/nd-echarts.js';
nd.wireDataTables();                       // once per page
const c = nd.mount(echarts, document.getElementById('c1'), (t, data) => ({
  ...nd.base(t),                           // grid, tooltip, reduced motion
  legend: { top: 0 }, grid: nd.grid({ top: 44 }),
  xAxis: nd.timeAxis(t), yAxis: nd.valueAxis(t, 'kW'),
  series: [{ type: 'line', name: 'Hovedhuset', data: data.rows }],
}), {
  data,                                    // optional; c.update(newData) re-renders
  ariaLabel: 'Linjediagram: …',
  table: (data) => ({ caption: 'Effekt per time', headers: ['Tid', 'kW'], numeric: [1], rows: data.rows.map(([ts, v]) => [nd.fmtDateTime(ts), nd.fmtNumber(v, 2)]) }),
});
```
`mount` registers the theme from live tokens, re-renders on theme change (dispose + init), sets role/tabindex/aria-label, honours reduced motion, and fills the sibling `.nd-datatable` with `textContent` (never HTML).
Helpers: `readTokens()`, `buildTheme()`, `register(echarts)`, `textStyle()`, `tooltip(t, over)`, `timeAxis`, `valueAxis(t, name, over)`, `categoryAxis(t, data, over)`, `series()`, `sequential()`, `diverging()` → [neg, mid, pos], `status()`, `reducedMotion()`, `onThemeChange(cb)`, `buildDataTable(el, headers, rows, {caption, numeric})`, `announce(msg)`, `relativeTime(ts)`, `fmtDateTime(ms)`, `fmtNumber(v, decimals)`.
Marks are set by the theme: 2px lines, ≤24px bars with 4px rounded tops, hairline grid, legend for ≥2 series. Colour by entity in fixed series order; diverging bars use `t.diverging.neg/pos`; heatmaps use `visualMap.inRange.color = t.sequential`.
Dual y-axes: allowed but discouraged – prefer two charts or an indexed axis; if used, name both axes and colour the axis labels by series.
Replacing old code: `CYAN/ORANGE/TEXT/GRID_LINE/AXIS_LINE/FONT` constants → tokens via `readTokens()`; `baseTextStyle()` → `nd.textStyle(t)`; `baseTooltip()` → `nd.tooltip(t)`; `getOrCreate()` + dispose → `nd.mount`; `buildTable()` → the `table` option.
