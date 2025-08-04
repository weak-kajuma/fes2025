"use client"

import { useEffect, useRef } from 'react';

export const useLocomotiveScroll = () => {
  const locomotiveScrollRef = useRef<any>(null);

  useEffect(() => {
    const initLocomotiveScroll = async () => {
      const LocomotiveScroll = (await import('locomotive-scroll')).default;

      // 既存のLocomotiveScrollインスタンスがあれば破棄
      if ((window as any).locomotiveScroll) {
        (window as any).locomotiveScroll.destroy();
      }

      const locomotiveScroll = new LocomotiveScroll({
        el: document.querySelector('[data-scroll-container]') as HTMLElement,
        smooth: true,
        lerp: 0.03,
        multiplier: 0.8,
        class: 'is-revealed',
        reloadOnContextChange: true,
        touchMultiplier: 2
      });

      // グローバル変数に保存
      (window as any).locomotiveScroll = locomotiveScroll;

      // refにも保存
      locomotiveScrollRef.current = locomotiveScroll;
    };

    // DOMが読み込まれた後に初期化
    if (typeof window !== 'undefined') {
      initLocomotiveScroll();
    }
  }, []);

  return locomotiveScrollRef.current;
};
