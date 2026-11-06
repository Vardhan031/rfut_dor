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
  ExternalLink,
  ChevronDown,
  ShieldCheck,
  Star
} from 'lucide-react';

const SAMPLE_TOP_10_NOMINEES = [
  {
    id: 'nom-1',
    rank: 1,
    points: 15,
    name: 'Kylian Mbappe',
    discord: 'mbappe_official#0007',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80',
    title: 'EA FC 24 World Champion & Division Rivals #1',
    description: 'Phenomenal season performance with 280+ Weekend League victories, tournament MVP, and clinical finishing record.',
    stats: { winRate: '92.4%', goals: '412', mvpAwards: 14 }
  },
  {
    id: 'nom-2',
    rank: 2,
    points: 12,
    name: 'Erling Haaland',
    discord: 'haaland_cyborg#0009',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    title: 'Top Goalscorer of the Community Gala',
    description: 'Unstoppable physical presence in the final third. Dominated the Community Cup and secured the Golden Boot.',
    stats: { winRate: '89.1%', goals: '488', mvpAwards: 11 }
  },
  {
    id: 'nom-3',
    rank: 3,
    points: 10,
    name: 'Jude Bellingham',
    discord: 'belligoal#0005',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    title: 'Midfield Maestro & Clutch Goal Specialist',
    description: 'Incredible box-to-box consistency, winning 8 match-winning last-minute headers in overtime tournaments.',
    stats: { winRate: '87.5%', goals: '194', mvpAwards: 9 }
  },
  {
    id: 'nom-4',
    rank: 4,
    points: 8,
    name: 'Vinicius Jr',
    discord: 'vini_skillz#0007',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    title: 'Elite Skiller & Playmaker of the Year',
    description: 'Averaged 6.4 successful dribbles per game with unmatched flair and opening up tournament defenses.',
    stats: { winRate: '85.2%', goals: '230', mvpAwards: 7 }
  },
  {
    id: 'nom-5',
    rank: 5,
    points: 7,
    name: 'Rodri Hernandez',
    discord: 'rodri_anchor#0016',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
    title: 'Tactical Anchor & Defensive Engine',
    description: 'Zero tournament losses when leading in the second half. 94% pass accuracy across the entire competitive circuit.',
    stats: { winRate: '84.8%', goals: '62', mvpAwards: 8 }
  },
  {
    id: 'nom-6',
    rank: 6,
    points: 5,
    name: 'Lamine Yamal',
    discord: 'yamal_wonder#0019',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    title: 'Breakout Young Player of the Year',
    description: 'Sensational debut season reaching the grand finals at 17 years old with unmatched wing speed and finesse.',
    stats: { winRate: '82.0%', goals: '175', mvpAwards: 6 }
  },
  {
    id: 'nom-7',
    rank: 7,
    points: 4,
    name: 'Harry Kane',
    discord: 'kane_clinical#0009',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    title: 'Continental Golden Boot Laureate',
    description: 'Deadly finishing accuracy with 88% on-target shots and leading assists among all European strikers.',
    stats: { winRate: '80.5%', goals: '340', mvpAwards: 5 }
  },
  {
    id: 'nom-8',
    rank: 8,
    points: 3,
    name: 'Phil Foden',
    discord: 'foden_craft#0047',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    title: 'Premier Division Player of the Season',
    description: 'Agile left-footed playmaker creating the most expected assists (xA) in competitive weekend sessions.',
    stats: { winRate: '79.2%', goals: '142', mvpAwards: 4 }
  },
  {
    id: 'nom-9',
    rank: 9,
    points: 2,
    name: 'Florian Wirtz',
    discord: 'wirtz_vision#0010',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    title: 'Invincible League Architect',
    description: 'Orchestrated the unbeaten season with 18 goals and 20 assists, delivering in high-stakes elimination matches.',
    stats: { winRate: '78.4%', goals: '118', mvpAwards: 4 }
  },
  {
    id: 'nom-10',
    rank: 10,
    points: 1,
    name: 'Dani Carvajal',
    discord: 'carvajal_warrior#0002',
    avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80',
    title: 'Defensive Veteran & Cup Champion',
    description: 'Solid defensive discipline, clutch goal in European Final, and relentless leadership down the right flank.',
    stats: { winRate: '77.0%', goals: '38', mvpAwards: 3 }
  }
];

