import React, { useRef, useEffect, useState, useCallback } from 'react';

export const ScrollStackItem = ({
  children,
  index = 0,
  topOffset = 90,
  stackOffset = 28,
  totalItems = 10,
  className = '',
  style = {}
}) => {
  return (
    <div
      className={`scroll-stack-card sticky transition-all duration-300 will-change-transform ${className}`.trim()}
      style={{
        top: `${topOffset + index * stackOffset}px`,
        zIndex: 10 + index,
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
  itemDistance = 48,
  topOffset = 100,
  stackOffset = 26,
  scaleStep = 0.025,
  blurStep = 1.5,
  fadeStep = 0.1,
  onStackComplete
}) => {
  const containerRef = useRef(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const cards = containerRef.current.querySelectorAll('.scroll-stack-card');
    if (!cards || cards.length === 0) return;

    let currentTop = 0;
    cards.forEach((card, i) => {
      const rect = card.getBoundingClientRect();
      const stickyThreshold = topOffset + i * stackOffset;

      // Card is currently pinned at the top
      if (rect.top <= stickyThreshold + 2) {
        currentTop = i;
      }
    });

    setActiveCardIndex(currentTop);

    // Apply smooth scaling, depth blur, and opacity to stacked cards
    cards.forEach((card, i) => {
      const depth = currentTop - i;
      if (depth > 0) {
        // Card is behind the current top card
        const scale = Math.max(0.78, 1 - depth * scaleStep);
        const blur = Math.min(6, depth * blurStep);
        const opacity = Math.max(0.35, 1 - depth * fadeStep);

        card.style.transform = `scale(${scale})`;
        card.style.transformOrigin = 'center top';
        card.style.filter = blur > 0 ? `blur(${blur}px)` : 'none';
        card.style.opacity = `${opacity}`;
      } else {
        // Card is active or below
        card.style.transform = 'scale(1)';
        card.style.filter = 'none';
        card.style.opacity = '1';
      }
    });

    if (currentTop === cards.length - 1 && onStackComplete) {
      onStackComplete();
    }
  }, [topOffset, stackOffset, scaleStep, blurStep, fadeStep, onStackComplete]);

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
    <div ref={containerRef} className={`scroll-stack-wrapper relative ${className}`.trim()}>
      <div
        className="scroll-stack-list flex flex-col"
        style={{
          rowGap: `${itemDistance}px`,
          paddingBottom: '160px'
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
