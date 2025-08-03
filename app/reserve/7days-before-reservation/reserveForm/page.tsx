"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";

type Event = {
  id: number;
  name: string;
  capacity: number;
  reserved_count: number;
  reservation_type: "first-come" | "lottery";
};

export default function Reserve7DaysBeforeReserveForm() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from("reserveEvents")
          .select("*")
          // .eq("reservation_type", "lottery");

        if (error) {
          console.error("Error fetching events:", error);
          return;
        }

        console.log("Fetched events:", data);
        setEvents(data || []);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleReserve = async () => {
    if (!name || selectedId == null) return alert("すべて入力してください");

    const userToken = uuidv4(); // トークン生成

    const { error } = await supabase.from("reservations").insert([
      {
        event_id: selectedId,
        name,
        token: userToken,
      },
    ]);

    if (error) {
      alert("予約に失敗しました");
      console.error(error);
      return;
    }

    setToken(userToken);
  };

  if (loading) {
    return <div>読み込み中...</div>;
  }

  return (
    // <div>
    //   <h2 className="text-xl font-bold">イベント予約フォーム</h2>
    //   <input
    //     type="text"
    //     placeholder="名前"
    //     value={name}
    //     onChange={(e) => setName(e.target.value)}
    //     className="border p-2 my-2 w-full"
    //   />
    //   <select
    //     className="border p-2 my-2 w-full"
    //     value={selectedId ?? ""}
    //     onChange={(e) => setSelectedId(Number(e.target.value))}
    //   >
    //     <option value="">イベントを選択</option>
    //     {events.map((event) => (
    //       <option key={event.id} value={event.id}>
    //         {event.name} ({event.reservation_type === "first-come" ? "先着" : "抽選"})
    //       </option>
    //     ))}
    //   </select>
    //   <button
    //     onClick={handleReserve}
    //     className="bg-blue-500 text-white px-4 py-2 rounded"
    //   >
    //     予約する
    //   </button>

    //   {token && (
    //     <div className="mt-4">
    //       <p className="text-green-600 font-bold">予約完了！</p>
    //       <p>あなたの予約トークン：<code>{token}</code></p>
    //       <p>このトークンは控えておいてください。</p>
    //     </div>
    //   )}
    // </div>

    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.header_main}>
          <Image
            className={styles.logo}
            src="/images/logo.png"
            width={209}
            height={108}
            alt="OSAKA, KANSAI, JAPAN. EXPO 2025"
          />
          <div className={styles.title}>
            <span>EXPO2025デジタルチケット</span>
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
            <dt>1</dt>
            <dd>
              <span>
                パビリオン/イベント<br />を選択
              </span>
            </dd>
          </dl>
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
            パビリオン･イベントを選択する</h1>
            <div className={styles.entrance_date}>来場日時：2025年8月10日(日)<br/>
            <span>追加で申込可能な時間帯</span></div>
            <div className={styles.search}>
              <div className={styles.search_inner}>
                <span className={styles.search_label}>パビリオン･イベントを検索</span>
                <input
                  aria-labelledby="event_search_input"
                  placeholder="入力せず検索ですべて表示 "
                />
                <button>
                  <span data-message-code="SW_GP_DL_123_0008" className="style_renderer__ip0Pm">検索</span>
                </button>
              </div>
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
              <div className={styles.controller_text}>すべて</div>
            </div>
          </div>

          <div className={styles.event_list}>
            {(() => {
              console.log("Events in render:", events);
              return null;
            })()}
            {events.length === 0 ? (
              <div>イベントが見つかりません</div>
            ) : (
              events.map((event) => (
                <div key={event.id} className={styles.event_item}>
                  <button
                    className={styles.event_button}
                    onClick={() => setSelectedId(event.id)}
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
