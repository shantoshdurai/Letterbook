import React, { useEffect, useState } from 'react';
import { ArrowLeft, Mail, Check, ChevronRight, Lock, User, AtSign, Loader2, Eye, EyeOff } from 'lucide-react';
import { BrandLogo, BrandMark } from './BrandLogo';
import { Session, signIn, signUp, guestSession, normalizeHandle, listAccounts } from '../lib/auth';
import { GENRES } from '../lib/openLibrary';
import { seedBooks } from '../data/seed';
import { writeJSON, storageKey } from '../lib/storage';

interface LoginScreenProps {
  onAuthenticated: (session: Session) => void;
}

// Real covers from the starter catalog rotate behind the welcome screen.
const SLIDES = seedBooks.slice(0, 6);
const ONBOARDING_GENRES = GENRES.slice(0, 12).map((g) => g.name);

const Field: React.FC<{
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}> = ({ icon, label, children }) => (
  <label className="block space-y-1">
    <span className="text-[11px] text-[#8fa0b5] font-medium flex items-center gap-1.5">
      {icon}
      <span>{label}</span>
    </span>
    {children}
  </label>
);

const inputClass =
  'w-full bg-[#18222d] border border-[#2d3d50] focus:border-[#00E054] rounded-xl px-3.5 py-3 text-sm text-white placeholder-[#536579] focus:outline-none transition-colors';

