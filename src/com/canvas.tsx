import React, { forwardRef, PropsWithChildren, ReactNode, RefObject, useEffect, useRef, useState } from 'react';

type CanvasProps = {
  children?: ReactNode;
} & Partial<HTMLCanvasElement>

const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>((props: CanvasProps, ref) => {
  const {
    width,
    height,
    children
  } = props;
  return (<canvas ref={ref} width={width} height={height} style={{ border: `1px solid red`, overflow: 'auto'}}>{children}</canvas>)
});

type CanvasContextData = {
  ctx: CanvasRenderingContext2D | null | undefined;
}

const initialCanvasContextData: CanvasContextData = {
  ctx: null
}

const CanvasContext = React.createContext<CanvasContextData>(initialCanvasContextData);

type CanvasProviderProps = {
  width: number;
  height: number;
  children: JSX.Element|JSX.Element[];
}

export const CanvasProvider = (props: CanvasProviderProps) => {

  const {
    width, height
  } = props;
  
  const ref = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D|null>(null);

  let x = 0;
  let y = 0;
  
  let pixAbsLeft = x;
  let pixAbsTop = y;
  let pixSizeWidth = width;
  let pixSizeHeight = height;
  
  useEffect(() => {
    const _ctx: CanvasRenderingContext2D | null | undefined = ref.current?.getContext("2d");
    if (_ctx) {
      setCtx(_ctx);
    }
  }, [ref])
  
  const {
    children
  } = props;

  const that = this;
  
  return (
    <CanvasContext.Provider value={{ctx: ctx}}>
      <Canvas ref={ref} width={width} height={height}/>
      {
        React.Children.map(children, (child) => {
          const { props } = child;
          const _width = props.width ?? width;
          const _height = props.height ?? height;
          const X = x + _width;
          const Y = y + _height;
          
          const el = React.cloneElement(child, {x: X, y: Y, height: _height, width: _width , parent: that});
          
          y += height;
          return el;
        })
      }
    </CanvasContext.Provider>
  )
}

export const useCtx = () => React.useContext<CanvasContextData>(CanvasContext);


export default Canvas;