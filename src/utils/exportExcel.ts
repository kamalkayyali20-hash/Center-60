/**
 * Utility to export tabular data to Excel (CSV with UTF-8 BOM)
 * Supports Arabic and English characters seamlessly in Microsoft Excel & Sheets.
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  columns: { header: string; accessor: keyof T | ((item: T) => string | number | boolean | null | undefined) }[],
  fileName: string,
  metaInfo?: { filterPeriod?: string; exportedBy?: string; title?: string }
) {
  if (!data || data.length === 0) {
    alert('No data available to export for the selected filter range.');
    return;
  }

  const rows: string[][] = [];

  // Optional Meta Header
  if (metaInfo?.title) {
    rows.push([`"60 EDUCATION CENTER - ${metaInfo.title}"`]);
  }
  if (metaInfo?.filterPeriod) {
    rows.push([`"Filter / Period: ${metaInfo.filterPeriod}"`]);
  }
  if (metaInfo?.exportedBy) {
    rows.push([`"Exported By: ${metaInfo.exportedBy} | Date: ${new Date().toLocaleString()}"`]);
  }
  if (metaInfo) {
    rows.push([]); // blank line separator
  }

  // Column Headers
  const headerRow = columns.map((col) => `"${col.header.replace(/"/g, '""')}"`);
  rows.push(headerRow);

  // Data Rows
  data.forEach((item) => {
    const row = columns.map((col) => {
      let val: any;
      if (typeof col.accessor === 'function') {
        val = col.accessor(item);
      } else {
        val = item[col.accessor];
      }

      if (val === null || val === undefined) {
        return '""';
      }

      const strVal = String(val).replace(/"/g, '""');
      return `"${strVal}"`;
    });
    rows.push(row);
  });

  const csvContent = rows.map((r) => r.join(',')).join('\r\n');

  // \uFEFF is the UTF-8 Byte Order Mark (BOM) needed for Excel to parse UTF-8 (Arabic) correctly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
