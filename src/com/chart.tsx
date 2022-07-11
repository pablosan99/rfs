import * as d3 from 'd3';
import React, { useEffect, useRef } from 'react';
import { useBarChart, useLineChart } from './chart-provider';
import { LineDataNode } from './chart-data';

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
  const div = Math.round((max-min)/clr.length);
  const arr: ColorRange[] = []
  for (let i = min, j = 0; i <=max; i+=div+1, j++) {
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
  
  const arrRms = lineData.map(x => x.yVal);
  const arrFreq = lineData.map(x => x.xVal);

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
    const result_value_extent = d3.extent(arrRms, (d) => d).reverse();

    // Scale fn
    //@ts-ignore
    const y = d3.scaleLinear().domain(result_value_extent).range([0, height]);
    const yAxis = d3.axisLeft(y)
      .ticks(15)
      .tickSize(3)
      .tickFormat((val) => `${val}`);

    const yAxisGroup = svgEl.append("g")
      .attr("stroke", "white")
      .attr('fill', 'yellow')
      .call(yAxis);
    
    yAxisGroup.selectAll("line")
      .attr("stroke", "white");
    yAxisGroup.selectAll("text")
      .attr("color", "white")
      .attr("font-size", "0.7rem");
    
    // Create X Axis
    const result_freq_extent = d3.extent(arrFreq, d => d);
    //@ts-ignore
    const x = d3.scaleLinear().domain(result_freq_extent).range([0, width]);
    
    const xAxis = d3.axisBottom(x)
      .ticks(18)
      .tickSize(2)
      .tickFormat((val) => `${val}`);

    const xAxisGroup = svgEl.append("g")
      .attr("transform", `translate(0, ${height})`)
      .attr("color", "white")
      .call(xAxis);
    xAxisGroup.selectAll("line")
      .attr("stroke", "white");

    xAxisGroup.selectAll("text")
      .attr("color", "white")
      .attr("font-size", "0.7rem");

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
            x2 = x(maxX);
          }
        } else {
          //last 
          x2 = Math.round(x(maxX));
        }
      }
      
      if (i >= 1) {
        const prev = barData[i-1];
        let x0 = Math.round(x(prev.xVal));
        //console.log(`min-max: `, minX, maxX, '[current: ',  current.xVal,  current.yVal, '] [prev: ', prev.xVal, prev.yVal, x0, x1, ']')
        
         if (x0 < 0 && x1 > 0) {
           const _width = Math.abs(x2);
           arr.push({
             x: 0,
             y: y1,
             width: _width,
             height: y1,
             value: prev.yVal,
             clr: color_finder_fn(prev.yVal)
           })
         }
      }
      const _width = Math.abs(x2 - x1);
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
    
    // Draw barchart
    svgEl.append("g")
      .attr("fill", "none")
      .selectAll('rect')
      .data(arr)
      .join('rect')
      .style("fill", (d) => d.clr)
      .style("stroke", (d) => d.clr)
      .attr("x", (d, i) => d.x)
      .attr("y", (d) => d.y)
      .attr("width",  (d) => d.width)
      .attr("height", height)
    
    // line generator
    const line = d3.line<LineDataNode>()
      .x(d => x(d.xVal))
      .y(d => y(d.yVal))(lineData)

    // Draw line
    svgEl.append("g")
      .attr("fill", "none")
      .append("path")
      .attr("d", line)
      .attr("stroke", "white")
      .attr("stroke-width", "2")
    
    let circle = svg
      .append('g')
      .append('circle')
      .style("fill", "none")
      .attr("stroke", "pink")
      .attr("stroke-width", "2")
      .attr('r', 8.5)
      .style("opacity", 0)
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    const circleInfo = svgEl.append("g")
      .append("text")
      .attr("font-size", "0.7rem")
      .style("fill", "none")
      .style("opacity", 0)
      .attr("text-anchor", "left")
      .attr("alignment-baseline", "middle")
    
    svgEl.append("rect")
      .style("border", "1px solid red")
      .style("fill", "none")
      .style("pointer-events", "all")
      .attr("width",  width)
      .attr("height", height)
      .attr("position", "absolute")
      .attr("top", 0)
      .attr("left", 0)
      .on("mouseover", handleMouseOver)
      .on("mousemove", handleMouseMove)
      .on("mouseout", handleMouseOut)
    
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
      //@ts-ignore
      // const bisect = d3.bisector(d => { console.log('a', d); return d.x }).left;
      // const bisectY = d3.bisector(d => { console.log('a', d); return d.y }).left;
      
      // const nearest_x1 =  d3.bisector<number, number>((a,b) => {
      //   const diff = Math.abs(b-a)
      //   console.log(diff, a, b);
      //   return a;
      // }).left(arrFreq, x0 );
      const nearest_x = d3.bisectLeft(arrFreq, x0 );
      // const nearest_y = d3.bisect(arrRms, y0);
      
      const selectedFreq = arrFreq[nearest_x];
      // const selectedRms = arrRms[nearest_y];
      const xs = lineData.filter(x => x.xVal === selectedFreq)
      let pixPosX = x(selectedFreq);
      let pixPosY = y(xs.length > 0 ? xs[0]?.yVal : 0);
      
      circleInfo.html(`(${selectedFreq} Hz, ${xs[0].yVal/100} DB)`)
         .attr("stroke", "pink")
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
  }, [lineData])//, arrFreq, arrRms, height, margin.left, margin.top, maxX, width])
  
  return (
    <svg ref={svgRef} width={svgWidth} height={svgHeight}/>
  )
}