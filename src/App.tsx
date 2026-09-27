import React, { useCallback, useEffect, useState } from 'react';
import { ActiveTab } from './types';
import { LibraryProvider, useLibrary } from './state/library';
import { UIProvider, useUI, Overlay } from './state/ui';
import { Session, loadSession, saveSession, deleteAccountData } from './lib/auth';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoginScreen } from './components/LoginScreen';
import { BottomNav, TopNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { SearchScreen } from './components/SearchScreen';
import { ListsScreen } from './components/ListsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { BookDetailModal } from './components/BookDetailModal';
import { LogBookModal } from './components/LogBookModal';
import { ListDetailModal } from './components/ListDetailModal';
import { ListEditor } from './components/ListEditor';
import { ArticleModal } from './components/ArticleModal';
import { NotificationsScreen } from './components/NotificationsScreen';
import { InstagramStoryModal } from './components/InstagramStoryModal';
import { SettingsModal } from './components/SettingsModal';
import { BookQuickMenuModal } from './components/BookQuickMenuModal';
import { BookGridScreen } from './components/BookGridScreen';
import { MyReviewsScreen } from './components/MyReviewsScreen';

interface ShellProps {
  onSignOut: () => void;
  onDeleteAccount: () => void;
  onIdentityChange: (name: string, handle: string) => void;
}

const OverlayView: React.FC<{ overlay: Overlay; z: number } & ShellProps> = ({ overlay: o, z, ...shell }) => {
  switch (o.type) {
    case 'book': return <BookDetailModal z={z} book={o.book} />;
    case 'list': return <ListDetailModal z={z} listId={o.listId} />;
    case 'article': return <ArticleModal z={z} articleId={o.articleId} />;
    case 'log': return <LogBookModal z={z} bookId={o.bookId} logId={o.logId} />;
    case 'share': return <InstagramStoryModal z={z} bookId={o.bookId} review={o.review} justLogged={o.justLogged} />;
    case 'quickMenu': return <BookQuickMenuModal z={z} bookId={o.bookId} />;
    case 'genre': return <BookGridScreen z={z} title={o.name} subtitle="Most read on Open Library" genre={o.name} />;
    case 'grid': return <BookGridScreen z={z} title={o.title} subtitle={o.subtitle} bookIds={o.bookIds} source={o.source} authorOf={o.authorOf} emptyText={o.emptyText} />;
    case 'reviews': return <MyReviewsScreen z={z} />;
    case 'notifications': return <NotificationsScreen z={z} />;
    case 'settings': return <SettingsModal z={z} {...shell} />;
    case 'createList': return <ListEditor z={z} editListId={o.editListId} initialBookId={o.initialBookId} />;
  }
};

const Shell: React.FC<ShellProps> = (shell) => {
  const lib = useLibrary();
  const ui = useUI();
  const [tab, setTab] = useState<ActiveTab>('home');
  const [listsView, setListsView] = useState<{ tab: 'lists' | 'diary' | 'discover'; nonce: number }>({ tab: 'lists', nonce: 0 });

  const changeTab = useCallback((next: ActiveTab) => {
    setTab((current) => {
      // Tapping the active tab scrolls back to the top, like native apps.
      if (current === next) window.scrollTo({ top: 0, behavior: 'smooth' });
      else window.scrollTo({ top: 0 });
      return next;
    });
  }, []);

  const openLists = (sub: 'lists' | 'diary') => {
    setListsView((v) => ({ tab: sub, nonce: v.nonce + 1 }));
    changeTab('lists');
  };

  // Keep the document title in sync with where the reader is.
  useEffect(() => {
    const labels: Record<ActiveTab, string> = { home: 'Home', search: 'Search', log: 'Log', lists: 'Lists', profile: lib.profile.name };
    document.title = `${labels[tab]} · Letterbook`;
  }, [tab, lib.profile.name]);

  return (
    <div className="min-h-[100dvh] bg-[#14181c]">
      <TopNav
        activeTab={tab}
        onTabChange={changeTab}
        onOpenLogModal={() => ui.open({ type: 'log' })}
        profile={lib.profile}
        unread={lib.unreadNotifications}
        onOpenNotifications={() => ui.open({ type: 'notifications' })}
      />
      <main className="mx-auto w-full max-w-md md:max-w-[960px] min-h-[100dvh] relative">
        <HomeScreen active={tab === 'home'} />
        <SearchScreen active={tab === 'search'} />
        {/* Lists and Profile read best as a narrower column on wide screens. */}
        <div className="md:max-w-2xl md:mx-auto">
          <ListsScreen key={listsView.nonce} active={tab === 'lists'} initialTab={listsView.tab} />
          <ProfileScreen active={tab === 'profile'} onOpenDiary={() => openLists('diary')} onOpenLists={() => openLists('lists')} />
        </div>

        <BottomNav activeTab={tab} onTabChange={changeTab} onOpenLogModal={() => ui.open({ type: 'log' })} profile={lib.profile} />

        {ui.stack.map((o, i) => (
          <OverlayView key={`${o.type}-${i}`} overlay={o} z={i + 1} {...shell} />
        ))}
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(loadSession);

  const authenticate = (s: Session) => {
    saveSession(s);
    setSession(s);
  };

  const signOut = () => {
    saveSession(null);
    setSession(null);
    history.replaceState(null, '');
  };

  if (!session) {
    return (
      <ErrorBoundary>
        <LoginScreen onAuthenticated={authenticate} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <UIProvider key={session.userId}>
        <LibraryProvider key={session.userId} session={session}>
          <Shell
            onSignOut={signOut}
            onDeleteAccount={() => {
              const id = session.userId;
              signOut();
              // Wait for the library to unmount (it flushes pending writes) before wiping.
              setTimeout(() => deleteAccountData(id), 0);
            }}
            onIdentityChange={(name, handle) => authenticate({ ...session, name, handle })}
          />
        </LibraryProvider>
      </UIProvider>
    </ErrorBoundary>
  );
};

export default App;
