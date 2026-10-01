import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle,
  Clock,
  Flame,
  Volume2,
  VolumeX,
  Tv,
  Music,
  Headphones,
  Maximize2,
  Minimize2,
  Radio,
  Sliders,
  ChevronDown,
  ExternalLink,
  RotateCw,
  Link2,
  Palette,
  AlertCircle,
  Check,
  X,
  BookOpen,
  Coffee,
  Laptop,
  Dumbbell,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { TaskCategory, StudySessionItem } from '@/types';
import { DevTrackStore } from '@/lib/storage';
import { ambientSound, AmbientSoundType } from '@/lib/ambient-sound';

type TimerMode = '25_5' | '50_10' | '90_15' | 'CUSTOM';

interface StudyBuddy {
  id: string;
  name: string;
  category: 'BTS' | 'VIRAT_KOHLI' | 'LOFI';
  subtitle: string;
  youtubeId: string;
  alternateIds: string[];
  badge: string;
  quote: string;
  accentColor: string;
}

function extractYouTubeId(urlOrId: string): string {
  const trimmed = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : trimmed;
}

const STUDY_BUDDIES: StudyBuddy[] = [
  {
    id: 'bts-ot7',
    name: 'BTS 7-Member Study Room',
    category: 'BTS',
    subtitle: 'Official BANGTANTV Study with BTS (All 7 Members)',
    youtubeId: '72H3uQJ7r_k',
    alternateIds: ['kYvM-x5vP_s', 'zJgQd5Sj784'],
    badge: '💜 BTS Official',
    quote: 'Effort makes you. You will regret someday if you don’t do your best now. — BTS Jungkook',
    accentColor: '#9333ea',
  },
  {
    id: 'bts-rm',
    name: 'BTS RM (Kim Namjoon)',
    category: 'BTS',
    subtitle: 'Deep book reading, lyric writing & studio focus',
    youtubeId: 'kYvM-x5vP_s',
    alternateIds: ['72H3uQJ7r_k', 'zJgQd5Sj784'],
    badge: '💜 BTS Leader',
    quote: 'I believe that there is no need to lead your life based on the standards of others. — RM',
    accentColor: '#a855f7',
  },
  {
    id: 'bts-jk',
    name: 'BTS Jungkook',
    category: 'BTS',
    subtitle: 'Quiet late-night focus, drawing & creative work',
    youtubeId: 'zJgQd5Sj784',
    alternateIds: ['72H3uQJ7r_k', 'kYvM-x5vP_s'],
    badge: '💜 BTS Golden',
    quote: 'Living without passion is like being dead. Stay hungry, stay passionate. — Jungkook',
    accentColor: '#8b5cf6',
  },
  {
    id: 'bts-v',
    name: 'BTS V (Kim Taehyung)',
    category: 'BTS',
    subtitle: 'Aesthetic jazz & calm night study session',
    youtubeId: 'kYvM-x5vP_s',
    alternateIds: ['72H3uQJ7r_k', 'zJgQd5Sj784'],
    badge: '💜 BTS Vocal',
    quote: 'Don’t be trapped in someone else’s dream. Make your own path. — V',
    accentColor: '#c084fc',
  },
  {
    id: 'vk-focus',
    name: 'Virat Kohli — Elite Focus & Routine',
    category: 'VIRAT_KOHLI',
    subtitle: 'Relentless discipline, training & champion concentration',
    youtubeId: '3R-z5_V9T0g',
    alternateIds: ['n-2P9B_G_t4', 'kYv_62yN13E'],
    badge: '🏏 Champion Mindset',
    quote: 'Self-belief and hard work will always earn you success. No shortcuts. — Virat Kohli',
    accentColor: '#e11d48',
  },
  {
    id: 'vk-prep',
    name: 'Virat Kohli — Match Prep & Mental Grit',
    category: 'VIRAT_KOHLI',
    subtitle: 'Pre-match deep focus, routine & relentless work ethic',
    youtubeId: 'n-2P9B_G_t4',
    alternateIds: ['3R-z5_V9T0g', 'kYv_62yN13E'],
    badge: '🏏 Laser Focus',
    quote: 'If you can stay true to yourself and your work, miracles will happen. — Virat Kohli',
    accentColor: '#f59e0b',
  },
  {
    id: 'lofi-girl',
    name: 'Lofi Girl Focus',
    category: 'LOFI',
    subtitle: 'Lofi beats to relax / study / code to (24/7 Guaranteed Stream)',
    youtubeId: 'jfKfPfyJRdk',
    alternateIds: ['lTRiuFIWV54'],
    badge: '🎧 24/7 Verified Stream',
    quote: 'Small steps every single day lead to massive transformations.',
    accentColor: '#06b6d4',
  },
  {
    id: 'rain-coding',
    name: 'Tokyo Rain & Ambient Code',
    category: 'LOFI',
    subtitle: 'Cozy rainy window & developer workspace',
    youtubeId: 'lTRiuFIWV54',
    alternateIds: ['jfKfPfyJRdk'],
    badge: '🌧️ Tokyo Rain',
    quote: 'Code with clarity. Focus is the superpower of modern builders.',
    accentColor: '#3b82f6',
  },
];

