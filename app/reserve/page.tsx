import { supabase } from "@/lib/supabaseClient";
import ReserveForm from "./components/ReserveForm";
import Image from "next/image";
import styles from "./page.module.css";

// export default async function RservePage() {
//   const { data: events, error } = await supabase
//     .from("reserveEvents")
//     .select("*")
//     // .gte("reserved_count", 0);

//   if (error || !events) {
//     return <div>イベントの取得に失敗しました。</div>;
//   }

//   return (
//     <main className="p-4">
//       <h1 className="text-2xl font-bold mb-4">予約可能なイベント</h1>
//       <ReserveForm events={events} />
//     </main>
//   );
// }


export default async function ReservePage() {
  const { data: events, error } = await supabase
    .from("reserveEvents")
    .select("*")
    // .gte("reserved_count", 0);

  if (error || !events) {
    return <div>イベントの取得に失敗しました。</div>;
  }

  return (
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
                <li className={styles.munu_index}>チケットの購入</li>
                <li className={styles.munu_index}>予約・抽選の申し込み</li>
                <li className={styles.munu_index}>マイチケット</li>
                <li className={styles.munu_index}>メッセージ</li>
                <li className={styles.munu_index}>よくあるお問い合わせ</li>
                <li className={styles.munu_index}>
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
              入場および予約したパビリオン･イベントに入館する際には、QRコード表示ボタンを押してQRコードを提示してください。<br />
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
                  <Image
                    src="/images/ticket_gif.gif"
                    width={140}
                    height={80}
                    alt="青霞祭予約券"
                  />
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
                <div className={styles.ticket_middle_right}>
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
                        <Image
                          src="/images/arrow_red_left.png"
                          width={15}
                          height={40}
                          alt="右矢印"
                        />
                        <div className={styles.arrow_middle}>7日前抽選申込<br/>(受付中)</div>
                        <Image
                          src="/images/arrow_red_right.png"
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
          <div className={styles.buttons}></div>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.footer_inner}>

        </div>
      </div>
    </div>
  );
}