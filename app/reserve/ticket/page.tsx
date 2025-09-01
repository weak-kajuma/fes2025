'use client';

// Extend the Window interface to include supabase
declare global {
  interface Window {
    supabase?: typeof supabase;
  }
}

import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { fetchWithCache } from "@/lib/fetchWithCache";


export default function TicketPage() {

  // リハーサル申込モーダル・日時選択・開放判定ロジック
  const [isRehearsalModalOpen, setIsRehearsalModalOpen] = useState(false);
  const [selectedRehearsalTime, setSelectedRehearsalTime] = useState("");
  const router = useRouter();
  // クリック可能期間: 9月4日12:40〜9月10日13:00
  const rehearsalStart = new Date("2025-09-04T12:40:00+09:00");
  const rehearsalEnd = new Date("2025-09-10T13:00:00+09:00");
  const now = new Date();
  const isRehearsalOpen = now.getTime() >= rehearsalStart.getTime() && now.getTime() <= rehearsalEnd.getTime();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [appliedEvents, setAppliedEvents] = useState<{ event_id: number; event_time: string; user_name?: string }[]>([]);



  // 7日前抽選 申込済みかをチェック
  useEffect(() => {
    const fetchAppliedEvents = async () => {
      const userId = window.localStorage.getItem('user_id');
      if (!userId) {
        setAlreadyApplied(false);
        setAppliedEvents([]);
        return;
      }
      // キャッシュ付き取得
      const data = await fetchWithCache(
        'applied_events',
        `/api/lottely-applications?user_id=${userId}`
      );
      const results = Array.isArray(data?.results) ? data.results as { event_id: number; event_time: string; user_name?: string }[] : [];
      setAlreadyApplied(results.length > 0);
      setAppliedEvents(results);
    };
    if (status === 'authenticated') {
      // user_uuidsテーブルに登録されたuuidのみをlocalStorageに保存
      const saveUserId = async () => {
        const email = session?.user?.email;
        if (!email) return;
        const { data, error } = await supabase
          .from('user_uuids')
          .select('uuid')
          .eq('email', email)
          .single();
        if (data?.uuid) {
          window.localStorage.setItem('user_id', data.uuid);
        } else {
          // 未登録なら新規登録
          const newUuid = crypto.randomUUID();
          const { data: insertData, error: insertError } = await supabase
            .from('user_uuids')
            .insert({ email, uuid: newUuid })
            .select('uuid')
            .single();
          if (insertData?.uuid) {
            window.localStorage.setItem('user_id', insertData.uuid);
          } else {
            window.localStorage.removeItem('user_id');
          }
        }
        if (session?.user?.name) {
          window.localStorage.setItem('google_user_name', session.user.name);
        }
      };
      saveUserId();
      void fetchAppliedEvents();
    } else {
      setAlreadyApplied(false);
      setAppliedEvents([]);
    }
  }, [status, session]);

  const handleQRClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };


  if (error || !events) {
    return <div>{error || "イベントの取得に失敗しました。"}</div>;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.header_main}>
          <Image
            className={styles.logo}
            src="/images/sparkle_logo.png"
            width={209}
            height={108}
            alt="OSAKA, KANSAI, JAPAN. EXPO 2025"
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

      <div className={styles.main}>
        <div className={styles.main_inner}>
          <div className={styles.top}>
            <h1 className={styles.top_title}>マイチケット</h1>
            <div className={styles.top_info}>お持ちのチケットを確認できます。<br />
              複数のチケットにまとめて予約･抽選を<br />
              申し込むことができます。<br />
              入場および予約したイベントに入館する際には、QRコード表示ボタンを押してQRコードを提示してください。<br />
              予約･抽選の確認や変更･取消は、チケットを選択して1枚ずつ行ってください。<br />
              まとめて申し込んだ内容を変更する場合は<br />
              チケット毎に取り消し、再度まとめてお申し込みください。</div>
            <div className={styles.top_summaryButton}>まとめて予約･抽選に申し込む</div>
            <ul className={styles.top_note}>
              <li>まとめて申し込んだ内容を変更する場合は、チケット毎に取消を行ったうえで再度まとめてお申し込みください。チケットを1枚だけ選択して変更すると、別の申し込みになるのでご注意ください。予約の変更･取消は内容によりできないものもあります。</li>
              <li>3歳以下無料券の予約･抽選は必ず大人･中人と一緒に行う必要があります。3歳以下無料券の入手はチケットの購入から。 </li>
            </ul>
            <div className={styles.top_ticketCount}>1枚 のチケットをお持ちです。</div>
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
              <div className={styles.controller_text}>ご利用可能なチケット</div>
            </div>
            <div className={styles.controller_content}>
              <Image
                src="/images/change.png"
                width={20}
                height={20}
                alt="並び替え"
              />
              <p>並び替え</p>
              <div className={styles.controller_text}>来場日時の昇順</div>
            </div>
          </div>
          <div className={styles.ticket_wrapper}>
            <div className={styles.ticket}>
              <div className={styles.box}></div>
              <div className={styles.ticket_top}>
                <div className={styles.ticket_title}>青霞祭予約券</div>
                <div className={styles.ticket_info}>
                  {session?.user?.image ? (
                     <Image
                       className={styles.ticket_gif}
                       src={session.user.image.replace('=s96-c', '=s400-c')}
                       width={140}
                       height={140}
                       alt="ユーザープロフィール画像"
                     />
                   ) : (
                    <Image
                      className={styles.ticket_gif}
                      src="/images/ticket_gif.gif"
                      width={333}
                      height={198}
                      alt="青霞祭予約券"
                    />
                  )}
                  <div className={styles.ticket_info_inner}>
                    <div className={styles.summary}>来場者</div>
                    <div className={styles.status}>チケット状態：予約済</div>
                  </div>
                </div>
              </div>
              <div className={styles.ticket_middle}>
                <div className={styles.ticket_middle_left}>
                  <div className={styles.ticket_middle_left_text}>チケットID：--------</div>
                  <div className={styles.ticket_middle_left_text}>来場日変更回数：残り3回</div>
                </div>
                <div className={styles.ticket_middle_right} onClick={handleQRClick}>
                  <div className={styles.ticket_middle_right_inner}>
                    <Image
                      src="/images/qrcode.png"
                      width={37}
                      height={37}
                      alt="QRコード"
                    />
                    <p>QRコードを表示する</p>
                  </div>
                </div>
              </div>
              <div className={styles.ticket_bottom}>
                <div>
                  <div className={styles.arrows}>
                    <div className={styles.arrows_entrance_date}>
                      <div className={styles.arrows_title}>
                        <span>■</span>
                        来場日時の予約
                      </div>
                      <div className={styles.arrow}>
                        <Image
                          src="/images/arrow_left.png"
                          width={15}
                          height={40}
                          alt="左矢印"
                        />
                        <div className={styles.arrow_middle}>2025年8月10日(日) 11:00-<br/>[正門]</div>
                        <Image
                          src="/images/arrow_right.png"
                          width={15}
                          height={40}
                          alt="右矢印"
                        />
                      </div>
                    </div>

                    {/* <div className={styles.arrows_event}>
                      <div className={styles.arrows_title}>
                        <span>■</span>
                        イベントの予約
                      </div>
                      <div className={styles.arrow}>
                        <Image
                          className={styles.arrow_gray_left}
                          src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='15' height='40'><rect fill-opacity='0'/></svg>"
                          width={15}
                          height={40}
                          alt="左矢印"
                        />
                        <Image
                          className={styles.arrow_gray_right}
                          src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='15' height='40'><rect fill-opacity='0'/></svg>"
                          width={15}
                          height={40}
                          alt="右矢印"
                        />
                        {alreadyApplied ? (
                          <>
                            <Image
                              src="/images/arrow_left.png"
                              width={15}
                              height={40}
                              alt="左矢印"
                            />
                            <Link className={styles.arrow_middle_submited} href="/reserve/result">
                              <div>7日前抽選申込<br/>(申込済みの内容を確認)</div>
                            </Link>
                            <Image
                              src="/images/arrow_right.png"
                              width={15}
                              height={40}
                              alt="右矢印"
                            />
                          </>
                        ) : (
                          <>
                            <Image
                              src="/images/arrow_red_left.png"
                              width={15}
                              height={40}
                              alt="右矢印"
                            />
                            <Link className={styles.arrow_middle} href="/reserve/7days-before-reservation/ticketselect">
                              <div>7日前抽選申込<br/>(受付中)</div>
                            </Link>
                            <Image
                              src="/images/arrow_red_right.png"
                              width={15}
                              height={40}
                              alt="右矢印"
                            />
                          </>
                        )}
                        <Image
                          className={styles.arrow_gray_left}
                          src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='15' height='40'><rect fill-opacity='0'/></svg>"
                          width={15}
                          height={40}
                          alt="左矢印"
                        />
                        <Image
                          className={styles.arrow_gray_right}
                          src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='15' height='40'><rect fill-opacity='0'/></svg>"
                          width={15}
                          height={40}
                          alt="右矢印"
                        />
                        <Image
                          className={styles.arrow_gray_left}
                          src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='15' height='40'><rect fill-opacity='0'/></svg>"
                          width={15}
                          height={40}
                          alt="左矢印"
                        />
                        <Image
                          className={styles.arrow_gray_right}
                          src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='15' height='40'><rect fill-opacity='0'/></svg>"
                          width={15}
                          height={40}
                          alt="右矢印"
                        />
                      </div>
                    </div>

                    <div className={styles.arrows_event}>
                      <div className={styles.arrows_title}>
                        <span>■</span>
                        イベントの予約
                      </div>
                      <div className={styles.arrow}>
                        <Image
                          className={styles.arrow_gray_left}
                          src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='15' height='40'><rect fill-opacity='0'/></svg>"
                          width={15}
                          height={40}
                          alt="左矢印"
                        />
                        <Image
                          className={styles.arrow_gray_right}
                          src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='15' height='40'><rect fill-opacity='0'/></svg>"
                          width={15}
                          height={40}
                          alt="右矢印"
                        />
                          <>
                            <Image
                              src="/images/arrow_red_left.png"
                              width={15}
                              height={40}
                              alt="右矢印"
                            />
                            <Link className={styles.arrow_middle} href="/reserve/first-come-served/ticketselect">
                              <div>空き枠先着申込<br/>(受付中)</div>
                            </Link>
                            <Image
                              src="/images/arrow_red_right.png"
                              width={15}
                              height={40}
                              alt="右矢印"
                            />
                          </>
                        <Image
                          className={styles.arrow_gray_left}
                          src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='15' height='40'><rect fill-opacity='0'/></svg>"
                          width={15}
                          height={40}
                          alt="左矢印"
                        />
                        <Image
                          className={styles.arrow_gray_right}
                          src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='15' height='40'><rect fill-opacity='0'/></svg>"
                          width={15}
                          height={40}
                          alt="右矢印"
                        />
                        <Image
                          className={styles.arrow_gray_left}
                          src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='15' height='40'><rect fill-opacity='0'/></svg>"
                          width={15}
                          height={40}
                          alt="左矢印"
                        />
                        <Image
                          className={styles.arrow_gray_right}
                          src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='15' height='40'><rect fill-opacity='0'/></svg>"
                          width={15}
                          height={40}
                          alt="右矢印"
                        />
                      </div>
                    </div> */}

                    <div className={styles.arrows_event}>
                      <div className={styles.arrows_title}>
                        <span>■</span>
                        リハーサルの予約
                      </div>
                      <div className={styles.arrow}>
                        <Image
                          className={styles.arrow_gray_left}
                          src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='15' height='40'><rect fill-opacity='0'/></svg>"
                          width={15}
                          height={40}
                          alt="左矢印"
                        />
                        <Image
                          className={styles.arrow_gray_right}
                          src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='15' height='40'><rect fill-opacity='0'/></svg>"
                          width={15}
                          height={40}
                          alt="右矢印"
                        />
                          <>
                            <Image
                              src="/images/arrow_red_left.png"
                              width={15}
                              height={40}
                              alt="右矢印"
                            />
                            <Link
                              className={styles.arrow_middle}
                              href={isRehearsalOpen ? "/reserve/first-come-served/ticketselect" : "#"}
                              style={isRehearsalOpen ? {} : { pointerEvents: "none" }}
                              tabIndex={isRehearsalOpen ? 0 : -1}
                            >
                              <div>
                                リハーサル先着申込<br/>
                                {now.getTime() < rehearsalStart.getTime() && (
                                  <span>(受付前)</span>
                                )}
                                {now.getTime() > rehearsalEnd.getTime() && (
                                  <span>(受付終了)</span>
                                )}
                                {isRehearsalOpen && (
                                  <span>(受付中)</span>
                                )}
                              </div>
                            </Link>
                            <Image
                              src="/images/arrow_red_right.png"
                              width={15}
                              height={40}
                              alt="右矢印"
                            />
                          </>
                        <Image
                          className={styles.arrow_gray_left}
                          src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='15' height='40'><rect fill-opacity='0'/></svg>"
                          width={15}
                          height={40}
                          alt="左矢印"
                        />
                        <Image
                          className={styles.arrow_gray_right}
                          src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='15' height='40'><rect fill-opacity='0'/></svg>"
                          width={15}
                          height={40}
                          alt="右矢印"
                        />
                        <Image
                          className={styles.arrow_gray_left}
                          src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='15' height='40'><rect fill-opacity='0'/></svg>"
                          width={15}
                          height={40}
                          alt="左矢印"
                        />
                        <Image
                          className={styles.arrow_gray_right}
                          src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='15' height='40'><rect fill-opacity='0'/></svg>"
                          width={15}
                          height={40}
                          alt="右矢印"
                        />
                      </div>
                    </div>
                  </div>
                  <div className={styles.ticket_bottom_text}>
                    <div className={styles.ticket_bottom_text_icon}>
                      <Image
                        src="/images/comment.png"
                        width={20}
                        height={20}
                        alt="ご案内"
                      />
                    </div>
                    <div className={styles.ticket_bottom_text_info}>
                      <p>７日前抽選の申込は2025年8月2日(土)まで！</p>
                    </div>
                  </div>
                </div>
              </div>
              <Image
                className={styles.ticket_bottom_image}
                src="/images/ticket_bottom.png"
                width={680}
                height={41}
                alt="bottom"
              />
            </div>
          </div>
          <div className={styles.buttons}>
            <div className={styles.button_top}>
              <div className={styles.button_more}>　　　　　　　</div>
            </div>
            <ul className={styles.button_bottom}>
              <li>
                <div className={styles.button_other}><p>チケットの追加購入</p></div>
                <p>※ 入場後の登録、使用済みチケットの登録はできませんのでご注意ください。</p>
              </li>
              <li>
                <div className={styles.button_other}><p>チケットの受け渡し</p></div>
                <p>チケットの受け渡し履歴<br/>
                ※ 入場後の受け渡し、使用済みチケットの受け渡しはできませんのでご注意ください。</p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.footer_inner}>

        </div>
      </div>

      {/* QRモーダル */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modal_inner}>
              <button className={styles.closeButton} onClick={handleCloseModal}>
                <Image
                  src="/images/close.png"
                  width={20}
                  height={20}
                  alt="閉じる"
                />
              </button>
              <div className={styles.modal_content}>
                <h2 className={styles.modal_title}>青霞祭予約券</h2>
                <div className={styles.modal_carousel}>
                  <div className={styles.modal_carousel_inner}>
                    <div className={styles.ticket_number}>1/1</div>
                    <div className={styles.ticket_kind}>青霞祭予約券</div>
                    <div className={styles.age}>来場者</div>
                    <div className={styles.qrcode}>
                      <Image
                        src="/images/qrcode.png"
                        width={200}
                        height={200}
                        alt="QRコード"
                      />
                    </div>
                    <div className={styles.ticket_id}>チケットID：--------</div>
                    {alreadyApplied ? (
                      <div className={styles.ticket_badges}>イベントの予約あり</div>
                    ) : (
                      <div className={styles.ticket_badges}>イベントの予約なし</div>
                    )}
                    <div className={styles.ticket_schedule}>
                      <div className={styles.ticket_schedule_row}>8月10日<span>(日)</span></div>
                      <div className={styles.ticket_schedule_row}>11:00-</div>
                      <div className={styles.ticket_schedule_row}>[正門]</div>
                    </div>
                    {session?.user?.image ? (
                       <Image
                         className={styles.ticket_gif}
                         src={session.user.image.replace('=s96-c', '=s400-c')}
                         width={200}
                         height={200}
                         alt="ユーザープロフィール画像"
                       />
                     ) : (
                       <Image
                         src="/images/ticket_gif.gif"
                         width={140}
                         height={80}
                         alt="青霞祭予約券"
                       />
                     )}
                  </div>
                </div>
                <div className={styles.detail_button}>
                  {alreadyApplied ? (
                    <Link href="/reserve/result">
                      <div className={styles.detail_button_inner}>イベントの予約状況</div>
                    </Link>
                  ) : (
                    <div className={styles.detail_button_inner} style={{ pointerEvents: 'none', opacity: 0.5 }}>
                      イベントの予約状況
                    </div>
                  )}
                </div>
                <div className={styles.action_button}>
                  <div className={styles.action_close} onClick={handleCloseModal}>とじる</div>
                  <div className={styles.action_print}><p>印刷する</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}