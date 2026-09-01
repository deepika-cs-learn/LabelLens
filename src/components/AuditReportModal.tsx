import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  ShieldCheck, 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  FileCheck,
  Check
} from 'lucide-react';
import { ComplianceEvaluation } from '../types';
import jsPDF from 'jspdf';

interface AuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: ComplianceEvaluation;
  imageUrl: string;
  notes?: string;
}

export const AuditReportModal: React.FC<AuditReportModalProps> = ({
  isOpen,
  onClose,
  evaluation,
  imageUrl,
  notes,
}) => {
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const {
    product_name_guess,
    manufacturer_name_guess,
    overall_compliance_percent,
    risk_level,
    declarations,
  } = evaluation;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const currentTime = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const auditRefNumber = `LL-${Math.abs(
    (product_name_guess || 'PROD').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) * 137 +
      (declarations?.length || 6) * 41
  ).toString().padStart(6, '0')}`;

  const handleDownloadPdf = () => {
    setIsPdfGenerating(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 210;
      const margin = 14;
      const contentWidth = pageWidth - margin * 2;
      let y = 16;

      // Header Banner Background
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, 22, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, y, contentWidth, 22, 'S');

      // Header Text
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text('LABELLENS LEGAL METROLOGY COMPLIANCE ASSESSMENT', margin + 4, y + 7);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text('AI-assisted statutory assessment under Legal Metrology (Packaged Commodities) Rules, 2011', margin + 4, y + 13);
      doc.text(`ASSESSMENT REF: ${auditRefNumber}  |  DATE: ${currentDate} (${currentTime})  |  STANDARD: LMPC Rules 2011`, margin + 4, y + 18);

      y += 27;

      // Executive Summary Box
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'S');

      // Product & Mfg Details
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('COMMODITY NAME:', margin + 4, y + 5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      const truncatedName = product_name_guess.length > 55 ? product_name_guess.substring(0, 52) + '...' : product_name_guess;
      doc.text(truncatedName, margin + 4, y + 10);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('MANUFACTURER / PACKER:', margin + 4, y + 16);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      const truncatedMfg = manufacturer_name_guess.length > 60 ? manufacturer_name_guess.substring(0, 57) + '...' : manufacturer_name_guess;
      doc.text(truncatedMfg, margin + 4, y + 21);

      // Score column
      const col2X = margin + 115;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('COMPLIANCE RATING:', col2X, y + 5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(2, 132, 199); // sky-600
      doc.text(`${Math.round(overall_compliance_percent)}%`, col2X, y + 13);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('6 Statutory Rules', col2X, y + 18);

      // Risk column
      const col3X = margin + 148;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('REGULATORY RISK:', col3X, y + 5);

      if (risk_level === 'LOW') {
        doc.setFillColor(220, 252, 231); // green
        doc.roundedRect(col3X, y + 7, 30, 7, 1, 1, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(22, 101, 52);
        doc.text('LOW RISK', col3X + 5, y + 12);
      } else if (risk_level === 'MEDIUM') {
        doc.setFillColor(254, 243, 199); // amber
        doc.roundedRect(col3X, y + 7, 30, 7, 1, 1, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(146, 64, 14);
        doc.text('MEDIUM RISK', col3X + 3, y + 12);
      } else {
        doc.setFillColor(254, 226, 226); // red
        doc.roundedRect(col3X, y + 7, 30, 7, 1, 1, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(153, 27, 27);
        doc.text('HIGH RISK', col3X + 5, y + 12);
      }

      y += 31;

      // Section Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text('STATUTORY 6-DECLARATION AUDIT MATRIX (PC RULES, 2011)', margin, y);
      y += 4;

      // Matrix Table Header
      doc.setFillColor(30, 41, 59); // slate-800
      doc.rect(margin, y, contentWidth, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      doc.text('#', margin + 2, y + 4.8);
      doc.text('MANDATORY DECLARATION', margin + 8, y + 4.8);
      doc.text('STATUTORY RULE', margin + 65, y + 4.8);
      doc.text('EXTRACTED CONTENT & FINDINGS', margin + 105, y + 4.8);
      doc.text('VERDICT', margin + 160, y + 4.8);

      y += 7;

      // Matrix Table Rows
      declarations.forEach((d, idx) => {
        const rowHeight = 22;

        // Alternating row background
        if (idx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(margin, y, contentWidth, rowHeight, 'F');
        }

        doc.setDrawColor(226, 232, 240);
        doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

        // # index
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`${idx + 1}`, margin + 2, y + 5);

        // Field Name (wrapped)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(15, 23, 42);
        const splitField = doc.splitTextToSize(d.field, 54);
        doc.text(splitField, margin + 8, y + 4.5);

        // Rule Reference
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(71, 85, 105);
        const splitRule = doc.splitTextToSize(d.rule_reference, 36);
        doc.text(splitRule, margin + 65, y + 4.5);

        // Extracted Text & Findings
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(15, 23, 42);
        const truncatedExtracted = d.extracted_text.length > 45 ? d.extracted_text.substring(0, 42) + '...' : d.extracted_text;
        const confNum = typeof d.confidence === 'number' ? d.confidence : 85;
        const confLevel = confNum >= 85 ? 'HIGH' : confNum >= 60 ? 'MED' : 'LOW';
        doc.text(`Extracted: ${truncatedExtracted} [OCR: ${confNum}% ${confLevel}]`, margin + 105, y + 4.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.8);
        doc.setTextColor(71, 85, 105);
        const splitExpl = doc.splitTextToSize(d.explanation, 52);
        doc.text(splitExpl, margin + 105, y + 9.5);

        // Verdict Badge
        const badgeX = margin + 160;
        if (d.verdict === 'COMPLIANT') {
          doc.setFillColor(220, 252, 231);
          doc.roundedRect(badgeX, y + 2, 20, 5, 0.8, 0.8, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.5);
          doc.setTextColor(22, 101, 52);
          doc.text('COMPLIANT', badgeX + 2, y + 5.5);
        } else if (d.verdict === 'NEEDS_REVIEW') {
          doc.setFillColor(254, 243, 199);
          doc.roundedRect(badgeX, y + 2, 20, 5, 0.8, 0.8, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.5);
          doc.setTextColor(146, 64, 14);
          doc.text('REVIEW', badgeX + 4.5, y + 5.5);
        } else {
          doc.setFillColor(254, 226, 226);
          doc.roundedRect(badgeX, y + 2, 20, 5, 0.8, 0.8, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.5);
          doc.setTextColor(153, 27, 27);
          doc.text('VIOLATION', badgeX + 2.5, y + 5.5);
        }

        y += rowHeight;
      });

      y += 6;

      // Statutory & AI Assessment Disclaimer Note
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, y, contentWidth, 16, 1, 1, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, contentWidth, 16, 1, 1, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.8);
      doc.setTextColor(15, 23, 42);
      doc.text('ASSESSMENT NOTICE & DISCLAIMER:', margin + 3, y + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.2);
      doc.setTextColor(71, 85, 105);
      const disclaimer = 'This assessment is an AI-assisted inspection aid based on the configured statutory rules and available label evidence. Final legal determination remains with the authorized enforcement authority under the Legal Metrology (Packaged Commodities) Rules, 2011.';
      const splitDisclaimer = doc.splitTextToSize(disclaimer, contentWidth - 6);
      doc.text(splitDisclaimer, margin + 3, y + 8.5);

      y += 22;

      // Signoff Block
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text('LabelLens AI Compliance Engine', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Automated Packaging Assessment Aid', margin, y + 4);

      const signX = margin + 120;
      doc.setDrawColor(148, 163, 184);
      doc.line(signX, y + 5, margin + contentWidth, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.text('Quality / Compliance Inspector Verification', signX, y + 9);

      // Save PDF file
      const sanitizedFilename = `LabelLens_Assessment_${(product_name_guess || 'Pack').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      doc.save(sanitizedFilename);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs print:p-0 print:bg-white animate-fadeIn">
      <div className="bg-white border border-slate-200 print:border-none print:bg-white print:text-black rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-900">
        {/* Modal Toolbar (hidden during print) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-slate-50/70 print:hidden">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Legal Metrology Compliance Assessment &amp; Audit Report
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isPdfGenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
              title="Download client-side generated PDF file"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>PDF Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>{isPdfGenerating ? 'Generating PDF...' : 'Download PDF'}</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title="Open browser print dialog / Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Dialog</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document */}
        <div className="p-8 overflow-y-auto flex-1 space-y-6 print:p-6 print:overflow-visible text-slate-900 bg-white font-sans">
          {/* Header section */}
          <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Scale className="w-6 h-6 text-blue-600" />
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  LabelLens Compliance Audit
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                AI-assisted statutory assessment under the configured Legal Metrology (Packaged Commodities) Rules, 2011
              </p>
              <p className="text-[11px] text-slate-500">
                Department of Consumer Affairs, Ministry of Consumer Affairs, Food &amp; Public Distribution Standard
              </p>
            </div>

            <div className="text-right sm:text-right text-xs space-y-0.5">
              <div className="font-mono text-blue-700 font-bold">
                AUDIT REF: {auditRefNumber}
              </div>
              <div className="text-slate-500">Date: {currentDate} ({currentTime})</div>
              <div className="text-slate-500">Standard: LMPC Rules 2011 (as amended)</div>
            </div>
          </div>

          {/* Executive Overview Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Product Commodity</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{product_name_guess}</p>
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-2 block">Manufacturer / Packer</span>
              <p className="font-semibold text-slate-700 mt-0.5">{manufacturer_name_guess}</p>
            </div>

            <div className="flex flex-col justify-center items-center text-center border-t md:border-t-0 md:border-l md:border-r border-slate-200 py-2 md:py-0 px-2">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Compliance Assessment Score</span>
              <span className="text-3xl font-extrabold text-blue-600 font-mono my-0.5">
                {Math.round(overall_compliance_percent)}%
              </span>
              <span className="text-[10px] text-slate-500">6 Mandatory Declarations Evaluated</span>
            </div>

            <div className="flex flex-col justify-center">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Assessment Status</span>
              <div className="mt-1">
                <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${
                  risk_level === 'LOW' 
                    ? 'bg-green-100 text-green-800 border border-green-300' 
                    : risk_level === 'MEDIUM'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-red-100 text-red-800 border border-red-300'
                }`}>
                  {risk_level} REGULATORY RISK
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5">
                {risk_level === 'LOW' && 'No configured violations detected.'}
                {risk_level === 'MEDIUM' && 'Manual verification recommended for potential non-conformities.'}
                {risk_level === 'HIGH' && 'Potential statutory violations detected; manual verification required.'}
              </p>
            </div>
          </div>

          {/* 6 Mandatory Declarations Audit Matrix */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Statutory 6-Declaration Assessment Matrix (PC Rules 2011)
            </h3>
            
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                    <th className="p-3">#</th>
                    <th className="p-3">Mandatory Declaration</th>
                    <th className="p-3">Rule Reference</th>
                    <th className="p-3">Extracted Label Content</th>
                    <th className="p-3">Assessment Result</th>
                    <th className="p-3">Findings / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {declarations.map((d, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-slate-500 font-bold">{i + 1}</td>
                      <td className="p-3 font-bold text-slate-900">{d.field}</td>
                      <td className="p-3 font-mono text-[11px] text-slate-600">{d.rule_reference}</td>
                      <td className="p-3 font-mono text-[11px] text-slate-800 max-w-xs break-words">
                        <div>"{d.extracted_text}"</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] text-slate-500 font-sans">
                            OCR: <strong className="text-slate-850 font-mono font-semibold">{d.confidence || 85}%</strong>
                          </span>
                          <span className={`px-1 py-0.2 rounded text-[8.5px] font-bold font-sans border ${
                            (d.confidence || 85) >= 85
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : (d.confidence || 85) >= 60
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {(d.confidence || 85) >= 85 ? 'HIGH' : (d.confidence || 85) >= 60 ? 'MEDIUM' : 'LOW'}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          d.verdict === 'COMPLIANT'
                            ? 'bg-green-100 text-green-800'
                            : d.verdict === 'NEEDS_REVIEW'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {d.verdict === 'COMPLIANT' ? 'COMPLIANT' : d.verdict === 'NEEDS_REVIEW' ? 'NEEDS REVIEW' : 'POTENTIAL VIOLATION'}
                        </span>
                      </td>
                      <td className="p-3 text-[11px] text-slate-600 max-w-xs">
                        {d.explanation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Inspector Notes & Remarks (If Present) */}
          {notes && notes.trim().length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-xs">
              <span className="text-slate-900 font-bold flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
                Inspector Observations &amp; Remarks
              </span>
              <p className="text-slate-700 whitespace-pre-wrap text-[11px] leading-relaxed">
                {notes}
              </p>
            </div>
          )}

          {/* Professional AI Assessment Disclaimer */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-600 leading-relaxed space-y-1">
            <p className="font-semibold text-slate-700">Assessment Notice &amp; Disclaimer:</p>
            <p>
              This assessment is an AI-assisted inspection aid based on the configured statutory rules and available label evidence. Final legal determination remains with the authorized enforcement authority.
            </p>
            <p className="text-slate-500 text-[9.5px]">
              Evaluation benchmarked against the Legal Metrology Act, 2009 and the Legal Metrology (Packaged Commodities) Rules, 2011 (Ministry of Consumer Affairs, Food and Public Distribution, Government of India).
            </p>
          </div>

          {/* Signoff Section */}
          <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-xs text-slate-600">
            <div>
              <p className="font-semibold text-slate-900">LabelLens AI Compliance Engine</p>
              <p className="text-[10px]">Automated Packaging Assessment Aid</p>
            </div>
            <div className="text-right">
              <div className="h-10 border-b border-slate-300 w-48 mb-1" />
              <p className="text-[10px]">Quality / Compliance Inspector Verification</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
