import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

const variants = {
  enter: (direction: number) => ({ x: direction > 0 ? 24 : -24, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -24 : 24, opacity: 0 }),
};

export function PaneTransition(props: { paneKey: string; direction: number; children: ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <div className="relative min-h-0 flex-1 overflow-hidden">{props.children}</div>;
  }
  return (
    <div className="relative min-h-0 flex-1 overflow-hidden">
      <AnimatePresence initial={false} custom={props.direction}>
        <motion.div
          key={props.paneKey}
          custom={props.direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.22, ease: EASE }}
          className="absolute inset-0 flex min-h-0 flex-col"
        >
          {props.children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
