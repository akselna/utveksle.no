"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  className?: string;
}

export default function ScrollReveal({
  children,
  delay = 0,
  direction = "up",
  className = "",
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let fallbackTimeout: NodeJS.Timeout | null = null;

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      if (!elementRef.current) return;

      // Check if element is already visible on mount (but only if it's above viewport)
      const rect = elementRef.current.getBoundingClientRect();
      const isAlreadyInViewport =
        rect.top < window.innerHeight &&
        rect.bottom > 0 &&
        rect.left < window.innerWidth &&
        rect.right > 0;

      // If element is already visible and above the fold, show it immediately
      if (isAlreadyInViewport && rect.top < window.innerHeight * 0.8) {
        setTimeout(() => {
          setIsVisible(true);
        }, delay);
        return;
      }

      // Set up observer for elements not yet visible
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setTimeout(() => {
                setIsVisible(true);
              }, delay);
              if (observer && elementRef.current) {
                observer.unobserve(elementRef.current);
              }
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: "0px 0px -100px 0px", // Trigger when element is 100px from bottom of viewport
        }
      );

      if (elementRef.current) {
        observer.observe(elementRef.current);
      }

      // Fallback: Make visible after 2 seconds if observer doesn't trigger
      fallbackTimeout = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
    }, 50);

    return () => {
      clearTimeout(timeoutId);
      if (fallbackTimeout) {
        clearTimeout(fallbackTimeout);
      }
      if (observer && elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [delay]);

  const directionClasses = {
    up: "translate-y-8",
    down: "-translate-y-8",
    left: "translate-x-8",
    right: "-translate-x-8",
  };

  return (
    <div
      ref={elementRef}
      className={`transition-all duration-700 ease-out ${
        isVisible
          ? "opacity-100 translate-y-0 translate-x-0"
          : `opacity-0 ${directionClasses[direction]}`
      } ${className}`}
    >
      {children}
    </div>
  );
}
