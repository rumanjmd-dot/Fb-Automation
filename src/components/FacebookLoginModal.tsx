import React, { useState } from 'react';
import { X, Key, CheckCircle2, AlertCircle, RefreshCw, ExternalLink, ShieldCheck, Copy, Check, Facebook } from 'lucide-react';
import { UserProfile, FacebookPage } from '../types';
import { fetchFacebookUserProfile, fetchFacebookPages } from '../services/facebookService';

interface FacebookLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  onUpdateProfile: (profile: UserProfile | null) => void;
  onUpdatePages: (pages: FacebookPage[]) => void;
  onAddLog: (text: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const FacebookLoginModal: React.FC<FacebookLoginModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
  onUpdatePages,
  onAddLog,
}) => {
  const [tokenInput, setTokenInput] = useState(userProfile?.userToken || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showHelper, setShowHelper] = useState(false);
  const [copiedHelp, setCopiedHelp] = useState(false);

  if (!isOpen) return null;

  const handleValidateAndConnect = async (tokenToUse?: string) => {
    const token = (tokenToUse || tokenInput).trim();
    if (!token) {
      setErrorMsg('অনুগ্রহ করে আপনার Facebook Access Token দিন (Please provide Facebook User Access Token)');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Fetch user profile
      const profile = await fetchFacebookUserProfile(token);

      // 2. Fetch pages
      const pages = await fetchFacebookPages(token);

      onUpdateProfile(profile);
      if (pages.length > 0) {
        onUpdatePages(pages);
        setSuccessMsg(`সফলভাবে লগইন হয়েছে! ${profile.name} হিসেবে সংযুক্ত এবং ${pages.length} টি আসল পেজ লোড হয়েছে।`);
        onAddLog(`✓ Facebook account connected: ${profile.name} (${profile.id})`, 'success');
        onAddLog(`✓ Fetched ${pages.length} Real Facebook Page(s) with Page Access`, 'success');
      } else {
        // Connected but no pages found on this account, retain or blend defaults
        setSuccessMsg(`সংযুক্ত হয়েছে! কিন্তু কোনো পেজ পাওয়া যায়নি।`);
        onAddLog(`✓ Facebook account connected: ${profile.name}`, 'info');
      }

      // Save token to localStorage for persistence
      localStorage.setItem('fb_user_token', token);
    } catch (err: any) {
      setErrorMsg(`যাচাইকরণ ব্যর্থ হয়েছে: ${err.message || 'Invalid Token'}`);
      onAddLog(`✕ Facebook token validation error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    onUpdateProfile(null);
    localStorage.removeItem('fb_user_token');
    setTokenInput('');
    setSuccessMsg('ফেসবুক একাউন্ট ডিসকানেক্ট করা হয়েছে।');
    onAddLog('ℹ Facebook account disconnected', 'info');
  };

  const copyPermissionScope = () => {
    navigator.clipboard.writeText('pages_show_list, pages_read_engagement, pages_manage_posts, publish_video');
    setCopiedHelp(true);
    setTimeout(() => setCopiedHelp(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-[#141d2a] border border-[#26374c] rounded-2xl shadow-2xl overflow-hidden text-white animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-[#213045] flex items-center justify-between bg-[#111925]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Facebook className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Facebook Login & Tokens</h3>
              <p className="text-xs text-slate-400">
                ফেসবুক একাউন্ট ও পেজ কানেক্ট করুন (Real Facebook Pages)
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

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Current Status */}
          {userProfile?.isValidated ? (
            <div className="p-4 rounded-xl bg-[#192738] border border-emerald-500/30 space-y-3">
              <div className="flex items-center gap-3">
                {userProfile.avatarUrl ? (
                  <img
                    src={userProfile.avatarUrl}
                    alt={userProfile.name}
                    className="w-12 h-12 rounded-full border-2 border-emerald-400 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-lg font-bold">
                    {userProfile.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-white text-sm">{userProfile.name}</h4>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-xs text-slate-400">ID: {userProfile.id}</p>
                  <p className="text-[11px] text-emerald-400">✓ Token Validated & Active</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-[#23344b]">
                <button
                  onClick={() => handleValidateAndConnect(userProfile.userToken)}
                  disabled={loading}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-[#203248] hover:bg-[#283e5a] text-xs font-medium text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Re-fetch Pages
                </button>
                <button
                  onClick={handleDisconnect}
                  className="py-1.5 px-3 rounded-lg bg-red-950/40 text-red-300 border border-red-800/40 hover:bg-red-900/60 text-xs font-medium transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-[#172230] border border-[#27394f] text-xs text-slate-300 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-200">আপনার আসল ফেসবুক একাউন্ট কানেক্ট করুন</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  নিচে আপনার Facebook User Access Token দিলে স্বয়ংক্রিয়ভাবে আপনার আইডি এবং সব কয়টি পেজ অটোমেশনে যুক্ত হবে।
                </p>
              </div>
            </div>
          )}

          {/* Token Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-sky-400" />
                Facebook User Access Token
              </label>
              <button
                type="button"
                onClick={() => setShowHelper(!showHelper)}
                className="text-[11px] text-sky-400 hover:underline flex items-center gap-1"
              >
                টোকেন কীভাবে পাবেন?
              </button>
            </div>

            <textarea
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="EAAGNO4... পেস্ট করুন আপনার Facebook User Token"
              rows={3}
              className="w-full px-3 py-2 rounded-xl bg-[#0f1722] border border-[#26374c] text-white text-xs font-mono placeholder:text-slate-500 focus:outline-hidden focus:border-sky-500 transition-colors resize-none"
            />
          </div>

          {/* Helper Guide */}
          {showHelper && (
            <div className="p-3.5 rounded-xl bg-[#0d141e] border border-[#243346] text-xs space-y-2 text-slate-300">
              <p className="font-semibold text-sky-300">কীভাবে টোকেন তৈরি করবেন (১ মিনিট সময়):</p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400">
                <li>
                  <a
                    href="https://developers.facebook.com/tools/explorer/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 underline inline-flex items-center gap-1"
                  >
                    Meta Graph API Explorer <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  এ যান।
                </li>
                <li>আপনার Facebook আইডি দিয়ে লগইন করুন।</li>
                <li>
                  Permissions সেকশন থেকে নিচের অনুমতিগুলো টিক দিন:{' '}
                  <span className="font-mono text-amber-300">
                    pages_show_list, pages_read_engagement, pages_manage_posts
                  </span>
                </li>
                <li>Generate Access Token এ ক্লিক করে অনুমতি দিন এবং প্রাপ্ত টোকেনটি এখানে পেস্ট করুন।</li>
              </ol>

              <button
                type="button"
                onClick={copyPermissionScope}
                className="text-[11px] px-2.5 py-1 rounded bg-[#1a2738] text-slate-200 border border-[#2a3c53] flex items-center gap-1 hover:bg-[#223348]"
              >
                {copiedHelp ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                Copy Permissions String
              </button>
            </div>
          )}

          {/* Alerts */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              id="validate-token-btn"
              onClick={() => handleValidateAndConnect()}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  যাচাই করা হচ্ছে (Validating)...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  Connect Facebook & Fetch Pages
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#0f1722] border-t border-[#1f2d3f] flex items-center justify-between text-xs text-slate-400">
          <span className="text-[11px]">Meta Graph API v19.0 Secured</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-[#192435] hover:bg-[#223247] text-slate-200 transition-colors"
          >
            বন্ধ করুন (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
