"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import styles from "./TabBar.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TabBar() {
  const tabBar_Ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/") {
      function handleSearchWrapperReady(e: CustomEvent) {
        const triggerEl = e.detail as HTMLElement;
        if (tabBar_Ref.current && triggerEl) {
          gsap.set(tabBar_Ref.current, { opacity: 0, y: 100 });
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

  return (
    <div className={styles.wrapper} ref={tabBar_Ref}>
      <div className={styles.items}>
        <Link className={`${styles.item} ${styles.pamphlet}`} href="/pamphlet" scroll={false}>
          <img src="/icon/pamphlet.svg" alt="pamphlet" className={styles.icon_svg} />
        </Link>
        <Link className={`${styles.item} ${styles.timetable}`} href="/timetable" scroll={false}>
          <img src="/icon/timetable.svg" alt="timetable" className={styles.icon_svg} />
        </Link>
        <Link className={`${styles.item} ${styles.search}`} href="/search" scroll={false}>
          <img src="/icon/search.svg" alt="search" className={styles.icon_svg} />
        </Link>
        <Link className={`${styles.item} ${styles.user}`} href="" scroll={false}>
          <img src="/icon/user.svg" alt="user" className={styles.icon_svg} />
        </Link>
        <Link className={`${styles.item} ${styles.allEvents}`} href="/allEvents" scroll={false}>
          <img src="/icon/allEvents_tabbar.svg" alt="allEvents" className={styles.icon_svg} />
        </Link>
      </div>
    </div>
  );
}