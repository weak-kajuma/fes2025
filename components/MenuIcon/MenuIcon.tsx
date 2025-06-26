"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import styles from "./MenuIcon.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MenuIcon() {
  const svg_Ref = useRef<SVGSVGElement>(null);
  const menuIcon_Ref = useRef<HTMLDivElement>(null);
  const content_Ref = useRef<HTMLDivElement>(null);
  const isOpen = useRef(false);
  const animation = useRef<gsap.core.Timeline | null>(null);
  const animationMenu = useRef<gsap.core.Timeline | null>(null);

  const pathname = usePathname();

  useEffect(() => {
    // パスが変わったらメニューを閉じる
    if (isOpen.current) {
      handleMenuClick();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    // アニメーションを初期化
    if (menuIcon_Ref.current && content_Ref.current) {
      const targetRect = content_Ref.current.getBoundingClientRect();

      animationMenu.current = gsap.timeline()
      .fromTo(menuIcon_Ref.current,
        {
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
        },
        {
          width: targetRect.width,
          height: targetRect.height,
          borderColor: "transparent",
          borderRadius: "20px",
          backgroundColor: "#F2F2F2",
          duration: 0.5,
          ease: "none",
        }
      );


      animation.current = gsap.timeline({ paused: true })
        .add(animationMenu.current)
        .to(content_Ref.current, {
          opacity: 1,
          duration: 0.5,
          ease: "none",
        }, ">");
    }

    // スクロールを検知してメニューを閉じる
    const handleScroll = () => {
      if (isOpen.current) {
        closeMenu();
      }
    };

    // タッチスクロールを無効化する関数
    const preventScroll = (e: TouchEvent) => {
      if (isOpen.current) {
        e.preventDefault();
      }
    };

    // イベントリスナーを追加
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      // イベントリスナーをクリーンアップ
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("touchmove", preventScroll);
    };
  }, []);

  function closeMenu() {
    if (!menuIcon_Ref.current || !content_Ref.current || !animation.current || !animationMenu.current) return;

    isOpen.current = false;

    svg_Ref.current?.classList.remove(styles.active);

    gsap.set(content_Ref.current, {
      opacity: 0,
    });

    animation.current.reverse();

    // 背景のスクロールを有効化
    document.body.style.overflow = "";
  }

  function handleMenuClick() {
    if (!menuIcon_Ref.current || !content_Ref.current || !animation.current) return;

    isOpen.current = !isOpen.current;

    svg_Ref.current?.classList.toggle(styles.active);

    if (isOpen.current && content_Ref.current) {
      // アニメーションを再生
      animation.current.play();

      // 背景のスクロールを無効化
      // document.body.style.overflow = "hidden";
      content_Ref.current.style.pointerEvents = "auto";
    } else {
      closeMenu();
      content_Ref.current.style.pointerEvents = "none";
    }
  }

  return (
    <div className={styles.menu_wrapper}>
      <div className={styles.menu_icon} ref={menuIcon_Ref}>
        <svg
          className={`${styles.ham} ${styles.hamRotate} ${styles.ham1}`}
          viewBox="0 0 100 100"
          width="60"
          ref={svg_Ref}
          onClick={handleMenuClick}
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
      </div>

      {/* メニューコンテンツ */}
      <div className={styles.menu_content} ref={content_Ref}>
        <Link href="/">ホーム</Link>
        <Link href="/map">マップ</Link>
        <Link href="/pamphlet">パンフレット</Link>
        <Link href="/allEvents">企画一覧</Link>
        <Link href="/timetable">タイムテーブル</Link>
      </div>
    </div>
  );
}