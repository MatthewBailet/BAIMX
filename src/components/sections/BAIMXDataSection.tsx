import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

// Google-inspired dot grid animation styles
const googleGridStyle = `
  @keyframes pulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.7; }
  }

  .dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: #E8EAED;
    position: absolute;
    transition: transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1);
  }

  .dot-blue { background-color: rgba(66, 133, 244, 0.8); }
  .dot-red { background-color: rgba(219, 68, 55, 0.8); }
  .dot-yellow { background-color: rgba(244, 180, 0, 0.8); }
  .dot-green { background-color: rgba(15, 157, 88, 0.8); }
`;

// Add styles to head
if (typeof document !== 'undefined') {
  const styleExists = document.getElementById('google-grid-style');
  if (!styleExists) {
    const style = document.createElement('style');
    style.id = 'google-grid-style';
    style.textContent = googleGridStyle;
    document.head.appendChild(style);
  }
}

// Helper to generate dots
const generateDots = (count: number) => {
  const dots = [];
  const colors = ['dot-blue', 'dot-red', 'dot-yellow', 'dot-green'];
  
  for (let i = 0; i < count; i++) {
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const size = Math.random() * 2 + 2; // 2-4px
    const colorClass = colors[Math.floor(Math.random() * colors.length)];
    const delay = Math.random() * 0.8; // Reduced delay for initial animation
    // Initial position variables - all dots start from center with outward spiral
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 50 + 10;
    const initialX = 50 + Math.cos(angle) * distance * 0.2; // Start closer to center
    const initialY = 50 + Math.sin(angle) * distance * 0.2;
    
    dots.push({ x, y, size, colorClass, delay, initialX, initialY, angle, distance });
  }
  
  return dots;
};

