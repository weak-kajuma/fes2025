"use client"

import React, { ReactNode, useEffect, useRef } from "react";
import styles from "./LiquidGlass.module.css";

type LiquidGlassProps = {
  children: ReactNode;
  className?: string;
};

export default function LiquidGlass({ children, className = "" }: LiquidGlassProps) {
  const hasRenderedSVG = useRef(false);

  useEffect(() => {
    // SVGフィルターが既に存在するかチェック
    const existingFilter = document.getElementById('liquidGlassFilter');
    if (!existingFilter && !hasRenderedSVG.current) {
      hasRenderedSVG.current = true;
    }
  }, []);

  return (
    <>
      {/* SVG filter definition for liquid glass effect - only render once */}
      {!hasRenderedSVG.current && (
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
      )}
      <div className={`${styles.liquidGlass_wrapper} ${className}`} data-liquid-glass="true">
        <div className={styles.liquidGlass_effect}></div>
        <div className={styles.liquidGlass_tint}></div>
        <div className={styles.liquidGlass_shine}></div>
        <div className={styles.liquidGlass_content}>
          {children}
        </div>
      </div>
    </>
  );
}
