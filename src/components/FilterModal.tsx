import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { FilterState, DEFAULT_FILTERS, SORT_LABELS, DECADE_LABELS } from '../lib/filters';
import { GENRES } from '../lib/openLibrary';
import { Sheet } from './ui';

interface FilterModalProps {
  z: number;
  filters: FilterState;
  onApply: (f: FilterState) => void;
  onClose: () => void;
}

const Chip: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode; tone?: 'green' | 'blue' }> = ({ active, onClick, children, tone = 'green' }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1 ${
      active
        ? tone === 'green' ? 'bg-[#15E558] text-black border-[#15E558] font-bold' : 'bg-[#40BCF4] text-black border-[#40BCF4] font-bold'
        : 'bg-[#141b24] text-[#9fb0c3] border-[#2a3848] hover:text-white'
    }`}
  >
    {active && <Check className="w-3 h-3 stroke-[3]" />}
    {children}
  </button>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-2">
    <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#6c7f96]">{title}</h3>
    <div className="flex flex-wrap gap-1.5">{children}</div>
  </div>
);

export const FilterModal: React.FC<FilterModalProps> = ({ z, filters, onApply, onClose }) => {
  const [f, setF] = useState<FilterState>(filters);
  const set = (patch: Partial<FilterState>) => setF((prev) => ({ ...prev, ...patch }));

  return (
    <Sheet z={z} onClose={onClose} label="Filter books">
      <div className="px-5 pt-2 pb-3 flex items-center justify-between border-b border-[#233140]">
        <h2 className="text-base font-bold text-white">Filter</h2>
        <button type="button" onClick={() => setF(DEFAULT_FILTERS)} className="text-xs text-[#8fa0b5] hover:text-[#15E558]">
          Reset
        </button>
      </div>
      <div className="p-5 space-y-5">
        <Section title="Sort by">
          {(Object.keys(SORT_LABELS) as FilterState['sortBy'][]).map((k) => (
            <Chip key={k} active={f.sortBy === k} onClick={() => set({ sortBy: k })} tone="blue">{SORT_LABELS[k]}</Chip>
          ))}
        </Section>
        <Section title="Genre">
          {GENRES.map((g) => {
            const on = f.genres.includes(g.name);
            return (
              <Chip key={g.name} active={on} onClick={() => set({ genres: on ? f.genres.filter((x) => x !== g.name) : [...f.genres, g.name] })}>
                {g.name}
              </Chip>
            );
          })}
        </Section>
        <Section title="Community rating">
          {[0, 3, 3.5, 4, 4.5].map((r) => (
            <Chip key={r} active={f.minRating === r} onClick={() => set({ minRating: r })} tone="blue">{r ? `${r}★ & up` : 'Any'}</Chip>
          ))}
        </Section>
        <Section title="Published">
          {(Object.keys(DECADE_LABELS) as FilterState['decade'][]).map((k) => (
            <Chip key={k} active={f.decade === k} onClick={() => set({ decade: k })} tone="blue">{DECADE_LABELS[k]}</Chip>
          ))}
        </Section>
        <Section title="Your books">
          {([['all', 'Everything'], ['read', 'Read'], ['unread', 'Not read'], ['watchlist', 'In watchlist']] as const).map(([k, label]) => (
            <Chip key={k} active={f.status === k} onClick={() => set({ status: k })} tone="blue">{label}</Chip>
          ))}
        </Section>
      </div>
      <div className="px-5 pb-5 flex gap-2">
        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl bg-[#243140] text-xs font-semibold text-[#cbd6e2]">Cancel</button>
        <button
          type="button"
          onClick={() => {
            onApply(f);
            onClose();
          }}
          className="flex-1 py-3 rounded-xl bg-[#15E558] text-black text-xs font-bold"
        >
          Show results
        </button>
      </div>
    </Sheet>
  );
};
