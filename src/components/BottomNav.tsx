import React from 'react';
import { ActiveTab, UserProfile } from '../types';
import { Home, Search, Plus, LayoutGrid, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenLogModal: () => void;
  profile?: UserProfile;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenLogModal,
  profile
}) => {
  return (
    <nav 
      id="letterboxd-bottom-nav" 
      className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-[#14181c]/95 backdrop-blur-xl border-t border-[#202934] px-3 py-2 flex items-center justify-around select-none shadow-[0_-10px_25px_rgba(0,0,0,0.6)]"
    >
      {/* Home Tab */}
      <button
        type="button"
        id="nav-tab-home"
        onClick={() => onTabChange('home')}
        className={`flex flex-col items-center justify-center gap-1 transition-colors py-0.5 px-2 flex-1 ${
          activeTab === 'home' ? 'text-white' : 'text-[#748393] hover:text-[#9ab]'
        }`}
      >
        <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
        <span className="text-[10px] font-medium tracking-tight">Home</span>
      </button>

      {/* Search Tab */}
      <button
        type="button"
        id="nav-tab-search"
        onClick={() => onTabChange('search')}
        className={`flex flex-col items-center justify-center gap-1 transition-colors py-0.5 px-2 flex-1 ${
          activeTab === 'search' ? 'text-white' : 'text-[#748393] hover:text-[#9ab]'
        }`}
      >
        <Search className={`w-5 h-5 ${activeTab === 'search' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
        <span className="text-[10px] font-medium tracking-tight">Search</span>
      </button>

      {/* Center Action: Add new (Log) in Letterboxd style */}
      <button
        type="button"
        id="nav-tab-add-new"
        onClick={onOpenLogModal}
        className="flex flex-col items-center justify-center gap-1 transition-transform active:scale-95 py-0.5 px-2 flex-1 text-[#15E558] hover:text-[#1df561]"
        title="Add new review or log"
      >
        <div className="w-6 h-6 rounded-full bg-[#15E558] flex items-center justify-center text-[#14181c] shadow-[0_2px_8px_rgba(21,229,88,0.4)]">
          <Plus className="w-4 h-4 stroke-[3]" />
        </div>
        <span className="text-[10px] font-medium tracking-tight text-[#15E558]">Add new</span>
      </button>

      {/* Lists Tab (using 4-square grid icon) */}
      <button
        type="button"
        id="nav-tab-lists"
        onClick={() => onTabChange('lists')}
        className={`flex flex-col items-center justify-center gap-1 transition-colors py-0.5 px-2 flex-1 ${
          activeTab === 'lists' ? 'text-white' : 'text-[#748393] hover:text-[#9ab]'
        }`}
      >
        <LayoutGrid className={`w-5 h-5 ${activeTab === 'lists' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
        <span className="text-[10px] font-medium tracking-tight">Lists</span>
      </button>

      {/* Profile Tab */}
      <button
        type="button"
        id="nav-tab-profile"
        onClick={() => onTabChange('profile')}
        className={`flex flex-col items-center justify-center gap-1 transition-colors py-0.5 px-2 flex-1 ${
          activeTab === 'profile' ? 'text-white' : 'text-[#748393] hover:text-[#9ab]'
        }`}
      >
        {profile?.avatar ? (
          <div className={`w-5 h-5 rounded-full overflow-hidden border ${
            activeTab === 'profile' ? 'border-[#15E558]' : 'border-[#455669]'
          }`}>
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <User className={`w-5 h-5 ${activeTab === 'profile' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
        )}
        <span className="text-[10px] font-medium tracking-tight">Profile</span>
      </button>
    </nav>
  );
};
