import React from "react";
import styles from "./SurveyPopup.module.css";

interface SurveyPopupProps {
  onClose: () => void;
  visible?: boolean;
}

const SurveyPopup: React.FC<SurveyPopupProps> = ({ onClose, visible = true }) => {
  return (
    <div className={styles.overlay}>
      <div className={visible ? styles.popup : `${styles.popup} ${styles.hide}`}>
        <button onClick={onClose} className={styles.close}>×</button>
        <div style={{ fontWeight: "bold", fontSize: "16px", marginBottom: 4 }}>アンケートご協力のお願い</div>
        <div style={{ fontSize: "14px", marginBottom: 8 }}>
          ご訪問ありがとうございます！<br />
          より良い公式ホームページにしていくため、みなさまのご意見・ご感想をぜひお聞かせください。<br />
          ご協力をお願いいたします。
        </div>
        <a href="https://docs.google.com/forms/d/e/1FAIpQLSdXItMCk2IrFdqXARh7IZ7AtNRB3D6HGeZm1QUTcugyWSejTg/viewform?usp=dialog" target="_blank" rel="noopener noreferrer" className={styles.button}>
          アンケートに答える
        </a>
      </div>
    </div>
  );
};

export default SurveyPopup;
