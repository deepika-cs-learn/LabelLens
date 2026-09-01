import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Copy, 
  Check, 
  Type, 
  Scale, 
  Building2, 
  Tag, 
  Calendar, 
  IndianRupee, 
  Headphones, 
  ExternalLink,
  Info
} from 'lucide-react';
import { DeclarationResult, Verdict } from '../types';

interface DeclarationCardProps {
  declaration: DeclarationResult;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onOpenRuleDetails?: (ruleRef: string) => void;
}

export const DeclarationCard: React.FC<DeclarationCardProps> = ({
  declaration,
  index,
  isSelected,
  onSelect,
  onOpenRuleDetails,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyText = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (declaration.extracted_text && declaration.extracted_text !== 'NOT FOUND') {
      navigator.clipboard.writeText(declaration.extracted_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getFieldIcon = (field: string) => {
    const f = field.toLowerCase();
    if (f.includes('manufacturer') || f.includes('packer') || f.includes('importer') || f.includes('address')) {
      return <Building2 className="w-4 h-4 text-sky-600" />;
    }
    if (f.includes('generic') || f.includes('common') || f.includes('commodity')) {
      return <Tag className="w-4 h-4 text-indigo-600" />;
    }
    if (f.includes('quantity') || f.includes('weight') || f.includes('volume') || f.includes('net')) {
      return <Scale className="w-4 h-4 text-emerald-600" />;
    }
    if (f.includes('month') || f.includes('year') || f.includes('date') || f.includes('mfg') || f.includes('import')) {
      return <Calendar className="w-4 h-4 text-blue-600" />;
    }
    if (f.includes('mrp') || f.includes('price') || f.includes('retail')) {
      return <IndianRupee className="w-4 h-4 text-amber-600" />;
    }
    if (f.includes('consumer') || f.includes('care') || f.includes('contact') || f.includes('complaint')) {
      return <Headphones className="w-4 h-4 text-teal-600" />;
    }
    return <Info className="w-4 h-4 text-slate-500" />;
  };

  const getVerdictStyles = (verdict: Verdict) => {
    switch (verdict) {
      case 'COMPLIANT':
        return {
          bg: 'bg-green-50/70 border-green-200 text-green-800',
          badge: 'bg-green-100 text-green-700 border-green-200',
          numBadge: 'bg-green-100 text-green-700',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />,
          label: 'COMPLIANT',
        };
      case 'NEEDS_REVIEW':
        return {
          bg: 'bg-yellow-50/70 border-yellow-200 text-yellow-900',
          badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          numBadge: 'bg-yellow-100 text-yellow-800',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-yellow-600 shrink-0" />,
          label: 'NEEDS REVIEW',
        };
      case 'VIOLATION':
      default:
        return {
          bg: 'bg-red-50/70 border-red-200 text-red-800',
          badge: 'bg-red-100 text-red-700 border-red-200',
          numBadge: 'bg-red-100 text-red-700',
          icon: <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />,
          label: 'VIOLATION',
        };
    }
  };

  const getConfidenceInfo = (confidenceVal: number | undefined) => {
    const conf = typeof confidenceVal === 'number' && !isNaN(confidenceVal)
      ? Math.min(100, Math.max(0, Math.round(confidenceVal)))
      : 85;

    if (conf >= 85) {
      return {
        level: 'HIGH' as const,
        value: conf,
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        textClass: 'text-emerald-700',
      };
    }
    if (conf >= 60) {
      return {
        level: 'MEDIUM' as const,
        value: conf,
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        textClass: 'text-amber-700',
      };
    }
    return {
      level: 'LOW' as const,
      value: conf,
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      textClass: 'text-rose-700',
      showWarning: true,
    };
  };

  const styles = getVerdictStyles(declaration.verdict);
  const confInfo = getConfidenceInfo(declaration.confidence);
  const isNotFound = !declaration.extracted_text || declaration.extracted_text.toUpperCase() === 'NOT FOUND';

  return (
    <div
      id={`declaration-card-${index}`}
      onClick={onSelect}
      className={`group relative rounded-xl p-4 transition-all duration-200 cursor-pointer border ${
        isSelected
          ? 'bg-blue-50/50 border-blue-300 shadow-md ring-2 ring-blue-500/20'
          : 'bg-white hover:bg-slate-50/80 border-slate-200 shadow-2xs hover:border-slate-300'
      }`}
    >
      {/* Top Header: Field Name & Compliance Status */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-start gap-2.5">
          <div className={`w-6 h-6 rounded flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5 ${styles.numBadge}`}>
            {`0${index + 1}`.slice(-2)}
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {declaration.field}
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                {declaration.rule_reference}
              </span>
            </div>
          </div>
        </div>

        {/* Rule Validation / Compliance Assessment Badge */}
        <div className="flex flex-col items-end shrink-0">
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${styles.badge}`} title="Statutory Rule Compliance Assessment">
            {styles.icon}
            <span>{styles.label}</span>
          </div>
          <span className="text-[8.5px] text-slate-400 font-medium mt-0.5">Statutory Assessment</span>
        </div>
      </div>

      {/* Extracted Text Box with Field-Level OCR Confidence */}
      <div className="mb-2.5">
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-1.5 flex-wrap gap-1">
          <span className="text-slate-600 font-semibold text-[10px] uppercase tracking-wider">
            Extracted Packaging Text:
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Field-level extraction reliability */}
            <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500">
                OCR / Extraction Confidence: <strong className="text-slate-900 font-semibold font-mono">{confInfo.value}%</strong>
              </span>
              <span className={`px-1 py-0.2 rounded text-[8.5px] font-bold border tracking-wider ${confInfo.badgeClass}`}>
                {confInfo.level}
              </span>
            </div>

            {!isNotFound && (
              <button
                onClick={handleCopyText}
                className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded transition-colors"
                title="Copy Extracted Text"
              >
                {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Low extraction confidence warning notice */}
        {confInfo.showWarning && (
          <div className="mb-1.5 flex items-center gap-1.5 text-[10px] text-amber-800 bg-amber-50/90 border border-amber-200 px-2.5 py-1 rounded-md">
            <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
            <span className="font-semibold">⚠ Manual verification recommended</span>
            <span className="text-amber-700 font-normal hidden sm:inline">(low OCR extraction confidence for this field)</span>
          </div>
        )}

        <div
          className={`p-2.5 rounded-lg text-xs font-mono leading-relaxed border select-text ${
            isNotFound
              ? 'bg-red-50/50 border-red-200 text-red-700 italic'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          "{declaration.extracted_text}"
        </div>
      </div>

      {/* Evaluation Explanation (Rule Validation) */}
      <div className={`p-2.5 rounded-lg border text-xs leading-relaxed mb-2.5 ${styles.bg}`}>
        <p className="font-sans font-medium">
          {declaration.explanation}
        </p>
      </div>

      {/* Relative Font Size & Rule Metadata Footer */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px]">Font Prominence:</span>
          <span className={`font-semibold px-1.5 py-0.2 rounded text-[10px] ${
            declaration.relative_font_note.toLowerCase().includes('much smaller')
              ? 'bg-amber-100 text-amber-800 border border-amber-200'
              : 'bg-slate-100 text-slate-700 border border-slate-200'
          }`}>
            {declaration.relative_font_note}
          </span>
        </div>

        {declaration.bounding_box && (
          <span className="text-[10px] text-slate-500 font-mono font-medium">
            Box: [{declaration.bounding_box.map((n) => Math.round(n)).join(', ')}]%
          </span>
        )}
      </div>
    </div>
  );
};
