'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';

interface SplitterProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'horizontal' | 'vertical';
  minSize?: number;
}

const Splitter: React.FC<SplitterProps> = ({
  children,
  className = '',
  direction = 'horizontal',
  minSize = 100,
}) => {
  const childrenArray = React.Children.toArray(children);
  const containerRef = useRef<HTMLDivElement>(null);
  const [sizes, setSizes] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const startPosRef = useRef<number>(0);
  const startSizesRef = useRef<number[]>([]);

  // Initialize sizes equally
  useEffect(() => {
    if (childrenArray.length > 0 && sizes.length === 0) {
      const equalSize = 100 / childrenArray.length;
      setSizes(childrenArray.map(() => equalSize));
    }
  }, [childrenArray.length, sizes.length]);

  const handleMouseDown = useCallback(
    (index: number, e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(index);
      startPosRef.current = direction === 'horizontal' ? e.clientX : e.clientY;
      startSizesRef.current = [...sizes];
    },
    [direction, sizes]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging === null || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const containerSize =
        direction === 'horizontal' ? containerRect.width : containerRect.height;
      const currentPos = direction === 'horizontal' ? e.clientX : e.clientY;
      const delta = currentPos - startPosRef.current;
      const deltaPercent = (delta / containerSize) * 100;

      const newSizes = [...startSizesRef.current];
      const minPercent = (minSize / containerSize) * 100;

      // Adjust sizes for the panels around the gutter
      const newLeftSize = startSizesRef.current[isDragging] + deltaPercent;
      const newRightSize = startSizesRef.current[isDragging + 1] - deltaPercent;

      if (newLeftSize >= minPercent && newRightSize >= minPercent) {
        newSizes[isDragging] = newLeftSize;
        newSizes[isDragging + 1] = newRightSize;
        setSizes(newSizes);
      }
    },
    [isDragging, direction, minSize]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  useEffect(() => {
    if (isDragging !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp, direction]);

  if (sizes.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`${className} ${direction === 'horizontal' ? 'flex-row' : 'flex-col'}`}
      style={{ display: 'flex', overflow: 'hidden' }}
    >
      {childrenArray.map((child, index) => (
        <React.Fragment key={index}>
          <div
            style={{
              [direction === 'horizontal' ? 'width' : 'height']: `${sizes[index]}%`,
              overflow: 'auto',
              flexShrink: 0,
            }}
          >
            {child}
          </div>
          {index < childrenArray.length - 1 && (
            <div
              className={`gutter gutter-${direction}`}
              style={{
                [direction === 'horizontal' ? 'width' : 'height']: '6px',
                backgroundColor: isDragging === index ? '#FA5F55' : '#e5e5e5',
                cursor: direction === 'horizontal' ? 'col-resize' : 'row-resize',
                flexShrink: 0,
                transition: 'background-color 0.2s',
              }}
              onMouseDown={(e) => handleMouseDown(index, e)}
              onMouseEnter={(e) => {
                if (isDragging === null) {
                  (e.target as HTMLDivElement).style.backgroundColor = '#FA5F55';
                }
              }}
              onMouseLeave={(e) => {
                if (isDragging === null) {
                  (e.target as HTMLDivElement).style.backgroundColor = '#e5e5e5';
                }
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Splitter;
