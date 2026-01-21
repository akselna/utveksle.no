"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface CounterProps {
  end: number;
  duration?: number;
  label: string;
  suffix?: string;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function Counter({ end, duration = 4200, label, suffix = "+" }: CounterProps) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const counterRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const animate = useCallback(() => {
    if (end === 0) return; // Don't animate if end is 0
    
    const startTime = performance.now();
    const startValue = 0;

    const updateCount = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      const currentValue = Math.floor(startValue + (end - startValue) * easedProgress);

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        // Ensure we end exactly at the target value
        setCount(end);
      }
    };

    requestAnimationFrame(updateCount);
  }, [end, duration]);

  useEffect(() => {
    // Don't set up observer if end is 0 (data not loaded yet)
    if (end === 0) return;
    
    // If already animated, don't set up observer again
    if (hasAnimated) return;

    // Check if element is already visible when data loads
    if (counterRef.current) {
      const rect = counterRef.current.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (isVisible) {
        setHasAnimated(true);
        animate();
        return;
      }
    }

    // Clean up previous observer if it exists
    if (observerRef.current && counterRef.current) {
      observerRef.current.unobserve(counterRef.current);
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated && end > 0) {
            setHasAnimated(true);
            animate();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (counterRef.current) {
      observerRef.current.observe(counterRef.current);
    }

    return () => {
      if (observerRef.current && counterRef.current) {
        observerRef.current.unobserve(counterRef.current);
      }
    };
  }, [end, hasAnimated, animate]);

  return (
    <div ref={counterRef} className="text-center">
      <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-2">
        {count.toLocaleString("no-NO")}
        {suffix && <span className="text-primary">{suffix}</span>}
      </div>
      <div className="text-sm md:text-base text-gray-600 font-medium">{label}</div>
    </div>
  );
}

interface StatsCounterProps {
  courses: number;
  experiences: number;
  users: number;
}

export default function StatsCounter({
  courses,
  experiences,
  users,
}: StatsCounterProps) {
  return (
    <section className="py-16 md:py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          <Counter end={courses} label="Godkjente fag" suffix="+" />
          <Counter end={experiences} label="Erfaringer" suffix="+" />
          <Counter end={users} label="Brukere" suffix="+" />
        </div>
      </div>
    </section>
  );
}

