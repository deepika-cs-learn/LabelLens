import React from 'react';
import { 
  ShieldCheck, 
  BookOpen, 
  History, 
  FileDown, 
  Upload, 
  Scale
} from 'lucide-react';

interface HeaderProps {
  onOpenUpload: () => void;
  onOpenRules: () => void;
  onOpenHistory: () => void;
  onOpenReport: () => void;
  hasEvaluation: boolean;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenUpload,
  onOpenRules,
  onOpenHistory,
  onOpenReport,
  hasEvaluation,
  historyCount,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white shadow-sm">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5 font-sans">
                LabelLens <span className="text-slate-400 font-normal">| Compliance Engine</span>
              </h1>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 tracking-wider">
                PC Rules 2011
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              India Legal Metrology (Packaged Commodities) Statutory Assessment
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto justify-end">
          <button
            id="btn-upload-scan"
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>New Analysis</span>
          </button>

          <button
            id="btn-rules-handbook"
            onClick={onOpenRules}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-medium transition-colors shadow-2xs cursor-pointer"
            title="Legal Metrology Rules Reference"
          >
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span className="hidden md:inline">Handbook</span>
          </button>

          <button
            id="btn-scan-history"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-medium transition-colors shadow-2xs relative cursor-pointer"
            title="Inspection History"
          >
            <History className="w-4 h-4 text-blue-600" />
            <span className="hidden md:inline">History</span>
            {historyCount > 0 && (
              <span className="h-4 min-w-4 px-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold flex items-center justify-center">
                {historyCount}
              </span>
            )}
          </button>

          {hasEvaluation && (
            <button
              id="btn-export-report"
              onClick={onOpenReport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-medium transition-colors shadow-2xs cursor-pointer"
              title="Generate Assessment & Audit Report"
            >
              <FileDown className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Report</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
