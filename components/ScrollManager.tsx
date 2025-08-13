"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function ScrollManager() {
  const pathname = usePathname();
  const previousPathname = useRef(pathname); // 前回のパス名を記憶

  useEffect(() => {
    // パスが変更された場合のみ実行
    if (previousPathname.current !== pathname) {
      // ScrollSmoother があればそれを利用して先頭へ瞬間移動
      const smoother = (window as any).scrollSmoother;
      if (smoother && typeof smoother.scrollTo === 'function') {
        smoother.scrollTo(0, false);
      } else {
        window.scrollTo(0, 0);
      }
    }

    // 現在のパスを保存
    previousPathname.current = pathname;

  }, [pathname]);

  // このコンポーネントは何もレンダリングしない
  return null;
}