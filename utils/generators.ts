import JSZip from 'jszip';
import { I18nProject, TranslationRow } from '../types';

// --- Format Generators ---

const generateAndroidXML = (data: TranslationRow[], langCode: string): string => {
  let xml = '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n';
  data.forEach(row => {
    const val = row[langCode];
    if (val) {
      // Escape standard XML characters
      const escaped = val
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '\\"')
        .replace(/'/g, "\\'");
      xml += `    <string name="${row.key}">${escaped}</string>\n`;
    }
  });
  xml += '</resources>';
  return xml;
};

const generateIOSStrings = (data: TranslationRow[], langCode: string): string => {
  let strings = '';
  data.forEach(row => {
    const val = row[langCode];
    if (val) {
      const escaped = val.replace(/"/g, '\\"').replace(/\n/g, '\\n');
      strings += `"${row.key}" = "${escaped}";\n`;
    }
  });
  return strings;
};

const generateFlutterARB = (data: TranslationRow[], langCode: string): string => {
  const obj: Record<string, string> = {};
  // Add a locale key if it matches generic flutter arb pattern usually
  obj['@@locale'] = langCode.replace('-', '_'); 
  
  data.forEach(row => {
    const val = row[langCode];
    if (val) {
      obj[row.key] = val;
    }
  });
  return JSON.stringify(obj, null, 2);
};

// --- ZIP Generation ---

export const generateZip = async (project: I18nProject): Promise<Blob> => {
  const zip = new JSZip();

  project.columns.forEach(col => {
    const { langCode, androidFile, androidPath, iosFile, iosPath, flutterFile, flutterPath } = col;

    // Android
    if (androidFile && androidPath) {
      const content = generateAndroidXML(project.data, langCode);
      // Remove leading slash if present to avoid absolute path issues in zip
      const safePath = (androidPath.endsWith('/') ? androidPath : androidPath + '/').replace(/^\//, '');
      zip.file(`${safePath}${androidFile}`, content);
    }

    // iOS
    if (iosFile && iosPath) {
      const content = generateIOSStrings(project.data, langCode);
      const safePath = (iosPath.endsWith('/') ? iosPath : iosPath + '/').replace(/^\//, '');
      zip.file(`${safePath}${iosFile}`, content);
    }

    // Flutter
    if (flutterFile && flutterPath) {
      const content = generateFlutterARB(project.data, langCode);
      const safePath = (flutterPath.endsWith('/') ? flutterPath : flutterPath + '/').replace(/^\//, '');
      zip.file(`${safePath}${flutterFile}`, content);
    }
  });

  return await zip.generateAsync({ type: 'blob' });
};
