import { useLayoutEffect, useRef, forwardRef } from 'react';
import gsap from 'gsap';
import styles from './Ellipse.module.css';
import { is } from '@react-three/fiber/dist/declarations/src/core/utils';

interface Props {
  text: string;
  duration?: number;
  reversed?: boolean;
}

const AnimatedEllipse = forwardRef<SVGSVGElement, Props>((
  { text, duration = 21, reversed = true },
  ref
) => {
  const internalSvgRef = useRef<SVGSVGElement>(null);

  // 親コンポーネントの ref に内部の ref を割り当てる
  useLayoutEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(internalSvgRef.current);
      } else {
        (ref as React.MutableRefObject<SVGSVGElement | null>).current = internalSvgRef.current;
      }
    }
  }, [ref]);

  useLayoutEffect(() => {
    const target = internalSvgRef.current;
    if (!target) return;

    const path = target.querySelector('path');
    if (!path) return;

    // 既存の text ノードがあれば除去（ルート遷移時の重複防止）
    target.querySelectorAll('text').forEach(node => node.remove());

    const pathId = `path-${Math.floor(Math.random() * 900000 + 100000)}`;
    const props = { duration, ease: 'none', repeat: -1 };

    gsap.set(path, { attr: { fill: 'none', id: pathId, stroke: 'none' } });

  // 円周長を取得（約3文字分減らすため倍率調整）
  const pathLength = path.getTotalLength() * 0.95 ;
    // 1文字の平均幅（px）を仮定（フォントサイズやletterSpacingに応じて調整）
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const fontSize = isMobile ? 19 : 17;
    const letterSpacing = isMobile ? 0.13 : 0.07;
    // 1文字ごとに実際の幅を取得して合計が円周長を超えるまで繰り返す
    let repeatedText = "";
    if (text.length > 0) {
      // 一時的にSVG text要素を作成して幅を計測
      const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      tempSvg.setAttribute("style", `position: absolute; visibility: hidden; font-size: ${fontSize}px; letter-spacing: ${letterSpacing}em; font-family: 'Yu Mincho', 'YuMincho', 'Hiragino Mincho ProN', 'Hiragino Mincho Pro', 'HGS明朝E', 'MS P明朝', 'MS Mincho', serif; font-weight: 700;`);
      document.body.appendChild(tempSvg);
      let totalWidth = 0;
      let i = 0;
      while (true) {
        const char = text[i % text.length];
        const tempText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        tempText.textContent = char;
        tempSvg.appendChild(tempText);
        const bbox = tempText.getBBox();
        if (totalWidth + bbox.width >= pathLength) {
          tempSvg.removeChild(tempText);
          break;
        }
        totalWidth += bbox.width;
        repeatedText += char;
        tempSvg.removeChild(tempText);
        i++;
      }
      document.body.removeChild(tempSvg);
    }

    target.insertAdjacentHTML(
      'beforeend',
      `
      <text>
        <textPath href="#${pathId}" startOffset="0%">${repeatedText}</textPath>
        <textPath href="#${pathId}" startOffset="0%">${repeatedText}</textPath>
      </text>`
    );

    const textPaths = target.querySelectorAll('textPath');
    gsap.set(textPaths, {
      fontSize: fontSize + 'px',
      letterSpacing: letterSpacing + 'em',
      fontFamily: `"Yu Mincho", "YuMincho", "Hiragino Mincho ProN", "Hiragino Mincho Pro", "HGS明朝E", "MS P明朝", "MS Mincho", serif`,
      fill: '#020202',
      fontWeight: 700,
    });

    const tween1 = gsap.to(textPaths[0], { attr: { startOffset: reversed ? '-100%' : '100%' }, ...props });
    const tween2 = gsap.fromTo(
      textPaths[1],
      { attr: { startOffset: reversed ? '100%' : '-100%' } },
      { attr: { startOffset: '0%' }, ...props }
    );

    return () => {
      tween1.kill();
      tween2.kill();
      // 念のため動的に追加した text を掃除
      target.querySelectorAll('text').forEach(node => node.remove());
    };
  }, [text, duration, reversed]);

  return (
    <div className={styles.ellipse}>
      <svg ref={internalSvgRef} viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
        <path d="M227 120C227 142.091 178.871 160 119.5 160C60.1294 160 12 142.091 12 120C12 97.9086 60.1294 80 119.5 80C178.871 80 227 97.9086 227 120Z" fill="none" />
      </svg>
    </div>
  );
});

AnimatedEllipse.displayName = 'AnimatedEllipse';

export default AnimatedEllipse;
