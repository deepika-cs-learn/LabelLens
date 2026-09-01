import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  Building, 
  Package, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  FileText,
  Scale
} from 'lucide-react';
import { ComplianceEvaluation, RiskLevel } from '../types';

interface ComplianceSummaryProps {
  evaluation: ComplianceEvaluation;
  onOpenReport?: () => void;
}

export const ComplianceSummary: React.FC<ComplianceSummaryProps> = ({
  evaluation,
  onOpenReport,
}) => {
  const {
    product_name_guess,
    manufacturer_name_guess,
    overall_compliance_percent,
    risk_level,
    declarations,
  } = evaluation;

  const compliantCount = declarations.filter((d) => d.verdict === 'COMPLIANT').length;
  const needsReviewCount = declarations.filter((d) => d.verdict === 'NEEDS_REVIEW').length;
  const violationCount = declarations.filter((d) => d.verdict === 'VIOLATION').length;

  const getRiskDetails = (risk: RiskLevel) => {
    switch (risk) {
      case 'LOW':
        return {
          icon: <ShieldCheck className="w-4 h-4 text-emerald-700" />,
          badge: 'bg-green-100 text-green-700 border-green-200',
          title: 'LOW RISK',
          desc: 'Label adheres to key statutory provisions under India LMPC Rules 2011 with no critical blocking omissions.',
          color: 'text-emerald-600',
          barColor: 'bg-emerald-500',
        };
      case 'MEDIUM':
        return {
          icon: <ShieldAlert className="w-4 h-4 text-yellow-700" />,
          badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          title: 'MEDIUM RISK',
          desc: `${violationCount} violation and ${needsReviewCount} warning detected in mandatory fields.`,
          color: 'text-yellow-600',
          barColor: 'bg-yellow-500',
        };
      case 'HIGH':
      default:
        return {
          icon: <ShieldX className="w-4 h-4 text-red-700" />,
          badge: 'bg-red-100 text-red-700 border-red-200',
          title: 'HIGH REGULATORY RISK',
          desc: 'Critical mandatory statutory declarations missing or non-compliant with standard units / consumer redressal rules.',
          color: 'text-red-600',
          barColor: 'bg-red-500',
        };
    }
  };

  const riskInfo = getRiskDetails(risk_level);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMatchLabel = (score: number) => {
    if (score >= 85) return 'Full Compliance';
    if (score >= 50) return 'Partial Match';
    return 'Non-Compliant';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Bento Card 1: Overall Compliance */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Overall Compliance
          </span>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold tracking-tight font-mono ${getScoreColor(overall_compliance_percent)}`}>
              {Math.round(overall_compliance_percent)}%
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {getScoreMatchLabel(overall_compliance_percent)}
            </span>
          </div>
        </div>
        <div className="w-full bg-slate-100 h-1.5 mt-3 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-700 ${riskInfo.barColor}`}
            style={{ width: `${Math.max(overall_compliance_percent, 5)}%` }}
          />
        </div>
      </div>

      {/* Bento Card 2: Risk Assessment */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Risk Assessment
          </span>
          <div className="flex items-center gap-2 mt-1">
            <div className={`px-2 py-0.5 rounded text-xs font-bold border flex items-center gap-1.5 ${riskInfo.badge}`}>
              {riskInfo.icon}
              <span>{riskInfo.title}</span>
            </div>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 mt-2 leading-tight font-medium line-clamp-2">
          {riskInfo.desc}
        </p>
      </div>

      {/* Bento Card 3: Identified Commodity */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
            <Package className="w-3 h-3 text-blue-600" />
            Identified Commodity
          </span>
          <p className="text-slate-900 font-bold text-sm truncate mt-0.5" title={product_name_guess}>
            {product_name_guess || 'Packaged Commodity'}
          </p>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Rule 6(1)(c) Generic</span>
          <span className="font-semibold text-slate-700">Validated</span>
        </div>
      </div>

      {/* Bento Card 4: Manufacturer / Breakdown */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
            <Building className="w-3 h-3 text-indigo-600" />
            Manufacturer / Packer
          </span>
          <p className="text-slate-900 font-bold text-sm truncate mt-0.5" title={manufacturer_name_guess}>
            {manufacturer_name_guess || 'Entity Unspecified'}
          </p>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-2 text-[10px] font-semibold">
          <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700">
            {compliantCount} Pass
          </span>
          <span className="px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800">
            {needsReviewCount} Review
          </span>
          <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700">
            {violationCount} Fail
          </span>
        </div>
      </div>
    </div>
  );
};
