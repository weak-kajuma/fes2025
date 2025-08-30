import { signIn, auth, signOut } from "@/auth";
import Image from "next/image";
import styles from "./ticket/page.module.css";
import { TicketButton } from "@/components/TicketButton";

export default async function ReserveLoginPage() {
  const session = await auth();

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
            <h1 className={styles.top_title}>ログイン</h1>
            <div className={styles.top_info}>
              青霞祭のチケット予約システムにログインしてください。<br />
              ログイン後、チケット画面に進むことができます。
            </div>

            {session ? (
              <div className={styles.login_success}>
                <div className={styles.user_info}>
                  {session.user?.image && (
                    <Image
                      src={session.user.image.replace('=s96-c', '=s400-c')}
                      width={80}
                      height={80}
                      alt="プロフィール画像"
                      className={styles.user_image}
                    />
                  )}
                  <div className={styles.user_details}>
                    <h2 className={styles.user_name}>ようこそ、{session.user?.name}さん！</h2>
                    <p className={styles.user_email}>{session.user?.email}</p>
                  </div>
                </div>

                <div className={styles.action_buttons}>
                  <form
                    action={async () => {
                      "use server";
                      await signOut();
                    }}
                  >
                    <button
                      type="submit"
                      className={styles.signout_button}
                    >
                      サインアウト
                    </button>
                  </form>

                  <TicketButton className={styles.ticket_button} />
                </div>
              </div>
            ) : (
              <div className={styles.login_form}>
                <div className={styles.login_description}>
                  Googleアカウントでログインしてください
                </div>

                <form
                  action={async () => {
                    "use server";
                    await signIn("google", {
                      callbackUrl: "/reserve",
                      redirect: true
                    });
                  }}
                >
                  <button
                    type="submit"
                    className={styles.google_login_button}
                  >
                    <svg className={styles.google_icon} viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Googleでログイン
                  </button>
                </form>
              </div>
            )}
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
