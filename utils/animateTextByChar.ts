import gsap from "gsap";

/**
 * 要素内のすべてのテキストノードを再帰的に探し、
 * 文字ごとに span でラップし置換する
 */
function wrapCharsRecursively(el: HTMLElement) {
  const walker = document.createTreeWalker(
    el,
    NodeFilter.SHOW_TEXT,
    null
  );
  const textNodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node.nodeValue) {
      textNodes.push(node as Text);
    }
  }

  textNodes.forEach(textNode => {
    const parent = textNode.parentElement;
    if (!parent) return;
    const text = textNode.nodeValue || "";
    const fragment = document.createDocumentFragment();
    // 文字ごとに span 要素を作成
    text.split("").forEach(char => {
      const span = document.createElement("span");
      if (char === ' ') {
        span.innerHTML = '&nbsp;'; // 半角スペースの場合は &nbsp; を設定
      } else {
        span.textContent = char; // それ以外の文字は textContent を使用
      }
      span.style.display = "inline-block";
      span.style.transform = "translateY(100%)";
      span.style.opacity = "0";
      fragment.appendChild(span);
    });
    parent.replaceChild(fragment, textNode);
  });
}

export function animateTextByChar(
  el: HTMLElement,
  options?: {
    triggerStart?: string;
    triggerEnd?: string;
    stagger?: number;
    duration?: number;
    ease?: string;
    toggleActions?: string;
  }
) {
  if (!el) return;
  // すべてのテキストノードを文字ごとに span へ
  wrapCharsRecursively(el);

  const spans = Array.from(el.querySelectorAll("span"));
  gsap.to(spans, {
    y: 0,
    opacity: 1,
    stagger: options?.stagger ?? 0.07,
    duration: options?.duration ?? 0.5,
    ease: options?.ease ?? "power2.out",
    scrollTrigger: {
      trigger: el,
      start: options?.triggerStart ?? "bottom bottom",
      end: options?.triggerEnd ?? "top top",
      toggleActions: options?.toggleActions ?? "play none none reverse",
    },
  });
}