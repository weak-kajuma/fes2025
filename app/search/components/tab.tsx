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

  useEffect(() => {
    if (open && contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [open, children]);

  return (
    <div
      className={styles.tab}
      style={{
        height: open ? `calc(${contentHeight}px + 4vw + 2vw)` : "4vw",
        transition: "height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s",
        position: "relative"
      }}
    >
      {/* 判定用のdivを重ねる */}
      <div
        className={styles.toggle}
        onClick={() => setOpen(o => !o)}
      />
      <h2 className={open ? styles.open : ""}>{title}</h2>
      <div
        className={styles.tabContent}
        style={{
          maxHeight: open ? `calc(${contentHeight + 1}px)` : "0",
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