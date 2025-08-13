import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollSmoother } from 'gsap/ScrollSmoother';

export type AnimationType = 'opacity' | 'translateY' | 'translateX' | 'scale' | 'rotate';

interface AnimationConfig {
  startOffset: number; // アニメーション開始位置のオフセット（画面高さの下から%）
  endOffset: number;   // アニメーション終了位置のオフセット（画面高さの下から%）
  delay?: number;      // 遅延時間（ミリ秒）
  type: AnimationType; // アニメーションタイプ
  fromValue?: number;  // 開始値
  toValue?: number;    // 終了値
  unit?: string;       // 単位（px, %, deg等）
}

export const useScrollAnimation = (config: AnimationConfig) => {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let tickerFn: ((time: number, deltaTime: number, frame: number) => void) | null = null;

    // 初期状態
    if (elementRef.current) {
      const fromValue = config.fromValue ?? 0;
      const unit = config.unit ?? '';
      switch (config.type) {
        case 'opacity':
          elementRef.current.style.opacity = fromValue.toString();
          break;
        case 'translateY':
          elementRef.current.style.transform = `translateY(${fromValue}${unit})`;
          break;
        case 'translateX':
          elementRef.current.style.transform = `translateX(${fromValue}${unit})`;
          break;
        case 'scale':
          elementRef.current.style.transform = `scale(${fromValue})`;
          break;
        case 'rotate':
          elementRef.current.style.transform = `rotate(${fromValue}${unit})`;
          break;
      }
    }

    const start = () => {
      const smoother: any = (window as any).scrollSmoother || ScrollSmoother.get();
      // ScrollSmoother が無くても getBoundingClientRect ベースで動くように毎フレーム評価
      tickerFn = () => {
        const element = elementRef.current;
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const startPosition = window.innerHeight * (1 - config.startOffset / 100);
        const endPosition = window.innerHeight * (1 - config.endOffset / 100);
        const progress = Math.max(0, Math.min(1, (startPosition - rect.top) / (startPosition - endPosition)));

        const fromValue = config.fromValue ?? 0;
        const toValue = config.toValue ?? 1;
        const unit = config.unit ?? '';
        const currentValue = fromValue + (toValue - fromValue) * progress;

        switch (config.type) {
          case 'opacity':
            element.style.opacity = currentValue.toString();
            break;
          case 'translateY':
            element.style.transform = `translateY(${currentValue}${unit})`;
            break;
          case 'translateX':
            element.style.transform = `translateX(${currentValue}${unit})`;
            break;
          case 'scale':
            element.style.transform = `scale(${currentValue})`;
            break;
          case 'rotate':
            element.style.transform = `rotate(${currentValue}${unit})`;
            break;
        }
      };

      gsap.ticker.add(tickerFn);
    };

    // ScrollSmoother の有無に関わらず開始
    start();

    return () => {
      if (tickerFn) gsap.ticker.remove(tickerFn);
    };
  }, [config]);

  return elementRef;
};