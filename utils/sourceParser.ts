
import { I18nProject, ColumnMetadata, TranslationRow, Platform } from '../types';

export interface ParsedFile {
  langCode: string;
  fileName: string;
  path: string;
  kvMap: Record<string, string>;
}

const parseAndroidXml = (content: string): Record<string, string> => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(content, "text/xml");
  const resources = xmlDoc.getElementsByTagName("string");
  const map: Record<string, string> = {};
  
  for (let i = 0; i < resources.length; i++) {
    const node = resources[i];
    const name = node.getAttribute("name");
    if (name) {
      map[name] = node.textContent || "";
    }
  }
  return map;
};

const parseIosStrings = (content: string): Record<string, string> => {
  const map: Record<string, string> = {};
  const lines = content.split('\n');
  // Regex to match "key" = "value";
  // Handles escaped quotes in value roughly
  const regex = /"(.+)"\s*=\s*"(.+)";/;

  lines.forEach(line => {
    const match = line.match(regex);
    if (match && match.length >= 3) {
      const key = match[1];
      const value = match[2];
      map[key] = value;
    }
  });
  return map;
};

const parseFlutterArb = (content: string): Record<string, string> => {
  try {
    const json = JSON.parse(content);
    const map: Record<string, string> = {};
    Object.keys(json).forEach(key => {
      if (!key.startsWith('@')) {
        map[key] = json[key];
      }
    });
    return map;
  } catch (e) {
    console.error("Failed to parse ARB", e);
    return {};
  }
};

export const parseContent = (platform: Platform, content: string): Record<string, string> => {
  switch (platform) {
    case Platform.ANDROID:
      return parseAndroidXml(content);
    case Platform.IOS:
      return parseIosStrings(content);
    case Platform.FLUTTER:
      return parseFlutterArb(content);
    default:
      return {};
  }
};

export const createProjectFromSourceFiles = (
  platform: Platform,
  baseFile: ParsedFile,
  otherFiles: ParsedFile[]
): I18nProject => {
  const allFiles = [baseFile, ...otherFiles];
  
  // 1. Generate Columns
  const columns: ColumnMetadata[] = allFiles.map(f => {
    return {
      langCode: f.langCode,
      androidFile: platform === Platform.ANDROID ? f.fileName : '',
      androidPath: platform === Platform.ANDROID ? f.path : '',
      iosFile: platform === Platform.IOS ? f.fileName : '',
      iosPath: platform === Platform.IOS ? f.path : '',
      flutterFile: platform === Platform.FLUTTER ? f.fileName : '',
      flutterPath: platform === Platform.FLUTTER ? f.path : '',
    };
  });

  // 2. Generate Rows based on Base File keys
  const baseKeys = Object.keys(baseFile.kvMap);
  const data: TranslationRow[] = baseKeys.map(key => {
    const row: TranslationRow = { key };
    
    // Fill values for each file (column)
    allFiles.forEach(f => {
      // For the current file 'f', find its value for 'key'
      // Note: The user might have multiple files with the SAME langCode (rare but possible),
      // but our structure relies on langCode as the key in TranslationRow.
      // We assume unique langCodes for simplicity here.
      const val = f.kvMap[key];
      if (val !== undefined) {
        row[f.langCode] = val;
      }
    });

    return row;
  });

  return { columns, data };
};
