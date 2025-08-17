"use client";

import { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import LiquidGlass from "@/components/LiquidGlass/LiquidGlass";
import styles from "./MenuIcon.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

export default function MenuIcon() {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { isDesktop } = useDeviceDetection();

  // PC版のトップページかどうかを判定
  const isDesktopTopPage = isDesktop && pathname === "/";

  // 画面遷移時にメニューを閉じる
  useEffect(() => {
    if (isOpen) {
      handleIconClick();
    }
  }, [pathname]);

  // Topページのときだけ初期位置を右端オフスクリーンに設定
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    if (pathname === "/") {
      gsap.set(el, { x: 80, opacity: 0 });
    } else {
      gsap.set(el, { clearProps: "all", x: 0, opacity: 1 });
    }
  }, [pathname]);

  const handleIconClick = () => {
    setIsOpen(!isOpen);
    if (iconRef.current && contentRef.current) {
      if (!isOpen) {
        // 開くアニメーション
        gsap.to(iconRef.current, {
          borderRadius: "30px",
          width: isDesktop ? "30vw" : "90vw",
          height: isDesktop ? "60vh" : "60vh",
          duration: 0.5,
          ease: "power2.out"
        });

        // menu_contentを表示
        gsap.to(contentRef.current, {
          opacity: 1,
          pointerEvents: "auto",
          duration: 0.5,
          ease: "power2.out",
          delay: 0.2 // 少し遅れて開始
        });
      } else {
        // 閉じるアニメーション
        gsap.to(iconRef.current, {
          borderRadius: "50px",
          width: "60px",
          height: "60px",
          duration: 0.5,
          ease: "power2.out"
        });

        // menu_contentを非表示
        gsap.to(contentRef.current, {
          opacity: 0,
          pointerEvents: "none",
          duration: 0.3,
          ease: "power2.out"
        });
      }
    }
  };

  return (
    <div ref={wrapperRef} className={styles.menu_wrapper} data-menu-icon-wrapper>
      <div ref={iconRef} className={styles.menu_icon} onClick={handleIconClick}>
        <LiquidGlass>
          <svg
            className={`${styles.ham} ${styles.hamRotate} ${styles.ham1} ${isOpen ? styles.active : ''} ${styles.ham_black}`}
            viewBox="0 0 100 100"
            width="50"
          >
            <path
              className={`${styles.line} ${styles.top}`}
              d="m 30,33 h 40 c 0,0 9.044436,-0.654587 9.044436,-8.508902 0,-7.854315 -8.024349,-11.958003 -14.89975,-10.85914 -6.875401,1.098863 -13.637059,4.171617 -13.637059,16.368042 v 40"
            />
            <path
              className={`${styles.line} ${styles.middle}`}
              d="m 30,50 h 40"
            />
            <path
              className={`${styles.line} ${styles.bottom}`}
              d="m 30,67 h 40 c 12.796276,0 15.357889,-11.717785 15.357889,-26.851538 0,-15.133752 -4.786586,-27.274118 -16.667516,-27.274118 -11.88093,0 -18.499247,6.994427 -18.435284,17.125656 l 0.252538,40"
            />
          </svg>

          <div
            ref={contentRef}
            className={styles.menu_content}
          >
            <div className={styles.link}>
              <Link href="/" className={`${styles.link_text} ${/* isDesktopTopPage ? styles.link_text_white : */ styles.link_text_black}`}>ホーム</Link>
            </div>
            <div className={styles.link}>
              <Link href="/map" className={`${styles.link_text} ${/* isDesktopTopPage ? styles.link_text_white : */ styles.link_text_black}`}>マップ</Link>
            </div>
            <div className={styles.link}>
              <Link href="/allEvents" className={`${styles.link_text} ${/* isDesktopTopPage ? styles.link_text_white : */ styles.link_text_black}`}>企画一覧</Link>
            </div>
            <div className={styles.link}>
              <Link href="/timetable" className={`${styles.link_text} ${/* isDesktopTopPage ? styles.link_text_white : */ styles.link_text_black}`}>タイムテーブル</Link>
            </div>
            <div className={styles.link}>
              <Link href="/reserve" className={`${styles.link_text} ${/* isDesktopTopPage ? styles.link_text_white : */ styles.link_text_black}`}>予約・抽選の申し込み</Link>
            </div>
          </div>
        </LiquidGlass>
      </div>
    </div>
  );
}