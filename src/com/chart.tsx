import * as d3 from 'd3';
import React, { useEffect, useRef, useState } from 'react';
import { useBarChart, useLineChart } from './chart-provider';
import { BarDataNode, LineDataNode } from './chart-data';
import { ScaleLinear } from 'd3';

type Props = {
  w: number;
  h: number;
  minX: number;
  maxX: number;
  onDrag: (posX: number) => void;
}

const colors = [
  "#B2D5E3",
  "#95C0D6",
  "#71A3BF",
  "#598DAC",
  "#204E82",
  "#163960",
  "#0E2948"
]

type ColorRange = {
  color: string;
  minVal: number;
  maxVal: number;
}

const calculate_color_ranges = (min: number, max: number, clr: string[]): ColorRange[] => {
  const div = Math.round((max - min) / clr.length);
  const arr: ColorRange[] = []
  for (let i = min, j = 0; i <= max; i += div + 1, j++) {
    arr.push({
      color: clr[j],
      minVal: i,
      maxVal: i + div
    })
  }
  return arr;
}

const color_ranges = calculate_color_ranges(0, 100, colors);

const find_color = (clr_ranges: ColorRange[]) => (val: number): string => {
  const result = clr_ranges.find(x => val >= x.minVal && val <= x.maxVal);
  return result?.color || clr_ranges[0].color;
}

const color_finder_fn = find_color(color_ranges);

type RectData = {
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
  clr: string;
}

function prepare_data(barData: BarDataNode[], maxX: number, minX: number, x: ScaleLinear<number, number, never>): RectData[] {
  const arr: RectData[] = [];

  for (let i = 0; i < barData.length; i++) {
    let current = barData[i];

    const y1 = 0;
    let x1 = 0;
    let x2 = 0;

    if (current.xVal > maxX) {
      continue;
    }
    if (current.xVal < minX) {
      continue;
    }

    if (current.xVal >= minX && current.xVal <= maxX) {
      x1 = Math.round(x(current.xVal));
      if (current.next?.xVal) {
        x2 = Math.round(x(current.next?.xVal));
        if (current.next.xVal > maxX) {
          x2 = Math.round(x(maxX));
        }
      } else {
        //last 
        x2 = Math.round(x(maxX));
      }
      if (i >= 1) {
        const prev = current.prev;
        let x0 = Math.round(x(prev!.xVal));
        if (x0 < 0 && x1 > 0) {
          const _width = Math.abs(x2 - x0);
          arr.push({
            x: 0,
            y: y1,
            width: _width,
            height: y1,
            value: prev!.yVal,
            clr: color_finder_fn(prev!.yVal)
          })
        }
      }
      if (x1 < 0) {
        x1 = 0;
      }
      const _width = Math.round(Math.abs(x2 - x1));
      const _height = y1;
      arr.push({
        x: x1,
        y: y1,
        width: _width,
        height: _height,
        value: current.yVal,
        clr: color_finder_fn(current.yVal)
      })
    }
  }
  //console.log('arr', arr);
  return arr;
}

