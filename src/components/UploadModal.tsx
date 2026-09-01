import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  UploadCloud, 
  Camera, 
  Sparkles, 
  FileText, 
  AlertCircle, 
  Check, 
  Layers, 
  ArrowRight, 
  RefreshCw, 
  Sliders, 
  Plus, 
  Trash2, 
  ListOrdered 
} from 'lucide-react';
import { SAMPLE_PACKS } from '../data/sampleLabels';
import { SamplePack } from '../types';
import { fileToBase64 } from '../utils/imageUtils';

export interface QueuedImageItem {
  id: string;
  base64: string;
  mimeType: string;
  name: string;
  sizeStr?: string;
  hint?: string;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (sample: SamplePack) => void;
  onUploadImage: (base64: string, mimeType: string, hint?: string) => void;
  onBatchAnalyze?: (items: Array<{ base64: string; mimeType: string; hint?: string; name: string }>) => void;
  isLoading: boolean;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onSelectSample,
  onUploadImage,
  onBatchAnalyze,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'samples' | 'upload' | 'camera'>('samples');
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [queue, setQueue] = useState<QueuedImageItem[]>([]);
  const [commonHint, setCommonHint] = useState<string>('');
  
  // Camera state
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore error on stop
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const startCamera = async (targetFacing: 'environment' | 'user' = facingMode) => {
    // Stop any existing stream first to release the hardware
    stopCamera();
    setCameraError(null);

    // Wait a brief tick for the browser and OS to release any previous track locks
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Array of fallback constraints to try in sequence
    const constraintAttempts: MediaStreamConstraints[] = [
      {
        video: {
          facingMode: targetFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      },
      {
        video: {
          facingMode: targetFacing,
        },
      },
      {
        video: true,
      },
    ];

    let acquiredStream: MediaStream | null = null;
    let lastErr: any = null;

    for (const constraints of constraintAttempts) {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API (navigator.mediaDevices.getUserMedia) is not supported in this browser environment.');
        }
        acquiredStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (acquiredStream) break;
      } catch (err: any) {
        lastErr = err;
        // If it's a permission rejection, don't keep hammering subsequent constraints
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          break;
        }
      }
    }

    if (acquiredStream && videoRef.current) {
      streamRef.current = acquiredStream;
      videoRef.current.srcObject = acquiredStream;
      try {
        await videoRef.current.play();
      } catch (playErr) {
        console.warn('Video play auto-start error:', playErr);
      }
      setCameraActive(true);
      setFacingMode(targetFacing);
    } else {
      const errName = lastErr?.name || '';
      const errMsg = (lastErr?.message || '').toLowerCase();
      console.error('Camera initialization failed:', lastErr);

      if (errName === 'NotReadableError' || errName === 'TrackStartError' || errMsg.includes('in use') || errMsg.includes('device in use')) {
        setCameraError(
          'Camera is currently in use by another application or browser tab. Please close other camera programs and click Retry, or use the File Upload tab.'
        );
      } else if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        setCameraError(
          'Camera access was denied. Please grant camera permission in your browser address bar and click Retry.'
        );
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        setCameraError(
          'No camera device was detected. You can upload packaging label photos directly via the File Upload tab.'
        );
      } else {
        setCameraError(
          lastErr?.message || 'Unable to access camera. Please check camera permissions or upload an image file.'
        );
      }
      setCameraActive(false);
    }
  };

  const toggleCameraFacing = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    startCamera(nextFacing);
  };

  const handleCaptureCamera = (addToQueueOnly = false) => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 800;
    canvas.height = videoRef.current.videoHeight || 600;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      const base64 = dataUrl.split(',')[1];
      
      if (addToQueueOnly) {
        if (queue.length >= 5) {
          alert('Queue limit reached (maximum 5 images).');
          return;
        }
        const newItem: QueuedImageItem = {
          id: `cam-${Date.now()}`,
          base64,
          mimeType: 'image/jpeg',
          name: `Camera Snapshot ${queue.length + 1}`,
          sizeStr: 'JPEG Photo',
          hint: commonHint,
        };
        setQueue((prev) => [...prev, newItem]);
        setActiveTab('upload');
      } else {
        stopCamera();
        onUploadImage(base64, 'image/jpeg', commonHint);
        onClose();
      }
    }
  };

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const availableSlots = 5 - queue.length;
    
    if (availableSlots <= 0) {
      alert('You can queue a maximum of 5 images at a time for serial analysis.');
      return;
    }

    const filesToProcess = fileArray.slice(0, availableSlots);
    const newItems: QueuedImageItem[] = [];

    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      try {
        const { base64, mimeType } = await fileToBase64(file);
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
        newItems.push({
          id: `file-${Date.now()}-${i}-${Math.random()}`,
          base64,
          mimeType,
          name: file.name,
          sizeStr: `${sizeMb} MB`,
          hint: '',
        });
      } catch (err) {
        console.error('Error reading file:', err);
      }
    }

    if (newItems.length > 0) {
      setQueue((prev) => [...prev, ...newItems]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveQueueItem = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateItemHint = (id: string, hint: string) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, hint } : item))
    );
  };

  const handleStartAnalysis = () => {
    if (queue.length === 0) return;

    if (queue.length === 1) {
      const item = queue[0];
      onUploadImage(item.base64, item.mimeType, item.hint || commonHint);
      onClose();
    } else if (onBatchAnalyze) {
      const batchItems = queue.map((item) => ({
        base64: item.base64,
        mimeType: item.mimeType,
        hint: item.hint || commonHint,
        name: item.name,
      }));
      onBatchAnalyze(batchItems);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-900">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Legal Metrology Compliance Inspection
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Upload single label or queue up to 5 images for serial automated analysis under LMPC Rules, 2011
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-6 pt-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('samples');
              stopCamera();
            }}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'samples'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Preset Pack Samples</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('upload');
              stopCamera();
            }}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload &amp; Batch Queue {queue.length > 0 && `(${queue.length}/5)`}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('camera');
              startCamera();
            }}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'camera'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Camera Capture</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* SAMPLES TAB */}
          {activeTab === 'samples' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 font-medium">
                Choose a pre-configured product label representing different Legal Metrology test scenarios:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SAMPLE_PACKS.map((sample) => (
                  <div
                    key={sample.id}
                    onClick={() => {
                      onSelectSample(sample);
                      onClose();
                    }}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 cursor-pointer transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                          {sample.category}
                        </span>
                        {sample.expectedViolationsCount === 0 ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-green-100 text-green-700">
                            Fully Compliant
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-red-100 text-red-700">
                            {sample.expectedViolationsCount} Violations / Review
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                        {sample.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                        {sample.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                      <span>Inspect this pack</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* UPLOAD & BATCH QUEUE TAB */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              {/* Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                  dragOver
                    ? 'border-blue-500 bg-blue-50/50'
                    : queue.length > 0
                    ? 'border-slate-300 hover:border-blue-400 bg-slate-50/30'
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                }`}
                onClick={() => document.getElementById('file-upload-input')?.click()}
              >
                <input
                  id="file-upload-input"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="h-12 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 mb-2 shadow-2xs">
                  <UploadCloud className="w-6 h-6" />
                </div>

                <p className="text-sm font-bold text-slate-900 mb-0.5">
                  {queue.length === 0
                    ? 'Drag & drop package photos or browse files'
                    : `Add more label photos (${queue.length}/5 queued)`}
                </p>
                <p className="text-xs text-slate-500 mb-2">
                  Select up to 5 images at once for automated serial batch inspection (JPG, PNG, WEBP)
                </p>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white text-xs font-semibold text-slate-700 border border-slate-200 shadow-2xs hover:bg-slate-50">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Browse Images</span>
                </span>
              </div>

              {/* Queue List Display */}
              {queue.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <ListOrdered className="w-3.5 h-3.5 text-blue-600" />
                      <span>Serial Inspection Queue ({queue.length} of 5 max)</span>
                    </h3>
                    <button
                      onClick={() => setQueue([])}
                      className="text-xs text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      Clear Queue
                    </button>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {queue.map((item, idx) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3"
                      >
                        {/* Index */}
                        <span className="w-5 text-center text-xs font-bold text-slate-400 font-mono">
                          {idx + 1}
                        </span>

                        {/* Thumbnail */}
                        <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          <img
                            src={
                              item.base64.startsWith('data:')
                                ? item.base64
                                : `data:${item.mimeType};base64,${item.base64}`
                            }
                            alt={item.name}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        {/* Details & Hint */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {item.name}
                            </span>
                            {item.sizeStr && (
                              <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                {item.sizeStr}
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={item.hint || ''}
                            onChange={(e) => handleUpdateItemHint(item.id, e.target.value)}
                            placeholder="Optional product hint (e.g. Potato chips 50g)"
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-[11px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleRemoveQueueItem(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer flex-shrink-0"
                          title="Remove from queue"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* General / Global Hint */}
                  <div className="space-y-1 pt-1">
                    <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                      <Sliders className="w-3 h-3 text-slate-400" />
                      Global Category / Context Hint for all queued packs (Optional):
                    </label>
                    <input
                      type="text"
                      value={commonHint}
                      onChange={(e) => setCommonHint(e.target.value)}
                      placeholder="e.g. FMCG Food Packaging or Ayurvedic Cosmetics"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  {/* Start Button */}
                  <button
                    onClick={handleStartAnalysis}
                    disabled={isLoading || queue.length === 0}
                    className="w-full mt-2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-blue-400" />
                    )}
                    <span>
                      {queue.length === 1
                        ? 'Start Legal Metrology Inspection (1 Image)'
                        : `Start Serial Automated Analysis (${queue.length} Images Queue)`}
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* CAMERA TAB */}
          {activeTab === 'camera' && (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-200">
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
                
                {cameraError && (
                  <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-6 text-center z-10">
                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3 text-red-600 border border-red-100">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">Camera Access Issue</h4>
                    <p className="text-xs text-slate-600 max-w-md mb-4 leading-relaxed">{cameraError}</p>
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                      <button
                        onClick={() => startCamera(facingMode)}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retry Camera</span>
                      </button>
                      <button
                        onClick={() => {
                          stopCamera();
                          setActiveTab('upload');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-blue-50 text-xs font-semibold text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Use File Upload Instead</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Target overlay guide & Flip Camera control */}
                {cameraActive && !cameraError && (
                  <>
                    <div className="absolute inset-8 border-2 border-blue-400/70 rounded-xl pointer-events-none flex items-center justify-center">
                      <span className="text-[11px] text-white font-semibold bg-black/60 backdrop-blur-xs px-2 py-1 rounded">
                        Align statutory declarations panel within frame
                      </span>
                    </div>

                    <button
                      onClick={toggleCameraFacing}
                      className="absolute top-3 right-3 px-2.5 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20"
                      title="Switch between front and back camera"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Flip Camera</span>
                    </button>
                  </>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <button
                  onClick={() => handleCaptureCamera(false)}
                  disabled={!cameraActive || isLoading}
                  className="w-full sm:flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture &amp; Analyze Immediately</span>
                </button>

                <button
                  onClick={() => handleCaptureCamera(true)}
                  disabled={!cameraActive || isLoading || queue.length >= 5}
                  className="w-full sm:flex-1 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Batch Queue ({queue.length}/5)</span>
                </button>

                <button
                  onClick={stopCamera}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
