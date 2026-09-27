import React from 'react';
import { ActiveTab, UserProfile } from '../types';
import { Home, Search, Plus, LayoutGrid } from 'lucide-react';
import { Avatar } from './ui';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenLogModal: () => void;
  profile: UserProfile;
}

const TABS: { id: ActiveTab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'search', label: 'Search', icon: Search },
];
const TABS_RIGHT: { id: ActiveTab; label: string; icon: typeof Home }[] = [
  { id: 'lists', label: 'Lists', icon: LayoutGrid },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, onOpenLogModal, profile }) => {
  const tabButton = ({ id, label, icon: Icon }: (typeof TABS)[number]) => {
    const active = activeTab === id;
    return (
      <button
        key={id}
        type="button"
        onClick={() => onTabChange(id)}
        aria-current={active ? 'page' : undefined}
        className={`flex flex-col items-center justify-center gap-1 py-1 flex-1 transition-colors ${active ? 'text-white' : 'text-[#748393] hover:text-[#9ab]'}`}
      >
        <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
        <span className="text-[10px] font-medium tracking-tight">{label}</span>
      </button>
    );
  };

  return (
    <nav
      aria-label="Main"
      className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-[#14181c]/95 backdrop-blur-xl border-t border-[#202934] px-2 pt-1.5 pb-safe select-none shadow-[0_-10px_25px_rgba(0,0,0,0.5)]"
    >
      <div className="flex items-center justify-around pb-1.5">
        {TABS.map(tabButton)}

        <button
          type="button"
          onClick={onOpenLogModal}
          aria-label="Log a book"
          className="flex flex-col items-center justify-center gap-1 py-1 flex-1 text-[#15E558] active:scale-95 transition-transform"
        >
          <span className="w-7 h-7 rounded-full bg-[#15E558] flex items-center justify-center text-[#14181c] shadow-[0_2px_10px_rgba(21,229,88,0.4)]">
            <Plus className="w-4 h-4 stroke-[3]" />
          </span>
          <span className="text-[10px] font-medium tracking-tight">Log</span>
        </button>

        {TABS_RIGHT.map(tabButton)}

        <button
          type="button"
          onClick={() => onTabChange('profile')}
          aria-current={activeTab === 'profile' ? 'page' : undefined}
          className={`flex flex-col items-center justify-center gap-1 py-1 flex-1 transition-colors ${activeTab === 'profile' ? 'text-white' : 'text-[#748393] hover:text-[#9ab]'}`}
        >
          <span className={`rounded-full p-px ${activeTab === 'profile' ? 'bg-[#15E558]' : 'bg-[#455669]'}`}>
            <Avatar src={profile.avatar} name={profile.name} className="w-5 h-5 text-[8px]" />
          </span>
          <span className="text-[10px] font-medium tracking-tight">Profile</span>
        </button>
      </div>
    </nav>
  );
};
