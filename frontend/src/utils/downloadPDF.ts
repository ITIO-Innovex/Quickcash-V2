import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PDFRow {
  [key: string]: string | number;
}

export const downloadPDF = (
  data: PDFRow[],
  headers: string[],
  filename: string = 'Download.pdf',
  title: string = 'PDF Export'
) => {
  if (!data || data.length === 0) return;

  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(title, 14, 22);

  const tableData = data.map(row => headers.map(header => row[header]));

  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 30,
  });

  doc.save(filename);
};
