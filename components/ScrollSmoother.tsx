"use client"

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

declare global {
	interface Window {
		scrollSmoother?: any;
	}
}

export const useScrollSmoother = () => {
	const pathname = usePathname();

	useEffect(() => {
		if (typeof window === 'undefined') return;

    	gsap.registerPlugin(ScrollTrigger);

		const initScrollSmoother = async () => {
			// 既存のインスタンスがあれば破棄
			if (window.scrollSmoother) {
				try { window.scrollSmoother.kill(); } catch {}
				window.scrollSmoother = undefined;
			}

			const contentEl = document.querySelector('[data-scroll-container]') as HTMLElement | null;
			if (!contentEl) {
				window.scrollSmoother = undefined;
				return;
			}

			const wrapperEl = contentEl.closest('[data-smooth-wrapper]') as HTMLElement | null;
			// React の管理外で DOM を再ラップすると不整合の原因になるため、
			// ラッパーが存在しない場合は初期化しない
			if (!wrapperEl || wrapperEl !== contentEl.parentElement) {
				window.scrollSmoother = undefined;
				return;
			}

			const isMobile = window.innerWidth <= 768;

			let SmootherMod: any = null;
			try {
				SmootherMod = (await import('gsap/ScrollSmoother')).ScrollSmoother;
				gsap.registerPlugin(SmootherMod);
			} catch {}

			if (!SmootherMod) {
				window.scrollSmoother = undefined;
				return;
			}

			const smoother = SmootherMod.create({
				wrapper: wrapperEl!,
				content: contentEl,
				smooth: isMobile ? 1 : 2,
				smoothTouch: isMobile ? 0.01 : 0.1,
				effects: true,
				normalizeScroll: true,
			});

			window.scrollSmoother = smoother;
			// 初期化直後に必ずトップへスクロール
			smoother.scrollTo(0, false);

			setTimeout(() => {
				ScrollTrigger.refresh();
			}, 200);
		};


		// ページ遷移後、少し待ってから初期化処理を実行（ViewTransitionのスナップショット競合を避ける）
		const timer = setTimeout(() => {
			requestAnimationFrame(() => initScrollSmoother());
		}, 400);

		return () => {
			clearTimeout(timer);
			// ViewTransition 実行中に DOM を再ラップ/解除するとエラーになり得るため、少し遅らせて解放
			const safeDispose = () => {
				if (typeof window !== 'undefined' && window.scrollSmoother) {
					try { window.scrollSmoother.kill(); } catch {}
					window.scrollSmoother = undefined;
				}
			};
			setTimeout(() => requestAnimationFrame(safeDispose), 350);
		};
	}, [pathname]);

	return null;
};
