import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { 
  BookOpen, 
  Sparkles, 
  Archive, 
  User, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  MoreHorizontal, 
  Search, 
  Calendar, 
  History, 
  Lightbulb,
  CheckCircle2,
  ArrowLeft,
  Share2,
  Dumbbell,
  MoonStar,
  Waves,
  Info,
  Quote,
  Smile,
  Meh,
  Frown,
  Leaf,
  Cloud,
  Coffee,
  Moon,
  Sun,
  Settings,
  Bell,
  RefreshCw,
  Award,
  Flame,
  Clock,
  ArrowRight,
  Edit2,
  Save,
  X,
  PartyPopper,
  LayoutDashboard,
  Target,
  Heart,
  LogOut,
  Plus,
  Flower,
  Droplets,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ViewType, Mood, JournalEntry, UserProfile, DailyLog, Habit, UserAccount } from './types';

// --- Mock Data ---
// --- Constants ---
// Utility to safely parse JSON and catch Vercel HTML errors
const safeJsonParse = async (res: Response) => {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    if (text.includes('<html')) {
      throw new Error('Server returned an HTML page. The Vercel backend API may not be deployed correctly.');
    }
    throw new Error('Failed to parse server response.');
  }
};

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const HABIT_POOL = [
  'Drink water', 'Morning stretch', 'Meditation', 'Read 10 pages', 'No sugar',
  'Go for a walk', 'Journaling', 'Deep breathing', 'Call a friend', 'Tidy up',
  'Healthy breakfast', 'No social media', 'Gratitude list', 'Cold shower', 'Plan the day'
];

const REFLECTION_PROMPTS = [
  "What made you smile today?",
  "What gave you energy today?",
  "What’s one thing you’re grateful for?",
  "What felt peaceful today?",
  "What did you learn today?",
  "What is something you're proud of today?",
  "What was the highlight of your morning?",
  "Who inspired you today?",
  "What's a small win you had today?"
];

const ENTRIES: JournalEntry[] = [
  {
    id: '1',
    date: 'Monday, Oct 23',
    title: 'The Morning Mist',
    content: 'Woke up early and watched the fog roll over the valley. It felt like the world was holding its breath...',
    mood: 'Calm',
    tags: ['nature', 'morning']
  },
  {
    id: '2',
    date: 'Sunday, Oct 22',
    title: 'Weekly Completion',
    content: 'Finished the 7-day mindfulness challenge. Feeling a renewed sense of clarity and purpose today...',
    mood: 'Joy',
    tags: ['milestone', 'mindfulness']
  },
  {
    id: '3',
    date: 'Thursday, Oct 19',
    title: 'Quiet Thoughts',
    content: "Revisited some old goals. It's okay that I haven't reached them all yet. Growth isn't a straight line...",
    mood: 'Reflective',
    tags: ['goals', 'growth']
  }
];

// --- Components ---

const BottomNav = ({ 
  activeView, 
  setView, 
  onOpenJournal,
  hasLoggedToday,
  isDarkMode
}: { 
  activeView: ViewType, 
  setView: (v: ViewType) => void, 
  onOpenJournal: () => void,
  hasLoggedToday: boolean,
  isDarkMode: boolean
}) => {
  return (
    <nav className={`fixed bottom-6 left-6 right-6 ${isDarkMode ? 'bg-neutral-800/90 border-neutral-700' : 'bg-white/90 border-sage-100'} backdrop-blur-xl border px-8 py-4 rounded-[2rem] flex justify-between items-center z-50 max-w-md mx-auto shadow-lg`}>
      <button
        onClick={() => setView('insights')}
        className={`flex flex-col items-center gap-1.5 transition-all w-16 ${
          activeView === 'insights' ? 'text-primary scale-110' : (isDarkMode ? 'text-neutral-500 hover:text-neutral-300' : 'text-[#8E8E8A] hover:text-[#4A4A4A]')
        }`}
      >
        <Sparkles size={20} strokeWidth={activeView === 'insights' ? 2.5 : 2} />
        <span className="text-[9px] font-bold uppercase tracking-[0.15em]">Insights</span>
      </button>

      <div className="relative">
        {!hasLoggedToday && (
          <div className={`absolute bottom-full mb-6 left-1/2 -translate-x-1/2 w-56 p-3 rounded-2xl shadow-xl z-50 border-2 animate-bounce flex flex-col items-center ${
            isDarkMode ? 'bg-neutral-800 border-primary shadow-black/50' : 'bg-[#F9FBF9] border-[#2C4C3B] shadow-[#2C4C3B]/10'
          }`}>
            <p className={`text-[11px] leading-relaxed text-center ${isDarkMode ? 'text-neutral-200' : 'text-[#1A1A1A]'}`}>
              Tap the + button in the bottom menu to add a daily log.
            </p>
            <div className={`absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-4 h-4 border-b-2 border-r-2 transform rotate-45 ${
              isDarkMode ? 'bg-neutral-800 border-primary' : 'bg-[#F9FBF9] border-[#2C4C3B]'
            }`}></div>
          </div>
        )}
        <button
          onClick={onOpenJournal}
          className={`w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/30 transform -translate-y-4 hover:scale-105 transition-all border-4 ${isDarkMode ? 'border-neutral-900' : 'border-cream-50'}`}
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>
      </div>

      <button
        onClick={() => setView('profile')}
        className={`flex flex-col items-center gap-1.5 transition-all w-16 ${
          activeView === 'profile' ? 'text-primary scale-110' : 'text-[#8E8E8A] hover:text-[#4A4A4A]'
        }`}
      >
        <User size={20} strokeWidth={activeView === 'profile' ? 2.5 : 2} />
        <span className="text-[9px] font-bold uppercase tracking-[0.15em]">Me</span>
      </button>
    </nav>
  );
};

// Legacy TutorialModal removed.

const WelcomeView = ({ onGetStarted, onLogin }: { onGetStarted: () => void, onLogin: () => void }) => (
  <div className="flex-1 flex flex-col justify-center text-center px-4">
    <div className="relative mx-auto mb-12">
      <div className="size-32 bg-gradient-to-tr from-sage-100 to-gold-100 rounded-full flex items-center justify-center shadow-inner">
        <MoonStar size={64} className="text-primary" />
      </div>
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute -top-4 -right-4 size-16 bg-gold-100 rounded-full blur-xl"
      />
    </div>
    <h1 className="text-5xl font-bold text-[#1A1A1A] mb-4 font-display tracking-tight">
      Soluna
    </h1>
    <p className="text-lg text-[#4A4A4A] mb-12 font-medium">
      Understand your moods. Find your balance.
    </p>
    <div className="space-y-4">
      <button
        onClick={onGetStarted}
        className="w-full bg-primary hover:bg-primary/90 py-5 rounded-2xl text-white font-sans text-sm font-bold tracking-widest uppercase shadow-lg shadow-sage-100 transition-all"
      >
        Get Started
      </button>
      <button
        onClick={onLogin}
        className="w-full bg-white border-2 border-sage-100 hover:bg-sage-50 py-5 rounded-2xl text-primary font-sans text-sm font-bold tracking-widest uppercase transition-all"
      >
        Log In
      </button>
    </div>
  </div>
);

const SignUpView = ({ onBack, onSignUp }: { onBack: () => void, onSignUp: (user: UserAccount) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await safeJsonParse(res);
      if (!res.ok) throw new Error(data?.error || 'Failed to register');
      onSignUp(data.user);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex-1 flex flex-col px-4 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-[#8E8E8A] mb-12 hover:text-[#4A4A4A] transition-colors">
        <ChevronLeft size={20} />
        <span className="text-xs font-bold uppercase tracking-widest">Back</span>
      </button>
      
      <h2 className="text-3xl font-bold text-[#1A1A1A] mb-2">Create Account</h2>
      <p className="text-[#8E8E8A] mb-8">Join Soluna and start your journey.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#8E8E8A] ml-1">Username</label>
          <input 
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-white border-2 border-sage-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary transition-all"
            placeholder="Enter username"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#8E8E8A] ml-1">Password</label>
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white border-2 border-sage-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary transition-all"
            placeholder="Min. 6 characters"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#8E8E8A] ml-1">Confirm Password</label>
          <input 
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-white border-2 border-sage-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary transition-all"
            placeholder="Repeat password"
          />
        </div>

        {error && <p className="text-red-500 text-xs font-medium ml-1">{error}</p>}

        <button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 py-5 rounded-2xl text-white font-sans text-sm font-bold tracking-widest uppercase shadow-lg shadow-sage-100 transition-all mt-4"
        >
          Create Account
        </button>
      </form>
    </div>
  );
};

const LogInView = ({ onBack, onLogin }: { onBack: () => void, onLogin: (user: UserAccount, remember: boolean) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await safeJsonParse(res);
      if (!res.ok) throw new Error(data?.error || 'Failed to login');
      onLogin(data.user, remember);
    } catch (err: any) {
      setError(err.message || 'Invalid username or password.');
    }
  };

  return (
    <div className="flex-1 flex flex-col px-4 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-[#8E8E8A] mb-12 hover:text-[#4A4A4A] transition-colors">
        <ChevronLeft size={20} />
        <span className="text-xs font-bold uppercase tracking-widest">Back</span>
      </button>
      
      <h2 className="text-3xl font-bold text-[#1A1A1A] mb-2">Welcome Back</h2>
      <p className="text-[#8E8E8A] mb-8">Sign in to continue your progress.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#8E8E8A] ml-1">Username</label>
          <input 
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-white border-2 border-sage-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary transition-all"
            placeholder="Enter username"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#8E8E8A] ml-1">Password</label>
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white border-2 border-sage-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary transition-all"
            placeholder="Enter password"
          />
        </div>

        <div className="flex items-center gap-3 ml-1">
          <button 
            type="button"
            onClick={() => setRemember(!remember)}
            className={`size-5 rounded-md border-2 transition-all flex items-center justify-center ${remember ? 'bg-primary border-primary' : 'border-sage-100'}`}
          >
            {remember && <CheckCircle2 size={14} className="text-white" />}
          </button>
          <span className="text-xs font-medium text-[#4A4A4A]">Remember me</span>
        </div>

        {error && <p className="text-red-500 text-xs font-medium ml-1">{error}</p>}

        <button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 py-5 rounded-2xl text-white font-sans text-sm font-bold tracking-widest uppercase shadow-lg shadow-sage-100 transition-all mt-4"
        >
          Log In
        </button>
      </form>
    </div>
  );
};

const DashboardPlaceholderView = ({ onContinue }: { onContinue: () => void }) => (
  <div className="flex-1 flex flex-col justify-center text-center px-4">
    <div className="size-24 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
      <Sun size={48} className="text-primary" />
    </div>
    <h2 className="text-4xl font-bold text-[#1A1A1A] mb-4 font-display">
      Welcome to Soluna
    </h2>
    <p className="text-lg text-[#4A4A4A] mb-12 leading-relaxed">
      This is where your daily mood check-in and insights will appear.
    </p>
    <button
      onClick={onContinue}
      className="w-full bg-primary hover:bg-primary/90 py-5 rounded-2xl text-white font-sans text-sm font-bold tracking-widest uppercase shadow-lg transition-all"
    >
      Enter Dashboard
    </button>
  </div>
);

