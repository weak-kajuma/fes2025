"use client";

import { useState, useEffect, useRef, useContext, useMemo } from "react";

import SearchBar from "./components/searchBar";
import type { EventDataForClient } from './components/ServerAction';
import { getEventsWithFilters } from './components/ServerAction';
import Tab from './components/tab';
import EventCard from './components/eventCard';
import { TabBarContext } from '../contexts/TabBarContext';
import styles from './page.module.css';
import { useScrollSmoother } from "@/components/ScrollSmoother";
import { label } from "framer-motion/client";

export default function Search() {
  const [keyword, setKeyword] = useState("");
  // 初期値「すべて」選択
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // すべて
  const [selectedArea, setSelectedArea] = useState<string[]>([]); // すべて
  const [results, setResults] = useState<EventDataForClient[]>([]);
  const [allEvents, setAllEvents] = useState<EventDataForClient[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null); // すべて
  const [isMobile, setIsMobile] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);

    // ソート状態管理
    const [sortType, setSortType] = useState<string>("asc");

  // セレクタ用オプション定義
  const dateOptions = [
    { label: "すべて", value: null, className: "" },
    { label: "20日", value: "2025-09-20", className: "" },
    { label: "21日", value: "2025-09-21", className: "" },
  ];
  const areaOptions = [
    { label: "すべて", value: null, className: "" },
    { label: "体育館", value: "体育館", className: "" },
    { label: "高校校舎", value: "高校校舎", className: "" },
    { label: "中学校舎", value: "中学校舎", className: "" },
    { label: "中庭", value: "中庭", className: "" },
    { label: "図書館", value: "図書館", className: "" },
    { label: "コナコピアホール", value: "コナコピアホール", className: "" },
  ];
  // タグ選択肢をjsonから自動抽出
  const tagOptions = useMemo(() => {
    const tagSet = new Set<string>();
    allEvents.forEach(ev => {
      if (Array.isArray(ev.tags)) {
        ev.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return ["すべて", ...Array.from(tagSet)];
  }, [allEvents]);
  const maxSelectableAreas = 1;

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


  // 初回ロード時に全イベント取得＆Location「すべて」選択時のフィルタを実行
  useEffect(() => {
    (async () => {
      const data = await getEventsWithFilters(null, [], "");
      setAllEvents(data);
      // Location「すべて」選択時のフィルタを即実行
      setResults(data);
    })();
  }, []);

  // セレクター変更時にフィルタ
  useEffect(() => {
    handleSearch(keyword);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedArea, selectedTag]);



  const handleSearch = async (value: string) => {
    setKeyword(value);
    const areas = selectedArea.length > 0 ? selectedArea : [];
    // 全イベントからフィルタ
    let filtered: EventDataForClient[] = allEvents;
    // エリア
    if (areas.length > 0) {
      filtered = filtered.filter(ev => areas.includes(ev.locationType ?? ""));
    }
    // 日付
    if (selectedDate === "2025-09-20" || selectedDate === "2025-09-21") {
      filtered = filtered.filter(ev => ev.date === selectedDate || ev.date === "");
    }
    // キーワード
    if (value) {
      const kw = value.toLowerCase();
      filtered = filtered.filter(ev =>
        (ev.title?.toLowerCase().includes(kw) || "") ||
        (ev.host?.toLowerCase().includes(kw) || "") ||
        (ev.intro?.toLowerCase().includes(kw) || "") ||
        (ev.brief_intro?.toLowerCase().includes(kw) || "")
      );
    }
    // タグ
    if (selectedTag && selectedTag !== "すべて") {
      filtered = filtered.filter(ev => Array.isArray(ev.tags) && ev.tags.includes(selectedTag));
    }
    setResults(filtered);
  };

  // 詳細表示divのアニメーション開始（TabBar展開UIはコメントアウトで無効化）
  // const handleEventCardClick = (event: EventDataForClient) => {
  //   if ((window as any).__TAB_BAR_CONTEXT__?.triggerAnimation) {
  //     (window as any).__TAB_BAR_CONTEXT__.triggerAnimation(event);
  //   }
  // };

  // 共通のタブコンテンツ
  const renderTabContent = () => (
    <>
      <div className={styles.nav}>
        <div className={styles.nav_content}>
          <div className={`${styles.nav_item} ${styles.pre}`}>Date</div>
          <div className={styles.nav_item_back_wrapper}>
            {dateOptions.map(dateOpt => (
              <div
                key={dateOpt.label}
                  className={`${dateOpt.className} ${styles.nav_item} ${styles.nav_item_back}${selectedDate === dateOpt.value ? ' ' + styles.selected : ''}`}
                  onClick={() => { setSelectedDate(dateOpt.value); }}
              >
                {dateOpt.label}
              </div>
            ))}
          </div>
        </div>
        <div className={styles.nav_content}>
          <div className={`${styles.nav_item} ${styles.pre}`}>Location</div>
          <div className={styles.nav_item_back_wrapper}>
            {areaOptions.map(areaOpt => (
              <div
                key={areaOpt.label}
                  className={`${areaOpt.className} ${styles.nav_item} ${styles.nav_item_back}${selectedArea.includes(areaOpt.value ?? "") || (areaOpt.value === null && selectedArea.length === 0) ? ' ' + styles.selected : ''}`}
                  onClick={() => {
                    setSelectedArea(prev => {
                      // nullの場合は全解除
                      if (areaOpt.value === null) return [];
                      const idx = prev.indexOf(areaOpt.value ?? "");
                      const newSelected = [...prev];
                      if (idx > -1) {
                        if (newSelected.length > maxSelectableAreas) {
                          newSelected.splice(idx, 1);
                        }
                      } else {
                        if (newSelected.length >= maxSelectableAreas && maxSelectableAreas > 0) newSelected.shift();
                        if (maxSelectableAreas > 0) newSelected.push(areaOpt.value ?? "");
                      }
                      return newSelected;
                    });
                  }}
                // 文字色が薄くならないようにstyle指定を削除
              >
                {areaOpt.label}
              </div>
            ))}
          </div>
        </div>
        {/* タグセレクタも他と同じ構造に統一 */}
        <div className={styles.nav_content}>
          <div className={`${styles.nav_item} ${styles.pre}`}>Tag</div>
          <div className={styles.nav_item_back_wrapper}>
            {tagOptions.map(tag => (
              <div
                key={tag}
                  className={`${styles.nav_item} ${styles.nav_item_back}${(selectedTag === tag || (tag === "すべて" && selectedTag === null)) ? ' ' + styles.selected : ''}`}
                  onClick={() => setSelectedTag(tag === "すべて" ? null : tag)}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
        {/* ソート機能追加 */}
        <div className={styles.nav_content}>
          <div className={`${styles.nav_item} ${styles.pre}`}>Sort</div>
          <div className={styles.nav_item_back_wrapper}>
            <div
              className={`${styles.nav_item} ${styles.nav_item_back}${sortType === 'asc' ? ' ' + styles.selected : ''}`}
              style={{ cursor: "pointer" }}
              onClick={() => {
                setResults(prev => {
                  // 日付昇順
                  if (selectedDate === "2025-09-20" || selectedDate === "2025-09-21") {
                    return [...prev].sort((a, b) => {
                      const ad = a.date === "" ? selectedDate : a.date;
                      const bd = b.date === "" ? selectedDate : b.date;
                      return (ad ?? "").localeCompare(bd ?? "");
                    });
                  }
                  return [...prev].sort((a, b) => {
                    if (!a.date || !b.date) return 0;
                    return a.date.localeCompare(b.date);
                  });
                });
                setSortType('asc');
              }}
            >
              日付昇順
            </div>
            <div
              className={`${styles.nav_item} ${styles.nav_item_back}${sortType === 'desc' ? ' ' + styles.selected : ''}`}
              style={{ cursor: "pointer" }}
              onClick={() => {
                setResults(prev => {
                  // 日付降順
                  if (selectedDate === "2025-09-20" || selectedDate === "2025-09-21") {
                    return [...prev].sort((a, b) => {
                      const ad = a.date === "" ? selectedDate : a.date;
                      const bd = b.date === "" ? selectedDate : b.date;
                      return (bd ?? "").localeCompare(ad ?? "");
                    });
                  }
                  return [...prev].sort((a, b) => {
                    if (!a.date || !b.date) return 0;
                    return b.date.localeCompare(a.date);
                  });
                });
                setSortType('desc');
              }}
            >
              日付降順
            </div>
            <div
              className={`${styles.nav_item} ${styles.nav_item_back}${sortType === 'tagAsc' ? ' ' + styles.selected : ''}`}
              style={{ cursor: "pointer" }}
              onClick={() => {
                setResults(prev => [...prev].sort((a, b) => {
                  // タグ昇順
                  const atag = Array.isArray(a.tags) && a.tags.length > 0 ? a.tags[0] : "";
                  const btag = Array.isArray(b.tags) && b.tags.length > 0 ? b.tags[0] : "";
                  return atag.localeCompare(btag);
                }));
                setSortType('tagAsc');
              }}
            >
              タグ昇順
            </div>
            <div
              className={`${styles.nav_item} ${styles.nav_item_back}${sortType === 'tagDesc' ? ' ' + styles.selected : ''}`}
              style={{ cursor: "pointer" }}
              onClick={() => {
                setResults(prev => [...prev].sort((a, b) => {
                  // タグ降順
                  const atag = Array.isArray(a.tags) && a.tags.length > 0 ? a.tags[0] : "";
                  const btag = Array.isArray(b.tags) && b.tags.length > 0 ? b.tags[0] : "";
                  return btag.localeCompare(atag);
                }));
                setSortType('tagDesc');
              }}
            >
              タグ降順
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // 共通の結果表示（EventCardクリック時のTabBar展開UIは無効化）
  const renderResults = () => (
    <div className={styles.results}>
      <div className={styles.results_inner}>
        {results.length > 0 ? (
          results.map((event, i) => (
            <div className={styles.card} key={`${event.id}_${i}`}>
              {/* <EventCard event={event} onClick={handleEventCardClick} /> */}
              <EventCard event={event} />
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
            <h4 className={styles.rail_text}>Events</h4>
            <h4 className={styles.rail_text}>Events</h4>
            <h4 className={styles.rail_text}>Events</h4>
            <h4 className={styles.rail_text}>Events</h4>
          </div>
        </div>

        {/* <SearchBar
          value={keyword}
          onSubmit={handleSearch}
          onChange={setKeyword}
        /> */}

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
