"use client"

import gsap from "gsap";
import { useCallback } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import styles from "./page.module.css";
import { useScrollSmoother } from "@/components/ScrollSmoother";
import AnimatedEllipse from "@/components/Ellipse/Ellipse";
import { fetchLocalJson } from "@/lib/fetchLocalJson";
import NewsSlider from "@/components/NewsCarousel";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

declare global {
  interface Window {
    scrollSmoother?: any;
  }
}

export default function Home() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
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
  const router = useRouter();
  const [ellipseKey, setEllipseKey] = useState(0);
  const [timetableStart, setTimetableStart] = useState(false);

  const toolsRootRef = useRef<HTMLDivElement>(null);
  const itemBorderRefs = useRef<(SVGRectElement | null)[]>([]);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fetchNews = useCallback(async () => {
    try {
      const data = await fetchLocalJson<Array<{ id: number; title: string; type: string; main: string; imgUrl: string }>>("/data/news.json");
      setNewsItems(data);
    } catch (e) {
      setNewsItems([]);
    }
  }, []);
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  useScrollSmoother();

  // オープニングのマスクアニメーション
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

  // トップのスクロールアニメーション（context化）
  const topCtx = useRef<gsap.Context | null>(null);
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

    const logoEl = mainRef.current?.querySelector(`.${styles.top_logo}`) as HTMLElement;
    const targetEl = mainRef.current?.querySelector(`.${styles.target}`) as HTMLElement;
    const textEls = mainRef.current?.querySelectorAll(`.${styles.line} p`) ?? [];
    const bgEls = mainRef.current?.querySelectorAll(`.${styles.background} .${styles.bg}`) ?? [];
    const titleEl = mainRef.current?.querySelector(`.${styles.title}`) as HTMLElement;

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

  useEffect(() => {
    if (opening) return;

    const ensureSmoother = () => {
      const smoother = window.scrollSmoother || ScrollSmoother.get();
      if (!smoother) {
        const id = setTimeout(ensureSmoother, 100);
        return () => clearTimeout(id);
      }

      topCtx.current?.revert();
      topCtx.current = gsap.context(() => {
        initTopScrollAnimations();
      }, mainRef);

      return () => topCtx.current?.revert();
    };

    const cleanup = ensureSmoother();
    return typeof cleanup === 'function' ? cleanup : undefined;
  }, [opening]);

  // ellipseのなんか
  useEffect(() => {
    if (ellipseRef.current) {
      const textPaths = ellipseRef.current.querySelectorAll('textPath');
      console.log(textPaths);
    }
  }, [ellipseKey]);

  // ellipseのなんか2
  useEffect(() => {
    const id = setTimeout(() => setEllipseKey(prev => prev + 1), 0);
    return () => clearTimeout(id);
  }, [pathname]);

  // オープニングアニメーション
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

  // 枠線アニメーション（context化）
  const borderCtx = useRef<gsap.Context | null>(null);
  useEffect(() => {
    if (opening) return;

    borderCtx.current?.revert();
    borderCtx.current = gsap.context(() => {
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

      tl.add(() => { setTimetableStart(true); });
    }, mainRef);

    return () => borderCtx.current?.revert();
  }, [opening]);

  // bodyのオーバーフロー
  useEffect(() => {
    document.body.style.overflow = opening ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [opening]);

  // 手書きアニメーション
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

  // Toolsタイトルのアニメーション（context化・opening完了後一度だけ）
  const toolsCtx = useRef<gsap.Context | null>(null);
  const toolsInited = useRef(false);
  useEffect(() => {
    if (opening || toolsInited.current) return;

    const ensureSmoother = () => {
      const smoother = window.scrollSmoother || ScrollSmoother.get();
      if (!smoother) {
        const id = setTimeout(ensureSmoother, 100);
        return () => clearTimeout(id);
      }

      toolsCtx.current?.revert();
      toolsCtx.current = gsap.context(() => {
        const root = toolsRootRef.current;
        if (!root) return;
        const title = root.querySelector(`.${styles.tools_title}`) as HTMLElement | null;
        const subtitle = root.querySelector('#tools-subtitle') as HTMLElement | null;
        const items = root.querySelectorAll(`.${styles.item}`);
        if (!title || !subtitle || !items.length) return;

        gsap.set([title, subtitle], { y: '100%', opacity: 0 });
        gsap.set(items, { y: '100%', opacity: 0 });

        const tl = gsap.timeline({
          defaults: { ease: 'power2.out' },
          scrollTrigger: {
            trigger: root,
            start: 'top 50%',
            toggleActions: 'play none none none',
          },
        });
        tl.to(title,   { y: 0, opacity: 1 })
          .to(subtitle,{ y: 0, opacity: 1 }, '-=0.2')
          .to(items,   { y: 0, opacity: 1, stagger: 0.18 }, '-=0.1');
      }, toolsRootRef);

      toolsInited.current = true;
      return () => toolsCtx.current?.revert();
    };

    const cleanup = ensureSmoother();
    return typeof cleanup === 'function' ? cleanup : undefined;
  }, [opening]);

  // functionItemホバーアニメーション（stateは使うが他エフェクトに影響しない）
  const handleTextWrapperHover = (index: number, hover: boolean) => {
    setHoveredIndex(hover ? index : null);

    itemRefs.current.forEach((itemEl, i) => {
      if (!itemEl) return;
      const text = itemEl.querySelector(`.${styles.text}`);
      if (text) {
        gsap.to(text, {
          opacity: hover ? (i === index ? 1 : 0.5) : 1,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    });
    // 既存のtagsアニメーション
    const itemEl = itemRefs.current[index];
    if (!itemEl) return;

    const text = itemEl.querySelector(`.${styles.text}`);
    const tags = itemEl.querySelectorAll(`.${styles.tag}`);
    const imgs = itemEl.querySelectorAll(`.${styles.img}`);

    gsap.to(text, {
      fontSize: hover ? '10rem' : '8rem',
      // color: hover ? 'rgb(203, 163, 115)' : '#fff',
      duration: 0.4,
      ease: "power2.out",
    });
    gsap.to(itemEl, {
      marginBottom: hover ? 0 : '-2.2rem',
    });
    tags.forEach((tag) => {
      gsap.to(tag, {
        opacity: hover ? 1 : 0,
        duration: 0.4,
        ease: "power2.out",
      });
    });
    imgs.forEach((img) => {
      gsap.to(img, {
        opacity: hover ? 1 : 0,
        transform: hover ? 'scale(1)' : 'scale(.4)',
        duration: 0.4,
        ease: "power2.out",
      });
    });
  };

  // ニュースデータ
  const [newsItems, setNewsItems] = useState<Array<{ id: number; title: string; type: string; main: string; imgUrl: string }>>([]);



  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!listRef.current) return;
    const list = listRef.current;

    const anim = gsap.to(list, {
      x: `-=${list.scrollWidth / 2}`,
      duration: 2,
      ease: "linear",
      repeat: -1,
      modifiers: {
        x: (x) => {
          const width = list.scrollWidth / 2;
          return (parseFloat(x) % width) + "px";
        },
      },
    });

    // クリーンアップ関数は副作用の後始末のみを行う
    return () => {
      anim.kill();
    };
  }, []);





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

            <div className={styles.tools} ref={toolsRootRef}>
              <div className={styles.tools_inner}>

                <div className={styles.title}>
                  <h2 className={styles.tools_title}>Tools</h2>
                  <p id="tools-subtitle">文化祭の体験をより向上させます</p>
                </div>

                <div className={styles.items}>

                  {[0,1,2,3].map((i) => (
                    <div
                      className={styles.item}
                      ref={el => { itemRefs.current[i] = el; }}
                      key={i}
                    >
                      <div className={styles.item_grid}>
                        <div className={styles.img}>
                          <div className={styles.img_inner}></div>
                        </div>
                        <div className={styles.img}>
                          <div className={styles.img_inner}></div>
                        </div>
                        <div className={styles.text_wrapper}>
                          <div className={styles.text_inner}>
                            <h2
                              className={styles.text}
                              onMouseEnter={() => handleTextWrapperHover(i, true)}
                              onMouseLeave={() => handleTextWrapperHover(i, false)}
                              onClick={() => {
                                if (i === 0) router.push("/timetable");
                                else if (i === 1) router.push("/map");
                                else if (i === 2) router.push("/search");
                                else if (i === 3) router.push("/reserve");
                              }}
                            >
                              {i === 0 && "TIME TABLE"}
                              {i === 1 && "MAP"}
                              {i === 2 && "SEARCH"}
                              {i === 3 && "RESERVE"}
                            </h2>
                            <div className={styles.info}>
                              {i === 0 && <><div className={styles.tag}>timetable</div><div className={styles.tag}>aaa</div></>}
                              {i === 1 && <><div className={styles.tag}>map</div><div className={styles.tag}>bbb</div></>}
                              {i === 2 && <><div className={styles.tag}>search</div><div className={styles.tag}>ccc</div></>}
                              {i === 3 && <><div className={styles.tag}>reserve</div><div className={styles.tag}>ddd</div></>}
                            </div>
                          </div>
                        </div>
                        <div className={styles.img}>
                          <div className={styles.img_inner}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.news}>
              <div className={styles.news_inner}>

                <div className={styles.title}>
                  <h2 className={styles.news_title}>News</h2>
                  <p id="news-subtitle">最新情報をお届けします</p>
                </div>

                <div className={styles.news_list_wrapper}>
                  {/* <ul ref={listRef} className={styles.list}>
                    {[...newsItems, ...newsItems].map((item, index) => (
                      <li key={item.id} className={styles.list_item}>
                        <div className={styles.image}>
                          {item.imgUrl && <img src={item.imgUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        </div>
                        <p className={styles.type_text}>{item.type}</p>
                        <div className={styles.main_text}>
                          <h4 className={styles.title}>{item.title}</h4>
                          <div className={styles.button}>詳細</div>
                        </div>
                      </li>
                    ))}
                  </ul> */}

                  <NewsSlider items={newsItems} />

                  <div className={styles.controller}>
                    <nav className={styles.nav}>
                      <div className={styles.prev}>
                        <span className={styles.button_inner}>
                          <svg className={styles.icon}>
                            <use xlinkHref="/sprite.svg#icon-arrow-left"></use>
                          </svg>
                        </span>
                      </div>
                      <div className={styles.next}>
                        <span className={styles.button_inner}>
                          <svg className={styles.icon}>
                            <use xlinkHref="/sprite.svg#icon-arrow-right"></use>
                          </svg>
                        </span>
                      </div>
                      <div className={styles.pagination}></div>
                    </nav>
                    <div className={styles.toNews_button}></div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
