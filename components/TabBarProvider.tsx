"use client";

import { useRef } from "react";
import { TabBarContext } from "../app/contexts/TabBarContext";
import TabBar from "./TabBar/TabBar";

type TabBarProviderProps = {
  children: React.ReactNode;
};

export default function TabBarProvider({ children }: TabBarProviderProps) {
  const tabBarRef = useRef<HTMLDivElement>(null);

  return (
    <TabBarContext.Provider value={tabBarRef}>
      <TabBar ref={tabBarRef} />
      {children}
    </TabBarContext.Provider>
  );
}