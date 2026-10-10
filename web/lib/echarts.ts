import { LineChart } from "echarts/charts";
import { GridComponent, MarkLineComponent, TooltipComponent } from "echarts/components";
import { init, use as register } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";

// Only what the charts use, so the bundle stays small (ADR-0006).
register([LineChart, GridComponent, MarkLineComponent, TooltipComponent, CanvasRenderer]);

export { init };
