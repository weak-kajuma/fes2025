"use client"

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import styles from "./page.module.css";
import LiquidGlass from "@/components/LiquidGlass/LiquidGlass";
import FunctionItem from "@/components/LiquidGlass/FunctionItem/FunctionItem";
import Image from "next/image";

const Scene = dynamic(() => import("@/components/model/Scene"), { ssr: false });

export default function DesktopHome() {
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const pRef = useRef<HTMLParagraphElement>(null);
  const newsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (
      async () => {
        const LocomotiveScroll = (await import('locomotive-scroll')).default;
        const locomotiveScroll = new LocomotiveScroll({
          el: document.querySelector('[data-scroll-container]') as HTMLElement,
          smooth: true,
          lerp: 0.03,
          multiplier: .8,
          class: 'is-revealed',
          reloadOnContextChange: true,
          touchMultiplier: 2
        });
        (window as any).locomotiveScroll = locomotiveScroll;
        if (h1Ref.current) {
          locomotiveScroll.on('scroll', (args: any) => {
            const h1Element = h1Ref.current;
            if (h1Element) {
              const rect = h1Element.getBoundingClientRect();
              const config = {
                startOffset: 20,
                endOffset: 50,
                delay: 0
              };
              const startPosition = window.innerHeight * (1 - config.startOffset / 100);
              const endPosition = window.innerHeight * (1 - config.endOffset / 100);
              const progress = Math.max(0, Math.min(1,
                (startPosition - rect.top) / (startPosition - endPosition)
              ));
              h1Element.style.opacity = progress.toString();
            }
          });
          h1Ref.current.style.opacity = '0';
        }
        if (pRef.current) {
          locomotiveScroll.on('scroll', (args: any) => {
            const pElement = pRef.current;
            if (pElement) {
              const rect = pElement.getBoundingClientRect();
              const config = {
                startOffset: 20,
                endOffset: 50,
                delay: 0
              };
              const startPosition = window.innerHeight * (1 - config.startOffset / 100);
              const endPosition = window.innerHeight * (1 - config.endOffset / 100);
              const progress = Math.max(0, Math.min(1,
                (startPosition - rect.top) / (startPosition - endPosition)
              ));
              pElement.style.opacity = progress.toString();
            }
          });
          pRef.current.style.opacity = '0';
        }
        if (containerRef.current && newsRef.current) {
          locomotiveScroll.on('scroll', (args: any) => {
            const newsElement = newsRef.current;
            const containerElement = containerRef.current;
            if (newsElement && containerElement) {
              const rect = newsElement.getBoundingClientRect();
              const startPosition = window.innerHeight - window.innerHeight * 0.2;
              const endPosition = window.innerHeight * 0.5;
              const progress = Math.max(0, Math.min(1,
                (startPosition - rect.top) / (startPosition - endPosition)
              ));
              const blurValue = progress * 10;
              containerElement.style.backdropFilter = `blur(${blurValue}px)`;
              // @ts-ignore
              containerElement.style.webkitBackdropFilter = `blur(${blurValue}px)`;
            }
          });
          containerRef.current.style.backdropFilter = 'blur(0px)';
          // @ts-ignore
          containerRef.current.style.webkitBackdropFilter = 'blur(0px)';
        }
      }
    )()
  }, [])

  return (
    <div className={styles.main}>
      <div className={styles.threeD}>
        <Scene />
      </div>
      <div ref={containerRef} className={styles.container} data-scroll-container>
        <div className={styles.about}>
          <h1 ref={h1Ref}>Sparkle.</h1>
          <p ref={pRef}>Sparkle. is a platform for creating and sharing your own stories.</p>
        </div>
        <div ref={newsRef} className={styles.news}>
          <div className={styles.news_inner}>
            <h1 className={styles.news_title}>News</h1>
            <div className={styles.news_items}>
              {[...Array(5)].map((_, i) => (
                <div className={styles.news_item} key={i}>
                  <h2>簡潔な内容簡潔な内容簡潔な内容簡潔な内容簡潔な内容</h2>
                  <p>タグ</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div ref={searchRef} className={styles.search}>
          <div className={styles.search_inner}>
            <h2 className={styles.search_title}>SEARCH</h2>
            <div className={styles.function_wrapper}>
              <div className={styles.functionItems}>
                <FunctionItem href="/map" className="function_map" title="マップ" icon="/icon/map.svg" scroll={false}></FunctionItem>
                <FunctionItem href="/timetable" className="function_timetable" title="タイムテーブル" icon="/icon/timetable.svg" scroll={false}></FunctionItem>
                <FunctionItem href="/allEvents" className="function_allEvents" title="企画一覧" icon="/icon/allEvents.svg" scroll={false}></FunctionItem>
                <FunctionItem href="/pamphlet" className="function_pamphlet" title="パンフレット" icon="/icon/pamphlet.svg" scroll={false}></FunctionItem>
              </div>
              <div className={styles.eventSearch}>
                <LiquidGlass>
                  <a href="/search">
                    <div className={styles.eventSearch_inner}>
                      <div className={styles.icon_wrapper}>
                        <Image src="/icon/search.svg" alt="search" className={styles.search_icon} width={24} height={24} />
                      </div>
                      <p>企画検索</p>
                    </div>
                  </a>
                </LiquidGlass>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}