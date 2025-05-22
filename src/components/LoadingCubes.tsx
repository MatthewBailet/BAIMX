import React from 'react';
import { motion } from 'framer-motion';

// Reusable wave variant for the loading bars
const loadingWaveCubeVariant = {
  initial: (i: number) => ({
    scaleY: 1,
    y: i === 1 ? 0 : i === 2 ? 2 : 0,  // Initial positions
    transformOrigin: "center", // Change to center for scaling from middle
  }),
  animate: (i: number) => ({
    scaleY: [1, i === 1 ? 1.17 : 1.17, 1, 1], // Scale from center
    y: i === 1 
      ? [0, 0, 0, 0]  // Middle bar stays in place vertically
      : i === 2
        ? [6, 6, 6, 6]  // Right bar stays at its lower position
        : [0, 0, 0, 0], // Left bar stays in place
    transformOrigin: "center", // Scale from center point
    transition: {
      delay: i * 0.12,
      duration: .66,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "loop" as const,
      times: [0, 0.33, 0.66, 1]
    }
  }),
};

export const LoadingCubes: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 ">
      <motion.div
        className="flex items-center justify-center gap-[2px] "
        // No container variants needed, just animate children
      >
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className={`w-[12px] rounded-[2px] bg-slate-800/70  `}
            style={{
              height: index === 1 ? '32px' : '49px', // Middle is smaller, others are taller
              marginTop: index === 1 ? '5px' : '0px' // Offset the middle for alignment
            }}
            variants={loadingWaveCubeVariant}
            initial="initial"
            animate="animate"
            custom={index}
          />
        ))}
      </motion.div>
    </div>
  );
}; 