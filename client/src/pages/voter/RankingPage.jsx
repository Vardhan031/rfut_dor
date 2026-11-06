import React, { useEffect } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { useVoterAuth } from '../../context/VoterAuthContext';
import { SortableNomineeItem } from '../../components/SortableNomineeItem';
import { ArrowLeft, ArrowRight, Trophy } from 'lucide-react';
import { toast } from 'sonner';

export const RankingPage = () => {
  const { voter, rankings, setRankings, selectedNominees, setSelectedNominees } = useVoterAuth();
  const navigate = useNavigate();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Ensure rankings is initialized from selectedNominees if not already 10
  useEffect(() => {
    if (selectedNominees?.length === 10 && (!rankings || rankings.length !== 10)) {
      setRankings([...selectedNominees]);
    }
  }, [selectedNominees, rankings, setRankings]);

  // Auth guards
  if (!voter) {
    return <Navigate to="/" replace />;
  }
  if (voter.hasVoted) {
    return <Navigate to="/vote/success" replace />;
  }
  if (!selectedNominees || selectedNominees.length !== 10) {
    return <Navigate to="/vote/select" replace />;
  }

  // Smooth, responsive sensors: Mouse for instant desktop drag, Touch with forgiving threshold for mobile
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 4
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 80,
        tolerance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const currentRankings = rankings?.length === 10 ? rankings : selectedNominees;

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = currentRankings.findIndex((item) => item._id === active.id);
      const newIndex = currentRankings.findIndex((item) => item._id === over.id);
      const newRankings = arrayMove(currentRankings, oldIndex, newIndex);
      setRankings(newRankings);
      setSelectedNominees(newRankings);
    }
  };

  const moveUp = (index) => {
    if (index <= 0) return;
    const newRankings = arrayMove(currentRankings, index, index - 1);
    setRankings(newRankings);
    setSelectedNominees(newRankings);
  };

  const moveDown = (index) => {
    if (index >= currentRankings.length - 1) return;
    const newRankings = arrayMove(currentRankings, index, index + 1);
    setRankings(newRankings);
    setSelectedNominees(newRankings);
  };

  const handleRemove = (nomineeId) => {
    const filtered = currentRankings.filter((item) => item._id !== nomineeId);
    setRankings(filtered);
    setSelectedNominees(filtered);
    toast.info('Nominee removed. Please select another candidate to complete your Top 10.');
    navigate('/vote/select');
  };

  const handleProceed = () => {
    setRankings(currentRankings);
    navigate('/vote/confirm');
  };

  return (
    <div className="flex-1 min-h-screen flex flex-col relative text-[#F5F0E6] bg-[#070604]">
      {/* 1. Gala Atmosphere Theatrical Lighting (z-0) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] sm:w-[1000px] h-[480px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#D4AF57]/14 via-[#D4AF57]/3 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#070604]/30 via-transparent to-[#070604]" />
      </div>

      {/* 2. Main Content Container (Single-column layout identical across mobile, tablet & laptop) */}
      <div className="relative z-10 max-w-2xl w-full mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-20 flex flex-col space-y-6">
        {/* Editorial Header */}
        <div className="space-y-1 pb-4 border-b border-[#2E2618]">
          <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#D4AF57] block">
            STAGE 2 OF 3 &bull; ORDER OF MERIT
          </span>
          <h1 className="font-playfair font-bold text-2xl sm:text-3xl uppercase tracking-wide text-typography-primary">
            Rank Your Top 10
          </h1>
          <p className="text-xs sm:text-sm text-typography-secondary font-sans">
            Drag candidates or tap arrows to order from 1st (15 pts) down to 10th (1 pt).
          </p>
        </div>

        {/* Action Bar (Top) */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link
            to="/vote/select"
            className="px-3.5 py-1.5 rounded-xl border border-[#3D3321] hover:border-[#D4AF57] text-[11px] font-mono text-typography-secondary hover:text-typography-primary transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Change Candidates</span>
          </Link>

          <button
            type="button"
            onClick={handleProceed}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF57] via-[#E8C97B] to-[#D4AF57] hover:brightness-110 text-[#0A0907] font-bold text-[11px] uppercase tracking-widest transition-all shadow-[0_4px_20px_rgba(212,175,87,0.35)] cursor-pointer flex items-center gap-2"
          >
            <span>Review Final Ballot</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scoring Weight Strip (10 positions) */}
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 p-3 rounded-2xl bg-[#0C0A07] border border-[#2E2618] text-center shadow-lg">
          {[
            { label: '1st', pts: 15 },
            { label: '2nd', pts: 12 },
            { label: '3rd', pts: 10 },
            { label: '4th', pts: 8 },
            { label: '5th', pts: 7 },
            { label: '6th', pts: 5 },
            { label: '7th', pts: 4 },
            { label: '8th', pts: 3 },
            { label: '9th', pts: 2 },
            { label: '10th', pts: 1 }
          ].map(({ label, pts }) => (
            <div key={label} className="space-y-0.5">
              <div className="text-[9px] font-mono text-typography-muted uppercase">{label}</div>
              <div className="text-[10px] font-mono text-[#D4AF57] font-bold">+{pts}p</div>
            </div>
          ))}
        </div>

        {/* Draggable Sortable List Container */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={currentRankings.map((n) => n._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2.5">
              {currentRankings.map((nominee, idx) => (
                <SortableNomineeItem
                  key={nominee._id}
                  id={nominee._id}
                  nominee={nominee}
                  rank={idx + 1}
                  onMoveUp={() => moveUp(idx)}
                  onMoveDown={() => moveDown(idx)}
                  onRemove={() => handleRemove(nominee._id)}
                  isFirst={idx === 0}
                  isLast={idx === currentRankings.length - 1}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Bottom CTA */}
        <div className="pt-4 pb-8 space-y-3">
          <button
            type="button"
            onClick={handleProceed}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#D4AF57] via-[#E8C97B] to-[#D4AF57] hover:brightness-110 text-[#0A0907] font-bold text-xs sm:text-sm uppercase tracking-widest transition-all shadow-[0_4px_25px_rgba(212,175,87,0.45)] cursor-pointer flex items-center justify-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            <span>Review Final Ballot</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-center text-[10px] font-mono text-typography-muted">
            Drag nominees or use the arrows to set your preferred order &bull; Top of list = Rank 1 (Ballon d'Or Winner)
          </p>
        </div>
      </div>
    </div>
  );
};

export default RankingPage;
