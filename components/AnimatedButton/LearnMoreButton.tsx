import React, { useRef } from "react";
import styles from "./LearnMoreButton.module.css";

interface LearnMoreButtonProps {
  text?: string;
  backgroundColor?: string;
  textColor?: string;
}

const LearnMoreButton: React.FC<LearnMoreButtonProps> = ({
  text = "Learn More",
  backgroundColor = "#282936",
  textColor = "#282936",
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);

  return (
    <button
      className={styles.learnMore}
      style={{ fontFamily: 'Mukta, sans-serif' }}
      ref={btnRef}
      type="button"
    >
      <span
        className={styles.circle}
        // style={{ background: backgroundColor }}
        style={{ border: `solid 1px ${backgroundColor}`, borderRadius: '1.625rem' }}
        aria-hidden="true"
      >
        <span className={`${styles.icon} ${styles.arrow}`}></span>
      </span>
      <span
        className={styles.buttonText}
        style={{ color: textColor }}
      >
        {text}
      </span>
    </button>
  );
};

export default LearnMoreButton;
