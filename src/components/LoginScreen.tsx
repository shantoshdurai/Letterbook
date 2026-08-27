import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Sparkles, Check, ChevronRight, Lock, User, AtSign } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface LoginScreenProps {
  onLogin: (customUser?: { name: string; handle: string }) => void;
}

interface ArtworkSlide {
  title: string;
  year: number;
  author: string;
  image: string;
  quote?: string;
}

const ARTWORK_SLIDES: ArtworkSlide[] = [
  {
    title: 'Tomorrow, and Tomorrow, and Tomorrow',
    year: 2022,
    author: 'Gabrielle Zevin',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=85',
    quote: 'To allow yourself to play with another person is no small risk.'
  },
  {
    title: 'Dune',
    year: 1965,
    author: 'Frank Herbert',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=85',
    quote: 'I must not fear. Fear is the mind-killer.'
  },
  {
    title: 'The Secret History',
    year: 1992,
    author: 'Donna Tartt',
    image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1200&auto=format&fit=crop&q=85',
    quote: 'Beauty is terror. Whatever we call beautiful, we quiver before it.'
  },
  {
    title: 'Piranesi',
    year: 2020,
    author: 'Susanna Clarke',
    image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=1200&auto=format&fit=crop&q=85',
    quote: 'The Beauty of the House is immeasurable; its Kindness infinite.'
  },
  {
    title: 'Yellowface',
    year: 2023,
    author: 'R.F. Kuang',
    image: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=1200&auto=format&fit=crop&q=85',
    quote: 'Writing is a lonely art, until everyone has an opinion.'
  },
];

