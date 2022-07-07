import React, { PropsWithChildren, ReactNode, useEffect, useState } from 'react';
import { BarDataNode, LineDataNode } from './chart-data';
// import { extent } from 'd3-array';
// import { scaleLinear } from 'd3-scale';

type LineChartProviderProps<TItem extends {}> = {
  data: TItem[];
  xKey: keyof TItem;
  yKey: keyof TItem;
  children: ReactNode;
}

type LineChartContextData = {
  lineData: LineDataNode[]
}

const initialLineChartContextData: LineChartContextData = {
  lineData: []
}

export const LineChartContext = React.createContext<LineChartContextData>(initialLineChartContextData);

export const useLineChart = () => React.useContext<LineChartContextData>(LineChartContext);

export default function LineChartProvider<TItem>(props: LineChartProviderProps<TItem>) {

  const {
    children,
    data,
    xKey,
    yKey
  } = props;

  const [_data, _setData] = useState<LineDataNode[]>([]);

  useEffect(() => {
    const _items = data.map(item => {
      const xVal = +item[xKey];
      const yVal = +item[yKey];
      return {
        xVal,
        yVal
      } as LineDataNode
    })
    _setData(_items);
  }, [data])

  return (
    <LineChartContext.Provider value={{lineData: _data}}>
      {children}
    </LineChartContext.Provider>
  )
}

//bar chart provider

type BarChartProps<TItem> = {
  data: TItem[];
  xKey: keyof TItem;
  yKey: keyof TItem;
  height: number;
}

type BarChartProviderProps<TItem> = BarChartProps<TItem> & PropsWithChildren

type BarChartContextData = {
  barData: BarDataNode[]
}

const initialBarChartContext: BarChartContextData = {
  barData: []
}

const BarChartContext = React.createContext<BarChartContextData>(initialBarChartContext);

export const useBarChart = () => React.useContext<BarChartContextData>(BarChartContext);

function buildLinkedList<TItem>(props: BarChartProps<TItem>): BarDataNode[] {

  const arr: BarDataNode[] = [];
  for (let i = 0; i < props.data.length; i++) {
    const item = props.data[i];
    const xVal = +item[props.xKey];
    const yVal = +item[props.yKey];
    const node: BarDataNode = {
      xVal,
      yVal,
    }
    arr.push(node);
  }

  for (let i = 0; i < arr.length; i++) {
    if (i == 0) {
      const item = arr[i];
      const next = arr[i + 1];
      item.next = next;
      continue;
    }
    if (i == arr.length - 1) {
      const item = arr[i];
      const prev = arr[i - 1];
      item.prev = prev;
      continue;
    }
    if (i > 0 && i < arr.length - 1) {
      const item = arr[i];
      const next = arr[i + 1];
      const prev = arr[i - 1];
      item.next = next;
      item.prev = prev;
    }
  }

  return arr;
}

export function BarChartProvider<TItem>(props: BarChartProviderProps<TItem>) {

  const {
    data,
    children
  } = props;

  const [_data, _setData] = useState<BarDataNode[]>([]);
  
  useEffect(() => {
    const xs = buildLinkedList<TItem>(props);
   _setData(xs);
  }, [data])

  return (
    <BarChartContext.Provider value={{ barData: _data }}>
      {children}
    </BarChartContext.Provider>
  )
}