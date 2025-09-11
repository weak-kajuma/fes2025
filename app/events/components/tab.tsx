"use client";

import { useState, useRef, useEffect, ReactNode } from "react";

import styles from './tab.module.css';

type TabProps = {
  title: ReactNode;
  children: ReactNode;
};

export default function Tab({ title, children }: TabProps) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  // 追加: 画面幅を監視
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 600);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (open && contentRef.current) {
      const newHeight = contentRef.current.scrollHeight;
      if (contentHeight !== newHeight) {
        setContentHeight(newHeight);
      }
    }
    if (!open && contentHeight !== 0) {
      setContentHeight(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div
      className={styles.tab}
      style={{
        height: open
          ? `calc(${String(contentHeight)}px + ${isMobile ? "5rem" : "7rem"})`
          : undefined,
        transition: "height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s",
        position: "relative"
      }}
    >
      {/* 判定用のdivを重ねる */}
      <div
        className={styles.toggle}
        onClick={() => { setOpen(o => !o); }}
      />
      <h2 className={open ? styles.open : ""}>{title}</h2>
      <div
        className={styles.tabContent}
        style={{
          maxHeight: open ? `calc(${String(contentHeight + 1)}px)` : "0",
          opacity: open ? 1 : 0,
          transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s",
          overflow: "hidden",
        }}
      >
        <div className={styles.content} ref={contentRef}>
          {children}
        </div>
      </div>
    </div>
  );
}