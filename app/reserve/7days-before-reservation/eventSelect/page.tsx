"use client";
import { Suspense, useState, useEffect } from "react";
import { fetchLocalJson } from "@/lib/fetchLocalJson";
import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { serializeEvent } from "../eventReserve/eventReserveUtils";

type Event = {
  id: number;
  name: string;
  time: string; // timeプロパティを必須とする
  capacity: number;
  reserved_count: number;
  reservation_type: "first-come" | "lottery";
  date?: string | number;
};

type DayFilter = "all" | "20" | "21";

export default function Reserve7DaysBeforeEventSelectPage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <EventSelectInner />
    </Suspense>
  );
}

function EventSelectInner() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [dayFilter, setDayFilter] = useState<DayFilter>("all");
  const [showDayMenu, setShowDayMenu] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await fetchLocalJson<Event[]>("/data/events.json");
        setEvents(data || []);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleEventSelect = (event: Event) => {
    const wishIndex = searchParams.get('wishIndex');
    if (wishIndex === null) {
      alert("エラー: 対象の希望枠が不明です。前のページからやり直してください。");
      return;
    }

    // 選択したイベントと希望インデックスを保存して、時間選択画面へ
    const fullEvent = {
      ...event,
    };
    try {
      window.localStorage.setItem('selectedEvent', JSON.stringify(fullEvent));
    } catch {}
    window.sessionStorage.setItem('selectedWishIndex', String(Number(wishIndex)));
    const eventParam = serializeEvent(fullEvent);
    router.push(`/reserve/7days-before-reservation/eventReserve?event=${eventParam}`);
  };

  const filteredEvents = events.filter((event) => {
    if (dayFilter === "all") return true;
    return String((event as any).date) === dayFilter;
  });

  if (loading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className={styles.wrapper}>
      {/* Header and other static parts can remain the same */}
      <div className={styles.header}>
        <div className={styles.header_main}>
          <Image
            className={styles.logo}
            src="/images/sparkle_logo.png"
            width={209}
            height={108}
            alt="Sparkle ロゴ"
          />
          <div className={styles.title}>
            <span>スパークル</span>
          </div>
          <ul className={styles.shortcut}>
            <li>
              <div className={styles.selector}>
                <div className={styles.selector_current}>JP(日本語)</div>
                <div className={styles.selector_list}>
                  <p>EN |</p>
                  <p>CN |</p>
                  <p>KR |</p>
                  <p>TH |</p>
                  <p>VN</p>
                </div>
              </div>
            </li>
            <li className={styles.cart}>
              <Image
                src="/images/cart.png"
                width={40}
                height={40}
                alt="カート"
              />
            </li>
            <li></li>
          </ul>
        </div>
        <div className={styles.header_sub}>
          <div className={styles.header_sub_inner}>
            <div className={styles.nav}>
              <ul className={styles.menu}>
                <li>チケットの購入</li>
                <li>予約・抽選の申し込み</li>
                <li>マイチケット</li>
                <li>メッセージ</li>
                <li>よくあるお問い合わせ</li>
                <li>
                  <div className={styles.logout}>ログアウト</div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <ol className={styles.step}>
        {/* Steps indicator can remain the same */}
      </ol>

      <div className={styles.main}>
        <div className={styles.main_inner}>
          <div className={styles.top}>
            <h1 className={styles.top_title}><span>＜７日前抽選申込＞</span><br/>
            パビリオン･イベントを選択する</h1>
            <div className={styles.entrance_date}>来場日時：2025年8月10日(日)<br/>
            <span>追加で申込可能な時間帯</span></div>
            <div className={styles.search}>
              {/* Search input can remain the same */}
            </div>
          </div>
          <div className={styles.controller}>
            {/* Controller for filtering can remain the same */}
          </div>

          <div className={styles.event_list}>
            {filteredEvents.length === 0 ? (
              <div>イベントが見つかりません</div>
            ) : (
              filteredEvents.map((event) => (
                <div key={event.id} className={styles.event_item}>
                  <button
                    className={styles.event_button}
                    onClick={() => handleEventSelect(event)}
                  >
                    {event.name || `イベントID: ${event.id}`}
                  </button>
                  <Link className={styles.detail_link} href="">
                    <div className={styles.detail_box}>
                      <p>詳しくはこちら</p>
                      <Image
                        src="/images/open.png"
                        width={16}
                        height={15}
                        alt="詳しくはこちら"
                      />
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>

          <div className={styles.buttons}>
            <div className={styles.button_top}>
              <div className={styles.button_more}>もっと見る　</div>
              <p>チケットの購入履歴はこちら</p>
            </div>
            <ul className={styles.button_bottom}>
              <li>
                <div className={styles.button_other}>抽選申込へ戻る</div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.footer_inner}>

        </div>
      </div>
    </div>
  );
}
