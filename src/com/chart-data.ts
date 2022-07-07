export type LineDataNode = {
  xVal: number;
  yVal: number;
}

export type BarDataNode = {
  xVal: number;
  yVal: number;
  next?: BarDataNode;
  prev?: BarDataNode;
}

export type ChartData = {
  lineSeries: LineDataNode[];
  barSeries: BarDataNode[];
}