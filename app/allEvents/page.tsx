"use client";

import { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import LiquidGlass from "@/components/LiquidGlass/LiquidGlass";
import styles from "./page.module.css";

export default function AllEvents() {
  const [isOpen, setIsOpen] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);

  const handleIconClick = () => {
    setIsOpen(!isOpen);

    if (iconRef.current) {
      if (!isOpen) {
        // 開くアニメーション
        gsap.to(iconRef.current, {
          borderRadius: "50px",
          width: "300px",
          duration: 0.3,
          ease: "power2.out"
        });
      } else {
        // 閉じるアニメーション
        gsap.to(iconRef.current, {
          borderRadius: "50px",
          width: "60px",
          duration: 0.3,
          ease: "power2.out"
        });
      }
    }
  };

  return (
    <div className={styles.container}>
      <h1>All events</h1>
      <p>This is the all events page.</p>

      <div ref={iconRef} className={styles.icon}>
        <LiquidGlass className={styles.liquidGlass}>
          <svg
            className={`${styles.ham} ${styles.hamRotate} ${styles.ham1} ${isOpen ? styles.active : ''}`}
            viewBox="0 0 100 100"
            width="50"
            onClick={handleIconClick}
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
        </LiquidGlass>
      </div>
    </div>
  );
}
