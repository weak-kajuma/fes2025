'use client';

import Image from 'next/image';
import styles from './page.module.css';
import Link from 'next/link';
import { useState } from 'react';

export default function Reserve7DaysBeforeTicketSelectPage() {
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // チケットデータ（実際のアプリケーションではAPIから取得）
  const tickets = [
    {
      id: 'ticket-1',
      type: '青霞祭予約券',
      age: '来場者',
      ticketId: '----------',
      entryDate: '2025年8月10日(日) 11:00-',
      image: '/images/ticket_gif.gif'
    }
  ];

  // 個別チケットの選択/解除
  const handleTicketSelect = (ticketId: string) => {
    const newSelected = new Set(selectedTickets);
    if (newSelected.has(ticketId)) {
      newSelected.delete(ticketId);
    } else {
      newSelected.add(ticketId);
    }
    setSelectedTickets(newSelected);

    // すべて選択状態の更新
    setSelectAll(newSelected.size === tickets.length);
  };

  // すべて選択/解除
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTickets(new Set());
      setSelectAll(false);
    } else {
      setSelectedTickets(new Set(tickets.map(ticket => ticket.id)));
      setSelectAll(true);
    }
  };

  // 選択されたチケットがあるかどうか
  const hasSelectedTickets = selectedTickets.size > 0;

  return (
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

      <div className={styles.main}>
        <div className={styles.main_inner}>
          <div className={styles.top}>
            <h1 className={styles.top_title}><span>＜空き枠先着＞</span><br/>チケットの選択</h1>
            <div className={styles.top_info}>申し込むチケットを選択してください。<br/>
              予約･抽選の確認や変更･取消は<br/>
              <span>マイチケット</span>から行えます 。</div>
            <div className={styles.top_summaryButton}>一度に14枚まで申し込めます。</div>
            <div className={styles.top_summaryButton1}>他の方がお持ちのチケットも<br/>
              まとめて申し込む<br/>
              （チケットIDを入力）
            </div>
            <ul>
              <li>
                <div className={styles.ticket_selectable}>選択可能なチケット {tickets.length}枚</div>
              </li>
              <li>
                <div className={styles.ticket_selected}>選択したチケット： {selectedTickets.size}枚</div>
              </li>
              <li>
                {hasSelectedTickets ? (
                  <Link href="/reserve/first-come-served/eventSelect">
                    <div className={styles.ticket_link}>
                      選択したチケットで申し込む
                    </div>
                  </Link>
                ) : (
                  <div className={`${styles.ticket_link} ${styles.ticket_link_disabled}`}>
                    選択したチケットで申し込む
                  </div>
                )}
              </li>
            </ul>
          </div>
          <div className={styles.controller}>
            <div className={styles.controller_allcheck}>
              <label htmlFor="select-all" className={styles.select_all_button}>
                <input
                  type="checkbox"
                  id="select-all"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
                <span>すべて選択</span>
              </label>
              <div className={styles.allcheck_info}>
                <p>表示されないチケットがある場合</p>
                <Image
                  src="/images/button_back_red.png"
                  width={22}
                  height={22}
                  alt="矢印"
                />
              </div>
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
          <div className={styles.ticket_list}>
            {tickets.map((ticket) => (
              <div key={ticket.id} className={styles.ticket_list_inner}>
                <label htmlFor={`ticket-${ticket.id}`} className={styles.ticket_list_checkbox}>
                  <input
                    type="checkbox"
                    id={`ticket-${ticket.id}`}
                    checked={selectedTickets.has(ticket.id)}
                    onChange={() => handleTicketSelect(ticket.id)}
                  />
                  <span></span>
                </label>
                <div className={styles.ticket_list_info}>
                  <div className={styles.ticket_list_info_content}>
                    <div className={styles.image_area}>
                      <Image
                        src={ticket.image}
                        width={141}
                        height={84}
                        alt="チケット"
                      />
                    </div>
                    <label htmlFor={`ticket-${ticket.id}`} className={styles.text_area}>
                      <span className={styles.type}>{ticket.type}</span>
                      <span className={styles.age}>{ticket.age}</span>
                    </label>
                  </div>
                  <div className={styles.ticket_list_info_detail}>
                    <div className={styles.ticket_id}>チケットID：{ticket.ticketId}</div>
                    <div className={styles.entry_date}>来場日時：{ticket.entryDate}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.buttons}>
            <div className={styles.button_top}>
              <div className={styles.button_more}>もっと見る　</div>
            </div>
            <div className={styles.button_message}>
              <h2>表示されないチケットがある場合</h2>
              <p>申込できるチケットを表示しています。<br/>
                申込済みのチケットは表示されません。<br/>
                変更取消はマイチケットのチケット詳細から行ってください。</p>
            </div>
            <div className={styles.bottom_summaryButton1}>他の方がお持ちのチケットも<br/>
              まとめて申し込む<br/>
              （チケットIDを入力）
            </div>
            <ul className={styles.ticket_selectable}>
              <li>
                <div className={styles.ticket_selected}>選択したチケット： {selectedTickets.size}枚</div>
              </li>
              <li>
                {hasSelectedTickets ? (
                  <Link href="/reserve/7days-before-reservation/widhlist">
                    <div className={styles.ticket_link}>
                      選択したチケットで申し込む
                    </div>
                  </Link>
                ) : (
                  <div className={`${styles.ticket_link} ${styles.ticket_link_disabled}`}>
                    選択したチケットで申し込む
                  </div>
                )}
              </li>
            </ul>
            <div className={styles.button_back}>マイチケットに戻る</div>
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