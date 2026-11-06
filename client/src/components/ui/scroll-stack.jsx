import React, { useRef, useEffect, useCallback } from 'react';
import Lenis from 'lenis';

export const ScrollStackItem = ({
  children,
  className = '',
  itemClassName = '',
  style = {}
}) => {
  return (
    <div
      className={`scroll-stack-card will-change-transform ${itemClassName} ${className}`.trim()}
      style={{
        transformOrigin: 'center top',
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
  itemDistance = 70,
  itemScale = 0.03,
  itemStackDistance = 24,
  stackPosition = '16%',
  scaleEndPosition = '10%',
  baseScale = 0.88,
  rotationAmount = 0,
  blurAmount = 2.5,
  fadeAmount = 0.15,
  useWindowScroll = true,
  enableLenis = true,
  onStackComplete
}) => {
  const scrollerRef = useRef(null);
  const stackCompletedRef = useRef(false);
  const animationFrameRef = useRef(null);
  const lenisRef = useRef(null);
  const cardsRef = useRef([]);
  const lastTransformsRef = useRef(new Map());

  const parsePercentage = useCallback((value, containerHeight) => {
    if (typeof value === 'string' && value.includes('%')) {
      return (parseFloat(value) / 100) * containerHeight;
    }
    return parseFloat(String(value));
  }, []);

  const calculateProgress = useCallback((scrollTop, start, end) => {
    if (scrollTop < start) return 0;
    if (scrollTop > end) return 1;
    if (end === start) return 0;
    return (scrollTop - start) / (end - start);
  }, []);

  const getElementOffset = useCallback(
    (element) => {
      if (!element) return 0;
      if (useWindowScroll) {
        const rect = element.getBoundingClientRect();
        return rect.top + window.scrollY;
      }
      return element.offsetTop;
    },
    [useWindowScroll]
  );

  const updateCardTransforms = useCallback(() => {
    if (!scrollerRef.current && !useWindowScroll) return;

    const containerHeight = useWindowScroll
      ? window.innerHeight
      : scrollerRef.current?.clientHeight || window.innerHeight;

    const scrollTop = useWindowScroll
      ? window.scrollY
      : scrollerRef.current?.scrollTop || 0;

    const stackPositionPx = parsePercentage(stackPosition, containerHeight);
    const scaleEndPositionPx = parsePercentage(scaleEndPosition, containerHeight);

    const endElement = scrollerRef.current?.querySelector('.scroll-stack-end');
    const endElementTop = endElement ? getElementOffset(endElement) : 999999;

    cardsRef.current.forEach((card, i) => {
      if (!card) return;

      const cardTop = getElementOffset(card);
      const triggerStart = cardTop - stackPositionPx - itemStackDistance * i;
      const triggerEnd = cardTop - scaleEndPositionPx;
      const pinStart = cardTop - stackPositionPx - itemStackDistance * i;
      const pinEnd = endElementTop - containerHeight / 2;

      const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
      const targetScale = baseScale + i * itemScale;
      const scale = Math.max(0.65, 1 - scaleProgress * (1 - targetScale));

      const rotation = rotationAmount ? i * rotationAmount * scaleProgress : 0;

      // Determine which card is currently active at the front of the stack
      let topCardIndex = 0;
      for (let j = 0; j < cardsRef.current.length; j++) {
        const jCard = cardsRef.current[j];
        if (jCard) {
          const jCardTop = getElementOffset(jCard);
          const jTriggerStart = jCardTop - stackPositionPx - itemStackDistance * j;
          if (scrollTop >= jTriggerStart) {
            topCardIndex = j;
          }
        }
      }

      let blur = 0;
      let opacity = 1;
      if (i < topCardIndex) {
        const depth = topCardIndex - i;
        if (blurAmount) {
          blur = Math.min(6, depth * blurAmount);
        }
        if (fadeAmount) {
          opacity = Math.max(0.25, 1 - depth * fadeAmount);
        }
      }

      let translateY = 0;
      const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;

      if (isPinned) {
        translateY = scrollTop - cardTop + stackPositionPx + itemStackDistance * i;
      } else if (scrollTop > pinEnd) {
        translateY = pinEnd - cardTop + stackPositionPx + itemStackDistance * i;
      }

      const newTransform = { translateY, scale, rotation, blur, opacity };
      const lastTransform = lastTransformsRef.current.get(i);

      const hasChanged =
        !lastTransform ||
        Math.abs(lastTransform.translateY - newTransform.translateY) > 0.1 ||
        Math.abs(lastTransform.scale - newTransform.scale) > 0.001 ||
        Math.abs(lastTransform.rotation - newTransform.rotation) > 0.1 ||
        Math.abs(lastTransform.blur - newTransform.blur) > 0.1 ||
        Math.abs(lastTransform.opacity - newTransform.opacity) > 0.01;

      if (hasChanged) {
        card.style.transform = `translate3d(0, ${newTransform.translateY}px, 0) scale(${newTransform.scale}) rotate(${newTransform.rotation}deg)`;
        card.style.filter = newTransform.blur > 0 ? `blur(${newTransform.blur}px)` : '';
        card.style.opacity = `${newTransform.opacity}`;
        card.style.zIndex = `${10 + i}`;
        lastTransformsRef.current.set(i, newTransform);
      }

      // Check stack completion callback
      if (i === cardsRef.current.length - 1) {
        const isInView = scrollTop >= pinStart && scrollTop <= pinEnd;
        if (isInView && !stackCompletedRef.current) {
          stackCompletedRef.current = true;
          onStackComplete?.();
        } else if (!isInView && stackCompletedRef.current) {
          stackCompletedRef.current = false;
        }
      }
    });
  }, [
    useWindowScroll,
    stackPosition,
    scaleEndPosition,
    itemStackDistance,
    itemScale,
    baseScale,
    rotationAmount,
    blurAmount,
    fadeAmount,
    parsePercentage,
    calculateProgress,
    getElementOffset,
    onStackComplete
  ]);

  useEffect(() => {
    if (!scrollerRef.current) return;
    cardsRef.current = Array.from(scrollerRef.current.querySelectorAll('.scroll-stack-card'));

    const handleScroll = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(updateCardTransforms);
    };

    let lenis = null;
    if (enableLenis) {
      try {
        lenis = new Lenis({
          duration: 1.1,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          touchMultiplier: 1.5,
          wrapper: useWindowScroll ? window : scrollerRef.current,
          content: useWindowScroll ? document.body : scrollerRef.current
        });

        lenis.on('scroll', handleScroll);

        const raf = (time) => {
          lenis.raf(time);
          animationFrameRef.current = requestAnimationFrame(raf);
        };
        animationFrameRef.current = requestAnimationFrame(raf);
        lenisRef.current = lenis;
      } catch (e) {
        console.warn('Lenis init failed, using standard scroll listener:', e);
      }
    }

    const scrollTarget = useWindowScroll ? window : scrollerRef.current;
    scrollTarget.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    // Initial layout calculation
    handleScroll();

    return () => {
      scrollTarget.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (lenis) {
        lenis.destroy();
      }
    };
  }, [useWindowScroll, enableLenis, updateCardTransforms]);

  return (
    <div
      ref={scrollerRef}
      className={`scroll-stack-container relative ${
        useWindowScroll ? '' : 'overflow-y-auto max-h-screen'
      } ${className}`.trim()}
    >
      <div
        className="scroll-stack-inner flex flex-col"
        style={{
          rowGap: `${itemDistance}px`
        }}
      >
        {children}
        <div className="scroll-stack-end h-8 w-full pointer-events-none" />
      </div>
    </div>
  );
};

export default ScrollStack;
