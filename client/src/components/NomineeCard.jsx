import React from 'react';
import { Check, Plus } from 'lucide-react';

export const NomineeCard = ({ nominee, isSelected, rank, onToggle, disabled }) => {
  const cleanDiscordHandle = nominee.discordUsername
    ? `@${nominee.discordUsername.toLowerCase().replace(/#\d+$/, '')}`
    : `@${nominee.displayName.toLowerCase()}`;

  return (
    <div
      className={`group relative p-4 sm:p-6 rounded-2xl transition-all duration-300 border flex flex-col justify-between overflow-hidden ${
        isSelected
          ? 'bg-[#14120E] border-[#D4AF57] shadow-[0_8px_25px_rgba(212,175,87,0.18)] ring-1 ring-[#D4AF57]/40'
          : 'bg-[#110F0B]/90 border-[#4A3D24] hover:border-[#D4AF57]/70 backdrop-blur-sm'
      }`}
    >
      {/* Subtle Geometric Ballon d'Or Watermark */}
      <svg
        className="absolute right-0 bottom-0 w-36 h-36 pointer-events-none opacity-15 select-none overflow-hidden"
        viewBox="0 0 180 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="140" cy="140" r="100" stroke="#D4AF57" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="140" cy="140" r="70" stroke="#D4AF57" strokeWidth="1" />
        <polygon points="110,120 140,105 170,120 170,150 140,165 110,150" stroke="#D4AF57" strokeWidth="1" fill="none" />
      </svg>

      <div className="relative z-10">
        {/* Top Header: Nominee index / selected status */}
        <div className="flex items-center justify-between border-b border-[#3D3321] pb-2.5 mb-3">
          <span className="text-xs font-playfair font-bold text-[#C5A253] tracking-wide">
            r/FUT d'Or
          </span>
          {isSelected ? (
            <span className="text-[10px] font-mono tracking-widest text-[#D4AF57] uppercase font-semibold">
              #{rank ? String(rank).padStart(2, '0') : 'SELECTED'}
            </span>
          ) : (
            <span className="text-[10px] font-sans uppercase tracking-widest text-[#A69D8B]">
              Nominee
            </span>
          )}
        </div>

        {/* Candidate Info with Luxury Serif Heading */}
        <h3 className="font-playfair font-bold text-xl sm:text-2xl uppercase tracking-tight text-[#F5F0E6] group-hover:text-[#FFF4D0] transition-colors truncate">
          {nominee.displayName}
        </h3>
        <p className="text-xs text-[#A69D8B] font-mono truncate mt-0.5 sm:mt-1">
          {cleanDiscordHandle}
        </p>
      </div>

      {/* Action Footer */}
      <div className="relative z-10 mt-5 pt-3.5 border-t border-[#3D3321] flex items-center justify-between">
        <span className="text-[10px] text-[#A69D8B] font-sans uppercase tracking-wider">
          {isSelected ? 'In Top 10 Ballot' : 'Available'}
        </span>

        <button
          onClick={() => onToggle(nominee)}
          disabled={disabled && !isSelected}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-sans uppercase tracking-widest transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
            isSelected
              ? 'bg-[#D4AF57] text-[#0A0907] font-semibold shadow-sm'
              : disabled
              ? 'border border-[#3D3321] text-[#706859] cursor-not-allowed opacity-40'
              : 'border border-[#4A3D24] hover:border-[#D4AF57] text-[#F5F0E6] hover:text-[#D4AF57] bg-[#12100C]'
          }`}
        >
          {isSelected ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Selected</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Select</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default NomineeCard;
