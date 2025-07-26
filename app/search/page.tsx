"use client";

import { useState, useEffect, useRef, useContext } from "react";

import SearchBar from "./components/searchBar";
import type { EventDataForClient } from './components/ServerAction';
import { getEventsWithFilters } from './components/ServerAction';
import Tab from './components/tab';
import EventCard from './components/eventCard';
import DetailOverlay from './components/DetailOverlay';
import { TabBarContext } from '../contexts/TabBarContext';
import styles from './page.module.css';

export default function Search() {
  const [keyword, setKeyword] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [results, setResults] = useState<EventDataForClient[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [detailEvent, setDetailEvent] = useState<EventDataForClient | null>(null);
  const [animating, setAnimating] = useState(false);
  const [animStyle, setAnimStyle] = useState<any>({});
  const animDivRef = useRef<HTMLDivElement>(null);

  // TabBarのrefを取得
  const tabBarRef = useContext(TabBarContext);

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
    // TabBarのrefから位置・サイズを取得
    if (!tabBarRef?.current) return;
    const rect = tabBarRef.current.getBoundingClientRect();
    setDetailEvent(event);
    setAnimating(true);
    setAnimStyle({
      position: 'fixed',
      left: rect.left + 'px',
      top: rect.top + 'px',
      width: rect.width + 'px',
      height: rect.height + 'px',
      borderRadius: '10rem',
      background: '#F4F4F4',
      zIndex: 9999,
      transition: 'all 1s cubic-bezier(0.4,0,0.2,1)',
      overflow: 'hidden',
    });
    // 1フレーム後にアニメーション先のスタイルに変更
    setTimeout(() => {
      setAnimStyle({
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90vw',
        height: '80vh',
        bottom: 0,
        top: 'auto',
        borderRadius: '2rem 2rem 0 0',
        background: '#F4F4F4',
        zIndex: 9999,
        transition: 'all 1s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
      });
      // 1秒後にアニメーション終了
      setTimeout(() => setAnimating(false), 1000);
    }, 30);
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

  return (
    <div className={styles.main}>
      <h1 className={styles.title}>SEARCH</h1>
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
      {detailEvent && (
        <div ref={animDivRef} style={animStyle}>
          {!animating && (
            <DetailOverlay event={detailEvent} onClose={() => setDetailEvent(null)} />
          )}
        </div>
      )}
    </div>
  );
}
