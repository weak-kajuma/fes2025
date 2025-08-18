"use client";

import styles from "./timetable_client.module.css";
import { useEffect, useRef, useState, useTransition } from "react";
import { EventsByLocation } from "./ServerAction";
import { fetchLocalJson } from "@/lib/fetchLocalJson";
import Link from "next/link";
import TimeTableContent from "./timetable_content";
import { useScrollSmoother } from "@/components/ScrollSmoother";

import useRevealer from "@/app/hooks/useRevealer";

// 日付・エリアボタン定義
const dateOptions = [
  { label: "20(Sat)", value: "20", className: styles.firstDate },
  { label: "21(Sun)", value: "21", className: styles.secondDate },
];
const areaOptions = [
  { label: "ステージ", value: "野外ステージ", className: styles.stage },
  { label: "コナコピア", value: "コナコピアホール", className: styles.hole },
  { label: "中庭", value: "中庭", className: styles.yard },
  { label: "体育館", value: "体育館", className: styles.gym },
];

export default function Timetable_Client() {
  useRevealer();

  const title_Ref = useRef<HTMLHeadingElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [selectedDate, setSelectedDate] = useState<string>(dateOptions[0].value);
  const [selectedArea, setSelectedArea] = useState<string[]>([]);
  const [maxSelectableAreas, setMaxSelectableAreas] = useState<number>(3);
  const [allEventsData, setAllEventsData] = useState<{ [date: string]: EventsByLocation[] | undefined }>({});
  const [currentDisplayEvents, setCurrentDisplayEvents] = useState<EventsByLocation[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [errorLoading, setErrorLoading] = useState<string | null>(null);
  const [isTransitioningDate, startTransitionDate] = useTransition();

  const EVENT_YEAR = 2025;
  const EVENT_MONTH = 9;

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    }
  }, []);

  // LocomotiveScrollの初期化（トップレベルで呼び出し）
  useScrollSmoother();

  // レスポンシブ対応
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      let newMax = 3;
      if (width > 1200 - 1) newMax = 3;
      else if (width > 768 - 1) newMax = 2;
      else newMax = 1;
      setMaxSelectableAreas(prev => prev !== newMax ? newMax : prev);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 初期データロード
  useEffect(() => {
    let mounted = true;
    const fetchAllInitialData = async () => {
      setIsInitialLoading(true);
      setErrorLoading(null);
      try {
        // ローカルJSON（配列）から全データ取得
        const timetableData = await fetchLocalJson<Array<any>>("/data/timetable.json");
        console.log("timetableData", timetableData);
        // 日付ごと・エリアごとにEventsByLocation型へ変換
        const newData: { [date: string]: EventsByLocation[] } = {};
        dateOptions.forEach(dateOpt => {
          const dateStr = `2025-09-${dateOpt.value}`;
          const filtered = timetableData.filter(ev => ev.startDate.startsWith(dateStr));
          newData[dateOpt.value] = areaOptions.map(opt => {
            const events = filtered.filter(ev => ev.locationType === opt.value);
            return { locationType: opt.value, events };
          });
        });
        console.log("newData", newData);
        if (mounted) {
          setAllEventsData(prev => JSON.stringify(prev) === JSON.stringify(newData) ? prev : newData);
          if (areaOptions.length > 0 && maxSelectableAreas > 0) {
            const initialArea = areaOptions.slice(0, maxSelectableAreas).map(opt => opt.value);
            setSelectedArea(prev => JSON.stringify(prev) === JSON.stringify(initialArea) ? prev : initialArea);
          }
        }
      } catch (err) {
        if (mounted) setErrorLoading("タイムテーブル情報の読み込みに失敗しました。");
      } finally {
        if (mounted) setIsInitialLoading(false);
      }
    };
    fetchAllInitialData();
    return () => { mounted = false; };
  }, [EVENT_YEAR, EVENT_MONTH, maxSelectableAreas]);

  // 日付・データ変更時の表示更新
  useEffect(() => {
    if (selectedDate && allEventsData[selectedDate]) {
      const newEvents = allEventsData[selectedDate] || [];
      setCurrentDisplayEvents(prev => JSON.stringify(prev) === JSON.stringify(newEvents) ? prev : newEvents);
    } else if (selectedDate && !allEventsData[selectedDate] && !isInitialLoading) {
      setCurrentDisplayEvents(prev => prev.length === 0 ? prev : []);
    }
  }, [selectedDate, allEventsData, isInitialLoading]);

  // maxSelectableAreas変更時のエリア選択調整
  useEffect(() => {
    if (isInitialLoading) return;
    setSelectedArea(prev => {
      let newSelected = [...prev];
      if (newSelected.length > maxSelectableAreas) {
        newSelected = newSelected.slice(newSelected.length - maxSelectableAreas);
      } else if (newSelected.length < maxSelectableAreas && newSelected.length < areaOptions.length) {
        const set = new Set(newSelected);
        const needed = maxSelectableAreas - newSelected.length;
        const candidates = areaOptions.filter(opt => !set.has(opt.value)).slice(0, needed);
        newSelected.push(...candidates.map(opt => opt.value));
      }
      if (maxSelectableAreas === 0) newSelected = [];
      if (JSON.stringify(prev) === JSON.stringify(newSelected)) return prev;
      return newSelected;
    });
  }, [maxSelectableAreas, isInitialLoading]);

  // 現在時刻バーの計算
  const [currentRow, setCurrentRow] = useState(2); // 初期値はヘッダーの次の行 (2行目)

  useEffect(() => {
    const calculateCurrentRow = () => {
      const now = new Date();
      const startTime = new Date();
      startTime.setHours(8, 30, 0, 0); // 基準時刻 8:30
      const endTime = new Date();
      endTime.setHours(15, 30, 0, 0); // 終了時刻 15:30

      let newRow = 2;
      if (now < startTime) {
        newRow = 2;
      } else if (now >= endTime) {
        newRow = 422 + 2;
      } else {
        const diffInMinutes = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60));
        newRow = diffInMinutes + 2;
      }
      setCurrentRow(prev => prev === newRow ? prev : newRow);
    };

    calculateCurrentRow();
    const intervalId = setInterval(calculateCurrentRow, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // イベントカード
  const EventCard = ({ event }: { event: any }) => {
    // 8:30基準でグリッド計算
    const getGridRow = (timeStr?: string | null) => {
      if (!timeStr) return 2;
      const [h, m] = timeStr.split(":").map(Number);
      const baseMinutes = 8 * 60 + 30;
      const eventMinutes = h * 60 + m;
      return 2 + (eventMinutes - baseMinutes);
    };
    const gridRowStart = getGridRow(event.displayTimeStartTime);
    const gridRowEnd = getGridRow(event.displayTimeEndTime);
    return (
      <div
        className={styles.event}
        style={{
          gridRowStart,
          gridRowEnd,
          gridColumnStart: 3,
          background: "var(--location-primary-color, #eee)",
          borderRadius: "10px",
          margin: "2px auto",
          width: "90%",
          position: "absolute",
        }}
      >
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)", textAlign: "center", width: "100%"
        }}>
          {event.title ?? "タイトルなし"}
        </div>
      </div>
    );
  };

  // locationTypeをCSSクラス名に変換
  const formatLocationToClassName = (locationType: string | null): string => {
    if (!locationType) {
      return styles.locationDefault || 'locationDefault';
    }
    const sanitized = locationType.replace(/\s+/g, '');
    return styles[`location${sanitized}`] || styles.locationDefault || `location${sanitized}`;
  };

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
        paddingRight: 150,
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
    <>
      <div className={styles.revealer} data-reveal></div>

      <div data-smooth-wrapper>
        <div className={styles.main} data-scroll-container>

          <div className={styles.scrolling_text}>
            <div className={styles.rail} ref={railRef}>
              <h4 className={styles.rail_text}>Time Table</h4>
              <h4 className={styles.rail_text}>Time Table</h4>
              <h4 className={styles.rail_text}>Time Table</h4>
            </div>
          </div>

          <div className={styles.nav}>
            <div className={styles.nav_content}>
              <div className={`${styles.nav_item} ${styles.pre}`}>Date</div>
              <div className={styles.nav_item_back_wrapper}>
                  {dateOptions.map(dateOpt => (
                    <div
                      key={dateOpt.label}
                      className={`${dateOpt.className} ${styles.nav_item} ${styles.nav_item_back} ${selectedDate === dateOpt.value ? styles.selected : ""}`}
                      onClick={() => setSelectedDate(dateOpt.value)}
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
                    className={`${areaOpt.className} ${styles.nav_item} ${styles.nav_item_back} ${selectedArea.includes(areaOpt.value) ? styles.selected : ""}`}
                    onClick={() => {
                      setSelectedArea(prev => {
                        const idx = prev.indexOf(areaOpt.value);
                        const newSelected = [...prev];
                        // 選択解除は、選択数がmaxSelectableAreasより大きい時だけ許可
                        if (idx > -1) {
                          if (newSelected.length > maxSelectableAreas) {
                            newSelected.splice(idx, 1);
                          }
                          // それ未満の時は何もしない
                        } else {
                          if (newSelected.length >= maxSelectableAreas && maxSelectableAreas > 0) newSelected.shift();
                          if (maxSelectableAreas > 0) newSelected.push(areaOpt.value);
                        }
                        return newSelected;
                      });
                    }}
                    style={maxSelectableAreas === 0 && !selectedArea.includes(areaOpt.value) ? { pointerEvents: "none", opacity: 0.5 } : {}}
                  >
                    {areaOpt.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* <div className={styles.selector}>
            <div className={styles.dateSelector}>
              {dateOptions.map(dateOpt => (
                <button
                  key={dateOpt.label}
                  className={`${dateOpt.className} ${styles.button} ${selectedDate === dateOpt.value ? styles.selected : ""}`}
                  onClick={() => setSelectedDate(dateOpt.value)}
                >
                  {dateOpt.label}
                </button>
              ))}
            </div>
            <div className={styles.areaSelector}>
              {areaOptions.map(areaOpt => (
                <button
                  key={areaOpt.label}
                  className={`${areaOpt.className} ${styles.button} ${selectedArea.includes(areaOpt.value) ? styles.selected : ""}`}
                  onClick={() => {
                    setSelectedArea(prev => {
                      const idx = prev.indexOf(areaOpt.value);
                      const newSelected = [...prev];
                      // 選択解除は、選択数がmaxSelectableAreasより大きい時だけ許可
                      if (idx > -1) {
                        if (newSelected.length > maxSelectableAreas) {
                          newSelected.splice(idx, 1);
                        }
                        // それ未満の時は何もしない
                      } else {
                        if (newSelected.length >= maxSelectableAreas && maxSelectableAreas > 0) newSelected.shift();
                        if (maxSelectableAreas > 0) newSelected.push(areaOpt.value);
                      }
                      return newSelected;
                    });
                  }}
                  disabled={maxSelectableAreas === 0 && !selectedArea.includes(areaOpt.value)}
                >
                  {areaOpt.label}
                </button>
              ))}
            </div>
          </div> */}

          <div className={styles.eventContentWrapper}>
            {isInitialLoading && <div className={styles.loading}>タイムテーブルを読み込んでいます...</div>}
            {errorLoading && <div className={styles.error}>{errorLoading}</div>}
            {!isInitialLoading && !errorLoading && (
              currentDisplayEvents.length > 0 && currentDisplayEvents.map(({ locationType, events }) => (
                <div
                  key={`${selectedDate}-${locationType}`}
                  style={{ display: selectedArea.includes(locationType) ? 'grid' : 'none' }}
                  className={`${styles.eventLocationContainer} ${formatLocationToClassName(locationType)}`}
                >
                  <div className={styles.bar} style={{ '--current-row': currentRow } as React.CSSProperties}></div>
                  <div className={styles.label}>
                    <Link href="">
                      <div className={styles.label_inner}>
                        {locationType}
                      </div>
                    </Link>
                  </div>
                  <div className={styles.box}></div>
                  <div className={styles.background}></div>
                  <div className={styles.timeText}>8:30</div>
                  <div className={styles.timeText}>9:00</div>
                  <div className={styles.timeText}>10:00</div>
                  <div className={styles.timeText}>11:00</div>
                  <div className={styles.timeText}>12:00</div>
                  <div className={styles.timeText}>13:00</div>
                  <div className={styles.timeText}>14:00</div>
                  <div className={styles.timeText}>15:00</div>
                  <div className={styles.timeText}>15:30</div>
                  {[...Array(17)].map((_, i) => (
                    <div key={i} className={styles.timeBar}></div>
                  ))}
                  {events.map(event => (
                    <TimeTableContent key={event.id} eventData={event} />
                  ))}
                </div>
              ))
            )}
            {isTransitioningDate && !isInitialLoading && <div className={styles.loadingOverlay}>情報を更新中...</div>}
          </div>

        </div>
      </div>
    </>
  );
}