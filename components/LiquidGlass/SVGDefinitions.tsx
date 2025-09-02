import React, { useEffect, useRef } from 'react';

export default function SVGDefinitions() {
  const hasRendered = useRef(false);

  useEffect(() => {
    // 既にSVGフィルターが存在するかチェック
    const existingFilter = document.getElementById('liquidGlassFilter');
    if (!existingFilter && !hasRendered.current) {
      hasRendered.current = true;
    }
  }, []);

  if (hasRendered.current) {
    return null;
  }

  return (
    <svg style={{ display: "none" }}>
      <defs>
        <filter id="liquidGlassFilter">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 0 0 15 -6"
            result="liquid"
          />
          <feBlend in="SourceGraphic" in2="liquid" mode="normal" />
        </filter>
        <filter id="glass-distortion">
          <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="turbulence" />
          <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="10" />
        </filter>
      </defs>
    </svg>
  );
}