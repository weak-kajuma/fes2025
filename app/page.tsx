"use client"

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import styles from "./page.module.css";
import { useScrollSmoother } from "@/components/ScrollSmoother";
import AnimatedEllipse from "@/components/Ellipse/Ellipse";
import AnimatedBorder from "@/components/AnimatedBorder/AnimatedBorder"; // 追加

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

declare global {
  interface Window {
    scrollSmoother?: any;
  }
}

export default function Home() {
  const [opening, setOpening] = useState(true);
  const [showSVG, setShowSVG] = useState(true);
  const mainRef = useRef<HTMLDivElement>(null);
  const openingMaskRef = useRef<HTMLDivElement>(null);
  const maskPathRef = useRef<SVGPathElement>(null);
  const timetablePathRef = useRef<SVGPathElement>(null);
  const mapPathRef = useRef<SVGPathElement>(null);
  const searchPathRef = useRef<SVGPathElement>(null);
  const reservePathRef = useRef<SVGPathElement>(null);
  const ellipseRef = useRef<SVGSVGElement>(null);
  const pathname = usePathname();
  const [ellipseKey, setEllipseKey] = useState(0);
  const [timetableStart, setTimetableStart] = useState(false);
  // CSSに移行: hoverでのサイズ変更はCSS制御に戻す

  // 枠線用 refs
  const itemBorderRefs = useRef<(SVGRectElement | null)[]>([]);
  // itemごとのref
  const itemRef0 = useRef<HTMLDivElement>(null);
  const itemRef1 = useRef<HTMLDivElement>(null);
  const itemRef2 = useRef<HTMLDivElement>(null);
  const itemRef3 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setTimeout(() => setEllipseKey(prev => prev + 1), 0);
    return () => clearTimeout(id);
  }, [pathname]);

  useScrollSmoother();

  // ----- helpers (no behavior change) -----
  const startOpeningMaskAnimation = () => {
    const maskEl = openingMaskRef.current;
    const mainEl = mainRef.current;
    if (!maskEl || !mainEl) return;

    const tl = gsap.timeline({
      onComplete: () => {
        setOpening(false);
        setTimeout(() => {
          ScrollTrigger.refresh();
          const menu = document.querySelector('[data-menu-icon-wrapper]') as HTMLElement | null;
          const tabbar = document.querySelector('[data-tabbar-wrapper]') as HTMLElement | null;
          if (menu) {
            gsap.fromTo(menu, { x: 80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out' });
          }
          if (tabbar) {
            gsap.fromTo(tabbar, { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.1 });
          }
        }, 100);
      }
    });

    tl
      .fromTo(maskEl, { y: '100vh' }, { y: '0', zIndex: 10, duration: 1.5, ease: 'power2.out' })
      .fromTo(maskEl,
        { clipPath: 'inset(45% 45% 45% 45% round 24px)', webkitClipPath: 'inset(45% 45% 45% 45% round 24px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 24px)', webkitClipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 1.8, ease: 'power2.inOut' },
        '-=0.5')
      .add(() => {
        if (mainEl) mainEl.style.overflow = 'auto';
        if (maskEl) {
          maskEl.style.transform = 'none';
          maskEl.style.pointerEvents = 'none';
        }
      }, '+=0.1');
  };

  const initTopScrollAnimations = () => {
    ScrollTrigger.refresh();

    ScrollTrigger.create({
      trigger: `.${styles.top_wrapper}`,
      start: "top top",
      end: "bottom bottom",
      pin: `.${styles.top_inner}`,
      onLeave: () => gsap.set(`.${styles.bg}`, { marginTop: -1 }),
      onEnterBack: () => gsap.set(`.${styles.bg}`, { marginTop: 0 })
    });

    const ellipseTextPaths = ellipseRef.current?.querySelectorAll('textPath');

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: `.${styles.top_wrapper}`,
        start: "top top",
        end: "90% bottom",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    const logoEl = document.querySelector(`.${styles.top_logo}`) as HTMLElement;
    const targetEl = document.querySelector(`.${styles.target}`) as HTMLElement;
    const textEls = document.querySelectorAll(`.${styles.line} p`);
    const bgEls = gsap.utils.toArray(`.${styles.background} .${styles.bg}`) as HTMLElement[];
    const titleEl = document.querySelector(`.${styles.title}`) as HTMLElement;

    if (logoEl && targetEl) {
      const logoRect = logoEl.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();

      const scaleX = targetRect.width / logoRect.width;
      const scaleY = targetRect.height / logoRect.height;

      const logoCenterX = logoRect.left + logoRect.width / 2;
      const logoCenterY = logoRect.top + logoRect.height / 2;
      const targetCenterX = targetRect.left + targetRect.width / 2;
      const targetCenterY = targetRect.top + targetRect.height / 2;

      const x = targetCenterX - logoCenterX;
      const y = targetCenterY - logoCenterY;

      tl
        .to(logoEl, { x, y, scaleX: scaleX * 1.5, scaleY: scaleY * 1.5, ease: 'none' })
        .fromTo(textEls, {
          opacity: 0,
          transform: 'translate(200px, 0px)',
          clipPath: 'inset(0px 100% 0px 0px)',
        }, {
          opacity: 1,
          transform: 'translate(0px, 0px)',
          clipPath: 'inset(0px 0% -10%)',
          duration: 0.6,
          ease: 'power1.out',
          stagger: 0.2,
        })
        .to(logoEl, { x, y, scaleX, scaleY, ease: 'none' }, "<")
        .to(bgEls, { opacity: 1, stagger: { amount: 0.2, from: "end" }, ease: "none" }, "+=0.5")
        .to(textEls, { color: "rgb(203, 163, 115)" }, "<")
        .to(titleEl, { color: "rgb(203, 163, 115)" }, "<")
        .to(ellipseTextPaths ? ellipseTextPaths : [], { fill: "rgb(203, 163, 115)" }, "<");
    }
  };

  // const initItemBorderAnimation = () => {
  //   const tl = gsap.timeline({
  //     scrollTrigger: {
  //       trigger: `.${styles.about}`,
  //       start: "top 70%",
  //       toggleActions: "play none none none",
  //     }
  //   });

  //   itemBorderRefs.current.forEach((rectElement, index) => {
  //     if (rectElement) {
  //       const length = rectElement.getTotalLength();
  //       gsap.set(rectElement, { strokeDasharray: length, strokeDashoffset: length });
  //       tl.to(rectElement, {
  //         strokeDashoffset: 0,
  //         duration: 0.5,
  //         ease: 'power2.out',
  //       }, index * 0.2);
  //     }
  //   });

  //   return tl;
  // };

  useEffect(() => {
    if (ellipseRef.current) {
      const textPaths = ellipseRef.current.querySelectorAll('textPath');
      console.log(textPaths);
    }
  }, [ellipseKey]);

  // Opening animation
  useEffect(() => {
    if (!showSVG) return;
    const pathEl = maskPathRef.current;
    if (!pathEl) return;

    const length = pathEl.getTotalLength();
    pathEl.style.strokeDasharray = String(length);
    pathEl.style.strokeDashoffset = String(length);
    pathEl.style.opacity = '1';

    const svgTl = gsap.timeline();

    svgTl.to(pathEl, {
      strokeDashoffset: 0,
      duration: 2.6,
      ease: 'power2.inOut',
      onComplete: () => {
        setTimeout(() => setShowSVG(false), 800);
      }
    });

    svgTl.add(() => startOpeningMaskAnimation(), 2.6);
  }, [showSVG]);

  // Scroll animations
  useEffect(() => {
    const checkScrollSmoother = () => {
      const smoother = window.scrollSmoother || ScrollSmoother.get();
      if (!smoother) {
        setTimeout(checkScrollSmoother, 100);
        return;
      }

      initTopScrollAnimations();
    };

    if (!opening) {
      checkScrollSmoother();
    }

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [opening, styles.top_wrapper, styles.top_logo]);

  // Border animation for items
  useEffect(() => {
    if (opening) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: `.${styles.function}`,
        start: "top 20%",
        toggleActions: "play none none none",
      }
    });

    itemBorderRefs.current.forEach((rectElement, index) => {
      if (rectElement) {
        const length = rectElement.getTotalLength();
        gsap.set(rectElement, { strokeDasharray: length, strokeDashoffset: length });
        tl.to(rectElement, {
          strokeDashoffset: 0,
          duration: 0.5,
          ease: 'power2.out',
        }, index * 0.2);
      }
    });

    // When all border animations complete, start timetable handwriting
    tl.add(() => { setTimetableStart(true); });

    return () => {
      if (tl.scrollTrigger) tl.scrollTrigger.kill();
    };
  }, [opening]);

  useEffect(() => {
    document.body.style.overflow = opening ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [opening]);

  // Timetable, Map, Search, Reserve handwriting animation (start together)
  useEffect(() => {
    if (!timetableStart) return;
    try {
      const animatePath = (p: SVGPathElement | null, durationSec: number) => {
        if (!p) return;
        const length = p.getTotalLength();
        p.style.strokeDasharray = String(length);
        p.style.strokeDashoffset = String(length);
        p.style.opacity = '1';
        p.style.strokeOpacity = '1';
        gsap.to(p, { strokeDashoffset: 0, duration: durationSec, ease: 'power2.inOut' });
      };
      animatePath(timetablePathRef.current, 1.2);
      animatePath(mapPathRef.current, 1.2);
      animatePath(searchPathRef.current, 1.2);
      animatePath(reservePathRef.current, 1.2);
    } catch {}
  }, [timetableStart]);

  return (
    <>
      {/* Opening SVG */}
      {showSVG && (
      <div style={{ position: 'fixed', zIndex: 2, top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(34,34,34,1)', display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', WebkitTouchCallout: 'none', pointerEvents: 'none' }}>
        <svg width={500} height={200} viewBox="0 0 500 200" style={{ display: 'block', maxWidth: '80vw', maxHeight: '40vh', userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }} onDragStart={(e) => e.preventDefault()}>
          <defs>
            <mask id="handwrite-mask"> <rect x="0" y="0" width="500" height="200" fill="#000" />
              <path ref={maskPathRef} d="M 85.158784,63.945946 C 154.63851,32.89527 131.27365,-4.3040541 77.472973,33.817568 c 0,0 -36.277027,29.206081 -5.533784,55.952702 0,0 34.432431,33.51014 -13.219594,47.03716 0,0 -22.75,6.14865 -34.739865,-9.83784 0,0 -9.530406,-15.06418 14.756757,-22.13513 L 137.11486,73.783784 c 0,0 -43.347968,59.949326 -64.560806,117.131756 l 40.888516,-81.16216 c 0,0 32.58784,-38.121623 38.42905,-19.368245 0,0 -16.29392,59.027025 -47.95946,37.506755 0,0 182.9223,-195.219593 106.67906,-36.584458 0,0 -2.7669,-27.054054 -33.20271,6.456082 0,0 -30.43581,68.864866 15.37163,20.290536 l 16.90878,-24.287158 c 0,0 -22.44257,50.111488 -4.91892,43.040538 0,0 59.64189,-181.385133 44.88514,-52.263511 0,0 -22.75,19.368241 -30.43582,53.493241 0,0 25.82433,-43.655403 58.41217,-54.722971 0,0 -44.27027,39.351351 10.4527,14.449325 l 25.51689,-8.300676 c 3.07433,-0.922297 62.10135,-35.969595 63.63851,-64.560811 -5.53378,4.611487 -8.6081,-24.59459457 -63.94594,63.638514 l -23.36487,43.962839 c 0,0 30.43581,-44.270272 61.17906,-47.037164 l -26.43919,12.297298 c 2.76689,2.766896 -24.28716,75.320946 37.81419,12.604726 l 22.13513,-12.297294 c 0,0 51.64865,-28.898649 62.40879,-75.628378 0,0 -28.28379,0 -62.10135,73.476351 0,0 -34.73987,74.091221 18.44594,12.912161 l 16.29392,6.76351 c 0,0 39.65878,-11.06756 35.66216,-29.513509 v 0 C 420.875,72.861487 387.6723,179.54054 468.21959,110.67568" stroke="#fff" strokeWidth={16.7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </mask>
          </defs>

          <g mask="url(#handwrite-mask)">

            <text x="19.1" y="154.95" fontFamily="'Freestyle Script', 'Bernard MT Condensed', cursive" fontSize="210.032" fill="#fff" opacity="0.98" style={{ fontStyle: 'normal', fontWeight: 'normal', fontStretch: 'condensed', letterSpacing: 0, stroke: 'none', strokeWidth: 16.67, userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none', pointerEvents: 'none' }} transform="scale(1.0643544,0.93953669)"> Sparkle </text>
          </g>
        </svg>
      </div>
      )}

      {!showSVG && (
        <div style={{ position: 'fixed', zIndex: 1, top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(34,34,34,1)', userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', WebkitTouchCallout: 'none', pointerEvents: 'none' }}></div>
      )}


      {/* Main */}
      <div ref={openingMaskRef} className={styles.openingMask}>
        <div data-smooth-wrapper>
          <div ref={mainRef} className={styles.main} data-scroll-container>

            <div className={styles.top_wrapper}>
              <div className={styles.top_inner}>
                <div className={styles.top_inner_relative}>
                  <div className={styles.top_logo}>
                    <h1 className={styles.title}>青霞祭</h1>
                    <div className={styles.animatedCircle} key={`ellipse-${ellipseKey}`}>
                      <AnimatedEllipse ref={ellipseRef} text="Seikasai 2025 Seikasai 2025 Seikasai 2025 Seikasai 2025 " />
                    </div>
                  </div>

                  <div className={styles.content_wrapper}>
                    <div className={styles.content}>
                      <div className={styles.line}>
                        <p>Seikasai.</p>
                        <div className={styles.target}></div>
                      </div>
                      <div className={styles.line}>
                        <p>2025.</p>
                        <p>Takatsuki.</p>
                      </div>
                      <div className={styles.line}>
                        <p>SchoolFestival</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.background}>
                  {Array.from({ length: 15 }).map((_, i) => (
                    <div key={i} className={styles.bg}></div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.function}>
              <div className={styles.function_inner}>
                <div className={styles.title}>
                  <h2>Tools</h2>
                  <p>文化祭の体験をより良いものにするためのツール</p>
                </div>
                <div className={styles.items}>
                  <AnimatedBorder
                    strokeColor="#cba373"
                    borderRadius={12}
                    setAnimationTarget={(el) => (itemBorderRefs.current[0] = el)}
                    targetRef={itemRef0}
                  >
                    <div className={styles.item} ref={itemRef0}>
                      <div className={styles.text}>
                        <svg id="timetable-svg" width={600} height={200} viewBox="0 0 158.75 52.916665" >
                          <defs>
                            <mask id="timetable-handwrite-mask">
                              <rect x="0" y="0" width="158.75" height="52.916665" fill="#000" />
                              <path id="timetable-handwrite-path" ref={timetablePathRef} d="m 6.07079,22.828213 c 1.012082,-3.312268 3.864314,-3.864312 3.864314,-3.864312 l 14.353159,0.36803 c 0,0 1.196096,0.09201 2.392193,3.58829 L 24.472278,19.515946 H 16.467632 V 38.7455 l -4.140335,-0.09201 h 8.096654 l 7.452603,-12.697024 3.864311,-0.276022 0.18402,13.065056 -3.496287,0.09201 h 6.440517 l -0.092,-13.157066 4.23234,0.736059 1.38011,-0.828067 -0.18402,13.341079 h -3.03624 5.61245 l -2.57621,-8.004647 v -1.840149 c 3.49629,-4.968402 8.74071,-2.944238 8.74071,-0.09201 l 0.092,9.844798 -3.03624,-0.276022 6.07249,0.184015 -3.22026,-4.140335 0.18402,-5.428439 c 4.32435,-5.980483 9.20074,-2.760223 8.7407,0.276023 l 0.092,9.384758 -3.12824,-0.184015 h 6.44052 l -0.18401,-7.360595 13.34107,0.09201 c 0.092,-8.832716 -10.85687,-5.980485 -10.30483,-0.276024 l -0.092,1.196096 c -0.36804,10.304833 11.86895,4.32435 11.2249,2.944238 l 2.30019,-12.513011 c 1.10409,-3.680297 5.79646,-4.048327 5.79646,-4.048327 l 12.23699,0.276022 c 2.57621,1.012082 2.57621,3.496283 2.57621,3.496283 l -6.44052,-3.772305 -3.31227,0.184015 -0.092,19.781598 -3.58829,-0.09201 h 7.26858 l 7.91264,-8.188662 1.748135,-1.288101 c 1.84015,-4.140335 7.26859,-3.496283 7.72863,-0.36803 -0.18402,1.288104 0.27602,7.820632 0.27602,7.820632 -7.54461,4.416357 -14.721185,-1.840148 -0.18401,-5.612453 l 0.092,6.624535 c 0,0 0.64406,2.668216 2.94424,-0.184015 l 0.092,-17.757435 h 5.88848 l 0.092,19.321562 1e-5,-10.120818 c 10.21283,-9.568774 15.91729,15.273234 0.55205,7.728624 l 9.84479,-17.849442 6.25651,-0.276022 0.18401,20.241635 h -3.12825 5.98048 l -0.092,-6.992565 13.80111,-0.276022 c 0.18402,-6.348513 -9.66078,-8.004647 -10.39684,-0.276022 -2.02416,5.060408 6.1645,12.052974 11.04089,3.864312 L 152.36836,13.662407 31.358475,13.792526 v 2.862599 c -2.342125,12.361226 2.99272,0.260236 0,0" stroke="#fff" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeOpacity={0} />
                            </mask>
                          </defs>

                          <g id="timetable-handwrite-group" mask="url(#timetable-handwrite-mask)">
                            <text x="5.3331494" y="39.370758" fontFamily="'HGSeikaishotaiPRO','Freestyle Script','Bernard MT Condensed', cursive" fontSize="29.9119" fill="#cba373" style={{ fontStyle: 'normal', fontWeight: 'normal', fontStretch: 'normal', letterSpacing: 0, stroke: 'none' }}>
                              TimeTable
                            </text>
                          </g>
                        </svg>
                      </div>
                    </div>
                  </AnimatedBorder>
                  <AnimatedBorder
                    strokeColor="#cba373"
                    borderRadius={12}
                    setAnimationTarget={(el) => (itemBorderRefs.current[1] = el)}
                    targetRef={itemRef1}
                  >
                    <div className={styles.item} ref={itemRef1}>
                      <div className={styles.text}>
                        <svg id="map-svg" width={600} height={200} viewBox="0 0 600 200">
                          <defs>
                            <mask id="map-handwrite-mask">
                              <rect x="0" y="0" width="600" height="200" fill="#000" />
                              <path id="map-handwrite-path" ref={mapPathRef} d="m 177.22094,129.07722 23.6815,-0.26024 -11.19016,-0.26024 -0.52047,-74.167348 -10.66969,-0.260236 15.0937,1.040945 31.22836,71.044519 30.18741,-71.044519 18.73701,-0.780709 -13.01181,0.260237 -0.78071,73.907111 -14.31299,-0.52047 h 27.06456 l 4.03071,-34.924746 13.24908,-0.552044 h 4.04832 -4.04832 c 2.39219,-20.609666 34.96282,-8.464684 29.8104,0.368029 l -0.36803,26.682161 c -30.54646,27.78624 -51.70817,-14.35316 -0.55204,-20.793685 l 0.73606,25.578065 c 4.23234,7.3606 7.72862,3.49628 11.04089,-0.18401 l -0.18401,-43.611527 21.16171,0.73606 0.18401,-5.888476 v 70.109663 l -12.51301,-0.55204 24.28996,-0.18402 -12.14498,-1.10409 0.73606,-51.340145 c 34.77881,-33.490707 40.66729,20.793685 36.25093,25.578065 0,0 -17.66543,22.2658 -36.98699,1.10409" stroke="#fff" strokeWidth={8.5} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeOpacity={0} />
                            </mask>
                          </defs>

                          <g id="map-handwrite-group" mask="url(#map-handwrite-mask)">
                            <text x="174.40117" y="131.13655" fontFamily="'HGSeikaishotaiPRO','Freestyle Script','Bernard MT Condensed', cursive" fontSize="111.78" fill="#cba373" style={{ fontStyle: 'normal', fontWeight: 'normal', fontStretch: 'normal', letterSpacing: 0, stroke: 'none' }}>
                              Map
                            </text>
                          </g>
                        </svg>
                      </div>
                    </div>
                  </AnimatedBorder>
                  <AnimatedBorder
                    strokeColor="#cba373"
                    borderRadius={12}
                    setAnimationTarget={(el) => (itemBorderRefs.current[2] = el)}
                    targetRef={itemRef2}
                  >
                    <div className={styles.item} ref={itemRef2}>
                      <div className={styles.text}>
                        <svg id="search-svg" width={600} height={200} viewBox="0 0 600 200">
                          <defs>
                            <mask id="search-handwrite-mask">
                              <rect x="0" y="0" width="600" height="200" fill="#000" />
                              <path id="search-handwrite-path" ref={searchPathRef} d="m 188.93157,79.89255 -6.24567,-17.175596 -3.64331,3.643307 c -9.62874,-7.807088 -43.97993,-8.587798 -36.69331,17.175599 0.7807,8.327562 28.62599,12.491344 28.62599,12.491344 0,0 22.90079,4.424016 21.33937,24.462216 0,0 -5.7252,25.76339 -43.7197,9.36851 l -6.76614,1.04094 -3.90355,-14.83347 7.28662,9.88898 52.04726,-17.95631 50.74609,0.26024 c 0,-23.681504 -37.99451,-31.488594 -39.81616,-1.30118 0,0 -7.02638,17.69607 15.87442,26.28387 0,0 21.59961,4.16378 26.28386,-11.97087 l 11.97088,-21.859854 7.02638,0.260236 -3.64331,-3.383072 c 0,0 18.73701,-21.859851 29.92717,2.081891 v 26.023629 c 0,0 -25.7634,18.21654 -32.00907,2.08189 0,0 -7.28661,-16.13465 31.74884,-21.85985 l -0.26024,22.38033 c 0,0 -2.60236,12.49134 11.19016,3.64331 1.30119,-1.56142 0.26024,-44.24018 0.26024,-44.24018 l 23.42127,-2.342127 -8.32756,5.985435 6.50591,-0.520472 0.7807,45.281124 -12.2311,0.52047 27.32481,-0.52047 -15.09371,-3.38308 V 101.7524 c 0,0 7.80709,-15.614177 20.0382,-16.915358 l -2.34213,7.286617 7.28662,-2.602363 c -2.08189,-20.038197 78.8516,-13.532289 47.62324,10.149216 0.78071,-20.038197 -37.21379,-11.450398 -36.17284,5.985438 0,0 -9.10827,29.14647 23.42127,26.80434 0,0 11.71063,2.08189 16.65512,-9.36851 l -0.52047,-63.497662 24.20198,1.301182 -0.52047,-2.8626 v 76.76972 l -11.71064,-0.26024 22.38033,-0.26024 -11.71064,-4.16378 1.04095,-30.187411 c 0,0 30.70788,-28.886232 36.17285,2.081891 l 0.26023,33.05001 -12.49134,-0.52047 24.20198,-0.52047" stroke="#fff" strokeWidth={9.1} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeOpacity={0} />
                            </mask>
                          </defs>

                          <g id="search-handwrite-group" mask="url(#search-handwrite-mask)">
                            <text x="133.3093" y="137.41481" fontFamily="'HGSeikaishotaiPRO','Freestyle Script','Bernard MT Condensed', cursive" fontSize="111.78" fill="#cba373" style={{ fontStyle: 'normal', fontWeight: 'normal', fontStretch: 'normal', letterSpacing: 0, stroke: 'none' }}>
                              Search
                            </text>
                          </g>
                        </svg>
                      </div>
                    </div>
                  </AnimatedBorder>
                  <AnimatedBorder
                    strokeColor="#cba373"
                    borderRadius={12}
                    setAnimationTarget={(el) => (itemBorderRefs.current[3] = el)}
                    targetRef={itemRef3}
                  >
                    <div className={styles.item} ref={itemRef3}>
                      <div className={styles.text}>
                        <svg id="reserve-svg" width={600} height={200} viewBox="0 0 600 200">
                          <defs>
                            <mask id="reserve-handwrite-mask">
                              <rect x="0" y="0" width="402.69147" height="86.464462" fill="#000" />
                              <path id="reserve-handwrite-path" ref={reservePathRef} d="m 105.91619,56.731519 42.41852,0.520472 c 21.59961,0.780709 28.10552,31.488596 -3.90355,35.131904 l -25.50316,10e-7 1.04095,-34.611432 0.26023,71.825226 h -15.0937 l 28.88623,-0.26024 -4.16378,-36.693318 12.49134,-0.520473 24.98269,37.734271 14.05276,0.52047 -0.52047,-27.32482 50.74608,0.78071 c -0.26024,-24.722447 -38.77521,-29.927174 -40.33663,0 0,0 -3.38307,22.64056 20.0382,26.02364 0,0 17.69607,0.52047 22.38032,-12.23111 -29.14647,-31.748833 54.38939,-110.0799666 42.41852,-23.421271 -11.19016,-23.681505 -51.26655,-0.260236 -15.61418,11.970871 20.81891,4.94449 22.38033,21.07915 0,23.94174 0,0 -14.83347,3.38307 -16.13465,-11.71063 l 1.04094,13.79252 32.78978,-28.36576 53.60868,-0.52047 c -0.7807,-30.968122 -42.41852,-21.85985 -39.29568,0.26024 0,0 -3.64331,21.07914 17.69607,25.50316 0,0 20.29843,0.78071 23.94174,-11.19016 l -0.26024,-34.871672 23.94175,-1.301182 -5.20473,3.643309 4.68425,0.520472 0.26024,45.020883 -12.49134,-0.26023 27.32481,-0.26024 -15.09371,-9.36851 V 96.807913 c 0,0 14.05277,-20.038197 20.29844,-14.312998 l -4.68426,4.424017 c 0,0 9.62875,-6.505908 9.36851,-4.94449 -0.26024,1.561418 -0.26024,4.684254 -0.26024,4.684254 l 4.94449,-3.643308 h 22.64057 l -8.32756,2.862599 18.21654,43.459463 19.51772,-45.541353 -11.71063,-0.780709 h 20.03819 l 0.26024,21.599612 49.4449,-1.56142 c 0,-20.038192 -35.39214,-31.488591 -39.03545,1.30119 0,0 -4.68425,22.64056 18.99725,26.28387 0,0 16.13466,-0.26024 21.85985,-12.75158" stroke="#fff" strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeOpacity={0} />
                            </mask>
                          </defs>

                          <g id="reserve-handwrite-group" mask="url(#reserve-handwrite-mask)">
                            <text x="102.24496" y="133.12932" fontFamily="'HGSeikaishotaiPRO','Freestyle Script','Bernard MT Condensed', cursive" fontSize="111.78" fill="#cba373" style={{ fontStyle: 'normal', fontWeight: 'normal', fontStretch: 'normal', letterSpacing: 0, stroke: 'none' }}>
                              Reserve
                            </text>
                          </g>
                        </svg>
                      </div>
                    </div>
                  </AnimatedBorder>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
