import React from 'react';
import { ActiveTab, UserProfile } from '../types';
import { Home, Search, Plus, LayoutGrid, Bell } from 'lucide-react';
import { Avatar } from './ui';
import { BrandLogo } from './BrandLogo';

interface NavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenLogModal: () => void;
  profile: UserProfile;
}

const TABS: { id: ActiveTab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'lists', label: 'Lists', icon: LayoutGrid },
];

// Phone: a bottom tab bar with the Log button in the middle.
export const BottomNav: React.FC<NavProps> = ({ activeTab, onTabChange, onOpenLogModal, profile }) => {
  const tabButton = ({ id, label, icon: Icon }: (typeof TABS)[number]) => {
    const active = activeTab === id;
    return (
      <button
        key={id}
        type="button"
        onClick={() => onTabChange(id)}
        aria-current={active ? 'page' : undefined}
        className={`flex flex-col items-center justify-center gap-1 h-12 flex-1 transition-colors ${active ? 'text-white' : 'text-[#678] hover:text-[#9ab]'}`}
      >
        <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.4 : 1.8} />
        <span className="text-[10px] font-medium">{label}</span>
      </button>
    );
  };

  return (
    <nav
      aria-label="Main"
      className="md:hidden fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-[#14181c]/95 backdrop-blur-xl border-t border-[#2c3440] px-1 pb-safe select-none"
    >
      <div className="flex items-center justify-around py-1">
        {tabButton(TABS[0])}
        {tabButton(TABS[1])}
        <button type="button" onClick={onOpenLogModal} aria-label="Log a book" className="flex items-center justify-center h-12 flex-1 active:scale-95 transition-transform">
          <span className="w-9 h-9 rounded-full bg-[#00E054] flex items-center justify-center text-[#14181c]">
            <Plus className="w-5 h-5" strokeWidth={3} />
          </span>
        </button>
        {tabButton(TABS[2])}
        <button
          type="button"
          onClick={() => onTabChange('profile')}
          aria-current={activeTab === 'profile' ? 'page' : undefined}
          className={`flex flex-col items-center justify-center gap-1 h-12 flex-1 transition-colors ${activeTab === 'profile' ? 'text-white' : 'text-[#678] hover:text-[#9ab]'}`}
        >
          <span className={`rounded-full ring-2 ${activeTab === 'profile' ? 'ring-white' : 'ring-transparent'}`}>
            <Avatar src={profile.avatar} name={profile.name} className="w-[22px] h-[22px] text-[8px]" />
          </span>
          <span className="text-[10px] font-medium">Profile</span>
        </button>
      </div>
    </nav>
  );
};

// Desktop / website: a slim top bar in the spirit of letterboxd.com.
export const TopNav: React.FC<NavProps & { unread: number; onOpenNotifications: () => void }> = ({
  activeTab,
  onTabChange,
  onOpenLogModal,
  profile,
  unread,
  onOpenNotifications,
}) => (
  <header className="hidden md:block sticky top-0 z-40 h-14 bg-[#14181c]/95 backdrop-blur-xl border-b border-[#2c3440]">
    <div className="mx-auto max-w-[960px] h-full px-4 flex items-center gap-8">
      <button type="button" onClick={() => onTabChange('home')} aria-label="Letterbook home">
        <BrandLogo size="sm" />
      </button>
      <nav aria-label="Main" className="flex items-center gap-6 ml-auto">
        {[...TABS, { id: 'profile' as ActiveTab, label: profile.name.split(' ')[0] || 'Profile', icon: Home }].map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => onTabChange(id)}
            aria-current={activeTab === id ? 'page' : undefined}
            className={`text-[12px] font-semibold uppercase tracking-[0.12em] transition-colors ${activeTab === id ? 'text-white' : 'text-[#9ab] hover:text-white'}`}
          >
            {id === 'profile' ? (
              <span className="flex items-center gap-2 normal-case tracking-normal text-[13px]">
                <Avatar src={profile.avatar} name={profile.name} className="w-6 h-6 text-[9px]" />
                {label}
              </span>
            ) : (
              label
            )}
          </button>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenNotifications}
          aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
          className="relative p-1.5 rounded-full text-[#9ab] hover:text-white"
        >
          <Bell className="w-5 h-5" />
          {unread > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#40BCF4] ring-2 ring-[#14181c]" />}
        </button>
        <button
          type="button"
          onClick={onOpenLogModal}
          className="flex items-center gap-1.5 pl-2.5 pr-3.5 h-8 rounded bg-[#00E054] hover:bg-[#00c94b] text-[#14181c] text-[12px] font-bold uppercase tracking-[0.1em]"
        >
          <Plus className="w-4 h-4" strokeWidth={3} /> Log
        </button>
      </div>
    </div>
  </header>
);
