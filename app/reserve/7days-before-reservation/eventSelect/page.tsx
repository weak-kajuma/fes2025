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
        const data = await fetchLocalJson<Event[]>("/data/events_7days.json");
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

    // 選択したイベントIDと希望インデックスを保存して、時間選択画面へ
    try {
      window.localStorage.setItem('selectedEventId', String(event.id));
    } catch {}
    window.sessionStorage.setItem('selectedWishIndex', String(Number(wishIndex)));
    router.push(`/reserve/7days-before-reservation/eventReserve?eventId=${event.id}`);
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
        <li className={styles.step1}>
          <dl>
            <dt>1</dt>
            <dd>
              <span>
                イベント<br />を選択
              </span>
            </dd>
          </dl>
          <svg
            viewBox="0 0 14 100"
            width="14"
            height="100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 0,0 L 2,0 A 120,120 0,0,1 2,100 L 0,100 Z"
            />
            <path
              d="M 0,0 L 2,0 A 180,180 0,0,1 2,100 L 0,100 Z"
            />
          </svg>
        </li>
        <li className={styles.step2}>
          <dl>
            <dt>2</dt>
            <dd>
              <span>
                希望日時<br />を選択
              </span>
            </dd>
          </dl>
        </li>
        <li className={styles.step3}>
          <dl>
            <dt>3</dt>
            <dd>
              <span>
                希望登録<br />完了
              </span>
            </dd>
          </dl>
        </li>
      </ol>

      <div className={styles.main}>
        <div className={styles.main_inner}>
          <div className={styles.top}>
            <h1 className={styles.top_title}><span>＜７日前抽選申込＞</span><br/>
            イベントを選択する</h1>
            <div className={styles.entrance_date}>来場日時：2025年8月10日(日)</div>
            <div className={styles.search}>
              <div className={styles.search_inner}>
                <span className={styles.search_label}>イベントを検索</span>
                <input aria-labelledby="event_search_input" placeholder="入力できません。あるだけです。" value="" readOnly/>
                <button>
                  <span>検索できません</span>
                </button>
              </div>
            </div>
          </div>
          <div className={styles.controller}>
            <div className={styles.controller_content}>
              <Image src="/images/sort.png" width={21} height={20} alt="絞り込み" />
              <p>絞り込み</p>
              <div className={styles.controller_text}>すべて</div>
            </div>
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
              <div className={styles.button_more}>　　　　　　</div>
            </div>
            <ul className={styles.button_bottom}>
              <li>
                <div className={styles.button_other}>
                  <Link href="/reserve/7days-before-reservation/withlist">抽選申込へ戻る</Link>
                </div>
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
