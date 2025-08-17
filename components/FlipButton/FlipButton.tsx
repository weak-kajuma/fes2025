import styles from "./FlipButton.module.css";
import Link from "next/link";

type FlipButtonProps = {
  front: string;
  back: string;
  href?: string;
  className?: string;
};

export default function FlipButton({ front, back, href = "", className = "" }: FlipButtonProps) {
  return (
    <div className={styles.about_btn} data-circle-cursor="more_detail">
      <Link href={href} className={`${styles.flipBtn} ${className}`}>
        <div className={styles.flipBtnInner}>
          <div className={`${styles.flipBtnItem} ${styles.flipBtnFront}`} data-flip="front">
            <span className={styles.flipBtnText} data-hover>
              {front}
              <i className={styles.flipBtnIcon} data-icon="arrow">
                <svg viewBox="0 0 15.77 24.93" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="m2,2l11.77,10.47L2,22.93"
                    fill="none"
                    stroke="#1A4274"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="4px"
                  />
                </svg>
              </i>
            </span>
          </div>

          <div className={`${styles.flipBtnItem} ${styles.flipBtnBack}`} data-flip="back">
            <span className={styles.flipBtnText} data-hover>
              {back}
              <i className={styles.flipBtnIcon} data-icon="arrow">
                <svg viewBox="0 0 15.77 24.93" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="m2,2l11.77,10.47L2,22.93"
                    fill="none"
                    stroke="#fff"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="4px"
                  />
                </svg>
              </i>
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