const AMBIENT_SOUND_PRESETS: {
  id: AmbientSoundType;
  label: string;
  icon: string;
  desc: string;
}[] = [
  { id: 'rain', label: 'Rainy Window', icon: '🌧️', desc: 'Gentle soothing rainfall' },
  { id: 'fire', label: 'Crackling Fire', icon: '🔥', desc: 'Warm fireplace embers' },
  { id: 'forest', label: 'Forest Wind', icon: '🍃', desc: 'Calm nature breeze' },
  { id: 'ocean', label: 'Ocean Waves', icon: '🌊', desc: 'Rhythmic rolling surf' },
  { id: 'lofi', label: 'Lofi Chords', icon: '🎧', desc: 'Warm analog chords' },
  { id: 'binaural', label: '40Hz Alpha', icon: '🧘', desc: 'Gamma cognitive tone' },
];

export const PomodoroTimer: React.FC = () => {
  const [mode, setMode] = useState<TimerMode>('25_5');
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [isBreak, setIsBreak] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Study With Me Video Buddy State
  const [isStudyWithMeEnabled, setIsStudyWithMeEnabled] = useState(true);
  const [selectedBuddy, setSelectedBuddy] = useState<StudyBuddy>(STUDY_BUDDIES[0]);
  const [activeYoutubeId, setActiveYoutubeId] = useState<string>(STUDY_BUDDIES[0].youtubeId);
  const [alternateIndex, setAlternateIndex] = useState(0);
  const [playerMode, setPlayerMode] = useState<'youtube' | 'studio'>('youtube');
  const [videoMuted, setVideoMuted] = useState(true);
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);
  const [showCustomLinkInput, setShowCustomLinkInput] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [customLinkError, setCustomLinkError] = useState('');
  const [videoNoticeDismissed, setVideoNoticeDismissed] = useState(false);

  const handleSelectBuddy = (buddy: StudyBuddy) => {
    setSelectedBuddy(buddy);
    setActiveYoutubeId(buddy.youtubeId);
    setAlternateIndex(0);
    setCustomLinkError('');
  };

  const handleCycleAlternateVideo = () => {
    const allIds = [selectedBuddy.youtubeId, ...(selectedBuddy.alternateIds || [])];
    const nextIdx = (alternateIndex + 1) % allIds.length;
    setAlternateIndex(nextIdx);
    setActiveYoutubeId(allIds[nextIdx]);
  };

  const handleOpenPopout = (id?: string) => {
    const targetId = id || activeYoutubeId;
    const popoutUrl = `https://www.youtube.com/watch?v=${targetId}`;
    if (typeof window !== 'undefined') {
      window.open(
        popoutUrl,
        'DevTrackStudyBuddy',
        'width=720,height=440,left=150,top=100,menubar=no,toolbar=no,location=no,status=no,resizable=yes'
      );
    }
  };

  const handleOpenYouTubeDirect = (id?: string) => {
    const targetId = id || activeYoutubeId;
    if (typeof window !== 'undefined') {
      window.open(`https://www.youtube.com/watch?v=${targetId}`, '_blank');
    }
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    const extracted = extractYouTubeId(customUrlInput);
    if (extracted && extracted.length === 11) {
      setActiveYoutubeId(extracted);
      setCustomLinkError('');
      setShowCustomLinkInput(false);
      setPlayerMode('youtube');
    } else {
      setCustomLinkError('Please paste a valid YouTube URL (e.g., https://youtu.be/... or 11-digit video ID).');
    }
  };

  // Ambient Sound Engine State
  const [activeSound, setActiveSound] = useState<AmbientSoundType | null>('rain');
  const [soundVolume, setSoundVolume] = useState<number>(0.5);

  // Post-Timer Study Logging Modal
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [studiedTopic, setStudiedTopic] = useState('Binary Search Problems');
  const [studiedCategory, setStudiedCategory] = useState<TaskCategory>('DSA');
  const [productivityRating, setProductivityRating] = useState<number>(4);
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionStartTime, setSessionStartTime] = useState<string>('');

  const [recentSessions, setRecentSessions] = useState<StudySessionItem[]>(
    DevTrackStore.getStudySessions()
  );

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup ambient sound on unmount
  useEffect(() => {
    return () => {
      ambientSound.stop();
    };
  }, []);

  const handleSelectMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsRunning(false);
    setIsBreak(false);
    let work = 25;
    let brk = 5;
    if (newMode === '50_10') {
      work = 50;
      brk = 10;
    } else if (newMode === '90_15') {
      work = 90;
      brk = 15;
    }
    setWorkMinutes(work);
    setBreakMinutes(brk);
    setTimeLeft(work * 60);
  };

  useEffect(() => {
    if (isRunning) {
      if (!sessionStartTime) setSessionStartTime(new Date().toISOString());
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleTimerComplete = () => {
    if (soundEnabled && typeof window !== 'undefined') {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } catch (e) {
        // audio error ignored
      }
    }

    if (!isBreak) {
      setIsLogModalOpen(true);
    } else {
      setIsBreak(false);
      setTimeLeft(workMinutes * 60);
    }
  };

  const handleSaveSession = () => {
    DevTrackStore.addStudySession({
      startTime: sessionStartTime || new Date().toISOString(),
      endTime: new Date().toISOString(),
      durationMin: workMinutes,
      topic: studiedTopic.trim(),
      category: studiedCategory,
      productivity: productivityRating,
      notes: sessionNotes.trim() || undefined,
    });

    setRecentSessions(DevTrackStore.getStudySessions());
    setIsLogModalOpen(false);
    setSessionStartTime('');
    setSessionNotes('');
    setIsBreak(true);
    setTimeLeft(breakMinutes * 60);
  };

  // Ambient Sound Toggles
  const handleToggleAmbientSound = (soundId: AmbientSoundType) => {
    if (activeSound === soundId) {
      ambientSound.stop();
      setActiveSound(null);
    } else {
      ambientSound.play(soundId);
      ambientSound.setVolume(soundVolume);
      setActiveSound(soundId);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setSoundVolume(newVol);
    ambientSound.setVolume(newVol);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalCompletedMinutes = recentSessions.reduce((acc, s) => acc + s.durationMin, 0);
  const totalCompletedHours = (totalCompletedMinutes / 60).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Title & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Clock size={24} className="text-indigo-400" />
            <span>Study With Me & Focus Engine</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Deep focus with BTS & Virat Kohli study buddies, soothing ambient soundscapes, and Pomodoro logging.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Study With Me Video Toggle */}
          <button
            onClick={() => setIsStudyWithMeEnabled(!isStudyWithMeEnabled)}
            className={`text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-medium ${
              isStudyWithMeEnabled
                ? 'bg-purple-950/40 text-purple-300 border-purple-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title="Toggle Study With Me Virtual Buddy"
          >
            <Tv size={14} className={isStudyWithMeEnabled ? 'text-purple-400' : 'text-slate-400'} />
            <span>Study Buddy {isStudyWithMeEnabled ? 'Active' : 'Off'}</span>
          </button>

          {/* Chime toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 size={14} className="text-emerald-400" />
            ) : (
              <VolumeX size={14} />
            )}
            <span>Chime {soundEnabled ? 'On' : 'Muted'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Study With Me Video Buddy + Pomodoro Timer Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Study With Me Video Screen (if enabled) */}
        {isStudyWithMeEnabled && (
          <div
            className={`transition-all duration-300 ${
              isVideoExpanded ? 'lg:col-span-12' : 'lg:col-span-7'
            }`}
          >
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
              {/* Video Header: Select Buddy, Mode Switcher & Expand */}
              <div className="p-3.5 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                    <span>Study With:</span>
                    <span className="text-purple-400">{selectedBuddy.name}</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 hidden sm:inline">
                    {selectedBuddy.badge}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Mode Switcher: YouTube Stream vs Animated Studio */}
                  <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setPlayerMode('youtube')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
                        playerMode === 'youtube'
                          ? 'bg-purple-600 text-white font-bold shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                      title="Stream on-demand YouTube Study With Me video"
                    >
                      <Tv size={12} />
                      <span>YouTube</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlayerMode('studio')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
                        playerMode === 'studio'
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                      title="100% reliable animated ambient studio (zero embedding blocks)"
                    >
                      <Sparkles size={12} />
                      <span>Focus Studio</span>
                    </button>
                  </div>

                  {/* Select Buddy Dropdown */}
                  <select
                    value={selectedBuddy.id}
                    onChange={(e) => {
                      const found = STUDY_BUDDIES.find((b) => b.id === e.target.value);
                      if (found) handleSelectBuddy(found);
                    }}
                    className="text-xs bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <optgroup label="💜 BTS Members">
                      {STUDY_BUDDIES.filter((b) => b.category === 'BTS').map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🏏 Virat Kohli">
                      {STUDY_BUDDIES.filter((b) => b.category === 'VIRAT_KOHLI').map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🎧 Lofi & Ambient">
                      {STUDY_BUDDIES.filter((b) => b.category === 'LOFI').map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>

                  {/* Expand / Minimize Video size */}
                  <button
                    onClick={() => setIsVideoExpanded(!isVideoExpanded)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                    title={isVideoExpanded ? 'Normal view' : 'Cinema wide view'}
                  >
                    {isVideoExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                  </button>
                </div>
              </div>

              {/* Action Toolbar for YouTube Mode: Popout Player, Alternates & Custom Link */}
              {playerMode === 'youtube' && (
                <div className="px-3.5 py-2 bg-slate-950/90 border-b border-slate-800/60 flex items-center justify-between gap-2 text-xs flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Popout Player Button - 100% bypasses third-party embedding restrictions */}
                    <button
                      type="button"
                      onClick={() => handleOpenPopout()}
                      className="px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 hover:text-purple-200 border border-purple-500/40 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                      title="Open video in a clean floating popout window (bypasses all third-party embedding blocks)"
                    >
                      <ExternalLink size={12} />
                      <span>Popout Mini-Player</span>
                    </button>

                    {/* Cycle Alternate Video Button */}
                    <button
                      type="button"
                      onClick={handleCycleAlternateVideo}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-[11px] flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Try alternate video clip for this study buddy"
                    >
                      <RotateCw size={11} className="text-indigo-400" />
                      <span>
                        Clip {alternateIndex + 1}/{1 + (selectedBuddy.alternateIds?.length || 0)}
                      </span>
                    </button>

                    {/* Custom YouTube URL Button */}
                    <button
                      type="button"
                      onClick={() => setShowCustomLinkInput(!showCustomLinkInput)}
                      className={`px-2.5 py-1 border rounded-lg text-[11px] flex items-center gap-1.5 transition-all cursor-pointer ${
                        showCustomLinkInput
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
                      }`}
                      title="Paste any YouTube video or shorts link"
                    >
                      <Link2 size={11} />
                      <span>Custom Video</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenYouTubeDirect()}
                    className="text-[11px] text-slate-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Open on YouTube</span>
                    <ExternalLink size={10} />
                  </button>
                </div>
              )}

              {/* Custom YouTube Link Input Bar */}
              {showCustomLinkInput && playerMode === 'youtube' && (
                <div className="p-3 bg-indigo-950/40 border-b border-indigo-500/30 text-xs">
                  <form onSubmit={handleApplyCustomUrl} className="flex items-center gap-2 flex-wrap">
                    <div className="flex-1 min-w-[220px]">
                      <input
                        type="text"
                        value={customUrlInput}
                        onChange={(e) => setCustomUrlInput(e.target.value)}
                        placeholder="Paste YouTube link (e.g. https://youtu.be/kYvM-x5vP_s or video ID)"
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                    <Button type="submit" size="sm" className="bg-indigo-600 text-xs py-1.5 h-auto">
                      Play Video
                    </Button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveYoutubeId(selectedBuddy.youtubeId);
                        setCustomUrlInput('');
                        setShowCustomLinkInput(false);
                        setCustomLinkError('');
                      }}
                      className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs border border-slate-800"
                    >
                      Reset
                    </button>
                  </form>
                  {customLinkError && (
                    <p className="text-[11px] text-rose-400 mt-1.5">{customLinkError}</p>
                  )}
                </div>
              )}

              {/* Viewport: Either YouTube Iframe OR Animated Focus Studio */}
              <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
                {playerMode === 'youtube' ? (
                  <iframe
                    key={activeYoutubeId}
                    className="w-full h-full"
                    src={`https://www.youtube-nocookie.com/embed/${activeYoutubeId}?autoplay=1&mute=${
                      videoMuted ? '1' : '0'
                    }&controls=1&modestbranding=1&rel=0`}
                    title={`${selectedBuddy.name} Study With Me`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  /* Animated Focus Studio Mode (100% Reliable, Offline & Zero Blocks) */
                  <div className="relative w-full h-full flex flex-col items-center justify-between p-6 overflow-hidden select-none bg-slate-950">
                    {/* Dynamic Ambient Background Glow */}
                    <div
                      className="absolute inset-0 opacity-30 transition-all duration-700 pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at 50% 40%, ${selectedBuddy.accentColor} 0%, transparent 70%)`,
                      }}
                    />

                    {/* Studio Top Banner: Persona & Tag */}
                    <div className="relative z-10 flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900/80 border border-slate-700 text-white flex items-center gap-1.5 shadow-md">
                          <span>
                            {selectedBuddy.category === 'BTS'
                              ? '💜'
                              : selectedBuddy.category === 'VIRAT_KOHLI'
                              ? '🏏'
                              : '🎧'}
                          </span>
                          <span>{selectedBuddy.name}</span>
                        </span>
                        <span className="text-[10px] text-purple-300 font-mono px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/40">
                          {selectedBuddy.category === 'BTS'
                            ? 'Virtual Study Studio'
                            : selectedBuddy.category === 'VIRAT_KOHLI'
                            ? 'High-Performance Arena'
                            : 'Lofi Study Lounge'}
                        </span>
                      </div>

                      {/* Live Timer Countdown Badge */}
                      <div className="px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-xs font-bold text-emerald-400 flex items-center gap-1.5 shadow-inner">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        <span>{isRunning ? 'FOCUSING' : 'READY'}</span>
                        <span className="text-white">
                          {Math.floor(timeLeft / 60)}:
                          {(timeLeft % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    </div>

                    {/* Center Animated Studio Atmosphere */}
                    <div className="relative z-10 flex flex-col items-center justify-center gap-3 my-auto text-center max-w-md">
                      {/* Persona Interactive Avatar Glow */}
                      <div className="relative">
                        <div
                          className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-500 border border-white/10"
                          style={{
                            backgroundColor: `${selectedBuddy.accentColor}25`,
                            boxShadow: `0 0 40px ${selectedBuddy.accentColor}55`,
                          }}
                        >
                          {selectedBuddy.category === 'BTS' ? (
                            <span className="text-5xl animate-bounce">💜</span>
                          ) : selectedBuddy.category === 'VIRAT_KOHLI' ? (
                            <Trophy size={48} className="text-amber-400 drop-shadow-md" />
                          ) : (
                            <Headphones size={48} className="text-cyan-400 drop-shadow-md" />
                          )}
                        </div>

                        {/* Pulsing Aura Ring */}
                        <div
                          className="absolute -inset-2 rounded-3xl animate-pulse opacity-40 blur-md pointer-events-none"
                          style={{ backgroundColor: selectedBuddy.accentColor }}
                        />
                      </div>

                      {/* Motivational Quote in Studio */}
                      <div className="p-3.5 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-xl">
                        <p className="text-xs text-slate-200 italic font-medium leading-relaxed">
                          &ldquo;{selectedBuddy.quote}&rdquo;
                        </p>
                      </div>

                      {/* Animated Audio Equalizer Bars */}
                      <div className="flex items-end justify-center gap-1.5 h-6">
                        {[18, 24, 12, 28, 20, 14, 26, 16, 22, 10, 24, 18, 26, 14].map((h, i) => (
                          <span
                            key={i}
                            className="w-1 rounded-full transition-all duration-300"
                            style={{
                              height: isRunning ? `${h}px` : '6px',
                              backgroundColor: selectedBuddy.accentColor,
                              animation: isRunning
                                ? `pulse ${0.6 + (i % 5) * 0.15}s ease-in-out infinite alternate`
                                : 'none',
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Studio Footer Quick Switch */}
                    <div className="relative z-10 flex items-center justify-between w-full text-[11px] text-slate-400">
                      <span>🎧 Ambient {activeSound || 'None'} Playing</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenPopout()}
                          className="text-purple-300 hover:text-white flex items-center gap-1 underline underline-offset-2 cursor-pointer"
                        >
                          <ExternalLink size={11} />
                          <span>Popout YouTube Stream</span>
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => setPlayerMode('youtube')}
                          className="text-indigo-400 hover:text-white flex items-center gap-1 underline underline-offset-2 cursor-pointer"
                        >
                          <Tv size={11} />
                          <span>Switch to YouTube Player</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Smart Fix Helper Notice if YouTube has embedding disabled */}
              {playerMode === 'youtube' && !videoNoticeDismissed && (
                <div className="p-2.5 bg-amber-950/40 border-b border-amber-500/30 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 flex-wrap text-amber-200">
                    <AlertCircle size={14} className="text-amber-400 shrink-0" />
                    <span>
                      Seeing <strong>&ldquo;Video unavailable&rdquo;</strong>? YouTube limits website embedding on some clips.
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenPopout()}
                      className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold rounded border border-amber-500/40 cursor-pointer flex items-center gap-1"
                    >
                      <ExternalLink size={10} />
                      <span>Click to Popout Video</span>
                    </button>
                    <span>or</span>
                    <button
                      type="button"
                      onClick={() => setPlayerMode('studio')}
                      className="px-2 py-0.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold rounded border border-purple-500/40 cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles size={10} />
                      <span>Switch to Focus Studio</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVideoNoticeDismissed(true)}
                    className="p-1 text-amber-400/70 hover:text-amber-200 rounded shrink-0 cursor-pointer"
                    title="Dismiss notification"
                  >
                    <X size={13} />
                  </button>
                </div>
              )}

              {/* Video Footer Controls & Buddy Quick Switch Carousel */}
              <div className="p-3 bg-slate-950/70 border-t border-slate-800/80 flex items-center justify-between gap-3 text-xs flex-wrap">
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                  {STUDY_BUDDIES.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => handleSelectBuddy(b)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                        selectedBuddy.id === b.id
                          ? 'bg-purple-600 text-white font-bold shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      <span>
                        {b.category === 'BTS' ? '💜' : b.category === 'VIRAT_KOHLI' ? '🏏' : '🎧'}
                      </span>
                      <span>{b.name.split('—')[0].replace('BTS ', '')}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  {playerMode === 'youtube' && (
                    <button
                      onClick={() => setVideoMuted(!videoMuted)}
                      className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        videoMuted
                          ? 'bg-slate-900 text-slate-400 border-slate-800'
                          : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                      }`}
                      title="Toggle Video Soundtrack"
                    >
                      {videoMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                      <span>Video: {videoMuted ? 'Muted' : 'Unmuted'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RIGHT COLUMN: Pomodoro Timer Display */}
        <div
          className={`flex flex-col gap-6 ${
            !isStudyWithMeEnabled ? 'lg:col-span-12' : isVideoExpanded ? 'lg:col-span-12' : 'lg:col-span-5'
          }`}
        >
          {/* Main Timer Display Card */}
          <div className="p-6 md:p-8 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
            {/* Glow backdrop */}
            <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none rounded-3xl blur-3xl" />

            {/* Mode Selector Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl mb-5 z-10 flex-wrap justify-center">
              {(
                [
                  { id: '25_5', label: '25 / 5' },
                  { id: '50_10', label: '50 / 10' },
                  { id: '90_15', label: '90 / 15' },
                  { id: 'CUSTOM', label: 'Custom' },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelectMode(m.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    mode === m.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* State label */}
            <span
              className={`text-xs font-mono font-bold tracking-widest uppercase px-3.5 py-1 rounded-full mb-2 z-10 ${
                isBreak
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
              }`}
            >
              {isBreak ? '☕ Rest & Rehydrate' : '🔥 Deep Focus Sprint'}
            </span>

            {/* Digital Clock */}
            <div className="text-6xl sm:text-7xl font-black font-mono tracking-tighter text-white z-10 my-3 select-none">
              {formattedTime}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 mt-4 z-10">
              <Button
                size="lg"
                variant={isRunning ? 'secondary' : 'primary'}
                onClick={() => setIsRunning(!isRunning)}
                className="px-8 shadow-lg !py-3 text-sm font-bold"
              >
                {isRunning ? (
                  <>
                    <Pause size={17} />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play size={17} />
                    <span>Start Session</span>
                  </>
                )}
              </Button>

              <Button
                size="md"
                variant="outline"
                onClick={() => {
                  setIsRunning(false);
                  setTimeLeft(workMinutes * 60);
                }}
                className="!p-3 border-slate-700"
                title="Reset timer"
              >
                <RotateCcw size={16} />
              </Button>
            </div>
          </div>

          {/* AMBIENT MUSIC & SOUNDSCAPES CONTROLLER */}
          <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Music size={15} className="text-indigo-400" />
                <span>Ambient Music & Soundscapes</span>
              </h3>

              {activeSound && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 animate-pulse">
                  <span>Playing</span>
                </span>
              )}
            </div>

            {/* Sound Preset Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AMBIENT_SOUND_PRESETS.map((snd) => {
                const isActive = activeSound === snd.id;
                return (
                  <button
                    key={snd.id}
                    onClick={() => handleToggleAmbientSound(snd.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      isActive
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-md ring-1 ring-indigo-400/50'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <span className="text-lg">{snd.icon}</span>
                    <div className="min-w-0">
                      <span className="text-xs font-semibold block leading-tight truncate">
                        {snd.label}
                      </span>
                      <span
                        className={`text-[10px] block leading-tight truncate ${
                          isActive ? 'text-indigo-100' : 'text-slate-500'
                        }`}
                      >
                        {snd.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Volume Control Bar */}
            <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-400 flex items-center gap-1.5 flex-shrink-0">
                <Sliders size={13} className="text-indigo-400" />
                <span>Ambient Volume:</span>
                <span className="font-mono font-bold text-white">
                  {Math.round(soundVolume * 100)}%
                </span>
              </span>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={soundVolume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-32 sm:w-40 accent-indigo-500 cursor-pointer"
              />

              {activeSound && (
                <button
                  onClick={() => {
                    ambientSound.stop();
                    setActiveSound(null);
                  }}
                  className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
                >
                  Mute All
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 block">Total Study Time</span>
          <span className="text-xl font-bold text-white font-mono mt-1 block">
            {totalCompletedHours} Hours
          </span>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 block">Logged Sessions</span>
          <span className="text-xl font-bold text-indigo-400 font-mono mt-1 block">
            {recentSessions.length} Blocks
          </span>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 block">Avg Productivity</span>
          <span className="text-xl font-bold text-emerald-400 font-mono mt-1 block">
            4.2 / 5.0
          </span>
        </div>
      </div>

      {/* History Log */}
      <div className="border border-slate-800 rounded-xl bg-slate-900/40 p-4 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Recent Study Sessions
        </h3>

        <div className="space-y-2">
          {recentSessions.slice(0, 5).map((session) => (
            <div
              key={session.id}
              className="p-3 bg-slate-900/70 border border-slate-800 rounded-lg flex items-center justify-between text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200">{session.topic}</span>
                  <Badge type={session.category}>{session.category}</Badge>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {session.durationMin} mins
                </div>
              </div>

              <div className="text-right">
                <span className="text-amber-400 font-bold font-mono">
                  ★ {session.productivity}/5
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Post-Session Logging Modal */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title="Session Finished! What did you study?"
        subtitle="Record topic, category, and productivity rating for your analytics"
        maxWidth="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsLogModalOpen(false)}>
              Skip
            </Button>
            <Button variant="success" onClick={handleSaveSession}>
              <CheckCircle size={14} />
              <span>Save Study Session</span>
            </Button>
          </>
        }
      >
        <div className="space-y-3.5">
          <Input
            label="What topic did you work on? *"
            value={studiedTopic}
            onChange={(e) => setStudiedTopic(e.target.value)}
            placeholder="e.g. Binary Search on Answer Space"
            autoFocus
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300">Category</label>
            <select
              className="px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
              value={studiedCategory}
              onChange={(e) => setStudiedCategory(e.target.value as TaskCategory)}
            >
              <option value="DSA">DSA Practice</option>
              <option value="WEB_DEV">Web Development</option>
              <option value="PROJECT">Project Implementation</option>
              <option value="CS">CS Fundamentals</option>
              <option value="JOB">Job Applications & InMails</option>
              <option value="REVISION">Spaced Repetition Revision</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300">
              Productivity Rating (1-5): <span className="text-indigo-400 font-bold">{productivityRating}/5</span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setProductivityRating(lvl)}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    productivityRating === lvl
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300">Reflection Notes (Optional)</label>
            <textarea
              rows={2}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
              placeholder="What went well? Any concept to revisit?"
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
