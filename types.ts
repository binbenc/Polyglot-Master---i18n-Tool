export enum Platform {
  ANDROID = 'Android',
  IOS = 'iOS',
  FLUTTER = 'Flutter',
}

export interface ColumnMetadata {
  langCode: string; // e.g., en-US
  androidFile: string;
  androidPath: string;
  iosFile: string;
  iosPath: string;
  flutterFile: string;
  flutterPath: string;
}

export interface TranslationRow {
  key: string;
  [langCode: string]: string;
}

export interface I18nProject {
  columns: ColumnMetadata[];
  data: TranslationRow[];
}

export interface FileUploadState {
  file: File | null;
  content: string | ArrayBuffer | null;
}
