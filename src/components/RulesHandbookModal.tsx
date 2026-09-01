import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Search, 
  Scale, 
  ShieldAlert, 
  AlertTriangle, 
  FileText, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { LEGAL_METROLOGY_RULES_HANDBOOK } from '../data/sampleLabels';

interface RulesHandbookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesHandbookModal: React.FC<RulesHandbookModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRuleId, setSelectedRuleId] = useState<string>(LEGAL_METROLOGY_RULES_HANDBOOK[0].ruleId);

  if (!isOpen) return null;

  const filteredRules = LEGAL_METROLOGY_RULES_HANDBOOK.filter(
    (rule) =>
      rule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentRule =
    LEGAL_METROLOGY_RULES_HANDBOOK.find((r) => r.ruleId === selectedRuleId) ||
    LEGAL_METROLOGY_RULES_HANDBOOK[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-900">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                India Legal Metrology (Packaged Commodities) Rules, 2011
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Statutory handbook for mandatory packaging declarations &amp; enforcement standards
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Sidebar + Main Rule View */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Rule Navigator */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/50 flex flex-col p-4 gap-3 overflow-y-auto shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rule or section..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="space-y-1.5 flex-1 overflow-y-auto">
              {filteredRules.map((rule) => {
                const isSelected = rule.ruleId === currentRule.ruleId;
                return (
                  <button
                    key={rule.ruleId}
                    onClick={() => setSelectedRuleId(rule.ruleId)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-blue-50 text-blue-800 border border-blue-200 font-semibold shadow-2xs'
                        : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent'
                    }`}
                  >
                    <div className="truncate">
                      <div className="text-[10px] font-mono text-slate-400 mb-0.5">{rule.section}</div>
                      <div className="truncate">{rule.title}</div>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Detail Pane */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-white">
            <div>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-mono font-bold border border-blue-200 mb-2">
                {currentRule.section}
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">
                {currentRule.title}
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                {currentRule.description}
              </p>
            </div>

            {/* Mandatory checklist */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-green-700 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                Statutory Mandatory Requirements
              </h4>
              <div className="space-y-1.5">
                {currentRule.mandatoryRequirements.map((req, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700 bg-green-50/50 p-2.5 rounded-lg border border-green-200/60">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-600 mt-1.5 shrink-0" />
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Common violations */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Common Package Violations &amp; Audit Traps
              </h4>
              <div className="space-y-1.5">
                {currentRule.commonViolations.map((viol, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700 bg-red-50/50 p-2.5 rounded-lg border border-red-200/60">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                    <span>{viol}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Penalty Section */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <h4 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Legal Metrology Act, 2009 Statutory Penalties
              </h4>
              <p className="text-slate-600 leading-relaxed">
                {currentRule.penaltyDetails}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
