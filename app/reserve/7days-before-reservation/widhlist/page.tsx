import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

export default function Reserve7DaysBeforeWidhlistPage() {
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
            <h1 className={styles.top_title}>7日前<br/>抽選申込</h1>
            <div className={styles.top_info}>来場予定日のパビリオン･イベントの抽選に、第5希望までお申し込みできます。</div>
            <div className={styles.top_info}>当選は1回の抽選で1つです。<br/>
            第1希望が落選の場合に第2希望、第2希望が落選の場合に第3希望と順番に抽選を行います。</div>
            <div className={styles.top_info}>対象のパビリオン･イベントは、以下の登録操作の中で検索して調べることができます。</div>
            <div className={styles.term}>
              <div className={styles.title}>申込期間：</div>
              <div className={styles.values}><span>　2025年7月10日(木) 0:00</span><span>　-　</span><span>2025年8月2日(土) 23:59</span></div>
              <div className={styles.title}>抽選期間：</div>
              <div className={styles.values}><span>　2025年8月3日(日) 0:00</span><span>　-　</span><span>2025年8月6日(水) 11:59</span></div>
            </div>
          </div>

          <div className={styles.middle}>
            <span className={styles.middle_info_bold}>抽選は第5希望まで登録できます。</span>
            <span className={styles.announce}>登録後には必ずこの画面末尾の<br/>
            「この内容で抽選を申し込む」<br/>
            ボタンを押してください。</span>
            <span className={styles.middle_info_normal}>以下の希望リストを登録・変更・削除しただけでは抽選申込は完了しません。<br/>
            必ず「この内容で抽選を申し込む」を押してください。</span>
            <div className={styles.entrance_date}>来場日時：2025年8月10日(日)<br/>
            追加で申込可能な時間帯</div>
          </div>

          <div className={styles.reserve_selector}>
            <div className={styles.selector}>
              <div className={styles.circle}>
                <span className={styles.circle_text}>第1希望</span>
              </div>
              <div className={styles.note}>
                <div className={styles.note_inner_sp}>
                  <div className={styles.infoArea}>
                    <p className={styles.noteText}>未登録： 2025年8月2日(土) 23:59までに<br/>
                    登録してください。</p>
                  </div>
                  <div className={styles.noteContent}>
                    <Link href="/reserve/7days-before-reservation/reserveForm">
                      <div className={styles.register_button}>登録する</div>
                    </Link>
                    <div className={styles.arrowIcon_up}>
                      <Image src="/images/arrow_gray.png" width={22} height={22} alt="上" />
                    </div>
                    <div className={styles.arrowIcon_down}>
                      <Image src="/images/arrow_gray.png" width={22} height={22} alt="下" />
                    </div>
                  </div>
                </div>
                <div className={styles.knob}></div>
              </div>
            </div>
            <div className={styles.selector}>
              <div className={styles.circle}>
                <span className={styles.circle_text}>第2希望</span>
              </div>
              <div className={styles.note}>
                <div className={styles.note_inner_sp}>
                  <div className={styles.infoArea}>
                    <p className={styles.noteText}>未登録： 2025年8月2日(土) 23:59までに<br/>
                    登録してください。</p>
                  </div>
                  <div className={styles.noteContent}>
                    <div className={styles.register_button}>登録する</div>
                    <div className={styles.arrowIcon_up}>
                      <Image src="/images/arrow_gray.png" width={22} height={22} alt="上" />
                    </div>
                    <div className={styles.arrowIcon_down}>
                      <Image src="/images/arrow_gray.png" width={22} height={22} alt="下" />
                    </div>
                  </div>
                </div>
                <div className={styles.knob}></div>
              </div>
            </div>
            <div className={styles.selector}>
              <div className={styles.circle}>
                <span className={styles.circle_text}>第3希望</span>
              </div>
              <div className={styles.note}>
                <div className={styles.note_inner_sp}>
                  <div className={styles.infoArea}>
                    <p className={styles.noteText}>未登録： 2025年8月2日(土) 23:59までに<br/>
                    登録してください。</p>
                  </div>
                  <div className={styles.noteContent}>
                    <div className={styles.register_button}>登録する</div>
                    <div className={styles.arrowIcon_up}>
                      <Image src="/images/arrow_gray.png" width={22} height={22} alt="上" />
                    </div>
                    <div className={styles.arrowIcon_down}>
                      <Image src="/images/arrow_gray.png" width={22} height={22} alt="下" />
                    </div>
                  </div>
                </div>
                <div className={styles.knob}></div>
              </div>
            </div>
            <div className={styles.selector}>
              <div className={styles.circle}>
                <span className={styles.circle_text}>第4希望</span>
              </div>
              <div className={styles.note}>
                <div className={styles.note_inner_sp}>
                  <div className={styles.infoArea}>
                    <p className={styles.noteText}>未登録： 2025年8月2日(土) 23:59までに<br/>
                    登録してください。</p>
                  </div>
                  <div className={styles.noteContent}>
                    <div className={styles.register_button}>登録する</div>
                    <div className={styles.arrowIcon_up}>
                      <Image src="/images/arrow_gray.png" width={22} height={22} alt="上" />
                    </div>
                    <div className={styles.arrowIcon_down}>
                      <Image src="/images/arrow_gray.png" width={22} height={22} alt="下" />
                    </div>
                  </div>
                </div>
                <div className={styles.knob}></div>
              </div>
            </div>
            <div className={styles.selector}>
              <div className={styles.circle}>
                <span className={styles.circle_text}>第5希望</span>
              </div>
              <div className={styles.note}>
                <div className={styles.note_inner_sp}>
                  <div className={styles.infoArea}>
                    <p className={styles.noteText}>未登録： 2025年8月2日(土) 23:59までに<br/>
                    登録してください。</p>
                  </div>
                  <div className={styles.noteContent}>
                    <div className={styles.register_button}>登録する</div>
                    <div className={styles.arrowIcon_up}>
                      <Image src="/images/arrow_gray.png" width={22} height={22} alt="上" />
                    </div>
                    <div className={styles.arrowIcon_down}>
                      <Image src="/images/arrow_gray.png" width={22} height={22} alt="下" />
                    </div>
                  </div>
                </div>
                <div className={styles.knob}></div>
              </div>
            </div>
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