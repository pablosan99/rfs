import React, { useEffect, useState } from 'react';
import './app.css';
import Chart from './com/chart';
import { Data, Occupancy, RawValue } from './model';
import useFetch from './fetch';
import LineChartProvider, { BarChartProvider } from './com/chart-provider';
import Slider2 from './com/slider2';

function App() {

  const [data] = useFetch();
  const [rangeData, setRangeData] = useState<Data | null>(null);

  const step = 500;
  const stepMultiplier = 1;
  const width = 2300; //svg width

  const height = 600;
  const min = 470000;
  const max = 698000;

  const defaultMinVal = min;
  const defaultMaxVal = max;
  const [minVal, setMinVal] = useState<number>(defaultMinVal);
  const [maxVal, setMaxVal] = useState<number>(defaultMaxVal);

  useEffect(() => {
    const _filteredResult = data.result.filter((x, idx) => {
      return x.frequency >= minVal && x.frequency <= maxVal;
    })
    setRangeData({
      result: _filteredResult,
      occupancy: data.occupancy
    });
  }, [data, minVal, maxVal])

  function handleSlider2Change(event: Event, newValue: number | number[]) {
    const [_min, _max] = newValue as number[];
    
    if (_min + (stepMultiplier * step) >= _max) {
      return;
    }
    setMinVal(_min);
    setMaxVal(_max);
  }
    
  function handleDrag(diff: number) {
    const _step = 5;
    const newMinVal = minVal - (diff * _step);
    if (newMinVal <= defaultMinVal) {
      return;
    }
    const newMaxVal = maxVal - (diff * _step);
    if (newMaxVal >= defaultMaxVal) {
      return;
    }
    setMinVal(newMinVal);
    setMaxVal(newMaxVal);
  }
  
  return rangeData && (
    <LineChartProvider<RawValue> data={rangeData.result} xKey={"frequency"} yKey={"rms"}>
      <BarChartProvider<Occupancy> data={rangeData.occupancy} xKey={"frequency"} yKey={"value"} height={height}>
        <div className="app">
          <div className="slider">
            <Slider2 
              value={[minVal, maxVal]}
              onChange={handleSlider2Change}
              min={min}
              max={max}
              step={step}
              disableSwap
            />
          </div>
          <div className="lineChart">
            <Chart w={width} h={height} minX={minVal} maxX={maxVal} onDrag={handleDrag}/>
          </div>

        </div>
      </BarChartProvider>
    </LineChartProvider>)

}

export default App;
