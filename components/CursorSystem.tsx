import React, { useEffect, useRef, useState } from 'react';
import { Cat } from 'lucide-react';

export default function CursorSystem() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const mousePos = useRef({ x: -100, y: -100 });
  const rafId = useRef<number | null>(null);
  const targetRef = useRef<EventTarget | null>(null);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
      targetRef.current = e.target;
    };

    const updateLoop = () => {
      // 1. Update Position (Direct DOM for performance)
      if (cursorRef.current) {
        const { x, y } = mousePos.current;
        cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }

      // 2. Check Interactive State
      // Doing this in RAF is generally smoother than on every mouse event for high-poll-rate mice
      if (targetRef.current) {
        const target = targetRef.current as HTMLElement;
        const isInteractive = 
          target.tagName === 'BUTTON' || 
          target.tagName === 'A' || 
          target.tagName === 'INPUT' || 
          target.tagName === 'SELECT' || 
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'VIDEO' ||
          target.closest('button') !== null || 
          target.closest('a') !== null ||
          target.closest('[role="button"]') !== null;

        setIsHovering(prev => (prev !== isInteractive ? isInteractive : prev));
      }

      rafId.current = requestAnimationFrame(updateLoop);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    rafId.current = requestAnimationFrame(updateLoop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <>
      <style>{`
        /* Force hide default cursor on EVERYTHING */
        *, *::before, *::after {
          cursor: none !important;
        }
      `}</style>
      
      <div 
        ref={cursorRef}
        className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] -ml-2 -mt-2 transition-transform duration-75 ease-out will-change-transform"
      >
        <div className={`relative transition-transform duration-300 ${isHovering ? 'scale-125' : 'scale-100'}`}>
          {/* Main Cat Icon with dynamic filter for glow */}
          <div style={{
            transition: 'filter 0.3s ease',
            filter: isHovering 
              ? 'drop-shadow(0 0 8px rgba(255,255,255,0.8))' 
              : 'drop-shadow(0 0 2px rgba(0,0,0,0.5))'
          }}>
             <Cat 
               size={24} 
               fill={isHovering ? "#ffffff" : "white"} 
               className={`transition-colors duration-300 ${isHovering ? 'text-cyan-200' : 'text-black'}`} 
             />
          </div>
        </div>
      </div>
    </>
  );
}