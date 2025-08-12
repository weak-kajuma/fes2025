"use client"

import styles from './page.module.css'
import { useLocomotiveScroll } from "@/components/LocomotiveScroll";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";

export default function TestTop() {
  useLocomotiveScroll();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const tl = gsap.timeline();


  }, []);

  return (
    <div className={styles.main} data-scroll-container>
      <div className={styles.top}>
        <video src="/night_sky_video.mp4" autoPlay loop muted playsInline className={styles.video}></video>
        <h1>青霞祭</h1>

      </div>
    </div>
  )
}