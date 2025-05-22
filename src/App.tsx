import React, { useState, useEffect, useRef } from 'react'; // Import hooks and useEffect
import { Link, Outlet, useLocation } from 'react-router-dom'; // Removed useLocation import -> Actually, ADDING useLocation
import { motion, AnimatePresence } from 'framer-motion'; // Re-added motion and AnimatePresence import
import { ChevronRight, ChevronUp, ChevronDown, ArrowUpRight, ArrowDownRight, Filter, CheckCheck, ChevronLeft, TrendingUp, TrendingDown, Lock as LockIcon, X as XIcon } from 'lucide-react'; // Added TrendingUp/Down and LockIcon
import { createPortal } from 'react-dom'; // Added createPortal import

// Suppress AnimatePresence warnings
const originalError = console.error;
console.error = (...args) => {
  if (args[0]?.includes?.('You\'re attempting to animate multiple children within AnimatePresence')) {
    return;
  }
  originalError.apply(console, args);
};

import './index.css' // Ensure Tailwind styles are imported

// Add Mina font styles
const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Mina:wght@400;700&display=swap');

  body {
    font-family: Helvetica, Arial, sans-serif;
  }

  .mina-regular {
    font-family: "Mina", sans-serif;
    font-weight: 400;
    font-style: normal;
  }

  .mina-bold {
    font-family: "Mina", sans-serif;
    font-weight: 700;
    font-style: normal;
  }
`;

// Add styles to document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = fontStyles;
  document.head.appendChild(style);

  // Add preconnect links
  const preconnectGoogle = document.createElement('link');
  preconnectGoogle.rel = 'preconnect';
  preconnectGoogle.href = 'https://fonts.googleapis.com';
  document.head.appendChild(preconnectGoogle);

  const preconnectGstatic = document.createElement('link');
  preconnectGstatic.rel = 'preconnect';
  preconnectGstatic.href = 'https://fonts.gstatic.com';
  preconnectGstatic.crossOrigin = 'anonymous';
  document.head.appendChild(preconnectGstatic);
}

// Add custom scrollbar styles
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.3);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(156, 163, 175, 0.5);
  }
`;

// Add styles to document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = scrollbarStyles;
  document.head.appendChild(style);
}

import { MiniTokenChart } from './components/MiniTokenChart'; // Import the new chart component
import { MiniTokenChartLight } from './components/MiniTokenChart'; // Import the new LIGHT chart component
import { LoadingCubes } from './components/LoadingCubes'; // Import LoadingCubes
import { LiveFeedSection } from './components/LiveFeedSection'; // Import the new LiveFeedSection component
import BTCSection from './components/sections/BTCSection';
import ETHSection from './components/sections/ETHSection';
import XRPSection from './components/sections/XRPSection';
import SOLSection from './components/sections/SOLSection';
import SpeculativeSection from './components/sections/SpeculativeSection';
import { RealTimePrices } from './components/RealTimePrices';
import { TLDRSection } from './components/sections/TLDRSection';
import { Header as HeaderSection } from './components/sections/HeaderSection';
import { PricesMainView } from './components/sections/PricesMainView';
import { BAIMXDataSection } from './components/sections/BAIMXDataSection'; // Import the new section
// import { NewsSection } from './components/sections/NewsSection'; // Ensure this line is removed or commented out

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

// Export coins separately to avoid HMR issues
export { coins };

// Base prices and volatility for simulation
export const INITIAL_PRICES: Record<string, { price: number; volatility: number }> = {
  'BTC': { price: 71245.50, volatility: 0.001 },
  'ETH': { price: 3975.25, volatility: 0.0015 },
  'SOL': { price: 185.75, volatility: 0.002 },
  'USDC': { price: 1.00, volatility: 0.0001 },
  'BONK': { price: 0.00001234, volatility: 0.005 },
  'WIF': { price: 0.45, volatility: 0.003 }
};

// --- Helper functions moved from MiniTokenChart --- 