export default function Chart(props: Props) {

  const {
    w,
    h,
    minX,
    maxX,
    onDrag
  } = props;

  const {
    lineData
  } = useLineChart();
  const {
    barData
  } = useBarChart();

  const [rectSelected, setRectSelected] = useState(false);
  const [x_window_center, set_x_window_center] = useState(560000)
  const [x_window_width, set_x_window_width] = useState(150);
  const [isDragging, setIsDragging] = useState(false);
  const [dragDiff, setDragDiff] = useState(0);
  const y_values = lineData.map(x => x.yVal);
  const x_values = lineData.map(x => x.xVal);

  const svgRef = useRef(null);
  const margin = {top: 30, right: 30, bottom: 70, left: 40};
  const width = w - margin.left - margin.right;
  const height = h - margin.top - margin.bottom;

  const svgWidth = width + margin.left + margin.right;
  const svgHeight = height + margin.top + margin.bottom;

  const result_freq_extent = d3.extent(x_values, d => d);
  const result_value_extent = d3.extent(y_values, (d) => d).reverse();
  //@ts-ignore
  const x = d3.scaleLinear().domain(result_freq_extent).range([0, width]);
  //@ts-ignore
  const y = d3.scaleLinear().domain(result_value_extent).range([0, height]);
  
  useEffect(() => {
    // Y scale fn
    
    
  }, [])
  
  useEffect(() => {

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove();

    const svgEl = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const yAxis = d3.axisLeft(y)
      .ticks(height / 50)
      .tickSize(3)
      .tickFormat((val) => isDragging ? "": `${val}`);
    
    const yAxisGroup = svgEl.append("g")
      .attr("stroke", "grey")
      .attr("class", "y-axis")
      .call(yAxis);

    yAxisGroup.selectAll("line")
      .attr("stroke", "grey");
    yAxisGroup.selectAll("text")
      .attr("color", "grey")
      .attr("font-size", "0.7rem");

    // Create X Axis

    const xAxis = d3.axisBottom(x)
      .ticks(width/70)
      .tickSize(6)
      .tickFormat((val) => `${val}`);
  
    const xAxisGroup = svgEl.append("g")
      .attr("transform", `translate(0, ${height})`)
      .attr("color", isDragging ? "white": "grey")
      .call(xAxis);
    xAxisGroup.selectAll("line")
      .attr("stroke", isDragging ? "white": "grey");

    // xAxisGroup.selectAll("text")
    //    .attr("color", "grey")
    //    .attr("font-size", "0.7rem");
    
    const arr = prepare_data(barData, maxX, minX, x);

    // Draw barchart
    svgEl.append("g")
      .attr("fill", "none")
      .attr("class", "bar-chart")
      .selectAll('rect')
      .data(arr)
      .join('rect')
      .attr("class", "bar-chart-rect")
      .style("fill", (d) => d.clr)
      .style("stroke", (d) => d.clr)
      .attr("x", (d, i) => d.x)
      .attr("y", (d) => d.y)
      .attr("width", (d) => d.width)
      .attr("height", height)

    // line generator
    const line = d3.line<LineDataNode>()
      .x(d => x(d.xVal))
      .y(d => y(d.yVal))(lineData)

    // Draw line
    const lineSvg = svgEl.append("g")
      .attr("clip-path", "url(#clip)")
      .attr("fill", "none")
      .attr("class", "line")
      .append("path")
      .attr("d", line)
      .attr("stroke", "white")
      .attr("stroke-width", 1.5)

    let circle = svgEl
      .append('circle')
      .attr("class", "circle")
      .style("fill", "none")
      .attr("stroke", "pink")
      .attr("stroke-width", "2")
      .attr('r', 8.5)
      .style("opacity", 0)

    const circleInfo = svgEl
      .append("text")
      .attr("class", "circle-info")
      .attr("font-size", "0.7rem")
      .style("fill", "none")
      .style("opacity", 0)
      .attr("text-anchor", "left")
      .attr("alignment-baseline", "middle")

    svgEl.append("rect")
      .style("fill", "none")
      .style("pointer-events", "all")
      .attr("width", width)
      .attr("height", height)
      .on("click", handleMouseClick)
      .on("mouseup", handleMouseUp)
      .on("mousedown", handleMouseDown)
      .on("mouseover", handleMouseOver)
      .on("mousemove", handleMouseMove)
      .on("mouseout", handleMouseOut)
      .on("dragstart", handleDragStart)
      
    const brush = d3.brushX().extent([[0, 0], [width, height]])
      .on('end', updateChart)

    lineSvg.append("g")
      .attr("class", "brush")
      .call(brush)


    function updateChart() {
      console.log('updateChart')
    }

    function handleMouseClick(event: any) {
      const [_posX, _poxY] = d3.pointer(event);
      const selection = d3.select(event.target);
      console.log('selection', selection);
    }

    function handleMouseUp(event: any) {
      console.log('drag end');
      const [_posX] = d3.pointer(event);
      
      setIsDragging(false);
      setDragDiff(0);
    }
    
    function handleMouseDown(event: any) {
      const [_posX] = d3.pointer(event)
      console.log('drag start', _posX)
      
      setIsDragging(true);
      setDragDiff(0);
    }

    function handleMouseOver() {
      circle.style("opacity", 1);
      circleInfo.style("opacity", 1)
    }

    function handleMouseMove(event: any) {
      //if we drag chart then disable other features i.e window selection
      if (isDragging) {
        circle.style("opacity", 0);
        circleInfo.style("opacity", 0)
        setDragDiff(event.movementX);
      }
      // If rect window selected then omit mouse move
      if (rectSelected) {
        handleWindowMove(event);
        return;
      }
      const [_posX] = d3.pointer(event);

      const posX = Math.abs(Math.round(_posX));
      //const posY = Math.abs(Math.round(_posY));

      const x0 = x.invert(posX);
      // const y0 = y.invert(posY);

      const nearest_x = d3.bisectLeft(x_values, x0);
      const selectedFreq = x_values[nearest_x];

      const xs = lineData.filter(x => x.xVal === selectedFreq)
      let pixPosX = x(selectedFreq);
      let pixPosY = y(xs.length > 0 ? xs[0]?.yVal : 0);

      circleInfo.html(`(${selectedFreq} Hz, ${xs[0]?.yVal / 100} DB)`)
        .attr("stroke", "#bde0fe")
        .attr("stroke-width", "1")
        .attr("x", pixPosX + 20)
        .attr("y", pixPosY)
        .attr('cx', pixPosX)
        .attr('cy', pixPosY)
    }

    function handleMouseOut() {
      circle.style("opacity", 0);
      circleInfo.style("opacity", 0)
    }

    function handleDragStart() {
      console.log('handle drag start')
    }

    function handleDrag(event: any, d: any) {
      console.log('handleDrag', event, d)
    }

    //Window
    const pix_start = x(x_window_center - x_window_width);
    const pix_end = x(x_window_center + x_window_width);
    const window_width = pix_end - pix_start
    if (pix_start < 0) {
      return;
    }
    svgEl.append('rect')
      .attr("width", window_width)
      .attr("height", height + 50)
      .style("fill", "none")
      .style("pointer-events", "all")
      .attr('x', pix_start)
      .attr("y", -5)
      .attr("stroke", rectSelected ? "grey" : "lightgrey")
      .attr("stroke-width", rectSelected ? 6 : 2)
      .on("click", handleWindowClick)
      .on("mousemove", handleWindowMove)
      .on("keydown", handleWindowKeyDown)
      .on("mouseout", handleWindowMouseOut)

    function handleWindowClick(event: any) {
      setRectSelected(!rectSelected);
      setIsDragging(false)
    }

    function handleWindowMove(event: any) {
      if (rectSelected) {
        const [_posX, _posY] = d3.pointer(event);
        const x0 = Math.round(x.invert(_posX));
        set_x_window_center(x0);
      }
    }

    function handleWindowKeyDown(event: any) {
      console.log('keydown', event);
    }

    function handleWindowMouseOut(event: any) {
      //setRectSelected(false);
    }
    
    // eslint-disable-next-line 
  }, [lineData, rectSelected, x_window_center, isDragging, dragDiff])

  useEffect(() => {
    if (isDragging) {
      onDrag(dragDiff);
    }
  }, [isDragging, dragDiff])
  
  return (
    <svg ref={svgRef} width={svgWidth} height={svgHeight}/>
  )
}