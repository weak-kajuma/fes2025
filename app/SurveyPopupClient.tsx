"use client";
import React, { useEffect, useState } from "react";
import SurveyPopup from "../components/SurveyPopup/SurveyPopup";

const SURVEY_INTERVAL = 300000; // 5分

const SurveyPopupClient: React.FC = () => {
  const [showSurvey, setShowSurvey] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 訪問回数取得・更新
    const visitCount = Number(localStorage.getItem("survey_visit_count") ?? "0") + 1;
    localStorage.setItem("survey_visit_count", String(visitCount));

    if (visitCount >= 2) {
      setShowSurvey(true);
      setVisible(true);
    }
    const interval = setInterval(() => {
      setShowSurvey(true);
      setVisible(true);
    }, SURVEY_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const handleCloseSurvey = () => {
    setVisible(false);
    setTimeout(() => {
      setShowSurvey(false);
    }, 400); // slideOutのdurationと合わせる
  };

  return showSurvey ? <SurveyPopup onClose={handleCloseSurvey} visible={visible} /> : null;
};

export default SurveyPopupClient;
