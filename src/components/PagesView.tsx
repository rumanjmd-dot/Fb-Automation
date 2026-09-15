import React, { useState } from 'react';
import { Folder, Search, Check, ExternalLink, Sparkles, Plus, Key } from 'lucide-react';
import { FacebookPage } from '../types';

interface PagesViewProps {
  pages: FacebookPage[];
  onTogglePage: (id: string) => void;
  onNavigateToAutomation: () => void;
  onOpenFbLogin: () => void;
}

export const PagesView: React.FC<PagesViewProps> = ({
  pages,
  onTogglePage,
  onNavigateToAutomation,
  onOpenFbLogin,
}) => {
  const [search, setSearch] = useState('');

  const filtered = pages.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 max-w-xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
            <Folder className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-wide uppercase">
              PAGES
            </h2>
            <p className="text-xs text-slate-400">
              {pages.length} Connected Facebook Pages
            </p>
          </div>
        </div>

        <button
          onClick={onOpenFbLogin}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1d2a3c] hover:bg-[#25374e] text-xs font-semibold text-sky-400 border border-[#2b3e56] transition-colors"
        >
          <Key className="w-3.5 h-3.5" />
          Sync Pages
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search page by name or category..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#141e2b] border border-[#202f43] text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-sky-500"
        />
      </div>

      {/* Page List */}
      <div className="space-y-2.5">
        {pages.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#141e2b] border border-[#202f43] text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center">
              <Folder className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">কোন পেজ যুক্ত নেই (No Pages Connected)</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                ফেসবুক এক্সেস টোকেন দিয়ে লগইন করুন। আপনার একাউন্টের সব আসল ফেসবুক পেজ এখানে স্বয়ংক্রিয়ভাবে লোড হবে।
              </p>
            </div>
            <button
              onClick={onOpenFbLogin}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
            >
              Connect Facebook Token
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[#141e2b] border border-[#202f43] text-center text-xs text-slate-400">
            "{search}" নামের কোনো পেজ খুঁজে পাওয়া যায়নি।
          </div>
        ) : (
          filtered.map((page) => (
            <div
              key={page.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                page.isSelected
                  ? 'bg-[#182638] border-sky-500/40 shadow-xs'
                  : 'bg-[#141e2b] border-[#202f43] hover:bg-[#182333]'
              }`}
            >
              <div
                onClick={() => onTogglePage(page.id)}
                className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-colors ${
                    page.isSelected
                      ? 'bg-sky-500 border-sky-500 text-slate-950'
                      : 'border-slate-500 bg-[#0e1622]'
                  }`}
                >
                  {page.isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                {page.avatarUrl && (
                  <img
                    src={page.avatarUrl}
                    alt={page.name}
                    className="w-10 h-10 rounded-xl object-cover border border-[#2c3d52] shrink-0"
                    referrerPolicy="no-referrer"
                  />
                )}

                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-white truncate">
                    {page.name}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {page.followers.toLocaleString()} followers
                    {page.category ? ` • ${page.category}` : ''}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    ID: {page.id}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!page.isSelected) onTogglePage(page.id);
                  onNavigateToAutomation();
                }}
                className="p-2 rounded-xl bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border border-sky-500/20 transition-colors shrink-0"
                title="Publish to this page"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
