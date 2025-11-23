
import React, { useState, useRef } from 'react';
import { Upload, Download, FileSpreadsheet, Save, Globe, Check, AlertCircle, Loader2, Wand2, Plus, Trash2, X, FileCode } from 'lucide-react';
import { I18nProject, ColumnMetadata, TranslationRow, Platform } from './types';
import { parseExcel, generateExcelBuffer } from './utils/excelParser';
import { generateZip } from './utils/generators';
import { translateBatch } from './services/gemini';
import { createProjectFromSourceFiles, parseContent, ParsedFile } from './utils/sourceParser';
import saveAs from 'file-saver';

const EXAMPLE_PROJECT: I18nProject = {
  columns: [
    {
      langCode: 'en-US',
      androidFile: 'strings.xml', androidPath: 'values/',
      iosFile: 'Localizable.strings', iosPath: 'en.lproj/',
      flutterFile: 'app_en.arb', flutterPath: 'lib/l10n/'
    },
    {
      langCode: 'zh-CN',
      androidFile: 'strings.xml', androidPath: 'values-zh-rCN/',
      iosFile: 'Localizable.strings', iosPath: 'zh-Hans.lproj/',
      flutterFile: 'app_zh.arb', flutterPath: 'lib/l10n/'
    }
  ],
  data: [
    { key: 'app_name', 'en-US': 'My App', 'zh-CN': '我的应用' },
    { key: 'welcome', 'en-US': 'Welcome back', 'zh-CN': '欢迎回来' }
  ]
};

interface FileInputState {
  id: string;
  file: File | null;
  langCode: string;
  path: string;
}

