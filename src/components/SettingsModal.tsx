import React, { useState } from 'react';
import { UserProfile } from '../types';
import { X, LogOut, Download, ChevronRight } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onLogout: () => void;
  onShowToast: (msg: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onLogout,
  onShowToast,
}) => {
  const [name, setName] = useState(profile.name);
  const [handle, setHandle] = useState(profile.handle);
  const [bio, setBio] = useState(profile.bio);
  const [location, setLocation] = useState(profile.location);
  const [hideSpoilers, setHideSpoilers] = useState(true);
  const [customPosters, setCustomPosters] = useState(true);
  const [theme, setTheme] = useState<'classic' | 'oled' | 'high-contrast'>('classic');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name,
      handle,
      bio,
      location
    });
    onShowToast('✅ Profile updated successfully!');
  };

  const handleExportData = () => {
    onShowToast('📦 Exporting your Letterbox reading history...');
  };

  const handleImportGoodreads = () => {
    onShowToast('📚 Syncing reading shelves with Goodreads...');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-fadeIn" id="settings-modal">
      <div className="w-full max-w-md bg-[#151c24] border border-[#273444] rounded-2xl flex flex-col shadow-2xl overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#232f3e] flex items-center justify-between bg-[#121820]">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">Settings & Account</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[#8fa0b5] hover:text-white hover:bg-[#232f3e]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-xs select-none">
          {/* Profile Section */}
          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono uppercase font-bold text-[#8fa0b5] text-[11px] tracking-wider">
                Profile Details
              </span>
              <button
                type="submit"
                className="text-[11px] font-mono font-bold text-[#15E558] hover:underline"
              >
                Save Changes
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1a2330] border border-[#283748]">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#15E558]"
              />
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Display Name"
                  className="w-full bg-transparent font-bold text-white text-sm focus:outline-none border-b border-transparent focus:border-[#15E558]"
                />
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="@handle"
                  className="w-full bg-transparent text-[#15E558] font-mono text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono text-[#6c7f96]">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. New York, USA"
                className="w-full p-2.5 rounded-xl bg-[#1a2330] border border-[#283748] text-white text-xs focus:outline-none focus:border-[#15E558]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono text-[#6c7f96]">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                className="w-full p-2.5 rounded-xl bg-[#1a2330] border border-[#283748] text-white text-xs focus:outline-none focus:border-[#15E558] resize-none"
              />
            </div>
          </form>

          {/* Appearance & Themes */}
          <div className="space-y-2.5">
            <span className="font-mono uppercase font-bold text-[#8fa0b5] text-[11px] tracking-wider block">
              Theme & Appearance
            </span>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'classic', label: 'Classic Dark' },
                { id: 'oled', label: 'Pitch Black' },
                { id: 'high-contrast', label: 'Contrast' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id as any)}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    theme === t.id
                      ? 'border-[#15E558] bg-[#15E558]/10 text-white font-bold'
                      : 'border-[#263445] bg-[#1a2330] text-[#8fa0b5] hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#1a2330] border border-[#283748]">
              <div>
                <span className="text-white font-semibold block">Custom Covers</span>
                <span className="text-[10px] text-[#6c7f96]">Display member-selected special book editions</span>
              </div>
              <input
                type="checkbox"
                checked={customPosters}
                onChange={(e) => setCustomPosters(e.target.checked)}
                className="accent-[#15E558] w-4 h-4 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Privacy & Reading Preferences */}
          <div className="space-y-2.5">
            <span className="font-mono uppercase font-bold text-[#8fa0b5] text-[11px] tracking-wider block">
              Preferences
            </span>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#1a2330] border border-[#283748]">
              <div>
                <span className="text-white font-semibold block">Spoiler Shield</span>
                <span className="text-[10px] text-[#6c7f96]">Blur reviews flagged with spoilers automatically</span>
              </div>
              <input
                type="checkbox"
                checked={hideSpoilers}
                onChange={(e) => setHideSpoilers(e.target.checked)}
                className="accent-[#15E558] w-4 h-4 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#1a2330] border border-[#283748]">
              <div>
                <span className="text-white font-semibold block">Push & Activity Notifications</span>
                <span className="text-[10px] text-[#6c7f96]">Alerts for friend reviews and replies</span>
              </div>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="accent-[#15E558] w-4 h-4 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Integrations */}
          <div className="space-y-2.5">
            <span className="font-mono uppercase font-bold text-[#8fa0b5] text-[11px] tracking-wider block">
              Data & Integrations
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleImportGoodreads}
                className="p-2.5 rounded-xl bg-[#1a2330] hover:bg-[#243242] border border-[#283748] text-left text-white flex items-center justify-between"
              >
                <span>Import Goodreads</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#6c7f96]" />
              </button>

              <button
                type="button"
                onClick={handleExportData}
                className="p-2.5 rounded-xl bg-[#1a2330] hover:bg-[#243242] border border-[#283748] text-left text-white flex items-center justify-between"
              >
                <span>Export History</span>
                <Download className="w-3.5 h-3.5 text-[#6c7f96]" />
              </button>
            </div>
          </div>

          {/* App Version Info */}
          <div className="text-center pt-2 text-[#556677] text-[10px] font-mono">
            Letterbox v2.4.0 • Build 892 • The Social Network for Book Lovers
          </div>
        </div>

        {/* Logout Action Button */}
        <div className="p-4 bg-[#121820] border-t border-[#232f3e] flex items-center justify-between">
          <button
            type="button"
            onClick={onLogout}
            className="w-full py-2.5 rounded-xl bg-[#e53935]/15 hover:bg-[#e53935]/25 border border-[#e53935]/40 text-[#ff6b6b] text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log Out of Letterbox
          </button>
        </div>
      </div>
    </div>
  );
};
