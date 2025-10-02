"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export default function PDFViewerClient({ base64 }: { base64: string }) {
  const [numPages, setNumPages] = useState<number>();

  return (
    <div>
      <Document
        file={`data:application/pdf;base64,${base64}`}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        onLoadError={(error) => console.error("PDF load error:", error)}
      >
        <Page pageNumber={1} width={800} />
      </Document>
      {numPages && <p>Page 1 of {numPages}</p>}
    </div>
  );
}
