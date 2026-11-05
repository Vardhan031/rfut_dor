import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
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
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export const RankingPage = () => {
  const { voter, rankings, setRankings, selectedNominees, setSelectedNominees } = useVoterAuth();
  const navigate = useNavigate();

  // If user hasn't selected 10, redirect back
  if (rankings.length !== 10) {
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

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = rankings.findIndex((item) => item._id === active.id);
      const newIndex = rankings.findIndex((item) => item._id === over.id);
      const newRankings = arrayMove(rankings, oldIndex, newIndex);
      setRankings(newRankings);
      setSelectedNominees(newRankings);
    }
  };

  const moveUp = (index) => {
    if (index <= 0) return;
    const newRankings = arrayMove(rankings, index, index - 1);
    setRankings(newRankings);
    setSelectedNominees(newRankings);
  };

  const moveDown = (index) => {
    if (index >= rankings.length - 1) return;
    const newRankings = arrayMove(rankings, index, index + 1);
    setRankings(newRankings);
    setSelectedNominees(newRankings);
  };

  const handleRemove = (nomineeId) => {
    const filtered = rankings.filter((item) => item._id !== nomineeId);
    setRankings(filtered);
    setSelectedNominees(filtered);
    toast.info('Nominee removed. Please select another candidate to complete your Top 10.');
    navigate('/vote/select');
  };

  return (
    <div className="flex-1 min-h-screen flex flex-col relative text-[#F5F0E6]">
      {/* 1. Dark Obsidian Ceremony Stage Ambient Lighting (z-0) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0A0907]">
        {/* Soft overhead golden gala spotlight beam */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[550px] sm:w-[900px] h-[450px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#D4AF57]/14 via-[#D4AF57]/3 to-transparent blur-3xl pointer-events-none" />
        {/* Deep stage vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0907]/30 via-transparent to-[#0A0907]" />
      </div>

      {/* 2. Main Content Container (z-10 ensures everything renders crisply above background) */}
      <div className="relative z-10 max-w-4xl w-full mx-auto px-3 sm:px-6 pt-20 sm:pt-28 pb-16 flex flex-col">
        {/* Editorial Header */}
        <div className="mb-5 sm:mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 border-b border-[#3D3321] pb-5 sm:pb-6">
          <div>
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#D4AF57] block mb-1">
              STAGE 2 OF 3 &bull; ORDER OF MERIT
            </span>
            <h2 className="font-playfair font-bold text-2xl sm:text-4xl text-[#F5F0E6] uppercase tracking-wide">
              Rank Your Top 10
            </h2>
            <p className="text-[#A69D8B] text-xs sm:text-sm font-sans mt-1">
              Drag candidates or tap arrows to order from 1st (15 pts) down to 10th (1 pt).
            </p>
          </div>

          {/* 67 Points Total */}
          <div className="bg-[#12100C]/90 border border-[#3D3321] px-3.5 py-1.5 sm:py-2 rounded-lg text-left sm:text-right flex-shrink-0 self-start sm:self-auto shadow-md">
            <span className="text-[9px] uppercase font-mono tracking-widest text-[#D4AF57] block">Scoring Weight</span>
            <span className="font-mono text-xs sm:text-sm font-semibold text-[#F5F0E6]">
              67 Points Total
            </span>
          </div>
        </div>

        {/* Drag & Drop Ranking Container */}
        <div className="rounded-2xl bg-[#12100C]/95 border border-[#3D3321] p-2.5 sm:p-6 shadow-2xl backdrop-blur-md">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={rankings.map((n) => n._id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {rankings.map((nominee, idx) => (
                  <SortableNomineeItem
                    key={nominee._id}
                    id={nominee._id}
                    nominee={nominee}
                    rank={idx + 1}
                    onMoveUp={() => moveUp(idx)}
                    onMoveDown={() => moveDown(idx)}
                    onRemove={() => handleRemove(nominee._id)}
                    isFirst={idx === 0}
                    isLast={idx === rankings.length - 1}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Navigation Footer */}
          <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-[#3D3321] flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => navigate('/vote/select')}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-[#3D3321] hover:border-[#D4AF57] text-[#A69D8B] hover:text-[#F5F0E6] bg-[#14120E] text-xs font-sans uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Modify Selection</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/vote/confirm')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF57] via-[#E8C97B] to-[#D4AF57] hover:brightness-110 text-[#0C0C0B] font-sans font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(212,175,87,0.3)] cursor-pointer"
            >
              <span>Review Final Ballot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingPage;
