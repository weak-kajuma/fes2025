import { useEffect, useRef } from 'react';

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
    const initAnimation = async () => {
      const LocomotiveScroll = (await import('locomotive-scroll')).default;
      const locomotiveScroll = new LocomotiveScroll({
        el: document.querySelector('[data-scroll-container]') as HTMLElement,
        smooth: true,
        lerp: 0.03,
        multiplier: 1,
        class: 'is-revealed',
        reloadOnContextChange: true,
        touchMultiplier: 2
      });

      // グローバル変数に保存
      (window as any).locomotiveScroll = locomotiveScroll;

      if (elementRef.current) {
        locomotiveScroll.on('scroll', (args: any) => {
          const element = elementRef.current;
          if (element) {
            const rect = element.getBoundingClientRect();

            // 画面高さの%でアニメーション開始位置と終了位置を計算
            const startPosition = window.innerHeight * (1 - config.startOffset / 100);
            const endPosition = window.innerHeight * (1 - config.endOffset / 100);
            const progress = Math.max(0, Math.min(1,
              (startPosition - rect.top) / (startPosition - endPosition)
            ));

            // アニメーション値の計算
            const fromValue = config.fromValue ?? 0;
            const toValue = config.toValue ?? 1;
            const unit = config.unit ?? '';
            const currentValue = fromValue + (toValue - fromValue) * progress;

            // アニメーションタイプに応じた適用
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
          }
        });
      }

      // 初期状態を設定
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
    };

    initAnimation();
  }, [config]);

  return elementRef;
};