import React from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PdcaPdfDocument from "./pdca-pdf-document";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PdfDownloadButton(props: any) {
  return (
    <PDFDownloadLink
      document={<PdcaPdfDocument {...props} />}
      fileName={`PDCA_${props.document_identifier || "Reporte"}.pdf`}
    >
      {({ loading }: { loading: boolean }) => (
        <Button disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-9 text-xs">
          <Download className="size-4" />
          {loading ? "Generando PDF..." : "Descargar PDF Ejecutivo"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
