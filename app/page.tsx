"use client"

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import styles from "./page.module.css";
import LiquidGlass from "@/components/LiquidGlass/LiquidGlass";
import FunctionItem from "@/components/LiquidGlass/FunctionItem/FunctionItem";
import Image from "next/image";

// モバイル版コンポーネントを動的インポート
const MobileHome = dynamic(() => import("./MobileHome"), { ssr: false });
const Scene = dynamic(() => import("@/components/model/Scene"), { ssr: false });

// デバイス判定フック
function useDeviceDetection() {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 1201); // 768px未満をモバイルとする
      setIsLoading(false);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return { isMobile, isLoading };
}

export default function Home() {
  const { isMobile, isLoading } = useDeviceDetection();

  // ローディング中は何も表示しない
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // モバイル版の場合はバックアップファイルのコンポーネントを表示
  if (isMobile) {
    return <MobileHome />;
  }

  // PC版の場合は現在のコンポーネントを表示
  return <DesktopHome />;
}

// PC版のコンポーネント
function DesktopHome() {
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
          lerp: 0.03, // より滑らかな動き
          multiplier: .8, // 通常のスクロール速度
          class: 'is-revealed',
          reloadOnContextChange: true,
          touchMultiplier: 2
        });

        // グローバル変数に保存
        (window as any).locomotiveScroll = locomotiveScroll;

        // h1要素のアニメーション
        if (h1Ref.current) {
          locomotiveScroll.on('scroll', (args: any) => {
            const h1Element = h1Ref.current;
            if (h1Element) {
              const rect = h1Element.getBoundingClientRect();
              const config = {
                startOffset: 20, // アニメーション開始位置のオフセット（画面高さの下から20%）
                endOffset: 50,   // アニメーション終了位置のオフセット（画面高さの下から50%）
                delay: 0         // 遅延時間（ミリ秒）
              };

              // 画面高さの%でアニメーション開始位置と終了位置を計算
              const startPosition = window.innerHeight * (1 - config.startOffset / 100);
              const endPosition = window.innerHeight * (1 - config.endOffset / 100);
              const progress = Math.max(0, Math.min(1,
                (startPosition - rect.top) / (startPosition - endPosition)
              ));

              // シンプルなopacityアニメーション
              h1Element.style.opacity = progress.toString();
            }
          });

          h1Ref.current.style.opacity = '0';
        }

        // p要素のアニメーション（少し遅れて開始）
        if (pRef.current) {
          locomotiveScroll.on('scroll', (args: any) => {
            const pElement = pRef.current;
            if (pElement) {
              const rect = pElement.getBoundingClientRect();
              const config = {
                startOffset: 20, // アニメーション開始位置のオフセット（画面高さの下から30%）
                endOffset: 50,   // アニメーション終了位置のオフセット（画面高さの下から70%）
                delay: 0       // 遅延時間（ミリ秒）
              };

              // 画面高さの%でアニメーション開始位置と終了位置を計算
              const startPosition = window.innerHeight * (1 - config.startOffset / 100);
              const endPosition = window.innerHeight * (1 - config.endOffset / 100);
              const progress = Math.max(0, Math.min(1,
                (startPosition - rect.top) / (startPosition - endPosition)
              ));

              // シンプルなopacityアニメーション（遅延付き）
              pElement.style.opacity = progress.toString();
            }
          });

          pRef.current.style.opacity = '0';
        }

        // containerのbackdrop-filterアニメーション（news要素の位置に基づく）
        if (containerRef.current && newsRef.current) {
          locomotiveScroll.on('scroll', (args: any) => {
            const newsElement = newsRef.current;
            const containerElement = containerRef.current;
            if (newsElement && containerElement) {
              const rect = newsElement.getBoundingClientRect();

              // news要素が画面のボトムより20vh下から画面の中央に来るまでのアニメーション
              const startPosition = window.innerHeight - window.innerHeight * 0.2; // 画面のボトムより20vh下
              const endPosition = window.innerHeight * 0.5; // 画面の中央
              const progress = Math.max(0, Math.min(1,
                (startPosition - rect.top) / (startPosition - endPosition)
              ));

              // backdrop-filterをblur(0px)からblur(10px)にアニメーション
              const blurValue = progress * 10;
              containerElement.style.backdropFilter = `blur(${blurValue}px)`;
              // @ts-ignore: webkitBackdropFilter is not standard but needed for Safari
              containerElement.style.webkitBackdropFilter = `blur(${blurValue}px)`;
            }
          });

          // 初期状態を設定
          containerRef.current.style.backdropFilter = 'blur(0px)';
          // @ts-ignore: webkitBackdropFilter is not standard but needed for Safari
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
                        {/* <img src="/icon/search.svg" alt="search" className={styles.search_icon} /> */}
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