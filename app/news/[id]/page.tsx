"use client"

import styles from "./page.module.css";
import news from "@/public/data/news.json";
import { notFound } from "next/navigation";
import Image from "next/image";
import React, { useRef, useEffect } from "react";
import gsap from "gsap"; // Ensure gsap is imported
import { ScrollSmoother } from "gsap/ScrollSmoother"; // Correct import for ScrollSmoother

import { useScrollSmoother } from "@/components/ScrollSmoother";

export type NewsItem = {
  id: number;
  title: string;
  type: string;
  main: string;
  imgUrl?: string;
  updatedAt: string;
};

export default function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  useScrollSmoother();

  const item = news.find((n: NewsItem) => String(n.id) === id);
  if (!item) return notFound();


  return (
    <div className={styles.wrapper} data-smooth-wrapper ref={wrapperRef}>
      <div className={styles.inner} data-scroll-container ref={containerRef}>

        <div className={styles.breadcrumbs}>
          <div className={styles.txt}>News</div>
          <div className={styles.txt}>{item.title}</div>
        </div>

        <h1 className={styles.title}>{item.title}</h1>

        <div className={styles.tags}>
          <div className={styles.tag}>{item.type}</div>
          <div className={styles.tag}>{item.updatedAt}</div>
        </div>

        <div className={styles.image}>
          {item.imgUrl &&
            <Image width={500} height={300} src={item.imgUrl} alt={item.title} />
          }
        </div>

        <div className={styles.mainTxt}>
          <p>{item.main}</p>
        </div>

      </div>
    </div>
  );
}
