"use client";

import { useRef, useCallback, useState } from "react";
import { TabBarContext } from "../app/contexts/TabBarContext";
import TabBar from "./TabBar/TabBar";

type EventDataForClient = {
  id: number;
  title: string | null;
  host: string | null;
  intro: string | null;
  brief_intro: string | null;
  locationType: string | null;
  tags: string[] | null;
};

type TabBarProviderProps = {
  children: React.ReactNode;
};

export default function TabBarProvider({ children }: TabBarProviderProps) {
  const tabBarRef = useRef<HTMLDivElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventDataForClient | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // eventcardクリック時のアニメーション関数
  const triggerAnimation = useCallback((event?: EventDataForClient) => {
    if (tabBarRef.current) {
      if (event) {
        // イベントデータを設定して拡張モードに
        setSelectedEvent(event);
        setIsExpanded(true);
      }

      // グローバルコンテキストを通じてアニメーションを実行
      const context = (window as any).__TAB_BAR_CONTEXT__;
      if (context && context.triggerAnimation) {
        context.triggerAnimation(event);
      }
    }
  }, []);

  // 拡張モードを閉じる関数
  const closeExpanded = useCallback(() => {
    // 状態を先にリセット
    setIsExpanded(false);
    setSelectedEvent(null);

    // グローバルコンテキストを通じて閉じるアニメーションを実行
    const context = (window as any).__TAB_BAR_CONTEXT__;
    if (context && context.closeExpanded) {
      context.closeExpanded();
    }
  }, []);

  return (
    <TabBarContext.Provider value={{
      tabBarRef,
      triggerAnimation,
      selectedEvent,
      isExpanded,
      closeExpanded
    }}>
      <TabBar ref={tabBarRef} />
      {children}
    </TabBarContext.Provider>
  );
}