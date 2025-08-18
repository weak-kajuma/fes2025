'use client';

import { ReactNode, useRef, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import gsap from 'gsap';
import { TransitionContext } from './TransitionContext';

interface Props {
  children: ReactNode;
}

export default function TransitionProvider({ children }: Props) {
  const [isTransitioning, setTransitioning] = useState(false);
  const coverRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const navigateWithAnimation = async (path: string) => {
    if (isTransitioning) return;
    setTransitioning(true);

    // 1️⃣ cover作成
    if (coverRef.current) {
      coverRef.current.style.display = 'block';
    }

    // 2️⃣ cover表示アニメーション
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        if (coverRef.current) {
          gsap.to(coverRef.current, {
            opacity: 1,
            duration: 1,
            ease: 'power1.inOut',
            onComplete: () => resolve(),
          });
        }
      });
    });

    // 3️⃣ ページ切替（children切り替え）
    router.push(path);
    // cover消しアニメーションはuseEffectでpathname変化時に発火
  };

  // cover消しアニメーションの遅延（ミリ秒）
  const delayAfterTransition = 1000;

  // 4️⃣ ページ切替後にカバーを解除
  useEffect(() => {
    // pathnameが変化したらcover消しアニメーション（遅延あり）
    if (!isTransitioning) return;

    const timer = setTimeout(() => {
      if (coverRef.current) {
        gsap.to(coverRef.current, {
          opacity: 0,
          duration: 0.5,
          ease: 'power1.inOut',
          onComplete: () => {
            setTransitioning(false);
            if (coverRef.current) coverRef.current.style.display = 'none';
          },
        });
      }
    }, delayAfterTransition);

    return () => clearTimeout(timer);
  }, [pathname]);

  const coverStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
    pointerEvents: 'none',
    opacity: 1,
    zIndex: 100000000,
    display: 'none'
  };

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100dvh',
  };

  return (
    <TransitionContext.Provider value={{ navigateWithAnimation, isTransitioning }}>
      <div className='a' style={containerStyle}>
        <div ref={coverRef} style={coverStyle} />
        {children}
      </div>
    </TransitionContext.Provider>
  );
}
