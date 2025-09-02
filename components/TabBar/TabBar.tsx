"use client";

import { useEffect, useRef, forwardRef, useCallback, useState } from "react";
import gsap from "gsap";
import styles from "./TabBar.module.css";
import Link from "next/link";
import LiquidGlass from "../LiquidGlass/LiquidGlass";
import DetailOverlay from "../../app/search/components/DetailOverlay";
import Image from "next/image";

import { useRouter } from "next/navigation";
// ...existing code...
import { usePathname } from "next/navigation"

import AnimatedLink from '../AnimatedLink';

type EventDataForClient = {
  id: number;
  title: string | null;
  host: string | null;
  intro: string | null;
  brief_intro: string | null;
  locationType: string | null;
  tags: string[] | null;
};

// window.showSVG 型エラー対策
declare global {
  interface Window {
    showSVG?: boolean;
  }
}

// デバイス判定フック
function useDeviceDetection() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsDesktop(width >= 900); // 900px以上をPCとする
    };

    checkDevice();　
    window.addEventListener('resize', checkDevice);

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return { isDesktop };
}

export default forwardRef<HTMLDivElement>((props, ref) => {
  // 開閉状態管理
  const [isOpen, setIsOpen] = useState(false);
  // メニューアイコンのアニメーション状態
  const [isMenuAnimating, setIsMenuAnimating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // 開閉アニメーション
  const handleMenuClick = () => {
    setIsOpen(!isOpen); // SVGアニメーションを即座に発火
    setIsMenuAnimating(true);
    if (!isOpen) {
      // 開く
      if (isDesktop) {
        gsap.to(contentRef.current, {
          width: 900,
          duration: 0.5,
          ease: "power2.out",
          onComplete: () => {
            setIsMenuAnimating(false);
          }
        });
      } else {
        gsap.to(contentRef.current, {
          height: 300,
          duration: 0.5,
          ease: "power2.out",
          onComplete: () => {
            setIsMenuAnimating(false);
          }
        });
      }
      gsap.to(menuRef.current, {
        display: "flex",
        opacity: 1,
        duration: 0.3,
        delay: 0.2,
        onStart: () => {
          if (menuRef.current) menuRef.current.style.display = "flex";
          if (!isDesktop && menuRef.current) menuRef.current.style.flexDirection = "column";
        }
      });
      // メニューアイテムを左から順に下からふわっと表示
      if (menuRef.current) {
        const items = menuRef.current.querySelectorAll(`.${styles.menu_item}`);
        gsap.fromTo(
          items,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.08,
            ease: "power2.out"
          }
        );
      }
    } else {
      // 閉じる
      gsap.to(menuRef.current, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
          if (menuRef.current) menuRef.current.style.display = "none";
        }
      });
      if (isDesktop) {
        gsap.to(contentRef.current, {
          width: "13rem",
          duration: 0.5,
          ease: "power2.inOut",
          onComplete: () => {
            setIsMenuAnimating(false);
          }
        });
      } else {
        gsap.to(contentRef.current, {
          height: 60,
          duration: 0.5,
          ease: "power2.inOut",
          onComplete: () => {
            setIsMenuAnimating(false);
          }
        });
      }
    }
  };

  // 初期状態
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.width = "13rem";
      contentRef.current.style.height = "60px";
    }
    if (menuRef.current) menuRef.current.style.display = "none";
  }, []);

  // TabBarの表示制御はCSSで行う
  useEffect(() => {
    const updateTabBarVisibility = () => {
      const tabbar = tabBar_Ref.current;
      if (!tabbar) return;
      if (typeof window !== "undefined" && window.showSVG) {
        tabbar.style.opacity = "0";
        tabbar.style.pointerEvents = "none";
      } else {
        tabbar.style.opacity = "1";
        tabbar.style.pointerEvents = "";
        tabbar.style.transform = "translateX(-50%)";
      }
    };
    updateTabBarVisibility();
    window.addEventListener("showSVGChange", updateTabBarVisibility);
    return () => {
      window.removeEventListener("showSVGChange", updateTabBarVisibility);
    };
  }, []);
  const tabBar_Ref = useRef<HTMLDivElement>(null);
  const wrapperInitRef = useRef<HTMLDivElement>(null);
  // const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventDataForClient | null>(null);
  const { isDesktop } = useDeviceDetection();

  const router = useRouter();
  const pathname = usePathname();

  function triggerPageTransition() {
    document.documentElement.animate([
      {
        clipPath: 'polygon(25% 75%, 75% 75%, 75% 75%, 25% 75%)',
      },
      {
        clipPath: 'polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)',
      }
    ], {
      duration: 2000,
      easing: 'cubic-bezier(0.9, 0, 0.1, 1)',
      pseudoElement: '::view-transition-new(root)'
    })
  }

  const handleNavigation = (path: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (path === pathname) {
      e.preventDefault();
      return;
    }

    router.push(path, {
  // ...existing code...
    })
  }

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

  // メニュー項目データ
  const menuItems = [
    { label: "Home", to: "/" },
    { label: "Time table", to: "/timetable" },
    { label: "Map", to: "/map" },
    { label: "Search", to: "/search" },
    { label: "Reserve", to: "/reserve" },
    { label: "News", to: "/news" },
  ];

  // ホバーアニメーション
  // 初期化: .link_hoverを必ず非表示状態に
  useEffect(() => {
    const hoverEls = document.querySelectorAll(`.${styles.link_hover}`);
    hoverEls.forEach(el => {
      gsap.set(el, { transform: "scale3d(0,0,1)" });
    });
  }, [isDesktop]);

  const handleMenuItemHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDesktop) return;
    const hoverEl = e.currentTarget.querySelector(`.${styles.link_hover}`) as HTMLElement;
    const linkEl = e.currentTarget.querySelector(`.${styles.menu_link}`) as HTMLElement;
    if (hoverEl) {
      gsap.killTweensOf(hoverEl);
      gsap.to(hoverEl, { transform: "scale3d(1,1,1)", duration: 0.35, ease: "power2.out" });
    }
    if (linkEl) {
      gsap.to(linkEl, { color: "#141414", duration: 0.2, ease: "power2.out" });
    }
  };
  const handleMenuItemLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDesktop) return;
    const hoverEl = e.currentTarget.querySelector(`.${styles.link_hover}`) as HTMLElement;
    const linkEl = e.currentTarget.querySelector(`.${styles.menu_link}`) as HTMLElement;
    if (hoverEl) {
      gsap.killTweensOf(hoverEl);
      gsap.to(hoverEl, { transform: "scale3d(0,0,1)", duration: 0.25, ease: "power2.in", clearProps: "transform" });
    }
    if (linkEl) {
      gsap.to(linkEl, { color: "white", duration: 0.2, ease: "power2.in" });
    }
  };

  // ページ遷移時にホバー解除
  useEffect(() => {
    // ホバー解除
    const hoverEls = document.querySelectorAll(`.${styles.link_hover}`);
    hoverEls.forEach(el => {
      gsap.set(el, { transform: "scale3d(0,0,1)" });
    });
    // 文字色リセット
    const linkEls = document.querySelectorAll(`.${styles.menu_link}`);
    linkEls.forEach(el => {
      gsap.set(el, { color: "white" });
    });
  }, [pathname]);

  return (
    <div className={styles.wrapper} ref={combinedRef} data-tabbar-wrapper>
      {!isExpanded ? (
        <div className={styles.content} ref={contentRef}>
          <div className={styles.logo_wrapper}>
            <Link href="/" className={styles.logo_link}>
              <div className={styles.logo_inner}>
                Sparkle
              </div>
            </Link>
          </div>
          <nav className={styles.menu} ref={menuRef}>
            {menuItems.map((item, idx) => (
              <div
                className={styles.menu_item}
                key={item.to}
                onMouseEnter={handleMenuItemHover}
                onMouseLeave={handleMenuItemLeave}
              >
                <Link href={item.to} className={styles.menu_link}>
                  <span>{item.label}</span>
                </Link>
                <div className={styles.link_hover}></div>
              </div>
            ))}
          </nav>
          <div className={styles.button} onClick={handleMenuClick}>
            <svg
              className={`${styles.ham} ${styles.hamRotate} ${styles.ham1} ${isOpen ? styles.active : ''} ${styles.ham_black}`}
              viewBox="0 0 100 100"
              width="50"
            >
              <path
                className={`${styles.line} ${styles.top}`}
                d="m 30,33 h 40 c 0,0 9.044436,-0.654587 9.044436,-8.508902 0,-7.854315 -8.024349,-11.958003 -14.89975,-10.85914 -6.875401,1.098863 -13.637059,4.171617 -13.637059,16.368042 v 40"
                fill="none"
                stroke="white"
                strokeWidth="6"
              />
              <path
                className={`${styles.line} ${styles.middle}`}
                d="m 30,50 h 40"
                fill="none"
                stroke="white"
                strokeWidth="6"
              />
              <path
                className={`${styles.line} ${styles.bottom}`}
                d="m 30,67 h 40 c 12.796276,0 15.357889,-11.717785 15.357889,-26.851538 0,-15.133752 -4.786586,-27.274118 -16.667516,-27.274118 -11.88093,0 -18.499247,6.994427 -18.435284,17.125656 l 0.252538,40"
                fill="none"
                stroke="white"
                strokeWidth="6"
              />
            </svg>
          </div>
        </div>
      ) : (
        selectedEvent && (
          <DetailOverlay
            event={selectedEvent}
            onClose={closeExpanded}
          />
        )
      )}
    </div>
  );
});