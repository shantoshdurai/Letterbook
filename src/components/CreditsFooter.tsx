import React from 'react';
import { LETTERBOXD_URL, OPEN_LIBRARY_URL, REPO_URL, ISSUES_URL } from '../lib/links';

const Link: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#9ab] hover:text-white underline-offset-2 hover:underline">
    {children}
  </a>
);

// Credits shown at the foot of Home and in Settings.
export const CreditsFooter: React.FC<{ className?: string }> = ({ className = '' }) => (
  <footer className={`mx-4 pt-4 border-t border-[#2c3440] text-[11px] leading-relaxed text-[#678] space-y-2 ${className}`}>
    <p>
      Letterbook is a free, open-source reading diary. Its design is inspired by{' '}
      <Link href={LETTERBOXD_URL}>Letterboxd</Link>, the social network for film lovers. Letterbook is an independent
      project and is not affiliated with or endorsed by Letterboxd.
    </p>
    <p>
      Book data and covers from <Link href={OPEN_LIBRARY_URL}>Open Library</Link>.
    </p>
    <p className="flex flex-wrap gap-x-4 gap-y-1">
      <Link href={REPO_URL}>Source on GitHub</Link>
      <Link href={ISSUES_URL}>Report a bug</Link>
      <span>v{__APP_VERSION__}</span>
    </p>
  </footer>
);
