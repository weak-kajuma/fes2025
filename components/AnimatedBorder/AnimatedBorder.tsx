import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';

interface AnimatedBorderProps {
  children: React.ReactNode;
  strokeWidth?: number;
  strokeColor?: string;
  borderRadius?: number;
  setAnimationTarget?: (element: SVGRectElement | null) => void; // Callback to expose the rect element
  targetRef?: React.RefObject<HTMLDivElement | null>; // 監視対象のitemのref
}

const AnimatedBorder: React.FC<AnimatedBorderProps> = ({
  children,
  strokeWidth = 2,
  strokeColor = 'white',
  borderRadius = 20,
  setAnimationTarget,
  targetRef,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<SVGRectElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [animatedRadius, setAnimatedRadius] = useState(borderRadius);

  useEffect(() => {
    // 監視対象のitemのrefを使う
  const target = targetRef?.current || wrapperRef.current;
    if (!target) return;

    const updateDimensionsAndRadius = () => {
      setDimensions({
        width: target.offsetWidth,
        height: target.offsetHeight,
      });
      // CSSのborder-radiusを取得
      const style = window.getComputedStyle(target);
      let radius = style.borderRadius;
      if (radius.endsWith('px')) {
        radius = radius.replace('px', '');
        setAnimatedRadius(Number(radius) || borderRadius);
      } else {
        setAnimatedRadius(borderRadius);
      }
    };

    updateDimensionsAndRadius();

    const observer = new ResizeObserver(() => updateDimensionsAndRadius());
    observer.observe(target);
    window.addEventListener('resize', updateDimensionsAndRadius);
    target.addEventListener('transitionend', updateDimensionsAndRadius);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateDimensionsAndRadius);
      target.removeEventListener('transitionend', updateDimensionsAndRadius);
    };
  }, [children, borderRadius, targetRef]);

  useEffect(() => {
    if (rectRef.current && setAnimationTarget) {
      setAnimationTarget(rectRef.current);
    }
  }, [dimensions, setAnimationTarget]);

  useEffect(() => {
    if (rectRef.current && dimensions.width > 0 && dimensions.height > 0) {
      const length = rectRef.current.getTotalLength();
      // If already fully drawn, do not reset on resize/layout changes
      const currentOffset = rectRef.current.style.strokeDashoffset;
      const isDrawn = currentOffset === '0' || currentOffset === '0px';
      if (!isDrawn) {
        gsap.set(rectRef.current, { strokeDasharray: length, strokeDashoffset: length });
      } else {
        gsap.set(rectRef.current, { strokeDasharray: length, strokeDashoffset: 0 });
      }
    }
  }, [dimensions, strokeWidth, strokeColor, borderRadius]);

  // border-radiusのアニメーション
  useEffect(() => {
    if (rectRef.current) {
      gsap.to(rectRef.current, {
        rx: animatedRadius,
        ry: animatedRadius,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  }, [animatedRadius]);

  return (
    <div ref={wrapperRef} style={{ position: 'relative', display: 'inline-block', pointerEvents: 'auto' }}>
      {children}
      {dimensions.width > 0 && dimensions.height > 0 && (
        <svg
          width={dimensions.width}
          height={dimensions.height}
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          fill="none"
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
        >
          <rect
            ref={rectRef}
            x={strokeWidth / 2}
            y={strokeWidth / 2}
            width={dimensions.width - strokeWidth}
            height={dimensions.height - strokeWidth}
            rx={animatedRadius}
            ry={animatedRadius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        </svg>
      )}
    </div>
  );
};

export default AnimatedBorder;