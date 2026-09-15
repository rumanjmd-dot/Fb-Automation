import React from 'react';
import {
  LayoutDashboard,
  Flag,
  PlaySquare,
  CheckCircle2,
  CheckCheck,
  AlertCircle,
  Trash2,
  Sparkles,
  Key,
  ChevronRight,
  Download,
  Smartphone,
} from 'lucide-react';
import { FacebookPage, MediaItem, UploadLogItem, UserProfile } from '../types';

interface DashboardViewProps {
  pages: FacebookPage[];
  mediaList: MediaItem[];
  logs: UploadLogItem[];
  userProfile: UserProfile | null;
  onNavigate: (view: any) => void;
  onOpenFbLogin: () => void;
  onOpenApkModal: () => void;
  successfulOps: number;
  failedOps: number;
  deletedOps: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  pages,
  mediaList,
  logs,
  userProfile,
  onNavigate,
  onOpenFbLogin,
  onOpenApkModal,
  successfulOps,
  failedOps,
  deletedOps,
}) => {
  const selectedMediaCount = mediaList.length;

  return (
    <div className="space-y-4 max-w-xl mx-auto pb-10">
      {/* Dashboard Section Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#17263c] border border-[#233854] flex items-center justify-center text-sky-400 shadow-inner">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-wide flex items-center gap-2">
              DASHBOARD
            </h2>
            <p className="text-xs text-slate-400">Overview</p>
          </div>
        </div>

        {/* Quick Launch Automation button */}
        <button
          id="dash-launch-automation-btn"
          onClick={() => onNavigate('automation')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-semibold hover:bg-sky-500/30 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Automation</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Direct Android APK Download Banner */}
      <div
        id="dash-apk-banner"
        onClick={onOpenApkModal}
        className="p-3.5 rounded-2xl bg-gradient-to-r from-[#112423] to-[#121c29] border border-emerald-500/40 hover:border-emerald-400/80 transition-all cursor-pointer shadow-md group flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
            <Download className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
                Android APK Available
              </h4>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-900 text-emerald-300 font-mono">
                v5.0.0 • 55 MB
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              Download FB_Automation_v5.apk (55 MB) or Install directly on your phone
            </p>
          </div>
        </div>

        <button
          id="dash-apk-download-cta-btn"
          onClick={(e) => {
            e.stopPropagation();
            onOpenApkModal();
          }}
          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs tracking-wider uppercase transition-colors shrink-0 flex items-center gap-1.5"
        >
          <span>Get APK</span>
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>

      <p className="text-xs font-medium text-slate-400 pt-1">Quick overview</p>

      {/* Grid of Stat Cards matching Screenshot 7 */}
      <div className="space-y-2.5">
        {/* Card 1: Pages */}
        <div
          id="stat-pages"
          onClick={() => onNavigate('pages')}
          className="flex items-center gap-4 p-4 rounded-2xl bg-[#16202d] border border-[#223145] text-white hover:bg-[#1a2636] transition-colors cursor-pointer"
        >
          <div className="p-2.5 rounded-xl bg-[#1d2a3c] text-sky-400">
            <Flag className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-white font-mono">{pages.length}</div>
            <div className="text-xs text-slate-400">Pages</div>
          </div>
        </div>

        {/* Card 2: Loaded Content */}
        <div
          id="stat-loaded-content"
          onClick={() => onNavigate('automation')}
          className="flex items-center gap-4 p-4 rounded-2xl bg-[#16202d] border border-[#223145] text-white hover:bg-[#1a2636] transition-colors cursor-pointer"
        >
          <div className="p-2.5 rounded-xl bg-[#1d2a3c] text-blue-400">
            <PlaySquare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-white font-mono">{mediaList.length}</div>
            <div className="text-xs text-slate-400">Loaded Content</div>
          </div>
        </div>

        {/* Card 3: Selected Content */}
        <div
          id="stat-selected-content"
          className="flex items-center gap-4 p-4 rounded-2xl bg-[#16202d] border border-[#223145] text-white"
        >
          <div className="p-2.5 rounded-xl bg-[#1d2a3c] text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-white font-mono">{selectedMediaCount}</div>
            <div className="text-xs text-slate-400">Selected Content</div>
          </div>
        </div>

        {/* Card 4: Successful Operations */}
        <div
          id="stat-successful-ops"
          className="flex items-center gap-4 p-4 rounded-2xl bg-[#16202d] border border-[#223145] text-white"
        >
          <div className="p-2.5 rounded-xl bg-[#1d2a3c] text-emerald-400">
            <CheckCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-white font-mono">{successfulOps}</div>
            <div className="text-xs text-slate-400">Successful Operations</div>
          </div>
        </div>

        {/* Card 5: Failed Operations */}
        <div
          id="stat-failed-ops"
          className="flex items-center gap-4 p-4 rounded-2xl bg-[#16202d] border border-[#223145] text-white"
        >
          <div className="p-2.5 rounded-xl bg-[#1d2a3c] text-amber-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-white font-mono">{failedOps}</div>
            <div className="text-xs text-slate-400">Failed Operations</div>
          </div>
        </div>

        {/* Card 6: Deleted */}
        <div
          id="stat-deleted"
          className="flex items-center gap-4 p-4 rounded-2xl bg-[#16202d] border border-[#223145] text-white"
        >
          <div className="p-2.5 rounded-xl bg-[#1d2a3c] text-slate-400">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-white font-mono">{deletedOps}</div>
            <div className="text-xs text-slate-400">Deleted</div>
          </div>
        </div>
      </div>

      {/* Connection prompt if not connected */}
      {!userProfile?.isValidated && (
        <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-800/40 flex items-center justify-between gap-3">
          <div className="text-xs">
            <p className="font-semibold text-blue-300">Facebook একাউন্ট কানেক্ট করুন</p>
            <p className="text-slate-400 text-[11px]">
              আপনার আসল পেজ ও অটোমেশন চালু করতে ফেসবুক টোকেন যুক্ত করুন
            </p>
          </div>
          <button
            onClick={onOpenFbLogin}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 transition-colors"
          >
            <Key className="w-3.5 h-3.5" />
            Connect
          </button>
        </div>
      )}

      {/* DASHBOARD LOG Panel matching Screenshot 7 */}
      <div className="mt-4 p-5 rounded-2xl bg-[#16202d] border border-[#223145] space-y-3">
        <h3 className="text-xs font-bold text-slate-300 tracking-wider uppercase">
          DASHBOARD LOG
        </h3>

        <div className="p-3.5 rounded-xl bg-[#0f1722] border border-[#1d2a3b] font-mono text-xs text-slate-300 space-y-1.5 min-h-[120px] max-h-[220px] overflow-y-auto">
          <p className="text-slate-400">Application ready.</p>
          {logs.length > 0 ? (
            logs.map((log) => (
              <p
                key={log.id}
                className={`leading-relaxed ${
                  log.type === 'success'
                    ? 'text-emerald-400'
                    : log.type === 'error'
                    ? 'text-red-400'
                    : log.type === 'warning'
                    ? 'text-amber-400'
                    : 'text-slate-300'
                }`}
              >
                <span className="text-slate-500">[{log.timestamp}]</span> {log.text}
              </p>
            ))
          ) : (
            <>
              <p className="text-emerald-400">
                <span className="text-slate-500">[23:36:38]</span> ✓ User token validated: me
              </p>
              <p className="text-emerald-400">
                <span className="text-slate-500">[23:36:40]</span> ✓ Fetched {pages.length} Page(s) with Page Access
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