interface Pool {
  attributes: {
    address?: string;
    volume_usd?: {
      h24?: string;
    };
    token_price_usd?: string;
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
  volume24h?: string;
  price?: number;
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
  preview?: string; // Added preview text field
  xoutValue?: number; // Expected outcome value
  xoutSymbol?: string; // Expected outcome symbol (e.g., BTC, ETH)
}

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
    imageUrl: '/Oil.png',
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
    imageUrl: '/Oil2.png',
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
    imageUrl: '/HongKong.png',
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
    imageUrl: '/channel.png',
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

// +++ Add Placeholder Data Fetching Functi ons +++
async function fetchCoinChartData(coin: Coin): Promise<{ symbol: string; data?: { option: any; percentageChange: number }; error?: string }> {
  console.log(`fetchCoinChartData called for ${coin.symbol} (placeholder)`);
  await new Promise(res => setTimeout(res, Math.random() * 200)); // Simulate delay
  if (Math.random() < 0.1) return { symbol: coin.symbol, error: 'Simulated fetch error' };
  // Create properly typed fake candles
  const candleList: [number, number, number, number, number][] = Array.from(
    { length: 20 }, 
    () => [Date.now() - Math.random() * 1000000, Math.random() * 1000, Math.random() * 100, Math.random() * 100, Math.random() * 10000]
  );
  const chartResult = createChartOption(candleList);
  return { symbol: coin.symbol, data: chartResult || undefined };
}

// --- Interfaces (Ensure necessary types are defined) ---
interface TickerCoinData { // Specific type for ticker data
  id: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
}

// --- NEW: TickerBar Component ---
const TickerBar: React.FC = () => {
  const [tickerData, setTickerData] = useState<TickerCoinData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false); // This state might still be useful for the scroll animation pause
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredCoin, setHoveredCoin] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartDataState>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);
  // State for dynamic chart positioning
  const [chartPopupPosition, setChartPopupPosition] = useState<{ top: number; left: number } | null>(null);

  const filterOptions = [
    { id: 'stablecoins', label: 'Stablecoins' },
    { id: 'altcoins', label: 'Altcoins' },
    { id: 'memecoins', label: 'Memecoins' },
    { id: 'defi', label: 'DeFi' },
    { id: 'gaming', label: 'Gaming' },
    { id: 'infrastructure', label: 'Infrastructure' },
    { id: 'ai', label: 'AI' },
    { id: 'privacy', label: 'Privacy' }
  ];

  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const formatPriceTicker = (value: number): string => {
    if (value < 0.01 && value > 0) return `$${value.toFixed(5)}`;
    if (value >= 1000) return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  useEffect(() => {
    const fetchTickerData = async () => {
      setError(null);
      try {
        const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&sparkline=false`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Ticker API Error: ${response.status} ${response.statusText}`);
        }
        const data: TickerCoinData[] = await response.json();
        setTickerData(prevData => {
          if (JSON.stringify(prevData) !== JSON.stringify(data)) {
            return data;
          }
          return prevData;
        });
      } catch (err) {
        console.error("Error fetching ticker data:", err);
        setError(err instanceof Error ? err.message : 'Failed to load ticker data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickerData();
    const intervalId = setInterval(fetchTickerData, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // Update hover position handler
  const handleTickerHover = async (symbol: string, event: React.MouseEvent<HTMLDivElement>) => {
    setHoveredCoin(symbol);
    const tokenElement = event.currentTarget;
    const tokenRect = tokenElement.getBoundingClientRect();
    const chartWidth = 280; // Defined width of the MiniTokenChart container
    const top = tokenRect.bottom + 5; // 5px offset below the token
    let left = tokenRect.left + (tokenRect.width / 2) - (chartWidth / 2);

    // Ensure the chart doesn't go off-screen to the left or right
    const screenPadding = 10; // px
    if (left < screenPadding) {
      left = screenPadding;
    }
    if (left + chartWidth > window.innerWidth - screenPadding) {
      left = window.innerWidth - chartWidth - screenPadding;
    }

    setChartPopupPosition({ top, left });

    if (!chartData[symbol]) {
      try {
        const result = await fetchCoinChartData({ symbol, tokenId: '' });
        if (result?.data && result.data.option && result.data.percentageChange !== undefined) {
          const data = result.data; // Assign to a new variable
          setChartData(prev => ({
            ...prev,
            [symbol]: {
              option: data.option,
              percentageChange: data.percentageChange
            }
          }));
        }
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    }
  };

  // Clear hover handler
  const handleTickerLeave = () => {
    setHoveredCoin(null);
    // No need to explicitly setChartPopupPosition(null) here if AnimatePresence unmounts based on hoveredCoin
  };

  // Fetch chart data when a coin is hovered (useEffect for chartData remains largely the same)
  useEffect(() => {
    if (hoveredCoin) {
      const fetchCoinChart = async () => {
        try {
          const coin = { symbol: hoveredCoin, tokenId: '' };
          const result = await fetchCoinChartData(coin);
          if (result?.data && result.data.option && result.data.percentageChange !== undefined) { // Refined check
            const data = result.data; // Assign to a new variable
            setChartData(prev => ({
              ...prev,
              [hoveredCoin]: {
                option: data.option,
                percentageChange: data.percentageChange,
                price: tickerData.find(t => t.symbol.toLowerCase() === hoveredCoin.toLowerCase())?.current_price
              }
            }));
          }
        } catch (err) {
          console.error(`Error fetching chart for ${hoveredCoin}:`, err);
        }
      };
      
      if (!chartData[hoveredCoin]) {
        fetchCoinChart();
      }
    }
  }, [hoveredCoin, chartData]); // Removed tickerData from deps if not directly used in this specific fetchCoinChart

  const duplicatedData = tickerData.length > 0 ? [...tickerData, ...tickerData, ...tickerData] : [];

  if (isLoading) {
    return (
      <div className="bg-black border-slate-800 border-t h-[32px] flex items-center justify-center text-xs text-gray-400">
        Loading Ticker...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black border-slate-800 border-t h-[32px] flex items-center justify-center text-xs text-red-400">
        Error: {error}
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-950 border-slate-700 border-y overflow-hidden relative w-full select-none">
        {/* Search and Filters Row - Always visible */}
        <div className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 px-4 py-2">
          <div className="container mx-auto max-w-[77rem] flex items-center justify-between">
            <div className="relative flex items-center w-[220px]">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search BAIMX"
                className="w-full h-8 px-3 pr-8 text-sm text-white bg-slate-800 border border-slate-700 rounded-md focus:ring-1 focus:ring-[#0091AD] focus:border-[#0091AD] outline-none placeholder-gray-400"
              />
              {searchTerm && (
                <motion.button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-0.5"
                  aria-label="Clear search"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <XIcon size={16} />
                </motion.button>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {filterOptions.map(filter => (
                <motion.button
                  key={filter.id}
                  onClick={() => toggleFilter(filter.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer
                    ${activeFilters.includes(filter.id)
                      ? 'bg-[#0091AD] text-white border-[#0091AD]'
                      : 'bg-slate-800 text-gray-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                    }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {filter.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Ticker Symbols Row */}
        <motion.div
          className="py-4"
          onHoverStart={() => setIsHovered(true)} // For pausing animation
          onHoverEnd={() => setIsHovered(false)}   // For resuming animation
        >
          <div ref={constraintsRef} className="absolute inset-0 overflow-hidden mt-12">
            <motion.div
              ref={scrollContainerRef}
              className="flex h-full items-center ticker-scrolling"
              drag="x"
              dragConstraints={constraintsRef}
              dragElastic={0.05}
              dragMomentum={true}
              style={{
                animationPlayState: (isHovered || isDragging) ? 'paused' : 'running',
                touchAction: 'pan-y',
              }}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => setIsDragging(false)}
            >
              {duplicatedData.map((coin, index) => {
                const priceChange = coin.price_change_percentage_24h ?? 0;
                const isPositive = priceChange >= 0;

                return (
                  <motion.div
                    key={`${coin.id}-${index}`}
                    className="inline-flex items-center mx-1 px-2 flex-shrink-0 bg-gray-900 rounded-md border border-gray-700 py-1 px-2 cursor-pointer" // Added cursor-pointer
                    onMouseEnter={(e) => handleTickerHover(coin.symbol.toUpperCase(), e)}
                    onMouseLeave={handleTickerLeave}
                    style={{
                      transition: 'font-size 0.2s ease-in-out',
                    }}
                  >
                    <span className={`font-medium mr-1.5 text-gray-100 ${(isHovered || isDragging) ? 'text-sm' : 'text-xs'}`}>
                      {coin.symbol.toUpperCase()}
                    </span>
                    {isPositive ? (
                      <TrendingUp
                        size={(isHovered || isDragging) ? 14 : 12}
                        className="mr-0.5 text-green-500 transition-all"
                      />
                    ) : (
                      <TrendingDown
                        size={(isHovered || isDragging) ? 14 : 12}
                        className="mr-0.5 text-red-500 transition-all"
                      />
                    )}
                    <span className={`mr-1 text-gray-200 ${(isHovered || isDragging) ? 'text-sm' : 'text-xs'}`}>
                      {formatPriceTicker(coin.current_price)}
                    </span>
                    <span className={`${isPositive ? 'text-green-500' : 'text-red-500'} ${(isHovered || isDragging) ? 'text-sm' : 'text-xs'}`}>
                      {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                    </span>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Mini Chart - Positioned with fixed based on chartPopupPosition */}
      <AnimatePresence>
        {hoveredCoin && chartPopupPosition && (
          <motion.div
            key="mini-chart-popup" // Add a key for stable animation
            style={{
              position: 'fixed',
              top: chartPopupPosition.top,
              left: chartPopupPosition.left,
              zIndex: 9999,
              pointerEvents: 'none', // Keep this so chart doesn't interfere with mouse events
            }}
            initial={{ opacity: 0, y: -10, scale: 0.95 }} // y is transform here
            animate={{ opacity: 1, y: 0, scale: 1 }}    // y is transform here
            exit={{ opacity: 0, y: -10, scale: 0.95 }}   // y is transform here
            transition={{ duration: 0.2 }}
          >
            <div className="bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-2xl p-2 border border-gray-700" style={{ width: '280px' }}>
              <MiniTokenChart
                symbol={hoveredCoin}
                chartOption={chartData[hoveredCoin]?.option || null}
                error={null} // Assuming errors specific to this chart are handled elsewhere or not needed here
                percentageChange={chartData[hoveredCoin]?.percentageChange || null}
                price={chartData[hoveredCoin]?.price || tickerData.find(t => t.symbol.toUpperCase() === hoveredCoin)?.current_price}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
// --- END: TickerBar Component ---

// --- StickyHeader Component (Updated with scroll behavior and main header awareness) ---
export const StickyHeader: React.FC = () => {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(window.scrollY);
  const location = useLocation(); // Get current location

  const HIDE_THRESHOLD = 100; // Pixels from top to start auto-hide/show behavior (if main header is not visible)
  const SCROLL_DELTA_FOR_ACTION = 10; // Minimum scroll distance to trigger hide/show
  const MAIN_HEADER_SELECTOR = '.bg-slate-900.overflow-hidden'; // Selector for the main Header's "Today's Picks" section, ensure this is specific enough

  useEffect(() => {
    const handleScrollOrPathChange = () => {
      const currentScrollY = window.scrollY;
      const direction = currentScrollY > lastScrollY.current ? 'down' : 'up';

      const picksSection = document.querySelector(MAIN_HEADER_SELECTOR);
      const mainHeaderVisible = picksSection ? picksSection.getBoundingClientRect().bottom > 0 : false;

      if (mainHeaderVisible) { // If main header is visible (e.g., top of home page)
        setHidden(true);
      } else if (location.pathname === '/' && currentScrollY < HIDE_THRESHOLD) { 
        // On home page, but scrolled near top (main header not fully in view yet, but close)
        // This case might need adjustment based on exact behavior desired near top of home page
        // For now, let's assume if mainHeader isn't visible, and we are on home near top, it should be hidden.
        // Or, if the intention is for it to show once main header is *just* out of view on home, this needs tweaking.
        // Consider if HIDE_THRESHOLD is the right point for it to appear on the home page specifically.
        setHidden(false); // Default to show if main header is NOT visible and we are NOT on a page like /about
      } else if (location.pathname !== '/') { // On other pages like /about
        // Apply normal scroll logic for non-home pages
        if (currentScrollY < HIDE_THRESHOLD) {
          setHidden(false);
        } else {
          if (direction === 'down' && currentScrollY > lastScrollY.current + SCROLL_DELTA_FOR_ACTION) {
            setHidden(true);
          } else if (direction === 'up' && currentScrollY < lastScrollY.current - SCROLL_DELTA_FOR_ACTION) {
            setHidden(false);
          }
        }
      } else { // On home page, and mainHeader is NOT visible (scrolled past it)
         // Apply normal scroll logic for home page when scrolled down
        if (currentScrollY < HIDE_THRESHOLD) { // This HIDE_THRESHOLD might be too low if main header is large
          setHidden(false); // Or true if it should only appear after a significant scroll on home
        } else {
          if (direction === 'down' && currentScrollY > lastScrollY.current + SCROLL_DELTA_FOR_ACTION) {
            setHidden(true);
          } else if (direction === 'up' && currentScrollY < lastScrollY.current - SCROLL_DELTA_FOR_ACTION) {
            setHidden(false);
          }
        }
      }

      lastScrollY.current = currentScrollY;
    };

    handleScrollOrPathChange();

    window.addEventListener('scroll', handleScrollOrPathChange, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScrollOrPathChange);
    };
  }, [location.pathname, MAIN_HEADER_SELECTOR, HIDE_THRESHOLD, SCROLL_DELTA_FOR_ACTION]);

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          initial={{ y: "-100%", opacity: 0.8 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0.8 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          // User's updated class names for the sticky header
          className="fixed top-0 left-0 right-0 bg-slate-900 border-b border-slate-900 z-[999] pt-3"
        >
          {/* Preserving user's internal structure and styles for the header content */}
          <div className="container mx-auto flex justify-between items-center max-w-[77rem] py-3 px-0">
            <div className="flex items-center space-x-2">
              <img src="/logoBAIMXFinal.png" alt="BAIMX Logo" className="h-15 w-auto" />
            </div>
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-4 text-sm">
                <a href="#" className="hover:text-gray-300 relative pr-2.5 text-white">
                  Live Feed
                  <motion.span
                    className="absolute top-0.5 right-0 block h-1.5 w-1.5 rounded-full bg-blue-500 "
                    animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                    aria-hidden="true"
                  />
                </a>
                <a href="#" className="hover:text-gray-300 text-white">Subscribe</a>
                <a href="#" className="hover:text-gray-300 text-white">Prices</a>
                <a href="#" className="hover:text-gray-300 text-white">Learn</a>
                <a href="#" className="hover:text-gray-300 text-white">Research</a>
                <a href="#" className="hover:text-gray-300 text-white">Licensing</a>
                <a href="#" className="hover:text-gray-300 text-white">Launchpad</a>
                <a href="#" className="hover:text-gray-300 text-white">API</a>
                <Link to="/about" className="hover:text-gray-300 text-white">About</Link> {/* Corrected to use Link */}
                <a href="#" className="hover:text-gray-300 text-white">Contact</a>
              </nav>
              <div className="flex items-center space-x-2">
                <button className="bg-[#0091AD] text-white px-4 py-2 rounded font-medium text-xs">Sign In</button>
              </div>
            </div>
          </div>
          {/* Ticker Bar placed inside the motion.div of StickyHeader */}
          <TickerBar />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Header: React.FC = () => {
  const [isInitiallyLoading, setIsInitiallyLoading] = useState<boolean>(true);
  const [chartData, setChartData] = useState<ChartDataState>({});
  const [chartErrors, setChartErrors] = useState<ChartErrorsState>({});
  const [isPicksExpanded, setIsPicksExpanded] = useState<boolean>(true);
  const [isLiveFeedExpanded, setIsLiveFeedExpanded] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'markets' | 'picks'>('markets');

  // Fetch data for all charts on mount
  useEffect(() => {
    let active = true; // Flag to prevent state updates if component unmounts
    let loadedCount = 0;

    const fetchAllChartData = async () => {
      for (let i = 0; i < coins.length; i++) {
        const coin = coins[i];
        // Stagger API calls slightly
        await new Promise(resolve => setTimeout(resolve, i * 200)); 
        if (!active) return;

        try {
          const poolsUrl = `/api/geckoterminal/networks/solana/tokens/${coin.tokenId}/pools?page=1`;
          const poolsResponse = await fetch(poolsUrl);
          if (!active) return;
          if (!poolsResponse.ok) throw new Error(`Pool lookup failed (${poolsResponse.status})`);
          const poolsData = await poolsResponse.json();
          const poolAddress = findBestPoolAddress(poolsData.data);
          if (!poolAddress) throw new Error('No suitable pool found.');
          if (!active) return;

          // Get volume data from the best pool
          const volume24h = poolsData.data[0]?.attributes?.volume_usd?.h24 || '0';
          const currentPrice = INITIAL_PRICES[coin.symbol]?.price || parseFloat(poolsData.data[0]?.attributes?.token_price_usd || '0');

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
            setChartData(prev => ({ 
              ...prev, 
              [coin.symbol]: { 
                option, 
                percentageChange,
                volume24h: parseFloat(volume24h).toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }),
                price: currentPrice
              } 
            }));
            setChartErrors(prev => ({ ...prev, [coin.symbol]: null }));
          }

        } catch (err) {
          console.error(`[Header Fetch ${coin.symbol}] Error:`, err);
          if (active) {
            setChartErrors(prev => ({ ...prev, [coin.symbol]: err instanceof Error ? err.message : 'Failed to load' }));
            setChartData(prev => ({ ...prev, [coin.symbol]: null }));
          }
        } finally {
           loadedCount++;
           if (loadedCount === coins.length && active) {
               setIsInitiallyLoading(false);
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

  const toggleLiveFeedExpansion = () => {
    setIsLiveFeedExpanded(prev => !prev);
  };

  const handleViewChange = (view: 'markets' | 'picks') => {
    setActiveView(view);
  };

  return (
    <>
      <div id="main-header">
        <div className="bg-slate-900 p-4 py-5 text-white">
          <div className="container mx-auto flex justify-between items-center max-w-[77rem]">
            <div className="flex items-center space-x-2">
              <img src="/logoBAIMXFinal.png" alt="BAIMX Logo" className="h-11 w-auto" /> {/* Actual Logo */}
            </div>
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-4 text-sm">
                <a href="#" className="hover:text-gray-300 relative pr-2.5">
                  Live Feed
                  <motion.span
                    className="absolute top-0.5 right-0 block h-1.5 w-1.5 rounded-full bg-blue-500"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                    aria-hidden="true"
                  />
                </a>
                <a href="#" className="hover:text-gray-300">Subscribe</a>
                <a href="#" className="hover:text-gray-300">Prices</a>
                <a href="#" className="hover:text-gray-300">Learn</a>
                <a href="#" className="hover:text-gray-300">Research</a>
                <a href="#" className="hover:text-gray-300">Licensing</a>
                <a href="#" className="hover:text-gray-300">Launchpad</a>
                <a href="#" className="hover:text-gray-300">API</a>
                <Link to="/about" className="hover:text-gray-300">About</Link> {/* Corrected to use Link */}
                <a href="#" className="hover:text-gray-300">Contact</a>
              </nav>
              <div className="flex items-center space-x-2">
                <button className="bg-[#0091AD] text-white px-4 py-2 rounded font-medium text-xs">Sign In</button>
                
              </div>
            </div>
          </div>
        </div>

        {/* Second Row - Navigation */}
        <div className="bg-slate-900 p-4 py-3 border-b border-gray-800 border-t">
          <div className="container mx-auto max-w-[77rem] flex justify-center">
            <nav className="flex justify-center space-x-5 text-sm text-gray-100">
                 {/* Repeating nav items for demo */}
                 <a href="#" className="hover:text-white">General</a>
                <a href="#" className="hover:text-white">BTC</a>
                <a href="#" className="hover:text-white">ETH</a>
                <a href="#" className="hover:text-white">USDT</a>
                <a href="#" className="hover:text-white">XRP</a>
                <a href="#" className="hover:text-white">SOL</a>

                <a href="#" className="hover:text-white">AVAX</a>
                <a href="#" className="hover:text-white">DOGE</a>
                <a href="#" className="hover:text-white">LTC</a>
                <a href="#" className="hover:text-white">BCH</a>
                <a href="#" className="hover:text-white">Speculative</a>
                <a href="#" className="hover:text-white">Reports</a>
                <a href="#" className="hover:text-white">Stables</a>
                <a href="#" className="hover:text-white relative">
                  Calendar
                  <span className="absolute -top-2.5 -right-4.5 px-1  text-[9px] font-medium bg-[#0091AD] text-black rounded-sm">New</span>
                </a>
                <a href="#" className="hover:text-white">Governance</a>
                <a href="#" className="hover:text-white">Infrastructure</a>

            </nav>
          </div>
        </div>
      </div>

      {/* Third Row - Today's Picks - Now Animates Height */} 
      <motion.div 
        className="bg-slate-900 overflow-hidden"
        initial={false}
        animate={{ height: isPicksExpanded ? 'auto' : '50px' }}
        transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
      >
        <div className="container mx-auto max-w-[77rem] relative py-5 pb-6">
          {/* Compress Button */}
          {isPicksExpanded && (
            <button 
              onClick={togglePicksExpansion} 
              className="absolute bottom-1 left-0 text-gray-100 hover:text-gray-300"
              aria-label="Collapse Today's Picks"
            >
              <ChevronUp size={20} />
            </button>
          )}

          {/* Loader */}
          {isInitiallyLoading && (
            <div className="absolute inset-0 flex items-center justify-center mt-4 z-10 bg-opacity-100">
              <LoadingCubes />
            </div>
          )}

          {isPicksExpanded && (
            <div className="flex gap-2 items-center">
              <button 
                onClick={() => handleViewChange('markets')}
                className={`text-sm font-medium mb-1 ${activeView === 'markets' ? 'text-white' : 'text-gray-400 hover:text-gray-300'}`}
              >
                Live Markets
              </button>
              <div className="h-4 w-px mb-1 bg-gray-600"></div>
              <button 
                onClick={() => handleViewChange('picks')}
                className={`text-sm font-medium mb-1 ${activeView === 'picks' ? 'text-white' : 'text-gray-400 hover:text-gray-300'}`}
              >
                Today's Picks
              </button>
            </div>
          )}
          
          {/* AnimatePresence for the content switching */}
          <AnimatePresence initial={false}>
            {isPicksExpanded && (
              <motion.div
                key={activeView}
                initial={{ 
                  x: activeView === 'markets' ? -100 : 100,
                  opacity: 0,
                  scale: 0.95
                }}
                animate={{ 
                  x: 0,
                  opacity: 1,
                  scale: 1
                }}
                exit={{ 
                  x: activeView === 'markets' ? 100 : -100,
                  opacity: 0,
                  scale: 0.95
                }}
                transition={{ 
                  type: "spring",
                  duration: 0.5,
                  bounce: 0.1,
                  opacity: { duration: 0.3 },
                  scale: { duration: 0.3 }
                }}
                className="relative"
              >
                {activeView === 'markets' ? (
                  // Markets View
                  <motion.div
                    className="relative"
                    style={{ minHeight: '80px' }}
                  >
                    <div className="grid grid-cols-6 gap-1">
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
                                  delay: index * 0.08,
                                  ease: [0.2, 0.65, 0.3, 0.9]
                                }}
                                className="bg-[#14151F] rounded flex flex-col h-[140px] shadow-lg mb-5 mt-2"
                              >
                                {hasData && (
                                  <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.08 + 0.2, duration: 0.4 }}
                                    className="flex-grow"
                                  >
                                    <MiniTokenChart 
                                      symbol={coin.symbol} 
                                      chartOption={data?.option || null} 
                                      error={error || null} 
                                      percentageChange={data?.percentageChange || null}
                                      volume24h={data?.volume24h}
                                      price={data?.price}
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
                    </div>
                  </motion.div>
                ) : (
                  // Today's Picks View
                  <motion.div
                    className="grid grid-cols-6 gap-2 relative"
                    style={{ minHeight: '80px' }}
                  >
                    <div className="col-span-6 py-8 flex justify-center text-gray-400">
                      Today's Picks View Coming Soon
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Expand Button - Positioned below the third row */}
      {!isPicksExpanded && (
        <motion.button 
          onClick={togglePicksExpansion} 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="absolute left-0 mt-4 p-1.5 bg-[#1C1D33] rounded-sm text-white hover:bg-[#1C1D33]/90 transition-colors"
          aria-label="Expand Today's Picks"
        >
          <ChevronDown size={16} />
        </motion.button>
      )}

      {/* Fourth Row - Live Feed with simplified structure */}
      <motion.div 
        className="bg-slate-800 overflow-hidden"
        initial={false}
        animate={{ height: isLiveFeedExpanded ? 'auto' : '50px' }}
        transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
      >
        <div className="container mx-auto max-w-[77rem] relative py-4 pb-5">
          {/* Live Feed Header */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-300">Live Feed |</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <button className="p-1 text-gray-400 hover:text-gray-200 transition-colors">
              <Filter size={14} />
            </button>
          </div>
          
          {/* Content placeholder - Will be replaced with actual implementation */}
          <div className="mt-2">
            {isLiveFeedExpanded && (
              <div className="bg-slate-800/50 rounded p-4 text-center text-gray-400 text-sm">
                Live feed content will be implemented here
              </div>
            )}
          </div>
          
          {/* Compress Button */}
          {isLiveFeedExpanded && (
            <button 
              onClick={toggleLiveFeedExpansion} 
              className="absolute bottom-1 left-0 text-gray-300 hover:text-gray-100"
              aria-label="Collapse Live Feed"
            >
              <ChevronUp size={20} />
            </button>
          )}
        </div>
      </motion.div>

      {/* Expand Button for Live Feed */}
      {!isLiveFeedExpanded && (
        <motion.button 
          onClick={toggleLiveFeedExpansion} 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="absolute left-0 mt-4 p-1.5 bg-slate-600 rounded-sm text-white hover:bg-slate-500 transition-colors"
          aria-label="Expand Live Feed"
        >
          <ChevronDown size={16} />
        </motion.button>
      )}
    </>
  );
};

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
        className="h-full bg-black" 
        style={{ 
          width: `${value}%`, 
          transition: 'width 0.5s linear' // Add smooth transition
        }}
      />
    </div>
  );
};
// --- Featured Section with Rotation ---
export const FeaturedSection: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [progress, setProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [containerHeight, setContainerHeight] = useState<number | null>(null);
  const mainArticleRef = useRef<HTMLDivElement>(null);
  const ROTATION_INTERVAL = 20000;
  const PROGRESS_UPDATE_INTERVAL = 500; // Changed from 200 to 500
  const TRANSITION_DURATION = 600; // ms

  // --- NEW: State for Newsletter Frequency ---
  type NewsletterFrequency = 'Hourly' | 'Daily' | 'Weekly';
  const [activeNewsletterFrequency, setActiveNewsletterFrequency] = useState<NewsletterFrequency>('Daily');

  // --- NEW: Sample Newsletter Data ---
  const newsletters = [
    {
      id: 'nl1',
      title: 'BAIMX Daily Brief',
      description: 'Your essential morning update on market-moving news.',
      imageSrc: '/newsletter-daily.png', // Replace with actual or leave for placeholder
      frequency: 'Daily',
      previewLink: '#',
    },
    {
      id: 'nl2',
      title: 'BAIMX Weekly Digest',
      description: 'In-depth analysis and trends from the past week.',
      imageSrc: '/newsletter-weekly.png', // Replace with actual or leave for placeholder
      frequency: 'Weekly',
      previewLink: '#',
    },
    {
      id: 'nl3',
      title: 'Hourly Algo Signals',
      description: 'Real-time insights powered by BAIMX algorithms.',
      imageSrc: null, // This will use the placeholder
      frequency: 'Hourly',
      previewLink: '#',
    },
    {
      id: 'nl4',
      title: 'Markets Today',
      description: 'Key movements and analysis in Canadian finance.',
      imageSrc: '/toronto-stock.png', // Example image, replace as needed
      frequency: 'Daily',
      previewLink: '#',
    },
     {
      id: 'nl5',
      title: 'Tech Pulse Weekly',
      description: 'The latest in tech, AI, and innovation, weekly.',
      // imageSrc: null, // Will use placeholder
      frequency: 'Weekly',
      previewLink: '#',
    },
  ];

  const filteredNewsletters = newsletters.filter(nl => nl.frequency === activeNewsletterFrequency).slice(0, 3); // Show up to 3

  // --- NEW: Create a longer list for the "Latest" section to ensure scrollability ---
  const articlesForLatestList = [...articles, ...articles.slice(0, 4)]; // 8 + 4 = 12 items

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
  const sidebarArticles = articles.slice(1);
  const additionalFeatureArticles = articles.slice(4, 8);
  // Update slice to get 6 articles for a 3x2 grid
  const topStoriesArticles = articles.slice(0, 6); // Use first 6 articles for example
  const latestArticles = articles.slice(0, 7);

  // --- NEW: State for BTC Chart in Opinion Box ---
  const [btcChartData, setBtcChartData] = useState<ChartData | null>(null);
  const [btcChartError, setBtcChartError] = useState<string | null>(null);

  // --- NEW: Fetch BTC Chart Data for Opinion Box ---
  useEffect(() => {
    const fetchBtcData = async () => {
      try {
        // Assuming 'BTC' is a valid symbol and we can find its tokenId if needed by fetchCoinChartData
        // Or, if fetchCoinChartData can work with just symbol for placeholder, that's fine.
        const btcCoin: Coin = coins.find(c => c.symbol === 'BTC') || { symbol: 'BTC', tokenId: '' }; // Fallback if not in coins array
        const result = await fetchCoinChartData(btcCoin);
        if (result.data) {
          setBtcChartData(result.data);
          setBtcChartError(null);
        } else if (result.error) {
          setBtcChartError(result.error);
          setBtcChartData(null);
        }
      } catch (err) {
        console.error("Error fetching BTC chart data for opinion box:", err);
        setBtcChartError(err instanceof Error ? err.message : 'Failed to load BTC chart');
        setBtcChartData(null);
      }
    };
    fetchBtcData();
  }, []); // Fetch once on mount

  return (
    <section className="container mx-auto  max-w-[77rem] bg-white border border-gray-400">
      
      
      
      
      {/* Additional Feature Articles row */}
      <div className="bg-white border-gray-400">
        <div className="grid grid-cols-1 md:grid-cols-8 divide-y border-b border-gray-400 md:divide-y-0 md:divide-x divide-gray-400">
          {/* First (larger) article */}
          <motion.div
            key={`feature-${additionalFeatureArticles[0].id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4,
              delay: 0.1,
              ease: "easeOut" 
            }}
            className="md:col-span-4 flex-grow flex-shrink-0"
          >
            <Link
              to={`/article/${additionalFeatureArticles[0].id}`}
              className="block h-full transition-colors duration-200 group" // Removed hover:bg-gray-50
            >
              <div className="flex flex-col h-full p-6 py-8 ">
                {/* Image Container - Larger for the combined article */}
                <div className="relative overflow-hidden">
                  <img 
                    src={additionalFeatureArticles[0].imageUrl || '/placeholder.jpg'} 
                    alt="" 
                    className="w-full h-84 object-cover transition-transform duration-500"
                  />
                  {/* Removed overlay */}
                </div>
                <p className="text-[10px] text-gray-600 mt-1 mb-2 text-right pr-1">BAIMX Media</p> {/* Added caption */}

                <h4 className="text-3xl font-bold leading-[1.05] mb-1 text-gray-900 group-hover:text-gray-500 transition-colors duration-200">
                  {additionalFeatureArticles[0].title}
                </h4>
                <div className="flex items-center text-xs text-gray-600 mb-3"> {/* Slightly darker meta text */}
                  <span>{additionalFeatureArticles[0].time} • {additionalFeatureArticles[0].read}</span>
                  {additionalFeatureArticles[0].xoutValue !== undefined && additionalFeatureArticles[0].xoutSymbol && (
                    <>
                      <span className="mx-2 text-gray-300">|</span>
                      <span className="font-medium">
                        <span className="text-gray-500">XOUT:</span>{' '}
                        <span className={additionalFeatureArticles[0].xoutValue >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {additionalFeatureArticles[0].xoutValue >= 0 ? '+' : ''}{additionalFeatureArticles[0].xoutValue.toFixed(2)}% {additionalFeatureArticles[0].xoutSymbol}
                        </span>
                      </span>
                    </>
                  )}
                </div>
                
                {additionalFeatureArticles[0].preview && (
                  <div 
                    className="relative mb-4" 
                    style={{
                      maxHeight: '4.5em',
                      overflow: 'hidden',
                     
                    }}
                  >
                    <p className="text-sm line-clamp-3 text-gray-600 leading-[1.2] font-regular">
                      {additionalFeatureArticles[0].preview}
                    </p>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 mt-auto pt-3">
                  {additionalFeatureArticles[0].tags.map(tag => (
                    <span key={tag} className="bg-slate-100 border border-slate-200 text-gray-700 px-3 py-1 text-xs font-medium rounded-full"> {/* Lighter border, slightly adjusted text color */}
                      {tag}
                    </span>
                  ))}
                  {/* <span className="text-xs font-medium text-blue-600 ml-auto group-hover:underline flex items-center">
                    Read more
                    <ChevronRight size={12} className="ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                  </span> */}
                </div>
               
              </div>
              <div className="bottom-0 left-0 right-0 z-20 -mt-1">
                <Progress 
                  value={progress} 
                  className="h-1 w-full bg-black/20" 
                  aria-label="Time until next article rotation" 
                />
              </div>
              
            </Link>
            
          </motion.div>

          {/* Remaining two articles */}
          {additionalFeatureArticles.slice(2, 4).map((article, index) => (
            <motion.div
              key={`feature-${article.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.4,
                delay: (index + 1) * 0.1,
                ease: "easeOut" 
              }}
              className="md:col-span-2 flex-grow flex-shrink-0"
            >
              <Link
                to={`/article/${article.id}`}
                className="block h-full transition-colors duration-200 group" // Removed hover:bg-gray-50
              >
                <div className="flex flex-col h-full p-6 py-8 ">
                  {/* Image Container */}
                  <div className="relative overflow-hidden">
                    <img 
                      src={article.imageUrl || '/placeholder.jpg'} 
                      alt="" 
                      className="w-full h-48 object-cover transition-transform duration-500"
                    />
                    {/* Removed overlay */}
                  </div>
                  <p className="text-[10px] text-gray-600 mt-1 mb-2 text-right pr-1">BAIMX Media</p> {/* Added caption */}

                  <h4 className="text-2xl font-bold mb-3 text-gray-900 line-clamp-3 group-hover:text-gray-500 leading-[1.05] transition-colors duration-200">{article.title}</h4> {/* Reverted hover to gray-500 */}
                  <div className="flex items-center text-xs text-gray-600 mb-2"> {/* Slightly darker meta text */}
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
                  
                  {/* Tags rendered above the bottom content for both cards */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {article.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="bg-slate-100 border border-slate-200 text-gray-700 px-3 py-1 text-xs font-medium rounded-full"> {/* Lighter border, slightly adjusted text color */}
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Conditional bottom content */}
                  {index === 0 && ( // For the FIRST of the two articles (Opinion Box)
                    <div className="mt-auto pt-8">
                      <div className="p-3 bg-white border border-slate-300 rounded-md hover:border-slate-300 hover:bg-gray-50 transition-all duration-200 group cursor-pointer">
                        <h5 className="text-xs font-light text-gray-700 mb-2 border-b border-gray-200 pb-2">Opinion</h5>
                        <div className="flex items-center mb-2">
                          <img
                            src="/face.webp" // Placeholder image
                            alt="Author"
                            className="w-6 h-6 rounded-full mr-2 object-cover border border-gray-300"
                          />
                          <span className="text-xs font-medium text-gray-700">Matthew Bailet</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-700 hover:text-black leading-[1.1] transition-colors mb-3">
                          Here's why bitcoin is potentially poised for a 100% rally
                        </p>
                        {/* BTC MiniTokenChart integration */}
                        <div className="h-[100px] w-full my-0"> {/* Container for the chart, adjust height as needed */}
                          {btcChartData && !btcChartError && (
                            <MiniTokenChartLight // Changed to MiniTokenChartLight
                              symbol="BTC"
                              chartOption={btcChartData.option}
                              percentageChange={btcChartData.percentageChange}
                              price={btcChartData.price}
                              error={null}
                            />
                          )}
                          {btcChartError && (
                            <div className="flex items-center justify-center h-full text-xs text-red-500">
                              BTC Chart: {btcChartError}
                            </div>
                          )}
                          {!btcChartData && !btcChartError && (
                            <div className="flex items-center justify-center h-full text-xs text-gray-400">
                              Loading BTC Chart...
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {index === 1 && ( // For the SECOND of the two articles (existing related links)
                    <div className="mt-auto pt-4"> 
                      <div className="pt-3 border-t border-gray-300">  {/* Lighter border */}
                        <div>
                          
                          <a href="#" className="block font-medium leading-[1.1] py-1 text-md text-gray-900 hover:text-gray-500"> {/* Reverted hover to gray-500 */}
                            Bitcoin's Price Is Falling, but the Bulls Are Still Bullish
                          </a>
                          
                          <a href="#" className="block py-1 text-md leading-[1.1] font-medium text-gray-900 hover:text-gray-500 border-t border-gray-200 mt-1.5 pt-1.5"> {/* Reverted hover to gray-500 */}
                            What's Next on Russia Sanctions If Putin Balks at Ceasefire Call
                          </a>

                          <a href="#" className="block py-1 text-md leading-[1.1] font-medium text-gray-900 hover:text-gray-500 border-t border-gray-200 mt-1.5 pt-1.5"> {/* Reverted hover to gray-500 */}
                            What's Next on Russia Sanctions If Putin Balks at Ceasefire Call
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* --- NEW: Top Stories / Latest Section --- */}
      <div className=" grid grid-cols-1 md:grid-cols-4  bg-white border-b border-gray-300 "> {/* Lighter bottom border */}

        {/* Left Column: Top Stories (3/4) */}
        <div className="md:col-span-3  border-r border-gray-300"> {/* Lighter right border */}
          {/* Structured Header */}
          
          
          {/* NEW: Featured Story Row - Using Static Data (not affected by article cycling) */}
          <div className="grid grid-cols-1  md:grid-cols-5 gap-0 mb-6 border-b border-gray-300 "> {/* Lighter bottom border */}
            {/* First Featured Story - Static */}
            <div className="md:col-span-2 border-r border-gray-300 p-6 pt-8"> {/* Lighter right border */}
              <Link to="/article/static-1" className="group">
                {/* Image Container */}
                <div className="relative  overflow-hidden">
                  <img 
                    src="/SBF-Books-Culture-1245966892.webp"
                    alt="" 
                    className="w-full h-56 object-cover transition-transform duration-500"
                  />
                  {/* Removed overlay */}
                </div>
                <p className="text-[10px] text-gray-600 mt-1 mb-2 text-right pr-1">BAIMX Media</p> {/* Added caption */}
                
                {/* Title */}
                <h3 className="text-2xl font-bold leading-[1.05] mb-1 text-gray-900 group-hover:text-gray-500 transition-colors duration-200"> {/* Reverted hover to gray-500 */}
                  Shock Embassy Escape Shows Cracks in Maduro's Security Apparatus
                </h3>
                
                {/* Meta info */}
                <div className="flex items-center text-xs text-gray-600 mb-2"> {/* Slightly darker meta text */}
                  <span>2h ago • 5 min read</span>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-1 mb-8">
                  <span className="bg-slate-100 border border-slate-200 text-gray-700 px-3 py-1 text-xs font-medium rounded-full"> {/* Lighter border, slightly adjusted text color */}
                    Politics
                  </span>
                  <span className="bg-slate-100 border border-slate-200 text-gray-700 px-3 py-1 text-xs font-medium rounded-full"> {/* Lighter border, slightly adjusted text color */}
                    Venezuela
                  </span>
                </div>
              </Link>
              <div className="mt-auto pt-4"> 
                      <div className="pt-3 border-t border-gray-300">  {/* Lighter border */}
                        <div>
                          <a href="#" className="block font-medium leading-[1.1] py-1 text-md text-gray-900 hover:text-gray-500"> {/* Reverted hover to gray-500 */}
                            Putin Offers Talks With Ukraine on May 15 But Skirts Truce
                          </a>
                          
                          <a href="#" className="block py-1 text-md leading-[1.1] font-medium text-gray-900 hover:text-gray-500 border-t border-gray-200 mt-1.5 pt-1.5"> {/* Reverted hover to gray-500 */}
                            What's Next on Russia Sanctions If Putin Balks at Ceasefire Call
                          </a>
                        </div>
                      </div>
                    </div>
            </div>

            {/* Second Featured Story - Static */}
            <div className="md:col-span-3 p-8 px-6 ">
              <Link to="/article/static-2" className="group">
                {/* Image Container */}
                <div className="relative overflow-hidden">
                  <img 
                    src="/Oil.png"
                    alt="" 
                    className="w-full h-78 object-cover transition-transform duration-500"
                  />
                  {/* Removed overlay */}
                </div>
                <p className="text-[10px] text-gray-600 mt-1 mb-2 text-right pr-1">BAIMX Media</p> {/* Added caption */}
                
                {/* Title */}
                <h3 className="text-3xl font-bold leading-[1.05] mb-1 text-gray-900 group-hover:text-gray-500 transition-colors duration-200"> {/* Reverted hover to gray-500 */}
                  Trump's Cabinet Defends Effort to Save Signal Chat Records
                </h3>
                
                {/* Meta info */}
                <div className="flex items-center text-xs text-gray-600 mb-2"> {/* Slightly darker meta text */}
                  <span>3h ago • 7 min read</span>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="bg-slate-100 border border-slate-200 text-gray-700 px-3 py-1 text-xs font-medium rounded-full"> {/* Lighter border, slightly adjusted text color */}
                    Politics
                  </span>
                  <span className="bg-slate-100 border border-slate-200 text-gray-700 px-3 py-1 text-xs font-medium rounded-full"> {/* Lighter border, slightly adjusted text color */}
                    US
                  </span>
                </div>
              </Link>
            </div>
          </div>


              {/* LONG STORY - Static - Modified for consistency */}
          <Link to="/article/static-border-strife" className="group flex flex-row w-full border-b border-gray-300 pb-6 px-6 pt-2  transition-colors duration-150"> {/* Lighter bottom border */}
            {/* Image Container and Caption */}
            <div className="flex-shrink-0 w-92 mr-6">
              <img src="/channel.png" alt="Border strife in India" className="w-full h-52 object-cover" />
              <p className="text-[10px] text-gray-600 mt-1 text-right">BAIMX Media</p> {/* Added caption */}
            </div>
            {/* Text Content Container */}
            <div className="flex-grow flex flex-col">
              {/* Title */}
              <h2 className="text-3xl font-semibold mb-2 text-black group-hover:text-gray-500 transition-colors duration-200 pb-0 leading-[1] max-w-[430px]"> {/* Reverted hover to gray-500 */}
                Border Strife Triggers Food Hoarding, Canceled Trips in India
              </h2>
              {/* Meta Info */}
              <div className="flex items-center text-xs text-gray-600 mb-3"> {/* Slightly darker meta text */}
                <span>4h ago • 6 min read</span> {/* Added placeholder meta info */}
              </div>
              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 ">
                <span className="bg-slate-100 border border-slate-200 text-gray-700 px-3 py-1 text-xs font-medium rounded-full"> {/* Lighter border, slightly adjusted text color */}
                  Politics {/* Added placeholder tag */}
                </span>
                <span className="bg-slate-100 border border-slate-200 text-gray-700 px-3 py-1 text-xs font-medium rounded-full"> {/* Lighter border, slightly adjusted text color */}
                  India {/* Added placeholder tag */}
                </span>
                 <span className="bg-slate-100 border border-slate-200 text-gray-700 px-3 py-1 text-xs font-medium rounded-full"> {/* Lighter border, slightly adjusted text color */}
                  Geopolitics {/* Added placeholder tag */}
                </span>
              </div>
            </div>
          </Link>
          
          {/* Regular Stories Grid - Static - Changed to 3x2 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-6 py-6"> {/* Changed to sm:grid-cols-3 and adjusted gap */}
            {/* Using slice(2, 8) for static content from initialArticles */}
            {initialArticles.slice(2, 8).map((article) => ( // Changed source to initialArticles
              <Link key={`top-${article.id}`} to={`/article/${article.id}`} className="group flex flex-col transition-colors duration-150 py-1"> {/* Changed to flex-col */}
                {/* Image - Full width, fixed height & Caption */}
                <div>
                  <div className="flex-shrink-0 w-full h-44"> {/* Removed mb-3 from here */}
                    {article.imageUrl ? (
                      <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-500 text-xs">No Image</div>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-600 mt-1 mb-2 text-right pr-1">BAIMX Media</p> {/* Added caption & mb-2 */}
                </div>
                {/* Content - Moved below image */}
                <div className="flex-grow flex flex-col">
                  <h4 className="text-lg font-bold line-clamp-2 text-gray-900 mb-1 group-hover:text-gray-500 transition-colors duration-200 leading-[1]"> {/* Reverted hover to gray-500 */}
                    {article.title}
                  </h4>
                   {/* Meta Info */}
                   <p className="text-xs text-gray-600 mb-1"> {/* Slightly darker meta text */}
                    {article.time} • {article.read}
                  </p>
                   {/* Tags - Ensured placement and style */}
                   {article.tags.length > 0 && (
                       <div className="flex flex-wrap gap-1 mt-auto pt-1"> {/* Added mt-auto and pt-1 */}
                           {article.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="bg-slate-100 border border-slate-200 text-gray-700 px-3 py-1 text-xs font-medium rounded-full"> {/* Lighter border, slightly adjusted text color */}
                                {tag}
                              </span>
                           ))}
                       </div>
                   )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column: Latest (1/4) */}
        <div className="md:col-span-1  pt-8">
           {/* Structured Header */}
           <h2 className="text-lg font-bold flex items-center mb-0 text-gray-900  border-b border-gray-400 pb-4"> {/* Darker text, lighter border */}
              <span className="pl-3">Latest</span>
           </h2>
           {/* Static Latest Articles - No cycling - Now uses articlesForLatestList */}
          <div className="overflow-y-auto custom-scrollbar  mr-0 space-y-1 bg-white max-h-116 border-b border-gray-300">
            {/* Using static content from articlesForLatestList */}
            {articlesForLatestList.map((article, index) => (
              <Link 
                key={`latest-${article.id}-${index}`} // Added index to key for uniqueness
                to={`/article/${article.id}`} 
                className="block px-3 py-2 border-b border-gray-200 hover:bg-gray-50/70 transition-colors duration-150 group"
              >
                <div className="flex items-start space-x-3"> {/* items-start for vertical alignment if title wraps */}
                  <span className="text-xs text-gray-500 w-14 flex-shrink-0 pt-0.5 whitespace-nowrap"> {/* Time ago, pt to align with first line of title */}
                    {article.time}
                  </span>
                  <h5 className="text-sm font-semibold text-gray-800 group-hover:text-gray-500 line-clamp-3 leading-tight transition-colors duration-200 flex-grow">
                    {article.title}
                  </h5>
                </div>
              </Link>
            ))}
          </div>
          {/* --- Newsletter Section Start --- */}
          <div className=" pt-4 border-b border-gray-300">
            <h2 className="text-2xl px-3 mt-2 font-bold text-gray-900 mb-2 dm-serif-text-regular border-b border-gray-400 pb-2">
                Newsletters
            </h2>
            {/* Frequency Selectors */}
            <div className="flex space-x-3 px-3 mb-4  pb-2">
              {(['Hourly', 'Daily', 'Weekly'] as NewsletterFrequency[]).map(freq => (
                <button
                  key={freq}
                  onClick={() => setActiveNewsletterFrequency(freq)}
                  className={`text-xs font-medium pb-1 transition-colors duration-150 
                              ${activeNewsletterFrequency === freq 
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-800'}`}
                >
                  {freq}
                </button>
              ))}
            </div>

            {/* Newsletter Items with Animation */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeNewsletterFrequency} // Ensures AnimatePresence detects change
                initial={{ opacity: 0, x: 20, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.98 }}
                transition={{
                  type: "spring",
                  duration: 0.4, // Slightly faster than header for smaller content
                  bounce: 0.1,
                  opacity: { duration: 0.2 },
                  scale: { duration: 0.2 }
                }}
                className="space-y-4 mb-5 px-3"
              >
                {filteredNewsletters.length > 0 ? filteredNewsletters.map(nl => (
                  <div key={nl.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-20 h-20 bg-gray-100 border border-gray-200 overflow-hidden">
                      {nl.imageSrc ? (
                        <img src={nl.imageSrc} alt={nl.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-500 text-[10px] p-1 text-center">No Image</div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-sm font-semibold text-gray-900 mb-0.5 leading-tight">{nl.title}</h4>
                      <p className="text-xs text-gray-600 mb-1 leading-snug line-clamp-2">{nl.description}</p>
                      <a 
                        href={nl.previewLink} 
                        className="text-xs text-blue-600 hover:text-blue-700 underline font-medium"
                      >
                        Preview
                      </a>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-gray-500 px-3">No newsletters for this frequency.</p> // Added px-3 for consistency
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Subscribe Section */}
          <div className="px-3 pt-3 pb-5 bg-slate-50 border-b border-gray-300">
            <button className="w-full flex items-center justify-center bg-black hover:bg-slate-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors duration-150 mb-2">
              <LockIcon size={14} className="mr-2" />
              Subscribe
            </button>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              By continuing, you agree that BAIMX may send you news and offers relating to BAIMX products and services. 
              You also acknowledge the <a href="#" className="underline hover:text-gray-700">Privacy Policy</a> and agree to the <a href="#" className="underline hover:text-gray-700">Terms of Service</a>.
            </p>
          </div>
          {/* --- Newsletter Section End --- */}

          

        </div>
      </div>
      {/* --- END: Top Stories / Latest Section --- */}
      <div className="">
      <PricesMainView />
      <TLDRSection />



      <div className="border-y border-gray-400">
      <BAIMXDataSection /> {/* Add the new section here */}
      </div>

      
      </div>

    </section>
  );
};

// --- Recent Section with Article Grid ---
export const RecentSection: React.FC = () => {
  const recentArticles = [...initialArticles];
  
  // Keep the logic to add articles up to 9
  while (recentArticles.length < 9) {
    const index = recentArticles.length;
    let placeholderArticle: Article = {
      id: Math.random() * 1000 + 10,
      title: 'Placeholder Title',
      time: `${index * 5 + 10}m ago`,
      read: '3 min read',
      tags: ['Placeholder', 'Tag'],
      imageUrl: '/placeholder-generic.jpg', 
      preview: 'This is placeholder preview text for an article to fill the grid layout dynamically.'
    };

    // Add some variety based on index (simplified)
    if (index === 4) {
      placeholderArticle = {
        ...placeholderArticle, title: 'New DeFi Protocol Sees Record TVL Growth', tags: ['DeFi', 'Growth', 'Protocol'], imageUrl: '/placeholder-defi.jpg', 
        preview: 'Innovative yield farming strategies attract significant capital.' 
      };
    } else if (index === 5) {
       placeholderArticle = {
        ...placeholderArticle, title: 'Blockchain Conference Features Innovators', tags: ['Conference', 'Innovation', 'Industry'], imageUrl: '/placeholder-conference.jpg',
        preview: 'Experts gather to discuss the future of blockchain technology.'
      };
    } else if (index === 6) {
       placeholderArticle = {
        ...placeholderArticle, title: 'Regulatory Uncertainty Clouds Crypto Outlook', tags: ['Regulation', 'Market', 'Uncertainty'], imageUrl: '/placeholder-regulation.jpg',
        preview: 'Key global regulators signal potential new rules for digital assets.'
      };
    } else if (index === 7) {
       placeholderArticle = {
        ...placeholderArticle, title: 'Layer 2 Scaling Solutions Gain Momentum', tags: ['Layer 2', 'Scaling', 'ETH'], imageUrl: '/placeholder-layer2.jpg',
        preview: 'Adoption rates accelerate as users seek lower fees.'
      };
    } else if (index === 8) {
      placeholderArticle = {
        ...placeholderArticle, title: 'NFT Market Shows Signs of Stabilization', tags: ['NFT', 'Market', 'Trends'], imageUrl: '/placeholder-nft.jpg',
        preview: 'Certain blue-chip NFT collections hold their value.'
      };
    }
    
    recentArticles.push(placeholderArticle);
  }

  // Enhanced helper function for grid item classes (MD screens and up)
  const getGridItemClasses = (index: number): string => {
    // Define a specific pattern for our 9 items with both column and row spanning
    switch(index) {
      case 0: // Tall skinny item (now left side)
        return 'md:col-span-1 md:row-span-2 h-[500px]';
      case 1: // Large featured item (now right side)
        return 'md:col-span-2 md:row-span-2 h-[500px]'; 
      case 2: // Normal item
        return 'md:col-span-1 md:row-span-1 h-[240px]';
      case 3: // Normal item
        return 'md:col-span-1 md:row-span-1 h-[240px]';
      case 4: // Wide item 
        return 'md:col-span-2 md:row-span-1 h-[240px]';
      case 5: // Normal item
        return 'md:col-span-1 md:row-span-1 h-[240px]'; 
      case 6: // Tall item
        return 'md:col-span-1 md:row-span-2 h-[500px]';
      case 7: // Wide item
        return 'md:col-span-2 md:row-span-1 h-[240px]';
      case 8: // Normal item
        return 'md:col-span-1 md:row-span-1 h-[240px]';
      default:
        return 'md:col-span-1 md:row-span-1 h-[240px]';
    }
  };

  return (
      <section className="container mx-auto my-12 max-w-[77rem]">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold pb-0 flex items-center justify-between w-full">
          <span className="border-l-4 border-blue-600 pl-3">Recent Articles</span>
          <span className="text-sm font-normal text-gray-500 mr-auto ml-4">Latest market movements and analysis</span>
          <Link 
            to="/recent" 
            className="group text-sm border border-slate-300 font-medium text-gray-800 hover:text-black/80 hover:underline transition-colors flex items-center bg-slate-100 px-3 py-1 rounded-full"
          >
            View all
            <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </h2>
        
      </div>

      {/* Grid with explicit sizing */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        {recentArticles.map((article, index) => {
          const gridClasses = getGridItemClasses(index);
          const isLarge = index === 1; // Featured item
          const isWide = [4, 7].includes(index); // Wide items
          const isTall = [0, 6].includes(index); // Tall items
          
          return (
            <Link 
              key={article.id}
              to={`/article/${article.id}`}
              className={`block relative overflow-hidden group transition-all duration-300 bg-white border border-gray-400 shadow-sm ${gridClasses}`} // Removed hover:shadow-lg
            >
              <div className="absolute inset-0">
                {article.imageUrl ? (
                  <img 
                    src={article.imageUrl} 
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-300" 
                  />
                ) : (
                  <div className="absolute inset-0 bg-gray-200 rounded"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 rounded-md"></div>
              </div>
              
              {/* Category tag in top left - REMOVED */}
              
              {/* Time in top right */}
              <div className="absolute top-3 right-3 z-10">
                <span className="text-[10px] text-white/90 backdrop-blur-sm font-medium">
                  {article.time} • {article.read}
                </span>
              </div>
              
              {/* Content at bottom */}
              <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end p-4">
                <div className="text-white">
                  <h3 className={`${isLarge ? 'text-xl' : 'text-lg'} font-semibold mb-2 line-clamp-3 leading-tight transition-colors duration-200 group-hover:text-gray-400`}> {/* Changed hover to gray-400 for white text */}
                    {article.title}
                  </h3>
                  
                  {(isLarge || isWide || isTall) && article.preview && (
                    <div className="relative mb-3">
                      <p className={`${isLarge ? 'text-sm' : 'text-xs'} text-gray-100 line-clamp-2 leading-snug`}>
                        {article.preview}
                      </p>
                    </div>
                  )}
                  
                  {/* Tags - MOVED and RESTYLED */}
                  <div className="flex flex-wrap gap-1.5 mt-1 mb-1"> {/* Adjusted margin */}
                      {article.tags.map(tag => (
                        <span key={tag} className="bg-slate-700/70 border border-slate-500 text-slate-100 px-3 py-1 text-[10px] font-medium rounded-full backdrop-blur-sm">
                          {tag}
                        </span>
                      ))}
                    </div>

                  {/* Bottom row - potentially empty now */}
                  <div className="flex items-center justify-between mt-auto">
                    {/* <span className="text-blue-300 text-xs font-medium opacity-0 group-hover:opacity-100 group-hover:underline transition-opacity flex items-center">
                      Read <ChevronRight className="w-3 h-3 ml-0.5" />
                    </span> */}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

// New HomePage component
export const HomePage: React.FC = () => {
  const [showAllSections, setShowAllSections] = useState(false);

  return (
    <>
      <HeaderSection />
      {/* <div className="container mx-auto max-w-[77rem]">
        <AdSpace />
      </div> */}
     
      <FeaturedSection />
 


      <CTERMINALAD />

      {/* Crypto Sections */}
      <div className="container mx-auto max-w-[77rem]">
        <BTCSection />
        <ETHSection />
        <XRPSection />
        <SOLSection />
        <SpeculativeSection />
        
        {/* Real-time Prices */}
       
        
        {/* Load More Button */}
        
      </div>
    </>
  );
};

// Footer Component (Updated)
const Footer: React.FC = () => (
  <div className="bg-slate-950/95 text-white">
    <div className="container mx-auto max-w-[77rem] py-8 px-4">
      {/* Logo Section */}
      <div className="mb-6">
        <img src="/logoBAIMXFinal.png" alt="BAIMX Logo" className="h-12 w-auto" />
      </div>
      
      {/* Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <h3 className="font-medium mb-4">Home</h3>
          <ul className="space-y-2">
            <li><a href="#" className="text-gray-400 hover:text-gray-200 text-sm">Live Feed</a></li>
            <li><a href="#" className="text-gray-400 hover:text-gray-200 text-sm">BAIMX+</a></li>
            <li><a href="#" className="text-gray-400 hover:text-gray-200 text-sm">Market Data</a></li>
            <li><a href="#" className="text-gray-400 hover:text-gray-200 text-sm">Opinion</a></li>
            <li><a href="#" className="text-gray-400 hover:text-gray-200 text-sm">Audio</a></li>
            <li><a href="#" className="text-gray-400 hover:text-gray-200 text-sm">Originals</a></li>
            <li><a href="#" className="text-gray-400 hover:text-gray-200 text-sm">Magazine</a></li>
            <li><a href="#" className="text-gray-400 hover:text-gray-200 text-sm">Events</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-medium mb-4">News</h3>
          <ul className="space-y-2">
            <li><a href="#" className="text-gray-400 hover:text-gray-200 text-sm">Markets</a></li>
            <li><a href="#" className="text-gray-400 hover:text-gray-200 text-sm">Economics</a></li>
            <li><a href="#" className="text-gray-400 hover:text-gray-200 text-sm">Technology</a></li>
            <li><a href="#" className="text-gray-400 hover:text-gray-200 text-sm">Regulation</a></li>
            <li><a href="#" className="text-gray-400 hover:text-gray-200 text-sm">Politics</a></li>
            <li><a href="#" className="text-gray-400 hover:text-gray-200 text-sm">DeFi</a></li>
            <li><a href="#" className="text-gray-400 hover:text-gray-200 text-sm">Crypto</a></li>
            <li><a href="#" className="text-gray-400 hover:text-gray-200 text-sm">AI</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-medium mb-4">Tokens & Assets</h3>
          <ul className="space-y-2">
            <li><a href="#" className="text-gray-400 hover:text-gray-200 text-sm">Wealth</a></li>
            <li><a href="#" className="text-gray-400 hover:text-gray-200 text-sm">Research</a></li>
            <li><a href="#" className="text-gray-400 hover:text-gray-200 text-sm">Businessweek</a></li>
            <li><a href="#" className="text-gray-400 hover:text-gray-200 text-sm">CityLab</a></li>
            <li><a href="#" className="text-gray-400 hover:text-gray-200 text-sm">Sports</a></li>
            <li><a href="#" className="text-gray-400 hover:text-gray-200 text-sm">Equality</a></li>
            <li><a href="#" className="text-gray-400 hover:text-gray-200 text-sm">Management</a></li>
            <li><a href="#" className="text-gray-400 hover:text-gray-200 text-sm">Trading</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-medium mb-4">Explore</h3>
          <ul className="space-y-2">
            <li><a href="#" className="text-gray-400 hover:text-gray-200 text-sm">Newsletters</a></li>
            <li><a href="#" className="text-gray-400 hover:text-gray-200 text-sm">Explainers</a></li>
            <li><a href="#" className="text-gray-400 hover:text-gray-200 text-sm">News Quiz</a></li>
            <li><a href="#" className="text-gray-400 hover:text-gray-200 text-sm">The Big Take</a></li>
            <li><a href="#" className="text-gray-400 hover:text-gray-200 text-sm">Graphics</a></li>
            <li><a href="#" className="text-gray-400 hover:text-gray-200 text-sm">Submit a Tip</a></li>
            <li><a href="#" className="text-gray-400 hover:text-gray-200 text-sm">Economic Calendar</a></li>
            <li><a href="#" className="text-gray-400 hover:text-gray-200 text-sm">About Us</a></li>
          </ul>
        </div>
      </div>
      
      {/* Bottom Links */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 border-t border-gray-800 pt-6">
        <div className="flex flex-wrap gap-4 mb-4 md:mb-0">
          <a href="#" className="text-gray-400 hover:text-gray-200 text-sm">Terms of Service</a>
          <a href="#" className="text-gray-400 hover:text-gray-200 text-sm">Manage Cookies</a>
          <a href="#" className="text-gray-400 hover:text-gray-200 text-sm">Trademarks</a>
          <a href="#" className="text-gray-400 hover:text-gray-200 text-sm">Privacy Policy</a>
        </div>
        <div className="flex flex-wrap gap-4 md:justify-end">
          <a href="#" className="text-gray-400 hover:text-gray-200 text-sm">Careers</a>
          <a href="#" className="text-gray-400 hover:text-gray-200 text-sm">Made in SF</a>
          <a href="#" className="text-gray-400 hover:text-gray-200 text-sm">Advertise</a>
          <a href="#" className="text-gray-400 hover:text-gray-200 text-sm">Ad Choices</a>
          <a href="#" className="text-gray-400 hover:text-gray-200 text-sm">Help</a>
        </div>
      </div>
      
      {/* Copyright */}
      <div className="mt-6 text-gray-400 text-sm">
        ©2025 BAIMX LP. All Rights Reserved.
      </div>
    </div>
  </div>
);

// Main Layout Component - Update to use the new Footer
const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <StickyHeader />
      <main className="flex-grow bg-white">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

// App component now just renders the Layout
const App: React.FC = () => {
  return <Layout />;
};

export default App;

// --- Add Back Missing Components ---
export const AdSpace: React.FC = () => (
  <section className="container border-x border-gray-400 mx-auto h-80 bg-white flex items-center justify-center text-gray-500 max-w-[77rem]">
    <div className="container text-sm border border-gray-400 mx-auto my-12 h-50 bg-slate-100 flex items-center justify-center text-gray-600 max-w-[67rem]">

    Advertisement
    </div>
    

  </section>
);

export const CTERMINALAD: React.FC = () => (
  <section className="container border border-gray-400 mx-auto my-4 h-[20rem] max-w-[77rem] flex"> {/* Increased height */}
    {/* Left side - Black */}
    <div className="flex-1 bg-white border border-gray-400 flex items-center justify-center text-gray-300 p-4">
      {/* Keep left content simple for now */}
      <div className="text-center">
          <h3 className="text-4xl font-semibold mina-bold tracking-tight text-slate-800  mb-1"><span className="text-blue-500">C</span>Terminal</h3>
          <p className="text-sm text-gray-900 mina-regular">Industry-Beating Speed.</p>
      </div>
    </div>

    {/* Right side - Animated Feed Scene */}
    {/* Adjusted perspective */}
    <div className="flex-1 bg-slate-50 flex border-r border-b border-t border-gray-400 items-center justify-center text-gray-500  relative group overflow-hidden p-12 shadow-md hover:shadow-lg transition-all duration-500 ease-in-out hover:bg-gradient-to-br hover:from-blue-50/70 hover:via-white hover:to-transparent" style={{ perspective: '1800px' }}>
        {/* Isometric Wrapper - Adjusted transforms */}
        <div style={{ transform: 'rotateX(45deg) rotateZ(45deg) translateY(-35%)', transformStyle: 'preserve-3d' }} className="w-[80%] scale-[1.3] h-[100%] relative transition-transform duration-500 ease-in-out group-hover:scale-[1.44]">
           {/* Optional: Subtle background grid or texture */}
           <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-slate-100 opacity-0 rounded-lg shadow-inner" style={{ transform: 'translateZ(-40px)' }}></div>

           {/* Feed Rows Container - Positioned absolutely to center */}
           <div className="absolute inset-0 flex flex-col justify-center items-center space-y-2 p-4" style={{ transform: 'translateZ(0px)' }}>
             {/* Main Content Area: Feed Rows + Chart */}
             {/* Changed to flex-col, items-center */}
             <div className="relative flex flex-col  gap-5 p-0 h-full" style={{ transform: 'translateZ(0px)' }}>

               {/* Chart Container (Now Top) */}
               {/* Added transform: rotateY, margin-bottom, w-full */}
               <div className="w-full h-auto flex flex-col pt-0 mb-8" style={{ transform: 'rotateY(-00deg)' }}>
                 {/* Instantiate MiniTokenChartLight with Static Data */}
                 {/* Use user-specified width w-48 */}
                 <div className="rounded flex flex-col w-48 h-full shadow-lg transform scale-100 shadow-black/20 shadow-lg"
                    style={{ transform: 'rotateX(0deg) rotateY(0deg) rotateZ(-90deg)', transformStyle: 'preserve-3d' }}>
                   <MiniTokenChartLight
                     symbol="BTC" 
                     chartOption={{ // Original static chart option (as component handles theme)
                       grid: { top: 0, bottom: 0, left: 0, right: 0 },
                       xAxis: { type: 'category', show: false, data: [1, 2, 3, 4, 5, 6, 7] },
                       yAxis: { type: 'value', show: false, scale: true },
                       series: [{
                         data: [70000, 70100, 70050, 70300, 70200, 70500, 70450],
                         type: 'line', smooth: true, symbol: 'none',
                         lineStyle: { color: '#22c55e', width: 1.5 },
                         areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#22c55e' + '66'}, { offset: 1, color: '#22c55e' + '05'}] } }
                       }],
                       tooltip: { trigger: 'axis', formatter: '${c0}', axisPointer: { type: 'none' }, backgroundColor: 'rgba(30, 30, 30, 0.7)', borderColor: '#555', borderWidth: 1, textStyle: { color: '#eee', fontSize: 10 }, position: function (pos: number[], params: any, dom: any, rect: any, size: { contentSize: number[] }) { return [pos[0] - size.contentSize[0] / 2, -size.contentSize[1] - 5]; }, extraCssText: 'padding: 2px 5px; pointer-events: none;' }
                     }}
                     error={null}
                     percentageChange={1.23} // Sample percentage change
                     volume24h="$50.5B" // Sample volume
                     price={70450.00} // Sample price
                   />
                   
                 </div>
               </div>

               {/* Feed Rows Container (Now Bottom) */}
               {/* Changed width to w-full */}
               <div className="flex flex-col justify-center items-center space-y-3 w-full h-full">
                 {/* Row 1 */}
                 <div className="w-96 h-24 bg-white rounded-md shadow-md border border-gray-400/80 flex items-center justify-start px-4 text-xs text-gray-400 opacity-90 transform transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-lg">
                   {/* Placeholder - No text yet */}
                   <p>test</p>
                 </div>
                 {/* Row 2 */}
                 <div className="w-full h-24 bg-white rounded-md shadow-md border border-gray-400/80 flex items-center justify-start px-4 text-xs text-gray-400 opacity-90 transform transition-all duration-300 ease-out delay-75 group-hover:translate-y-0 group-hover:shadow-lg">
                   {/* Placeholder - No text yet */}
                 </div>
                 {/* Row 3 */}
                 <div className="w-full h-24 bg-white rounded-md shadow-md border border-gray-400/80 flex items-center justify-start px-4 text-xs text-gray-400 opacity-90 transform transition-all duration-300 ease-out delay-150 group-hover:translate-y-1 group-hover:shadow-lg">
                   {/* Placeholder - No text yet */}
                 </div>
               </div>

             </div>
           </div>
        </div>
       {/* Optional: Add some text/logo overlay */}
       <div className="absolute bottom-5 right-5 text-[10px] text-gray-400/80 group-hover:text-blue-600 transition-colors duration-300 font-medium tracking-wider">
         POWERED BY CTERMINAL
       </div>
    </div>
  </section>
);


// Add the CSS animation for the marquee effect in your index.css or a style tag
const marqueeStyles = `
  @keyframes marquee {
    0% { transform: translateX(0%); }
    100% { transform: translateX(-50%); } /* Translate by half since data is duplicated */
  }
  .animate-marquee {
    animation: marquee 60s linear infinite; /* Adjust duration as needed */
  }
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = marqueeStyles;
  document.head.appendChild(style);
}

// Add DM Serif Text font import
if (typeof document !== 'undefined') {
  const dmSerifStyle = document.createElement('style');
  dmSerifStyle.textContent = `@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Text:ital@0;1&display=swap');
  .dm-serif-text-regular { font-family: "DM Serif Text", serif; font-weight: 400; font-style: normal; }
  .dm-serif-text-regular-italic { font-family: "DM Serif Text", serif; font-weight: 400; font-style: italic; }`;
  document.head.appendChild(dmSerifStyle);
}

// Add CSS Keyframes for TickerBar
const tickerKeyframes = `
  @keyframes ticker-scroll {
    0% { transform: translateX(0%); }
    100% { transform: translateX(-${100 / 3}%); } /* Translate by 1/3 due to tripled data */
  }
  .ticker-scrolling {
    animation: ticker-scroll 100s linear infinite; /* Adjust duration as needed */
    will-change: transform; /* Added for performance optimization */
  }
`;

if (typeof document !== 'undefined') {
  const tickerStyle = document.createElement('style');
  tickerStyle.textContent = tickerKeyframes;
  document.head.appendChild(tickerStyle);
}

// Add CSS for ::selection pseudo-element
const selectionStyles = `
  ::selection {
    background-color: black;
    color: white; /* For better readability of selected text */
  }
  ::-moz-selection { /* Firefox */
    background-color: black;
    color: white;
  }
`;

if (typeof document !== 'undefined') {
  const selectionStyleTag = document.createElement('style');
  selectionStyleTag.textContent = selectionStyles;
  document.head.appendChild(selectionStyleTag);
}
