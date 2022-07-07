import React, { useState } from 'react';

type Props = {
  gap: number;
  min: number;
  max: number;
  rangeWidth: number;
  unit: string;
  minVal: number;
  maxVal: number;
  onChange: (val: number, type: 'min'|'max') => void;
}

const Slider = (props: Props) => {
  
  const {
    gap,
    min,
    max,
    minVal,
    maxVal,
    rangeWidth,
    unit,
    onChange
  } = props;

  const defaultMinVal = min;
  const defaultMaxVal = min + gap;
  // const [minVal, setMinVal] = useState(defaultMinVal);
  // const [maxVal, setMaxVal] = useState(defaultMaxVal);
  
  return (
    <div>
      <div style={{ width: rangeWidth }}>
        <div className="panel">
          <div>{min}{unit}</div>
          <div>{minVal}{unit}</div>
          <div>{maxVal-gap}{unit}</div>
        </div>
        <input type="range"
               value={minVal}
               min={min}
               max={maxVal-gap}
               step={100}
               style={{ width: rangeWidth}}
               onChange={({target}) => {
                 onChange(+target.value, 'min')
               }}/>
      </div>

      <div style={{ width: rangeWidth }}>
        <div className="panel">
          <div>{minVal+gap}{unit}</div>
          <div>{maxVal}{unit}</div>
          <div>{max}{unit}</div>
        </div>
        <input type="range"
               min={minVal+gap}
               max={max}
               step={100}
               style={{ width: rangeWidth}}
               value={maxVal}
               onChange={({target}) => {
                 onChange(+target.value, 'max')
               }}/>
      </div>
    </div>
  )
}
export default Slider;