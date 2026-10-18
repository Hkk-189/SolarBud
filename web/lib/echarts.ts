import { LineChart, LinesChart, ScatterChart } from "echarts/charts";
import { GeoComponent, GridComponent, MarkLineComponent, TooltipComponent } from "echarts/components";
import { init, registerMap, use as register } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";

// Only what the charts use, so the bundle stays small (ADR-0006).
register([
  LineChart,
  LinesChart,
  ScatterChart,
  GeoComponent,
  GridComponent,
  MarkLineComponent,
  TooltipComponent,
  CanvasRenderer,
]);

export { init, registerMap };
