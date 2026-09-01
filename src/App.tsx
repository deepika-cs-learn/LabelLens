import React, { useState, useEffect } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  LabelInspector 
} from './components/LabelInspector';
import { 
  DeclarationCard 
} from './components/DeclarationCard';
import { 
  ComplianceSummary 
} from './components/ComplianceSummary';
import { 
  UploadModal 
} from './components/UploadModal';
import { 
  AuditReportModal 
} from './components/AuditReportModal';
import { 
  RulesHandbookModal 
} from './components/RulesHandbookModal';
import { 
  HistoryDrawer 
} from './components/HistoryDrawer';
import { 
  SAMPLE_PACKS 
} from './data/sampleLabels';
import { 
  ComplianceEvaluation, 
  EvaluationRecord, 
  SamplePack, 
  Verdict 
} from './types';
import { 
  svgDataUrlToPngBase64,
  compressAndResizeImage
} from './utils/imageUtils';
import { 
  AlertCircle, 
  RefreshCw, 
  Filter, 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Sparkles,
  Search,
  Upload,
  Info
} from 'lucide-react';

const STORAGE_KEY = 'labellens_history_v1';

export default function App() {
  const [currentImage, setCurrentImage] = useState<string>(SAMPLE_PACKS[0].imageData);
  const [evaluation, setEvaluation] = useState<ComplianceEvaluation | null>(null);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [filterVerdict, setFilterVerdict] = useState<Verdict | 'ALL'>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modals & Drawers
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [currentNotes, setCurrentNotes] = useState<string>('');

  const [batchProgress, setBatchProgress] = useState<{
    current: number;
    total: number;
    currentName: string;
  } | null>(null);

  // History
  const [history, setHistory] = useState<EvaluationRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Evaluate initial sample on first mount
  useEffect(() => {
    runEvaluationOnImage(SAMPLE_PACKS[0].imageData, 'sample', 'Swadish Royal Garam Masala 100g spice pack');
  }, []);

  const saveToHistory = (evalResult: ComplianceEvaluation, img: string, source: 'sample' | 'upload' | 'camera', note?: string) => {
    const record: EvaluationRecord = {
      id: `eval-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
      imageUrl: img,
      evaluation: evalResult,
      sourceType: source,
      notes: note !== undefined ? note : currentNotes,
    };
    setHistory((prev) => {
      const updated = [record, ...prev.slice(0, 19)]; // keep latest 20
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage save failed:', e);
      }
      return updated;
    });
  };

  const handleUpdateNotes = (newNotes: string) => {
    setCurrentNotes(newNotes);
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const updated = prev.map((item, idx) => {
        if (idx === 0 || item.imageUrl === currentImage) {
          return { ...item, notes: newNotes };
        }
        return item;
      });
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const runEvaluationOnImage = async (
    imageData: string,
    sourceType: 'sample' | 'upload' | 'camera' = 'upload',
    productHint?: string
  ) => {
    setIsLoading(true);
    setError(null);
    setCurrentImage(imageData);

    try {
      let base64Payload = imageData;

      // If SVG data URI, render to high-res PNG base64 for vision inspection
      if (imageData.startsWith('data:image/svg+xml')) {
        base64Payload = await svgDataUrlToPngBase64(imageData, 800, 1000);
      } else {
        // Compress photo images to 900px for lightning-fast network transport & vision inference
        base64Payload = await compressAndResizeImage(imageData, 900, 0.78);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);

      const response = await fetch('/api/evaluate-label', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64Payload,
          mimeType: 'image/jpeg',
          productNameHint: productHint,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Evaluation failed with status ${response.status}`);
      }

      const data: ComplianceEvaluation = await response.json();
      setEvaluation(data);
      saveToHistory(data, imageData, sourceType);
    } catch (err: any) {
      console.error('Compliance evaluation error:', err);
      if (err.name === 'AbortError') {
        setError('Analysis timed out. Please try again or provide a smaller photo.');
      } else {
        setError(err.message || 'Failed to inspect package label. Please click Retry.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchAnalyze = async (
    items: Array<{ base64: string; mimeType: string; hint?: string; name: string }>
  ) => {
    if (!items || items.length === 0) return;

    setIsLoading(true);
    setError(null);
    const total = items.length;

    for (let i = 0; i < total; i++) {
      const item = items[i];
      setBatchProgress({
        current: i + 1,
        total,
        currentName: item.name,
      });

      const fullDataUrl = item.base64.startsWith('data:')
        ? item.base64
        : `data:${item.mimeType};base64,${item.base64}`;

      setCurrentImage(fullDataUrl);

      try {
        let base64Payload = fullDataUrl;
        if (fullDataUrl.startsWith('data:image/svg+xml')) {
          base64Payload = await svgDataUrlToPngBase64(fullDataUrl, 800, 1000);
        } else {
          base64Payload = await compressAndResizeImage(fullDataUrl, 900, 0.78);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000);

        const response = await fetch('/api/evaluate-label', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageBase64: base64Payload,
            mimeType: 'image/jpeg',
            productNameHint: item.hint || item.name,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data: ComplianceEvaluation = await response.json();
          setEvaluation(data);
          saveToHistory(data, fullDataUrl, 'upload');
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.warn(`Item ${i + 1} analysis issue:`, errorData);
        }
      } catch (err: any) {
        console.error(`Batch item ${i + 1} analysis error:`, err);
      }

      // Small pause between items for smooth state updates
      if (i < total - 1) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    setBatchProgress(null);
    setIsLoading(false);
  };

  const handleSelectSample = (sample: SamplePack) => {
    setCurrentNotes('');
    runEvaluationOnImage(sample.imageData, 'sample', `${sample.title} - ${sample.description}`);
  };

  const handleUploadImage = (base64: string, mimeType: string, hint?: string) => {
    setCurrentNotes('');
    const fullDataUrl = base64.startsWith('data:') ? base64 : `data:${mimeType};base64,${base64}`;
    runEvaluationOnImage(fullDataUrl, 'upload', hint);
  };

  const handleSelectHistoryRecord = (record: EvaluationRecord) => {
    setCurrentImage(record.imageUrl);
    setEvaluation(record.evaluation);
    setCurrentNotes(record.notes || '');
    setError(null);
  };

  const filteredDeclarations = evaluation?.declarations.filter((d) => {
    if (filterVerdict === 'ALL') return true;
    return d.verdict === filterVerdict;
  }) || [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <Header
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        hasEvaluation={Boolean(evaluation)}
        historyCount={history.length}
      />

      {/* Main App Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-5">
        {/* Batch Queue Serial Execution Banner */}
        {batchProgress && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-2xs space-y-2.5 animate-fadeIn">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-600 text-white">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>Serial Queue Automated Inspection</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-mono font-bold">
                      {batchProgress.current} of {batchProgress.total}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-600 truncate max-w-md">
                    Analyzing pack: <strong className="text-slate-900">{batchProgress.currentName}</strong>
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono text-blue-700 font-bold hidden sm:inline">
                {Math.round((batchProgress.current / batchProgress.total) * 100)}% Complete
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-blue-200/70 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Loading Banner (single item) */}
        {isLoading && !batchProgress && (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between gap-4 animate-pulse shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <RefreshCw className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Extracting &amp; Evaluating Mandatory Metrology Declarations...
                </h4>
                <p className="text-xs text-slate-600">
                  Scanning name &amp; address, generic commodity, SI net quantity, mfg date, MRP taxes, and consumer care channels.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-blue-700 font-bold hidden sm:inline">
              PC Rules 2011 Model Engine
            </span>
          </div>
        )}

        {/* Error Alert */}
        {error && !isLoading && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start justify-between gap-3 text-xs text-red-900 shadow-2xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900 text-sm mb-1">Inspection Engine Notice</p>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
            <button
              onClick={() => runEvaluationOnImage(currentImage)}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-red-50 text-red-700 text-xs font-semibold border border-red-200 transition-colors shadow-2xs"
            >
              Retry
            </button>
          </div>
        )}

        {/* Compliance Summary Dashboard (When available) */}
        {evaluation && (
          <ComplianceSummary
            evaluation={evaluation}
            onOpenReport={() => setIsReportOpen(true)}
          />
        )}

        {/* Primary 2-Column Inspection Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-start">
          {/* Left Column: Visual Inspector (5 or 6 cols on wide) */}
          <div className="lg:col-span-6 flex flex-col gap-4 sticky top-20">
            <LabelInspector
              imageUrl={currentImage}
              declarations={evaluation?.declarations || []}
              activeField={activeField}
              onSelectField={(field) => setActiveField(field)}
              productName={evaluation?.product_name_guess}
              manufacturerName={evaluation?.manufacturer_name_guess}
              notes={currentNotes}
              onUpdateNotes={handleUpdateNotes}
            />

            {/* Quick Sample Switcher bar below viewport */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Quick Test Pack Presets:
                </span>
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="text-[11px] text-blue-600 hover:underline font-semibold"
                >
                  View All Scenarios →
                </button>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {SAMPLE_PACKS.slice(0, 4).map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-900 text-[11px] font-medium transition-all shrink-0 text-left truncate max-w-[170px]"
                    title={sample.title}
                  >
                    {sample.brand.split(' ')[0]}: {sample.category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: 6 Mandatory Declarations Breakdown (6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Header & Filter Controls Bento Card */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-2 flex-wrap">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-blue-600" />
                  6 Mandatory Statutory Declarations
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Legal Metrology (Packaged Commodities) Rules, 2011 Schedule Assessment
                </p>
              </div>

              {/* Filter Verdict Pills */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-[11px] font-semibold">
                <button
                  onClick={() => setFilterVerdict('ALL')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    filterVerdict === 'ALL'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  All (6)
                </button>
                <button
                  onClick={() => setFilterVerdict('COMPLIANT')}
                  className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${
                    filterVerdict === 'COMPLIANT'
                      ? 'bg-green-100 text-green-800 font-bold border border-green-300'
                      : 'text-slate-500 hover:text-green-700'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                  <span>Compliant</span>
                </button>
                <button
                  onClick={() => setFilterVerdict('NEEDS_REVIEW')}
                  className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${
                    filterVerdict === 'NEEDS_REVIEW'
                      ? 'bg-amber-100 text-amber-800 font-bold border border-amber-300'
                      : 'text-slate-500 hover:text-amber-700'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  <span>Review</span>
                </button>
                <button
                  onClick={() => setFilterVerdict('VIOLATION')}
                  className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${
                    filterVerdict === 'VIOLATION'
                      ? 'bg-red-100 text-red-800 font-bold border border-red-300'
                      : 'text-slate-500 hover:text-red-700'
                  }`}
                >
                  <XCircle className="w-3 h-3 text-red-600" />
                  <span>Violations</span>
                </button>
              </div>
            </div>

            {/* Declaration Cards List */}
            {evaluation ? (
              <div className="space-y-3">
                {filteredDeclarations.length === 0 ? (
                  <div className="p-8 rounded-xl bg-white border border-slate-200 text-center text-slate-500 text-xs shadow-2xs">
                    <p>No declarations match the selected verdict filter "{filterVerdict}".</p>
                    <button
                      onClick={() => setFilterVerdict('ALL')}
                      className="mt-2 text-blue-600 hover:underline font-semibold"
                    >
                      Show all 6 declarations
                    </button>
                  </div>
                ) : (
                  filteredDeclarations.map((declaration, idx) => (
                    <DeclarationCard
                      key={`${declaration.field}-${idx}`}
                      declaration={declaration}
                      index={idx}
                      isSelected={activeField === declaration.field}
                      onSelect={() => {
                        setActiveField((prev) => (prev === declaration.field ? null : declaration.field));
                      }}
                      onOpenRuleDetails={() => setIsRulesOpen(true)}
                    />
                  ))
                )}
              </div>
            ) : (
              <div className="p-12 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center text-center text-slate-500 shadow-2xs">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-3 opacity-80" />
                <p className="text-sm font-bold text-slate-800">Loading statutory analysis...</p>
                <p className="text-xs text-slate-500 mt-1">
                  Evaluating label against India LMPC Rules 2011
                </p>
              </div>
            )}

            {/* Statutory Legal Advisory Footer Card */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs space-y-2 text-slate-600 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-900 font-semibold">
                <Info className="w-4 h-4 text-blue-600" />
                <span>Statutory Authority &amp; Legal Metrology Mandates</span>
              </div>
              <p className="leading-relaxed text-[11px] text-slate-500">
                Under the <strong className="text-slate-700">Legal Metrology Act, 2009</strong> and <strong className="text-slate-700">Legal Metrology (Packaged Commodities) Rules, 2011</strong>, non-declaration or deceptive font scaling of mandatory particulars is punishable under Section 36 with fines up to ₹1,00,000 or packaging seizure under Section 15.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Upload / Sample Selection Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSelectSample={handleSelectSample}
        onUploadImage={handleUploadImage}
        onBatchAnalyze={handleBatchAnalyze}
        isLoading={isLoading}
      />

      {/* Legal Metrology Rules Handbook Modal */}
      <RulesHandbookModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      {/* Comprehensive Audit Report Modal */}
      {evaluation && (
        <AuditReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          evaluation={evaluation}
          imageUrl={currentImage}
          notes={currentNotes}
        />
      )}

      {/* History Slide-over Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectRecord={handleSelectHistoryRecord}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}
