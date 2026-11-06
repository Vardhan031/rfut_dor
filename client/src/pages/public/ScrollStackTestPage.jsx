import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ScrollStack, ScrollStackItem } from '../../components/ui/scroll-stack';
import {
  Trophy,
  Award,
  Sparkles,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Sliders,
  RotateCcw,
  ChevronDown,
  ShieldCheck,
  Crown,
  Flame,
  Zap,
  Star
} from 'lucide-react';

const SAMPLE_NOMINEES = [
  {
    id: 'nom-1',
    rank: 1,
    points: 15,
    name: 'Kylian Mbappe',
    discord: 'mbappe_official#0007',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80',
    title: 'EA FC 24 World Champion & Division 1 Laureate',
    badge: "BALLON D'OR LEADER",
    accolades: '280+ Weekend League victories, tournament MVP, and 412 competitive goals scored.',
    stats: { winRate: '94.2%', goals: '412', mvpAwards: 14, clutchFactor: '9.9/10' }
  },
  {
    id: 'nom-2',
    rank: 2,
    points: 12,
    name: 'Erling Haaland',
    discord: 'haaland_cyborg#0009',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    title: 'Golden Boot Winner & Final Third Master',
    badge: 'SILVER PODIUM',
    accolades: 'Unstoppable physical presence. Scored 488 competitive goals across community tournaments.',
    stats: { winRate: '89.5%', goals: '488', mvpAwards: 11, clutchFactor: '9.6/10' }
  },
  {
    id: 'nom-3',
    rank: 3,
    points: 10,
    name: 'Jude Bellingham',
    discord: 'belligoal#0005',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    title: 'Midfield Maestro & Clutch Playmaker',
    badge: 'BRONZE PODIUM',
    accolades: '8 match-winning stoppage-time goals in elimination rounds. 92% passing accuracy.',
    stats: { winRate: '88.1%', goals: '194', mvpAwards: 9, clutchFactor: '9.5/10' }
  },
  {
    id: 'nom-4',
    rank: 4,
    points: 8,
    name: 'Vinicius Jr',
    discord: 'vini_skillz#0007',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    title: 'Elite Skiller & Dribbling Phenom',
    badge: 'ORDER OF MERIT #4',
    accolades: '6.4 successful dribbles per match, tearing open defensive blocks in grand finals.',
    stats: { winRate: '86.4%', goals: '230', mvpAwards: 7, clutchFactor: '9.2/10' }
  },
  {
    id: 'nom-5',
    rank: 5,
    points: 7,
    name: 'Rodri Hernandez',
    discord: 'rodri_anchor#0016',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
    title: 'Tactical Anchor & Unbeaten Engine',
    badge: 'ORDER OF MERIT #5',
    accolades: 'Zero losses when holding second-half leads. 95% passing accuracy across circuit.',
    stats: { winRate: '85.2%', goals: '62', mvpAwards: 8, clutchFactor: '9.4/10' }
  },
  {
    id: 'nom-6',
    rank: 6,
    points: 5,
    name: 'Lamine Yamal',
    discord: 'yamal_wonder#0019',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    title: 'Breakout Young Player of the Year',
    badge: 'ORDER OF MERIT #6',
    accolades: 'Sensational debut season reaching championship finals at 17 years old.',
    stats: { winRate: '83.0%', goals: '175', mvpAwards: 6, clutchFactor: '9.0/10' }
  },
  {
    id: 'nom-7',
    rank: 7,
    points: 4,
    name: 'Harry Kane',
    discord: 'kane_clinical#0009',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    title: 'European Golden Shoe Laureate',
    badge: 'ORDER OF MERIT #7',
    accolades: 'Deadly finishing with 88% on-target shots and 340 goals in weekend cups.',
    stats: { winRate: '81.4%', goals: '340', mvpAwards: 5, clutchFactor: '8.8/10' }
  },
  {
    id: 'nom-8',
    rank: 8,
    points: 3,
    name: 'Phil Foden',
    discord: 'foden_craft#0047',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    title: 'Creative Playmaker of the Season',
    badge: 'ORDER OF MERIT #8',
    accolades: 'Created the highest expected assists (xA) in competitive weekend sessions.',
    stats: { winRate: '79.9%', goals: '142', mvpAwards: 4, clutchFactor: '8.6/10' }
  },
  {
    id: 'nom-9',
    rank: 9,
    points: 2,
    name: 'Florian Wirtz',
    discord: 'wirtz_vision#0010',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    title: 'Invincible League Architect',
    badge: 'ORDER OF MERIT #9',
    accolades: '18 goals and 20 assists in unbeaten campaign, delivering in clutch elimination cups.',
    stats: { winRate: '78.5%', goals: '118', mvpAwards: 4, clutchFactor: '8.5/10' }
  },
  {
    id: 'nom-10',
    rank: 10,
    points: 1,
    name: 'Dani Carvajal',
    discord: 'carvajal_warrior#0002',
    avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80',
    title: 'Veteran Defender & European Cup Champion',
    badge: 'ORDER OF MERIT #10',
    accolades: 'Clutch header in European Final, relentless defensive leadership.',
    stats: { winRate: '77.2%', goals: '38', mvpAwards: 3, clutchFactor: '8.7/10' }
  }
];

