import React, { useEffect, useState } from 'react';
import './app.css';
import Chart from './com/chart';
import { Data, Occupancy, RawValue } from './model';
import useFetch from './fetch';
import Slider from './com/slider';
import LineChartProvider, { BarChartProvider } from './com/chart-provider';

function App() {

  const [data] = useFetch();
  const [rangeData, setRangeData] = useState<Data | null>(null);

  const gap = 10000;
  const width = 2200; //svg width
  const rangeWidth = 2200; //slider width

  const height = 700;
  const min = 470000;
  const max = 698000;

  const defaultMinVal = min;
  const defaultMaxVal = min + gap;
  const unit = "Hz";
  const [minVal, setMinVal] = useState(defaultMinVal);
  const [maxVal, setMaxVal] = useState(defaultMaxVal);

  useEffect(() => {
    const _filteredResult = data.result.filter((x, idx) => {
      return x.frequency >= minVal && x.frequency <= maxVal;
    })
    setRangeData({
      result: _filteredResult,
      occupancy: data.occupancy
    });
  }, [data, minVal, maxVal])

  function handleSliderChange(val: number, type: 'min' | 'max') {
    if (type == 'min') {
      setMinVal(val);
      return;
    }
    setMaxVal(val);
  }

  return rangeData && (
    <LineChartProvider<RawValue> data={rangeData.result} xKey={"frequency"} yKey={"rms"}>
      <BarChartProvider<Occupancy> data={rangeData.occupancy} xKey={"frequency"} yKey={"value"} height={height}>
        <div className="app">
          <div>
            <Slider gap={gap}
                    max={max}
                    min={min}
                    rangeWidth={rangeWidth}
                    unit={unit}
                    minVal={minVal}
                    maxVal={maxVal}
                    onChange={handleSliderChange}
            />
          </div>
          <div className="lineChart">
            <Chart  w={width} h={height} minX={minVal} maxX={maxVal}/>
          </div>

        </div>
      </BarChartProvider>
    </LineChartProvider>)

}

export default App;
