import React, { useRef, useEffect, useState, useCallback } from 'react';

export const ScrollStackItem = ({
  children,
  index = 0,
  topOffset = '10vh',
  stackOffset = 0,
  className = '',
  style = {}
}) => {
  return (
    <div
      className={`scroll-stack-card sticky transition-transform duration-300 will-change-transform ${className}`.trim()}
      style={{
        top: stackOffset > 0 ? `calc(${topOffset} + ${index * stackOffset}px)` : topOffset,
        zIndex: 10 + index * 5,
        ...style
      }}
    >
      {children}
    </div>
  );
};

export const ScrollStack = ({
  children,
  className = '',
  itemDistance = 64,
  topOffset = '10vh',
  stackOffset = 0,
  scaleStep = 0.015,
  onStackComplete
}) => {
  const containerRef = useRef(null);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const cards = containerRef.current.querySelectorAll('.scroll-stack-card');
    if (!cards || cards.length === 0) return;

    // Get current top card index
    let currentTop = 0;
    cards.forEach((card, i) => {
      const rect = card.getBoundingClientRect();
      const topOffsetPx = stackOffset > 0
        ? (window.innerHeight * 10) / 100 + i * stackOffset
        : (window.innerHeight * 10) / 100;

      if (rect.top <= topOffsetPx + 4) {
        currentTop = i;
      }
    });

    // Apply scaling ONLY to stacked cards without any transparency/opacity reduction
    cards.forEach((card, i) => {
      const depth = currentTop - i;
      if (depth > 0) {
        // Subtle scale down for deck perspective, but 100% SOLID OPAQUE (no transparency)
        const scale = Math.max(0.9, 1 - depth * scaleStep);
        card.style.transform = `scale(${scale})`;
        card.style.transformOrigin = 'center top';
      } else {
        card.style.transform = 'scale(1)';
      }
      // Guarantee 100% solid opacity: NEVER see through to cards below
      card.style.opacity = '1';
      card.style.filter = 'none';
    });

    if (currentTop === cards.length - 1 && onStackComplete) {
      onStackComplete();
    }
  }, [stackOffset, scaleStep, onStackComplete]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [handleScroll]);

  return (
    <div ref={containerRef} className={`scroll-stack-wrapper relative w-full ${className}`.trim()}>
      <div
        className="scroll-stack-list flex flex-col items-center"
        style={{
          rowGap: `${itemDistance}px`,
          paddingBottom: '40vh'
        }}
      >
        {React.Children.map(children, (child, idx) => {
          if (!React.isValidElement(child)) return child;
          return React.cloneElement(child, {
            index: idx,
            topOffset,
            stackOffset
          });
        })}
      </div>
    </div>
  );
};

export default ScrollStack;