const GENRE_CHOICES = [
  'Literary Fiction', 'Sci-Fi', 'Fantasy', 'Mystery & Thriller', 
  'Classics', 'Memoir', 'History', 'Horror', 'Philosophy'
];

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  // Screen mode: 'splash', 'signin', 'create_account', 'social'
  const [screenView, setScreenView] = useState<'splash' | 'signin' | 'create_account' | 'social'>('splash');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Sign In Form state
  const [signInUsername, setSignInUsername] = useState('Alex Morgan');
  const [signInPassword, setSignInPassword] = useState('••••••••');

  // Create Account Form state
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Literary Fiction', 'Sci-Fi']);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Social direct login email
  const [socialEmail, setSocialEmail] = useState('alex.morgan@letterbox.app');
  const [socialPassword, setSocialPassword] = useState('••••••••');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentSlide = ARTWORK_SLIDES[currentSlideIndex];

  // Auto carousel rotation across all views so background artwork always changes smoothly
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % ARTWORK_SLIDES.length);
    }, 5500);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({ 
      name: signInUsername || 'Alex Morgan', 
      handle: `@${(signInUsername || 'alexm').toLowerCase().replace(/\s+/g, '')}` 
    });
  };

  const handleCreateAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() && !newUsername.trim()) {
      showToast('Please enter your name or username');
      return;
    }
    const finalName = newName.trim() || 'New Reader';
    const finalHandle = newUsername.trim() 
      ? (newUsername.startsWith('@') ? newUsername : `@${newUsername.toLowerCase().replace(/\s+/g, '')}`)
      : `@${finalName.toLowerCase().replace(/\s+/g, '')}`;

    showToast(`Welcome to Letterbox, ${finalName}!`);
    setTimeout(() => {
      onLogin({ name: finalName, handle: finalHandle });
    }, 400);
  };

  const handleSocialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const handleName = socialEmail.split('@')[0] || 'Alex Morgan';
    onLogin({ name: handleName, handle: `@${handleName.toLowerCase().replace(/\s+/g, '')}` });
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  return (
    <div 
      className="min-h-screen bg-[#0e1216] flex flex-col items-center justify-center p-0 sm:p-4 text-white select-none relative overflow-hidden font-sans" 
      id="letterbox-auth-hub"
    >
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed top-5 z-50 px-4 py-2 rounded-full bg-[#15E558] text-black font-bold text-xs shadow-2xl animate-fadeIn flex items-center gap-1.5 border border-white/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Mode Quick Switcher on Desktop */}
      <div className="absolute top-3 right-3 z-40 hidden sm:flex items-center gap-1 bg-[#182029]/90 border border-[#2b394b] backdrop-blur-md px-2 py-1 rounded-full text-[11px] font-mono shadow-lg">
        <span className="text-[#6c7f96] px-1">View:</span>
        <button
          type="button"
          onClick={() => setScreenView('splash')}
          className={`px-2.5 py-0.5 rounded-full transition-colors ${
            screenView === 'splash' ? 'bg-[#15E558] text-black font-bold' : 'text-[#8fa0b5] hover:text-white'
          }`}
        >
          Splash
        </button>
        <button
          type="button"
          onClick={() => setScreenView('signin')}
          className={`px-2.5 py-0.5 rounded-full transition-colors ${
            screenView === 'signin' ? 'bg-[#15E558] text-black font-bold' : 'text-[#8fa0b5] hover:text-white'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setScreenView('create_account')}
          className={`px-2.5 py-0.5 rounded-full transition-colors ${
            screenView === 'create_account' ? 'bg-[#15E558] text-black font-bold' : 'text-[#8fa0b5] hover:text-white'
          }`}
        >
          Create Account
        </button>
        <button
          type="button"
          onClick={() => setScreenView('social')}
          className={`px-2.5 py-0.5 rounded-full transition-colors ${
            screenView === 'social' ? 'bg-[#15E558] text-black font-bold' : 'text-[#8fa0b5] hover:text-white'
          }`}
        >
          Social
        </button>
      </div>

      {/* Mobile Device Frame Container */}
      <div className="w-full max-w-[400px] h-[100dvh] sm:h-[800px] sm:max-h-[94vh] sm:rounded-[36px] bg-[#14181c] sm:border-[5px] sm:border-[#222c38] shadow-[0_25px_60px_rgba(0,0,0,0.9)] flex flex-col relative overflow-hidden">
        
        {/* ========================================================================= */}
        {/* VIEW 1: WELCOME CAROUSEL SPLASH (Matching Screenshot 1) */}
        {/* ========================================================================= */}
        {screenView === 'splash' && (
          <div className="w-full h-full flex flex-col justify-between relative bg-[#14181c] animate-fadeIn" id="splash-auth-view">
            {/* Top Android Status Bar */}
            <div className="relative z-20 px-6 pt-3 pb-2 flex items-center justify-between text-[11px] font-mono text-white/90">
              <span className="font-semibold tracking-wide">01:24</span>
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 18.25c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l.64-.64C7.93 20.26 9.88 21 12 21s4.07-.74 5.6-1.98l.64.64c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41l-.62-.64C20.26 16.07 21 14.12 21 12c0-4.97-4.03-9-9-9z"/></svg>
                <div className="w-2.5 h-2.5 rounded-full border border-white/60 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
                <span className="text-[10px]">74%</span>
              </div>
            </div>

            {/* High-Resolution Cinematic Backdrop Artwork (Auto-changing) */}
            <div className="absolute inset-0 z-0">
              <img
                src={currentSlide.image}
                alt={currentSlide.title}
                className="w-full h-full object-cover object-center filter brightness-[0.72] transition-all duration-1000 scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#14181c] opacity-95 pointer-events-none" />
              <div className="absolute bottom-0 inset-x-0 h-96 bg-gradient-to-t from-[#14181c] via-[#14181c]/90 to-transparent pointer-events-none" />
            </div>

            {/* Artwork Attribution Watermark */}
            <div className="relative z-10 px-6 pt-2">
              <button
                type="button"
                onClick={() => setCurrentSlideIndex((prev) => (prev + 1) % ARTWORK_SLIDES.length)}
                className="text-[9px] font-mono text-white/80 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 hover:border-white/30 transition-colors inline-flex items-center gap-1.5"
                title="Click to see next artwork"
              >
                <span>Featured: {currentSlide.title} ({currentSlide.year})</span>
                <span className="text-[8px] text-[#15E558]">↻</span>
              </button>
            </div>

            {/* Bottom Content Area */}
            <div className="relative z-20 px-6 pb-6 pt-4 flex flex-col items-center text-center space-y-4">
              {/* Brand Logo with Custom Modern Letterbox Emblem */}
              <div className="flex flex-col items-center space-y-1.5">
                <BrandLogo size="lg" showText={false} />
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center">
                  <span>Letter</span>
                  <span className="text-[#15E558]">box</span>
                </h1>
                <p className="text-xs text-[#8fa0b5] font-sans">
                  The social network for book lovers
                </p>
              </div>

              {/* Action Buttons Stack */}
              <div className="w-full space-y-2.5 pt-1">
                <button
                  type="button"
                  id="splash-sign-in-btn"
                  onClick={() => setScreenView('signin')}
                  className="w-full py-3 rounded-lg bg-[#2c3a4b] hover:bg-[#384a5f] active:scale-[0.98] text-white text-sm font-semibold tracking-wide transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <span>Sign in</span>
                </button>

                <button
                  type="button"
                  id="splash-create-account-btn"
                  onClick={() => setScreenView('create_account')}
                  className="w-full py-3 rounded-lg bg-[#2c3a4b] hover:bg-[#384a5f] active:scale-[0.98] text-white text-sm font-semibold tracking-wide transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <span>Create account</span>
                </button>

                <button
                  type="button"
                  id="splash-skip-step-btn"
                  onClick={() => onLogin({ name: 'Alex Morgan', handle: '@alexm' })}
                  className="w-full py-3 rounded-lg bg-[#222c38]/80 hover:bg-[#283544] text-[#a0b2c6] text-sm font-medium transition-all"
                >
                  Skip this step
                </button>
              </div>

              {/* Disclaimer */}
              <p className="text-[10px] text-[#6c7f96] max-w-[280px] leading-snug">
                An account is not required to browse content, but you must have one to track books and participate
              </p>

              {/* Carousel Pagination Dots */}
              <div className="flex items-center gap-2 pt-1 pb-1">
                {ARTWORK_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      currentSlideIndex === idx ? 'w-5 bg-[#15E558]' : 'w-1.5 bg-white/30 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>

              {/* Android Home Indicator bar */}
              <div className="w-28 h-1 bg-white/40 rounded-full mx-auto" />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: CINEMATIC SIGN IN (With Changing Artwork Images) */}
        {/* ========================================================================= */}
        {screenView === 'signin' && (
          <div className="w-full h-full flex flex-col justify-between relative bg-[#14181c] animate-fadeIn" id="signin-auth-view">
            {/* Top Bar with Android status & Back */}
            <div className="relative z-20 px-4 pt-3 flex items-center justify-between text-white/90">
              <button
                type="button"
                onClick={() => setScreenView('splash')}
                className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                title="Back to Splash"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 text-[11px] font-mono">
                <span className="font-semibold">01:24</span>
                <span className="text-[10px]">74%</span>
              </div>
            </div>

            {/* High-Resolution Cinematic Artwork Backdrop (Changes smoothly) */}
            <div className="absolute inset-0 z-0">
              <img
                src={currentSlide.image}
                alt={currentSlide.title}
                className="w-full h-full object-cover object-center filter brightness-[0.68] transition-all duration-1000 scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-[#14181c] pointer-events-none" />
              <div className="absolute bottom-0 inset-x-0 h-[460px] bg-gradient-to-t from-[#14181c] via-[#14181c]/95 to-transparent pointer-events-none" />
            </div>

            {/* Artwork Badge */}
            <div className="relative z-10 px-6 pt-1">
              <span className="text-[9px] font-mono text-white/70 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10">
                Featured: {currentSlide.title} ({currentSlide.year})
              </span>
            </div>

            {/* Bottom Form Container */}
            <div className="relative z-20 px-6 pb-6 pt-2 flex flex-col space-y-4">
              {/* Header Title with Brand Logo */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Sign in to Letterbox</h2>
                  <p className="text-xs text-[#8fa0b5]">Enter your credentials to continue</p>
                </div>
                <BrandLogo size="sm" showText={false} />
              </div>

              {/* Form with clean underline fields */}
              <form onSubmit={handleSignInSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] text-[#8fa0b5] font-medium flex items-center gap-1.5">
                    <User className="w-3 h-3 text-[#15E558]" />
                    <span>Username or Email</span>
                  </label>
                  <input
                    type="text"
                    value={signInUsername}
                    onChange={(e) => setSignInUsername(e.target.value)}
                    placeholder="Enter your username or email"
                    className="w-full bg-transparent border-b border-[#3b4b5d] pb-1.5 text-sm text-white placeholder-[#536579] focus:outline-none focus:border-[#15E558] transition-colors"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-[#8fa0b5] font-medium flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-[#15E558]" />
                    <span>Password</span>
                  </label>
                  <input
                    type="password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-transparent border-b border-[#3b4b5d] pb-1.5 text-sm text-white placeholder-[#536579] focus:outline-none focus:border-[#15E558] transition-colors"
                    required
                  />
                </div>

                {/* Buttons Row: [JOIN] [RESET PASSWORD] [GO] */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setScreenView('create_account')}
                    className="px-3.5 py-1.5 rounded-md bg-[#283849] hover:bg-[#34485d] text-[10px] font-mono font-bold uppercase tracking-wider text-white transition-colors"
                  >
                    JOIN
                  </button>

                  <button
                    type="button"
                    onClick={() => showToast('Password reset link sent to demo account')}
                    className="px-3.5 py-1.5 rounded-md bg-[#283849] hover:bg-[#34485d] text-[10px] font-mono font-bold uppercase tracking-wider text-white transition-colors"
                  >
                    RESET PASSWORD
                  </button>

                  <button
                    type="submit"
                    className="ml-auto px-5 py-1.5 rounded-md bg-[#15E558] hover:bg-[#12cb4d] text-black text-xs font-mono font-black uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(21,229,88,0.4)] active:scale-95"
                  >
                    GO
                  </button>
                </div>
              </form>

              {/* Bottom Quick Switch & Artwork Attribution */}
              <div className="pt-2 flex flex-col space-y-2 text-[10px] font-mono text-[#6c7f96]">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setScreenView('create_account')}
                    className="text-[#15E558] hover:underline"
                  >
                    New here? Create an account →
                  </button>
                  <button
                    type="button"
                    onClick={() => setScreenView('social')}
                    className="text-[#40BCF4] hover:underline"
                  >
                    Social Login →
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-[#232e3b] pt-2">
                  <span>Artwork from {currentSlide.title} ({currentSlide.year})</span>
                  <button
                    type="button"
                    onClick={() => setCurrentSlideIndex((prev) => (prev + 1) % ARTWORK_SLIDES.length)}
                    className="text-[#8fa0b5] hover:text-white"
                  >
                    Next art ↻
                  </button>
                </div>
              </div>

              {/* Android Home Indicator bar */}
              <div className="w-28 h-1 bg-white/40 rounded-full mx-auto pt-1" />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: CREATE ACCOUNT (With Changing Cinematic Backdrop & Rich Form) */}
        {/* ========================================================================= */}
        {screenView === 'create_account' && (
          <div className="w-full h-full flex flex-col justify-between relative bg-[#14181c] animate-fadeIn" id="create-account-view">
            {/* Top Bar with Android status & Back */}
            <div className="relative z-20 px-4 pt-3 flex items-center justify-between text-white/90">
              <button
                type="button"
                onClick={() => setScreenView('splash')}
                className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                title="Back to Splash"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono bg-[#15E558]/20 text-[#15E558] px-2 py-0.5 rounded-full font-bold border border-[#15E558]/30">
                  Join Letterbox
                </span>
                <span className="text-[11px] font-mono text-white/80">01:24</span>
              </div>
            </div>

            {/* High-Resolution Cinematic Artwork Backdrop (Changes smoothly!) */}
            <div className="absolute inset-0 z-0">
              <img
                src={currentSlide.image}
                alt={currentSlide.title}
                className="w-full h-full object-cover object-center filter brightness-[0.62] transition-all duration-1000 scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-[#14181c] pointer-events-none" />
              <div className="absolute bottom-0 inset-x-0 h-[520px] bg-gradient-to-t from-[#14181c] via-[#14181c]/95 to-transparent pointer-events-none" />
            </div>

            {/* Top Artwork Badge */}
            <div className="relative z-10 px-6 pt-1 flex items-center justify-between">
              <span className="text-[9px] font-mono text-white/70 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10">
                Featured: {currentSlide.title} ({currentSlide.year})
              </span>
              <button
                type="button"
                onClick={() => setCurrentSlideIndex((prev) => (prev + 1) % ARTWORK_SLIDES.length)}
                className="text-[9px] font-mono text-[#8fa0b5] hover:text-white bg-black/40 px-2 py-0.5 rounded-full border border-white/10"
              >
                Next art ↻
              </button>
            </div>

            {/* Scrollable Create Account Form Container */}
            <div className="relative z-20 px-6 pb-5 pt-1 flex flex-col overflow-y-auto max-h-[85%] no-scrollbar space-y-3.5">
              {/* Header */}
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <BrandLogo size="sm" showText={false} />
                  <h2 className="text-xl font-black text-white tracking-tight">Create your Account</h2>
                </div>
                <p className="text-xs text-[#8fa0b5]">
                  Track reads, write reviews, and build lists with book lovers.
                </p>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleCreateAccountSubmit} className="space-y-3">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-[11px] text-[#8fa0b5] font-medium flex items-center gap-1.5">
                    <User className="w-3 h-3 text-[#15E558]" />
                    <span>Your Name</span>
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => {
                      setNewName(e.target.value);
                      if (!newUsername && e.target.value) {
                        setNewUsername(e.target.value.toLowerCase().replace(/\s+/g, ''));
                      }
                    }}
                    placeholder="e.g. Maya Lin"
                    className="w-full bg-[#18222d]/80 border border-[#2d3d50] focus:border-[#15E558] rounded-lg px-3 py-2 text-xs text-white placeholder-[#536579] focus:outline-none transition-colors"
                    required
                  />
                </div>

                {/* Username */}
                <div className="space-y-1">
                  <label className="text-[11px] text-[#8fa0b5] font-medium flex items-center gap-1.5">
                    <AtSign className="w-3 h-3 text-[#15E558]" />
                    <span>Username</span>
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="e.g. mayareads"
                    className="w-full bg-[#18222d]/80 border border-[#2d3d50] focus:border-[#15E558] rounded-lg px-3 py-2 text-xs text-white placeholder-[#536579] focus:outline-none transition-colors"
                    required
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-[11px] text-[#8fa0b5] font-medium flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-[#15E558]" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="e.g. maya@example.com"
                    className="w-full bg-[#18222d]/80 border border-[#2d3d50] focus:border-[#15E558] rounded-lg px-3 py-2 text-xs text-white placeholder-[#536579] focus:outline-none transition-colors"
                    required
                  />
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-[11px] text-[#8fa0b5] font-medium flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-[#15E558]" />
                    <span>Password</span>
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Create a secure password"
                    className="w-full bg-[#18222d]/80 border border-[#2d3d50] focus:border-[#15E558] rounded-lg px-3 py-2 text-xs text-white placeholder-[#536579] focus:outline-none transition-colors"
                    required
                  />
                </div>

                {/* Favorite Genres Selection Pills */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] text-[#8fa0b5] font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[#40BCF4]" />
                    <span>Select genres you love:</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {GENRE_CHOICES.map((genre) => {
                      const isSelected = selectedGenres.includes(genre);
                      return (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => toggleGenre(genre)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all flex items-center gap-1 ${
                            isSelected
                              ? 'bg-[#15E558] text-black font-bold shadow-sm'
                              : 'bg-[#1e2a38] text-[#8fa0b5] hover:text-white border border-[#29384b]'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          <span>{genre}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Terms agreement checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms-check"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="accent-[#15E558] rounded cursor-pointer w-3.5 h-3.5"
                  />
                  <label htmlFor="terms-check" className="text-[10px] text-[#8fa0b5] cursor-pointer">
                    I agree to Letterbox Terms of Service & Privacy Policy
                  </label>
                </div>

                {/* Primary Submit Button */}
                <button
                  type="submit"
                  disabled={!agreeTerms}
                  className="w-full py-3 rounded-lg bg-[#15E558] hover:bg-[#12cb4d] disabled:opacity-50 text-black text-sm font-black tracking-wide uppercase font-mono transition-all shadow-[0_0_20px_rgba(21,229,88,0.4)] active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
                >
                  <span>Create Account</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </form>

              {/* Already have an account switch */}
              <div className="text-center pt-1 pb-1">
                <button
                  type="button"
                  onClick={() => setScreenView('signin')}
                  className="text-xs text-[#8fa0b5] hover:text-white"
                >
                  Already have an account? <span className="text-[#15E558] font-bold underline">Sign in</span>
                </button>
              </div>

              {/* Android Home Indicator bar */}
              <div className="w-28 h-1 bg-white/40 rounded-full mx-auto pt-1 shrink-0" />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: MINIMALIST DARK SOCIAL AUTH (Matching Screenshot 2) */}
        {/* ========================================================================= */}
        {screenView === 'social' && (
          <div className="w-full h-full flex flex-col justify-between p-6 bg-[#14181c] animate-fadeIn" id="social-auth-view">
            {/* Top Android Status Bar */}
            <div className="flex items-center justify-between text-[11px] font-mono text-white/90">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setScreenView('splash')}
                  className="p-1 rounded-full hover:bg-[#202c3a] text-white/80"
                  title="Back"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <span className="font-semibold tracking-wide">9:30</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 18.25c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l.64-.64C7.93 20.26 9.88 21 12 21s4.07-.74 5.6-1.98l.64.64c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41l-.62-.64C20.26 16.07 21 14.12 21 12c0-4.97-4.03-9-9-9z"/></svg>
                <div className="w-3 h-2 rounded-sm border border-white flex items-center justify-start p-0.5">
                  <div className="w-full h-full bg-white rounded-xs"></div>
                </div>
              </div>
            </div>

            {/* Logo & Header */}
            <div className="flex flex-col items-center text-center space-y-2 my-auto">
              <BrandLogo size="lg" showText={false} />
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center">
                <span>Letter</span>
                <span className="text-[#15E558]">box</span>
              </h2>
              <p className="text-xs text-[#6c7f96]">The social network for book lovers</p>

              {/* Direct Form */}
              <form onSubmit={handleSocialSubmit} className="w-full space-y-3 pt-3">
                <input
                  type="text"
                  value={socialEmail}
                  onChange={(e) => setSocialEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-5 py-3 rounded-full bg-[#232f3d] border border-transparent focus:border-[#15E558] text-white text-xs placeholder-[#5a6e85] focus:outline-none transition-colors"
                  required
                />

                <input
                  type="password"
                  value={socialPassword}
                  onChange={(e) => setSocialPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-5 py-3 rounded-full bg-[#232f3d] border border-transparent focus:border-[#15E558] text-white text-xs placeholder-[#5a6e85] focus:outline-none transition-colors"
                  required
                />

                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => showToast('Password reset sent')}
                    className="text-[11px] text-[#6c7f96] hover:text-[#9bb0c7] transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-[#2c415c] hover:bg-[#365173] text-white text-xs font-bold tracking-wide transition-all shadow-md active:scale-98"
                >
                  Log In
                </button>
              </form>

              {/* Divider: — or — */}
              <div className="w-full flex items-center py-2">
                <div className="flex-1 h-px bg-[#232f3d]" />
                <span className="px-3 text-xs text-[#526377]">or</span>
                <div className="flex-1 h-px bg-[#232f3d]" />
              </div>

              {/* Social Login Options */}
              <div className="w-full space-y-2">
                <button
                  type="button"
                  onClick={() => onLogin({ name: 'Alex Morgan', handle: '@alexm' })}
                  className="w-full py-2.5 px-4 rounded-full bg-[#182029] border border-[#273444] hover:bg-[#222d3a] flex items-center justify-center gap-2.5 text-xs font-medium text-white transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#8fa0b5]" />
                  <span>Continue with Email</span>
                </button>

                <button
                  type="button"
                  onClick={() => onLogin({ name: 'Alex Morgan', handle: '@alexm' })}
                  className="w-full py-2.5 px-4 rounded-full bg-[#182029] border border-[#273444] hover:bg-[#222d3a] flex items-center justify-center gap-2.5 text-xs font-medium text-white transition-colors"
                >
                  {/* Google G Logo SVG */}
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => onLogin({ name: 'Alex Morgan', handle: '@alexm' })}
                  className="w-full py-2.5 px-4 rounded-full bg-[#182029] border border-[#273444] hover:bg-[#222d3a] flex items-center justify-center gap-2.5 text-xs font-medium text-white transition-colors"
                >
                  {/* Apple Logo SVG */}
                  <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.58-7.7-11.66-13.98-5.7-8.7-10.15-18.73-13.36-30.08-3.21-11.35-4.82-22.06-4.82-32.12 0-14.68 3.73-26.68 11.2-36 7.46-9.32 16.7-14.07 27.71-14.25 4.88 0 10.28 1.25 16.19 3.74 5.92 2.49 9.8 3.79 11.66 3.89 1.48 0 5.6-1.37 12.37-4.11 6.77-2.74 12.56-3.9 17.37-3.48 13.06.96 23.36 5.86 30.91 14.7-11.44 6.9-17.06 16.38-16.86 28.43.2 9.54 3.88 17.52 11.03 23.94 7.15 6.42 15.7 10.11 25.66 11.08-2.02 6.08-4.47 12.06-7.37 17.94zM119.22 33.64c0-7.36 2.68-14.38 8.04-21.06 5.37-6.68 11.96-10.96 19.78-12.83.67 1.48 1.01 3.01 1.01 4.59 0 7.37-2.73 14.47-8.2 21.3-5.46 6.83-12.18 11.09-20.15 12.79-.13-1.63-.48-3.23-.48-4.79z"/>
                  </svg>
                  <span>Continue with Apple</span>
                </button>
              </div>
            </div>

            {/* Bottom Terms & Indicator */}
            <div className="space-y-3 pt-2 text-center">
              <p className="text-[10px] text-[#556677] leading-tight max-w-[280px] mx-auto">
                By signing up you agree to our <span className="text-[#8fa0b5] underline">Terms of Use</span> & <span className="text-[#8fa0b5] underline">Privacy Policy</span>
              </p>
              <div className="w-28 h-1 bg-white/40 rounded-full mx-auto" />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
