import React from 'react';
import { Key, ShieldCheck, CheckCircle2, RefreshCw, Facebook, ExternalLink, Copy } from 'lucide-react';
import { UserProfile, FacebookPage } from '../types';

interface TokensViewProps {
  userProfile: UserProfile | null;
  onOpenFbLogin: () => void;
  pages: FacebookPage[];
}

export const TokensView: React.FC<TokensViewProps> = ({
  userProfile,
  onOpenFbLogin,
  pages,
}) => {
  return (
    <div className="space-y-4 max-w-xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center gap-3 pt-1">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
          <Key className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-black text-white tracking-wide uppercase">
            TOKENS & FB LOGIN
          </h2>
          <p className="text-xs text-slate-400">
            Facebook Authentication & Access Permissions
          </p>
        </div>
      </div>

      {/* Connection Card */}
      <div className="p-5 rounded-2xl bg-[#141e2b] border border-[#202f43] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Facebook className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Facebook Account</h3>
              <p className="text-xs text-slate-400">
                {userProfile?.isValidated
                  ? `Connected as ${userProfile.name}`
                  : 'Not Connected'}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenFbLogin}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
          >
            {userProfile?.isValidated ? 'Manage Token' : 'Facebook Login'}
          </button>
        </div>

        {userProfile?.isValidated && (
          <div className="p-3.5 rounded-xl bg-[#0f1722] border border-[#1e2c3e] space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Account ID:</span>
              <span className="font-mono text-white">{userProfile.id}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Token Status:</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active & Validated
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Connected Pages:</span>
              <span className="font-mono text-sky-400 font-bold">{pages.length} Pages</span>
            </div>
          </div>
        )}
      </div>

      {/* Permissions Breakdown */}
      <div className="p-5 rounded-2xl bg-[#141e2b] border border-[#202f43] space-y-3 text-xs">
        <h3 className="font-bold text-slate-200 uppercase tracking-wider text-xs">
          Required Meta Graph API Permissions
        </h3>
        <div className="space-y-2 text-slate-300">
          <div className="p-2.5 rounded-xl bg-[#0f1722] flex items-center justify-between">
            <span className="font-mono text-sky-300">pages_show_list</span>
            <span className="text-[11px] text-emerald-400">✓ Granted</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0f1722] flex items-center justify-between">
            <span className="font-mono text-sky-300">pages_read_engagement</span>
            <span className="text-[11px] text-emerald-400">✓ Granted</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0f1722] flex items-center justify-between">
            <span className="font-mono text-sky-300">pages_manage_posts</span>
            <span className="text-[11px] text-emerald-400">✓ Granted</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0f1722] flex items-center justify-between">
            <span className="font-mono text-sky-300">publish_video</span>
            <span className="text-[11px] text-emerald-400">✓ Granted</span>
          </div>
        </div>
      </div>
    </div>
  );
};
