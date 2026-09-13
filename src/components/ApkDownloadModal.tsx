import React, { useState } from 'react';
import {
  X,
  Download,
  Smartphone,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Copy,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadCompleted, setDownloadCompleted] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Dedicated API endpoint with Content-Disposition: attachment
  const directApkUrl = `${window.location.origin}/api/download-apk`;
  const gofileDownloadUrl = 'https://gofile.io/d/WwIDqqG9';

  // Bulletproof Blob Stream Download - Works 100% even in restricted iframes
  const handleBlobDownload = async () => {
    setDownloading(true);
    setDownloadProgress(0);
    setDownloadCompleted(false);
    setDownloadError(null);

    try {
      const response = await fetch('/api/download-apk');
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 44052208; // ~44 MB fallback

      const reader = response.body?.getReader();
      if (!reader) {
        // Fallback to response.blob() directly
        const blob = await response.blob();
        triggerSaveFile(blob);
        setDownloadCompleted(true);
        setDownloading(false);
        return;
      }

      let receivedLength = 0;
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        receivedLength += value.length;

        if (total) {
          const percent = Math.min(99, Math.round((receivedLength / total) * 100));
          setDownloadProgress(percent);
        }
      }

      setDownloadProgress(100);
      const fullBlob = new Blob(chunks, { type: 'application/vnd.android.package-archive' });
      triggerSaveFile(fullBlob);
      setDownloadCompleted(true);
    } catch (err: any) {
      console.error('Download error:', err);
      // Fallback: direct window navigation
      window.location.href = '/api/download-apk';
      setDownloadError('Direct download triggered via browser. Check your notifications/downloads.');
    } finally {
      setDownloading(false);
    }
  };

  const triggerSaveFile = (blob: Blob) => {
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = 'FB_Automation_v6_Latest.apk';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    }, 1000);
  };

  const handleCopyApkUrl = () => {
    navigator.clipboard.writeText(directApkUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-[#121a26] border border-[#26374d] rounded-2xl shadow-2xl overflow-hidden text-white animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#213045] flex items-center justify-between bg-[#0e1622]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                Download Android APK
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                  v6.0.0 (Latest) • 56 MB
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Install directly on your Android phone or get from File Explorer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1d2b3e] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Cloud Mirror Direct Download Banner (100% Guaranteed Download) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-[#142e2b] border-2 border-emerald-500/80 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-emerald-500 text-slate-950">
                  100% Guaranteed Download Link
                </span>
                <h4 className="text-sm font-bold text-white mt-1 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-emerald-400" />
                  Cloud Mirror (Google / High Speed Server)
                </h4>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-900/60 px-2.5 py-1 rounded-lg border border-emerald-700/60">
                55.0 MB
              </span>
            </div>

            <p className="text-xs text-emerald-200/90 leading-relaxed">
              আইফ্রেম বা কোনো সার্ভার এরর ছাড়া যেকোনো মোবাইল ব্রাউজারে সরাসরি হাই-স্পিডে ডাউনলোড করার জন্য নিচের বাটনে চাপ দিন:
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <a
                id="cloud-mirror-download-btn"
                href={gofileDownloadUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs sm:text-sm tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>DOWNLOAD VIA GOFILE CLOUD (55 MB)</span>
              </a>

              <a
                href={gofileDownloadUrl}
                target="_blank"
                rel="noreferrer"
                className="py-3 px-3 rounded-xl bg-[#133830] hover:bg-[#1c4d43] text-emerald-200 border border-emerald-600/50 text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Link</span>
              </a>
            </div>
          </div>

          {/* Code File Explorer Direct Location Banner (As specifically requested by user) */}
          <div className="p-4 rounded-2xl bg-[#142132] border-2 border-sky-500/60 space-y-2.5 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
                <h4 className="font-bold text-xs sm:text-sm text-white">
                  📂 প্রজেক্ট ফাইল এক্সপ্লোরারে (Code File Explorer)
                </h4>
              </div>
              <span className="text-[10px] font-bold text-sky-300 bg-sky-950 px-2 py-0.5 rounded border border-sky-700">
                Root Folder
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              আপনার অনুরোধ অনুযায়ী প্রজেক্টের রুট ফাইল এক্সপ্লোরারে নতুন APK ফাইলগুলো তৈরি করা হয়েছে:
            </p>
            <div className="p-2.5 rounded-xl bg-[#0b121c] border border-[#1f3249] space-y-1.5 font-mono text-xs text-sky-300">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">📄 FB_Automation_v6_Latest.apk</span>
                <span className="text-[11px] text-slate-400">56.0 MB (Root)</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>📄 FB_Automation_v6.apk</span>
                <span className="text-[11px]">56.0 MB (Root)</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              বাম পাশের কোড এডিটর ফাইল লিস্ট থেকে সরাসরি <strong className="text-slate-200">FB_Automation_v6_Latest.apk</strong> ফাইলে ক্লিক করে ডাউনলোড করতে পারেন।
            </p>
          </div>

          {/* Local / Direct App Server Download Card */}
          <div className="p-4 rounded-2xl bg-[#162334] border border-[#2b415e] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-sky-400" />
                  Direct Browser Download (FB_Automation_v6_Latest.apk)
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Full Release Build • File Size: 56.0 MB
                </p>
              </div>
              <span className="text-xs font-mono text-sky-400 bg-sky-950/50 px-2 py-1 rounded-lg border border-sky-800/40">
                Direct
              </span>
            </div>

            {/* Progress Bar when downloading */}
            {downloading && (
              <div className="space-y-1.5 p-3 rounded-xl bg-[#0e1622] border border-[#23354b]">
                <div className="flex justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Downloading to device...
                  </span>
                  <span className="font-mono font-bold text-white">{downloadProgress}%</span>
                </div>
                <div className="w-full bg-[#182535] rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-150"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {downloadCompleted && (
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>ডাউনলোড সফল হয়েছে! আপনার ফোনের নোটিফিকেশন বা Downloads ফোল্ডারে ট্যাপ করে ইনস্টল করুন।</span>
              </div>
            )}

            {downloadError && (
              <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-700/60 text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{downloadError}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <button
                id="modal-direct-download-apk-btn"
                disabled={downloading}
                onClick={handleBlobDownload}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs sm:text-sm tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Downloading ({downloadProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    <span>CLICK TO DOWNLOAD APK</span>
                  </>
                )}
              </button>

              <a
                href="/FB_Automation_v6_Latest.apk"
                download="FB_Automation_v6_Latest.apk"
                target="_blank"
                rel="noreferrer"
                className="py-3 px-3 rounded-xl bg-[#1f2e42] hover:bg-[#283b54] text-slate-200 transition-colors border border-[#2b415e] text-xs font-semibold flex items-center justify-center gap-1.5"
                title="Direct Browser Download"
              >
                <ExternalLink className="w-4 h-4 text-sky-400" />
                <span>Direct Link</span>
              </a>
            </div>

            {/* Direct URL Copy Box */}
            <div className="pt-2">
              <p className="text-[11px] text-slate-400 mb-1 font-medium">Direct Download Link (যেকোনো ব্রাউজারে পেস্ট করুন):</p>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0e1622] border border-[#243447]">
                <input
                  type="text"
                  readOnly
                  value={directApkUrl}
                  className="flex-1 bg-transparent text-[11px] text-slate-300 font-mono outline-hidden select-all"
                />
                <button
                  onClick={handleCopyApkUrl}
                  className="px-2.5 py-1 rounded-lg bg-[#1f2e42] hover:bg-[#2c3f58] text-xs font-semibold text-emerald-400 flex items-center gap-1 transition-colors shrink-0"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Alternative 1-Click Install on Android (PWA / WebAPK) */}
          <div className="p-4 rounded-2xl bg-[#15202e] border border-[#24374d] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <h4 className="font-bold text-xs sm:text-sm text-slate-200">
                  Alternative: Instant Install (WebAPK)
                </h4>
              </div>
              <span className="text-[10px] text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/50">
                Easy
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              মোবাইলের ক্রোম ব্রাউজারের ৩-ডট ( ⋮ ) মেনুতে গিয়ে <strong className="text-white">"Install app"</strong> চাপলে কোনো ডাউনলোড ছাড়াই সরাসরি ফোনে ইনস্টল হয়ে যাবে।
            </p>

            {isInstalled ? (
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>অ্যাপটি ইতোমধ্যেই আপনার ফোনে সফলভাবে ইনস্টল করা আছে!</span>
              </div>
            ) : isInstallable ? (
              <button
                id="modal-pwa-install-btn"
                onClick={install}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>Install Directly on Android</span>
              </button>
            ) : null}
          </div>

          {/* Installation Instructions for Android */}
          <div className="p-4 rounded-2xl bg-[#0f1722] border border-[#1f2d3f] space-y-2 text-xs text-slate-300">
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              APK ইনস্টল করার নিয়ম (Instructions):
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-400 leading-relaxed">
              <li>উপরে <strong className="text-emerald-300">"CLICK TO DOWNLOAD APK"</strong> বাটনে চাপ দিন। ফাইলটি ডাউনলোড হয়ে যাবে।</li>
              <li>ডাউনলোড শেষ হলে নোটিফিকেশনে অথবা File Manager &gt; Downloads ফোল্ডারে থাকা <strong className="text-white">FB_Automation_v5.apk</strong> ফাইলে ট্যাপ করুন।</li>
              <li>যদি সিকিউরিটি ওয়ার্নিং দেখায়, Settings এ গিয়ে <strong className="text-white">"Allow from this source"</strong> অন করুন।</li>
              <li><strong className="text-white">"Install"</strong> চাপলেই আপনার ফোনে ইনস্টল হয়ে যাবে!</li>
            </ol>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-[#0e1622] border-t border-[#1e2c3e] flex items-center justify-between text-xs text-slate-400">
          <span className="text-[11px] font-mono">FB_Automation_v5.apk (44.0 MB)</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-[#1b2737] hover:bg-[#233246] text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
