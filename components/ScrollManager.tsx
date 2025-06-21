"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function ScrollManager() {
  const pathname = usePathname();
  const previousPathname = useRef(pathname); // 前回のパス名を記憶

  useEffect(() => {
    // パスが変更された場合のみ実行
    if (previousPathname.current !== pathname) {
      // パスが変わったら即座にトップへスクロール
      window.scrollTo(0, 0);
    }

    // 現在のパスを保存
    previousPathname.current = pathname;

  }, [pathname]);

  // このコンポーネントは何もレンダリングしない
  return null;
}