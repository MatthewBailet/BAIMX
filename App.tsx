import React, { useState, useEffect } from 'react'; // Import hooks and useEffect
import { Link, Outlet } from 'react-router-dom'; // Removed useLocation import
import { motion, AnimatePresence } from 'framer-motion'; // Re-added motion and AnimatePresence import
import './index.css' // Ensure Tailwind styles are imported
import { MiniTokenChart } from './components/MiniTokenChart'; // Import the new chart component
import { LoadingCubes } from './components/LoadingCubes'; // Import LoadingCubes
import { ChevronRight, ChevronUp, ChevronDown, ArrowUpRight, ArrowDownRight } from 'lucide-react'; // Import Lucide icons

interface Coin {
  symbol: string;
  tokenId: string;
}

// Define Coins with Solana Token IDs (Example IDs - verify these)
const coins: Coin[] = [
  { symbol: 'BTC', tokenId: '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E' }, // WBTC (Portal)
  { symbol: 'ETH', tokenId: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs' }, // WETH (Portal)
  { symbol: 'SOL', tokenId: 'So11111111111111111111111111111111111111112' }, // Native SOL
  { symbol: 'USDC', tokenId: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' }, // USDC
  { symbol: 'BONK', tokenId: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' }, // BONK
  { symbol: 'WIF', tokenId: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm' }, // dogwifhat
];

// --- Helper functions moved from MiniTokenChart --- 

interface Pool {
  attributes: {
    address?: string;
    volume_usd?: {
      h24?: string;
    };
  };
}

// Helper to find the best pool address
const findBestPoolAddress = (pools?: Pool[]): string | null => {
  if (!pools || pools.length === 0) return null;
  pools.sort((a, b) => parseFloat(b.attributes.volume_usd?.h24 || '0') - parseFloat(a.attributes.volume_usd?.h24 || '0'));
  return pools[0]?.attributes?.address || null;
};

interface ChartResult {
  option: any;
  percentageChange: number;
}

type CandleList = [number, number, number, number, number][];

// Helper to create chart option AND calculate 24h change
const createChartOption = (candleList?: CandleList): ChartResult | null => {
  if (!candleList || candleList.length === 0) return null;

  // Find the closest candle to 24 hours ago and the most recent candle
  const now = Date.now();
  const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
  let price24hAgo: number | null = null;
  let latestPrice: number | null = null;

  // Iterate backwards to find the latest price and the price ~24h ago
  let found24h = false;
  for (let i = candleList.length - 1; i >= 0; i--) {
    const timestamp = candleList[i][0] * 1000;
    const price = candleList[i][4]; // Closing price

    if (latestPrice === null) { // Get the very last price
        latestPrice = price;
    }

    if (!found24h && timestamp <= twentyFourHoursAgo) {
      price24hAgo = price;
      found24h = true;
    } 
    // Optimization: if we found both, stop early (assuming sorted data)
    if (latestPrice !== null && found24h) break; 
  }

  // Fallback if no exact 24h candle found (use the oldest available)
  if (price24hAgo === null && candleList.length > 0) {
      price24hAgo = candleList[0][4];
  }

  let percentageChange = 0;
  if (price24hAgo !== null && price24hAgo !== 0 && latestPrice !== null) {
    percentageChange = ((latestPrice - price24hAgo) / price24hAgo) * 100;
  }

  const prices = candleList.map(item => item[4]);
  const timestamps = candleList.map(item => item[0] * 1000);
  const firstPrice = prices[0] || 0;
  const lastPrice = prices[prices.length - 1] || 0;
  const trendColor = lastPrice >= firstPrice ? '#22c55e' : '#ef4444';

  const option = { 
    grid: { top: 0, bottom: 0, left: 0, right: 0 }, 
    xAxis: { type: 'category', show: false, data: timestamps },
    yAxis: { type: 'value', show: false, scale: true },
    series: [ { data: prices, type: 'line', smooth: true, symbol: 'none', lineStyle: { color: trendColor, width: 1.5 }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: trendColor + '66'}, { offset: 1, color: trendColor + '05'}] } } }, ],
    tooltip: { trigger: 'axis', formatter: '{c0}', axisPointer: { type: 'none' }, backgroundColor: 'rgba(30, 30, 30, 0.7)', borderColor: '#555', borderWidth: 1, textStyle: { color: '#eee', fontSize: 10 }, position: function (pos: number[], params: any, dom: any, rect: any, size: { contentSize: number[] }) { return [pos[0] - size.contentSize[0] / 2, -size.contentSize[1] - 5]; }, extraCssText: 'padding: 2px 5px; pointer-events: none;' }
  };

  // Return both option and percentage change
  return { option, percentageChange }; 
};

