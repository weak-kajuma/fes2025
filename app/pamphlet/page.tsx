'use client';

import styles from './page.module.css';
import PDFViewer from './PDFViewer';

export default function PamphletPage() {
  // サンプルPDFのURL（public配下に置く場合は"/sample.pdf"など）
  const pdfUrl = "/pamphlet.pdf";

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', width: '100%' }}>
        <PDFViewer url={pdfUrl} width={"100%"} height={700} />
      </div>
    </div>
  )
}