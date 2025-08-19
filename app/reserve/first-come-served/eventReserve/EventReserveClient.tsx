"use client";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams , useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { deserializeEvent } from "./eventReserveUtils";
import { useEventContext } from "../EventContext";
import styles from "./page.module.css";

type HourFilter = "all" | "11" | "12" | "13" | "14";

export default function EventReserveClient() {
  const { event, setEvent } = useEventContext();
  const searchParams = useSearchParams();
  const eventStr = searchParams.get("event");
  const deserializedEvent = useMemo(() => (eventStr ? deserializeEvent(eventStr) : null), [eventStr]);
  const [hourFilter, setHourFilter] = useState<HourFilter>("all");
  const [showHourMenu, setShowHourMenu] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [showTimeMenu, setShowTimeMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const [currentWishIndex, setCurrentWishIndex] = useState<number>(0);

  // イベント情報はevent変数
  // hourプロパティでフィルタ（event.hourが"11"など）
  const filteredEvent = (!event || hourFilter === "all" || String(event.hour) === hourFilter) ? event : null;

  // ImplementationTime分割
  const times = event?.ImplementationTime?.split(",") ?? [];
  // controllerでフィルター
  const [timeFilter, setTimeFilter] = useState<string>("all");
  type FilteredTimesProps = {
    times: string[];
    timeFilter: string;
  }

  const filteredTimes: string[] = timeFilter === "all" ? times : times.filter((t: string) => t.startsWith(timeFilter));

  // 時間帯リスト（11,12,14など）を自動抽出
  const hourList = Array.from(new Set(times.map((t: string | any[]) => t.slice(0,2))));

  const initRef = useRef(false);
  useEffect(() => {
    if (initRef.current) return;
    // URLパラメータ優先でイベント情報を反映
    if (deserializedEvent) {
      const nextEvent = deserializedEvent as typeof event;
      setEvent(nextEvent ?? null);
      try {
        window.localStorage.setItem("selectedEvent", JSON.stringify(deserializedEvent));
      } catch {}
      initRef.current = true;
      return;
    }
    // フォールバック: localStorage
    const stored = window.localStorage.getItem("selectedEvent");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setEvent(parsed);
      } catch {}
    }
    initRef.current = true;
  }, [deserializedEvent, setEvent]);

  useEffect(() => {
    const idxStr = window.sessionStorage.getItem("selectedWishIndex");
    if (idxStr !== null) setCurrentWishIndex(Number(idxStr));
  }, []);

  const hasSelectedTime = !!selectedTime;

  // eventReserveの登録処理例
  const handleApply = () => {
    if (!event || !selectedTime) return;
    const wishIndex = Number(window.sessionStorage.getItem("selectedWishIndex") ?? "0");
    const appliedListRaw = window.sessionStorage.getItem("appliedEventList");
    const appliedList: ({ id: number; name: string; time: string } | null)[] = appliedListRaw ? JSON.parse(appliedListRaw) : [];
    const maxWishes = 5;
    // 配列長をmaxWishesに合わせる
    while (appliedList.length < maxWishes) appliedList.push(null);
    // 該当枠に上書き
    appliedList[wishIndex] = {
      id: event.id,
      name: event.name,
      time: selectedTime,
    };
    window.sessionStorage.setItem("appliedEventList", JSON.stringify(appliedList));
    setShowModal(true);
  };
  return (
    // <div style={{ padding: 32 }}>
    //   <h1>イベント予約画面</h1>
    //   {event ? (
    //     <div>
    //       <h2>{event.name}</h2>
    //       <p>ID: {event.id}</p>
    //       <p>日付: {event.date}</p>
    //       <p>説明: {event.description}</p>
    //       {/* 必要に応じて他の情報も表示 */}
    //     </div>
    //   ) : (
    //     <p>イベント情報がありません</p>
    //   )}
    // </div>

    <div className={styles.wrapper}>
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
                パビリオン/イベント<br />を選択
              </span>
            </dd>
          </dl>
        </li>
        <li className={styles.step2}>
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
            <h1 className={styles.top_title}><span>＜空き枠先着＞</span><br/>
            時間帯を選択する</h1>

            <div className={styles.entrance_date}>来場日時：2025年8月10日(日)<br/>
            <span>追加で申込可能な時間帯</span></div>

            <h1 className={styles.top_title}>{event ? event.name : ""}</h1>

            <h2 className={styles.top_sub_title}>パビリオン･イベントからのお知らせ</h2>
            <div className={styles.top_sub_text}>
              <p>{event ? event.description : ""}</p>
            </div>

            <h2 className={styles.top_sub_title}>時間帯</h2>
            <div className={styles.top_sub_text}>
              <p>観覧の所要時間は別に必要なのでご注意ください。<br/>
                所要時間は上記お知らせや<br/>
                前画面「パビリオン･イベント選択」の案内<br/>
                またはVisitorsの各パビリオン情報の「詳細情報を確認する」からご確認ください。<br/>
                イベントは 開演-終演時間(開場時間) を表示、<br/>
                または 開演-終演時間 を表示しています。<br/>
                詳細はVisitorsの各イベント情報をご確認ください。</p>
            </div>
          </div>

          <div className={styles.controller}>
            <div className={styles.controller_content}>
              <Image
                src="/images/sort.png"
                width={20}
                height={20}
                alt="絞り込み"
              />
              <p>絞り込み</p>
              <div
                className={styles.controller_text}
                style={{ cursor: "pointer" }}
                onClick={() => { setShowTimeMenu(v => !v); }}
              >
                {timeFilter === "all" ? "すべて" : `${timeFilter}時台`}
              </div>
              {showTimeMenu && (
                <ul style={{ position: "absolute", background: "#fff", border: "1px solid #ccc", zIndex: 10, listStyle: "none", padding: "8px", margin: 0 }}>
                  <li style={{ padding: "4px 8px", cursor: "pointer" }} onClick={() => { setTimeFilter("all"); setShowTimeMenu(false); }}>すべて</li>
                  {hourList.map(hour => (
                    <li key={String(hour)} style={{ padding: "4px 8px", cursor: "pointer" }} onClick={() => { setTimeFilter(String(hour)); setShowTimeMenu(false); }}>{String(hour)}時台</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className={styles.time_picker}>
            {filteredTimes.map((time: string, idx: number) => (
              <div key={time} className={styles.time_picker_content_wrapper}>
                <div className={styles.time_picker_content}>
                  <label
                    className={`${styles.time_picker_content_inner} ${selectedTime === time ? styles.selected_time_label : undefined}`}
                    style={selectedTime === time ? { backgroundColor: "#fde6e6", borderRadius: "10px" } : {}}
                  >
                    <input
                      type="radio"
                      name="time"
                      value={time}
                      checked={selectedTime === time}
                      onChange={() => { setSelectedTime(time); }}
                      className={styles.time_picker_radio}
                    />
                    <span>{time}</span>
                  </label>
                </div>
              </div>
            ))}

            <ul className={styles.time_register}>
              <li>
                <div className={styles.time_register_info}>
                  <p>{event ? event.name : ""}<br/>
                  {hasSelectedTime ? selectedTime : "時間帯を選択してください"}</p>
                </div>
              </li>
              <li>
                {hasSelectedTime ? (
                  <button
                    className={styles.time_register_link}
                    onClick={handleApply}
                    type="button"
                  >
                    選択したチケットで申し込む
                  </button>
                ) : (
                  <div className={`${styles.time_register_link} ${styles.time_register_link_disabled}`}>
                    選択したチケットで申し込む
                  </div>
                )}
              </li>
            </ul>

            {showModal && (
              <div className={styles.modal_overlay}>
                <div className={styles.modal_wrapper}>
                  <div className={styles.modal_inner}>
                    <div className={styles.modal_close} onClick={() => { setShowModal(false); }}>
                      <Image
                        src="/images/close.png"
                        alt="close"
                        width={20}
                        height={20}
                      />
                    </div>
                    <div className={styles.modal_content}>
                      <p className={styles.title}>＜７日前抽選申込＞<br/>
                        希望のパビリオン･イベントが登録されました</p>
                      <div className={styles.calendar_icon}>
                        <Image
                          src="/images/calendar.png"
                          width={106}
                          height={80}
                          alt="カレンダーアイコン"
                        />
                      </div>
                      <div className={styles.sum}>
                        <p>{event ? event.name : ""} {selectedTime}</p>
                        <div>
                          <p className={styles.annotation}>
                            <Image
                              src="/images/annotation.png"
                              alt="annotation"
                              width={20}
                              height={20}
                            />
                            <span>まだ抽選申込は完了していません。抽選リストの画面へ戻り内容をご確認のうえ、「この内容で抽選を申し込む」ボタンを押してください。</span>
                          </p>
                        </div>
                      </div>
                      <ul className={styles.buttons}>
                        <li>
                          <button className={styles.button} onClick={() => { window.location.reload(); }}>
                            <span className={styles.button_text}>同じパビリオン・イベントで別の日時を選ぶ</span>
                          </button>
                        </li>
                        <li>
                          <button className={styles.button} onClick={() => { router.push("/reserve/7days-before-reservation/withlist"); }}>
                            <span className={styles.button_text}>7日前抽選リストへと戻る<br/>
                            他の希望を追加する</span>
                          </button>
                        </li>
                      </ul>
                    </div>
                    {/* <h2>申込内容確認</h2>
                    <p>イベントID: {event?.id}</p>
                    <p>選択した時間: {selectedTime}</p>
                    <button type="button" onClick={() => setShowModal(false)} className={styles.modal_close}>閉じる</button> */}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={styles.buttons}>
            <ul className={styles.button_bottom}>
              <li>
                <Link href={`/reserve/7days-before-reservation/eventSelect?wishIndex=${currentWishIndex}`}>
                  <div className={styles.button_other}>パビリオン･イベントの選択にもどる</div>
                </Link>
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