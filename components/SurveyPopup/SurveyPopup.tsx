import React from "react";
import styles from "./SurveyPopup.module.css";
import { useState } from "react";

interface SurveyPopupProps {
  onClose: () => void;
  visible?: boolean;
}

const SurveyPopup: React.FC = () => {
  const [visible, setVisible] = useState(true);
  const isMobile = typeof window !== "undefined" && window.matchMedia && window.matchMedia('(max-width: 599px)').matches;

  // 初期表示判定（スマホのみ）
  React.useEffect(() => {
    if (!isMobile) return;
    const hideTime = localStorage.getItem('survey_banner_hide_time');
    if (hideTime) {
      const now = Date.now();
      const diff = now - Number(hideTime);
      if (diff < 300000) { // 5分未満
        setVisible(false);
      } else {
        setVisible(true);
        localStorage.removeItem('survey_banner_hide_time');
      }
    } else {
      setVisible(true);
    }
  }, [isMobile]);

  const handleClose = () => {
    setVisible(false);
    if (isMobile) {
      localStorage.setItem('survey_banner_hide_time', String(Date.now()));
    }
  };

  if (!visible) return null;

  return (
    <div className={styles.banner}>
      {isMobile && (
        <button className={styles.close} onClick={handleClose} aria-label="閉じる">
          <span className="material-icons" style={{ fontSize: '1.8rem', verticalAlign: 'middle' }}>close</span>
        </button>
      )}
      <a href="https://docs.google.com/forms/d/e/1FAIpQLSdXItMCk2IrFdqXARh7IZ7AtNRB3D6HGeZm1QUTcugyWSejTg/viewform?usp=dialog" target="_blank" rel="noopener noreferrer" className={styles.bannerLink}>
        <span className={styles.bannerText}>アンケートご協力のお願い</span>
      </a>
    </div>
  );
}

export default SurveyPopup;
