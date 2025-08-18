"use client";

import { useEffect, useRef, forwardRef, useCallback, useState } from "react";
import gsap from "gsap";
import styles from "./TabBar.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LiquidGlass from "../LiquidGlass/LiquidGlass";
import DetailOverlay from "../../app/search/components/DetailOverlay";

type EventDataForClient = {
  id: number;
  title: string | null;
  host: string | null;
  intro: string | null;
  brief_intro: string | null;
  locationType: string | null;
  tags: string[] | null;
};

// デバイス判定フック
function useDeviceDetection() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsDesktop(width >= 768); // 768px以上をPCとする
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return { isDesktop };
}

export default forwardRef<HTMLDivElement>((props, ref) => {
  const tabBar_Ref = useRef<HTMLDivElement>(null);
  const wrapperInitRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventDataForClient | null>(null);
  const { isDesktop } = useDeviceDetection();

  // 外部refと内部refを結合
  const combinedRef = (node: HTMLDivElement) => {
    tabBar_Ref.current = node;
    wrapperInitRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  // eventcardクリック時のアニメーション関数
  const triggerAnimation = useCallback((event?: EventDataForClient) => {
    if (tabBar_Ref.current) {
      if (event) {
        setSelectedEvent(event);
        setIsExpanded(true);
      }

      // アニメーション実行
      gsap.to(tabBar_Ref.current, {
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90vw',
        height: '80dvh',
        bottom: 0,
        top: 'auto',
        borderRadius: '2rem 2rem 0 0',
        zIndex: 9999,
        transition: 'all 1s cubic-bezier(0.4,0,0.2,1)',
        // overflow: 'hidden',
        // boxShadow: `0 6px 6px rgba(0, 0, 0, 0.2), 0 0 20px rgba(0, 0, 0, 0.1)`,
        ease: "power2.out",
      });
    }
  }, []);

  // 拡張モードを閉じる関数
  const closeExpanded = useCallback(() => {
    if (tabBar_Ref.current) {
      // まずliquidGlass_wrapperのtransformをリセット
      const liquidGlassWrapper = tabBar_Ref.current.querySelector('[class*="liquidGlass_wrapper"]') as HTMLElement;
      if (liquidGlassWrapper) {
        liquidGlassWrapper.style.transform = 'translateY(0)';
      }

      // 状態を先にリセットしてからアニメーション
      setIsExpanded(false);
      setSelectedEvent(null);

      gsap.set(tabBar_Ref.current, {
        clearProps: "all"
      });
      // gsap.to(tabBar_Ref.current, {
      //   position: 'fixed',
      //   left: '50%',
      //   transform: 'translateX(-50%)',
      //   width: '100%',
      //   height: 'auto',
      //   bottom: 0,
      //   top: 'auto',
      //   borderRadius: '0',
      //   zIndex: 1000,
      //   duration: 0.5,
      //   ease: "power2.out",
      //   onComplete: () => {
      //   }
      // });
    }
  }, []);

  // コンテキストにアニメーション関数を提供
  useEffect(() => {
    // グローバルコンテキストを初期化
    if (!(window as any).__TAB_BAR_CONTEXT__) {
      (window as any).__TAB_BAR_CONTEXT__ = {};
    }

    const context = (window as any).__TAB_BAR_CONTEXT__;
    context.triggerAnimation = triggerAnimation;
    context.closeExpanded = closeExpanded;
  }, [triggerAnimation, closeExpanded]);

  useEffect(() => {
    if (pathname === "/") {
      // 初期位置を下端オフスクリーンに
      if (wrapperInitRef.current) {
        gsap.set(wrapperInitRef.current, { y: 80, opacity: 0 });
      }
      function handleSearchWrapperReady(e: CustomEvent) {
        const triggerEl = e.detail as HTMLElement;
        if (tabBar_Ref.current && triggerEl) {
          // スクロールトリガーでトップ領域に合わせてフェードイン（念のため残す）
          gsap.set(tabBar_Ref.current, { opacity: 0, y: 80 });
          gsap.to(tabBar_Ref.current, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            scrollTrigger: {
              trigger: triggerEl,
              start: "top top",
              toggleActions: "play none none reverse",
            },
          });
        }
      }
      window.addEventListener("searchWrapperReady", handleSearchWrapperReady as EventListener);
      return () => {
        window.removeEventListener("searchWrapperReady", handleSearchWrapperReady as EventListener);
      };
    } else {
      // トップページ以外は常に表示
      if (tabBar_Ref.current) {
        gsap.set(tabBar_Ref.current, { opacity: 1, y: 0 });
      }
    }
  }, [pathname]);

  // PC版のトップページかどうかを判定
  const isDesktopTopPage = isDesktop && pathname === "/";

  return (
    <div className={styles.wrapper} ref={combinedRef} data-tabbar-wrapper>
      <LiquidGlass>
        {!isExpanded ? (
          <div className={styles.items}>
            <Link className={`${styles.item} ${styles.pamphlet}`} href="/pamphlet" scroll={false}>
              <img src="/icon/pamphlet.svg" alt="pamphlet" className={`${styles.icon_svg}`} />
            </Link>
            <Link className={`${styles.item} ${styles.timetable}`} href="/timetable" scroll={false}>
              <img src="/icon/timetable.svg" alt="timetable" className={`${styles.icon_svg}`} />
            </Link>
            <Link className={`${styles.item} ${styles.search}`} href="/search" scroll={false}>
              <img src="/icon/search.svg" alt="search" className={`${styles.icon_svg}`} />
            </Link>
            <Link className={`${styles.item} ${styles.user}`} href="" scroll={false}>
              <img src="/icon/user.svg" alt="user" className={`${styles.icon_svg}`} />
            </Link>
            <Link className={`${styles.item} ${styles.allEvents}`} href="/allEvents" scroll={false}>
              <img src="/icon/allEvents_tabbar.svg" alt="allEvents" className={`${styles.icon_svg}`} />
            </Link>
          </div>
        ) : (
          selectedEvent && (
            <DetailOverlay
              event={selectedEvent}
              onClose={closeExpanded}
            />
          )
        )}
      </LiquidGlass>
    </div>
  );
});