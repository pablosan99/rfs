import React, { useEffect, useState } from 'react';
import './App.css';
import BarChart from './BarChart';
import { Data, emptyData } from './Model';


const useFetch = () => {
  const [data, setData] = useState<Data>(emptyData);

  useEffect(() => {
    fetch('/data.json').then((response) => {
      response.json().then((_data: Data) => {
        
        for (let i = 0; i < _data.occupancy.length; i++) {
          const current = _data.occupancy[i];
          current.frequency *= 1000;
          current.value = Math.round(current.value);
          if (_data.occupancy.length > i + 1) {
            const next = _data.occupancy[i+1];
            current.next = { 
              ...next,
              frequency: next.frequency * 1000
            };
          }
        }
        setData(_data);
      })
    })
  }, [])

  return [data]
}

function App() {

  const [data] = useFetch();
  const [rangeData, setRangeData] = useState<Data|null>(null);
  
  const gap = 10000;
  const width = 2200;
  const height = 500;
  const min = 470000;
  const max = 698000;
  const rangeWidth = 2200;
  const defaultMinVal = min;
  const defaultMaxVal = min + gap;
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
  
  const unit = "Hz"
  
  return (
    <div className="app">
      <div className="lineChart">
        {rangeData && <BarChart data={rangeData} w={width} h={height} minX={minVal} maxX={maxVal}/>}
      </div>
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
            setMinVal(+target.value)
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
            setMaxVal(+target.value)
          }}/>
        </div>
      </div>
    </div>
  );
}

export default App;
