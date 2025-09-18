import { useEffect, useRef, useState } from "react";
import styles from "./PDFViewer.module.css";
// @ts-ignore
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import "pdfjs-dist/web/pdf_viewer.css";
import "pdfjs-dist/web/pdf_viewer.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.js";

interface PDFViewerProps {
  url: string;
  width?: string | number;
  height?: string | number;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url, width = "100%", height = 700 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [canvases, setCanvases] = useState<HTMLCanvasElement[]>([]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    pdfjsLib.getDocument(url).promise.then(async (doc: any) => {
      if (!isMounted) return;
      setPdfDoc(doc);
      setNumPages(doc.numPages);
      setPageNum(1);
      // 全ページ先読み
      const canvasArr: HTMLCanvasElement[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        await page.render(renderContext).promise;
        canvasArr.push(canvas);
      }
      setCanvases(canvasArr);
      setLoading(false);
    });
    return () => { isMounted = false; if (containerRef.current) containerRef.current.innerHTML = ""; };
  }, [url]);

  useEffect(() => {
    // ページ切替時に保存済みcanvasを表示
    if (!canvases.length) return;
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(canvases[pageNum - 1]);
    }
  }, [canvases, pageNum]);

  return (
    <div className={styles.viewerWrapper}>
      <button
        onClick={() => setPageNum(p => Math.max(1, p - 1))}
        disabled={pageNum <= 1 || loading}
        className={`${styles.navButton} ${styles.back} ${pageNum <= 1 || loading ? styles.disabled : ''}`}
      >
        ←
      </button>
      <div className={styles.pdfArea} style={{ position: 'relative' }}>
        <div ref={containerRef} className={styles.pdfCanvas} />
        {loading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner}></div>
            <span style={{ color: '#888', fontSize: 14 }}>読み込み中...</span>
          </div>
        )}
        <span className={styles.pageInfo}>{pageNum} / {numPages}</span>
      </div>
      <button
        onClick={() => setPageNum(p => Math.min(numPages, p + 1))}
        disabled={pageNum >= numPages || loading}
        className={`${styles.navButton} ${styles.next} ${pageNum >= numPages || loading ? styles.disabled : ''}`}
      >
        →
      </button>
    </div>
  );
};

export default PDFViewer;