interface ChartData {
  option: any;
  percentageChange: number;
}

interface ChartDataState {
  [key: string]: ChartData | null;
}

interface ChartErrorsState {
  [key: string]: string | null;
}

// Define Article Type
interface Article {
  id: number;
  title: string;
  imageUrl?: string; // Optional image URL for background
  time: string;
  read: string;
  tags: string[];
}

// Initial Article Data
const initialArticles: Article[] = [
  {
    id: 1,
    title: 'Bitcoin Surpasses $80,000 Mark Amid Growing Institutional Interest',
    time: '3m ago',
    read: '6 min read',
    tags: ['Speculative', 'Regulation', 'BTC'],
    imageUrl: '/placeholder-btc.jpg', // Example image path
  },
  {
    id: 2,
    title: 'Solana Price Surges Amid Network Upgrade Optimism',
    time: '15m ago',
    read: '3 min read',
    tags: ['SOL', 'Network', 'Update'],
    imageUrl: '/placeholder-sol.jpg',
  },
  {
    id: 3,
    title: 'Ethereum Staking Yields Dip Slightly',
    time: '35m ago',
    read: '4 min read',
    tags: ['ETH', 'Staking', 'Yield'],
    imageUrl: '/placeholder-eth.jpg',
  },
  {
    id: 4,
    title: 'New Meme Coin \'CATNIP\' Gains Traction',
    time: '1h ago',
    read: '2 min read',
    tags: ['Meme', 'Community'],
    imageUrl: '/placeholder-meme.jpg',
  },
];

// +++ Add Placeholder Data Fetching Functions +++
async function fetchCoinChartData(coin: Coin): Promise<{ symbol: string; data?: { option: any; percentageChange: number }; error?: string }> {
  console.log(`fetchCoinChartData called for ${coin.symbol} (placeholder)`);
  await new Promise(res => setTimeout(res, Math.random() * 200)); // Simulate delay
  if (Math.random() < 0.1) return { symbol: coin.symbol, error: 'Simulated fetch error' };
  // Create properly typed fake candles
  const candleList: [number, number, number, number, number][] = Array.from(
    { length: 20 }, 
    () => [Date.now() - Math.random() * 1000000, Math.random() * 100, Math.random() * 100, Math.random() * 100, Math.random() * 100]
  );
  const chartResult = createChartOption(candleList);
  return { symbol: coin.symbol, data: chartResult || undefined };
}

