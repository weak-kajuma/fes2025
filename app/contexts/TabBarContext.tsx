"use client";

import { createContext } from "react";

// TabBarのrefを共有するためのコンテキスト
export const TabBarContext = createContext<React.RefObject<HTMLDivElement | null> | null>(null);