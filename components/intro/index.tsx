import styles from "./style.module.css";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef } from "react";

export default function Intro() {

  const backgroundImageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Locomotive Scrollとの連携
    const waitForLocomotive = () => {
      const locomotiveScroll = (window as any).locomotiveScroll;

      if (locomotiveScroll) {
        // Locomotive Scrollのイベントを使用
        locomotiveScroll.on('scroll', (args: any) => {
          const { scroll } = args;
          const progress = Math.min(scroll.y / 300, 1); // 300px分のスクロールでアニメーション完了

          if (backgroundImageRef.current) {
            gsap.set(backgroundImageRef.current, {
              clipPath: `inset(${10 - progress * 10}%)`
            });
          }
        });
      } else {
        // Locomotive Scrollがまだ初期化されていない場合、少し待ってから再試行
        setTimeout(waitForLocomotive, 100);
      }
    };

    waitForLocomotive();
  }, [])

  return (
    <div data-scroll-section className={styles.test}>

      <div ref={backgroundImageRef} data-scroll data-scroll-speed="0.5" className={styles.backgroundImage}>
        <Image src="/background.png" alt="background" fill />
      </div>

      <div data-scroll data-scroll-speed="1" className={styles.container}>
        <h1>Smooth Scroll</h1>
        <p>Different scroll speeds create parallax effect</p>
      </div>

    </div>
  )
}