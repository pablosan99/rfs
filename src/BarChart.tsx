import * as d3 from 'd3';
import React, { useEffect, useRef } from 'react';
import { Data, RawValue } from './Model';

type Props = {
  data: Data;
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

export default function BarChart(props: Props) {

  const {
    data,
    w,
    h,
    minX, maxX
  } = props;
  
  const arrRms = data.result.map(x => x.rms);
  const arrFreq = data.result.map(x => x.frequency);

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
    
    const occupancy_freq_extent = d3.extent(data.occupancy, (d) => d.frequency);

    // [max, min] - [100,0]
    const occupancy_value_extent = d3.extent(data.occupancy, (d) => d.value);

    // [100, 0]
    const clr_extent = d3.extent(data.occupancy, (d) => Math.round(d.value));

    // Create Y Axis
    //[max, min]
    const result_value_extent = d3.extent(arrRms, (d) => d).reverse();
    // Scale fn
    //@ts-ignore
    const y = d3.scaleLinear().domain(result_value_extent).range([0, height]);
    const yAxis = d3.axisLeft(y)
      .ticks(15)
      .tickSize(3)
      .tickFormat((val) => `${val}`);

    const yAxisGroup = svgEl.append("g")
      // .attr("transform", `translate(${margin}, 0)`)
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
    //@ts-ignore
    // const x_scale_occupancy_freq = d3.scaleLinear().domain(occupancy_freq_extent).range([0, width]);
    
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

    // Draw barchart
    svgEl.append("g")
      .attr("fill", "none")
      .selectAll('rect')
      .data(data.occupancy)
      .join('rect')
      .style("fill", (d) => {
        return color_finder_fn(d.value);
      })
      .style("stroke", (d) => {
        return color_finder_fn(d.value);
      })
      .style("visibility", (d) => {
        if (d.frequency < minX || d.frequency >= maxX) {
          return "hidden"
        }
        return "visible"  
      })
      .attr("x", (d, i) => x(d.frequency))
      .attr("y", 0)
      .attr("width",  (d, i) => {
        const x1 = x(d.frequency);
        let x2;
        if (d.next?.frequency) {
          x2 = x(d.next?.frequency);
        } else {
          //last 
          x2 = x(maxX)
        }
        return x2 - x1;
      })
      .attr("height", height)
    
    // Line
    const line = d3.line<RawValue>()
      .x(d => x(d.frequency))
      .y(d => y(d.rms))(data.result)

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
      const [_posX, _posY] = d3.pointer(event);
      
      const posX = Math.abs(Math.round(_posX));
      const posY = Math.abs(Math.round(_posY));
      
      const x0 = x.invert(posX);
      // const y0 = y.invert(posY);
      //@ts-ignore
      // const bisect = d3.bisector(d => { console.log('a', d); return d.x }).left;
      // const bisectY = d3.bisector(d => { console.log('a', d); return d.y }).left;
      
      const nearest_x1 =  d3.bisector<number, number>((a,b) => {
        const diff = Math.abs(b-a)
        console.log(diff, a, b);
        return a;
      }).left(arrFreq, x0 );
      const nearest_x = d3.bisectLeft(arrFreq, x0 );
      // const nearest_y = d3.bisect(arrRms, y0);
      
      const selectedFreq = arrFreq[nearest_x];
      // const selectedRms = arrRms[nearest_y];
      const xs = data.result.filter(x => x.frequency == selectedFreq)
      let pixPosX = x(selectedFreq);
      let pixPosY = y(xs.length > 0 ? xs[0]?.rms : 0);
      
      circleInfo.html(`(${selectedFreq} Hz, ${xs[0].rms/100} DB)`)
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
    
  }, [data])
  
  return (
    <svg ref={svgRef} width={svgWidth} height={svgHeight}/>
  )
}