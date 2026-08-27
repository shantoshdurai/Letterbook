import React, { useState } from 'react';
import { ArrowLeft, Check, ChevronRight } from 'lucide-react';

export interface FilterState {
  sortBy: 'popular' | 'rating' | 'newest' | 'pages';
  genres: string[];
  minRating: number;
  availableOn: string[];
  customCovers?: boolean;
  typeReleased?: boolean;
  typeUnreleased?: boolean;
  typePhysical?: boolean;
  typeEbook?: boolean;
  typeAudiobook?: boolean;
  accountRead?: boolean;
  accountUnread?: boolean;
  accountWatchlist?: boolean;
  yearRange: string;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApplyFilters: (newFilters: FilterState) => void;
  availableGenres: string[];
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  filters: initialFilters,
  onApplyFilters,
  availableGenres
}) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(initialFilters);
  const [activeSubPicker, setActiveSubPicker] = useState<'genre' | 'service' | 'sort' | null>(null);

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({
      sortBy: 'newest',
      genres: [],
      minRating: 0,
      availableOn: [],
      customCovers: true,
      typeReleased: true,
      typeUnreleased: false,
      typePhysical: true,
      typeEbook: true,
      typeAudiobook: false,
      accountRead: false,
      accountUnread: false,
      accountWatchlist: false,
      yearRange: 'all'
    });
  };

  const sortLabelMap = {
    popular: 'Most Popular',
    rating: 'Highest Rated',
    newest: 'Release Date',
    pages: 'Page Count'
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#14181c] text-white flex flex-col animate-fadeIn select-none overflow-hidden" id="letterboxd-filter-screen">
      {/* Top Header matching Screenshot 7: '<- Filter' and Checkmark '✓' */}
      <header className="px-4 py-3 border-b border-[#242f3d] bg-[#14181c]/95 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[#8fa0b5] hover:text-white hover:bg-[#1f2834] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <h1 className="text-base font-bold text-white tracking-tight">Filter</h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-[#8fa0b5] hover:text-[#15E558] transition-colors"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="p-1 rounded-full text-[#15E558] hover:bg-[#15E558]/10 transition-colors"
            title="Apply filters"
          >
            <Check className="w-6 h-6 stroke-[3]" />
          </button>
        </div>
      </header>

      {/* Main Filter List matching Screenshot 7 */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#1e2733] text-xs">
        {/* Sort by Row */}
        <div 
          onClick={() => setActiveSubPicker(activeSubPicker === 'sort' ? null : 'sort')}
          className="px-4 py-3.5 flex items-center justify-between hover:bg-[#182028] cursor-pointer transition-colors"
        >
          <span className="text-white font-medium">Sort by</span>
          <div className="flex items-center gap-1 text-[#8fa0b5]">
            <span className="text-[#a0b0c0]">{sortLabelMap[localFilters.sortBy]}</span>
            <ChevronRight className="w-4 h-4 text-[#6c7f96]" />
          </div>
        </div>

        {/* Inline Sort Picker if expanded */}
        {activeSubPicker === 'sort' && (
          <div className="p-3 bg-[#111417] grid grid-cols-2 gap-2 border-b border-[#232f3e]">
            {(['newest', 'popular', 'rating', 'pages'] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setLocalFilters(prev => ({ ...prev, sortBy: key }));
                  setActiveSubPicker(null);
                }}
                className={`p-2 rounded-lg text-left font-semibold border transition-all ${
                  localFilters.sortBy === key
                    ? 'bg-[#15E558]/15 text-[#15E558] border-[#15E558]'
                    : 'bg-[#182028] text-[#8fa0b5] border-[#253241]'
                }`}
              >
                {sortLabelMap[key]}
              </button>
            ))}
          </div>
        )}

        {/* SECTION: APPEARANCE matching Screenshot 7 */}
        <div className="pt-4 pb-1">
          <div className="px-4 pb-2 text-[11px] font-bold uppercase tracking-wider text-[#6c7f96]">
            Appearance
          </div>

          <div className="px-4 py-3 flex items-center justify-between hover:bg-[#182028]">
            <span className="text-white">Custom Covers</span>
            <input
              type="checkbox"
              checked={localFilters.customCovers ?? true}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, customCovers: e.target.checked }))}
              className="accent-[#15E558] w-4 h-4 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* SECTION: CONTENT matching Screenshot 7 */}
        <div className="pt-4 pb-1">
          <div className="px-4 pb-2 text-[11px] font-bold uppercase tracking-wider text-[#6c7f96]">
            Content
          </div>

          {/* Genre selector row */}
          <div
            onClick={() => setActiveSubPicker(activeSubPicker === 'genre' ? null : 'genre')}
            className="px-4 py-3 flex items-center justify-between hover:bg-[#182028] cursor-pointer"
          >
            <span className="text-white">Genre</span>
            <div className="flex items-center gap-1 text-[#8fa0b5]">
              <span>{localFilters.genres.length > 0 ? `${localFilters.genres.length} Selected` : 'All'}</span>
              <ChevronRight className="w-4 h-4 text-[#6c7f96]" />
            </div>
          </div>

          {activeSubPicker === 'genre' && (
            <div className="p-3 bg-[#111417] flex flex-wrap gap-1.5 border-b border-[#232f3e]">
              {availableGenres.map((g) => {
                const isSelected = localFilters.genres.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      setLocalFilters(prev => ({
                        ...prev,
                        genres: isSelected ? prev.genres.filter(x => x !== g) : [...prev.genres, g]
                      }));
                    }}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-[#15E558] text-black border-[#15E558] font-bold'
                        : 'bg-[#182028] text-[#8fa0b5] border-[#253241]'
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          )}

          {/* Service selector row */}
          <div
            onClick={() => setActiveSubPicker(activeSubPicker === 'service' ? null : 'service')}
            className="px-4 py-3 flex items-center justify-between hover:bg-[#182028] cursor-pointer"
          >
            <span className="text-white">Service</span>
            <div className="flex items-center gap-1 text-[#8fa0b5]">
              <span>{localFilters.availableOn.length > 0 ? `${localFilters.availableOn.length} Selected` : 'All'}</span>
              <ChevronRight className="w-4 h-4 text-[#6c7f96]" />
            </div>
          </div>

          {activeSubPicker === 'service' && (
            <div className="p-3 bg-[#111417] flex flex-wrap gap-1.5 border-b border-[#232f3e]">
              {['Kindle', 'Audible', 'Apple Books', 'Libby', 'Bookshop.org'].map((s) => {
                const isSelected = localFilters.availableOn.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setLocalFilters(prev => ({
                        ...prev,
                        availableOn: isSelected ? prev.availableOn.filter(x => x !== s) : [...prev.availableOn, s]
                      }));
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-[#FF8000] text-white border-[#FF8000] font-bold'
                        : 'bg-[#182028] text-[#8fa0b5] border-[#253241]'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION: TYPE matching Screenshot 7 */}
        <div className="pt-4 pb-1">
          <div className="px-4 pb-2 text-[11px] font-bold uppercase tracking-wider text-[#6c7f96]">
            Type
          </div>

          <div className="px-4 py-3 flex items-center justify-between hover:bg-[#182028]">
            <span className="text-white">Released</span>
            <input
              type="checkbox"
              checked={localFilters.typeReleased ?? true}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, typeReleased: e.target.checked }))}
              className="accent-[#15E558] w-4 h-4 rounded cursor-pointer"
            />
          </div>

          <div className="px-4 py-3 flex items-center justify-between hover:bg-[#182028]">
            <span className="text-white">Physical Book</span>
            <input
              type="checkbox"
              checked={localFilters.typePhysical ?? true}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, typePhysical: e.target.checked }))}
              className="accent-[#15E558] w-4 h-4 rounded cursor-pointer"
            />
          </div>

          <div className="px-4 py-3 flex items-center justify-between hover:bg-[#182028]">
            <span className="text-white">E-Book</span>
            <input
              type="checkbox"
              checked={localFilters.typeEbook ?? true}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, typeEbook: e.target.checked }))}
              className="accent-[#15E558] w-4 h-4 rounded cursor-pointer"
            />
          </div>

          <div className="px-4 py-3 flex items-center justify-between hover:bg-[#182028]">
            <span className="text-white">Audiobook</span>
            <input
              type="checkbox"
              checked={localFilters.typeAudiobook ?? false}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, typeAudiobook: e.target.checked }))}
              className="accent-[#15E558] w-4 h-4 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* SECTION: ACCOUNT matching Screenshot 7 */}
        <div className="pt-4 pb-1">
          <div className="px-4 pb-2 text-[11px] font-bold uppercase tracking-wider text-[#6c7f96]">
            Account
          </div>

          <div className="px-4 py-3 flex items-center justify-between hover:bg-[#182028]">
            <span className="text-white">Read</span>
            <input
              type="checkbox"
              checked={localFilters.accountRead ?? false}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, accountRead: e.target.checked }))}
              className="accent-[#15E558] w-4 h-4 rounded cursor-pointer"
            />
          </div>

          <div className="px-4 py-3 flex items-center justify-between hover:bg-[#182028]">
            <span className="text-white">Unread</span>
            <input
              type="checkbox"
              checked={localFilters.accountUnread ?? false}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, accountUnread: e.target.checked }))}
              className="accent-[#15E558] w-4 h-4 rounded cursor-pointer"
            />
          </div>

          <div className="px-4 py-3 flex items-center justify-between hover:bg-[#182028]">
            <span className="text-white">In Watchlist</span>
            <input
              type="checkbox"
              checked={localFilters.accountWatchlist ?? false}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, accountWatchlist: e.target.checked }))}
              className="accent-[#15E558] w-4 h-4 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
