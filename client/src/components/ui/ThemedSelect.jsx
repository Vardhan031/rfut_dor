import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export const ThemedSelect = ({
  value,
  onChange,
  options = [],
  placeholder = 'Select option...',
  className = '',
  disabled = false,
  id
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      className={`relative inline-block text-left select-none ${className}`}
      id={id}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2 rounded-xl text-xs font-sans transition-all duration-200 cursor-pointer ${
          isOpen
            ? 'bg-[#221D16] border-[#D4AF57] text-[#F7F3EB] shadow-[0_0_15px_rgba(212,175,87,0.2)] ring-1 ring-[#D4AF57]/40'
            : 'bg-[#1A1712] hover:bg-[#221D16] border-[#443825] hover:border-[#D4AF57]/60 text-[#F5F0E6]'
        } border ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate font-medium">{displayText}</span>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#D4AF57]' : 'text-[#A69D8B]'
          }`}
        />
      </button>

      {/* Floating Options Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-full min-w-[160px] z-50 rounded-xl bg-[#1E1A14] border border-[#52442A] shadow-[0_16px_40px_rgba(0,0,0,0.9),0_0_20px_rgba(212,175,87,0.12)] p-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="max-h-60 overflow-y-auto space-y-1 scrollbar-thin">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-sans text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#D4AF57]/20 text-[#E8C97B] font-semibold border border-[#D4AF57]/30 shadow-sm'
                      : 'text-[#C5BCAB] hover:text-[#F7F3EB] hover:bg-[#2B241A] border border-transparent'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-[#D4AF57] flex-shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemedSelect;
