"use client";
import { ReactNode } from "react";
import { useTransitionRouter } from "next-view-transitions";
import { usePathname } from "next/navigation";

interface AnimatedLinkProps {
  to: string;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  as?: "button" | "a";
};

export default function AnimatedLink({ to, children, className, style, as = "a" }: AnimatedLinkProps) {
  const router = useTransitionRouter();
  const pathname = usePathname();

  function triggerPageTransition() {
    document.documentElement.animate([
      { clipPath: 'polygon(25% 75%, 75% 75%, 75% 75%, 25% 75%)' },
      { clipPath: 'polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)' }
    ], {
      duration: 2000,
      easing: 'cubic-bezier(0.9, 0, 0.1, 1)',
      pseudoElement: '::view-transition-new(root)'
    });
  }

  const handleClick = (e: React.MouseEvent) => {
    if (to === pathname) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    router.push(to, { onTransitionReady: triggerPageTransition });
  };

  // デザイン崩れ防止: as="a"ならhref属性を付与、buttonならtype="button"を付与
  if (as === "a") {
    return (
      <a
        href={to}
        className={className}
        style={style}
        onClick={handleClick}
        tabIndex={0}
        role="link"
      >
        {children}
      </a>
    );
  } else {
    return (
      <button
        type="button"
        className={className}
        style={style}
        onClick={handleClick}
      >
        {children}
      </button>
    );
  }
}