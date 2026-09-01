import React, { useState, useRef, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Layers, 
  ScanLine,
  Crosshair,
  Sparkles,
  FileText,
  Save,
  Trash2,
  Check,
  Plus,
  Box,
  HelpCircle,
  MessageSquare,
  Copy,
  AlertCircle
} from 'lucide-react';
import { DeclarationResult, Verdict } from '../types';

interface LabelInspectorProps {
  imageUrl: string;
  declarations: DeclarationResult[];
  activeField: string | null;
  onSelectField: (field: string | null) => void;
  productName?: string;
  manufacturerName?: string;
  notes?: string;
  onUpdateNotes?: (notes: string) => void;
}

type ViewfinderPreset = 'standard' | 'pouch' | 'bottle';

export const LabelInspector: React.FC<LabelInspectorProps> = ({
  imageUrl,
  declarations,
  activeField,
  onSelectField,
  productName,
  manufacturerName,
  notes = '',
  onUpdateNotes,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showBoxes, setShowBoxes] = useState<boolean>(true);
  const [showViewfinder, setShowViewfinder] = useState<boolean>(false);
  const [viewfinderPreset, setViewfinderPreset] = useState<ViewfinderPreset>('standard');
  const [hoveredBoxField, setHoveredBoxField] = useState<string | null>(null);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  // Inspector Notes State
  const [isNotesOpen, setIsNotesOpen] = useState<boolean>(Boolean(notes && notes.trim().length > 0));
  const [noteText, setNoteText] = useState<string>(notes || '');
  const [isSavedRecently, setIsSavedRecently] = useState<boolean>(false);
  const [copiedRecently, setCopiedRecently] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Sync internal notes with prop when evaluation / image changes
  useEffect(() => {
    setNoteText(notes || '');
    if (notes && notes.trim().length > 0) {
      setIsNotesOpen(true);
    }
  }, [notes, imageUrl]);

  // Reset zoom & pan when image changes
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [imageUrl]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.3, 3.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.3, 0.7));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSaveNotes = () => {
    if (onUpdateNotes) {
      onUpdateNotes(noteText);
      setIsSavedRecently(true);
      setTimeout(() => setIsSavedRecently(false), 2500);
    }
  };

  const handleCopyNotes = () => {
    if (!noteText) return;
    navigator.clipboard.writeText(noteText);
    setCopiedRecently(true);
    setTimeout(() => setCopiedRecently(false), 2000);
  };

  const handleAddQuickTag = (tag: string) => {
    setNoteText((prev) => {
      const updated = prev ? `${prev.trim()}\n• ${tag}` : `• ${tag}`;
      if (onUpdateNotes) onUpdateNotes(updated);
      return updated;
    });
    setIsNotesOpen(true);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const getVerdictColors = (verdict: Verdict, isActive: boolean) => {
    if (verdict === 'COMPLIANT') {
      return {
        border: isActive ? 'border-green-500 bg-green-500/30 ring-4 ring-green-400/50' : 'border-green-500 bg-green-500/20 hover:bg-green-500/30',
        badge: 'bg-green-600 text-white',
        text: 'text-green-700',
        numBadge: 'bg-green-600 text-white',
      };
    }
    if (verdict === 'NEEDS_REVIEW') {
      return {
        border: isActive ? 'border-yellow-500 bg-yellow-500/35 ring-4 ring-yellow-400/50' : 'border-yellow-500 bg-yellow-500/20 hover:bg-yellow-500/35',
        badge: 'bg-yellow-600 text-white',
        text: 'text-yellow-700',
        numBadge: 'bg-yellow-600 text-white',
      };
    }
    return {
      border: isActive ? 'border-red-500 bg-red-500/35 ring-4 ring-red-400/50' : 'border-red-500 bg-red-500/20 hover:bg-red-500/35',
      badge: 'bg-red-600 text-white',
      text: 'text-red-700',
      numBadge: 'bg-red-600 text-white',
    };
  };

  // Wireframe Target Guides configured according to India Legal Metrology Rules 2011
  const getViewfinderZones = (preset: ViewfinderPreset) => {
    if (preset === 'pouch') {
      return [
        {
          id: 'z-title',
          label: 'Generic Commodity Name (Rule 6(1)(c))',
          sub: 'Center-Top Pouch Header',
          left: 15, top: 12, width: 70, height: 18,
          color: 'border-cyan-400 text-cyan-300 bg-cyan-950/40',
        },
        {
          id: 'z-netqty',
          label: 'Net Quantity (Rule 6(1)(e))',
          sub: 'PDP Bottom-Left (SI units: g, kg, ml, L)',
          left: 10, top: 58, width: 38, height: 14,
          color: 'border-emerald-400 text-emerald-300 bg-emerald-950/40',
        },
        {
          id: 'z-mrp',
          label: 'MRP (incl. of all taxes) (Rule 6(1)(f))',
          sub: 'PDP Bottom-Right',
          left: 52, top: 58, width: 38, height: 14,
          color: 'border-amber-400 text-amber-300 bg-amber-950/40',
        },
        {
          id: 'z-mfg-addr',
          label: 'Mfg / Packer PIN Address (Rule 6(1)(a))',
          sub: 'Lower Information Panel',
          left: 10, top: 74, width: 80, height: 12,
          color: 'border-blue-400 text-blue-300 bg-blue-950/40',
        },
        {
          id: 'z-care',
          label: 'Consumer Care & Grievance (Rule 6(1)(g))',
          sub: 'Seam / Footer Channel',
          left: 10, top: 88, width: 80, height: 9,
          color: 'border-purple-400 text-purple-300 bg-purple-950/40',
        },
      ];
    }

    if (preset === 'bottle') {
      return [
        {
          id: 'z-title',
          label: 'Generic Commodity (Rule 6(1)(c))',
          sub: 'Upper Circumference Label',
          left: 20, top: 18, width: 60, height: 16,
          color: 'border-cyan-400 text-cyan-300 bg-cyan-950/40',
        },
        {
          id: 'z-netqty',
          label: 'Net Volume / Weight (Rule 6(1)(e))',
          sub: 'Front Principal Display Area',
          left: 22, top: 44, width: 56, height: 12,
          color: 'border-emerald-400 text-emerald-300 bg-emerald-950/40',
        },
        {
          id: 'z-mrp',
          label: 'MRP & Batch / Mfg Date (Rule 6(1)(d),(f))',
          sub: 'Shoulder / Base Stamp',
          left: 15, top: 58, width: 70, height: 14,
          color: 'border-amber-400 text-amber-300 bg-amber-950/40',
        },
        {
          id: 'z-care',
          label: 'Mfg Address & Consumer Care (Rule 6(1)(a),(g))',
          sub: 'Reverse Body Label',
          left: 15, top: 74, width: 70, height: 20,
          color: 'border-blue-400 text-blue-300 bg-blue-950/40',
        },
      ];
    }

    // Default: Standard Carton / Box Panel Guide
    return [
      {
        id: 'z-title',
        label: '1. Commodity & Brand Name (Rule 6(1)(c))',
        sub: 'Principal Display Panel (Upper Zone)',
        left: 12, top: 10, width: 76, height: 18,
        color: 'border-cyan-400 text-cyan-300 bg-cyan-950/40',
      },
      {
        id: 'z-netqty',
        label: '2. Net Quantity in Metric Units (Rule 6(1)(e))',
        sub: 'PDP Bottom-Left Target (Min font height applied)',
        left: 10, top: 50, width: 38, height: 15,
        color: 'border-emerald-400 text-emerald-300 bg-emerald-950/40',
      },
      {
        id: 'z-mrp',
        label: '3. MRP (incl. of all taxes) (Rule 6(1)(f))',
        sub: 'PDP Bottom-Right Target (Max Retail Price)',
        left: 52, top: 50, width: 38, height: 15,
        color: 'border-amber-400 text-amber-300 bg-amber-950/40',
      },
      {
        id: 'z-date',
        label: '4. Month & Year of Mfg/Pkg (Rule 6(1)(d))',
        sub: 'Batch & Packaging Timeline',
        left: 10, top: 67, width: 80, height: 9,
        color: 'border-indigo-400 text-indigo-300 bg-indigo-950/40',
      },
      {
        id: 'z-mfg',
        label: '5. Manufacturer Full PIN Address (Rule 6(1)(a))',
        sub: 'Name, Unit Location, City, State & PIN',
        left: 10, top: 78, width: 80, height: 10,
        color: 'border-blue-400 text-blue-300 bg-blue-950/40',
      },
      {
        id: 'z-care',
        label: '6. Consumer Care Contact Details (Rule 6(1)(g))',
        sub: 'Grievance Officer, Tel & Email',
        left: 10, top: 90, width: 80, height: 8,
        color: 'border-purple-400 text-purple-300 bg-purple-950/40',
      },
    ];
  };

  const activeZones = getViewfinderZones(viewfinderPreset);

  return (
    <div className="flex flex-col bg-slate-200/50 rounded-xl border-2 border-slate-300 shadow-inner overflow-hidden relative group">
      {/* Top Inspector Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-slate-200 flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-medium">
          <Layers className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-slate-900">Detection Viewport</span>
          {productName && (
            <span className="text-slate-400 font-normal hidden lg:inline truncate max-w-xs">
              • {productName}
            </span>
          )}
        </div>

        {/* Toolbar controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Viewfinder Overlay Toggle */}
          <button
            onClick={() => setShowViewfinder((v) => !v)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all shadow-2xs ${
              showViewfinder
                ? 'bg-cyan-600 text-white border border-cyan-700 ring-2 ring-cyan-400/30'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
            }`}
            title="Toggle Alignment Viewfinder Wireframe Guide"
          >
            <ScanLine className="w-3.5 h-3.5" />
            <span>Viewfinder Guide</span>
            {showViewfinder && (
              <span className="px-1 py-0.2 bg-cyan-800 text-[9px] rounded font-mono uppercase font-bold">
                ON
              </span>
            )}
          </button>

          {/* Notes Drawer Toggle Button */}
          <button
            onClick={() => setIsNotesOpen((v) => !v)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all shadow-2xs ${
              isNotesOpen
                ? 'bg-blue-600 text-white border border-blue-700 ring-2 ring-blue-400/30'
                : noteText.trim().length > 0
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
            }`}
            title="Open/Close Inspector Remarks and Notes Box"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Notes</span>
            {noteText.trim().length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                isNotesOpen ? 'bg-blue-800 text-white' : 'bg-blue-600 text-white'
              }`}>
                {noteText.split('\n').filter(Boolean).length}
              </span>
            )}
          </button>

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* Bounding Boxes Toggle */}
          <button
            onClick={() => setShowBoxes((v) => !v)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${
              showBoxes 
                ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}
            title="Toggle Bounding Overlays"
          >
            {showBoxes ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{showBoxes ? 'Overlays' : 'Hidden'}</span>
          </button>

          {/* Zoom Controls */}
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleResetZoom}
            className="p-1.5 rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[11px] font-medium border border-slate-200">
            {Math.round(zoom * 100)}%
          </span>
        </div>
      </div>

      {/* Viewfinder Preset Sub-bar (Shown when Viewfinder is Active) */}
      {showViewfinder && (
        <div className="bg-cyan-950 text-cyan-200 px-4 py-2 flex items-center justify-between border-b border-cyan-800 text-xs flex-wrap gap-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-cyan-400 animate-spin-slow" />
            <span className="font-bold text-white tracking-wide">Statutory Viewfinder Alignment Guide</span>
            <span className="text-cyan-400 text-[11px] hidden md:inline">
              (LMPC Packaged Commodities Rules 2011)
            </span>
          </div>

          {/* Preset Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-cyan-400 font-medium">Pack Geometry:</span>
            <div className="inline-flex rounded-md bg-cyan-900/80 p-0.5 border border-cyan-700">
              <button
                onClick={() => setViewfinderPreset('standard')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  viewfinderPreset === 'standard'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-2xs'
                    : 'text-cyan-200 hover:text-white'
                }`}
              >
                Carton / Box
              </button>
              <button
                onClick={() => setViewfinderPreset('pouch')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  viewfinderPreset === 'pouch'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-2xs'
                    : 'text-cyan-200 hover:text-white'
                }`}
              >
                Pouch / Sachet
              </button>
              <button
                onClick={() => setViewfinderPreset('bottle')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  viewfinderPreset === 'bottle'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-2xs'
                    : 'text-cyan-200 hover:text-white'
                }`}
              >
                Bottle / Canister
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Interactive Image Area */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative min-h-[420px] max-h-[640px] flex items-center justify-center p-4 overflow-hidden bg-slate-200/70 select-none ${
          zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        }`}
      >
        <div 
          className="relative inline-block leading-none transition-transform duration-75 origin-center max-w-full max-h-full"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          {/* Packaging Image */}
          <img
            src={imageUrl}
            alt="Packaged Commodity Label"
            referrerPolicy="no-referrer"
            className="block max-h-[580px] w-auto max-w-full object-contain rounded-lg shadow-md border border-slate-300 bg-white select-none"
          />

          {/* Viewfinder Wireframe Overlay (When Enabled) */}
          {showViewfinder && (
            <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
              {/* Corner Registration Crosshair L-brackets */}
              <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-cyan-400">
                <span className="absolute -top-1.5 -left-1.5 text-cyan-400 text-[10px] font-mono">+</span>
              </div>
              <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-cyan-400">
                <span className="absolute -top-1.5 -right-1.5 text-cyan-400 text-[10px] font-mono">+</span>
              </div>
              <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-cyan-400">
                <span className="absolute -bottom-1.5 -left-1.5 text-cyan-400 text-[10px] font-mono">+</span>
              </div>
              <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-cyan-400">
                <span className="absolute -bottom-1.5 -right-1.5 text-cyan-400 text-[10px] font-mono">+</span>
              </div>

              {/* Center Target Reticle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center opacity-40">
                <div className="w-12 h-12 rounded-full border border-dashed border-cyan-400"></div>
                <div className="absolute w-16 h-px bg-cyan-400"></div>
                <div className="absolute h-16 w-px bg-cyan-400"></div>
              </div>

              {/* Wireframe Alignment Zones */}
              {activeZones.map((zone) => (
                <div
                  key={zone.id}
                  onMouseEnter={() => setHoveredZone(zone.id)}
                  onMouseLeave={() => setHoveredZone(null)}
                  className={`absolute border-2 border-dashed rounded transition-all duration-150 pointer-events-auto cursor-help ${zone.color} ${
                    hoveredZone === zone.id ? 'ring-2 ring-cyan-400 shadow-lg scale-[1.01]' : 'opacity-85'
                  }`}
                  style={{
                    left: `${zone.left}%`,
                    top: `${zone.top}%`,
                    width: `${zone.width}%`,
                    height: `${zone.height}%`,
                  }}
                >
                  {/* Zone Label Header */}
                  <div className="absolute -top-2.5 left-2 px-1.5 py-0.2 rounded bg-slate-950 text-white border border-cyan-500/70 text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <span>{zone.label}</span>
                  </div>

                  {/* Subtitle inside zone */}
                  <div className="p-1.5 text-[8px] font-medium leading-tight opacity-90 hidden sm:block">
                    {zone.sub}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Interactive Bounding Boxes from AI Evaluation */}
          {showBoxes && !showViewfinder && declarations.map((dec, idx) => {
            if (!dec.bounding_box || dec.bounding_box.length !== 4) return null;
            let [x1, y1, x2, y2] = dec.bounding_box;
            
            // Normalize any 0-1000 or fractional coordinates
            if (Math.max(x1, y1, x2, y2) > 100) {
              x1 /= 10; y1 /= 10; x2 /= 10; y2 /= 10;
            } else if (Math.max(x1, y1, x2, y2) <= 1.0 && Math.max(x1, y1, x2, y2) > 0) {
              x1 *= 100; y1 *= 100; x2 *= 100; y2 *= 100;
            }

            const left = Math.max(0, Math.min(99, Math.min(x1, x2)));
            const top = Math.max(0, Math.min(99, Math.min(y1, y2)));
            const right = Math.max(left + 1, Math.min(100, Math.max(x1, x2)));
            const bottom = Math.max(top + 1, Math.min(100, Math.max(y1, y2)));
            const width = Math.max(1.5, right - left);
            const height = Math.max(1.5, bottom - top);

            const isSelected = activeField === dec.field;
            const isHovered = hoveredBoxField === dec.field;
            const isActive = isSelected || isHovered;
            const colors = getVerdictColors(dec.verdict, isActive);

            return (
              <div
                key={`${dec.field}-${idx}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectField(isSelected ? null : dec.field);
                }}
                onMouseEnter={() => setHoveredBoxField(dec.field)}
                onMouseLeave={() => setHoveredBoxField(null)}
                className={`absolute transition-all duration-150 border-2 rounded flex items-start justify-end cursor-pointer z-10 ${colors.border}`}
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  width: `${width}%`,
                  height: `${height}%`,
                }}
              >
                {/* Box Label Tag positioned neatly at top right */}
                <span className={`absolute -top-2.5 -right-1 text-[8px] font-bold px-1 py-0.2 rounded shadow-md flex items-center gap-1 ${colors.numBadge}`}>
                  {`0${idx + 1}`.slice(-2)}
                </span>

                {/* Floating tooltip on hover/select */}
                {isActive && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 min-w-[200px] max-w-[280px] p-2.5 rounded-lg bg-slate-900 text-white border border-slate-700 shadow-2xl text-left pointer-events-none z-30 leading-normal">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[11px] font-bold text-white">
                        {dec.field}
                      </p>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
                        {dec.verdict}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300 font-mono line-clamp-2 bg-black/40 p-1 rounded border border-slate-800 mb-1">
                      "{dec.extracted_text}"
                    </p>
                    <p className="text-[10px] text-slate-300 leading-tight">
                      {dec.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Viewfinder Alignment Helper Floating HUD */}
        {showViewfinder && (
          <div className="absolute bottom-4 left-4 bg-slate-950/85 backdrop-blur-md text-cyan-200 text-xs p-3 rounded-lg border border-cyan-700 shadow-xl z-20 pointer-events-none max-w-md">
            <div className="flex items-center gap-2 font-bold text-white mb-1">
              <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
              <span>Alignment Recommendation</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-tight">
              Position the packaged item so Net Quantity (PDP lower left) and MRP (PDP lower right) fall cleanly into the indicated target zones for 100% statutory detection accuracy.
            </p>
          </div>
        )}

        {/* Floating Detection View HUD banner */}
        {!showViewfinder && (
          <div className="absolute bottom-4 left-4 bg-black/75 backdrop-blur-md text-white text-xs p-2.5 rounded-lg flex items-center gap-3 shadow-lg z-20 pointer-events-none">
            <div className="flex -space-x-1">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 border border-black"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 border border-black"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 border border-black"></div>
            </div>
            <span className="font-medium text-[11px]">Rule 6(1) Overlays Active</span>
          </div>
        )}
      </div>

      {/* Expandable Inspector Remarks Drawer */}
      {isNotesOpen && (
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex flex-col gap-3 animate-fadeIn">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-900">
                Inspector Observations &amp; Remarks
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Copy Button */}
              {noteText.trim().length > 0 && (
                <button
                  onClick={handleCopyNotes}
                  className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1 transition-colors shadow-2xs"
                  title="Copy notes to clipboard"
                >
                  {copiedRecently ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedRecently ? 'Copied' : 'Copy'}</span>
                </button>
              )}

              {/* Save Button */}
              <button
                onClick={handleSaveNotes}
                className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all shadow-2xs ${
                  isSavedRecently
                    ? 'bg-green-600 text-white'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {isSavedRecently ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                <span>{isSavedRecently ? 'Saved!' : 'Save Note'}</span>
              </button>
            </div>
          </div>

          {/* Text Area for Notes */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={noteText}
              onChange={(e) => {
                setNoteText(e.target.value);
                if (onUpdateNotes) onUpdateNotes(e.target.value);
              }}
              placeholder="Type statutory inspector remarks, field verifications, packaging notes, or audit findings here..."
              rows={3}
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800 font-sans shadow-inner resize-y leading-relaxed"
            />
          </div>

          {/* Quick Statutory Tag Chips */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Quick Statutory Tags:
            </span>
            <button
              onClick={() => handleAddQuickTag('Missing PIN code in manufacturer address (Rule 6(1)(a))')}
              className="px-2 py-0.5 rounded-md bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 text-[10px] font-medium transition-colors"
            >
              + Missing PIN Code
            </button>
            <button
              onClick={() => handleAddQuickTag('Illegal unit abbreviation used in Net Quantity (Rule 12)')}
              className="px-2 py-0.5 rounded-md bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 text-[10px] font-medium transition-colors"
            >
              + Non-SI Net Qty Unit
            </button>
            <button
              onClick={() => handleAddQuickTag('MRP missing mandatory "(inclusive of all taxes)" statement')}
              className="px-2 py-0.5 rounded-md bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 text-[10px] font-medium transition-colors"
            >
              + Missing MRP Tax Qualifier
            </button>
            <button
              onClick={() => handleAddQuickTag('Consumer care phone / email unreachable (Rule 6(1)(g))')}
              className="px-2 py-0.5 rounded-md bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 text-[10px] font-medium transition-colors"
            >
              + Grievance Contact Issue
            </button>
            <button
              onClick={() => handleAddQuickTag('Month & Year of Manufacture/Packaging missing (Rule 6(1)(d))')}
              className="px-2 py-0.5 rounded-md bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 text-[10px] font-medium transition-colors"
            >
              + Mfg Date Missing
            </button>
            <button
              onClick={() => {
                setNoteText('');
                if (onUpdateNotes) onUpdateNotes('');
              }}
              className="px-2 py-0.5 rounded-md text-red-600 hover:bg-red-50 text-[10px] font-medium ml-auto flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Footer Info / Legend Bar */}
      <div className="px-4 py-2.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-[11px] font-semibold">Legend:</span>
          <div className="flex items-center gap-1 text-[11px] text-green-700 font-medium">
            <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
            <span>Compliant</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-yellow-700 font-medium">
            <span className="h-2 w-2 rounded-full bg-yellow-500 inline-block" />
            <span>Review</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-red-700 font-medium">
            <span className="h-2 w-2 rounded-full bg-red-500 inline-block" />
            <span>Violation</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 italic">
          {showViewfinder ? 'Hover over zones for legal guidelines' : 'Click any box to inspect legal details'}
        </div>
      </div>
    </div>
  );
};
