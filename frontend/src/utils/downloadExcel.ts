import * as XLSX from 'xlsx';

export interface ExcelDownloadField {
  [key: string]: string | number;
}

export const downloadExcel = (
  data: ExcelDownloadField[],
  filename: string = 'Download.xlsx',
  sheetName: string = 'Sheet1'
) => {
  if (!data || data.length === 0) return;

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
};