const OnboardingView = ({ onComplete, initialProfile }: { onComplete: (profile: UserProfile) => void, initialProfile: UserProfile | null }) => {
  const [step, setStep] = useState(initialProfile?.name ? 3 : 2); // Start from name step, or skip if name is known
  const [profile, setProfile] = useState<UserProfile>({ 
    name: initialProfile?.name || '', 
    goal: initialProfile?.goal || '' 
  });

  const nextStep = () => setStep(s => s + 1);

  const handleNameSubmit = (name: string) => {
    setProfile(prev => ({ ...prev, name, goal: 'Finding peace in the present moment' })); // Default goal
    nextStep();
  };

  const handleMoodSelect = (mood: string) => {
    setProfile(prev => {
      const updated = { ...prev, initialMood: mood };
      // Both returning users and first-time users finish onboarding here now.
      // Dashboard Joyride will handle exactly when to trigger tutorial.
      onComplete(updated);
      return updated;
    });
  };

  return (
    <div className="min-h-screen flex flex-col px-8 py-12">
      <div className="flex justify-center gap-2 mb-12">
        {[2, 3].map(s => (
          <div 
            key={s} 
            className={`h-1.5 rounded-full transition-all duration-500 ${
              s <= step ? 'bg-primary w-8' : 'bg-sage-100 w-4'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col justify-center"
          >
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-[#1A1A1A] mb-4">What's your name?</h1>
              <p className="text-[#4A4A4A] italic">We'd love to know who we're journeying with.</p>
            </div>
            <NameForm onSubmit={handleNameSubmit} />
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col justify-center"
          >
            <div className="text-center mb-12">
              <div className="size-20 bg-sage-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart size={40} className="text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-[#1A1A1A] mb-4">How are you feeling?</h1>
              <p className="text-[#4A4A4A] italic">Checking in with yourself is the first step to balance.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { emoji: '😁', label: 'Very Happy' },
                { emoji: '🙂', label: 'Happy' },
                { emoji: '😐', label: 'Neutral' },
                { emoji: '😔', label: 'Low' },
                { emoji: '😫', label: 'Very Low' }
              ].map((m) => (
                <button 
                  key={m.label} 
                  onClick={() => handleMoodSelect(m.label)}
                  className="bg-white border-2 border-sage-100 p-6 rounded-3xl flex flex-col items-center gap-2 hover:border-primary transition-all active:scale-95"
                >
                  <span className="text-3xl">{m.emoji}</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#8E8E8A]">{m.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const NameForm = ({ onSubmit }: { onSubmit: (name: string) => void }) => {
  const [name, setName] = useState('');

  return (
    <form 
      onSubmit={(e) => { e.preventDefault(); onSubmit(name); }} 
      className="space-y-8"
    >
      <div>
        <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-[#8E8E8A] mb-3">
          What should we call you?
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full bg-white border-2 border-sage-100 rounded-2xl py-4 px-6 text-[#1A1A1A] placeholder-[#8E8E8A]/50 focus:border-primary transition-all font-serif text-lg"
          required
        />
      </div>

      <button
        type="submit"
        disabled={!name.trim()}
        className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 py-5 rounded-2xl text-white font-sans text-sm font-bold tracking-widest uppercase shadow-lg transition-all flex items-center justify-center gap-2"
      >
        Continue
        <ArrowRight size={18} />
      </button>
    </form>
  );
};

const ReflectionCard = ({ content, label }: { content: string, label: string, key?: any }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = content.length > 100;
  return (
    <div className="bg-white p-4 rounded-2xl border border-sage-50 shadow-sm italic text-[#4A4A4A] text-xs flex flex-col justify-between">
      <p className={`leading-relaxed ${!isExpanded && isLong ? 'line-clamp-2' : ''}`}>
        "{content}"
      </p>
      {isLong && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[9px] font-bold text-primary uppercase tracking-widest mt-1 text-left"
        >
          {isExpanded ? 'Show Less' : 'Read More'}
        </button>
      )}
      <div className="flex justify-between items-center mt-auto pt-3 border-t border-sage-50">
        <span className="text-[8px] font-bold text-[#8E8E8A] uppercase tracking-widest">{label}</span>
        <Quote size={10} className="text-sage-100" />
      </div>
    </div>
  );
};

const JournalEntryModal = ({ 
  selectedDate,
  profile, 
  dailyLogs, 
  onUpdateLog, 
  onClose,
  isDarkMode, 
  setIsDarkMode, 
  isLoaded,
  currentUser
}: { 
  selectedDate: string,
  profile: UserProfile | null, 
  dailyLogs: Record<string, DailyLog>,
  onUpdateLog: (date: string, log: Partial<DailyLog>) => void,
  onClose: () => void,
  isDarkMode: boolean,
  setIsDarkMode: (v: boolean) => void,
  isLoaded: boolean,
  currentUser: UserAccount | null
}) => {
  const currentLog: DailyLog = dailyLogs[selectedDate] || {
    date: selectedDate,
    habits: []
  };

  const [isSaved, setIsSaved] = useState(false);
  const [reflectionInput, setReflectionInput] = useState('');
  const [potentialHabits, setPotentialHabits] = useState<string[]>([]);
  const [selectedHabitNames, setSelectedHabitNames] = useState<string[]>(() => {
    if (selectedDate !== formatDateKey(new Date())) return [];
    const saved = localStorage.getItem('soluna_selected_habits');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (selectedDate === formatDateKey(new Date())) {
      localStorage.setItem('soluna_selected_habits', JSON.stringify(selectedHabitNames));
    }
  }, [selectedHabitNames, selectedDate]);

  useEffect(() => {
    if (!isLoaded) return;
    const oldIds = ['1', '2', '3'];
    const isOldDefault = currentLog.habits.length === 3 && 
                         currentLog.habits.every(h => oldIds.includes(h.id));
    
    if (isOldDefault) {
      onUpdateLog(selectedDate, { habits: [] });
      return;
    }

    if (currentLog.habits.length === 0 && potentialHabits.length === 0) {
      refreshPotentialHabits();
    }
  }, [selectedDate, currentLog.habits.length, isLoaded]);

  const refreshPotentialHabits = () => {
    const shuffled = [...HABIT_POOL].sort(() => 0.5 - Math.random());
    const newPotentials = [...selectedHabitNames];
    for (const h of shuffled) {
      if (newPotentials.length >= 5) break;
      if (!newPotentials.includes(h)) {
        newPotentials.push(h);
      }
    }
    setPotentialHabits(newPotentials);
  };

  const toggleHabitSelection = (name: string) => {
    setSelectedHabitNames(prev => {
      if (prev.includes(name)) return prev.filter(n => n !== name);
      if (prev.length < 3) return [...prev, name];
      return prev;
    });
  };

  const startHabits = () => {
    const habits: Habit[] = selectedHabitNames.map((name, i) => ({
      id: `${Date.now()}-${i}`,
      name,
      completed: false
    }));
    onUpdateLog(selectedDate, { habits });
  };

  const handleMoodSelect = (mood: string) => {
    onUpdateLog(selectedDate, { mood });
  };
  const handleMoodInfluenceChange = (text: string) => {
    onUpdateLog(selectedDate, { moodInfluence: text });
  };
  const handleInfluenceAdd = (influence: string) => {
    if (!influence.trim()) return;
    const currentInfluences = currentLog.influences || [];
    if (currentInfluences.includes(influence.trim())) return;
    onUpdateLog(selectedDate, { influences: [...currentInfluences, influence.trim()] });
  };
  const handleInfluenceRemove = (influence: string) => {
    const currentInfluences = currentLog.influences || [];
    onUpdateLog(selectedDate, { influences: currentInfluences.filter(i => i !== influence) });
  };
  const handleEnergySelect = (energy: number) => {
    onUpdateLog(selectedDate, { energy });
  };
  const handleHabitToggle = (habitId: string) => {
    const updatedHabits = currentLog.habits.map(h => 
      h.id === habitId ? { ...h, completed: !h.completed } : h
    );
    onUpdateLog(selectedDate, { habits: updatedHabits });
  };
  const handleReflectionChange = (text: string) => setReflectionInput(text);

  const handleSave = () => {
    if (reflectionInput.trim()) {
      let currentReflections = [...(currentLog.reflections || [])];
      if (currentLog.reflection && 
          currentLog.reflection !== 'Skipped for today.' && 
          !currentReflections.includes(currentLog.reflection)) {
        currentReflections.unshift(currentLog.reflection);
      }
      
      const energyIcons = ['🌿', '✨', '☁️', '☕', '🌙'];
      let finalReflection = reflectionInput.trim();
      if (currentLog.energy !== undefined && currentLog.energy >= 0 && currentLog.energy < energyIcons.length) {
          finalReflection += ` ${energyIcons[currentLog.energy]}`;
      }

      const updatedReflections = [...currentReflections, finalReflection];
      onUpdateLog(selectedDate, { 
        reflections: updatedReflections,
        reflection: '' 
      });
    }
    
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  const handleSkip = () => {
    onUpdateLog(selectedDate, { reflection: 'Skipped for today.' });
    onClose();
  };

  const calculateHabitStreak = () => {
    let streak = 0;
    const date = new Date(selectedDate);
    
    while (true) {
      const dateStr = formatDateKey(date);
      const log = dailyLogs[dateStr];
      if (log && log.habits.length > 0 && log.habits.every(h => h.completed)) {
        streak++;
        date.setDate(date.getDate() - 1);
      } else {
        if (dateStr === formatDateKey(new Date()) && streak === 0) {
          date.setDate(date.getDate() - 1);
          const yesterdayStr = formatDateKey(date);
          const yLog = dailyLogs[yesterdayStr];
          if (yLog && yLog.habits.length > 0 && yLog.habits.every(h => h.completed)) {
            continue;
          }
        }
        break;
      }
    }
    return streak;
  };

  const habitStreak = calculateHabitStreak();
  const completedHabits = currentLog.habits.filter(h => h.completed).length;
  const totalHabits = currentLog.habits.length;
  const progressPercent = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

  const getDailyPrompt = (dateStr: string) => {
    const seed = dateStr.split('-').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return REFLECTION_PROMPTS[seed % REFLECTION_PROMPTS.length];
  };

  const dailyPrompt = getDailyPrompt(selectedDate);

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-end sm:items-center bg-black/40 backdrop-blur-sm p-4 sm:p-6" onClick={onClose}>
      <div 
        className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl sm:rounded-[2.5rem] shadow-2xl pb-8 animate-in slide-in-from-bottom-8 duration-300 ${isDarkMode ? 'bg-neutral-900 border border-neutral-700' : 'bg-cream-50'}`} 
        onClick={e => e.stopPropagation()}
      >
        <header className={`px-8 py-6 flex justify-between items-center sticky top-0 z-10 border-b backdrop-blur-md ${isDarkMode ? 'bg-neutral-900/90 border-neutral-800' : 'bg-cream-50/90 border-sage-100/50'}`}>
          <div>
            <p className={`text-sm italic mb-1 ${isDarkMode ? 'text-neutral-500' : 'text-[#4A4A4A]'}`}>
              {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h2 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1A1A1A]'}`}>
              {selectedDate === formatDateKey(new Date()) ? "Today's Entry" : "Past Entry"}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className={`p-3 rounded-full hover:scale-105 transition-all shadow-sm border ${isDarkMode ? 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white' : 'bg-white border-sage-100 hover:bg-sage-50 text-[#8E8E8A] hover:text-[#1A1A1A]'}`}
          >
            <X size={20} />
          </button>
        </header>

        <div className="px-6 sm:px-8 mt-8 space-y-10">
          <section>
            <div className={`rounded-3xl p-6 text-center border ${isDarkMode ? 'bg-neutral-800/50 border-neutral-700' : 'bg-white border-sage-50'}`}>
              <h3 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-[#1A1A1A]'}`}>How are you feeling today?</h3>
              
              <div className="flex justify-center gap-3 sm:gap-4 flex-wrap">
                {[
                  { emoji: '😁', label: 'Very Happy' },
                  { emoji: '🙂', label: 'Happy' },
                  { emoji: '😐', label: 'Neutral' },
                  { emoji: '😔', label: 'Low' },
                  { emoji: '😫', label: 'Very Low' }
                ].map((m) => (
                  <button 
                    key={m.label} 
                    onClick={() => handleMoodSelect(m.label)}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border flex items-center justify-center text-xl sm:text-2xl shadow-sm transition-all group-hover:scale-105 ${
                      (currentLog.mood === m.label && currentLog.date !== undefined && !!currentLog.mood)
                        ? 'border-primary ring-4 ring-primary/10 scale-110 bg-primary/5' 
                        : (isDarkMode ? 'bg-neutral-800 border-neutral-600 hover:border-neutral-500' : 'bg-white border-sage-100')
                    }`}>
                      {m.emoji}
                    </div>
                    <span className={`text-[9px] sm:text-[10px] uppercase tracking-widest font-sans transition-colors ${
                      currentLog.mood === m.label ? 'text-primary font-bold' : (isDarkMode ? 'text-neutral-500 group-hover:text-neutral-300' : 'text-[#8E8E8A] group-hover:text-primary')
                    }`}>
                      {m.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section>
            <div className={`rounded-3xl p-6 border ${isDarkMode ? 'bg-neutral-800/50 border-neutral-700' : 'bg-white border-sage-50'}`}>
              <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-[#1A1A1A]'}`}>What influenced your feeling today?</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {(currentLog.influences || []).map((inf, i) => (
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    key={i} 
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${isDarkMode ? 'bg-neutral-700 text-white' : 'bg-sage-100 text-sage-300'}`}
                  >
                    {inf}
                    <button onClick={() => handleInfluenceRemove(inf)} className="hover:text-red-400 transition-colors ml-1"><X size={12} /></button>
                  </motion.div>
                ))}
              </div>
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                {['Sleep', 'Work', 'Family', 'Exercise', 'Diet', 'Weather'].map(idea => (
                  <button key={idea} onClick={() => handleInfluenceAdd(idea)} className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${isDarkMode ? 'border-neutral-600 text-neutral-400 hover:bg-neutral-700 hover:text-white' : 'border-sage-100 text-[#8E8E8A] hover:bg-sage-50 hover:text-[#1A1A1A]'}`}>
                    + {idea}
                  </button>
                ))}
              </div>
              <input 
                type="text" 
                placeholder="Custom influence..." 
                className={`w-full p-3 rounded-xl border text-sm ${isDarkMode ? 'bg-neutral-900 border-neutral-700 text-white placeholder-neutral-500' : 'bg-[#FAFAFA] border-[#E5E5E0] text-[#1A1A1A] placeholder-[#8E8E8A]'}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleInfluenceAdd(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          </section>

          <section>
            <div className={`rounded-3xl p-6 border ${isDarkMode ? 'bg-neutral-800/50 border-neutral-700' : 'bg-white border-sage-50'}`}>
              <header className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-[#1A1A1A]'}`}>Habit Tracking</h3>
                  {currentLog.habits.length > 0 && (
                    <button 
                      onClick={() => {
                        if (confirm('Reset habits for this day?')) {
                          onUpdateLog(selectedDate, { habits: [] });
                          refreshPotentialHabits();
                        }
                      }}
                      className="text-[10px] font-bold text-[#8E8E8A] hover:text-primary uppercase tracking-widest transition-colors"
                    >
                      Reset
                    </button>
                  )}
                </div>
                {currentLog.habits.length > 0 ? (
                  <>
                    <div className="flex items-center gap-3 mt-4">
                      <div className={`flex-1 h-2 rounded-full overflow-hidden relative ${isDarkMode ? 'bg-neutral-700' : 'bg-sage-50'}`}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercent}%` }}
                          className={`h-full transition-colors duration-500 ${progressPercent === 100 ? 'bg-green-500' : 'bg-primary'}`}
                        />
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${progressPercent === 100 ? 'text-green-500' : (isDarkMode ? 'text-neutral-400' : 'text-[#8E8E8A]')}`}>
                        {completedHabits}/{totalHabits}
                      </span>
                    </div>
                    <p className={`text-xs italic mt-2 ${isDarkMode ? 'text-neutral-500' : 'text-[#8E8E8A]'}`}>Pick up to 3 habits to focus on</p>
                  </>
                ) : (
                  <p className={`text-xs italic ${isDarkMode ? 'text-neutral-500' : 'text-[#8E8E8A]'}`}>Pick up to 3 habits to focus on</p>
                )}
              </header>

              {currentLog.habits.length > 0 ? (
                <div className="space-y-3">
                  {currentLog.habits.map((habit) => (
                    <motion.button 
                      key={habit.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleHabitToggle(habit.id)}
                      className={`w-full p-4 rounded-xl border transition-all flex items-center justify-between ${
                        habit.completed 
                          ? (isDarkMode ? 'bg-primary/20 border-primary/50' : 'bg-primary/5 border-primary/20')
                          : (isDarkMode ? 'bg-neutral-800 border-neutral-600' : 'bg-white border-sage-50')
                      }`}
                    >
                      <span className={`font-medium ${habit.completed ? 'text-primary line-through opacity-80' : (isDarkMode ? 'text-neutral-300' : 'text-[#4A4A4A]')}`}>
                        {habit.name}
                      </span>
                      <div className={`size-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        habit.completed ? 'bg-primary border-primary' : (isDarkMode ? 'border-neutral-500' : 'border-sage-100')
                      }`}>
                        {habit.completed && <CheckCircle2 size={14} className="text-white" />}
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {potentialHabits.map((name) => {
                    const isSelected = selectedHabitNames.includes(name);
                    return (
                      <button
                        key={name}
                        onClick={() => toggleHabitSelection(name)}
                        className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                          isSelected 
                            ? (isDarkMode ? 'bg-primary/20 border-primary' : 'bg-primary/10 border-primary') 
                            : (isDarkMode ? 'bg-neutral-800 border-neutral-600' : 'bg-white border-sage-50')
                        }`}
                      >
                        <span className={`text-sm font-medium ${isSelected ? 'text-primary' : (isDarkMode ? 'text-neutral-300' : 'text-[#4A4A4A]')}`}>{name}</span>
                        {isSelected && <CheckCircle2 size={16} className="text-primary" />}
                      </button>
                    );
                  })}
                  <div className="flex gap-3 mt-4">
                    <button onClick={refreshPotentialHabits} className={`p-4 rounded-xl border transition-colors ${isDarkMode ? 'border-neutral-600 text-neutral-400 hover:bg-neutral-700' : 'border-sage-100 text-[#8E8E8A] hover:bg-sage-50'}`}>
                      <RefreshCw size={20} />
                    </button>
                    <button onClick={startHabits} disabled={selectedHabitNames.length === 0} className="flex-1 bg-primary text-white py-4 rounded-xl font-bold text-sm tracking-widest uppercase shadow-lg disabled:opacity-50">
                      Start {selectedHabitNames.length} {selectedHabitNames.length === 1 ? 'Habit' : 'Habits'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className={`rounded-3xl p-6 border relative overflow-hidden ${isDarkMode ? 'bg-neutral-800/50 border-neutral-700' : 'bg-white border-sage-50'}`}>
            <header className="mb-6 flex justify-between items-start">
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-[#1A1A1A]'}`}>Daily reflection</h3>
              <button 
                onClick={handleSkip} 
                className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${currentLog.reflection === 'Skipped for today.' ? 'text-primary' : 'text-[#8E8E8A] hover:text-primary'}`}
              >
                {currentLog.reflection === 'Skipped for today.' ? 'Skipped' : 'Skip Today'}
              </button>
            </header>
            
            <p className={`text-sm italic leading-relaxed mb-4 ${isDarkMode ? 'text-neutral-400' : 'text-[#4A4A4A]'}`}>"{dailyPrompt}"</p>
            <textarea 
              className={`w-full h-32 p-4 rounded-xl border transition-colors focus:ring-1 focus:ring-primary resize-none font-serif text-sm ${isDarkMode ? 'bg-neutral-900 border-neutral-700 text-white placeholder-neutral-600' : 'bg-[#FAFAFA] border-[#E5E5E0] text-[#1A1A1A] placeholder-[#8E8E8A]/50'}`}
              placeholder="Write a few words about your day..."
              value={reflectionInput}
              onChange={(e) => handleReflectionChange(e.target.value)}
            />

            {(currentLog.reflections?.length || (currentLog.reflection && currentLog.reflection !== 'Skipped for today.')) ? (
              <div className="mt-4 grid grid-cols-1 gap-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#8E8E8A]">Earlier entries:</p>
                {currentLog.reflection && currentLog.reflection !== 'Skipped for today.' && (
                  <ReflectionCard content={currentLog.reflection} label="Reflection" />
                )}
                {currentLog.reflections?.map((ref, idx) => (
                  <ReflectionCard key={idx} content={ref} label={`Entry ${idx + 1}`} />
                ))}
              </div>
            ) : null}

            <div className="mt-8 flex justify-between items-center px-4">
              {[Leaf, Sparkles, Cloud, Coffee, Moon].map((Icon, i) => (
                <button 
                  key={i} 
                  onClick={() => handleEnergySelect(i)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${currentLog.energy === i ? 'bg-primary/10 text-primary ring-1 ring-primary/30' : (isDarkMode ? 'text-neutral-500 hover:text-white' : 'text-sage-200 hover:bg-sage-50 hover:text-primary')}`}
                >
                  <Icon size={18} />
                </button>
              ))}
            </div>
            
            <button 
              onClick={handleSave}
              className={`mt-6 w-full py-4 rounded-xl text-white font-sans text-xs tracking-widest uppercase shadow-lg transition-all ${
                isSaved ? 'bg-[#88A47C]' : 'bg-primary hover:bg-primary/90'
              }`}
            >
              <AnimatePresence mode="wait">
                {isSaved ? (
                  <motion.span key="saved" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    🌿 Saved!
                  </motion.span>
                ) : (
                  <motion.span key="save" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    Save Entry
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};
const InfluenceBubbleCloud = ({ influences, onBubbleClick }: { influences: { name: string, count: number }[], onBubbleClick?: (name: string) => void }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ name: string, count: number, x: number, y: number } | null>(null);

  useEffect(() => {
    if (!svgRef.current || influences.length === 0) return;

    const width = svgRef.current.parentElement?.clientWidth || 400;
    const height = 220;
    
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

    svg.selectAll("*").remove();

    // Data processing
    const maxCount = d3.max(influences, d => d.count) || 1;
    const radiusScale = d3.scaleLinear()
      .domain([0, maxCount])
      .range([15, 45]);

    const colorScale = d3.scaleOrdinal()
      .domain(influences.map(d => d.name))
      .range([
        "#E8F3E8", // Soft Green
        "#FDF2E9", // Soft Orange
        "#EBF5FB", // Soft Blue
        "#F5EEF8", // Soft Purple
        "#FEF9E7", // Soft Yellow
        "#F4ECF7", // Soft Lavender
        "#E9F7EF", // Soft Mint
        "#FADBD8"  // Soft Pink
      ]);

    const nodes = influences.map(d => ({
      ...d,
      radius: radiusScale(d.count),
      x: width / 2 + (Math.random() - 0.5) * 100,
      y: height / 2 + (Math.random() - 0.5) * 100
    }));

    const simulation = d3.forceSimulation(nodes as any)
      .force("x", d3.forceX(width / 2).strength(0.05))
      .force("y", d3.forceY(height / 2).strength(0.05))
      .force("collide", d3.forceCollide((d: any) => d.radius + 4).iterations(3))
      .force("charge", d3.forceManyBody().strength(5))
      .on("tick", () => {
        bubbles.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
      });

    const bubbles = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("class", "bubble-group cursor-pointer")
      .on("mouseenter", (event, d) => {
        setTooltip({ name: d.name, count: d.count, x: event.offsetX, y: event.offsetY });
      })
      .on("mousemove", (event) => {
        setTooltip(prev => prev ? { ...prev, x: event.offsetX, y: event.offsetY } : null);
      })
      .on("mouseleave", () => {
        setTooltip(null);
      })
      .on("click", (event, d) => {
        if (onBubbleClick) onBubbleClick(d.name);
      });

    bubbles.append("circle")
      .attr("r", d => d.radius)
      .attr("fill", d => colorScale(d.name) as string)
      .attr("stroke", "#E5E5E0")
      .attr("stroke-width", 1)
      .style("filter", "drop-shadow(0 4px 6px rgba(0,0,0,0.02))")
      .attr("class", "transition-all duration-300 hover:stroke-primary hover:stroke-2");

    bubbles.append("text")
      .attr("dy", ".3em")
      .style("text-anchor", "middle")
      .style("font-size", d => Math.max(7, d.radius / 4) + "px")
      .style("font-weight", "700")
      .style("fill", "#1A1A1A")
      .style("pointer-events", "none")
      .style("font-family", "Inter, sans-serif")
      .text(d => d.name.length > d.radius / 3 ? d.name.substring(0, Math.floor(d.radius / 4)) + ".." : d.name);

    // Subtle floating animation
    let frameId: number;
    const animate = (time: number) => {
      nodes.forEach((node: any, i) => {
        node.x += Math.sin(time / 1000 + i) * 0.2;
        node.y += Math.cos(time / 1000 + i) * 0.2;
      });
      bubbles.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);

    return () => {
      simulation.stop();
      cancelAnimationFrame(frameId);
    };
  }, [influences]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <svg ref={svgRef} className="w-full h-full" />
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute pointer-events-none z-50 bg-[#1A1A1A] text-white p-3 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md min-w-[120px]"
            style={{ 
              left: tooltip.x + 15, 
              top: tooltip.y - 60,
              transform: 'translateX(-50%)'
            }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8E8E8A] mb-1">Influence</p>
            <p className="text-sm font-bold mb-1">{tooltip.name}</p>
            <div className="h-px w-full bg-white/10 my-2"></div>
            <p className="text-[10px] text-white/60">
              Appeared <span className="text-primary font-bold">{tooltip.count}</span> times this period
            </p>
            <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#1A1A1A]"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CalendarWidget = ({
  selectedDate,
  setSelectedDate,
  dailyLogs,
  isDarkMode
}: {
  selectedDate: string,
  setSelectedDate: (d: string) => void,
  dailyLogs: Record<string, DailyLog>,
  isDarkMode: boolean
}) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [calendarView, setCalendarView] = useState<'weekly' | 'monthly'>('weekly');
  const today = formatDateKey(new Date());

  const getWeekDates = () => {
    const now = new Date();
    now.setDate(now.getDate() - (weekOffset * 7));
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); 
    const monday = new Date(now.getFullYear(), now.getMonth(), diff);
    
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return formatDateKey(d);
    });
  };

  const weekDates = getWeekDates();
  const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const monthDayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const getMonthData = () => {
    const now = new Date();
    now.setMonth(now.getMonth() - monthOffset);
    const year = now.getFullYear();
    const month = now.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay()); 
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); 
    
    const days = [];
    const curr = new Date(startDate);
    while (curr <= endDate) {
      days.push(formatDateKey(curr));
      curr.setDate(curr.getDate() + 1);
    }
    
    return {
      days,
      monthName: now.toLocaleDateString('en-US', { month: 'long' }),
      year,
      currentMonth: month
    };
  };

  const monthData = getMonthData();

  return (
    <section className="mb-8 w-full mx-auto">
      <div className={`rounded-3xl p-6 shadow-sm border ${isDarkMode ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-sage-50'}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-[#1A1A1A]'}`}>Calendar</h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCalendarView(calendarView === 'weekly' ? 'monthly' : 'weekly')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-2 ${
                calendarView === 'monthly' ? 'bg-primary/10 text-primary' : (isDarkMode ? 'bg-neutral-700 text-neutral-400 hover:text-primary' : 'bg-sage-50 text-[#8E8E8A] hover:text-primary')
              }`}
            >
              <Calendar size={14} />
              <span className="text-[9px] font-bold uppercase tracking-widest">
                {calendarView === 'weekly' ? 'Monthly' : 'Weekly'}
              </span>
            </button>

            <button 
              onClick={() => {
                setWeekOffset(0);
                setMonthOffset(0);
                setSelectedDate(today);
              }}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-2 ${
                selectedDate === today ? 'bg-primary/10 text-primary' : (isDarkMode ? 'bg-neutral-700 text-neutral-400 hover:text-primary' : 'bg-sage-50 text-[#8E8E8A] hover:text-primary')
              }`}
            >
              <Clock size={14} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Today</span>
            </button>
          </div>
        </div>

        <div className={`flex justify-between items-center mb-6 p-2 rounded-2xl ${isDarkMode ? 'bg-neutral-900/50' : 'bg-sage-50/50'}`}>
          <button 
            onClick={() => {
              if (calendarView === 'weekly') setWeekOffset(prev => prev + 1);
              else setMonthOffset(prev => prev + 1);
            }}
            className={`p-1 rounded-full transition-colors shadow-sm ${isDarkMode ? 'bg-neutral-800 text-neutral-500 hover:text-primary' : 'bg-white text-[#8E8E8A] hover:text-primary'}`}
          >
            <ChevronLeft size={18} />
          </button>
          <span className={`text-[10px] font-sans uppercase tracking-widest font-bold ${isDarkMode ? 'text-neutral-400' : 'text-[#4A4A4A]'}`}>
            {calendarView === 'weekly' ? (
              weekOffset === 0 ? 'This Week' : 
              weekOffset === 1 ? 'Last Week' : 
              `${weekOffset} Weeks Ago`
            ) : (
              `${monthData.monthName} ${monthData.year}`
            )}
          </span>
          <button 
            onClick={() => {
              if (calendarView === 'weekly') setWeekOffset(prev => Math.max(0, prev - 1));
              else setMonthOffset(prev => Math.max(0, prev - 1));
            }}
            disabled={calendarView === 'weekly' ? weekOffset === 0 : monthOffset === 0}
            className={`p-1 rounded-full transition-colors shadow-sm disabled:opacity-20 ${isDarkMode ? 'bg-neutral-800 text-neutral-500 hover:text-primary' : 'bg-white text-[#8E8E8A] hover:text-primary'}`}
          >
            <ChevronLeft size={18} className="rotate-180" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {calendarView === 'weekly' ? (
            <motion.div 
              key="weekly"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex justify-between"
            >
              {weekDates.map((date, i) => {
                const isSelected = selectedDate === date;
                const isToday = today === date;
                const log = dailyLogs[date];
                const hasMood = !!log?.mood;
                
                return (
                  <button 
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-primary' : (isDarkMode ? 'text-neutral-500' : 'text-sage-300')}`}>
                      {dayNames[i]}
                    </span>
                    <div className={`relative size-10 sm:size-12 rounded-full flex items-center justify-center transition-all ${
                      isSelected ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : 
                      isToday ? (isDarkMode ? 'bg-neutral-700 text-white border border-primary/20' : 'bg-sage-50 text-[#4A4A4A] border border-primary/20') : (isDarkMode ? 'text-neutral-400 hover:bg-neutral-700' : 'text-[#8E8E8A] hover:bg-sage-50')
                    }`}>
                      <span className="text-xs sm:text-sm font-bold">{new Date(date).getDate()}</span>
                      {hasMood && !isSelected && (
                        <div className="absolute -bottom-1 size-1.5 bg-primary rounded-full"></div>
                      )}
                    </div>
                  </button>
                );
              })}
            </motion.div>
          ) : (
            <motion.div 
              key="monthly"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="grid grid-cols-7 gap-y-4">
                {monthDayNames.map(day => (
                  <div key={day} className="text-center text-[10px] font-bold text-sage-200 uppercase tracking-widest">
                    {day}
                  </div>
                ))}
                {monthData.days.map((date) => {
                  const d = new Date(date);
                  const isSelected = selectedDate === date;
                  const isToday = today === date;
                  const isCurrentMonth = d.getMonth() === monthData.currentMonth;
                  const log = dailyLogs[date];
                  const hasMood = !!log?.mood;

                  return (
                    <button 
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`flex flex-col items-center gap-1 group relative py-1 ${!isCurrentMonth ? 'opacity-20' : ''}`}
                    >
                      <div className={`size-8 sm:size-10 rounded-full flex items-center justify-center transition-all ${
                        isSelected ? 'bg-primary text-white shadow-md scale-110' : 
                        isToday ? (isDarkMode ? 'bg-neutral-700 text-white border border-primary/20' : 'bg-sage-50 text-[#4A4A4A] border border-primary/20') : (isDarkMode ? 'text-neutral-400 hover:bg-neutral-700' : 'text-[#8E8E8A] hover:bg-sage-50')
                      }`}>
                        <span className="text-[10px] sm:text-xs font-bold">{d.getDate()}</span>
                      </div>
                      {hasMood && !isSelected && (
                        <div className="size-1 bg-primary rounded-full"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

const EntryCards = ({ 
  selectedDate, 
  dailyLogs, 
  isDarkMode, 
  onOpenJournal,
  onUpdateLog
}: { 
  selectedDate: string, 
  dailyLogs: Record<string, DailyLog>, 
  isDarkMode: boolean,
  onOpenJournal: () => void,
  onUpdateLog: (date: string, partialLog: Partial<DailyLog>) => void
}) => {
  const log = dailyLogs[selectedDate];
  
  if (!log || (!log.mood && !log.reflection && !log.reflections?.length && !log.habits.length && !log.influences?.length)) {
    return (
      <div 
        onClick={onOpenJournal}
        className={`mb-8 py-8 px-6 rounded-3xl border-2 border-dashed cursor-pointer transition-all hover:scale-[1.01] ${isDarkMode ? 'bg-neutral-800/20 border-neutral-700 hover:bg-neutral-800/40 text-neutral-400' : 'bg-sage-50/30 border-sage-100 hover:bg-sage-50/60 text-[#8E8E8A]'}`}
      >
        <div className="flex flex-col items-center justify-center opacity-60">
          <div className="size-12 rounded-full flex items-center justify-center mb-3 border border-dashed border-current">
            <Plus size={20} />
          </div>
          <p className="italic text-sm font-medium text-center">How is your morning going?<br/>Tap + to log.</p>
        </div>
      </div>
    );
  }

  const getHabitIcon = (name: string, isCompleted: boolean) => {
    const lower = name.toLowerCase();
    
    // Base properties requested by the user
    const strokeWidth = 1.5;
    const size = 16;
    
    // The classes handle the soft gray to sage green transition using Tailwind's duration-300 ease-in-out
    const colorClass = isCompleted 
      ? 'text-primary transition-colors duration-300 ease-in-out' 
      : 'text-neutral-400 transition-colors duration-300 ease-in-out';

    if (lower.includes('meditat') || lower.includes('breath')) return <Flower size={size} strokeWidth={strokeWidth} className={colorClass} />;
    if (lower.includes('water') || lower.includes('hydrate')) return <Droplets size={size} strokeWidth={strokeWidth} className={colorClass} />;
    if (lower.includes('move') || lower.includes('activ') || lower.includes('exercise') || lower.includes('workout')) return <Activity size={size} strokeWidth={strokeWidth} className={colorClass} />;
    if (lower.includes('sleep') || lower.includes('rest')) return <Cloud size={size} strokeWidth={strokeWidth} className={colorClass} />;
    if (lower.includes('coffee') || lower.includes('caffeine')) return <Coffee size={size} strokeWidth={strokeWidth} className={colorClass} />;
    if (lower.includes('sun') || lower.includes('outside')) return <Sun size={size} strokeWidth={strokeWidth} className={colorClass} />;
    if (lower.includes('read') || lower.includes('book') || lower.includes('learn')) return <Lightbulb size={size} strokeWidth={strokeWidth} className={colorClass} />;
    
    return <CheckCircle2 size={size} strokeWidth={strokeWidth} className={colorClass} />;
  };

  const moodEmojis: Record<string, string> = {
    'Very Happy': '😁',
    'Happy': '🙂',
    'Neutral': '😐',
    'Low': '😔',
    'Very Low': '😫'
  };

  const energyIcons = ['🌿', '✨', '☁️', '☕', '🌙'];

  const isToday = selectedDate === new Date().toLocaleDateString('en-CA', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-2 px-2">
        <h3 className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDarkMode ? 'text-neutral-500' : 'text-[#8E8E8A]'}`}>
          {isToday ? 'TODAY' : new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
        </h3>
      </div>
      
      <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-neutral-800/50 border-neutral-700' : 'bg-white border-sage-50'} relative shadow-sm`}>
        <div className="space-y-4">
          {log.mood && (
            <div className="flex items-center gap-3">
              <span className="text-2xl">{moodEmojis[log.mood] || '😐'}</span>
              <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-[#1A1A1A]'}`}>{log.mood}</span>
            </div>
          )}

          {log.habits.length > 0 && (
            <div className="pt-2">
              <span className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-3 block ${isDarkMode ? 'text-neutral-500' : 'text-[#8E8E8A]'}`}>Habits</span>
              <div className="flex flex-wrap gap-2">
                {log.habits.map((habit, idx) => {
                  const Icon = getHabitIcon(habit.name, habit.completed);
                  return (
                    <motion.button
                      key={idx}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const newHabits = log.habits.map(h => h.name === habit.name ? { ...h, completed: !h.completed } : h);
                        onUpdateLog(selectedDate, { habits: newHabits });
                      }}
                      className={`group flex items-center gap-2 px-3 py-2.5 rounded-[1.25rem] transition-all duration-300 ease-in-out border ${
                        habit.completed 
                          ? (isDarkMode ? 'bg-primary/20 border-primary shadow-sm' : 'bg-primary/5 border-primary shadow-sm')
                          : (isDarkMode ? 'bg-neutral-800 border-neutral-700 hover:border-neutral-500' : 'bg-white border-sage-100 hover:border-[#4A4A4A]')
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        {Icon}
                      </div>
                      <span className={`text-xs font-semibold ${habit.completed ? 'text-primary' : (isDarkMode ? 'text-neutral-400 group-hover:text-neutral-200' : 'text-[#4A4A4A]')}`}>
                        {habit.name}
                      </span>
                      <div className={`ml-1 flex items-center justify-center size-[18px] rounded-full border transition-colors ${habit.completed ? 'border-primary bg-primary text-white' : (isDarkMode ? 'border-neutral-600 bg-neutral-800' : 'border-[#8E8E8A] bg-white')}`}>
                        {habit.completed && <CheckCircle2 size={12} strokeWidth={3} />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {log.influences && log.influences.length > 0 && (
            <div className="pt-2">
              <span className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-3 block ${isDarkMode ? 'text-neutral-500' : 'text-[#8E8E8A]'}`}>Influences</span>
              <div className="flex flex-wrap gap-2">
                {log.influences.map((inf, idx) => (
                  <span key={idx} className={`text-[11px] font-bold tracking-wider px-3.5 py-1.5 rounded-full uppercase ${isDarkMode ? 'bg-neutral-800 text-neutral-200 border border-neutral-700 shadow-sm' : 'bg-[#F9FBF9] text-[#2C4C3B] border border-sage-100 shadow-sm'}`}>
                    {inf}
                  </span>
                ))}
              </div>
            </div>
          )}

          {((log.reflections && log.reflections.length > 0) || (log.reflection && log.reflection !== 'Skipped for today.')) && (
            <div className={`text-sm italic mt-4 ${isDarkMode ? 'text-neutral-300' : 'text-[#4A4A4A]'}`}>
              <span className="font-bold not-italic block mb-1">Reflection:</span>
              "{log.reflection && log.reflection !== 'Skipped for today.' ? log.reflection : log.reflections?.[0]}"
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={onOpenJournal}
            className={`text-xs font-bold text-primary uppercase tracking-widest hover:underline flex items-center gap-1 ${isDarkMode ? 'text-neutral-300' : 'text-[#4A4A4A]'}`}
          >
            <Edit2 size={12} /> Edit
          </button>
        </div>
      </div>
    </section>
  );
};


const DynamicWeeklySummary = ({ 
  selectedDate, 
  dailyLogs, 
  isDarkMode 
}: { 
  selectedDate: string, 
  dailyLogs: Record<string, DailyLog>, 
  isDarkMode: boolean 
}) => {
  const get7DaySummary = () => {
    // Instantiate exactly at noon local to prevent UTC boundary timezone shifts off-by-one errors
    const [y, m, d_val] = selectedDate.split('-').map(Number);
    const endNode = new Date(y, m - 1, d_val, 12, 0, 0);
    
    const windowLogs: DailyLog[] = [];
    
    // Build the 7 day window ending on the selectedDate
    for (let i = 0; i < 7; i++) {
      const d = new Date(endNode);
      d.setDate(d.getDate() - i);
      const dateKey = formatDateKey(d);
      if (dailyLogs[dateKey]) {
        windowLogs.push(dailyLogs[dateKey]);
      }
    }

    if (windowLogs.length === 0) {
      return "Start logging your daily moods and habits to see your weekly patterns here!";
    }

    // Calculate most frequent mood
    const moodCounts: Record<string, number> = {};
    windowLogs.forEach(log => {
      if (log.mood) {
        moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
      }
    });

    let topMood = '';
    let topMoodCount = 0;
    Object.entries(moodCounts).forEach(([mood, count]) => {
      if (count > topMoodCount) {
        topMoodCount = count;
        topMood = mood;
      }
    });

    // Calculate habits
    const habitCounts: Record<string, number> = {};
    windowLogs.forEach(log => {
      log.habits.forEach(h => {
        if (h.completed) {
          habitCounts[h.name] = (habitCounts[h.name] || 0) + 1;
        }
      });
    });

    let mostTrackedHabit = '';
    let maxHabitCount = 0;
    let stellarHabit = '';
    Object.entries(habitCounts).forEach(([habit, count]) => {
      if (count > maxHabitCount) {
        maxHabitCount = count;
        mostTrackedHabit = habit;
      }
      if (count >= 5) stellarHabit = habit;
    });

    // Always output a data-driven string if windowLogs > 0
    const todayStr = formatDateKey(new Date());
    let dateStr = selectedDate === todayStr ? 'today' : new Date(y, m - 1, d_val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    let summaryText = ``;
    if (topMood) {
      summaryText += `You were feeling ${topMood} ${topMoodCount} out of 7 days leading up to ${dateStr}.`;
      if (stellarHabit) {
        summaryText += ` Incredible consistency tracking ${stellarHabit}!`;
      }
    } else if (mostTrackedHabit) {
      summaryText += `You focused on tracking ${mostTrackedHabit} leading up to ${dateStr}.`;
    } else {
      summaryText += `You took time to reflect leading up to ${dateStr}.`;
    }

    return summaryText.trim();
  };

  const summary = get7DaySummary();
  if (!summary) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={selectedDate} // Re-animates when selectedDate changes to signal refresh
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex items-start gap-3 w-full mx-auto px-1 mb-6 mt-2"
      >
        <Sparkles className="shrink-0 mt-0.5" size={16} color="#708271" strokeWidth={1.5} />
        <p className="text-sm italic font-semibold text-[#63635E] leading-relaxed">
          {summary}
        </p>
      </motion.div>
    </AnimatePresence>
  );
};


const InsightsView = ({
  dailyLogs,
  isDarkMode,
  userName,
  selectedDate,
  setSelectedDate,
  onOpenJournal,
  onUpdateLog
}: {
  dailyLogs: Record<string, DailyLog>,
  isDarkMode: boolean,
  userName: string,
  selectedDate: string,
  setSelectedDate: (d: string) => void,
  onOpenJournal: () => void,
  onUpdateLog: (date: string, partialLog: Partial<DailyLog>) => void
}) => {
  const [timePeriod, setTimePeriod] = useState<'Wkly' | 'Mthly' | 'Qtrly' | 'Yrly'>('Wkly');
  const [selectedInfluenceDetail, setSelectedInfluenceDetail] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'Mood' | 'Habits' | 'Influences'>('Mood');

  const logsArray = Object.values(dailyLogs).sort((a, b) => b.date.localeCompare(a.date));
  

  const moodMap: Record<string, number> = {
    'Very Happy': 5,
    'Happy': 4,
    'Neutral': 3,
    'Low': 2,
    'Very Low': 1,
    // Legacy support
    'Great': 5,
    'Good': 4,
    'Okay': 3,
    'Bad': 1
  };

  const moodEmojiMap: Record<string, string> = {
    'Very Happy': '😁',
    'Happy': '🙂',
    'Neutral': '😐',
    'Low': '😔',
    'Very Low': '😫',
    // Legacy support
    'Great': '😁',
    'Good': '🙂',
    'Okay': '😐',
    'Bad': '😫'
  };

  // Helper to get logs for the current rolling period
  const getLogsForPeriod = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    
    if (timePeriod === 'Wkly') {
      const start = new Date(today);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff); // Monday
      const end = new Date(start);
      end.setDate(start.getDate() + 6); // Sunday
      return logsArray.filter(log => log.date >= formatDateKey(start) && log.date <= formatDateKey(end));
    }
    if (timePeriod === 'Mthly') {
      const start = new Date(currentYear, today.getMonth(), 1);
      const end = new Date(currentYear, today.getMonth() + 1, 0);
      return logsArray.filter(log => log.date >= formatDateKey(start) && log.date <= formatDateKey(end));
    }
    if (timePeriod === 'Qtrly') {
      const currentMonth = today.getMonth();
      const qStartMonth = Math.floor(currentMonth / 3) * 3;
      const start = new Date(currentYear, qStartMonth, 1);
      const end = new Date(currentYear, qStartMonth + 3, 0); // last day of quarter
      return logsArray.filter(log => log.date >= formatDateKey(start) && log.date <= formatDateKey(end));
    }
    if (timePeriod === 'Yrly') {
      const start = new Date(currentYear, 0, 1);
      const end = new Date(currentYear, 11, 31); 
      return logsArray.filter(log => log.date >= formatDateKey(start) && log.date <= formatDateKey(end));
    }
    
    return logsArray;
  };

  const periodLogs = getLogsForPeriod();

  // 1. Trend Summary Logic
  const getTrendSummary = () => {
    if (periodLogs.length < 2) return "Your journey is just beginning. Keep logging to see your patterns emerge.";
    
    const avgMood = periodLogs.reduce((acc, log) => acc + (moodMap[log.mood || 'Neutral'] || 3), 0) / periodLogs.length;
    const habitCompletion = periodLogs.reduce((acc, log) => acc + (log.habits.filter(h => h.completed).length / (log.habits.length || 1)), 0) / periodLogs.length;

    if (avgMood >= 4 && habitCompletion > 0.7) return `Over the last ${timePeriod.toLowerCase()}, you've been in a powerful flow state.`;
    if (avgMood >= 4) return `Your spirits have been high this ${timePeriod.toLowerCase().replace('ly', '')}!`;
    if (habitCompletion > 0.8) return "Your discipline is remarkable. Consistency is your superpower.";
    
    return `You're finding your rhythm. Each entry helps build a clearer picture of your well-being.`;
  };

  // 2. Mood Data with Aggregation
  const getMoodData = () => {
    const end = new Date();
    const points: any[] = [];
    
    if (timePeriod === 'Wkly') {
      const start = new Date(end);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff); // Monday
      
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const dateStr = formatDateKey(d);
        const logs = periodLogs.filter(l => l.date === dateStr);
        points.push({
          day: d.toLocaleDateString('en-US', { weekday: 'short' }),
          value: logs.length > 0 ? (moodMap[logs[0].mood || 'Neutral'] || 3) : null,
          mood: logs.length > 0 ? logs[0].mood : null
        });
      }
    } else if (timePeriod === 'Mthly') {
      const year = end.getFullYear();
      const month = end.getMonth();
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);
      
      let currentWeekStart = new Date(monthStart);
      let weekNum = 1;
      
      while (currentWeekStart.getMonth() === month) {
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(currentWeekStart.getDate() + 6);
        const actualWeekEnd = weekEnd.getMonth() === month ? weekEnd : monthEnd;
        
        const logs = periodLogs.filter(l => l.date >= formatDateKey(currentWeekStart) && l.date <= formatDateKey(actualWeekEnd));
        const avg = logs.length > 0 ? logs.reduce((acc, l) => acc + (moodMap[l.mood || 'Neutral'] || 3), 0) / logs.length : null;
        
        points.push({
          day: 'Week ' + weekNum,
          value: avg,
          mood: null
        });
        
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        weekNum++;
      }
    } else if (timePeriod === 'Qtrly') {
      const year = end.getFullYear();
      const currentMonth = end.getMonth();
      const qStartMonth = Math.floor(currentMonth / 3) * 3;
      
      for (let i = 0; i < 3; i++) {
        const m = qStartMonth + i;
        const d = new Date(year, m, 1);
        const logs = periodLogs.filter(l => {
          const lDate = new Date(l.date);
          const [lYear, lMonth] = l.date.split('-');
          return parseInt(lMonth) - 1 === m && parseInt(lYear) === year;
        });
        const avg = logs.length > 0 ? logs.reduce((acc, l) => acc + (moodMap[l.mood || 'Neutral'] || 3), 0) / logs.length : null;
        points.push({
          day: d.toLocaleDateString('en-US', { month: 'short' }),
          value: avg,
          mood: null
        });
      }
    } else if (timePeriod === 'Yrly') {
      const year = new Date().getFullYear();
      const quarters = [
        { label: 'Q1', startOffset: 0, endOffset: 2 },
        { label: 'Q2', startOffset: 3, endOffset: 5 },
        { label: 'Q3', startOffset: 6, endOffset: 8 },
        { label: 'Q4', startOffset: 9, endOffset: 11 },
      ];
      
      quarters.forEach(q => {
        const qStart = new Date(year, q.startOffset, 1);
        const qEnd = new Date(year, q.endOffset + 1, 0);
        
        const logs = periodLogs.filter(l => l.date >= formatDateKey(qStart) && l.date <= formatDateKey(qEnd));
        const avg = logs.length > 0 ? logs.reduce((acc, l) => acc + (moodMap[l.mood || 'Neutral'] || 3), 0) / logs.length : null;
        
        points.push({
          day: q.label,
          value: avg,
          mood: null
        });
      });
    }
    
    return points;
  };

  const getPeriodLabel = () => {
    const today = new Date();
    switch (timePeriod) {
      case 'Wkly': {
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(today);
        monday.setDate(diff);
        return `Week of ${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric'})}`;
      }
      case 'Mthly': 
        return today.toLocaleDateString('en-US', { month: 'long' });
      case 'Qtrly': {
        const qtr = Math.floor(today.getMonth() / 3) + 1;
        return `Q${qtr} ${today.getFullYear()}`;
      }
      case 'Yrly': 
        return today.getFullYear().toString();
      default: 
        return `Past ${timePeriod}`;
    }
  };

  const calculateStreak = (name: string) => {
    let maxStreak = 0;
    let currentStreak = 0;
    let previousDate: Date | null = null;

    const habitLogs = periodLogs
      .filter(l => l.habits.find(h => h.name === name)?.completed)
      .sort((a, b) => a.date.localeCompare(b.date));

    for (const log of habitLogs) {
      const [yearStr, monthStr, dayStr] = log.date.split('-');
      const currDate = new Date(parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr));
      
      if (!previousDate) {
        currentStreak = 1;
      } else {
        const diffTime = currDate.getTime() - previousDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
        } else if (diffDays > 1) {
          maxStreak = Math.max(maxStreak, currentStreak);
          currentStreak = 1;
        }
      }
      previousDate = currDate;
    }
    
    maxStreak = Math.max(maxStreak, currentStreak);
    return maxStreak;
  };

  // 3. Habit Progress Data
  const getHabitProgress = () => {
    const habitStats: Record<string, { completed: number, selected: number, streak: number }> = {};
    
    periodLogs.forEach(log => {
      log.habits.forEach(h => {
        if (!habitStats[h.name]) habitStats[h.name] = { completed: 0, selected: 0, streak: 0 };
        habitStats[h.name].selected++;
        if (h.completed) habitStats[h.name].completed++;
      });
    });

    Object.keys(habitStats).forEach(name => {
      habitStats[name].streak = calculateStreak(name);
    });

    return Object.entries(habitStats)
      .map(([name, stats]) => ({ 
        name, 
        percent: stats.selected > 0 ? Math.round((stats.completed / stats.selected) * 100) : 0,
        streak: stats.streak
      }))
      .sort((a, b) => b.percent - a.percent);
  };

  // 4. Correlations
  const getCorrelations = () => {
    const insights = [];
    const recent = periodLogs;
    
    const habits = Array.from(new Set(recent.flatMap(l => l.habits.map(h => h.name))));
    
    habits.forEach(habitName => {
      const daysWithHabit = recent.filter(l => l.habits.find(h => h.name === habitName && h.completed));
      const daysWithoutHabit = recent.filter(l => !l.habits.find(h => h.name === habitName && h.completed));
      
      if (daysWithHabit.length >= 2 && daysWithoutHabit.length >= 2) {
        const avgMoodWith = daysWithHabit.reduce((acc, l) => acc + (moodMap[l.mood || 'Okay'] || 3), 0) / daysWithHabit.length;
        const avgMoodWithout = daysWithoutHabit.reduce((acc, l) => acc + (moodMap[l.mood || 'Okay'] || 3), 0) / daysWithoutHabit.length;
        
        const diff = avgMoodWith - avgMoodWithout;
        if (diff > 0.5) {
          insights.push({
            habit: habitName,
            impact: Math.round(diff * 20), // Arbitrary scale for impact
            text: `Your mood is noticeably better on days you complete "${habitName}".`
          });
        }
      }
    });

    return insights.slice(0, 2);
  };

  // 5. Reflection Highlight
  const getReflectionHighlight = () => {
    const reflections = periodLogs
      .flatMap(l => (l.reflections || []).concat(l.reflection ? [l.reflection] : []))
      .filter(r => r && r !== 'Skipped for today.' && r.length > 20);
    
    if (reflections.length === 0) return null;
    return reflections[Math.floor(Math.random() * reflections.length)];
  };

  // 6. Energy Pattern Logic
  const getEnergyPattern = () => {
    const dayMoods: Record<string, { total: number, count: number }> = {};
    
    periodLogs.forEach(log => {
      const date = new Date(log.date);
      const day = date.toLocaleDateString('en-US', { weekday: 'long' });
      const moodValue = moodMap[log.mood || 'Okay'] || 3;
      
      if (!dayMoods[day]) dayMoods[day] = { total: 0, count: 0 };
      dayMoods[day].total += moodValue;
      dayMoods[day].count += 1;
    });

    const averages = Object.entries(dayMoods)
      .map(([day, stats]) => ({ day, avg: stats.total / stats.count }))
      .sort((a, b) => b.avg - a.avg);

    if (averages.length < 2) return null;

    const topDays = averages.slice(0, 2).map(a => a.day + 's');
    return `You tend to feel most energized on ${topDays[0]} and ${topDays[1]}.`;
  };

  const weeklyMood = getMoodData();
  const habitProgress = getHabitProgress();
  const correlations = getCorrelations();
  const highlight = getReflectionHighlight();
  const summary = getTrendSummary();
  const energyPattern = getEnergyPattern();

  const avgMoodScore = periodLogs.length > 0 
    ? periodLogs.reduce((acc, log) => acc + (moodMap[log.mood || 'Neutral'] || 3), 0) / periodLogs.length 
    : 0;

  const getMoodDistribution = () => {
    if (periodLogs.length === 0) return [];
    const counts: Record<string, number> = {};
    periodLogs.forEach(log => {
      const m = log.mood || 'Neutral';
      counts[m] = (counts[m] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([mood, count]) => ({
        mood,
        percent: Math.round((count / periodLogs.length) * 100)
      }))
      .sort((a, b) => b.percent - a.percent);
  };

  const getTopInfluences = () => {
    const counts: Record<string, number> = {};
    periodLogs.forEach(log => {
      (log.influences || []).forEach(inf => {
        counts[inf] = (counts[inf] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const moodDistribution = getMoodDistribution();
  const topInfluences = getTopInfluences();

  const getInfluenceDetail = (name: string) => {
    const logsWithInfluence = periodLogs.filter(l => (l.influences || []).includes(name));
    const avgMood = logsWithInfluence.length > 0 
      ? logsWithInfluence.reduce((acc, l) => acc + (moodMap[l.mood || 'Neutral'] || 3), 0) / logsWithInfluence.length 
      : 0;
    
    const dates = logsWithInfluence.map(l => {
      const d = new Date(l.date);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    return {
      name,
      count: logsWithInfluence.length,
      avgMood: Math.round(avgMood * 10) / 10,
      dates: dates.slice(0, 5),
      totalDates: dates.length
    };
  };

  return (
    <div className={`pb-24 animate-in slide-in-from-bottom-4 duration-500 min-h-screen w-full mx-auto ${isDarkMode ? 'bg-neutral-900' : 'bg-cream-50'}`}>
      <header className="pt-10 pb-6 flex flex-col justify-start relative">
        <h2 className={`text-2xl font-bold tracking-tight font-display mb-1 ${isDarkMode ? 'text-white' : 'text-[#1A1A1A]'}`}>
          Hello, {userName || 'there'} 👋
        </h2>
        <p className={`text-sm italic ${isDarkMode ? 'text-neutral-400' : 'text-[#4A4A4A]'}`}>
          Understand patterns in your mood and habits
        </p>
      </header>

      <CalendarWidget selectedDate={selectedDate} setSelectedDate={setSelectedDate} dailyLogs={dailyLogs} isDarkMode={isDarkMode} />
      
      <DynamicWeeklySummary selectedDate={selectedDate} dailyLogs={dailyLogs} isDarkMode={isDarkMode} />

      {/* Visual separation label */}
      <h3 className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-4 mt-6 ${isDarkMode ? 'text-neutral-500' : 'text-[#8E8E8A]'}`}>
        Daily Logging
      </h3>
      <EntryCards selectedDate={selectedDate} dailyLogs={dailyLogs} isDarkMode={isDarkMode} onOpenJournal={onOpenJournal} onUpdateLog={onUpdateLog} />

      <h3 className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-4 mt-12 ${isDarkMode ? 'text-neutral-500' : 'text-[#8E8E8A]'}`}>
        Analyze Trends By
      </h3>
      <div className="flex flex-col gap-4 mb-8">
        <div className={`${isDarkMode ? 'bg-neutral-800/50 border-neutral-700' : 'bg-white/50 border-sage-100'} flex gap-2 p-1 rounded-2xl border w-fit`}>
          {(['Mood', 'Habits', 'Influences'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                activeTab === tab 
                  ? (isDarkMode ? 'bg-neutral-700 text-white shadow-sm border border-neutral-600' : 'bg-white text-[#1A1A1A] shadow-sm border border-sage-100') 
                  : (isDarkMode ? 'text-neutral-500 hover:text-white' : 'text-[#8E8E8A] hover:text-[#1A1A1A]')
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Time Period Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {(['Wkly', 'Mthly', 'Qtrly', 'Yrly'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimePeriod(period)}
              className={`px-4 py-2 rounded-full text-[10px] font-bold transition-colors ${
                timePeriod === period
                  ? (isDarkMode ? 'bg-neutral-700 text-white border border-neutral-600' : 'bg-white text-[#1A1A1A] border border-sage-200 shadow-sm')
                  : (isDarkMode ? 'text-neutral-500 hover:text-neutral-300' : 'text-[#8E8E8A] hover:text-[#4A4A4A]')
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <main className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {activeTab === 'Mood' && (
          <>
            {/* Mood Rhythm Section (Inspired by Image 1) */}
            <section className={`${isDarkMode ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-[#E5E5E0]'} p-6 md:p-8 rounded-[2.5rem] border shadow-sm md:col-span-12`}>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className={`text-sm font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-[#1A1A1A]'}`}>{getPeriodLabel()}</h3>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-neutral-500' : 'text-[#8E8E8A]'}`}>
                Avg Mood: <span className={isDarkMode ? 'text-white' : 'text-[#1A1A1A]'}>{Math.round(avgMoodScore)}</span>
              </p>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end justify-between h-48 gap-3 mb-6">
            {weeklyMood.map((data, i) => {
              const isPositive = data.value && data.value >= 3;
              const height = data.value ? (data.value / 5) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-3 group relative">
                  {data.value && (
                    <span className={`absolute -top-6 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity ${isDarkMode ? 'text-white' : 'text-[#1A1A1A]'}`}>
                      {Math.round(data.value)}
                    </span>
                  )}
                  <div className={`w-full rounded-full h-32 relative overflow-hidden ${isDarkMode ? 'bg-neutral-900' : 'bg-[#F5F5F0]'}`}>
                    {data.value && (
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        className={`absolute bottom-0 w-full rounded-full ${isPositive ? 'bg-[#88A47C]' : 'bg-[#E88D5D]'}`}
                      />
                    )}
                  </div>
                  <div className={`size-2 rounded-full ${data.value ? (isPositive ? 'bg-[#88A47C]' : 'bg-[#E88D5D]') : (isDarkMode ? 'bg-neutral-700' : 'bg-[#E5E5E0]')}`}></div>
                  <span className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-neutral-500' : 'text-[#8E8E8A]'}`}>{data.day}</span>
                </div>
              );
            })}
          </div>

          <div className={`h-px w-full my-8 ${isDarkMode ? 'bg-neutral-700' : 'bg-[#F5F5F0]'}`}></div>

          {/* Mood History (Emojis or Distribution) */}
          <div>
            <h3 className={`text-sm font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-[#1A1A1A]'}`}>
              {timePeriod === 'Wkly' ? 'Mood History' : 'Mood Distribution'}
            </h3>
            
            {timePeriod === 'Wkly' ? (
              <div className="flex justify-between items-center">
                {weeklyMood.map((data, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 group relative">
                    <div className={`size-10 rounded-full flex items-center justify-center text-xl transition-all ${data.mood ? (isDarkMode ? 'bg-neutral-700' : 'bg-[#F5F5F0]') + ' scale-110' : 'bg-transparent border border-dashed ' + (isDarkMode ? 'border-neutral-700' : 'border-[#E5E5E0]')}`}>
                      {data.mood ? moodEmojiMap[data.mood] : ''}
                    </div>
                    {data.mood && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1A1A1A] text-white text-[10px] py-1.5 px-3 rounded-full whitespace-nowrap z-20 pointer-events-none shadow-xl">
                        {data.mood}
                        <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#1A1A1A]"></div>
                      </div>
                    )}
                    <span className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-neutral-500' : 'text-[#8E8E8A]'}`}>{data.day}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6 max-w-3xl">
                {moodDistribution.length > 0 ? moodDistribution.map((item) => (
                  <div key={item.mood} className="flex items-center gap-6">
                    <div className={`size-10 rounded-full flex items-center justify-center text-xl ${isDarkMode ? 'bg-neutral-700' : 'bg-[#F5F5F0]'}`}>
                      {moodEmojiMap[item.mood]}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-sm font-bold ${isDarkMode ? 'text-neutral-300' : 'text-[#4A4A4A]'}`}>{item.mood}</span>
                        <span className={`text-xs font-bold ${isDarkMode ? 'text-neutral-500' : 'text-[#8E8E8A]'}`}>{item.percent}%</span>
                      </div>
                      <div className={`h-2 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-neutral-900' : 'bg-[#F5F5F0]'}`}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.percent}%` }}
                          className={`h-full rounded-full ${isDarkMode ? 'bg-primary' : 'bg-[#1A1A1A]'}`}
                        />
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className={`italic text-xs text-center py-4 ${isDarkMode ? 'text-neutral-500' : 'text-[#8E8E8A]'}`}>No mood data for this period.</p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Highlights Section */}
        {highlight && (
          <section className={`${isDarkMode ? 'bg-neutral-800 border-neutral-700' : 'bg-[#F5F5F0] border-[#E5E5E0]'} p-8 md:p-10 rounded-[2.5rem] border md:col-span-12`}>
            <h3 className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-6 ${isDarkMode ? 'text-neutral-500' : 'text-[#8E8E8A]'}`}>Reflection Highlights</h3>
            <p className={`text-2xl font-serif italic leading-relaxed max-w-4xl ${isDarkMode ? 'text-neutral-300' : 'text-[#4A4A4A]'}`}>
              "{highlight}"
            </p>
          </section>
        )}
      </>
    )}

    {activeTab === 'Habits' && (
      <>
        {/* Habit Tracker Section (Inspired by Image 2) */}
        <section className={`${isDarkMode ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-[#E5E5E0]'} p-6 md:p-10 rounded-[2.5rem] border shadow-sm md:col-span-12`}>
          <div className="flex justify-between items-center mb-10 relative">
            <div>
              <h3 className={`text-xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-[#1A1A1A]'}`}>Habit Progress</h3>
              <h4 className={`text-sm font-bold ${isDarkMode ? 'text-neutral-400' : 'text-[#8E8E8A]'}`}>{getPeriodLabel()}</h4>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            {habitProgress.length > 0 ? habitProgress.map((habit) => (
              <div key={habit.name}>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`text-base font-bold ${isDarkMode ? 'text-neutral-300' : 'text-[#4A4A4A]'}`}>{habit.name}</span>
                    {habit.streak > 0 && (
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-[#E88D5D]/20 to-[#E88D5D]/10 text-[#E88D5D] text-[10px] font-bold rounded-full border border-[#E88D5D]/20">
                        🔥 {habit.streak} day streak
                      </span>
                    )}
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-neutral-500' : 'text-[#8E8E8A]'}`}>{habit.percent}%</span>
                </div>
                <div className={`h-3 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-neutral-900' : 'bg-[#F5F5F0]'}`}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${habit.percent}%` }}
                    className={`h-full rounded-full ${isDarkMode ? 'bg-primary' : 'bg-[#1A1A1A]'}`}
                  />
                </div>
              </div>
            )) : (
              <p className={`italic text-xs text-center py-4 md:col-span-2 ${isDarkMode ? 'text-neutral-500' : 'text-[#8E8E8A]'}`}>No habit data logged yet.</p>
            )}
          </div>
        </section>

        {/* Patterns Section */}
        <section className={`${isDarkMode ? 'bg-neutral-800 border-neutral-700' : 'bg-[#1A1A1A]'} p-8 rounded-[2.5rem] text-white overflow-hidden relative md:col-span-12`}>
          <div className="absolute -right-20 -top-20 size-64 bg-[#88A47C]/10 rounded-full blur-3xl"></div>
          <h3 className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-4 ${isDarkMode ? 'text-neutral-500' : 'text-[#8E8E8A]'}`}>Habit Patterns & Insights</h3>
          <div className="relative z-10 space-y-4">
            {correlations.length > 0 ? (
              correlations.map((c, i) => (
                <p key={i} className={`text-lg font-serif italic leading-relaxed ${isDarkMode ? 'text-neutral-200' : 'text-white'}`}>
                  {c.text}
                </p>
              ))
            ) : (
              <p className={`text-lg font-serif italic leading-relaxed ${isDarkMode ? 'text-neutral-200' : 'text-white'}`}>
                {summary || "Build more habits to start seeing patterns in your days."}
              </p>
            )}
            
            {energyPattern && (
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-neutral-400' : 'text-white/80'}`}>
                {energyPattern}
              </p>
            )}

            {(activeTab === 'Mood') && (
              <p className={`text-sm leading-relaxed mt-2 ${isDarkMode ? 'text-neutral-400' : 'text-white/80'}`}>
                {timePeriod === '7D' 
                  ? "Daily check-ins reveal your weekly rhythm. Keep logging to sharpen the insights."
                  : "Trends over longer periods show the bigger picture of your wellbeing."}
              </p>
            )}
          </div>
        </section>
      </>
    )}

    {activeTab === 'Influences' && (
      <section className={`${isDarkMode ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-[#E5E5E0]'} p-6 md:p-8 rounded-[2.5rem] border shadow-sm overflow-hidden md:col-span-12`}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-1 ${isDarkMode ? 'text-neutral-500' : 'text-[#8E8E8A]'}`}>Common Influences</h3>
            <h4 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#1A1A1A]'}`}>{getPeriodLabel()}</h4>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-2 bg-[#88A47C] rounded-full animate-pulse"></div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-neutral-500' : 'text-[#8E8E8A]'}`}>Top 5 Patterns</span>
          </div>
        </div>
        
        <div className={`relative h-[300px] w-full rounded-3xl border border-dashed overflow-hidden ${isDarkMode ? 'bg-neutral-900 border-neutral-700' : 'bg-[#F9F9F7] border-[#E5E5E0]'}`}>
          <InfluenceBubbleCloud 
            influences={topInfluences} 
            onBubbleClick={(name) => setSelectedInfluenceDetail(name)}
          />
        </div>

        <AnimatePresence>
          {selectedInfluenceDetail && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`mt-6 p-6 rounded-3xl border ${isDarkMode ? 'bg-neutral-900 border-neutral-700' : 'bg-[#F5F5F0] border-[#E5E5E0]'}`}
            >
              {(() => {
                const detail = getInfluenceDetail(selectedInfluenceDetail);
                return (
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-[#1A1A1A]'}`}>{detail.name}</h4>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-neutral-500' : 'text-[#8E8E8A]'}`}>Detailed Correlation</p>
                      </div>
                      <button 
                        onClick={() => setSelectedInfluenceDetail(null)}
                        className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-neutral-800' : 'hover:bg-white'}`}
                      >
                        <X size={16} className={isDarkMode ? 'text-neutral-500' : 'text-[#8E8E8A]'} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-[#E5E5E0]'}`}>
                        <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isDarkMode ? 'text-neutral-500' : 'text-[#8E8E8A]'}`}>Avg Mood</p>
                        <div className="flex items-center gap-2">
                          <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-[#1A1A1A]'}`}>{detail.avgMood}</span>
                          <span className="text-xl">{moodEmojiMap[Object.keys(moodMap).find(k => moodMap[k] === Math.round(detail.avgMood)) || 'Neutral']}</span>
                        </div>
                      </div>
                      <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-[#E5E5E0]'}`}>
                        <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isDarkMode ? 'text-neutral-500' : 'text-[#8E8E8A]'}`}>Frequency</p>
                        <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-[#1A1A1A]'}`}>{detail.count} <span className={`text-xs font-normal ${isDarkMode ? 'text-neutral-500' : 'text-[#8E8E8A]'}`}>entries</span></p>
                      </div>
                    </div>

                    <div>
                      <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${isDarkMode ? 'text-neutral-500' : 'text-[#8E8E8A]'}`}>Recent Occurrences</p>
                      <div className="flex flex-wrap gap-2">
                        {detail.dates.map((date, i) => (
                          <span key={i} className={`px-3 py-1 rounded-full border text-[10px] font-bold ${isDarkMode ? 'bg-neutral-800 border-neutral-700 text-neutral-300' : 'bg-white border-[#E5E5E0] text-[#4A4A4A]'}`}>
                            {date}
                          </span>
                        ))}
                        {detail.totalDates > 5 && (
                          <span className={`text-[10px] font-bold py-1 ${isDarkMode ? 'text-neutral-500' : 'text-[#8E8E8A]'}`}>+{detail.totalDates - 5} more</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    )}

      {/* Summary Footer */}
      <section className="pt-4 pb-12 text-center md:col-span-12">
        <p className={`text-xs italic leading-relaxed max-w-[400px] mx-auto ${isDarkMode ? 'text-neutral-500' : 'text-[#8E8E8A]'}`}>
          {summary}
        </p>
      </section>
    </main>
    </div>
  );
};

const ProfileView = ({ profile, dailyLogs, onUpdate, onLogout, isDarkMode, setIsDarkMode, remindersEnabled, setRemindersEnabled }: { 
  profile: UserProfile | null, 
  dailyLogs: Record<string, DailyLog>, 
  onUpdate: (p: UserProfile) => void,
  onLogout: () => void,
  isDarkMode: boolean,
  setIsDarkMode: (v: boolean) => void,
  remindersEnabled: boolean,
  setRemindersEnabled: (v: boolean) => void
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile?.name || '');
  const [editGoal, setEditGoal] = useState(profile?.goal || '');

  const logsArray = Object.values(dailyLogs);
  const totalEntries = logsArray.filter(log => (log.reflections?.length || 0) > 0 || log.reflection).length;
  
  const calculateStreak = () => {
    let streak = 0;
    const today = formatDateKey(new Date());
    const date = new Date();
    
    while (true) {
      const dateStr = formatDateKey(date);
      const log = dailyLogs[dateStr];
      const hasActivity = log && ((log.reflections?.length || 0) > 0 || log.reflection || log.mood || log.habits.some(h => h.completed));
      
      if (hasActivity) {
        streak++;
        date.setDate(date.getDate() - 1);
      } else {
        if (dateStr === today && streak === 0) {
          date.setDate(date.getDate() - 1);
          continue;
        }
        break;
      }
    }
    return streak;
  };

  const streak = calculateStreak();
  
  const handleSave = () => {
    onUpdate({ name: editName, goal: editGoal });
    setIsEditing(false);
  };

  return (
    <div className="pb-24 animate-in fade-in duration-500">
      <header className="flex items-center py-6 justify-between sticky top-0 bg-transparent backdrop-blur-md z-10">
        <div className="flex gap-2">
        </div>
        <h2 className={`text-xl font-bold tracking-tight font-display ${isDarkMode ? 'text-white' : 'text-[#1A1A1A]'}`}>My Journey</h2>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`${isDarkMode ? 'text-white hover:bg-white/10' : 'text-[#1A1A1A] hover:bg-sage-50'} p-2 rounded-full transition-colors`}
        >
          {isEditing ? <X size={24} /> : <Settings size={24} />}
        </button>
      </header>

      <section className="flex flex-col items-center mb-10">
        <div className={`size-24 rounded-full ${isDarkMode ? 'bg-primary/20' : 'bg-primary/10'} flex items-center justify-center mb-4 border-2 border-primary/20`}>
          <User size={48} className="text-primary" />
        </div>
        
        {isEditing ? (
          <div className="w-full space-y-4 px-4">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className={`w-full ${isDarkMode ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-sage-100 text-[#1A1A1A]'} border rounded-xl py-2 px-4 text-center text-xl font-bold focus:border-primary transition-all font-display`}
              placeholder="Your name"
            />
            <textarea
              value={editGoal}
              onChange={(e) => setEditGoal(e.target.value)}
              className={`w-full ${isDarkMode ? 'bg-neutral-800 border-neutral-700 text-neutral-400' : 'bg-white border-sage-100 text-[#4A4A4A]'} border rounded-xl py-2 px-4 text-center italic focus:border-primary transition-all font-serif resize-none h-20`}
              placeholder="Your mindfulness goal"
            />
            <button
              onClick={handleSave}
              className="w-full bg-primary text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 font-sans text-sm tracking-widest uppercase"
            >
              <Save size={18} />
              Save Profile
            </button>
          </div>
        ) : (
          <>
            <h3 className={`text-2xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#1A1A1A]'}`}>
              {profile?.name || 'Mindful User'}
              <button onClick={() => setIsEditing(true)} className="text-sage-200 hover:text-primary transition-colors">
                <Edit2 size={16} />
              </button>
            </h3>
            <p className={`${isDarkMode ? 'text-neutral-500' : 'text-[#4A4A4A]'} italic mt-1 text-center px-8`}>
              "{profile?.goal || 'Finding peace in the present moment.'}"
            </p>
          </>
        )}
      </section>

      <section className="grid grid-cols-2 gap-4 mb-10">
        <div className={`${isDarkMode ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-sage-50'} p-6 rounded-3xl border shadow-sm`}>
          <div className="flex items-center gap-2 text-primary mb-2">
            <BookOpen size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest font-sans">Entries</span>
          </div>
          <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-[#1A1A1A]'}`}>{totalEntries}</p>
          <p className={`text-xs ${isDarkMode ? 'text-neutral-500' : 'text-[#8E8E8A]'} mt-1`}>Total reflections</p>
        </div>
        <div className={`${isDarkMode ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-sage-50'} p-6 rounded-3xl border shadow-sm`}>
          <div className="flex items-center gap-2 text-orange-500 mb-2">
            <Flame size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest font-sans">Streak</span>
          </div>
          <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-[#1A1A1A]'}`}>{streak}</p>
          <p className={`text-xs ${isDarkMode ? 'text-neutral-500' : 'text-[#8E8E8A]'} mt-1`}>Days in a row</p>
        </div>
      </section>

      <section className="space-y-4">
        <button 
          onClick={() => setRemindersEnabled(!remindersEnabled)}
          className={`w-full ${isDarkMode ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700' : 'bg-white border-sage-50 hover:bg-sage-50'} p-5 rounded-2xl flex items-center justify-between border transition-colors`}
        >
          <div className="flex items-center gap-3">
            <div className={`size-10 rounded-xl ${isDarkMode ? 'bg-neutral-700' : 'bg-sage-50'} flex items-center justify-center`}>
              <Bell size={20} className="text-primary" />
            </div>
            <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-[#1A1A1A]'}`}>Daily Reminders</span>
          </div>
          <div className={`w-12 h-6 ${remindersEnabled ? 'bg-primary' : (isDarkMode ? 'bg-neutral-600' : 'bg-sage-100')} rounded-full relative transition-colors`}>
            <div className={`absolute ${remindersEnabled ? 'right-1' : 'left-1'} top-1 size-4 bg-white rounded-full transition-all`}></div>
          </div>
        </button>
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`w-full ${isDarkMode ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700' : 'bg-white border-sage-50 hover:bg-sage-50'} p-5 rounded-2xl flex items-center justify-between border transition-colors`}
        >
          <div className="flex items-center gap-3">
            <div className={`size-10 rounded-xl ${isDarkMode ? 'bg-neutral-700' : 'bg-sage-50'} flex items-center justify-center`}>
              <Moon size={20} className="text-primary" />
            </div>
            <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-[#1A1A1A]'}`}>Dark Mode</span>
          </div>
          <div className={`w-12 h-6 ${isDarkMode ? 'bg-primary' : 'bg-sage-100'} rounded-full relative transition-colors`}>
            <div className={`absolute ${isDarkMode ? 'right-1' : 'left-1'} top-1 size-4 bg-white rounded-full transition-all`}></div>
          </div>
        </button>
        <button 
          onClick={onLogout}
          className={`w-full ${isDarkMode ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700' : 'bg-white border-sage-50 hover:bg-sage-50'} p-5 rounded-2xl flex items-center justify-between border transition-colors mt-8`}
        >
          <div className="flex items-center gap-3">
            <div className={`size-10 rounded-xl ${isDarkMode ? 'bg-neutral-700' : 'bg-sage-50'} flex items-center justify-center`}>
              <LogOut size={20} className="text-[#E88D5D]" />
            </div>
            <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-[#1A1A1A]'}`}>Log Out</span>
          </div>
          <ChevronRight size={16} className={isDarkMode ? 'text-neutral-500' : 'text-[#8E8E8A]'} />
        </button>
        <button 
          onClick={() => {
            if (confirm('Are you sure you want to reset all your data? This cannot be undone.')) {
              localStorage.clear();
              window.location.reload();
            }
          }}
          className={`w-full ${isDarkMode ? 'bg-red-900/20 border-red-900/30 hover:bg-red-900/40' : 'bg-red-50 border-red-100 hover:bg-red-100'} p-5 rounded-2xl flex items-center justify-between border transition-colors mt-8`}
        >
          <div className="flex items-center gap-3">
            <div className={`size-10 rounded-xl ${isDarkMode ? 'bg-red-900/50' : 'bg-white'} flex items-center justify-center`}>
              <Archive size={20} className="text-red-500" />
            </div>
            <span className={`font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>Reset All Data</span>
          </div>
          <ChevronLeft size={20} className={`${isDarkMode ? 'text-red-400' : 'text-red-400'} rotate-180`} />
        </button>
      </section>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<ViewType>('welcome');
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(formatDateKey(new Date()));
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dailyLogs, setDailyLogs] = useState<Record<string, DailyLog>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  const fetchProfileAndLogs = async (user: UserAccount) => {
    try {
      const [profileRes, logsRes] = await Promise.all([
        fetch('/api/profile', { headers: { 'x-user-id': user.id || '' }, cache: 'no-store' }),
        fetch('/api/logs', { headers: { 'x-user-id': user.id || '' }, cache: 'no-store' })
      ]);
      
      let fetchedProfile = null;
      if (profileRes.ok) {
        const data = await safeJsonParse(profileRes);
        if (data?.profile?.name) fetchedProfile = data.profile;
        setProfile(fetchedProfile);
      }
      
      if (logsRes.ok) {
        const data = await safeJsonParse(logsRes);
        if (data?.logs && Array.isArray(data.logs)) {
          const logsMap: Record<string, DailyLog> = {};
          data.logs.forEach((log: any) => logsMap[log.date] = log);
          setDailyLogs(logsMap);
        }
      }
      return fetchedProfile;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('harmony_dark_mode');
    const savedReminders = localStorage.getItem('harmony_reminders');
    const savedAuth = localStorage.getItem('soluna_auth');
    const savedProfile = localStorage.getItem('soluna_profile');
    
    if (savedDarkMode) setIsDarkMode(JSON.parse(savedDarkMode));
    if (savedReminders) setRemindersEnabled(JSON.parse(savedReminders));

    if (savedAuth) {
      const user = JSON.parse(savedAuth);
      setCurrentUser(user);
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
      // Optimistically show insights if we have a saved session
      setView('insights');
      fetchProfileAndLogs(user).then(fetchedProfile => {
        if (!fetchedProfile && !savedProfile) {
          // If no profile found, maybe they didn't finish onboarding
          setView('onboarding');
        } else if (fetchedProfile) {
          localStorage.setItem('soluna_profile', JSON.stringify(fetchedProfile));
        }
        setIsLoaded(true);
      });
    } else {
      setView('welcome');
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('harmony_dark_mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('harmony_reminders', JSON.stringify(remindersEnabled));
  }, [remindersEnabled]);

  const handleLogin = async (user: UserAccount, remember: boolean) => {
    setCurrentUser(user);
    if (remember) {
      localStorage.setItem('soluna_auth', JSON.stringify(user));
    } else {
      localStorage.removeItem('soluna_auth');
      localStorage.removeItem('soluna_profile');
    }
    
    const fetchedProfile = await fetchProfileAndLogs(user);
    if (fetchedProfile && fetchedProfile.name) {
      localStorage.setItem('soluna_profile', JSON.stringify(fetchedProfile));
      setProfile(fetchedProfile);
    } else {
      // Emergency fallback so the UI greeting doesn't crash if they login and don't load a matching profile
      const fallbackProfile = { name: user.username };
      localStorage.setItem('soluna_profile', JSON.stringify(fallbackProfile));
      setProfile(fallbackProfile);
    }
    setView('onboarding');
  };

  const handleSignUp = async (user: UserAccount) => {
    // Explicitly enforce zero-knowledge when a new user signs up in case a previous user cache is still running
    setDailyLogs({});
    setProfile(null);
    localStorage.removeItem('soluna_selected_habits');
    localStorage.removeItem('soluna_profile');
    localStorage.removeItem('soluna_auth');
    if (currentUser) {
      localStorage.removeItem(`soluna_logs_${currentUser.username}`);
    }

    setCurrentUser(user);
    // Explicitly do not set soluna_auth yet, until they finish onboarding.
    // That way if they refresh mid-onboarding, they start over or go to login.
    setView('onboarding');
  };

  const handleOnboardingComplete = async (newProfile: UserProfile) => {
    const profileWithUser = { ...newProfile, username: currentUser?.username };
    setProfile(profileWithUser);
    localStorage.setItem('soluna_profile', JSON.stringify(profileWithUser));
    
    if (profileWithUser.initialMood) {
      handleUpdateLog(formatDateKey(new Date()), { mood: profileWithUser.initialMood });
    }

    if (currentUser?.id) {
      // Now that onboarding is complete and they have a profile, we persist the session
      localStorage.setItem('soluna_auth', JSON.stringify(currentUser));
      
      const { username, ...profileData } = profileWithUser;
      fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify(profileData)
      });
    }

    setView('insights');
  };

  const handleProfileUpdate = async (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem('soluna_profile', JSON.stringify(updatedProfile));
    if (currentUser?.id) {
      const { username, ...profileData } = updatedProfile;
      fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify(profileData)
      });
    }
  };

  const handleUpdateLog = (date: string, updates: Partial<DailyLog>) => {
    setDailyLogs(prev => {
      const existing = prev[date] || {
        date,
        habits: []
      };
      const updated = { ...existing, ...updates };
      const newLogs = { ...prev, [date]: updated };
      
      if (currentUser?.id) {
        fetch('/api/logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': currentUser.id
          },
          body: JSON.stringify({ ...updated, date })
        });
      }
      return newLogs;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('soluna_auth');
    localStorage.removeItem('soluna_profile');
    localStorage.removeItem('soluna_selected_habits');
    if (currentUser) {
      localStorage.removeItem(`soluna_logs_${currentUser.username}`); // clear sensitive runtime cache if any
    }
    setProfile(null);
    setDailyLogs({});
    setCurrentUser(null);
    setView('welcome');
  };

  if (!isLoaded) return null;

  const isAuthView = ['welcome', 'signup', 'login'].includes(view);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-neutral-900' : 'bg-cream-50'} max-w-md mx-auto relative px-6 pt-4`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="min-h-[80vh] flex flex-col"
        >
          {view === 'welcome' && <WelcomeView onGetStarted={() => setView('signup')} onLogin={() => setView('login')} />}
          {view === 'signup' && <SignUpView onBack={() => setView('welcome')} onSignUp={handleSignUp} />}
          {view === 'login' && <LogInView onBack={() => setView('welcome')} onLogin={handleLogin} />}
          
          {view === 'onboarding' && <OnboardingView onComplete={handleOnboardingComplete} initialProfile={profile} />}
          {view === 'insights' && (
      <InsightsView 
        dailyLogs={dailyLogs}
        isDarkMode={isDarkMode}
        userName={profile?.name}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        onOpenJournal={() => setIsJournalModalOpen(true)}
        onUpdateLog={handleUpdateLog}
      />
    )}
          {view === 'profile' && (
            <ProfileView 
              profile={profile} 
              dailyLogs={dailyLogs} 
              onUpdate={handleProfileUpdate}
              onLogout={handleLogout}
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
              remindersEnabled={remindersEnabled}
              setRemindersEnabled={setRemindersEnabled}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {isJournalModalOpen && (
          <JournalEntryModal
            selectedDate={selectedDate}
            profile={profile}
            dailyLogs={dailyLogs}
            onUpdateLog={handleUpdateLog}
            onClose={() => setIsJournalModalOpen(false)}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            isLoaded={isLoaded}
            currentUser={currentUser}
          />
        )}
      </AnimatePresence>

      {!isAuthView && view !== 'onboarding' && (
        <BottomNav 
          activeView={view} 
          setView={setView} 
          onOpenJournal={() => {
            setSelectedDate(formatDateKey(new Date()));
            setIsJournalModalOpen(true);
          }} 
          hasLoggedToday={(() => {
            const todayLog = dailyLogs[formatDateKey(new Date())];
            if (!todayLog) return false;
            const isJustOnboarded = Object.keys(dailyLogs).length === 1 && todayLog.habits.length === 0 && !todayLog.reflection && (!todayLog.influences || todayLog.influences.length === 0) && !!todayLog.mood;
            return !isJustOnboarded;
          })()}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}
