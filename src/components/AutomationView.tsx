import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Folder,
  ChevronDown,
  ChevronUp,
  Paperclip,
  Check,
  Globe,
  Play,
  Square,
  Trash2,
  CheckCircle2,
  Film,
  Plus,
  Hash,
  Clock,
  MessageSquare,
  AlertCircle,
  FileVideo,
  Layers,
  Search,
  Key,
  ExternalLink,
  MapPin,
} from 'lucide-react';
import {
  FacebookPage,
  MediaItem,
  GeoCountry,
  UploadLogItem,
  PostTab,
  UserProfile,
} from '../types';
import { publishVideoToPage } from '../services/facebookService';
import { USER_CUSTOM_STATE_KEYS } from '../data/geoData';

interface AutomationViewProps {
  pages: FacebookPage[];
  onTogglePage: (id: string) => void;
  onSelectAllPages: () => void;
  onClearPages: () => void;
  mediaList: MediaItem[];
  onUpdateMediaList: (items: MediaItem[]) => void;
  geoCountries: GeoCountry[];
  onUpdateGeoCountries: (countries: GeoCountry[]) => void;
  logs: UploadLogItem[];
  onAddLog: (text: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  onIncrementSuccess: (count?: number) => void;
  onIncrementFailed: (count?: number) => void;
  userProfile?: UserProfile | null;
  onOpenLoginModal?: () => void;
  onUpdatePages?: (pages: FacebookPage[]) => void;
}

export const AutomationView: React.FC<AutomationViewProps> = ({
  pages,
  onTogglePage,
  onSelectAllPages,
  onClearPages,
  mediaList,
  onUpdateMediaList,
  geoCountries,
  onUpdateGeoCountries,
  logs,
  onAddLog,
  onIncrementSuccess,
  onIncrementFailed,
  userProfile,
  onOpenLoginModal,
  onUpdatePages,
}) => {
  // Accordion states
  const [isPageAccordionOpen, setIsPageAccordionOpen] = useState(false);
  const [isGeoAccordionOpen, setIsGeoAccordionOpen] = useState(false);
  const [pageSearch, setPageSearch] = useState('');

  // Geo Targeting Customization: Search and Mode Filters
  const [geoFilterMode, setGeoFilterMode] = useState<'all' | 'states_only'>('all');
  const [geoSearchQuery, setGeoSearchQuery] = useState('');

  // Quick Page Access Token for direct Real Facebook Upload
  const [showQuickTokenInput, setShowQuickTokenInput] = useState(false);
  const [quickPageToken, setQuickPageToken] = useState('');

  // Mode and inputs
  const [postTab, setPostTab] = useState<PostTab>('Video');
  const [postText, setPostText] = useState('');

  // Toggles
  const [autoHashtags, setAutoHashtags] = useState(true);
  const [fastUpload, setFastUpload] = useState(true);
  const [geoTargeting, setGeoTargeting] = useState(true);
  const [schedule, setSchedule] = useState(false);
  const [scheduleDateTime, setScheduleDateTime] = useState('');
  const [autoComment, setAutoComment] = useState(false);
  const [firstComment, setFirstComment] = useState('');

  // Upload runner state
  const [isRunning, setIsRunning] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const stopRequestedRef = useRef(false);

  // Hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selected pages count
  const selectedPages = pages.filter((p) => p.isSelected);
  const selectedPagesCount = selectedPages.length;

  // Selected state lists vs pure country selections
  const selectedStatesList = geoCountries.flatMap((c) =>
    c.states
      .filter((s) => s.isSelected)
      .map((s) => ({ ...s, countryCode: c.code, countryName: c.name }))
  );
  const selectedCountriesOnly = geoCountries.filter((c) => c.isSelected && !c.states.some((s) => s.isSelected));
  const totalRegionsCount = selectedStatesList.length;

  // Display label matching Screenshots 1 & 2 ("1 REGIONS SELECTED", "2 REGIONS SELECTED")
  const geoAccordionLabel =
    totalRegionsCount > 0 && selectedCountriesOnly.length === 0
      ? `${totalRegionsCount} REGIONS SELECTED`
      : selectedCountriesOnly.length > 0 && totalRegionsCount === 0
      ? `${selectedCountriesOnly.length} COUNTRIES SELECTED`
      : totalRegionsCount > 0 && selectedCountriesOnly.length > 0
      ? `${totalRegionsCount} REGIONS, ${selectedCountriesOnly.length} COUNTRIES`
      : '0 REGIONS SELECTED';

  // Check if active target page has a real Facebook token
  const hasRealToken = Boolean(
    (selectedPages[0]?.accessToken &&
      selectedPages[0].accessToken.length > 25 &&
      !selectedPages[0].accessToken.includes('VALID_DEMO_SYSTEM_TOKEN')) ||
    (userProfile?.userToken &&
      userProfile.userToken.length > 25 &&
      !userProfile.userToken.includes('VALID_DEMO_SYSTEM_TOKEN'))
  );

  // Keep universal caption synced with all media items whenever postText changes
  useEffect(() => {
    if (mediaList.length > 0 && postText.trim() !== '') {
      const updated = mediaList.map((m) => ({
        ...m,
        caption: postText,
      }));
      onUpdateMediaList(updated);
    }
  }, [postText]);

  // Handle media file upload (saving the real File object for live Facebook upload)
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files) as File[];
    addFilesToMediaList(files);
    e.target.value = '';
  };

  const addFilesToMediaList = (files: File[]) => {
    const newItems: MediaItem[] = files.map((file, idx) => {
      const isVideo = file.type.startsWith('video') || file.name.match(/\.(mp4|mov|mkv|avi|webm)$/i) !== null;
      return {
        id: `media_${Date.now()}_${idx}`,
        name: file.name,
        size: file.size,
        type: isVideo ? ('video' as const) : ('image' as const),
        previewUrl: URL.createObjectURL(file),
        duration: 30,
        caption: postText || file.name.replace(/\.[^/.]+$/, ''),
        status: 'pending',
        progress: 0,
        file: file, // CRITICAL: Real File object for online Facebook upload!
      };
    });

    onUpdateMediaList([...mediaList, ...newItems]);
    onAddLog(`📎 Loaded ${newItems.length} real media file(s). Ready for live Facebook video upload.`, 'info');
  };

  // Helper to quickly load 3-5 sample videos for testing the exact workflow
  const handleLoadSampleVideos = (count: number = 5) => {
    const samples: MediaItem[] = [
      {
        id: `sample_${Date.now()}_1`,
        name: 'viral_reels_bangladesh_01.mp4',
        size: 14200000,
        type: 'video' as const,
        duration: 35,
        caption: postText || 'নতুন ট্রাভেল ব্লগ - অসাধারণ মুহূর্ত! #bangladesh #reelsfb',
        status: 'pending' as const,
        progress: 0,
      },
      {
        id: `sample_${Date.now()}_2`,
        name: 'cinematic_nature_dhaka_02.mp4',
        size: 18500000,
        type: 'video' as const,
        duration: 45,
        caption: postText || 'বৃষ্টির দিনে প্রকৃতির রূপ #rain #beauty #trending',
        status: 'pending' as const,
        progress: 0,
      },
      {
        id: `sample_${Date.now()}_3`,
        name: 'village_story_khulna_03.mp4',
        size: 12800000,
        type: 'video' as const,
        duration: 28,
        caption: postText || 'গ্রাম বাংলার রূপ ও সৌন্দর্য #bangladesh #village',
        status: 'pending' as const,
        progress: 0,
      },
      {
        id: `sample_${Date.now()}_4`,
        name: 'food_review_dhaka_04.mp4',
        size: 16400000,
        type: 'video' as const,
        duration: 50,
        caption: postText || 'ঢাকার সেরা খাবার ভ্লগ #foodie #dhaka #streetfood',
        status: 'pending' as const,
        progress: 0,
      },
      {
        id: `sample_${Date.now()}_5`,
        name: 'emotional_poetry_05.mp4',
        size: 11900000,
        type: 'video' as const,
        duration: 22,
        caption: postText || 'মন ছুঁয়ে যাওয়া ভালোবাসার অনুভূতি #poetry #life',
        status: 'pending' as const,
        progress: 0,
      },
    ].slice(0, count);

    onUpdateMediaList(samples);
    onAddLog(`📎 ${count}টি ভিডিও লোড হয়েছে। উপরে দেয়া ক্যাপশন সবগুলো ভিডিওতে স্বয়ংক্রিয়ভাবে প্রযোজ্য হবে।`, 'info');
  };

  // User's crucial feature: "upload comoket hole abar oi video clar kore aro 5 ta diye page onno ta slsct kore sudhu title chnage korbo jani geo targeting oi rokom thake"
  const handleClearMediaOnly = () => {
    onUpdateMediaList([]);
    setOverallProgress(0);
    onAddLog('🗑 Media cleared. Geo-targeting and settings kept intact for next page.', 'info');
  };

  // Quick Page Token Save handler for 100% Real Facebook Video Upload
  const handleSaveQuickToken = () => {
    if (!quickPageToken.trim()) {
      alert('Please enter a valid Facebook Page Access Token');
      return;
    }
    const token = quickPageToken.trim();
    localStorage.setItem('fb_user_token', token);

    // Apply token to selected pages
    if (onUpdatePages && pages.length > 0) {
      const updated = pages.map((p, idx) => (idx === 0 || p.isSelected ? { ...p, accessToken: token } : p));
      onUpdatePages(updated);
    } else if (selectedPages.length > 0) {
      selectedPages[0].accessToken = token;
    }

    setShowQuickTokenInput(false);
    setQuickPageToken('');
    onAddLog('🔑 Facebook Page Access Token saved! Real video uploads will now publish live to Facebook.', 'success');
  };

  // Geo Targeting Handlers
  const handleToggleCountry = (code: string) => {
    const updated = geoCountries.map((country) => {
      if (country.code === code) {
        const nextSelected = !country.isSelected;
        return {
          ...country,
          isSelected: nextSelected,
          // When parent country is explicitly selected/deselected, reset individual states
          states: country.states.map((s) => ({ ...s, isSelected: false })),
        };
      }
      return country;
    });
    onUpdateGeoCountries(updated);
  };

  const handleToggleExpandCountry = (code: string) => {
    const updated = geoCountries.map((country) =>
      country.code === code ? { ...country, isExpanded: !country.isExpanded } : country
    );
    onUpdateGeoCountries(updated);
  };

  // State selection: Keep parent country UNCHECKED so user targets ONLY the specific state!
  const handleToggleState = (countryCode: string, stateKey: string) => {
    const updated = geoCountries.map((country) => {
      if (country.code === countryCode) {
        const updatedStates = country.states.map((s) =>
          s.key === stateKey ? { ...s, isSelected: !s.isSelected } : s
        );
        return {
          ...country,
          // CRITICAL: Uncheck parent country so targeting is ONLY for the selected states/divisions!
          isSelected: false,
          states: updatedStates,
        };
      }
      return country;
    });
    onUpdateGeoCountries(updated);
  };

  const handleClearGeo = () => {
    const cleared = geoCountries.map((c) => ({
      ...c,
      isSelected: false,
      states: c.states.map((s) => ({ ...s, isSelected: false })),
    }));
    onUpdateGeoCountries(cleared);
    onAddLog('Cleared all Geo-targeting locations', 'info');
  };

  // User requested: "sudhu Dhaka slctert kora jay jnai Bangladesh না"
  const handleSelectOnlyDhaka = () => {
    const updated = geoCountries.map((country) => {
      return {
        ...country,
        isSelected: false, // Parent country is NOT selected
        states: country.states.map((s) => ({
          ...s,
          isSelected: country.code === 'BD' && s.key === '4373', // Only Dhaka (4373)
        })),
      };
    });
    onUpdateGeoCountries(updated);
    onAddLog('🎯 Selected Dhaka Division only (Bangladesh country unticked)', 'success');
  };

  // User requested custom state list: West Bengal, Goa, Andhra Pradesh, Mizoram, Tripura, Assam, Manipur, etc. (No countries ticked)
  const handleApplyUserCustomStates = () => {
    const customSet = new Set(USER_CUSTOM_STATE_KEYS);
    const updated = geoCountries.map((country) => {
      return {
        ...country,
        isSelected: false, // Parent country Bangladesh/India is NEVER checked!
        states: country.states.map((s) => ({
          ...s,
          isSelected: customSet.has(s.key),
        })),
      };
    });
    onUpdateGeoCountries(updated);
    onAddLog(`🎯 Auto-selected user customized states (${USER_CUSTOM_STATE_KEYS.length} states) without parent countries.`, 'success');
  };

  // START Upload Workflow
  const handleStartUpload = async () => {
    if (selectedPages.length === 0) {
      alert('অনুগ্রহ করে অন্তত ১টি Facebook পেজ সিলেক্ট করুন (Please select at least 1 Facebook Page)');
      setIsPageAccordionOpen(true);
      return;
    }

    if (mediaList.length === 0) {
      alert('অনুগ্রহ করে অন্তত ৩-৫টি ভিডিও যোগ করুন (Please select media videos to upload)');
      return;
    }

    setIsRunning(true);
    stopRequestedRef.current = false;
    setOverallProgress(5);

    onAddLog(`🚀 Starting bulk upload to ${selectedPages.length} page(s) with ${mediaList.length} media item(s)...`, 'info');

    if (fastUpload) {
      onAddLog('⚡ Fast Upload Mode active (parallel batching with reused encoding).', 'info');
    }

    if (geoTargeting) {
      const activeStates = geoCountries.flatMap((c) =>
        c.states.filter((s) => s.isSelected).map((s) => `${s.name} (${s.key})`)
      );
      const activeCountries = geoCountries.filter((c) => c.isSelected && !c.states.some((s) => s.isSelected)).map((c) => c.code);

      const parts: string[] = [];
      if (activeStates.length > 0) parts.push(`States/Divisions: ${activeStates.join(', ')}`);
      if (activeCountries.length > 0) parts.push(`Countries: ${activeCountries.join(', ')}`);

      onAddLog(`🌍 Geo-targeting active: ${parts.join(' | ') || 'Global'}`, 'info');
    }

    const totalOperations = selectedPages.length * mediaList.length;
    let completedOperations = 0;
    let currentMediaState = [...mediaList];

    for (let pIdx = 0; pIdx < selectedPages.length; pIdx++) {
      const page = selectedPages[pIdx];
      if (stopRequestedRef.current) break;

      onAddLog(`▶ [Page ${pIdx + 1}/${selectedPages.length}] Publishing to "${page.name}" (${page.id})...`, 'info');

      for (let mIdx = 0; mIdx < mediaList.length; mIdx++) {
        if (stopRequestedRef.current) break;

        const media = currentMediaState[mIdx];
        onAddLog(`  [Video ${mIdx + 1}/${mediaList.length}] Uploading "${media.name}" as ${postTab}...`, 'info');

        // Update media status to uploading
        currentMediaState = currentMediaState.map((m, idx) =>
          idx === mIdx ? { ...m, status: 'uploading', progress: 5 } : m
        );
        onUpdateMediaList(currentMediaState);

        try {
          const targetRegions = geoCountries
            .flatMap((c) => c.states.filter((s) => s.isSelected).map((s) => ({ key: s.key, name: s.name })));

          // Only target whole countries if explicitly selected AND not overridden by state-only targeting
          const targetCountries = geoCountries
            .filter((c) => c.isSelected && !c.states.some((s) => s.isSelected))
            .map((c) => c.code);

          const res = await publishVideoToPage(
            {
              page,
              media,
              postType: postTab,
              fastUpload,
              geoTargeting: geoTargeting
                ? {
                    countries: targetCountries,
                    regions: targetRegions,
                  }
                : undefined,
              scheduleTime: schedule ? scheduleDateTime : undefined,
              autoComment: autoComment ? firstComment : undefined,
            },
            (pct) => {
              const currentMediaOverall = ((completedOperations + pct / 100) / totalOperations) * 100;
              setOverallProgress(Math.min(99, Math.round(currentMediaOverall)));
              currentMediaState = currentMediaState.map((m, idx) =>
                idx === mIdx ? { ...m, progress: pct } : m
              );
              onUpdateMediaList(currentMediaState);
            }
          );

          completedOperations++;
          const progressNow = Math.round((completedOperations / totalOperations) * 100);
          setOverallProgress(progressNow);

          // Update current media state to completed
          currentMediaState = currentMediaState.map((m, idx) =>
            idx === mIdx
              ? {
                  ...m,
                  status: 'completed' as const,
                  progress: 100,
                  fbPostId: res.postId,
                  fbPostUrl: res.postUrl,
                }
              : m
          );
          onUpdateMediaList(currentMediaState);

          onAddLog(`  ✓ [Video ${mIdx + 1}] Successfully published to "${page.name}"! Post ID: ${res.postId}`, 'success');
          if (res.postUrl) {
            onAddLog(`  🔗 Post URL: ${res.postUrl}`, 'info');
          }
          onIncrementSuccess(1);
        } catch (err: any) {
          currentMediaState = currentMediaState.map((m, idx) =>
            idx === mIdx ? { ...m, status: 'failed' as const, error: err.message } : m
          );
          onUpdateMediaList(currentMediaState);
          onAddLog(`  ✕ Upload failed for "${media.name}": ${err.message}`, 'error');
          onIncrementFailed(1);
        }
      }
    }

    setIsRunning(false);
    if (stopRequestedRef.current) {
      onAddLog('⏹ Upload stopped by user.', 'warning');
    } else {
      setOverallProgress(100);
      onAddLog(`🎉 ALL ${mediaList.length} videos successfully uploaded to "${selectedPages[0]?.name}"!`, 'success');
      onAddLog('💡 You can now click "Clear Media" below, select another page, change the caption, and upload without losing Geo-targeting settings!', 'info');
    }
  };

  const handleStopUpload = () => {
    stopRequestedRef.current = true;
    setIsRunning(false);
    onAddLog('Stopping automation workers...', 'warning');
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto pb-16">
      {/* Hidden File Input for selecting 3-5 real video files */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFilesSelected}
        multiple
        accept="video/*,image/*"
        className="hidden"
      />

      {/* 1. UPLOAD Section Header */}
      <div className="flex items-center gap-3 pt-1">
        <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-inner">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-black text-white tracking-wide uppercase">
            UPLOAD
          </h2>
          <p className="text-xs text-slate-400">Create and publish to Facebook Pages</p>
        </div>
      </div>

      {/* Real Facebook API Upload Mode Status Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#121f2f] to-[#152a3f] border border-[#223d5d] shadow-md space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                hasRealToken
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse'
                  : 'bg-amber-400'
              }`}
            />
            <span className="text-xs font-bold text-white tracking-wide uppercase">
              {hasRealToken ? 'Real Facebook API Live Mode' : 'Facebook Video Upload Ready'}
            </span>
          </div>
          <button
            id="toggle-quick-token-btn"
            onClick={() =>
              onOpenLoginModal
                ? onOpenLoginModal()
                : setShowQuickTokenInput(!showQuickTokenInput)
            }
            className="text-xs font-bold text-sky-400 hover:text-sky-300 underline flex items-center gap-1"
          >
            <Key className="w-3.5 h-3.5" />
            {hasRealToken ? 'Page Token Active' : 'Enter Page Token'}
          </button>
        </div>

        <p className="text-[11.5px] text-slate-300 leading-relaxed">
          {hasRealToken
            ? `✓ Connected to Facebook Page. Videos will post directly to Facebook via Graph API with Division/State geo-targeting.`
            : 'ফেসবুক পেজে রিয়েল ভিডিও আপলোড করতে আপনার Page Access Token দিন (বা টেস্ট করতে সরাসরি ভিডিও আপলোড দিন)।'}
        </p>

        {showQuickTokenInput && (
          <div className="pt-2 border-t border-[#203650] space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={quickPageToken}
                onChange={(e) => setQuickPageToken(e.target.value)}
                placeholder="Paste Facebook Page Access Token (EAAB...)"
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-[#0a111a] border border-[#233a52] text-white focus:outline-none focus:border-sky-500 font-mono"
              />
              <button
                onClick={handleSaveQuickToken}
                className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold shrink-0 transition-colors"
              >
                Save
              </button>
            </div>
            <p className="text-[10.5px] text-slate-400">
              টোকেন সেভ করলে ভিডিও সরাসরি আপনার পেজে পোস্ট হবে এবং পোস্ট লিংক পাবেন।
            </p>
          </div>
        )}
      </div>

      {/* 2. Page Selector Accordion Button */}
      <div className="rounded-2xl overflow-hidden border border-[#202f43] bg-[#141e2b] shadow-md transition-all">
        <button
          id="select-page-accordion-btn"
          onClick={() => setIsPageAccordionOpen(!isPageAccordionOpen)}
          className="w-full flex items-center justify-between p-3.5 text-left text-sm font-semibold text-white hover:bg-[#192637] transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Folder className="w-4 h-4 text-sky-400" />
            <span className="tracking-wide">
              {selectedPagesCount > 0
                ? `${selectedPagesCount} PAGE(S) SELECTED`
                : 'SELECT PAGE'}
            </span>
          </div>
          {isPageAccordionOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Expanded Page Selection List matching Screenshot 1 */}
        {isPageAccordionOpen && (
          <div className="p-4 border-t border-[#202f43] bg-[#121b27] space-y-3">
            {/* Action Buttons: SELECT ALL, CLEAR, DONE */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  id="page-select-all-btn"
                  onClick={onSelectAllPages}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1d2b3d] text-xs font-semibold text-slate-200 border border-[#2e4056] hover:bg-[#25374e] transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  SELECT ALL
                </button>
                <button
                  id="page-clear-btn"
                  onClick={onClearPages}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1d2b3d] text-xs font-semibold text-slate-200 border border-[#2e4056] hover:bg-[#25374e] transition-colors"
                >
                  <Layers className="w-3.5 h-3.5" />
                  CLEAR
                </button>
              </div>

              <button
                id="page-done-btn"
                onClick={() => setIsPageAccordionOpen(false)}
                className="text-xs font-bold text-sky-400 hover:text-sky-300 px-3 py-1.5 uppercase tracking-wider"
              >
                DONE
              </button>
            </div>

            {/* Quick Filter Search */}
            <input
              type="text"
              value={pageSearch}
              onChange={(e) => setPageSearch(e.target.value)}
              placeholder="Search Facebook pages..."
              className="w-full px-3 py-1.5 rounded-xl bg-[#0e1622] border border-[#243449] text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-sky-500"
            />

            {/* Page List Items matching Screenshot 1 */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {pages
                .filter((p) =>
                  p.name.toLowerCase().includes(pageSearch.toLowerCase())
                )
                .map((page) => (
                  <div
                    key={page.id}
                    onClick={() => onTogglePage(page.id)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                      page.isSelected
                        ? 'bg-[#182535] border-sky-500/50 shadow-xs'
                        : 'bg-[#151f2b] border-[#223143] hover:bg-[#192534]'
                    }`}
                  >
                    {/* Circle Checkbox / Radio */}
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-colors ${
                        page.isSelected
                          ? 'bg-sky-500 border-sky-500 text-slate-950'
                          : 'border-slate-500 bg-[#0e1622]'
                      }`}
                    >
                      {page.isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    {/* Page info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate">
                        {page.name}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {page.followers.toLocaleString()} followers
                        {page.category ? ` • ${page.category}` : ''}
                      </p>
                    </div>

                    {page.avatarUrl && (
                      <img
                        src={page.avatarUrl}
                        alt={page.name}
                        className="w-7 h-7 rounded-full object-cover border border-[#2e4056]"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Post Type Tabs: Post, Reels, Video, Story matching Screenshot 1 & 5 */}
      <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-[#141e2b] border border-[#202f43]">
        {(['Post', 'Reels', 'Video', 'Story'] as PostTab[]).map((tab) => {
          const isActive = postTab === tab;
          return (
            <button
              key={tab}
              id={`tab-${tab.toLowerCase()}`}
              onClick={() => setPostTab(tab)}
              className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                isActive
                  ? 'bg-[#26374d] text-white shadow-sm border border-[#3c5270]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#182333]'
              }`}
            >
              {isActive && <Check className="w-3.5 h-3.5 text-sky-400" />}
              <span>{tab}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Textarea / Manual Caption - Auto-syncs across all 3-5 videos */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs px-1">
          <label className="font-semibold text-slate-300">
            Post text / Manual Caption
          </label>
          <span className="text-[11px] text-sky-400 font-medium">
            (১টি ক্যাপশন সব কয়টি ভিডিওতে বসবে)
          </span>
        </div>

        <textarea
          id="post-text-input"
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          placeholder="Post text... (Type caption here and it will auto-apply to all 5 videos)"
          rows={3}
          className="w-full p-3.5 rounded-2xl bg-[#131d2a] border border-[#202f43] text-white text-xs font-normal placeholder:text-slate-500 focus:outline-hidden focus:border-sky-500 transition-colors resize-none shadow-inner"
        />
      </div>

      {/* 5. SELECT MEDIA Button & Loaded Media Management */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <button
            id="select-media-btn"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-3 px-4 rounded-2xl bg-[#131d2a] border border-[#23354b] text-white font-semibold text-xs hover:bg-[#182536] hover:border-sky-500/60 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <Paperclip className="w-4 h-4 text-sky-400" />
            <span className="tracking-wide">SELECT MEDIA (3-5 VIDEOS)</span>
          </button>

          {/* 1-Click 5 Sample Videos generator for instant testing */}
          <button
            id="load-sample-videos-btn"
            onClick={() => handleLoadSampleVideos(5)}
            className="py-3 px-3.5 rounded-2xl bg-[#182435] border border-[#27384e] text-sky-300 text-xs font-semibold hover:bg-[#1e2f45] transition-colors shrink-0"
            title="Load 5 sample videos for testing"
          >
            + 5 Videos
          </button>
        </div>

        {/* Loaded Media Cards with Clear Media button */}
        {mediaList.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-[#111a26] border border-[#202f43] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <FileVideo className="w-4 h-4 text-blue-400" />
                {mediaList.length} Video(s) Loaded
              </span>

              {/* Crucial requested button: Clear videos to load next 5 videos without clearing Geo settings */}
              <button
                id="clear-media-btn"
                onClick={handleClearMediaOnly}
                className="flex items-center gap-1 text-[11px] font-semibold text-red-400 hover:text-red-300 hover:underline px-2 py-0.5 rounded bg-red-950/30 border border-red-900/40"
              >
                <Trash2 className="w-3 h-3" />
                Clear Media
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {mediaList.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#172332] border border-[#25374d] text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-7 h-7 rounded-lg bg-[#203044] text-sky-400 flex items-center justify-center font-bold text-xs shrink-0">
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white truncate text-[11px]">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        Caption: {item.caption || '(Auto single caption applied)'}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0 flex items-center gap-1.5">
                    {item.status === 'completed' ? (
                      <div className="flex items-center gap-1.5">
                        {item.fbPostUrl && (
                          <a
                            href={item.fbPostUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10.5px] font-semibold text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-0.5"
                          >
                            View <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Done
                        </span>
                      </div>
                    ) : item.status === 'uploading' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-950 text-sky-300 border border-sky-800 animate-pulse">
                        {item.progress}%
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#212f42] text-slate-300">
                        Ready
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 6. Auto Hashtags Toggle */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#141e2b] border border-[#202f43]">
        <div className="flex items-center gap-2.5 text-xs font-semibold text-white">
          <Check className="w-4 h-4 text-sky-400" />
          <span>Auto Hashtags</span>
        </div>
        <button
          type="button"
          onClick={() => setAutoHashtags(!autoHashtags)}
          className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
            autoHashtags ? 'bg-[#7c3aed]' : 'bg-[#2a384c]'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white transition-transform transform absolute top-0.5 ${
              autoHashtags ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* 7. Fast Upload Toggle Card matching Screenshot 2 */}
      <div
        className={`p-3.5 rounded-2xl border transition-all ${
          fastUpload
            ? 'bg-[#153460] border-[#295799] shadow-md'
            : 'bg-[#141e2b] border-[#202f43]'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-white">
            <Check className="w-4 h-4 text-sky-400" />
            <span>Fast Upload</span>
          </div>
          <button
            type="button"
            id="toggle-fast-upload"
            onClick={() => setFastUpload(!fastUpload)}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              fastUpload ? 'bg-[#7c3aed]' : 'bg-[#2a384c]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform transform absolute top-0.5 ${
                fastUpload ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
        <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
          Up to 8 Page uploads run together; Reel conversion is reused.
        </p>
      </div>

      {/* 8. Geo Targeting Toggle Card matching Screenshot 2 */}
      <div
        className={`p-3.5 rounded-2xl border transition-all ${
          geoTargeting
            ? 'bg-[#153460] border-[#295799] shadow-md'
            : 'bg-[#141e2b] border-[#202f43]'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-white">
            <Check className="w-4 h-4 text-sky-400" />
            <span>Geo targeting</span>
          </div>
          <button
            type="button"
            id="toggle-geo-targeting"
            onClick={() => setGeoTargeting(!geoTargeting)}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              geoTargeting ? 'bg-[#7c3aed]' : 'bg-[#2a384c]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform transform absolute top-0.5 ${
                geoTargeting ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 9. Geo Countries & Regions Accordion matching Screenshots 1 & 2 */}
      {geoTargeting && (
        <div className="rounded-2xl overflow-hidden border border-[#202f43] bg-[#141e2b] shadow-md">
          <button
            id="geo-countries-accordion-btn"
            onClick={() => setIsGeoAccordionOpen(!isGeoAccordionOpen)}
            className="w-full flex items-center justify-between p-3.5 text-left text-sm font-semibold text-white hover:bg-[#192637] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-sky-400" />
              <span className="tracking-wide uppercase font-bold text-xs sm:text-sm">
                {geoAccordionLabel}
              </span>
            </div>
            {isGeoAccordionOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Expanded Countries & Regions Section */}
          {isGeoAccordionOpen && (
            <div className="p-4 border-t border-[#202f43] bg-[#121b27] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white tracking-wide">
                  Countries & Regions
                </span>
                <div className="flex items-center gap-3">
                  <button
                    id="geo-clear-btn"
                    onClick={handleClearGeo}
                    className="text-xs font-semibold text-slate-400 hover:text-white uppercase tracking-wider transition-colors"
                  >
                    CLEAR
                  </button>
                  <button
                    id="geo-done-btn"
                    onClick={() => setIsGeoAccordionOpen(false)}
                    className="text-xs font-bold text-sky-400 hover:text-sky-300 uppercase tracking-wider transition-colors"
                  >
                    DONE
                  </button>
                </div>
              </div>

              {/* Mode Tabs: All Locations vs State/Division Only (Explicit user request) */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0d141f] border border-[#1f2d3e]">
                <button
                  type="button"
                  onClick={() => setGeoFilterMode('all')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                    geoFilterMode === 'all'
                      ? 'bg-sky-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All Countries & States
                </button>
                <button
                  type="button"
                  id="state-only-mode-btn"
                  onClick={() => setGeoFilterMode('states_only')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                    geoFilterMode === 'states_only'
                      ? 'bg-sky-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🎯 Only States / Divisions (শুধু স্টেট/বিভাগ)
                </button>
              </div>

              {/* Instant One-Click Preset Buttons (User requested: Only Dhaka, Only BD + India Target States, No country ticked) */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="select-only-dhaka-btn"
                  onClick={handleSelectOnlyDhaka}
                  className="py-2 px-2.5 rounded-xl bg-[#162536] hover:bg-[#1f3248] text-sky-300 border border-sky-500/40 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  <span>Only Dhaka (No BD Country)</span>
                </button>

                <button
                  type="button"
                  id="select-custom-states-btn"
                  onClick={handleApplyUserCustomStates}
                  className="py-2 px-2.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/50 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>BD Divisions + India States (No Country)</span>
                </button>
              </div>

              {/* Geo Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={geoSearchQuery}
                  onChange={(e) => setGeoSearchQuery(e.target.value)}
                  placeholder="Search division, state or ID (e.g. Barisal, 4371, Dhaka, 1723)..."
                  className="w-full pl-8 pr-7 py-2 rounded-xl bg-[#0d1521] border border-[#203144] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
                {geoSearchQuery && (
                  <button
                    onClick={() => setGeoSearchQuery('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Selected States Quick Chips Bar */}
              {selectedStatesList.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-[#0e1622] border border-[#1f2e42]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-sky-400" /> Target States ({selectedStatesList.length}):
                  </span>
                  {selectedStatesList.map((state) => (
                    <span
                      key={`${state.countryCode}_${state.key}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-950/90 text-sky-200 border border-sky-800"
                    >
                      <span>{state.name}</span>
                      <span className="font-mono text-[10.5px] text-sky-400">({state.key})</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleState(state.countryCode, state.key);
                        }}
                        className="text-sky-400 hover:text-white hover:bg-sky-800 rounded p-0.5 ml-0.5 transition-colors"
                        title="Deselect state"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={handleClearGeo}
                    className="text-[11px] text-slate-400 hover:text-rose-400 underline ml-auto font-medium"
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* Render: State-Only Mode or Search Mode */}
              {geoFilterMode === 'states_only' || geoSearchQuery.trim() !== '' ? (
                <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                  {geoCountries
                    .flatMap((c) =>
                      c.states
                        .filter((s) => {
                          if (!geoSearchQuery.trim()) return true;
                          const q = geoSearchQuery.toLowerCase();
                          return (
                            s.name.toLowerCase().includes(q) ||
                            s.key.includes(q) ||
                            c.name.toLowerCase().includes(q) ||
                            c.code.toLowerCase().includes(q)
                          );
                        })
                        .map((s) => ({ ...s, countryCode: c.code, countryName: c.name }))
                    )
                    .map((state) => (
                      <div
                        key={`${state.countryCode}_${state.key}`}
                        onClick={() => handleToggleState(state.countryCode, state.key)}
                        className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors cursor-pointer border ${
                          state.isSelected
                            ? 'bg-[#182638] border-sky-500/50 text-white'
                            : 'bg-[#131d2a] border-[#1d2a3c] text-slate-300 hover:text-white hover:bg-[#192638]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4.5 h-4.5 rounded-md flex items-center justify-center shrink-0 border transition-colors ${
                              state.isSelected
                                ? 'bg-sky-500 border-sky-500 text-slate-950'
                                : 'border-slate-600 bg-[#0e1622]'
                            }`}
                          >
                            {state.isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <span className="font-medium text-slate-100">{state.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e2d40] text-slate-400 font-mono">
                            {state.countryCode}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 font-semibold">
                          {state.key}
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                /* Render: All Locations Hierarchical matching Screenshots 1 & 2 */
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {geoCountries.map((country) => {
                    const hasSelectedStates = country.states.some((s) => s.isSelected);
                    const isCountryChecked = country.isSelected;

                    return (
                      <div
                        key={country.code}
                        className="rounded-2xl border border-[#213144] bg-[#151f2c] overflow-hidden"
                      >
                        {/* Country Item Row matching Screenshot 1 & 2 */}
                        <div className="flex items-center justify-between p-3">
                          <div
                            onClick={() => handleToggleCountry(country.code)}
                            className="flex items-center gap-3 flex-1 cursor-pointer"
                          >
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-colors ${
                                isCountryChecked
                                  ? 'bg-sky-500 border-sky-500 text-slate-950'
                                  : hasSelectedStates
                                  ? 'border-sky-400 bg-[#0e1622]'
                                  : 'border-slate-500 bg-[#0e1622]'
                              }`}
                            >
                              {isCountryChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              {!isCountryChecked && hasSelectedStates && (
                                <div className="w-2 h-2 rounded-full bg-sky-400" />
                              )}
                            </div>
                            <span className="text-xs sm:text-sm font-semibold text-white">
                              {country.name}
                            </span>
                          </div>

                          {/* Country Code & Expand Chevron */}
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono text-slate-400">
                              {country.code}
                            </span>
                            <button
                              onClick={() => handleToggleExpandCountry(country.code)}
                              className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                              aria-label={`Expand ${country.name} states`}
                            >
                              {country.isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Expandable States / Divisions matching Screenshots 1 & 2 */}
                        {country.isExpanded && country.states.length > 0 && (
                          <div className="px-3 py-2 bg-[#0e1622] border-t border-[#202e40] space-y-1">
                            <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 px-1">
                              <span>Select individual divisions / states:</span>
                              <span className="text-sky-400 font-mono">
                                {country.states.filter((s) => s.isSelected).length}/{country.states.length}
                              </span>
                            </div>

                            <div className="space-y-1">
                              {country.states.map((state) => (
                                <div
                                  key={state.key}
                                  onClick={() => handleToggleState(country.code, state.key)}
                                  className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer border ${
                                    state.isSelected
                                      ? 'bg-[#182638] border-sky-500/40 text-white'
                                      : 'bg-[#121a26] border-transparent text-slate-300 hover:text-white hover:bg-[#162130]'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <div
                                      className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border transition-colors ${
                                        state.isSelected
                                          ? 'bg-sky-500 border-sky-500 text-slate-950'
                                          : 'border-slate-600 bg-[#0e1622]'
                                      }`}
                                    >
                                      {state.isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                    </div>
                                    <span className="truncate font-medium">{state.name}</span>
                                  </div>
                                  <span className="text-[11px] font-mono text-slate-400 shrink-0 font-medium">
                                    {state.key}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 10. Schedule Toggle */}
      <div className="p-3.5 rounded-2xl bg-[#141e2b] border border-[#202f43] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-white">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Schedule</span>
          </div>
          <button
            type="button"
            onClick={() => setSchedule(!schedule)}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              schedule ? 'bg-[#7c3aed]' : 'bg-[#2a384c]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform transform absolute top-0.5 ${
                schedule ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {schedule && (
          <input
            type="datetime-local"
            value={scheduleDateTime}
            onChange={(e) => setScheduleDateTime(e.target.value)}
            className="w-full mt-2 p-2 rounded-xl bg-[#0f1722] border border-[#26374c] text-xs text-white"
          />
        )}
      </div>

      {/* 11. Auto comment Toggle */}
      <div className="p-3.5 rounded-2xl bg-[#141e2b] border border-[#202f43] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-white">
            <MessageSquare className="w-4 h-4 text-slate-400" />
            <span>Auto comment</span>
          </div>
          <button
            type="button"
            onClick={() => setAutoComment(!autoComment)}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              autoComment ? 'bg-[#7c3aed]' : 'bg-[#2a384c]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform transform absolute top-0.5 ${
                autoComment ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {autoComment && (
          <input
            type="text"
            value={firstComment}
            onChange={(e) => setFirstComment(e.target.value)}
            placeholder="Write your automatic first comment..."
            className="w-full mt-2 p-2 rounded-xl bg-[#0f1722] border border-[#26374c] text-xs text-white placeholder:text-slate-500"
          />
        )}
      </div>

      {/* 12. Action Buttons: START and STOP matching Screenshot 3 */}
      <div className="flex items-center gap-3 pt-2">
        <button
          id="automation-start-btn"
          onClick={handleStartUpload}
          disabled={isRunning}
          className="flex-1 py-3 px-4 rounded-2xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-xs sm:text-sm tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>START</span>
        </button>

        <button
          id="automation-stop-btn"
          onClick={handleStopUpload}
          disabled={!isRunning}
          className="flex-1 py-3 px-4 rounded-2xl bg-[#1b2636] hover:bg-[#233246] text-slate-300 font-bold text-xs sm:text-sm tracking-wider uppercase transition-all border border-[#27394e] flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          <span>STOP</span>
        </button>
      </div>

      {/* 13. PROGRESS Bar matching Screenshot 3 */}
      <div className="p-3 rounded-2xl bg-[#141e2b] border border-[#202f43] space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold tracking-wider text-slate-300">
          <span>PROGRESS</span>
          <span className="font-mono">{overallProgress}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-[#0d141e] overflow-hidden">
          <div
            className="h-full bg-sky-400 transition-all duration-300 relative"
            style={{ width: `${overallProgress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-sky-200 shadow-[0_0_6px_rgba(56,189,248,1)]" />
          </div>
        </div>
      </div>

      {/* 14. UPLOAD LOG Terminal Panel matching Screenshot 3 */}
      <div className="p-4 rounded-2xl bg-[#141e2b] border border-[#202f43] space-y-2.5">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          UPLOAD LOG
        </h3>
        <div className="p-3.5 rounded-xl bg-[#0f1722] border border-[#1d2938] font-mono text-xs text-slate-300 space-y-1.5 min-h-[140px] max-h-[260px] overflow-y-auto">
          <p className="text-slate-400">Upload & Automation ready.</p>
          {logs.map((log) => (
            <p
              key={log.id}
              className={`leading-relaxed text-[11px] ${
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
          ))}
        </div>
      </div>
    </div>
  );
};