const Header: React.FC = () => {
  const [isInitiallyLoading, setIsInitiallyLoading] = useState<boolean>(true);
  const [chartData, setChartData] = useState<ChartDataState>({});
  const [chartErrors, setChartErrors] = useState<ChartErrorsState>({});
  const [isPicksExpanded, setIsPicksExpanded] = useState<boolean>(true); 

  // Fetch data for all charts on mount
  useEffect(() => {
    let active = true; // Flag to prevent state updates if component unmounts
    let loadedCount = 0;

    const fetchAllChartData = async () => {
      for (let i = 0; i < coins.length; i++) {
        const coin = coins[i];
        // Stagger API calls slightly
        await new Promise(resolve => setTimeout(resolve, i * 200)); 
        if (!active) return; // Exit if component unmounted

        try {
          const poolsUrl = `/api/geckoterminal/networks/solana/tokens/${coin.tokenId}/pools?page=1`;
          const poolsResponse = await fetch(poolsUrl);
          if (!active) return;
          if (!poolsResponse.ok) throw new Error(`Pool lookup failed (${poolsResponse.status})`);
          const poolsData = await poolsResponse.json();
          const poolAddress = findBestPoolAddress(poolsData.data);
          if (!poolAddress) throw new Error('No suitable pool found.');
          if (!active) return;

          const ohlcvUrl = `/api/geckoterminal/networks/solana/pools/${poolAddress}/ohlcv/hour?aggregate=4&limit=100`;
          const ohlcvResponse = await fetch(ohlcvUrl);
          if (!active) return;
          if (!ohlcvResponse.ok) throw new Error(`OHLCV fetch failed (${ohlcvResponse.status})`);
          const ohlcvData = await ohlcvResponse.json();

          const candleList = ohlcvData?.data?.attributes?.ohlcv_list;
          const result = createChartOption(candleList);
          if (!result) throw new Error('No OHLCV data returned.');
          const { option, percentageChange } = result;

          if (active) {
            setChartData(prev => ({ ...prev, [coin.symbol]: { option, percentageChange } }));
            setChartErrors(prev => ({ ...prev, [coin.symbol]: null })); // Clear previous error
          }

        } catch (err) {
          console.error(`[Header Fetch ${coin.symbol}] Error:`, err);
          if (active) {
            setChartErrors(prev => ({ ...prev, [coin.symbol]: err instanceof Error ? err.message : 'Failed to load' }));
            setChartData(prev => ({ ...prev, [coin.symbol]: null })); // Clear previous data
          }
        } finally {
           loadedCount++;
           if (loadedCount === coins.length && active) {
               setIsInitiallyLoading(false); // All fetches attempted, hide loader
           }
        }
      }
    };

    fetchAllChartData();

    // Cleanup function
    return () => {
      active = false;
    };
  }, []); // Empty dependency array means run once on mount

  const togglePicksExpansion = () => {
    setIsPicksExpanded(prev => !prev);
  };

  return (
    <>
      {/* Top Row - Make this sticky */}
      <div className="bg-[#1C1D33] p-4 py-5 sticky top-0 z-[999] text-white">
        <div className="container mx-auto flex justify-between items-center max-w-6xl">
          <div className="flex items-center space-x-2">
            <img src="/logoBAIMX.png" alt="BAIMX Logo" className="h-5 w-auto" /> {/* Actual Logo */}
          </div>
          <div className="flex items-center space-x-4">
            <nav className="flex space-x-4 text-sm">
              <a href="#" className="hover:text-gray-300 relative pr-2.5"> 
                Live Feed
                <motion.span
                  className="absolute top-0.5 right-0 block h-1.5 w-1.5 rounded-full bg-green-500"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                  aria-hidden="true"
                />
              </a>
              <a href="#" className="hover:text-gray-300">Subscribe</a>
              <a href="#" className="hover:text-gray-300">Breaking</a>
              <a href="#" className="hover:text-gray-300">Research</a>
              <a href="#" className="hover:text-gray-300">Licensing</a>
              <a href="#" className="hover:text-gray-300">Launchpad</a>
              <a href="#" className="hover:text-gray-300">Integrations</a>
              <a href="#" className="hover:text-gray-300">API</a>
              <a href="#" className="hover:text-gray-300">About</a>
              <a href="#" className="hover:text-gray-300">Contact</a>
            </nav>
            <div className="flex items-center space-x-2">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-1 rounded text-sm">Sign In</button>
              <img 
                src="/Flag_of_the_United_Kingdom_(1-2).svg" 
                alt="UK Flag" 
                className="h-4 w-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Second Row - Navigation */}
      <div className="bg-[#31334B] p-4 py-3">
        <div className="container mx-auto max-w-6xl flex justify-center">
          <nav className="flex justify-center space-x-6 text-sm text-gray-100">
               {/* Repeating nav items for demo */}
              <a href="#" className="hover:text-white">Licensing</a>
              <a href="#" className="hover:text-white">API</a>
              <a href="#" className="hover:text-white">About</a>
              <a href="#" className="hover:text-white">Contact</a>
               <a href="#" className="hover:text-white">Licensing</a>
              <a href="#" className="hover:text-white">API</a>
              <a href="#" className="hover:text-white">About</a>
              <a href="#" className="hover:text-white">Contact</a>
               <a href="#" className="hover:text-white">Licensing</a>
              <a href="#" className="hover:text-white">API</a>
              <a href="#" className="hover:text-white">About</a>
              <a href="#" className="hover:text-white">Contact</a>
          </nav>
        </div>
      </div>

      {/* Third Row - Today's Picks - Now Animates Height */} 
      <motion.div 
        className="bg-[#1B1D2A] overflow-hidden" // Add overflow-hidden
        initial={false} // Don't animate on initial load
        animate={{ height: isPicksExpanded ? 'auto' : '50px' }} // Reduce collapsed height
        transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
      >
        <div className="container mx-auto max-w-6xl relative py-5 pb-6">
          {/* Toggle Button with conditional styling for expanded/collapsed states */}
          <button 
            onClick={togglePicksExpansion} 
            className={`absolute z-20 flex items-center justify-center p-1 transition-colors
              ${isPicksExpanded 
                ? "bottom-1 left-0 text-gray-400 hover:text-white" 
                : "left-1/2 transform -translate-x-1/2 -bottom-4 bg-white text-black hover:bg-gray-100 rounded-b-md w-8 h-5 shadow-md"
              }`}
            aria-label={isPicksExpanded ? "Collapse Today's Picks" : "Expand Today's Picks"}
          >
            {isPicksExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {/* Loader - Moved outside inner AnimatePresence */} 
          {isInitiallyLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#1B1D2A] bg-opacity-80">
              <LoadingCubes />
            </div>
          )}

          {isPicksExpanded && (
            <h2 className="text-sm font-semibold mb-1 text-white">Today's Picks</h2>
          )}
          
          {/* AnimatePresence for the content switching/resizing */}
          <AnimatePresence initial={false} mode="wait">
            {isPicksExpanded ? (
              // Expanded view
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-6 gap-2 relative"
                style={{ minHeight: '80px' }}
              >
                {isInitiallyLoading ? (
                  <div className="col-span-6 py-8 flex justify-center">
                    
                  </div>
                ) : (
                  <>
                    {coins.map((coin, index) => {
                      const data = chartData[coin.symbol];
                      const error = chartErrors[coin.symbol];
                      const hasData = data && !error;
                      const hasError = error && !data;
                      
                      return (
                        <motion.div 
                          key={coin.symbol}
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ 
                            duration: 0.5, 
                            delay: index * 0.08, // Stagger effect
                            ease: [0.2, 0.65, 0.3, 0.9] // Custom easing for a professional look
                          }}
                          className="bg-[#14151F] rounded-lg p-3 flex flex-col justify-between h-24 mb-6 shadow-lg"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-gray-100">{coin.symbol}/USD</span>
                            {hasData && data?.percentageChange !== undefined && (
                              <motion.span 
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.08 + 0.3, duration: 0.3 }}
                                className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${data.percentageChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {data.percentageChange >= 0 ? '+' : ''}{data.percentageChange.toFixed(2)}%
                              </motion.span>
                            )}
                          </div>
                          
                          {hasData && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: index * 0.08 + 0.2, duration: 0.4 }}
                              className="flex-grow py-5"
                            >
                              <MiniTokenChart 
                                symbol={coin.symbol} 
                                chartOption={data?.option || null} 
                                error={error || null} 
                                percentageChange={data?.percentageChange || null} 
                              />
                            </motion.div>
                          )}
                          {hasError && (
                            <div className="h-16 flex items-center justify-center text-xs text-red-500">
                              {error.includes('pool') ? 'No pool found' : 'Failed to load'}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </>
                )}
              </motion.div>
            ) : (
              // Collapsed view - Simple row with just coin names and indicators
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center gap-6 py-2"
              >
                {isInitiallyLoading ? (
                  <div className="flex justify-center">
                    <LoadingCubes />
                  </div>
                ) : (
                  <>
                    {coins.map((coin, index) => {
                      const data = chartData[coin.symbol];
                      const error = chartErrors[coin.symbol];
                      const hasData = data && !error;
                      
                      // Determine icon and color based on percentage change
                      let icon = null;
                      let textColor = '';
                      
                      if (hasData && data?.percentageChange !== undefined) {
                        const change = data.percentageChange;
                        textColor = change >= 0 ? 'text-green-500' : 'text-red-500';
                        icon = change >= 0 ? <ArrowUpRight className="inline w-3 h-3 ml-1" /> : <ArrowDownRight className="inline w-3 h-3 ml-1" />;
                      }
                      
                      return (
                        <motion.div 
                          key={coin.symbol} 
                          className="flex items-center"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ 
                            duration: 0.3,
                            delay: index * 0.05, // Staggered loading
                            ease: "easeOut"
                          }}
                        >
                          <span className="text-xs font-medium text-gray-200">{coin.symbol}/USD</span>
                          {hasData && icon && <span className={textColor}>{icon}</span>}
                        </motion.div>
                      );
                    })}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
};

// Updated LiveFeedSection for Link and Icon + Hover Animation
export const LiveFeedSection: React.FC = () => (
  <section className="container mx-auto my-4 max-w-6xl">
    <div className="flex justify-between items-center mb-1">
      {/* Wrap Link content for group hover effect */}
      <Link 
        to="/Livefeed" 
        className="group text-lg font-bold flex items-center hover:text-blue-600 transition-colors duration-200" // Removed relative pr-4
      >
        <img src="/logoBAIMXblack.png" alt="BAIMX" className="h-4 mr-1" />
        Live
        {/* REMOVED Pulsing Live Indicator */}
        
        {/* Animate chevron on group hover */}
        <motion.div 
          className="ml-1"
          whileHover={{ x: 3 }} 
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          <ChevronRight className="w-5 h-5 transition-transform duration-200 ease-in-out group-hover:translate-x-1" /> 
        </motion.div>
      </Link>
      <button className="bg-gray-700 text-white px-3 py-1 rounded text-sm">Filters</button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-gray-200 h-60 rounded"></div>
      ))}
    </div>
  </section>
);

