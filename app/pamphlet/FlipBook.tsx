"use client";

import React from "react";
import PDFViewer from "./PDFViewer";

const FlipBook = () => {
  // PDFファイルのURLを指定
  const pdfUrl = "/pamphlet.pdf";

  return (
    <div style={{ width: "100%", maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <h2 style={{ textAlign: "center", marginBottom: 16 }}>青霞祭パンフレット</h2>
      <PDFViewer url={pdfUrl} width="100%" height={700} />
    </div>
  );
};

export default FlipBook;
