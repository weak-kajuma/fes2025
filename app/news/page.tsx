"use client"

import styles from "./page.module.css";
import Link from "next/link";
import news from "@/public/data/news.json";
import { useScrollSmoother } from "@/components/ScrollSmoother";
import { useEffect, useRef, useState } from "react";
import AnimatedLink from "@/components/AnimatedLink";
import Image from "next/image";

export type NewsItem = {
  id: number;
  title: string;
  type: string;
  main: string;
  imgUrl?: string;
};

export default function NewsPage() {
  useScrollSmoother();
  const railRef = useRef<HTMLDivElement>(null);
  // type一覧抽出
  const types = Array.from(new Set(news.map(n => n.type)));
  const [selectedType, setSelectedType] = useState<string>("All");
  const filteredNews = selectedType === "All" ? news : news.filter(n => n.type === selectedType);

  // GSAP横スクロールテキスト
  useEffect(() => {
    if (!railRef.current) return;
    // 動的importでSSR回避
    (async () => {
      const gsap = (await import("gsap")).default;
      const { Observer } = await import("gsap/Observer");
      gsap.registerPlugin(Observer);

      // horizontalLoop関数
      function horizontalLoop(items: Element[], config: any = {}) {
        items = Array.from(items);
        let tl = gsap.timeline({
          repeat: config.repeat,
          paused: config.paused,
          defaults: { ease: "none" },
          onReverseComplete: () => { tl.totalTime(tl.rawTime() + tl.duration() * 100); return; }
        });
        let length = items.length,
          startX = (items[0] as HTMLElement).offsetLeft,
          times: number[] = [],
          widths: number[] = [],
          xPercents: number[] = [],
          curIndex = 0,
          pixelsPerSecond = (config.speed || 1) * 100,
          snap = config.snap === false ? (v: number) => v : gsap.utils.snap(config.snap || 1),
          totalWidth, curX, distanceToStart, distanceToLoop, item, i;
        gsap.set(items, {
          xPercent: (i: number, el: Element) => {
            let w = widths[i] = parseFloat(gsap.getProperty(el, "width", "px") as string);
            xPercents[i] = snap(parseFloat(gsap.getProperty(el, "x", "px") as string) / w * 100 + (gsap.getProperty(el, "xPercent") as number));
            return xPercents[i];
          }
        });
        gsap.set(items, { x: 0 });
        totalWidth = (items[length - 1] as HTMLElement).offsetLeft + xPercents[length - 1] / 100 * widths[length - 1] - startX + (items[length - 1] as HTMLElement).offsetWidth * (gsap.getProperty(items[length - 1], "scaleX") as number) + (parseFloat(config.paddingRight) || 0);
        for (i = 0; i < length; i++) {
          item = items[i];
          curX = xPercents[i] / 100 * widths[i];
          distanceToStart = (item as HTMLElement).offsetLeft + curX - startX;
          distanceToLoop = distanceToStart + widths[i] * (gsap.getProperty(item, "scaleX") as number);
          tl.to(item, { xPercent: snap((curX - distanceToLoop) / widths[i] * 100), duration: distanceToLoop / pixelsPerSecond }, 0)
            .fromTo(item, { xPercent: snap((curX - distanceToLoop + totalWidth) / widths[i] * 100) }, { xPercent: xPercents[i], duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond, immediateRender: false }, distanceToLoop / pixelsPerSecond)
            .add("label" + i, distanceToStart / pixelsPerSecond);
          times[i] = distanceToStart / pixelsPerSecond;
        }
        function toIndex(index: number, vars: any = {}) {
          (Math.abs(index - curIndex) > length / 2) && (index += index > curIndex ? -length : length);
          let newIndex = gsap.utils.wrap(0, length, index),
            time = times[newIndex];
          if ((time > tl.time()) !== (index > curIndex)) {
            vars.modifiers = { time: gsap.utils.wrap(0, tl.duration()) };
            time += tl.duration() * (index > curIndex ? 1 : -1);
          }
          curIndex = newIndex;
          vars.overwrite = true;
          return tl.tweenTo(time, vars);
        }
        tl.next = (vars: any) => toIndex(curIndex + 1, vars);
        tl.previous = (vars: any) => toIndex(curIndex - 1, vars);
        tl.current = () => curIndex;
        tl.toIndex = (index: number, vars: any) => toIndex(index, vars);
        tl.times = times;
        tl.progress(1, true).progress(0, true);
        if (config.reversed) {
          tl.reverse();
        }
        return tl;
      }

      if (!railRef.current) return;
      const scrollingText = Array.from(railRef.current.querySelectorAll("h4"));
      const tl = horizontalLoop(scrollingText, {
        repeat: -1,
        paddingRight: 80,
      });

      Observer.create({
        target: railRef.current,
        type: "wheel,touch",
        onChangeY(self) {
          let factor = 2.5;
          if (self.deltaY < 0) {
            factor *= -1;
          }
          gsap.timeline({ defaults: { ease: "none" } })
            .to(tl, { timeScale: factor * 2.5, duration: 0.2, overwrite: true })
            .to(tl, { timeScale: factor / 2.5, duration: 1 }, "+=0.3");
        }
      });
    })();
  }, []);


  return (
    <div className={styles.wrapper} data-smooth-wrapper>

      <div className={styles.main} data-scroll-container>

        <div className={styles.scrolling_text}>
          <div className={styles.rail} ref={railRef}>
            <h4 className={styles.rail_text}>News</h4>
            <h4 className={styles.rail_text}>News</h4>
            <h4 className={styles.rail_text}>News</h4>
            <h4 className={styles.rail_text}>News</h4>
          </div>
        </div>

        <div className={styles.nav}>
          <div className={styles.nav_content}>
            <div className={`${styles.nav_item} ${styles.pre}`}>Category</div>
            <div className={styles.nav_item_back_wrapper}>
              <div
                className={`${styles.nav_item} ${selectedType === "All" ? styles.selected : ""}`}
                onClick={() => setSelectedType("All")}
              >All</div>
              {types.map(type => (
                <div
                  key={type}
                  className={`${styles.nav_item} ${styles.nav_item_back} ${selectedType === type ? styles.selected : ""}`}
                  onClick={() => setSelectedType(type)}
                >{type}</div>
              ))}
            </div>
          </div>
        </div>

        <ul className={styles.list}>
          {filteredNews.map((item: NewsItem) => (
            <li key={item.id} className={styles.list_item}>
              <AnimatedLink to={`/news/${item.id}`} className={styles.link}>
                <figure className={styles.render_img}>
                  <Image className={styles.img} width={100} height={100} src={item.imgUrl || "/news_test.png"} alt={item.title} />
                </figure>
                <div className={styles.type}>{item.type}</div>
                <p className={styles.list_title}>{item.title}</p>
                <div className={styles.list_hover}>
                  <div className={styles.title}>{item.title}</div>
                  <div className={styles.title}>Go→</div>
                </div>
              </AnimatedLink>
            </li>
          ))}
        </ul>


        {/* <h1 className={styles.title}>お知らせ一覧</h1>
        <ul className={styles.list}>
          {filteredNews.map((item: NewsItem) => (
            <li key={item.id} className={styles.list_item}>
              <Link href={`/news/${item.id}`} className={styles.link}>
                <div className={styles.type}>{item.type}</div>
                <div className={styles.title}>{item.title}</div>
              </Link>
            </li>
          ))}
        </ul> */}

      </div>
    </div>
  );
}