// Simple Progress component
interface ProgressProps {
  value: number;
  className?: string;
  'aria-label'?: string;
}

const Progress: React.FC<ProgressProps> = ({ value, className, 'aria-label': ariaLabel }) => {
  return (
    <div className={`relative overflow-hidden ${className || ''}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={ariaLabel}>
      <div 
        className="h-full bg-blue-500" 
        style={{ width: `${value}%`, transition: 'width 50ms linear' }}
      />
    </div>
  );
};

// --- Featured Section with Rotation ---
export const FeaturedSection: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [progress, setProgress] = useState(0);
  const ROTATION_INTERVAL = 20000;
  const PROGRESS_UPDATE_INTERVAL = 50;

  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (100 / (ROTATION_INTERVAL / PROGRESS_UPDATE_INTERVAL));
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, PROGRESS_UPDATE_INTERVAL);
    const rotationTimer = setInterval(() => {
      setArticles((prevArticles) => {
        const [first, ...rest] = prevArticles;
        return [...rest, first];
      });
      setProgress(0);
    }, ROTATION_INTERVAL);
    return () => {
      clearInterval(progressTimer);
      clearInterval(rotationTimer);
    };
  }, []);

  const mainArticle = articles[0];
  const sidebarArticles = articles.slice(1, 4);
  
  // Enhanced animation variants with rotation
  const mainVariants = { 
    initial: { opacity: 0, y: 20, rotateX: 10 },
    animate: { opacity: 1, y: 0, rotateX: 0 },
    exit: { opacity: 0, y: -20, rotateX: -10 }
  };
  
  const sideVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };
  
  const transition = { 
    duration: 0.4,
    ease: [0.25, 0.1, 0.25, 1]
  };

  return (
    <section className="container mx-auto my-4 max-w-6xl">
      <h2 className="text-lg font-bold mb-1">Featured</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-start">
        {/* Main Article Div - Reduced height */}
        <div className="col-span-1 md:col-span-2 relative rounded overflow-hidden" style={{ height: "420px" }}>
          <div className="absolute inset-0">
            {mainArticle.imageUrl && <img src={mainArticle.imageUrl} alt="" className="w-full h-full object-cover rounded" />}
            {!mainArticle.imageUrl && <div className="absolute inset-0 bg-gray-400 rounded"></div>}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent rounded"></div>
          </div>
          
          {/* Content positioned absolutely to prevent layout shifts */}
          <div className="absolute inset-x-0 bottom-0 p-6 pb-8 z-10">
            <AnimatePresence mode="wait">
              <motion.div 
                key={mainArticle.id} 
                className="text-white" 
                variants={mainVariants} 
                initial="initial" 
                animate="animate" 
                exit="exit" 
                transition={transition}
              >
                <h3 className="text-xl lg:text-2xl font-bold mb-2">{mainArticle.title}</h3>
                <a href="#" className="text-sm font-medium text-blue-300 hover:underline">Read the full article &gt;</a>
                <div className="mt-4 flex flex-wrap justify-between items-end gap-y-2 text-xs text-gray-200">
                  <span>{mainArticle.time} | {mainArticle.read}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {mainArticle.tags.map(tag => (
                      <span key={tag} className="bg-gray-700/80 px-2 py-0.5 rounded text-[11px] font-medium backdrop-blur-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Progress bar placed at the very bottom of the main card */}
          <div className="absolute bottom-0 left-0 right-0 z-20">
            <Progress 
              value={progress} 
              className="h-1 w-full bg-black/20" 
              aria-label="Time until next article rotation" 
            />
          </div>
        </div>
        
        {/* Sidebar Articles Div - Reduced height to match main article */}
        <div className="col-span-1 overflow-hidden" style={{ height: "420px" }}>
          <div className="h-full flex flex-col">
            <AnimatePresence initial={false} mode="wait">
              {sidebarArticles.map((article, index) => (
                <Link
                  key={article.id}
                  to={`/article/${article.id}`}
                  className="flex-1 block p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors duration-150"
                  style={{ height: `${100 / sidebarArticles.length}%` }}
                >
                  <motion.div 
                    variants={sideVariants} 
                    initial="initial" 
                    animate="animate" 
                    exit="exit" 
                    transition={transition}
                    className="h-full flex flex-col"
                  >
                    <h4 className="text-base font-semibold mb-1 text-gray-800">{article.title}</h4>
                    <span className="text-xs text-gray-500 block mt-1">{article.time} | {article.read}</span>
                    <div className="flex flex-wrap gap-1 mt-1 mb-2">
                      {article.tags.map(tag => (
                        <span key={tag} className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded text-[10px] font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <a href="#" className="text-xs font-medium text-blue-600 hover:underline mt-auto">Read the full article &gt;</a>
                  </motion.div>
                </Link>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- Recent Section with Article Grid ---
export const RecentSection: React.FC = () => {
  // Generate 6 articles by using the initialArticles plus 2 additional ones
  const recentArticles = [...initialArticles];
  
  // Add two more articles if needed to have a total of 6
  while (recentArticles.length < 6) {
    recentArticles.push({
      id: Math.random() * 1000 + 10, // Random ID to avoid collisions
      title: recentArticles.length === 4 
        ? 'New DeFi Protocol Sees Record TVL Growth in First Week' 
        : 'Upcoming Blockchain Conference to Feature Leading Industry Innovators',
      time: recentArticles.length === 4 ? '2h ago' : '3h ago',
      read: recentArticles.length === 4 ? '5 min read' : '4 min read',
      tags: recentArticles.length === 4 
        ? ['DeFi', 'Growth', 'Protocol'] 
        : ['Conference', 'Innovation', 'Industry'],
      imageUrl: recentArticles.length === 4 
        ? '/placeholder-defi.jpg' 
        : '/placeholder-conference.jpg',
    });
  }

  return (
    <section className="container mx-auto my-8 max-w-6xl">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold">Recent Articles</h2>
        <Link 
          to="/recent" 
          className="group text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors flex items-center"
        >
          View all
          <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recentArticles.map((article) => (
          <Link 
            key={article.id} 
            to={`/article/${article.id}`}
            className="block relative rounded overflow-hidden h-64 group transform transition-transform hover:scale-[1.02] hover:shadow-lg"
          >
            <div className="absolute inset-0">
              {article.imageUrl ? (
                <img 
                  src={article.imageUrl} 
                  alt="" 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                />
              ) : (
                <div className="absolute inset-0 bg-gray-400 rounded"></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent rounded"></div>
            </div>
            
            <div className="absolute inset-x-0 bottom-0 p-4 text-white z-10">
              <h3 className="text-lg font-semibold mb-1 line-clamp-2">{article.title}</h3>
              
              <div className="flex flex-wrap gap-1.5 mt-1 mb-2">
                {article.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="bg-gray-700/60 px-1.5 py-0.5 rounded text-[10px] font-medium backdrop-blur-sm">
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="flex justify-between items-center text-xs text-gray-200 mt-2">
                <span>{article.time} | {article.read}</span>
                <span className="text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity">Read article &rarr;</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

// New HomePage component
export const HomePage: React.FC = () => (
  <>
    <AdSpace />
    <FeaturedSection />
    <LiveFeedSection />
    <RecentSection />
  </>
);

// Footer Component
const Footer: React.FC = () => (
  <footer className="bg-[#1C1D33] text-gray-100 p-4 mt-8 text-center text-sm">
    © 2025 BAIMX. All rights reserved.
  </footer>
);

// Main Layout Component - Animations Removed
const Layout: React.FC = () => {
  // REMOVED: const location = useLocation();
  // REMOVED: const pageVariants = { ... };
  // REMOVED: const pageTransition = { ... };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* Header renders fragments now, so it doesn't need to be inside the main layout div */}
      <Header /> 
      {/* REMOVED: <AnimatePresence mode='wait'> */}
        {/* Replaced motion.main with standard main */}
        <main
          // REMOVED: key={location.pathname} 
          className="flex-grow bg-white" 
          // REMOVED: initial="initial"
          // REMOVED: animate="in"
          // REMOVED: exit="out"
          // REMOVED: variants={pageVariants}
          // REMOVED: transition={pageTransition}
        >
          <Outlet />
        </main>
      {/* REMOVED: </AnimatePresence> */}
      <Footer />
    </div>
  );
};

// App component now just renders the Layout
const App: React.FC = () => {
  return <Layout />;
}

export default App;

// --- Add Back Missing Components ---
export const AdSpace: React.FC = () => (
  <section className="container mx-auto my-4 h-40 bg-gray-200 flex items-center justify-center text-gray-500 max-w-6xl">
    ADSPACE
  </section>
);

