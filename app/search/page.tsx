"use client";

import { useState, useEffect, useRef, useContext } from "react";

import SearchBar from "./components/searchBar";
import type { EventDataForClient } from './components/ServerAction';
import { getEventsWithFilters } from './components/ServerAction';
import Tab from './components/tab';
import EventCard from './components/eventCard';
import { TabBarContext } from '../contexts/TabBarContext';
import styles from './page.module.css';
import { useScrollSmoother } from "@/components/ScrollSmoother";

export default function Search() {
  const [keyword, setKeyword] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [results, setResults] = useState<EventDataForClient[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);

  // TabBarのrefを取得
  const tabBarRef = useContext(TabBarContext);

  useScrollSmoother();

  // 画面幅を監視
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 600);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    handleSearch(keyword);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  const handleSearch = async (value: string) => {
    setKeyword(value);

    const areas = selectedArea ? [selectedArea] : [];
    const data = await getEventsWithFilters(
      selectedDate,
      areas,
      value // ← 修正: valueを直接渡す
    );

    setResults(data);
  };

  // 詳細表示divのアニメーション開始
  const handleEventCardClick = (event: EventDataForClient) => {
    // TabBarのアニメーション関数を呼び出し
    if ((window as any).__TAB_BAR_CONTEXT__?.triggerAnimation) {
      (window as any).__TAB_BAR_CONTEXT__.triggerAnimation(event);
    }
  };

  // 共通のタブコンテンツ
  const renderTabContent = () => (
    <>
      <div className={styles.tab_row}>
        <Tab title={"日付"}>
          <div className={styles.tab_content}>
            <div
              className={`${styles.option} ${styles.date} ${styles.date_20} ${selectedDate === "20" ? styles.selected : ""}`}
              onClick={() => { setSelectedDate(selectedDate === "20" ? null : "20"); }}
            >
              <p>9/20<span> Sat</span></p>
            </div>
            <div
              className={`${styles.option} ${styles.date} ${styles.date_21} ${selectedDate === "21" ? styles.selected : ""}`}
              onClick={() => { setSelectedDate(selectedDate === "21" ? null : "21"); }}
            >
              <p>9/21<span> Sun</span></p>
            </div>
          </div>
        </Tab>
        <Tab title={"エリア"}>
          <div className={styles.tab_content}>
            <div className={`${styles.option} ${styles.area} ${styles.juniorHighSchool} ${selectedArea === "中学校舎" ? styles.selected : ""}`}
              onClick={() => { setSelectedArea(selectedArea === "中学校舎" ? null : "中学校舎"); }}
            >
              <p>中学校舎</p>
            </div>
            <div className={`${styles.option} ${styles.area} ${styles.highSchool} ${selectedArea === "高校校舎" ? styles.selected : ""}`}
              onClick={() => { setSelectedArea(selectedArea === "高校校舎" ? null : "高校校舎"); }}
            >
              <p>高校校舎</p>
            </div>
            <div className={`${styles.option} ${styles.area} ${styles.yard} ${selectedArea === "中庭" ? styles.selected : ""}`}
              onClick={() => { setSelectedArea(selectedArea === "中庭" ? null : "中庭"); }}
            >
              <p>中庭</p>
            </div>
            <div className={`${styles.option} ${styles.area} ${styles.gym} ${selectedArea === "体育館" ? styles.selected : ""}`}
              onClick={() => { setSelectedArea(selectedArea === "体育館" ? null : "体育館"); }}
            >
              <p>体育館</p>
            </div>
          </div>
        </Tab>
      </div>
      <div className={styles.tab_row}>
        <Tab title={"title"}>children</Tab>
        <Tab title={"title"}>children</Tab>
      </div>
    </>
  );

  // 共通の結果表示
  const renderResults = () => (
    <div className={styles.results}>
      <div className={styles.results_inner}>
        {results.length > 0 ? (
          results.map(event => (
            <div className={styles.card} key={event.id}>
              <EventCard event={event} onClick={handleEventCardClick} />
            </div>
          ))
        ) : (
          <p>No results found.</p>
        )}
      </div>
    </div>
  );


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
    <div data-smooth-wrapper className={styles.wrapper}>
      <div className={styles.main} data-scroll-container>

        <div className={styles.scrolling_text}>
          <div className={styles.rail} ref={railRef}>
            <h4 className={styles.rail_text}>Search</h4>
            <h4 className={styles.rail_text}>Search</h4>
            <h4 className={styles.rail_text}>Search</h4>
            <h4 className={styles.rail_text}>Search</h4>
          </div>
        </div>

        <SearchBar
          value={keyword}
          onSubmit={handleSearch}
          onChange={setKeyword}
        />

        {isMobile ? (
          // スマホサイズ用の構造
          <div className={styles.mobileLayout}>
            <section className={styles.selector}>
              {renderTabContent()}
              {renderResults()}
            </section>
          </div>
        ) : (
          // PCサイズ用の構造（現状維持）
          <>
            <section className={styles.selector}>
              {renderTabContent()}
            </section>
            {renderResults()}
          </>
        )}

      </div>
    </div>
  );
}
