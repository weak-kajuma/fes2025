"use client"

import { useEffect } from 'react';
import gsap from 'gsap';
import CustomEase from 'gsap/CustomEase';

gsap.registerPlugin(CustomEase);
CustomEase.create("hop", ".9, 0, .1, 1")

const useRevealer = () => {
  useEffect(() => {
    const element = document.querySelector("[data-reveal]");

    gsap.to(element, {
      scaleY: 0,
      duration: 1.25,
      delay: 1,
      ease: "hop",
    });
  }, []);
}

export default useRevealer;