export const BAIMXDataSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [dots] = useState(() => generateDots(100));
  
  // Adjust offset to start much earlier - accounts for header
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 99%", "end 10%"] // Start almost immediately when section enters viewport
  });

  // Smoother animation with spring physics
  const smoothProgress = useSpring(scrollYProgress, { 
    damping: 40, 
    stiffness: 100 
  });
  
  // Track if section has animated in yet
  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange(value => {
      if (value > 0.05 && !hasAnimated) {
        setHasAnimated(true);
      }
    });
    
    return () => unsubscribe();
  }, [scrollYProgress, hasAnimated]);
  
  // Transforms for element animations
  const titleOpacity = useTransform(smoothProgress, [0, 0.15], [0, 1]);
  const titleY = useTransform(smoothProgress, [0, 0.15], [30, 0]);

  const sloganOpacity = useTransform(smoothProgress, [0.05, 0.2], [0, 1]);
  const sloganY = useTransform(smoothProgress, [0.05, 0.2], [20, 0]);
  
  const descriptionOpacity = useTransform(smoothProgress, [0.1, 0.25], [0, 1]);
  const descriptionY = useTransform(smoothProgress, [0.1, 0.25], [20, 0]);
  
  const featureOneOpacity = useTransform(smoothProgress, [0.15, 0.3], [0, 1]);
  const featureOneX = useTransform(smoothProgress, [0.15, 0.3], [-20, 0]);
  
  const featureTwoOpacity = useTransform(smoothProgress, [0.2, 0.35], [0, 1]);
  const featureTwoX = useTransform(smoothProgress, [0.2, 0.35], [-20, 0]);
  
  const featureThreeOpacity = useTransform(smoothProgress, [0.25, 0.4], [0, 1]);
  const featureThreeX = useTransform(smoothProgress, [0.25, 0.4], [-20, 0]);
  
  const buttonOpacity = useTransform(smoothProgress, [0.3, 0.45], [0, 1]);
  const buttonScale = useTransform(smoothProgress, [0.3, 0.45], [0.9, 1]);
  
  // Track mouse movement for interactive background
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { left, top, width, height } = 
        sectionRef.current?.getBoundingClientRect() || { left: 0, top: 0, width: 0, height: 0 };
      
      // Calculate mouse position relative to section
      const x = e.clientX - left;
      const y = e.clientY - top;
      
      // Normalize to -50 to 50 range for subtle movement
      mouseX.set((x / width - 0.5) * 100);
      mouseY.set((y / height - 0.5) * 100);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);
  
  return (
    <section 
      ref={sectionRef}
      className="relative min-h-[90vh] py-4 px-16 overflow-hidden bg-white max-w-[77rem] mx-auto "
    >
      {/* Background Animation - Google-inspired dot grid */}
      <div className="absolute inset-0 overflow-hidden">
        {dots.map((dot, i) => (
          <motion.div
            key={i}
            className={`dot ${dot.colorClass}`}
            style={{
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              width: `${dot.size}px`,
              height: `${dot.size}px`,
              opacity: useTransform(
                smoothProgress,
                [0, 0.5, 1],
                [0.1, 0.7, 0.1]
              ),
              scale: useTransform(
                smoothProgress,
                [0, 0.5, 1],
                [0.5, 1.2, 0.5]
              ),
              x: useTransform(
                mouseX,
                [-50, 50],
                [10, -10]
              ),
              y: useTransform(
                mouseY,
                [-50, 50],
                [10, -10]
              ),
            }}
            initial={{ 
              opacity: 0,
              x: `calc(${dot.initialX}% - ${dot.x}%)`,
              y: `calc(${dot.initialY}% - ${dot.y}%)`,
              scale: 0.3,
              rotate: dot.angle * 180,
            }}
            animate={hasAnimated ? {
              opacity: [0, 0.7, 0.3],
              x: [
                `calc(${dot.initialX}% - ${dot.x}%)`, 
                0
              ],
              y: [
                `calc(${dot.initialY}% - ${dot.y}%)`, 
                0
              ],
              scale: [0.3, 1.5, 1],
              rotate: [dot.angle * 180, 0],
            } : {}}
            transition={hasAnimated ? {
              duration: 1.2 + dot.delay,
              ease: [0.43, 0.13, 0.23, 0.96], // Fancy easing for professional feel
              rotate: { duration: 1 + dot.delay },
              scale: { duration: 1 + dot.delay },
              opacity: { duration: 0.6 + dot.delay, delay: 0.2 },
              // After the initial animation completes, continue with regular pulsing
              repeatDelay: 1 + dot.delay,
              repeat: Infinity,
              repeatType: "loop"
            } : {}}
            // After the initial animation, continue with regular pulsing
            whileInView={{
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.2, 1],
            }}
            viewport={{ once: true, margin: "-20%" }}
          />
        ))}
      </div>
      
      {/* Light gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-transparent to-white/50 z-10"></div>
      
      {/* Connected network lines - abstracted data visualization */}
      <svg
        className="absolute inset-0 w-full h-full z-0 opacity-30"
        style={{ 
          filter: "blur(1px)",
        }}
      >
        <motion.g
          style={{
            opacity: useTransform(smoothProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])
          }}
        >
          {/* Generate some abstract network connections */}
          <motion.path
            d="M0,250 Q400,100 800,350 T1600,250"
            fill="none"
            stroke="rgba(0, 0, 0, 0.3)"
            strokeWidth="1"
            style={{
              pathLength: useTransform(smoothProgress, [0, 1], [0, 1]),
              y: useTransform(mouseY, [-50, 50], [-5, 5])
            }}
            initial={{ pathLength: 0 }}
            animate={hasAnimated ? { pathLength: 1 } : {}}
            transition={hasAnimated ? { duration: 1.5, ease: "easeOut" } : {}}
          />
          <motion.path
            d="M0,350 Q300,450 600,300 T1200,350"
            fill="none"
            stroke="rgba(219, 68, 55, 0.2)"
            strokeWidth="1"
            style={{
              pathLength: useTransform(smoothProgress, [0, 1], [0, 1]),
              y: useTransform(mouseY, [-50, 50], [5, -5])
            }}
            initial={{ pathLength: 0 }}
            animate={hasAnimated ? { pathLength: 1 } : {}}
            transition={hasAnimated ? { duration: 1.8, ease: "easeOut", delay: 0.2 } : {}}
          />
          <motion.path
            d="M200,100 Q500,200 800,150 T1400,200"
            fill="none"
            stroke="rgba(15, 157, 88, 0.2)"
            strokeWidth="1"
            style={{
              pathLength: useTransform(smoothProgress, [0, 1], [0, 1]),
              y: useTransform(mouseY, [-50, 50], [-8, 8])
            }}
            initial={{ pathLength: 0 }}
            animate={hasAnimated ? { pathLength: 1 } : {}}
            transition={hasAnimated ? { duration: 2, ease: "easeOut", delay: 0.4 } : {}}
          />
        </motion.g>
      </svg>
      
      {/* Content */}
      <div className="relative container py-16 z-20">
        <div className="max-w-3xl ">
          {/* Title with logo and "Data" text */}
          <motion.div
            className="flex items-center justify-center md:justify-start mb-4"
            style={{
              opacity: titleOpacity,
              y: titleY,
            }}
          >
            <img 
              src="/logoBAIMXfullDark.png" 
              alt="BAIMX" 
              className="h-14 md:h-17 mr-5 mt-2" 
            />
            <span className="font-light text-4xl md:text-5xl lg:text-6xl tracking-tight">
              <span className="">Mach<span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">Points</span></span>
            </span>
          </motion.div>
          
          {/* Slogan with period, Google-style */}
          <motion.p
            className="font-light text-xl md:text-2xl text-gray-500 mb-8"
            style={{
              opacity: sloganOpacity,
              y: sloganY,
            }}
          >
            Next-Generation Crypto Data.
          </motion.p>
          
          {/* Description - clean, minimal */}
          <motion.p
            className="text-gray-600 text-lg mb-12 leading-relaxed font-light"
            style={{
              opacity: descriptionOpacity,
              y: descriptionY,
            }}
          >
            Access institutional-grade cryptocurrency datasets, market intelligence, and powerful analytics. Build strategies with the same data trusted by leading institutions worldwide.
          </motion.p>
          
          {/* Feature list - Google-like design */}
          <div className="space-y-6 mb-12">
            <motion.div 
              className="flex items-start gap-3"
              style={{
                opacity: featureOneOpacity,
                x: featureOneX,
              }}
            >
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center mt-1">
                <span className="text-white text-sm font-medium">01</span>
              </div>
              <div>
                <h3 className="text-xl text-gray-800 font-medium mb-1">Real-time market data</h3>
                <p className="text-gray-600">Millisecond-precision price feeds, order book data, and sentiment metrics for 100+ exchanges.</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-start gap-3"
              style={{
                opacity: featureTwoOpacity,
                x: featureTwoX,
              }}
            >
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center mt-1">
                <span className="text-white text-sm font-medium">02</span>
              </div>
              <div>
                <h3 className="text-xl text-gray-800 font-medium mb-1">Historical datasets</h3>
                <p className="text-gray-600">Normalized, cleaned blockchain data with on-chain metrics, token flows, and smart contract analytics.</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-start gap-3"
              style={{
                opacity: featureThreeOpacity,
                x: featureThreeX,
              }}
            >
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center mt-1">
                <span className="text-white text-sm font-medium">03</span>
              </div>
              <div>
                <h3 className="text-xl text-gray-800 font-medium mb-1">AI-powered insights</h3>
                <p className="text-gray-600">Machine learning models trained on terabytes of market data to detect patterns and generate signals.</p>
              </div>
            </motion.div>
          </div>
          
          {/* CTA Button - Google Material style */}
          <motion.div
            style={{
              opacity: buttonOpacity,
              scale: buttonScale,
            }}
          >
            <a 
              href="#explore" 
              className="group inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 px-6  font-medium text-sm transition-all duration-300"
            >
              <span>Explore the data platform</span>
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}; 