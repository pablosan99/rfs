// @ts-ignore
import RangeSlider from 'react-range-slider-input';

type Props = {
  value: [number, number];
  min: number;
  max: number;
  step: number;
  onChange: () => void;
}

export default function Slider3(props: Props) {
  
  const {
    min,
    max,
    step,
    value,
    
  } = props;
  
  const handleInputChange = (...args: any) => {
    console.log('handleInputChange', args);
  }
  
  const handleThumbDragStart = (...args: any) => {
    console.log('handleThumbDragStart', args)
  }
  
  const handleThumbDragEnd = (...args: any) => {
    console.log('handleThumbDragEnd', args)
  }
  
  const handleRageDragStart = (param: any) => {
    //@ts-ignore
    console.log('handleRageDragStart', param);
  }
  
  const handleRangeDragEnd = (param: any) => {
    console.log('handleRangeDragEnd', param);
  }
  
  const handleStep = (val: [number, number]) => {
    console.log('handleStep ', val);
  }
  
  return (
    <RangeSlider min={min} 
                 max={max} 
                 step={step} 
                 value={value} 
                 // inInput={handleInputChange} 
                 // onThumbDragStart={handleThumbDragStart}
                 // onThumbDragEnd={handleThumbDragEnd}
                 onRangeDragStart={handleRageDragStart}
                 onRangeDragEnd={handleRangeDragEnd}
                 
    />
  )
}