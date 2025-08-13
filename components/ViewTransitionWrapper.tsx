"use client";

import { unstable_ViewTransition as ViewTransition } from "react";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

export default function ViewTransitionWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [hasSmoothWrapper, setHasSmoothWrapper] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const check = () => {
      const exists = !!document.querySelector('[data-smooth-wrapper]');
      setHasSmoothWrapper(exists);
    };
    check();
    const id = setTimeout(check, 0);
    return () => clearTimeout(id);
  }, [pathname]);

  const disableOnThisPage = useMemo(() => {
    // トップページや ScrollSmoother を使うページでは ViewTransition を無効化
    if (pathname === "/") return true;
    if (hasSmoothWrapper) return true;
    return false;
  }, [pathname, hasSmoothWrapper]);

  if (disableOnThisPage) return <>{children}</>;
  return <ViewTransition>{children}</ViewTransition>;
}
