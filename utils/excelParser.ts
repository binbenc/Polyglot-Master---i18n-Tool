import * as XLSX from 'xlsx';
import { I18nProject, ColumnMetadata, TranslationRow } from '../types';

// Row indices based on the user's specified format (0-indexed)
const ROW_HEADER = 0;
const ROW_ANDROID_FILE = 1;
const ROW_ANDROID_PATH = 2;
const ROW_IOS_FILE = 3;
const ROW_IOS_PATH = 4;
const ROW_FLUTTER_FILE = 5;
const ROW_FLUTTER_PATH = 6;
const ROW_DATA_START = 7;

export const parseExcel = async (file: File): Promise<I18nProject> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to array of arrays to handle the header structure easily
        const rawData = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1, defval: "" });

        if (rawData.length < ROW_DATA_START) {
          throw new Error("Invalid Excel format: Insufficient metadata rows.");
        }

        const headerRow = rawData[ROW_HEADER];
        const androidFiles = rawData[ROW_ANDROID_FILE];
        const androidPaths = rawData[ROW_ANDROID_PATH];
        const iosFiles = rawData[ROW_IOS_FILE];
        const iosPaths = rawData[ROW_IOS_PATH];
        const flutterFiles = rawData[ROW_FLUTTER_FILE];
        const flutterPaths = rawData[ROW_FLUTTER_PATH];

        const columns: ColumnMetadata[] = [];
        
        // Iterate columns starting from 1 (Column 0 is the Key)
        for (let i = 1; i < headerRow.length; i++) {
          const langCode = headerRow[i];
          if (!langCode) continue;

          columns.push({
            langCode,
            androidFile: androidFiles[i] || '',
            androidPath: androidPaths[i] || '',
            iosFile: iosFiles[i] || '',
            iosPath: iosPaths[i] || '',
            flutterFile: flutterFiles[i] || '',
            flutterPath: flutterPaths[i] || '',
          });
        }

        const rows: TranslationRow[] = [];
        for (let i = ROW_DATA_START; i < rawData.length; i++) {
          const rowData = rawData[i];
          const key = rowData[0];
          if (!key) continue;

          const row: TranslationRow = { key };
          columns.forEach((col, index) => {
             // col index corresponds to rawData index + 1 because we skipped key column
             row[col.langCode] = rowData[index + 1] || ''; 
          });
          rows.push(row);
        }

        resolve({ columns, data: rows });

      } catch (err) {
        reject(err);
      }
    };
    reader.readAsArrayBuffer(file);
  });
};

export const generateExcelBuffer = (project: I18nProject): ArrayBuffer => {
  const { columns, data } = project;
  
  // Construct the matrix
  const matrix: string[][] = [];

  // 1. Metadata Rows
  const headerRow = ['Android / iOS Key / Flutter key', ...columns.map(c => c.langCode)];
  const androidFileRow = ['[Android File]', ...columns.map(c => c.androidFile)];
  const androidPathRow = ['[Android Path]', ...columns.map(c => c.androidPath)];
  const iosFileRow = ['[iOS File]', ...columns.map(c => c.iosFile)];
  const iosPathRow = ['[iOS Path]', ...columns.map(c => c.iosPath)];
  const flutterFileRow = ['[Flutter File]', ...columns.map(c => c.flutterFile)];
  const flutterPathRow = ['[Flutter Path]', ...columns.map(c => c.flutterPath)];

  matrix.push(
    headerRow,
    androidFileRow,
    androidPathRow,
    iosFileRow,
    iosPathRow,
    flutterFileRow,
    flutterPathRow
  );

  // 2. Data Rows
  data.forEach(item => {
    const row = [item.key];
    columns.forEach(col => {
      row.push(item[col.langCode] || '');
    });
    matrix.push(row);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(matrix);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Localizations");

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return excelBuffer;
};
