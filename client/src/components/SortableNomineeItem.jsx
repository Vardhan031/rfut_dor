import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ArrowUp, ArrowDown, X } from 'lucide-react';

const RANK_CONFIG = {
  1: { label: '1ST', points: 15, isPodium: true },
  2: { label: '2ND', points: 12, isPodium: true },
  3: { label: '3RD', points: 10, isPodium: true },
  4: { label: '4TH', points: 8, isPodium: false },
  5: { label: '5TH', points: 7, isPodium: false },
  6: { label: '6TH', points: 5, isPodium: false },
  7: { label: '7TH', points: 4, isPodium: false },
  8: { label: '8TH', points: 3, isPodium: false },
  9: { label: '9TH', points: 2, isPodium: false },
  10: { label: '10TH', points: 1, isPodium: false },
};

export const SortableNomineeItem = ({
  id,
  nominee,
  rank,
  onMoveUp,
  onMoveDown,
  onRemove,
  isFirst,
  isLast,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition: transition || 'transform 200ms cubic-bezier(0.2, 0, 0, 1)',
    zIndex: isDragging ? 50 : 1,
  };

  const config = RANK_CONFIG[rank] || { label: `#${rank}`, points: 0, isPodium: false };
  const cleanDiscord = nominee.discordUsername
    ? nominee.discordUsername.toLowerCase().replace(/#\d+$/, '')
    : nominee.displayName.toLowerCase();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group p-2.5 sm:p-4 rounded-xl border transition-all duration-200 flex items-center gap-2 sm:gap-4 select-none ${
        isDragging
          ? 'bg-[#18140B] border-gold opacity-95 shadow-[0_12px_35px_rgba(0,0,0,0.9),0_0_20px_rgba(212,175,87,0.3)] scale-[1.02]'
          : rank === 1
          ? 'bg-[#151109] border-[#E8C97B]/90 shadow-[0_2px_12px_rgba(232,201,123,0.12)]'
          : rank <= 3
          ? 'bg-[#120F0A] border-[#D4AF57]/60'
          : 'bg-surface/95 border-surface-border hover:border-gold/40'
      }`}
    >
      {/* Drag handle with comfortable touch target */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1.5 sm:p-2 text-typography-muted hover:text-gold active:text-gold transition-colors touch-none flex-shrink-0"
        title="Hold & drag to rearrange rank"
        aria-label="Drag to rearrange rank"
      >
        <GripVertical className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>

      {/* Rank & Points Indicator */}
      <div className="flex flex-col items-center justify-center w-11 sm:w-16 py-1 px-1 rounded-lg border border-surface-border bg-[#0E0C09] text-center flex-shrink-0">
        <span
          className={`font-cinzel text-xs sm:text-sm uppercase font-bold leading-none ${
            config.isPodium ? 'text-gold' : 'text-typography-primary'
          }`}
        >
          {config.label}
        </span>
        <span className="text-[9px] sm:text-[10px] font-mono text-typography-secondary mt-0.5">
          {config.points}p
        </span>
      </div>

      {/* Nominee Details (Ample room for full names on mobile!) */}
      <div className="flex-1 min-w-0 pr-1">
        <h4 className="font-playfair font-bold text-typography-primary text-sm sm:text-base tracking-wide truncate group-hover:text-gold transition-colors">
          {nominee.displayName}
        </h4>
        <p className="text-[11px] sm:text-xs text-typography-secondary font-mono tracking-wider truncate">
          @{cleanDiscord}
        </p>
      </div>

      {/* Reordering and Removal Controls (Generous touch targets on Mobile, Horizontal on Desktop) */}
      <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
        {/* On Mobile: Generous Vertical Stepper Stack */}
        <div className="flex flex-col sm:hidden gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            className="w-8 h-7 rounded border border-surface-border hover:border-gold active:bg-gold active:text-[#0A0907] text-typography-secondary hover:text-gold disabled:opacity-20 flex items-center justify-center transition-all cursor-pointer active:scale-90"
            title="Move higher"
            aria-label="Move higher"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            className="w-8 h-7 rounded border border-surface-border hover:border-gold active:bg-gold active:text-[#0A0907] text-typography-secondary hover:text-gold disabled:opacity-20 flex items-center justify-center transition-all cursor-pointer active:scale-90"
            title="Move lower"
            aria-label="Move lower"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* On Desktop: Horizontal Arrow Buttons */}
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isFirst}
          className="hidden sm:flex p-2 rounded-lg border border-surface-border hover:border-gold hover:bg-gold/10 active:scale-95 text-typography-secondary hover:text-gold disabled:opacity-20 transition-all cursor-pointer"
          title="Move higher"
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLast}
          className="hidden sm:flex p-2 rounded-lg border border-surface-border hover:border-gold hover:bg-gold/10 active:scale-95 text-typography-secondary hover:text-gold disabled:opacity-20 transition-all cursor-pointer"
          title="Move lower"
        >
          <ArrowDown className="w-3.5 h-3.5" />
        </button>

        {/* Remove Button */}
        <button
          type="button"
          onClick={onRemove}
          className="w-8 h-15 sm:w-auto sm:h-auto sm:p-2 rounded-lg border border-surface-border hover:border-red-500/60 active:bg-red-500/20 active:scale-95 text-typography-secondary hover:text-red-400 transition-all flex items-center justify-center cursor-pointer"
          title="Remove from ballot"
          aria-label="Remove nominee"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default SortableNomineeItem;
