import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, CheckCheck } from 'lucide-react';

// Define Article Type
interface Article {
  id: number;
  title: string;
  imageUrl?: string;
  time: string;
  read: string;
  tags: string[];
  preview?: string;
  xoutValue?: number;
  xoutSymbol?: string;
}

// Progress component
interface ProgressProps {
  value: number;
  className?: string;
  'aria-label'?: string;
}

const Progress: React.FC<ProgressProps> = ({ value, className, 'aria-label': ariaLabel }) => {
  return (
    <div className={`relative overflow-hidden ${className || ''}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={ariaLabel}>
      <div 
        className="h-full bg-blue-600" 
        style={{ width: `${value}%`, transition: 'width 50ms linear' }}
      />
    </div>
  );
};

// Initial Article Data
const initialArticles: Article[] = [
  {
    id: 1,
    title: 'Bitcoin Surpasses $80,000 Mark Amid Growing Institutional Interest',
    time: '3m ago',
    read: '6 min read',
    tags: ['Speculative', 'Regulation', 'BTC'],
    imageUrl: '/SBF-Books-Culture-1245966892.webp',
    preview: 'Market analysts point to increased inflows into Bitcoin ETFs and positive regulatory sentiment as key drivers for the recent price surge above the $80,000 threshold...',
    xoutValue: 2.33,
    xoutSymbol: 'BTC',
  },
  {
    id: 2,
    title: 'Solana Price Surges Amid Network Upgrade Optimism',
    time: '15m ago',
    read: '3 min read',
    tags: ['SOL', 'Network', 'Update'],
    imageUrl: '/Solana.jpg',
    preview: 'The Solana network\'s upcoming upgrade promises significant improvements in transaction speed and reliability, boosting investor confidence and leading to a notable price increase.',
    xoutValue: 5.12,
    xoutSymbol: 'SOL',
  },
  {
    id: 3,
    title: 'Ethereum Staking Yields Dip Slightly',
    time: '35m ago',
    read: '4 min read',
    tags: ['ETH', 'Staking', 'Yield'],
    imageUrl: '/placeholder-eth.jpg',
    preview: 'Analysts observe a minor decrease in Ethereum staking rewards, potentially linked to shifting network dynamics and validator participation levels following recent updates.',
    xoutValue: -0.45,
    xoutSymbol: 'ETH',
  },
  {
    id: 4,
    title: 'New Meme Coin \'CATNIP\' Gains Traction',
    time: '1h ago',
    read: '2 min read',
    tags: ['Meme', 'Community'],
    imageUrl: '/placeholder-meme.jpg',
    preview: 'The CATNIP token, driven by a strong online community and viral marketing, has seen a rapid rise in popularity and trading volume across decentralized exchanges.',
    xoutValue: 12.45,
    xoutSymbol: 'CATNIP',
  },
  {
    id: 5,
    title: 'DeFi Protocol TVL Reaches New All-Time High',
    time: '2h ago',
    read: '5 min read',
    tags: ['DeFi', 'TVL', 'Growth'],
    preview: 'Total Value Locked in decentralized finance protocols has surpassed previous records, indicating growing confidence in DeFi platforms despite market volatility.',
    xoutValue: 3.78,
    xoutSymbol: 'DeFi',
  },
  {
    id: 6,
    title: 'Layer 2 Solutions See Record Transaction Volume',
    time: '3h ago',
    read: '4 min read',
    tags: ['L2', 'Scaling', 'ETH'],
    preview: 'Ethereum Layer 2 networks experience unprecedented growth as users seek lower fees and faster transactions while maintaining security.',
    xoutValue: 8.92,
    xoutSymbol: 'ARB',
  },
  {
    id: 7,
    title: 'Major Bank Announces Crypto Custody Service',
    time: '4h ago',
    read: '7 min read',
    tags: ['Banking', 'Institutional', 'Adoption'],
    preview: 'Leading financial institution reveals plans to offer digital asset custody services to institutional clients, marking a significant step in crypto adoption.',
    xoutValue: 1.56,
    xoutSymbol: 'BANK',
  },
  {
    id: 8,
    title: 'NFT Market Shows Signs of Recovery',
    time: '5h ago',
    read: '3 min read',
    tags: ['NFT', 'Market', 'Analysis'],
    preview: 'Trading volumes and floor prices of premium NFT collections indicate potential market recovery after months of declining activity.',
    xoutValue: -2.34,
    xoutSymbol: 'NFT',
  },
];

export const FeaturedSection: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [progress, setProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [containerHeight, setContainerHeight] = useState<number | null>(null);
  const mainArticleRef = useRef<HTMLDivElement>(null);
  const ROTATION_INTERVAL = 20000;
  const PROGRESS_UPDATE_INTERVAL = 50;
  const TRANSITION_DURATION = 600; // ms

  // Capture container height on mount and when dimensions change
  useEffect(() => {
    const updateHeight = () => {
      if (mainArticleRef.current) {
        setContainerHeight(mainArticleRef.current.offsetHeight);
      }
    };
    
    // Initial measurement
    updateHeight();
    
    // Update on window resize
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Update height when current article changes
  useEffect(() => {
    if (!isTransitioning && mainArticleRef.current) {
      setContainerHeight(mainArticleRef.current.offsetHeight);
    }
  }, [articles, isTransitioning]);

  useEffect(() => {
    const progressTimer = setInterval(() => {
      if (!isTransitioning) {
        setProgress((prev) => {
          const newProgress = prev + (100 / (ROTATION_INTERVAL / PROGRESS_UPDATE_INTERVAL));
          if (newProgress >= 100) {
            startTransition();
          }
          return newProgress >= 100 ? 100 : newProgress;
        });
      }
    }, PROGRESS_UPDATE_INTERVAL);
    
    return () => {
      clearInterval(progressTimer);
    };
  }, [isTransitioning]);

  // Handle the transition sequence
  const startTransition = () => {
    setIsTransitioning(true);
    
    // After a slight delay to allow fade-out animation
    setTimeout(() => {
      setArticles((prevArticles) => {
        // Move the first article to the end
        return [...prevArticles.slice(1), prevArticles[0]];
      });
      
      // Reset progress and allow new animations after content has updated
      setTimeout(() => {
        setProgress(0);
        setIsTransitioning(false);
      }, 100);
    }, TRANSITION_DURATION / 2);
  };

  const mainArticle = articles[0];
  const sidebarArticles = articles.slice(1); // Show all remaining articles in sidebar

  return (
    <section className="container mx-auto my-8 max-w-[77rem]">
      <h1 className="text-2xl font-bold mb-2 pb-2 flex items-center">
        <span className="border-l-4 border-blue-600 pl-3">Featured</span>
        <span className="text-sm font-normal text-gray-500 ml-4">Top Stories Happening Now</span>
        <span className="text-sm font-normal text-gray-500 ml-auto">April 25, 2025</span>
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-start">
        {/* Main Article - Enhanced styling */}
        <div 
          className="col-span-1 md:col-span-4 relative overflow-hidden bg-white"
          style={{ 
            height: containerHeight ? `${containerHeight}px` : 'auto',
            minHeight: '630px', // Fallback minimum height
            transition: 'height 0.3s ease'
          }}
        >
          <div ref={mainArticleRef} className="absolute inset-0">
            <Link 
              to={`/article/${mainArticle.id}`}
              className="absolute inset-0 overflow-hidden group transition-all duration-300 hover:shadow-lg"
            >
              <div className="absolute inset-0 overflow-hidden">
                <AnimatePresence>
                  <motion.div 
                    key={`img-${mainArticle.id}`}
                    className="h-full w-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ 
                      duration: TRANSITION_DURATION / 1000,
                      ease: "easeInOut"
                    }}
                  >
                    {mainArticle.imageUrl && (
                      <motion.img 
                        src={mainArticle.imageUrl} 
                        alt="" 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        initial={{ scale: 1.05 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                          duration: 25,
                          repeat: Infinity,
                          repeatType: "reverse",
                          ease: "linear"
                        }}
                      />
                    )}
                    {!mainArticle.imageUrl && <div className="h-full w-full bg-gray-400 rounded-xl"></div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/5 rounded-md"></div>
                  </motion.div>
                </AnimatePresence>
              </div>
              
              {/* Time and read time in top left - more refined */}
              <div className="absolute top-4 left-4 z-10">
                <AnimatePresence>
                  <motion.span 
                    key={`time-${mainArticle.id}`}
                    className="text-xs text-gray-100 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm font-medium inline-block"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: TRANSITION_DURATION / 1500, delay: TRANSITION_DURATION / 2000 }}
                  >
                    {mainArticle.time} • {mainArticle.read}
                  </motion.span>
                </AnimatePresence>
              </div>
              
              {/* Content positioned absolutely - enhanced typography */}
              <div className="absolute inset-x-0 bottom-0 p-6 pb-8 z-10">
                <AnimatePresence>
                  <motion.div 
                    key={`content-${mainArticle.id}`} 
                    className="text-white"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ 
                      duration: TRANSITION_DURATION / 1000,
                      ease: "easeOut"
                    }}
                  >
                    <motion.h3 
                      className="text-2xl lg:text-3xl font-bold mb-3 leading-tight "
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      {mainArticle.title}
                    </motion.h3>
                    
                    {mainArticle.preview && (
                      <motion.div 
                        className="relative mb-4"
                        style={{
                          maxHeight: '4em',
                          overflow: 'hidden',
                          WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
                          maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)'
                        }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        <p className="text-base text-gray-100 leading-relaxed">
                          {mainArticle.preview}
                        </p>
                      </motion.div>
                    )}
                    
                    {/* Container for tags and XOUT */}
                    <motion.div 
                      className="flex items-center justify-between mt-3 mb-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.25 }}
                    >
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {mainArticle.tags.map((tag, index) => (
                          <motion.span 
                            key={tag} 
                            className="bg-slate-800 rounded px-2 py-1 text-xs font-medium text-gray-100 backdrop-blur-sm"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2, delay: 0.3 + (index * 0.05) }}
                          >
                            {tag}
                          </motion.span>
                        ))}
                      </div>

                      {/* XOUT Display */}
                      {mainArticle.xoutValue !== undefined && mainArticle.xoutSymbol && (
                        <motion.div 
                          className="flex items-center ml-auto pl-4 text-xs font-medium"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2, delay: 0.4 }}
                        >
                          <span className="text-white mr-1 mt-1 text-[12px]">XOUT:</span>
                          <span className={`font-light text-lg ${mainArticle.xoutValue >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {mainArticle.xoutValue >= 0 ? '+' : ''}{mainArticle.xoutValue.toFixed(2)}% {mainArticle.xoutSymbol}
                          </span>
                        </motion.div>
                      )}
                    </motion.div>

                    {/* Read more and verification in a footer */}
                    <motion.div 
                      className="flex items-center justify-between border-t border-white/20 pt-4 mt-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.45 }}
                    >
                      <span className="text-sm font-medium text-blue-300 group-hover:underline transition-all opacity-90 group-hover:opacity-100">
                        Continue reading
                      </span>
                      
                      {/* Verified section - more refined */}
                      <div className="flex items-center rounded-full px-3 py-1.5 backdrop-blur-sm">
                        <CheckCheck size={14} className="text-green-400 mr-1.5" />
                        <span className="text-xs text-white font-medium">Confirmed by Matthew Bailet</span>
                      </div>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>
              
              {/* Progress bar - enhanced */}
              <div className="absolute bottom-0 left-0 right-0 z-20">
                <Progress 
                  value={progress} 
                  className="h-1 w-full bg-black/30" 
                  aria-label="Time until next article rotation" 
                />
              </div>
            </Link>
          </div>
        </div>
        
        {/* Sidebar Articles - Enhanced styling */}
        <div className="col-span-2 overflow-hidden h-full bg-white relative border-t border-gray-400">
          {/* Gradient overlay for fade effect */}
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>
          <div className="flex flex-col divide-y divide-gray-400 max-h-[630px] overflow-y-auto custom-scrollbar">
            <AnimatePresence>
              {sidebarArticles.map((article, index) => (
                <motion.div
                  key={`sidebar-${article.id}`}
                  initial={{ 
                    opacity: 0, 
                    y: 20,
                    backgroundColor: 'rgba(34, 197, 94, 0.125)'
                  }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0)'
                  }}
                  exit={{ 
                    opacity: 0, 
                    y: -20,
                    backgroundColor: 'rgba(34, 197, 94, 0.125)'
                  }}
                  transition={{ 
                    duration: TRANSITION_DURATION / 1200,
                    delay: index * 0.08,
                    ease: "easeOut",
                    backgroundColor: { duration: 0.3 }
                  }}
                  className="flex-grow-0 flex-shrink-0"
                  style={{ minHeight: '140px' }}
                >
                  <Link
                    to={`/article/${article.id}`}
                    className="block px-3 py-5 hover:bg-gray-50 transition-colors duration-200 group h-full"
                  >
                    <div className="h-full flex flex-col">
                      <h4 className="text-lg font-semibold mb-2 text-gray-800 line-clamp-3 group-hover:text-blue-700 transition-colors leading-5">{article.title}</h4>
                      <div className="flex items-center text-xs text-gray-500 mb-2">
                        <span>{article.time} • {article.read}</span>
                        {article.xoutValue !== undefined && article.xoutSymbol && (
                          <>
                            <span className="mx-2 text-gray-300">|</span>
                            <span className="font-medium">
                              <span className="text-gray-500">XOUT:</span>{' '}
                              <span className={article.xoutValue >= 0 ? 'text-green-500' : 'text-red-500'}>
                                {article.xoutValue >= 0 ? '+' : ''}{article.xoutValue.toFixed(2)}% {article.xoutSymbol}
                              </span>
                            </span>
                          </>
                        )}
                      </div>
                      
                      {article.preview && (
                        <div 
                          className="relative mb-3" 
                          style={{
                            maxHeight: '2.6em',
                            overflow: 'hidden',
                            WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                            maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)'
                          }}
                        >
                          <p className="text-sm text-gray-600 leading-snug">
                            {article.preview}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                        {article.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">
                            {tag}
                          </span>
                        ))}
                        <span className="text-xs font-medium text-blue-600 ml-auto group-hover:underline">Read more</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}; 