export default function App() {
  const [project, setProject] = useState<I18nProject | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [translatingLang, setTranslatingLang] = useState<string | null>(null);
  
  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importPlatform, setImportPlatform] = useState<Platform>(Platform.ANDROID);
  const [baseFile, setBaseFile] = useState<FileInputState>({ id: 'base', file: null, langCode: 'en-US', path: '' });
  const [otherFiles, setOtherFiles] = useState<FileInputState[]>([]);

  // --- File Handlers ---

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    try {
      const parsed = await parseExcel(file);
      setProject(parsed);
    } catch (err: any) {
      setError(err.message || 'Failed to parse Excel file.');
    } finally {
      setLoading(false);
      e.target.value = ''; 
    }
  };

  const handleDownloadZip = async () => {
    if (!project) return;
    try {
      setLoading(true);
      const blob = await generateZip(project);
      saveAs(blob, 'i18n_resources.zip');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = () => {
    if (!project) return;
    try {
      const buffer = generateExcelBuffer(project);
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'i18n_data.xlsx');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadExample = () => {
    setProject(EXAMPLE_PROJECT);
  };

  // --- Import Source Logic ---

  const addOtherFileRow = () => {
    setOtherFiles([...otherFiles, { id: Date.now().toString(), file: null, langCode: '', path: '' }]);
  };

  const removeOtherFileRow = (id: string) => {
    setOtherFiles(otherFiles.filter(f => f.id !== id));
  };

  const updateFileState = (
    isBase: boolean, 
    id: string, 
    field: keyof FileInputState, 
    value: any
  ) => {
    if (isBase) {
      setBaseFile(prev => ({ ...prev, [field]: value }));
    } else {
      setOtherFiles(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const processSourceImport = async () => {
    setError('');
    if (!baseFile.file || !baseFile.langCode) {
      setError("Base file and its language code are required.");
      return;
    }

    setLoading(true);
    try {
      // 1. Read Base File
      const baseContent = await readFileContent(baseFile.file);
      const baseParsed: ParsedFile = {
        langCode: baseFile.langCode,
        fileName: baseFile.file.name,
        path: baseFile.path,
        kvMap: parseContent(importPlatform, baseContent)
      };

      // 2. Read Other Files
      const otherParsed: ParsedFile[] = [];
      for (const fState of otherFiles) {
        if (fState.file && fState.langCode) {
          const content = await readFileContent(fState.file);
          otherParsed.push({
            langCode: fState.langCode,
            fileName: fState.file.name,
            path: fState.path,
            kvMap: parseContent(importPlatform, content)
          });
        }
      }

      // 3. Create Project
      const newProject = createProjectFromSourceFiles(importPlatform, baseParsed, otherParsed);
      setProject(newProject);
      setIsImportModalOpen(false);
      // Reset Modal State
      setOtherFiles([]);
      setBaseFile({ id: 'base', file: null, langCode: 'en-US', path: '' });

    } catch (err: any) {
      setError("Import failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- AI Logic ---

  const handleAiTranslate = async (targetLang: string) => {
    if (!project) return;
    if (!process.env.API_KEY) {
      setError("No API Key found in environment variables.");
      return;
    }

    setTranslatingLang(targetLang);
    
    const sourceLang = project.columns[0].langCode; 
    const missing = project.data.filter(row => 
      row[sourceLang] && (!row[targetLang] || row[targetLang].trim() === '')
    ).map(row => ({
      key: row.key,
      sourceText: row[sourceLang]
    }));

    if (missing.length === 0) {
      alert("No missing translations found for this column.");
      setTranslatingLang(null);
      return;
    }

    try {
      const translations = await translateBatch(targetLang, missing);
      
      setProject(prev => {
        if (!prev) return null;
        const newData = prev.data.map(row => {
          if (translations[row.key]) {
            return { ...row, [targetLang]: translations[row.key] };
          }
          return row;
        });
        return { ...prev, data: newData };
      });

    } catch (err: any) {
      setError("AI Translation failed: " + err.message);
    } finally {
      setTranslatingLang(null);
    }
  };

  // --- Render ---

  const renderTable = () => {
    if (!project) return null;

    return (
      <div className="overflow-x-auto border rounded-lg border-gray-200 shadow-sm bg-white mt-6">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                Key
              </th>
              {project.columns.map(col => (
                <th key={col.langCode} className="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider min-w-[200px]">
                  <div className="flex justify-between items-center">
                    <span>{col.langCode}</span>
                    {col.langCode !== project.columns[0].langCode && (
                      <button 
                        onClick={() => handleAiTranslate(col.langCode)}
                        disabled={!!translatingLang}
                        className="ml-2 p-1 hover:bg-purple-100 text-purple-600 rounded transition-colors"
                        title="Auto-fill missing with Gemini"
                      >
                        {translatingLang === col.langCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1 font-normal">
                    <div>Droid: {col.androidFile ? `${col.androidPath}${col.androidFile}` : '-'}</div>
                    <div>iOS: {col.iosFile ? `${col.iosPath}${col.iosFile}` : '-'}</div>
                    <div>Flut: {col.flutterFile ? `${col.flutterPath}${col.flutterFile}` : '-'}</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {project.data.map((row, idx) => (
              <tr key={row.key} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 font-mono text-gray-700 font-medium sticky left-0 bg-inherit z-10 border-r">
                  {row.key}
                </td>
                {project.columns.map(col => (
                  <td key={`${row.key}-${col.langCode}`} className="px-4 py-2 relative group">
                    <div 
                      contentEditable
                      suppressContentEditableWarning
                      className="w-full h-full p-1 outline-none focus:bg-blue-50 rounded truncate"
                      onBlur={(e) => {
                        const val = e.currentTarget.innerText;
                        setProject(prev => {
                          if(!prev) return null;
                          const newData = [...prev.data];
                          newData[idx] = { ...newData[idx], [col.langCode]: val };
                          return { ...prev, data: newData };
                        });
                      }}
                    >
                      {row[col.langCode]}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderImportModal = () => {
    if (!isImportModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900">Import from Source Files</h3>
            <button onClick={() => setIsImportModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1">
            {/* Platform Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Platform</label>
              <div className="flex gap-4">
                {[Platform.ANDROID, Platform.IOS, Platform.FLUTTER].map(p => (
                  <label key={p} className={`flex-1 flex items-center justify-center px-4 py-3 border rounded-lg cursor-pointer transition-all ${importPlatform === p ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="radio" name="platform" className="hidden" checked={importPlatform === p} onChange={() => setImportPlatform(p)} />
                    <span className="font-medium">{p}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Base File Section */}
            <div className="mb-8 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded">BASE</div>
                <h4 className="font-medium text-gray-900 text-sm">Default / Key Definition File</h4>
              </div>
              <p className="text-xs text-gray-500 mb-4">This file determines the keys for the project. Usually the English version.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-4">
                  <label className="block text-xs font-medium text-gray-500 mb-1">File</label>
                   <input 
                    type="file" 
                    className="block w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={(e) => updateFileState(true, 'base', 'file', e.target.files?.[0] || null)}
                   />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Lang Code (e.g. en-US)</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                    placeholder="en-US"
                    value={baseFile.langCode}
                    onChange={(e) => updateFileState(true, 'base', 'langCode', e.target.value)}
                  />
                </div>
                <div className="sm:col-span-5">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Path (e.g. values/)</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                    placeholder={importPlatform === Platform.ANDROID ? 'values/' : 'en.lproj/'}
                    value={baseFile.path}
                    onChange={(e) => updateFileState(true, 'base', 'path', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Additional Files Section */}
            <div>
              <div className="flex justify-between items-end mb-3">
                <h4 className="font-medium text-gray-900 text-sm">Additional Translation Files</h4>
                <button 
                  onClick={addOtherFileRow}
                  className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                >
                  <Plus className="w-3 h-3" /> Add Another Language
                </button>
              </div>

              <div className="space-y-3">
                {otherFiles.map((fileState, idx) => (
                  <div key={fileState.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="sm:col-span-4">
                      <label className="block text-xs font-medium text-gray-400 mb-1">File</label>
                      <input 
                        type="file" 
                        className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300"
                        onChange={(e) => updateFileState(false, fileState.id, 'file', e.target.files?.[0] || null)}
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-medium text-gray-400 mb-1">Lang Code</label>
                      <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        placeholder="zh-CN"
                        value={fileState.langCode}
                        onChange={(e) => updateFileState(false, fileState.id, 'langCode', e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <label className="block text-xs font-medium text-gray-400 mb-1">Path</label>
                      <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        placeholder="values-zh/"
                        value={fileState.path}
                        onChange={(e) => updateFileState(false, fileState.id, 'path', e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-1 flex justify-end">
                      <button onClick={() => removeOtherFileRow(fileState.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {otherFiles.length === 0 && (
                  <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-sm text-gray-500">
                    No additional files added. Only the base file will be imported.
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end gap-3">
             <button 
              onClick={() => setIsImportModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={processSourceImport}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Merge & Create Project
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Polyglot Master</h1>
              <p className="text-xs text-gray-500">Cross-platform i18n Manager</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={loadExample}
              className="hidden sm:flex text-sm text-gray-600 hover:text-blue-600 px-3 py-2"
            >
              Load Example
            </button>
            <a 
              href="https://ai.google.dev/gemini-api/docs" 
              target="_blank" 
              className="text-xs text-gray-400 hover:text-gray-600 flex items-center"
            >
              Powered by Gemini
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Action Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            
            {/* Left: Imports */}
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-3">Import Data</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Import Excel */}
                <label className="cursor-pointer flex flex-col items-center justify-center gap-2 px-4 py-4 border border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group bg-gray-50/50">
                  <FileSpreadsheet className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                  <div className="text-center">
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 block">Import Excel</span>
                    <span className="text-xs text-gray-400">.xlsx templates</span>
                  </div>
                  <input type="file" accept=".xlsx" onChange={handleExcelUpload} className="hidden" />
                </label>

                {/* Import Sources */}
                <button 
                  onClick={() => setIsImportModalOpen(true)}
                  className="cursor-pointer flex flex-col items-center justify-center gap-2 px-4 py-4 border border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group bg-gray-50/50"
                >
                  <FileCode className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                  <div className="text-center">
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 block">Import Sources</span>
                    <span className="text-xs text-gray-400">xml, strings, arb</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-32 bg-gray-100 mx-4"></div>

            {/* Right: Export */}
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-3">Export Data</label>
              <div className="flex flex-col gap-3">
                 <button 
                  onClick={handleDownloadZip}
                  disabled={!project || loading}
                  className="flex items-center justify-center gap-3 px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm w-full"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Download className="w-5 h-5" />}
                  <span className="font-medium">Generate Resource Files (ZIP)</span>
                </button>
                
                <button 
                  onClick={handleDownloadExcel}
                  disabled={!project || loading}
                  className="flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm w-full"
                >
                  <FileSpreadsheet className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Export to Excel</span>
                </button>
              </div>
            </div>

          </div>

          {error && !isImportModalOpen && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>

        {/* Data Grid */}
        {project ? (
           renderTable()
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No Project Loaded</h3>
            <p className="text-gray-500 mb-6">Import an Excel template or existing source files to get started.</p>
            <button onClick={loadExample} className="text-blue-600 hover:underline text-sm">
              Or load sample data
            </button>
          </div>
        )}
      </main>

      {renderImportModal()}
    </div>
  );
}
