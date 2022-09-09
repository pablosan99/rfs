import { useState } from 'react';

type Props = {
  
}

export default function FreqWindow(props: Props) {

  const [rectSelected, setRectSelected] = useState(false);
  const [x_window_center, set_x_window_center] = useState(560000)
  const [x_window_width, set_x_window_width] = useState(150);

  // svgEl.append('rect')
  //   .attr("width", window_width)
  //   .attr("height", height + 50)
  //   .style("fill", "none")
  //   .style("pointer-events", "all")
  //   .attr('x', pix_start)
  //   .attr("y", -5)
  //   .attr("stroke", rectSelected ? "grey" : "lightgrey")
  //   .attr("stroke-width", rectSelected ? 6 : 2)
  //   .on("click", handleWindowClick)
  //   .on("mousemove", handleWindowMove)
  //   .on("keydown", handleWindowKeyDown)
  //   .on("mouseout", handleWindowMouseOut)
  
  
}