export const LoginScreen: React.FC<LoginScreenProps> = ({ onAuthenticated }) => {
  const [view, setView] = useState<'welcome' | 'signin' | 'signup' | 'genres'>(() => (listAccounts().length ? 'signin' : 'welcome'));
  const [slide, setSlide] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [agree, setAgree] = useState(false);

  const [pending, setPending] = useState<Session | null>(null);
  const [genres, setGenres] = useState<string[]>([]);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => setError(null), [view]);

  const go = (v: typeof view) => {
    setShowPassword(false);
    setView(v);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      onAuthenticated(await signIn(identifier, password));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) {
      setError('Please accept the terms to continue.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const session = await signUp({ name, username, email, password: newPassword });
      setPending(session);
      go('genres');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const finishOnboarding = () => {
    if (!pending) return;
    if (genres.length) {
      // Seed the new profile's favourite genres; the library store picks this up.
      writeJSON(storageKey('u', pending.userId, 'onboardingGenres'), genres);
    }
    onAuthenticated(pending);
  };

  const current = SLIDES[slide];

  const backdrop = (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {SLIDES.map((b, i) => (
        <img
          key={b.id}
          src={b.coverImage}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover scale-125 blur-2xl transition-opacity duration-1000 ${i === slide ? 'opacity-60' : 'opacity-0'}`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-[#14181c]/30 via-[#14181c]/70 to-[#14181c]" />
    </div>
  );

  const errorBox = error && (
    <div role="alert" className="px-3 py-2.5 rounded-xl bg-[#3a1c1c] border border-[#6b2b2b] text-xs text-[#ffb4b4]">
      {error}
    </div>
  );

  const passwordToggle = (
    <button
      type="button"
      onClick={() => setShowPassword((v) => !v)}
      aria-label={showPassword ? 'Hide password' : 'Show password'}
      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#6c7f96] hover:text-white"
    >
      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );

  return (
    <div className="min-h-[100dvh] bg-[#14181c] flex justify-center text-white">
      <main className="relative w-full max-w-md min-h-[100dvh] bg-[#14181c] overflow-hidden flex flex-col pt-safe pb-safe">
        {backdrop}

        {view === 'welcome' && (
          <div className="relative z-10 flex-1 flex flex-col animate-fadeIn">
            <div className="flex-1 flex items-center justify-center pt-14">
              <div className="relative w-44 aspect-[2/3]">
                {SLIDES.map((b, i) => (
                  <img
                    key={b.id}
                    src={b.coverImage}
                    alt={i === slide ? `${b.title} by ${b.author}` : ''}
                    className={`absolute inset-0 w-full h-full object-cover rounded-lg book-shadow-lg transition-all duration-700 ${
                      i === slide ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-95 -rotate-3'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="relative text-center text-[10px] font-mono text-white/60 mt-4">
              {current.title} · {current.author}
            </p>

            <div className="px-6 pb-8 pt-8 flex flex-col items-center text-center space-y-5">
              <div className="flex flex-col items-center space-y-2">
                <BrandLogo size="lg" />
                <p className="text-sm text-[#a9b8c9]">Track the books you read. Rate, review and share them.</p>
              </div>

              <div className="w-full space-y-2.5">
                <button
                  type="button"
                  onClick={() => go('signup')}
                  className="w-full py-3.5 rounded-xl bg-[#00E054] hover:bg-[#12cb4d] active:scale-[0.98] text-black text-sm font-bold transition-all shadow-[0_0_20px_rgba(0,224,84,0.25)]"
                >
                  Create account
                </button>
                <button
                  type="button"
                  onClick={() => go('signin')}
                  className="w-full py-3.5 rounded-xl bg-[#2c3a4b] hover:bg-[#384a5f] active:scale-[0.98] text-white text-sm font-semibold transition-all"
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => onAuthenticated(guestSession())}
                  className="w-full py-3 rounded-xl text-[#a0b2c6] hover:text-white text-sm font-medium transition-colors"
                >
                  Continue as guest
                </button>
              </div>

              <div className="flex items-center gap-2" role="tablist" aria-label="Featured books">
                {SLIDES.map((b, idx) => (
                  <button
                    key={b.id}
                    type="button"
                    role="tab"
                    aria-selected={slide === idx}
                    aria-label={b.title}
                    onClick={() => setSlide(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${slide === idx ? 'w-5 bg-[#00E054]' : 'w-1.5 bg-white/30'}`}
                  />
                ))}
              </div>
              <p className="text-[10px] leading-relaxed text-white/45">
                Open source · Inspired by{' '}
                <a href="https://letterboxd.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white">Letterboxd</a>
                {' '}· Book data from{' '}
                <a href="https://openlibrary.org" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white">Open Library</a>
              </p>
            </div>
          </div>
        )}

        {view === 'signin' && (
          <div className="relative z-10 flex-1 flex flex-col px-6 pb-8 animate-fadeIn">
            <button type="button" onClick={() => go('welcome')} aria-label="Back" className="mt-3 self-start p-2 -ml-2 rounded-full bg-black/30 text-white">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex-1" />
            <div className="space-y-5">
              <div className="space-y-2">
                <BrandMark className="w-10 h-10" />
                <h1 className="text-2xl font-extrabold tracking-tight">Welcome back</h1>
                <p className="text-xs text-[#8fa0b5]">Sign in with your username or email.</p>
              </div>
              <form onSubmit={handleSignIn} className="space-y-4" noValidate>
                <Field icon={<User className="w-3 h-3 text-[#00E054]" />} label="Username or email">
                  <input
                    className={inputClass}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    autoComplete="username"
                    autoCapitalize="none"
                    placeholder="@username or you@example.com"
                    required
                  />
                </Field>
                <Field icon={<Lock className="w-3 h-3 text-[#00E054]" />} label="Password">
                  <div className="relative">
                    <input
                      className={`${inputClass} pr-10`}
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      placeholder="Your password"
                      required
                    />
                    {passwordToggle}
                  </div>
                </Field>
                {errorBox}
                <button
                  type="submit"
                  disabled={busy || !identifier || !password}
                  className="w-full py-3.5 rounded-xl bg-[#00E054] hover:bg-[#12cb4d] disabled:opacity-50 text-black text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                  Sign in
                </button>
              </form>
              <p className="text-center text-xs text-[#8fa0b5]">
                New to Letterbook?{' '}
                <button type="button" onClick={() => go('signup')} className="text-[#00E054] font-bold">
                  Create an account
                </button>
              </p>
              <p className="text-center text-[10px] text-[#5d6f83] leading-relaxed">
                Accounts are stored securely on this device. Use Settings → Export to move your diary to another device.
              </p>
            </div>
          </div>
        )}

        {view === 'signup' && (
          <div className="relative z-10 flex-1 flex flex-col px-6 pb-8 overflow-y-auto no-scrollbar animate-fadeIn">
            <button type="button" onClick={() => go('welcome')} aria-label="Back" className="mt-3 self-start p-2 -ml-2 rounded-full bg-black/30 text-white">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="pt-6 space-y-5">
              <div className="space-y-1">
                <h1 className="text-2xl font-extrabold tracking-tight">Create your account</h1>
                <p className="text-xs text-[#8fa0b5]">Keep a diary of everything you read.</p>
              </div>
              <form onSubmit={handleSignUp} className="space-y-3.5" noValidate>
                <Field icon={<User className="w-3 h-3 text-[#00E054]" />} label="Your name">
                  <input
                    className={inputClass}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!usernameTouched) setUsername(normalizeHandle(e.target.value.replace(/\s+/g, '')).slice(1));
                    }}
                    autoComplete="name"
                    placeholder="Maya Lin"
                    required
                  />
                </Field>
                <Field icon={<AtSign className="w-3 h-3 text-[#00E054]" />} label="Username">
                  <input
                    className={inputClass}
                    value={username}
                    onChange={(e) => {
                      setUsernameTouched(true);
                      setUsername(e.target.value.replace(/^@/, ''));
                    }}
                    autoCapitalize="none"
                    autoComplete="username"
                    placeholder="mayareads"
                    required
                  />
                </Field>
                <Field icon={<Mail className="w-3 h-3 text-[#00E054]" />} label="Email">
                  <input
                    className={inputClass}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    autoCapitalize="none"
                    placeholder="maya@example.com"
                    required
                  />
                </Field>
                <Field icon={<Lock className="w-3 h-3 text-[#00E054]" />} label="Password (8+ characters)">
                  <div className="relative">
                    <input
                      className={`${inputClass} pr-10`}
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoComplete="new-password"
                      placeholder="Create a password"
                      minLength={8}
                      required
                    />
                    {passwordToggle}
                  </div>
                </Field>
                <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 accent-[#00E054] w-4 h-4 shrink-0" />
                  <span className="text-[11px] text-[#8fa0b5] leading-relaxed">
                    I agree to the Letterbook terms and understand my data is stored on this device.
                  </span>
                </label>
                {errorBox}
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-3.5 rounded-xl bg-[#00E054] hover:bg-[#12cb4d] disabled:opacity-50 text-black text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              </form>
              <p className="text-center text-xs text-[#8fa0b5]">
                Already have an account?{' '}
                <button type="button" onClick={() => go('signin')} className="text-[#00E054] font-bold">
                  Sign in
                </button>
              </p>
            </div>
          </div>
        )}

        {view === 'genres' && pending && (
          <div className="relative z-10 flex-1 flex flex-col px-6 pb-8 pt-10 animate-fadeIn">
            <div className="space-y-2">
              <p className="text-xs font-mono text-[#00E054] uppercase tracking-wider">Almost there</p>
              <h1 className="text-2xl font-extrabold tracking-tight">What do you like to read?</h1>
              <p className="text-xs text-[#8fa0b5]">Pick a few genres and we'll tailor your home feed. You can change this later.</p>
            </div>
            <div className="flex flex-wrap gap-2 pt-6">
              {ONBOARDING_GENRES.map((g) => {
                const on = genres.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setGenres((prev) => (on ? prev.filter((x) => x !== g) : [...prev, g]))}
                    className={`px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      on ? 'bg-[#00E054] text-black' : 'bg-[#1e2a38] text-[#b5c3d3] border border-[#29384b]'
                    }`}
                  >
                    {on && <Check className="w-3 h-3 stroke-[3]" />}
                    {g}
                  </button>
                );
              })}
            </div>
            <div className="flex-1" />
            <button
              type="button"
              onClick={finishOnboarding}
              className="w-full py-3.5 rounded-xl bg-[#00E054] hover:bg-[#12cb4d] text-black text-sm font-bold transition-all active:scale-[0.98]"
            >
              {genres.length ? `Start reading (${genres.length})` : 'Skip for now'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
