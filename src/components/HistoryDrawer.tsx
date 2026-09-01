import React from 'react';
import { 
  X, 
  History, 
  Trash2, 
  ExternalLink, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX,
  Clock
} from 'lucide-react';
import { EvaluationRecord } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: EvaluationRecord[];
  onSelectRecord: (record: EvaluationRecord) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectRecord,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Packaging Audit History
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {history.length} evaluation{history.length === 1 ? '' : 's'} recorded locally
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Clear all scan history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Record List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {history.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400">
              <Clock className="w-8 h-8 stroke-1 mb-2 opacity-50" />
              <p className="text-xs font-medium">No previous product label audits recorded yet.</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Scan or select a product to begin history tracking.
              </p>
            </div>
          ) : (
            history.map((item) => {
              const { evaluation } = item;
              const dateStr = new Date(item.timestamp).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectRecord(item);
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 cursor-pointer transition-all flex gap-3 group shadow-2xs"
                >
                  {/* Thumbnail snippet */}
                  <div className="w-14 h-16 rounded-lg bg-white overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                    <img
                      src={item.imageUrl}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {dateStr}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        evaluation.risk_level === 'LOW'
                          ? 'bg-green-100 text-green-700'
                          : evaluation.risk_level === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {evaluation.risk_level}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {evaluation.product_name_guess || 'Packaged Commodity'}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate">
                      {evaluation.manufacturer_name_guess || 'Manufacturer Unspecified'}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200 text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">Compliance:</span>
                        <span className="font-bold text-green-600 font-mono">
                          {Math.round(evaluation.overall_compliance_percent)}%
                        </span>
                      </div>
                      {item.notes && item.notes.trim().length > 0 && (
                        <span className="text-[10px] text-indigo-700 font-semibold flex items-center gap-1 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                          <span>Notes</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