export const ScrollStackTestPage = () => {
  const [nominees, setNominees] = useState(SAMPLE_NOMINEES);

  // Live customizable settings
  const [itemDistance, setItemDistance] = useState(48);
  const [topOffset, setTopOffset] = useState(96);
  const [stackOffset, setStackOffset] = useState(26);
  const [scaleStep, setScaleStep] = useState(0.025);
  const [blurStep, setBlurStep] = useState(1.5);
  const [fadeStep, setFadeStep] = useState(0.1);
  const [showTuning, setShowTuning] = useState(false);

  const moveUp = (index) => {
    if (index <= 0) return;
    setNominees((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      return copy.map((item, idx) => ({
        ...item,
        rank: idx + 1,
        points: [15, 12, 10, 8, 7, 5, 4, 3, 2, 1][idx] || 1,
        badge:
          idx === 0
            ? "BALLON D'OR LEADER"
            : idx === 1
            ? 'SILVER PODIUM'
            : idx === 2
            ? 'BRONZE PODIUM'
            : `ORDER OF MERIT #${idx + 1}`
      }));
    });
  };

  const moveDown = (index) => {
    if (index >= nominees.length - 1) return;
    setNominees((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
      return copy.map((item, idx) => ({
        ...item,
        rank: idx + 1,
        points: [15, 12, 10, 8, 7, 5, 4, 3, 2, 1][idx] || 1,
        badge:
          idx === 0
            ? "BALLON D'OR LEADER"
            : idx === 1
            ? 'SILVER PODIUM'
            : idx === 2
            ? 'BRONZE PODIUM'
            : `ORDER OF MERIT #${idx + 1}`
      }));
    });
  };

  const resetNominees = () => {
    setNominees(SAMPLE_NOMINEES);
  };

  return (
    <div className="min-h-screen text-[#F5F0E6] bg-[#0A0907] relative pb-32">
      {/* Gala Atmosphere Theatrical Lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#D4AF57]/18 via-[#D4AF57]/4 to-transparent blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-[#D4AF57]/10 via-transparent to-transparent blur-3xl" />
        <div className="absolute top-2/3 -left-40 w-[600px] h-[600px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-[#D4AF57]/8 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28">
        {/* Ceremony Gala Header */}
        <div className="text-center mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D4AF57]/10 border border-[#D4AF57]/30 text-[#E8C97B] text-[11px] font-mono tracking-widest uppercase shadow-[0_0_15px_rgba(212,175,87,0.15)]">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF57] animate-pulse" />
            <span>r/FUT d'Or 2026 &bull; OFFICIAL ORDER OF MERIT</span>
          </div>

          <h1 className="font-playfair text-3xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-wide text-typography-primary leading-tight">
            Top 10 Ceremony Stack
          </h1>

          <p className="text-sm font-sans text-typography-secondary max-w-xl mx-auto leading-relaxed">
            Scroll down smoothly to watch the 10 ballot cards stack into an official Ballon d'Or deck, scaling down and fading with cinematic depth.
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex items-center justify-center gap-6 pt-2 text-xs font-mono text-[#D4AF57]">
            <span className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-[#D4AF57]" />
              <span>67 Points Total</span>
            </span>
            <span className="text-[#3D3321]">&bull;</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>10 Ranked Positions</span>
            </span>
            <span className="text-[#3D3321]">&bull;</span>
            <button
              onClick={() => setShowTuning(!showTuning)}
              className="text-xs text-typography-secondary hover:text-typography-primary underline decoration-dotted underline-offset-4 cursor-pointer flex items-center gap-1"
            >
              <Sliders className="w-3 h-3 text-[#D4AF57]" />
              <span>{showTuning ? 'Close Physics' : 'Tune Physics'}</span>
            </button>
          </div>
        </div>

        {/* Live Physics Tuning Panel */}
        {showTuning && (
          <div className="mb-8 p-5 rounded-2xl bg-[#14120E]/95 border border-[#554628] backdrop-blur-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#3D3321]">
              <span className="text-xs font-mono uppercase tracking-wider text-[#D4AF57] font-semibold flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>Physics & Spacing Adjuster</span>
              </span>
              <button
                onClick={resetNominees}
                className="px-2.5 py-1 text-[11px] font-sans rounded-lg border border-[#3D3321] hover:border-[#D4AF57] text-typography-secondary hover:text-[#E8C97B] transition flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Ranks</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-sans">
              <div>
                <label className="block text-typography-secondary mb-1">
                  Top Pin Offset: <span className="font-mono text-[#D4AF57]">{topOffset}px</span>
                </label>
                <input
                  type="range"
                  min="60"
                  max="140"
                  value={topOffset}
                  onChange={(e) => setTopOffset(Number(e.target.value))}
                  className="w-full accent-[#D4AF57]"
                />
              </div>

              <div>
                <label className="block text-typography-secondary mb-1">
                  Stack Offset: <span className="font-mono text-[#D4AF57]">{stackOffset}px</span>
                </label>
                <input
                  type="range"
                  min="12"
                  max="40"
                  value={stackOffset}
                  onChange={(e) => setStackOffset(Number(e.target.value))}
                  className="w-full accent-[#D4AF57]"
                />
              </div>

              <div>
                <label className="block text-typography-secondary mb-1">
                  Depth Blur: <span className="font-mono text-[#D4AF57]">{blurStep}px</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="0.5"
                  value={blurStep}
                  onChange={(e) => setBlurStep(Number(e.target.value))}
                  className="w-full accent-[#D4AF57]"
                />
              </div>

              <div>
                <label className="block text-typography-secondary mb-1">
                  Depth Fade: <span className="font-mono text-[#D4AF57]">{Math.round(fadeStep * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="0.25"
                  step="0.02"
                  value={fadeStep}
                  onChange={(e) => setFadeStep(Number(e.target.value))}
                  className="w-full accent-[#D4AF57]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Scroll Instruction Callout */}
        <div className="mb-6 flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#12100C] border border-[#3D3321] text-xs font-sans text-typography-secondary">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4AF57] animate-ping" />
            <span>Scroll downward smoothly to experience the card stack effect.</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[11px] text-[#D4AF57]">
            <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
            <span>Scroll Deck</span>
          </div>
        </div>

        {/* THE LUXURY BALLON D'OR SCROLL STACK */}
        <ScrollStack
          itemDistance={itemDistance}
          topOffset={topOffset}
          stackOffset={stackOffset}
          scaleStep={scaleStep}
          blurStep={blurStep}
          fadeStep={fadeStep}
          className="w-full"
        >
          {nominees.map((nominee, index) => {
            const isWinner = nominee.rank === 1;
            const isSilver = nominee.rank === 2;
            const isBronze = nominee.rank === 3;
            const isPodium = nominee.rank <= 3;

            return (
              <ScrollStackItem key={nominee.id}>
                <div
                  className={`relative rounded-2xl border transition-all duration-300 overflow-hidden shadow-2xl ${
                    isWinner
                      ? 'bg-gradient-to-b from-[#1C170E] via-[#14110A] to-[#0A0907] border-[#D4AF57] shadow-[0_16px_45px_rgba(212,175,87,0.28)]'
                      : isSilver
                      ? 'bg-gradient-to-b from-[#181818] via-[#121212] to-[#0A0907] border-[#A8A8A8] shadow-[0_12px_35px_rgba(180,180,180,0.18)]'
                      : isBronze
                      ? 'bg-gradient-to-b from-[#1A140F] via-[#120E0A] to-[#0A0907] border-[#CD7F32] shadow-[0_12px_35px_rgba(205,127,50,0.2)]'
                      : 'bg-[#12100C] border-[#3D3321] shadow-[0_8px_30px_rgba(0,0,0,0.7)] hover:border-[#D4AF57]/50'
                  }`}
                >
                  {/* Luxury Top Header Bar (Permanently peeks out when stacked) */}
                  <div
                    className={`px-5 sm:px-7 py-3 border-b flex items-center justify-between text-xs font-mono uppercase tracking-wider ${
                      isWinner
                        ? 'bg-[#D4AF57]/15 border-[#D4AF57]/40 text-[#E8C97B]'
                        : isSilver
                        ? 'bg-[#CCCCCC]/10 border-[#CCCCCC]/30 text-[#E0E0E0]'
                        : isBronze
                        ? 'bg-[#CD7F32]/10 border-[#CD7F32]/30 text-[#E8A76A]'
                        : 'bg-[#181510] border-[#2A2317] text-typography-secondary'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isWinner ? (
                        <Crown className="w-4 h-4 text-[#D4AF57]" />
                      ) : isPodium ? (
                        <MedalIcon rank={nominee.rank} />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-[#554628]" />
                      )}
                      <span className="font-semibold text-typography-primary">
                        {nominee.badge}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-typography-muted">Point Value:</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          isWinner
                            ? 'bg-[#D4AF57] text-[#0A0907]'
                            : isPodium
                            ? 'bg-[#E8C97B]/20 text-[#E8C97B] border border-[#D4AF57]/40'
                            : 'bg-[#1E1B15] text-[#D4AF57] border border-[#3D3321]'
                        }`}
                      >
                        +{nominee.points} PTS
                      </span>
                    </div>
                  </div>

                  {/* Card Main Body */}
                  <div className="p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
                    {/* Giant Rank Number */}
                    <div className="flex sm:flex-col items-center justify-between sm:justify-center flex-shrink-0">
                      <div
                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center font-display font-bold border ${
                          isWinner
                            ? 'bg-gradient-to-b from-[#D4AF57] to-[#9E7D35] text-[#0A0907] border-[#D4AF57] shadow-lg'
                            : isSilver
                            ? 'bg-gradient-to-b from-[#E0E0E0] to-[#999999] text-[#0A0907] border-[#CCCCCC]'
                            : isBronze
                            ? 'bg-gradient-to-b from-[#CD7F32] to-[#8C4E17] text-[#0A0907] border-[#CD7F32]'
                            : 'bg-[#181510] text-[#D4AF57] border-[#3D3321]'
                        }`}
                      >
                        <span className="text-[9px] uppercase font-mono tracking-widest font-normal">Pos</span>
                        <span className="text-2xl sm:text-3xl leading-none">
                          {nominee.rank < 10 ? `0${nominee.rank}` : nominee.rank}
                        </span>
                      </div>
                    </div>

                    {/* Candidate Photo in Gold Frame */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-[#554628] flex-shrink-0 bg-[#0A0907] shadow-xl group">
                      <img
                        src={nominee.avatar}
                        alt={nominee.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {isWinner && (
                        <div className="absolute top-1 right-1 p-1 rounded-full bg-[#D4AF57] text-[#0A0907] shadow-md">
                          <Trophy className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    {/* Candidate Biography & Achievements */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-playfair text-xl sm:text-2xl font-bold uppercase tracking-wide text-typography-primary truncate">
                          {nominee.name}
                        </h3>
                        <span className="text-xs font-mono text-[#D4AF57]">{nominee.discord}</span>
                      </div>

                      <p className="text-xs font-semibold text-[#E8C97B] mt-0.5">{nominee.title}</p>
                      <p className="text-xs text-typography-secondary mt-1 leading-relaxed">
                        {nominee.accolades}
                      </p>

                      {/* Stat Badges */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 pt-2.5 border-t border-[#2A2317] text-[11px] font-mono text-typography-secondary">
                        <div className="px-2 py-0.5 rounded bg-[#16130E] border border-[#2A2317]">
                          <span className="text-typography-muted">Winrate: </span>
                          <span className="text-[#E8C97B] font-semibold">{nominee.stats.winRate}</span>
                        </div>
                        <div className="px-2 py-0.5 rounded bg-[#16130E] border border-[#2A2317]">
                          <span className="text-typography-muted">Goals: </span>
                          <span className="text-typography-primary font-semibold">{nominee.stats.goals}</span>
                        </div>
                        <div className="px-2 py-0.5 rounded bg-[#16130E] border border-[#2A2317]">
                          <span className="text-typography-muted">MVPs: </span>
                          <span className="text-[#D4AF57] font-semibold">{nominee.stats.mvpAwards}</span>
                        </div>
                        <div className="px-2 py-0.5 rounded bg-[#16130E] border border-[#2A2317]">
                          <span className="text-typography-muted">Clutch: </span>
                          <span className="text-emerald-400 font-semibold">{nominee.stats.clutchFactor}</span>
                        </div>
                      </div>
                    </div>

                    {/* Reorder Buttons */}
                    <div className="flex sm:flex-col items-center justify-end gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#2A2317] flex-shrink-0">
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className="p-2 sm:p-2.5 rounded-xl border border-[#3D3321] hover:border-[#D4AF57] hover:bg-[#D4AF57]/10 text-typography-secondary hover:text-[#E8C97B] disabled:opacity-20 disabled:pointer-events-none transition cursor-pointer"
                        title="Promote Rank (Move Up)"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === nominees.length - 1}
                        className="p-2 sm:p-2.5 rounded-xl border border-[#3D3321] hover:border-[#D4AF57] hover:bg-[#D4AF57]/10 text-typography-secondary hover:text-[#E8C97B] disabled:opacity-20 disabled:pointer-events-none transition cursor-pointer"
                        title="Demote Rank (Move Down)"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </ScrollStackItem>
            );
          })}
        </ScrollStack>

        {/* Ceremony Complete Milestone Card */}
        <div className="mt-12 p-8 rounded-3xl bg-gradient-to-b from-[#1C170E] via-[#14120E] to-[#0A0907] border border-[#D4AF57] text-center max-w-xl mx-auto space-y-4 shadow-[0_16px_50px_rgba(212,175,87,0.22)]">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#D4AF57]/15 border border-[#D4AF57] flex items-center justify-center text-[#D4AF57] shadow-lg">
            <Trophy className="w-7 h-7" />
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D4AF57] block">
              OFFICIAL CEREMONY VERIFICATION
            </span>
            <h3 className="font-playfair text-2xl sm:text-3xl font-bold uppercase tracking-wide text-typography-primary mt-1">
              Top 10 Order Sealed
            </h3>
            <p className="text-xs text-typography-secondary font-sans mt-1.5 leading-relaxed">
              All 67 points have been completely allocated across the 10 ballot candidates with no duplicate positions.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/vote/select"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#D4AF57] hover:bg-[#E8C97B] text-[#0A0907] font-semibold text-xs uppercase tracking-wider transition shadow-lg"
            >
              Apply to Official Ballot Flow
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#3D3321] hover:border-[#D4AF57] text-typography-secondary hover:text-typography-primary font-semibold text-xs uppercase tracking-wider transition"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const MedalIcon = ({ rank }) => {
  return (
    <span
      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
        rank === 2 ? 'bg-[#CCCCCC] text-[#0A0907]' : 'bg-[#CD7F32] text-[#0A0907]'
      }`}
    >
      {rank}
    </span>
  );
};

export default ScrollStackTestPage;