export const ScrollStackTestPage = () => {
  const [nominees, setNominees] = useState(SAMPLE_TOP_10_NOMINEES);
  const [stackFinished, setStackFinished] = useState(false);

  // Live interactive controls
  const [itemDistance, setItemDistance] = useState(70);
  const [itemStackDistance, setItemStackDistance] = useState(24);
  const [stackPosition, setStackPosition] = useState('16%');
  const [blurAmount, setBlurAmount] = useState(2.5);
  const [fadeAmount, setFadeAmount] = useState(0.12);
  const [showControls, setShowControls] = useState(false);

  const moveUp = (index) => {
    if (index <= 0) return;
    setNominees((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      // Reassign rank & points based on new order
      return copy.map((item, idx) => ({
        ...item,
        rank: idx + 1,
        points: [15, 12, 10, 8, 7, 5, 4, 3, 2, 1][idx] || 1
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
        points: [15, 12, 10, 8, 7, 5, 4, 3, 2, 1][idx] || 1
      }));
    });
  };

  const resetOrder = () => {
    setNominees(SAMPLE_TOP_10_NOMINEES);
  };

  const getRankBadgeStyle = (rank) => {
    switch (rank) {
      case 1:
        return 'from-[#D4AF57] via-[#F3E5AB] to-[#9E7D35] text-[#0A0907] border-[#D4AF57] shadow-[0_0_20px_rgba(212,175,87,0.4)]';
      case 2:
        return 'from-[#E0E0E0] via-[#F5F5F5] to-[#9E9E9E] text-[#0A0907] border-[#CCCCCC] shadow-[0_0_15px_rgba(224,224,224,0.3)]';
      case 3:
        return 'from-[#CD7F32] via-[#E8A76A] to-[#8C4E17] text-[#0A0907] border-[#CD7F32] shadow-[0_0_15px_rgba(205,127,50,0.3)]';
      default:
        return 'bg-[#181510] text-[#D4AF57] border-[#554628]';
    }
  };

  return (
    <div className="min-h-screen text-[#F5F0E6] bg-[#0A0907] relative pb-32">
      {/* Gala Atmosphere Lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#D4AF57]/15 via-[#D4AF57]/3 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-[#D4AF57]/8 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28">
        {/* Lab Header */}
        <div className="border-b border-[#3D3321] pb-6 mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF57]/10 border border-[#D4AF57]/30 text-[#E8C97B] text-[11px] font-mono tracking-widest uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF57]" />
              <span>React Bits Pro &bull; Scroll Stack Demo</span>
            </div>
            <h1 className="font-playfair text-3xl sm:text-5xl font-bold uppercase tracking-wide text-typography-primary">
              Top 10 Ballot Stack
            </h1>
            <p className="text-sm font-sans text-typography-secondary mt-1.5 max-w-2xl leading-relaxed">
              Cards that pin, stack, and fade away as you scroll down the page. Designed specifically for the official{' '}
              <span className="text-[#D4AF57] font-semibold">r/FUT d'Or</span> Order of Merit ceremony voting.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-center sm:self-auto flex-wrap justify-center">
            <button
              onClick={() => setShowControls(!showControls)}
              className="px-3.5 py-2 rounded-xl border border-[#3D3321] bg-[#14120E] hover:border-[#D4AF57]/60 text-xs font-sans text-typography-secondary hover:text-typography-primary transition flex items-center gap-1.5 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-[#D4AF57]" />
              <span>{showControls ? 'Hide Controls' : 'Tune Physics'}</span>
            </button>

            <button
              onClick={resetOrder}
              className="px-3 py-2 rounded-xl border border-[#3D3321] bg-[#14120E] hover:bg-[#1B1712] text-xs font-sans text-typography-secondary hover:text-typography-primary transition flex items-center gap-1 cursor-pointer"
              title="Reset Order"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Live Tuning Panel */}
        {showControls && (
          <div className="mb-8 p-5 rounded-2xl bg-[#12100C]/90 border border-[#554628] backdrop-blur-md space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#3D3321]">
              <span className="text-xs font-mono uppercase tracking-wider text-[#D4AF57] font-semibold">
                Physics & Spacing Adjustments
              </span>
              <span className="text-[10px] text-typography-muted font-mono">React Bits Pro Parameters</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-sans">
              <div>
                <label className="block text-typography-secondary mb-1">
                  Card Gap (Distance): <span className="font-mono text-[#D4AF57]">{itemDistance}px</span>
                </label>
                <input
                  type="range"
                  min="30"
                  max="140"
                  value={itemDistance}
                  onChange={(e) => setItemDistance(Number(e.target.value))}
                  className="w-full accent-[#D4AF57]"
                />
              </div>

              <div>
                <label className="block text-typography-secondary mb-1">
                  Stacked Offset: <span className="font-mono text-[#D4AF57]">{itemStackDistance}px</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="45"
                  value={itemStackDistance}
                  onChange={(e) => setItemStackDistance(Number(e.target.value))}
                  className="w-full accent-[#D4AF57]"
                />
              </div>

              <div>
                <label className="block text-typography-secondary mb-1">
                  Depth Blur: <span className="font-mono text-[#D4AF57]">{blurAmount}px</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="6"
                  step="0.5"
                  value={blurAmount}
                  onChange={(e) => setBlurAmount(Number(e.target.value))}
                  className="w-full accent-[#D4AF57]"
                />
              </div>

              <div>
                <label className="block text-typography-secondary mb-1">
                  Depth Fade: <span className="font-mono text-[#D4AF57]">{Math.round(fadeAmount * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="0.3"
                  step="0.02"
                  value={fadeAmount}
                  onChange={(e) => setFadeAmount(Number(e.target.value))}
                  className="w-full accent-[#D4AF57]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Scroll Instruction Pill */}
        <div className="mb-6 flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#14120E] border border-[#3D3321] text-xs font-sans text-typography-secondary">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4AF57] animate-pulse" />
            <span>Scroll smoothly down to see the 10 ballot cards stack onto each other.</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 font-mono text-[11px] text-[#D4AF57]">
            <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
            <span>Scroll to Stack</span>
          </div>
        </div>

        {/* THE SCROLL STACK COMPONENT */}
        <ScrollStack
          itemDistance={itemDistance}
          itemStackDistance={itemStackDistance}
          stackPosition={stackPosition}
          blurAmount={blurAmount}
          fadeAmount={fadeAmount}
          useWindowScroll={true}
          enableLenis={true}
          onStackComplete={() => setStackFinished(true)}
          className="w-full max-w-3xl mx-auto"
        >
          {nominees.map((nominee, index) => {
            const isPodium = nominee.rank <= 3;

            return (
              <ScrollStackItem key={nominee.id}>
                <div
                  className={`p-6 sm:p-7 rounded-2xl border transition-all duration-300 relative overflow-hidden backdrop-blur-md shadow-2xl ${
                    nominee.rank === 1
                      ? 'bg-gradient-to-b from-[#1E190F] via-[#14110A] to-[#0E0C08] border-[#D4AF57] shadow-[0_12px_36px_rgba(212,175,87,0.22)]'
                      : isPodium
                      ? 'bg-gradient-to-b from-[#18140E] to-[#100E0A] border-[#8C733E] shadow-[0_8px_25px_rgba(0,0,0,0.8)]'
                      : 'bg-[#12100C]/95 border-[#3D3321] shadow-[0_6px_20px_rgba(0,0,0,0.7)]'
                  }`}
                >
                  {/* Subtle Gold Edge Highlight for Top 3 */}
                  {isPodium && (
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF57] to-transparent" />
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                    {/* Rank Badge & Points Pill */}
                    <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-2 flex-shrink-0">
                      <div
                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center font-display font-bold border transition-transform ${
                          nominee.rank <= 3
                            ? `bg-gradient-to-b ${getRankBadgeStyle(nominee.rank)}`
                            : 'bg-[#181510] text-[#D4AF57] border-[#3D3321]'
                        }`}
                      >
                        <span className="text-[10px] uppercase font-mono tracking-widest font-normal">Rank</span>
                        <span className="text-2xl sm:text-3xl leading-none">#{nominee.rank}</span>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-[#D4AF57]/10 text-[#E8C97B] border border-[#D4AF57]/30 whitespace-nowrap">
                        +{nominee.points} PTS
                      </span>
                    </div>

                    {/* Candidate Photo */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-[#554628] flex-shrink-0 bg-[#0A0907] shadow-lg group">
                      <img
                        src={nominee.avatar}
                        alt={nominee.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {nominee.rank === 1 && (
                        <div className="absolute top-1 right-1 p-1 rounded-full bg-[#D4AF57] text-[#0A0907] shadow-md">
                          <Trophy className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    {/* Candidate Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-playfair text-xl sm:text-2xl font-bold uppercase tracking-wide text-typography-primary truncate">
                          {nominee.name}
                        </h3>
                        {nominee.rank === 1 && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-widest bg-[#D4AF57] text-[#0A0907] font-bold">
                            BALLON D'OR LEADER
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-[#D4AF57] truncate mt-0.5">{nominee.discord}</p>
                      <p className="text-xs font-medium text-typography-secondary mt-1">{nominee.title}</p>
                      <p className="text-xs text-typography-secondary/80 mt-1 line-clamp-2 leading-relaxed">
                        {nominee.description}
                      </p>

                      {/* Stat Pills */}
                      <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-[#2A2317] text-[11px] font-mono text-typography-secondary">
                        <div>
                          <span className="text-typography-muted">Winrate: </span>
                          <span className="text-[#E8C97B] font-semibold">{nominee.stats.winRate}</span>
                        </div>
                        <div>
                          <span className="text-typography-muted">Goals: </span>
                          <span className="text-typography-primary font-semibold">{nominee.stats.goals}</span>
                        </div>
                        <div>
                          <span className="text-typography-muted">MVPs: </span>
                          <span className="text-[#D4AF57] font-semibold">{nominee.stats.mvpAwards}</span>
                        </div>
                      </div>
                    </div>

                    {/* Reorder Buttons (Move Up / Move Down) */}
                    <div className="flex sm:flex-col items-center justify-end gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#2A2317]">
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className="p-2 rounded-xl border border-[#3D3321] hover:border-[#D4AF57] hover:bg-[#D4AF57]/10 text-typography-secondary hover:text-[#E8C97B] disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                        title="Move Up Rank"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === nominees.length - 1}
                        className="p-2 rounded-xl border border-[#3D3321] hover:border-[#D4AF57] hover:bg-[#D4AF57]/10 text-typography-secondary hover:text-[#E8C97B] disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                        title="Move Down Rank"
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

        {/* Completion Milestone */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-b from-[#181510] to-[#0E0C08] border border-[#554628] text-center max-w-xl mx-auto space-y-4 shadow-2xl">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#D4AF57]/10 border border-[#D4AF57] flex items-center justify-center text-[#D4AF57]">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-playfair text-2xl font-bold uppercase tracking-wide text-typography-primary">
              All 10 Positions Sealed
            </h3>
            <p className="text-xs text-typography-secondary font-sans mt-1">
              Total 67 Points Allocated across the official Top 10 Ballot Shortlist.
            </p>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <Link
              to="/vote/select"
              className="px-5 py-2.5 rounded-xl bg-[#D4AF57] hover:bg-[#E8C97B] text-[#0A0907] font-semibold text-xs uppercase tracking-wider transition shadow-md"
            >
              Apply to Official Ballot
            </Link>
          </div>
        </div>

        {/* Setup Reference Box for React Bits Pro License */}
        <div className="mt-12 p-6 rounded-2xl bg-[#12100C]/60 border border-[#3D3321] text-xs font-sans text-typography-secondary space-y-3">
          <div className="flex items-center gap-2 text-typography-primary font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#D4AF57]" />
            <span>React Bits Pro Registry Setup Status</span>
          </div>
          <p className="leading-relaxed">
            Your project's <code className="text-[#D4AF57] bg-[#1A160F] px-1.5 py-0.5 rounded">components.json</code> has been configured with the <code className="text-[#D4AF57]">@reactbits-starter</code> and <code className="text-[#D4AF57]">@reactbits-pro</code> registry endpoints including the <code className="text-[#D4AF57]">Authorization: Bearer $&#123;REACTBITS_LICENSE_KEY&#125;</code> header.
          </p>
          <div className="p-3 bg-[#0A0907] border border-[#2A2317] rounded-xl font-mono text-[11px] space-y-1">
            <p className="text-typography-muted"># To fetch additional pro blocks or components with CLI:</p>
            <p className="text-typography-primary">
              1. Add your key to <span className="text-[#D4AF57]">client/.env.local</span>: <span className="text-emerald-400">REACTBITS_LICENSE_KEY=your_key</span>
            </p>
            <p className="text-typography-primary">
              2. Run: <span className="text-[#E8C97B]">npx shadcn@latest add @reactbits-starter/scroll-stack-tw</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollStackTestPage;
