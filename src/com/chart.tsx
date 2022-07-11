import * as d3 from 'd3';
import React, { useEffect, useRef } from 'react';
import { useBarChart, useLineChart } from './chart-provider';
import { BarDataNode, LineDataNode } from './chart-data';
import { ScaleLinear } from 'd3';

type Props = {
  w: number;
  h: number;
  minX: number;
  maxX: number;
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
    }

    if (i >= 1) {
      const prev = current.prev;
      let x0 = Math.round(x(prev!.xVal));
      if (x0 < 0 && x1 > 0) {
        const _width = Math.abs(x2);
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
  return arr;
}

export default function Chart(props: Props) {

  const {
    w,
    h,
    minX,
    maxX
  } = props;

  const {
    lineData
  } = useLineChart();
  const {
    barData
  } = useBarChart();

  const y_values = lineData.map(x => x.yVal);
  const x_values = lineData.map(x => x.xVal);

  const svgRef = useRef(null);
  const margin = {top: 30, right: 30, bottom: 30, left: 40};
  const width = w - margin.left - margin.right;
  const height = h - margin.top - margin.bottom;

  const svgWidth = width + margin.left + margin.right;
  const svgHeight = height + margin.top + margin.bottom;

  useEffect(() => {
    
    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove();
    
    const svgEl = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Create Y Axis
    const result_value_extent = d3.extent(y_values, (d) => d).reverse();

    // Scale fn
    //@ts-ignore
    const y = d3.scaleLinear().domain(result_value_extent).range([0, height]);
    const yAxis = d3.axisLeft(y)
      .ticks(height/50)
      .tickSize(3)
      .tickFormat((val) => `${val}`);

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
    const result_freq_extent = d3.extent(x_values, d => d);
    //@ts-ignore
    const x = d3.scaleLinear().domain(result_freq_extent).range([0, width]);
    
    const xAxis = d3.axisBottom(x)
      .ticks(width/150)
      .tickSize(2)
      .tickFormat((val) => `${val}`);

    const xAxisGroup = svgEl.append("g")
      .attr("transform", `translate(0, ${height})`)
      .attr("color", "grey")
      .call(xAxis);
    xAxisGroup.selectAll("line")
      .attr("stroke", "grey");

    xAxisGroup.selectAll("text")
      .attr("color", "grey")
      .attr("font-size", "0.7rem");

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

    // let clip = svgEl.append("defs").append("svg:clipPath")
    //   .attr("id", "clip")
    //   .append("svg:rect")
    //   .attr("width", width )
    //   .attr("height", height )
    //   // .attr("x", 0)
    //   // .attr("y", 0)
    //   .attr("position", "absolute")
    //   .attr("top", 0)
    //   .attr("left", 0)
    //
    // const drag = d3.drag()
    //   .on("drag", () => {
    //     console.log('drag')
    //   })
    //   .on("start", (event) => {
    //     console.log('start', event)
    //   }).on("end", (event) => {
    //     console.log('end', event);
    //   })
    //
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
      .style("border", "1px solid red")
      .style("fill", "none")
      .style("pointer-events", "all")
      .attr("width", width)
      .attr("height", height)
      .attr("position", "absolute")
      .attr("top", 0)
      .attr("left", 0)
      .on("click", handleMouseClick)
      .on("mouseup", handleMouseUp)
      .on("mouseover", handleMouseOver)
      .on("mousemove", handleMouseMove)
      .on("mouseout", handleMouseOut)
    
    const brush = d3.brushX().extent([[0,0], [width, height]])
      .on('end', updateChart)
    
    lineSvg.append("g")
      .attr("class", "brush")
      .call(brush)
    
    function updateChart() {
      console.log('updateChart')
    }
    
    function handleMouseClick(event: any) {
      const [_posX, _poxY] = d3.pointer(event);
      console.log('click', _posX, _poxY);
    }
    
    function handleMouseUp(event: any) {
      
    }
    
    function handleMouseOver() {
      circle.style("opacity", 1);
      circleInfo.style("opacity", 1)
    }

    function handleMouseMove(event: any) {
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
        .attr("y", pixPosY);
      circle
        .attr('cx', pixPosX)
        .attr('cy', pixPosY)
    }

    function handleMouseOut() {
      circle.style("opacity", 0);
      circleInfo.style("opacity", 0)
    }

    // eslint-disable-next-line 
  }, [lineData])

  return (
    <svg ref={svgRef} width={svgWidth} height={svgHeight}/>
  )
}