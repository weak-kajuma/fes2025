import styles from './page.module.css';

export default function RiddlePage() {
  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>謎解き企画</h1>
      <p className={styles.description}>タイムアタック謎解きに挑戦しよう！</p>
    </div>
  );
}