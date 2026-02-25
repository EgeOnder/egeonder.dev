"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useAnimationFrame } from "motion/react";

import { cn } from "@/lib/utils";

type FloatingProps = React.HTMLAttributes<HTMLDivElement> & {
  sensitivity?: number;
  easing?: number;
};

type FloatingElementProps = React.HTMLAttributes<HTMLDivElement> & {
  depth?: number;
};

type RegistryItem = {
  id: symbol;
  depth: number;
  ref: React.RefObject<HTMLDivElement | null>;
  currentX: number;
  currentY: number;
};

type FloatingContextType = {
  register: (item: Omit<RegistryItem, "currentX" | "currentY">) => void;
  unregister: (id: symbol) => void;
};

const FloatingContext = createContext<FloatingContextType | null>(null);

export function FancyParallaxFloating({
  children,
  className,
  sensitivity = 16,
  easing = 0.1,
  ...props
}: FloatingProps) {
  const target = useRef({ x: 0, y: 0 });
  const items = useRef<RegistryItem[]>([]);

  const register = useCallback(
    ({ id, depth, ref }: Omit<RegistryItem, "currentX" | "currentY">) => {
      const next: RegistryItem = { id, depth, ref, currentX: 0, currentY: 0 };
      items.current = [...items.current.filter((item) => item.id !== id), next];
    },
    [],
  );

  const unregister = useCallback((id: symbol) => {
    items.current = items.current.filter((item) => item.id !== id);
  }, []);

  const onPointerMove = useCallback(
    (clientX: number, clientY: number, rect: DOMRect) => {
      target.current.x = (clientX - rect.left) / rect.width - 0.5;
      target.current.y = (clientY - rect.top) / rect.height - 0.5;
    },
    [],
  );

  useAnimationFrame(() => {
    items.current.forEach((item) => {
      if (!item.ref.current) {
        return;
      }

      const nextX = target.current.x * sensitivity * item.depth;
      const nextY = target.current.y * sensitivity * item.depth;
      item.currentX += (nextX - item.currentX) * easing;
      item.currentY += (nextY - item.currentY) * easing;

      item.ref.current.style.transform = `translate3d(${item.currentX.toFixed(2)}px, ${item.currentY.toFixed(2)}px, 0)`;
    });
  });

  const contextValue = useMemo(
    () => ({
      register,
      unregister,
    }),
    [register, unregister],
  );

  return (
    <FloatingContext.Provider value={contextValue}>
      <div
        className={cn("relative", className)}
        onMouseMove={(event) => {
          onPointerMove(
            event.clientX,
            event.clientY,
            event.currentTarget.getBoundingClientRect(),
          );
        }}
        onTouchMove={(event) => {
          const touch = event.touches[0];
          if (!touch) {
            return;
          }
          onPointerMove(
            touch.clientX,
            touch.clientY,
            event.currentTarget.getBoundingClientRect(),
          );
        }}
        {...props}
      >
        {children}
      </div>
    </FloatingContext.Provider>
  );
}

export function FancyParallaxItem({
  children,
  className,
  depth = 1,
  ...props
}: FloatingElementProps) {
  const floating = useContext(FloatingContext);
  const ref = useRef<HTMLDivElement>(null);
  const id = useMemo(() => Symbol("parallax-item"), []);

  useEffect(() => {
    if (!floating) {
      return;
    }

    floating.register({ id, depth, ref });
    return () => {
      floating.unregister(id);
    };
  }, [depth, floating, id]);

  return (
    <div ref={ref} className={cn("will-change-transform", className)} {...props}>
      {children}
    </div>
  );
}
