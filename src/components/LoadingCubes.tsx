import React from 'react';
import { motion } from 'framer-motion';

// Reusable wave variant for the loading cubes
const loadingWaveCubeVariant = {
  initial: { y: 0 },
  animate: (i: number) => ({
    y: [0, -6, 0, 0],
    transition: {
      delay: i * 0.15,
      duration: 1.2, // Faster cycle for loading
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "loop" as const,
      times: [0, 0.25, 0.5, 1.0] // Simple up-down timing
    }
  }),
};

export const LoadingCubes: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-10">
      <motion.div
        className="flex items-center justify-center gap-1"
        // No container variants needed, just animate children
      >
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className={`w-3 h-3 rounded-xs ${ // Tailwind class for rounded corners
              index === 0 ? 'bg-[#7FF0F5]' :
              index === 1 ? 'bg-[#29F5A7]' :
              'bg-[#5593FF]'
            }`}
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