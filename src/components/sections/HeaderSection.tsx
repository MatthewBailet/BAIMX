import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'framer-motion';
import { ChevronUp, ChevronDown, CheckCheck, Filter, ChevronLeft, ChevronRight, Search as SearchIcon, X as XIcon, Mail, Lock, Eye, EyeOff, User, ArrowRight, Menu as MenuIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { MiniTokenChart } from '../MiniTokenChart';
import { LoadingCubes } from '../LoadingCubes';
import { coins, INITIAL_PRICES } from '../../App';

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

// Mock data for the Live Wire feed
const MOCK_LIVE_WIRE_DATA = [
  { 
    id: 1, 
    timestamp: '14s ago', 
    content: 'SEC announces regulation on Exchange Coinbase\'s order book', 
    relatedTokens: [{ symbol: 'BTC', direction: 'negative' }]
  },
  { 
    id: 2, 
    timestamp: '37s ago', 
    content: 'Analyst says Bitcoin could go as high as 250k in 2025 new outlook', 
    relatedTokens: [{ symbol: 'BTC', direction: 'positive' }]
  },
  { 
    id: 3, 
    timestamp: '1m ago', 
    content: 'Solana surpasses Ethereum in daily transaction volume for the first time', 
    relatedTokens: [{ symbol: 'SOL', direction: 'positive' }, { symbol: 'ETH', direction: 'negative' }]
  },
  { 
    id: 4, 
    timestamp: '3m ago', 
    content: 'WXYZ Protocol announces major partnership with payment processor', 
    relatedTokens: [{ symbol: 'WXYZ', direction: 'positive' }]
  },
  { 
    id: 5, 
    timestamp: '8m ago', 
    content: 'Trading volume spikes on Binance amid market volatility', 
    relatedTokens: [{ symbol: 'BNB', direction: 'neutral' }]
  },
  { 
    id: 6, 
    timestamp: '12m ago', 
    content: 'New DeFi protocol launches with innovative yield farming mechanism', 
    relatedTokens: [{ symbol: 'DEFI', direction: 'positive' }]
  },
  { 
    id: 7, 
    timestamp: '15m ago', 
    content: 'Ethereum gas fees hit monthly low as network activity decreases', 
    relatedTokens: [{ symbol: 'ETH', direction: 'negative' }]
  },
  { 
    id: 8, 
    timestamp: '20m ago', 
    content: 'Major institutional investor adds $50M in Bitcoin to portfolio', 
    relatedTokens: [{ symbol: 'BTC', direction: 'positive' }]
  }
];

// Sign-up Modal Component
const SignUpModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            ref={modalRef}
            className="bg-white w-full max-w-2xl overflow-hidden shadow-2xl"
            initial={{ scale: 0.95, y: -20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: -20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            {/* Modal Header */}
            <div className="relative px-6 py-4">
              <div className="absolute left-6 top-4">
                <img src="/logoBAIMXfullDark.png" alt="BAIMX Logo" className="h-7 w-auto" />
              </div>
              <h2 className="text-lg font-bold text-black text-center mx-auto mt-8">Sign in</h2>
              <button 
                onClick={onClose}
                className="absolute right-6 top-4 text-black hover:text-gray-700 transition-colors"
              >
                <XIcon size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 pt-0 text-center">
              <p className="text-xs text-gray-600 mb-6 max-w-[400px] mx-auto">
                By continuing, I agree that Bloomberg may send me news and offers
                relating to Bloomberg products. I also acknowledge the{' '}
                <a href="#" className="text-black underline hover:text-gray-700">Privacy Policy</a>
                {' '}
                and agree to the{' '}
                <a href="#" className="text-black underline hover:text-gray-700">Terms of Service</a>.
              </p>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-3 border border-gray-400 text-sm focus:outline-none focus:border-black mb-3"
                placeholder="Enter your email"
              />

              <button 
                className="w-full bg-gray-100 text-black py-3 px-4 font-medium hover:bg-gray-200 transition-colors text-sm border border-gray-300 mb-6"
              >
                Continue
              </button>

              <div className="relative flex items-center justify-center mb-6">
                <div className="border-t border-gray-300 absolute w-full"></div>
                <div className="bg-white px-2 relative text-sm text-gray-500">
                  or
                </div>
              </div>

              <div className="space-y-2 mb-6">
                {[ 
                  { icon: "/google-icon.png", text: "Continue with Google", alt: "Google" },
                  { icon: "/apple-icon.svg", text: "Continue with Apple", alt: "Apple" },
                  { text: "Continue with Phone number" } // Bloomberg Anywhere - no standard icon, using text
                ].map((item, index) => (
                  <button 
                    key={index}
                    className="w-96 mx-auto flex justify-center items-center py-2.5 px-4 border border-gray-400 text-sm font-medium text-black hover:bg-gray-50 transition-colors"
                  >
                    {item.icon && <img src={item.icon} alt={item.alt || ''} className="h-5 mr-2.5" />}
                    {item.text}
                  </button>
                ))}
              </div>

              <p className="text-sm text-gray-700 mb-2">
                Don't have an account? <a href="#" className="text-black font-medium hover:underline">Create one</a>
              </p>
              <p className="text-sm text-gray-700">
                <a href="#" className="text-black font-medium hover:underline">Need help?</a>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Helper function to format price for ticker display
const formatPriceTicker = (price: number): string => {
  if (price >= 1) {
    return `$${price.toFixed(2)}`;
  } else if (price >= 0.01) {
    return `$${price.toFixed(4)}`;
  } else {
    return `$${price.toFixed(6)}`;
  }
};

// Ticker-style component for mobile collapsed view - IDENTICAL to ticker bar
const MobileTickerItem: React.FC<{
  symbol: string;
  price: number;
  percentageChange: number;
  index: number;
}> = ({ symbol, price, percentageChange, index }) => {
  const isPositive = percentageChange >= 0;
  
  return (
    <motion.div
      key={symbol}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.08,
        ease: [0.2, 0.65, 0.3, 0.9]
      }}
      className="inline-flex items-center mx-1 mt-2 px-2 flex-shrink-0 bg-gray-900 rounded-md border border-gray-700 py-2 px-2 cursor-default"
      style={{
        transition: 'font-size 0.2s ease-in-out',
      }}
    >
      <span className="font-medium mr-1.5 text-gray-100 text-xs">
        {symbol.toUpperCase()}
      </span>
      {isPositive ? (
        <TrendingUp
          size={12}
          className="mr-0.5 text-green-500 transition-all"
        />
      ) : (
        <TrendingDown
          size={12}
          className="mr-0.5 text-red-500 transition-all"
        />
      )}
      <span className="mr-1 text-gray-200 text-xs">
        {formatPriceTicker(price)}
      </span>
      <span className={`${isPositive ? 'text-green-500' : 'text-red-500'} text-xs`}>
        {isPositive ? '+' : ''}{percentageChange.toFixed(2)}%
      </span>
    </motion.div>
  );
};

export const StickyHeader: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const stickySearchInputRef = useRef<HTMLInputElement>(null); // Added ref for sticky search input

  useEffect(() => {
    const handleScroll = () => {
      // Get the bottom of the Today's Picks section
      const picksSection = document.querySelector('.bg-slate-800.overflow-hidden'); // This selector might need to be more robust
      if (picksSection) {
        const picksSectionBottom = picksSection.getBoundingClientRect().bottom;
        setIsVisible(picksSectionBottom < 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Effect for sticky search keyboard shortcut ---
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/' && isVisible) { // Only if sticky header is visible
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
          return;
        }
        stickySearchInputRef.current?.focus();
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible]); // Re-run if isVisible changes
  // --- End Search Effects ---

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 bg-white border-b border-gray-400 z-[999]"
          >
            <div className="container mx-auto flex justify-between items-center max-w-[77rem] py-4">
              <div className="flex items-center space-x-2">
                <Link to="/">
                  <img src="/logoBAIMXFinal.png" alt="BAIMX Logo" className="h-11 w-auto" />
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <motion.div layout className="flex items-center space-x-4">
                  <nav className="flex space-x-4 text-sm">
                    <a href="#" className="hover:text-gray-600 relative pr-2.5 text-gray-800"> 
                      Live Wire
                      <motion.span
                        className="absolute top-0.5 right-0 block h-1.5 w-1.5 rounded-full bg-blue-500"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                        aria-hidden="true"
                      />
                    </a>
                    <a href="#" className="text-medium hover:text-gray-600 text-gray-800">Subscribe</a>
                    <a href="#" className="text-medium hover:text-gray-600 text-gray-800">Go Pro</a>
                    <a href="#" className="text-medium hover:text-gray-600 text-gray-800">Learn</a>
                    <a href="#" className="text-medium hover:text-gray-600 text-gray-800">Research</a>
                    <a href="#" className="text-medium hover:text-gray-600 text-gray-800">Licensing</a>
                    <a href="#" className="text-medium hover:text-gray-600 text-gray-800">Launchpad</a>
                    <a href="#" className="text-medium hover:text-gray-600 text-gray-800">API</a>
                    <Link to="/about" className="text-medium hover:text-gray-600 text-gray-800">About</Link>
                    <a href="#" className="text-medium hover:text-gray-600 text-gray-800">Contact</a>
                  </nav>
                </motion.div>
                <motion.div layout className="flex items-center space-x-2">
                  <div className="relative flex items-center w-[200px]">
                    <input
                      ref={stickySearchInputRef} // Added ref
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search BAIMX"
                      className="w-full h-6 px-3 pr-10 text-xs text-gray-700 bg-gray-100 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none" // Increased pr-10
                    />
                    {!searchTerm && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-sm pointer-events-none">
                        /
                      </div>
                    )}
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
                  <button 
                    className="bg-blue-600 text-white px-4 py-2 rounded font-medium text-xs whitespace-nowrap"
                    onClick={() => setIsSignUpModalOpen(true)}
                  >
                    Sign In
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sign Up Modal */}
      <SignUpModal 
        isOpen={isSignUpModalOpen} 
        onClose={() => setIsSignUpModalOpen(false)} 
      />
    </>
  );
};

export const Header: React.FC = () => {
  const [isInitiallyLoading, setIsInitiallyLoading] = useState<boolean>(true);
  const [chartData, setChartData] = useState<ChartDataState>({});
  const [chartErrors, setChartErrors] = useState<ChartErrorsState>({});
  const [isPicksExpanded, setIsPicksExpanded] = useState<boolean>(true);
  const [isLiveFeedExpanded, setIsLiveFeedExpanded] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'markets' | 'picks'>('markets');
  const [selectedInterval, setSelectedInterval] = useState<string>('24h');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Add mobile menu state
  const [isMobileChartsExpanded, setIsMobileChartsExpanded] = useState(false); // Add mobile charts expansion state

  // --- Search State & Refs for Main Header ---
  const [mainSearchTerm, setMainSearchTerm] = useState('');
  const mainSearchInputRef = useRef<HTMLInputElement>(null);
  // --- End Search State & Refs ---

  const timeIntervals = ['1m', '15m', '1h', '24h', '1w', '1mo', '1y', '5y', 'All'];

  // --- Effect for main search keyboard shortcut ---
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/') {
        // Check if the event target is an input, textarea, or select element
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
          return; // Do not interfere with typing in other inputs
        }
        mainSearchInputRef.current?.focus();
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  // --- End Search Effects ---

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen) {
        const target = event.target as HTMLElement;
        const mobileMenu = document.querySelector('[data-mobile-menu]');
        const hamburgerButton = document.querySelector('[data-hamburger-button]');
        
        if (mobileMenu && hamburgerButton && 
            !mobileMenu.contains(target) && 
            !hamburgerButton.contains(target)) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

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

  const toggleMobileChartsExpansion = () => {
    setIsMobileChartsExpanded(prev => !prev);
  };

  const handleViewChange = (view: 'markets' | 'picks') => {
    setActiveView(view);
    setCurrentPage(1);
  };

  const handleNextPage = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  // Add these states for Live Wire
  const [liveWireData, setLiveWireData] = useState(MOCK_LIVE_WIRE_DATA);
  const [isScrolling, setIsScrolling] = useState(false);
  const liveWireContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  // Add new news item periodically
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!isLiveFeedExpanded && !isScrolling) { // Only auto-add when not expanded and not scrolling
        const newItem = {
          id: Date.now(),
          timestamp: 'Just now',
          content: `New crypto event ${Math.floor(Math.random() * 1000)}`,
          relatedTokens: [
            { 
              symbol: ['BTC', 'ETH', 'SOL', 'DOGE', 'XRP'][Math.floor(Math.random() * 5)], 
              direction: ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)] as 'positive' | 'negative' | 'neutral'
            }
          ]
        };
        
        setLiveWireData(prev => [newItem, ...prev.slice(0, 7)]); // Keep only 8 items
      }
    }, 7000); // New item every 7 seconds

    return () => clearInterval(intervalId);
  }, [isLiveFeedExpanded, isScrolling]);

  // Handle scroll events (no snapping)
  const handleScroll = () => {
    if (!liveWireContainerRef.current) return;
    
    // Mark as scrolling
    setIsScrolling(true);
    
    // Clear existing timeout
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    
    // Set new timeout to detect when scrolling stops
    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 300);
  };

  return (
    <>
      <div id="main-header">
        {/* First Row - Mobile Responsive Header */}
        <div className="bg-slate-900 p-4 py-5 text-white relative">
          <div className="container mx-auto flex justify-between items-center max-w-[77rem]">
            {/* Hamburger Menu - Visible on mobile (lg:hidden) */}
            <div className="lg:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className="text-white p-2 hover:bg-slate-800 rounded transition-colors"
                data-hamburger-button
              >
                {isMobileMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
              </button>
            </div>

            {/* Logo - Centered on mobile, left on desktop */}
            <div className="flex-grow flex justify-center lg:flex-grow-0 lg:justify-start">
              <Link to="/" className="cursor-default">
                <img src="/logoBAIMXFinal.png" alt="BAIMX Logo" className="h-12 lg:h-16 w-auto mt-1" />
              </Link>
            </div>

            {/* Desktop Navigation & Search - Hidden on mobile (hidden lg:flex) */}
            <div className="hidden lg:flex items-center space-x-4">
              <motion.div layout className="flex items-center space-x-4">
                <nav className="flex space-x-2.5 text-sm">
                  <a href="#" className="hover:text-gray-300 relative pr-2.5 cursor-default"> 
                    Live Wire
                    <motion.span
                      className="absolute top-0.5 right-0 block h-1.5 w-1.5 rounded-full bg-blue-500"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                      aria-hidden="true"
                    />
                  </a>
                  <a href="#" className="hover:text-gray-300 cursor-default">Subscribe</a>
                  <a href="#" className="hover:text-gray-300 cursor-default">Prices</a>
                  <a href="#" className="hover:text-gray-300 cursor-default">Learn</a>
                  <a href="#" className="hover:text-gray-300 cursor-default">Research</a>
                  <a href="#" className="hover:text-gray-300 cursor-default">Licensing</a>
                  <a href="#" className="hover:text-gray-300 cursor-default">Launchpad</a>
                  <a href="#" className="hover:text-gray-300 cursor-default">API</a>
                  <Link to="/about" className="hover:text-gray-300 cursor-default">About</Link>
                  <a href="#" className="hover:text-gray-300 cursor-default">Contact</a>
                </nav>
              </motion.div>
              <motion.div layout className="flex items-center space-x-2">
                {/* Desktop Search Input Field */}
                <div className="relative flex items-center w-[220px]">
                  <input
                    ref={mainSearchInputRef}
                    type="text"
                    value={mainSearchTerm}
                    onChange={(e) => setMainSearchTerm(e.target.value)}
                    placeholder="Search BAIMX"
                    className="w-full h-8 px-3 pr-10 text-sm text-white bg-slate-800 border border-slate-700 rounded-md focus:ring-1 focus:ring-[#0091AD] focus:border-[#0091AD] outline-none placeholder-gray-400"
                  />
                  {!mainSearchTerm && (
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded-sm pointer-events-none">
                      /
                    </div>
                  )}
                  {mainSearchTerm && (
                    <motion.button
                      onClick={() => setMainSearchTerm('')}
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
                <button 
                  className="bg-[#0091AD] text-white px-4 py-2 rounded font-medium text-xs whitespace-nowrap cursor-default"
                  onClick={() => setIsSignUpModalOpen(true)}
                >
                  Sign In
                </button>
              </motion.div>
            </div>
            
            {/* Sign In Button - Visible on mobile */}
            <div className="lg:hidden">
              <button 
                className="bg-[#0091AD] text-white px-3 py-2 rounded font-medium text-xs cursor-default"
                onClick={() => setIsSignUpModalOpen(true)}
              >
                Sign In
              </button>
            </div>
          </div>

          {/* Mobile Menu Overlay / Drawer */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="lg:hidden bg-slate-800 absolute top-full left-0 right-0 shadow-lg overflow-hidden z-[1000]"
                data-mobile-menu
              >
                <div className="container mx-auto max-w-[77rem] px-4">
                  {/* Mobile Navigation */}
                  <nav className="flex flex-col py-4 space-y-3 border-b border-slate-700">
                    <a href="#" className="hover:text-gray-300 text-white text-center py-2 cursor-default">Live Wire</a>
                    <a href="#" className="hover:text-gray-300 text-white text-center py-2 cursor-default">Subscribe</a>
                    <a href="#" className="hover:text-gray-300 text-white text-center py-2 cursor-default">Prices</a>
                    <a href="#" className="hover:text-gray-300 text-white text-center py-2 cursor-default">Learn</a>
                    <a href="#" className="hover:text-gray-300 text-white text-center py-2 cursor-default">Research</a>
                    <a href="#" className="hover:text-gray-300 text-white text-center py-2 cursor-default">Licensing</a>
                    <a href="#" className="hover:text-gray-300 text-white text-center py-2 cursor-default">Launchpad</a>
                    <a href="#" className="hover:text-gray-300 text-white text-center py-2 cursor-default">API</a>
                    <Link to="/about" className="hover:text-gray-300 text-white text-center py-2 cursor-default">About</Link>
                    <a href="#" className="hover:text-gray-300 text-white text-center py-2 cursor-default">Contact</a>
                  </nav>
                  
                  {/* Mobile Category Navigation */}
                  <nav className="flex flex-wrap justify-center gap-3 py-4 text-sm text-gray-100">
                    <a href="#" className="hover:text-white cursor-default">General</a>
                    <a href="#" className="hover:text-white cursor-default">BTC</a>
                    <a href="#" className="hover:text-white cursor-default">ETH</a>
                    <a href="#" className="hover:text-white cursor-default">USDT</a>
                    <a href="#" className="hover:text-white cursor-default">XRP</a>
                    <a href="#" className="hover:text-white cursor-default">SOL</a>
                    <a href="#" className="hover:text-white cursor-default">AVAX</a>
                    <a href="#" className="hover:text-white cursor-default">DOGE</a>
                    <a href="#" className="hover:text-white cursor-default">LTC</a>
                    <a href="#" className="hover:text-white cursor-default">BCH</a>
                    <a href="#" className="hover:text-white cursor-default">Speculative</a>
                    <a href="#" className="hover:text-white cursor-default">Reports</a>
                    <a href="#" className="hover:text-white cursor-default">Stables</a>
                    <a href="#" className="hover:text-white relative cursor-default">
                      Calendar
                      <span className="absolute -top-2.5 -right-4.5 px-1 text-[9px] font-medium bg-[#0091AD] text-black rounded-sm">New</span>
                    </a>
                    <a href="#" className="hover:text-white cursor-default">Governance</a>
                    <a href="#" className="hover:text-white cursor-default">Infrastructure</a>
                  </nav>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Second Row - Search Bar (Mobile) / Navigation (Desktop) */}
        <div className="bg-slate-900 border-b border-gray-800 border-t">
          {/* Mobile Search Bar */}
          <div className="lg:hidden p-4 py-3">
            <div className="container mx-auto max-w-[77rem]">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={mainSearchTerm}
                  onChange={(e) => setMainSearchTerm(e.target.value)}
                  placeholder="Search BAIMX"
                  className="w-full h-10 px-4 pr-12 text-sm text-white bg-slate-800 border border-slate-700 rounded-md focus:ring-1 focus:ring-[#0091AD] focus:border-[#0091AD] outline-none placeholder-gray-400"
                />
                {!mainSearchTerm && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded-sm pointer-events-none">
                    /
                  </div>
                )}
                {mainSearchTerm && (
                  <motion.button
                    onClick={() => setMainSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-0.5"
                    aria-label="Clear search"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <XIcon size={16} />
                  </motion.button>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:block p-4 py-3">
            <div className="container mx-auto max-w-[77rem] flex justify-center">
              <nav className="flex justify-center space-x-5 text-sm text-gray-100">
                <a href="#" className="hover:text-white cursor-default">General</a>
                <a href="#" className="hover:text-white cursor-default">BTC</a>
                <a href="#" className="hover:text-white cursor-default">ETH</a>
                <a href="#" className="hover:text-white cursor-default">USDT</a>
                <a href="#" className="hover:text-white cursor-default">XRP</a>
                <a href="#" className="hover:text-white cursor-default">SOL</a>
                <a href="#" className="hover:text-white cursor-default">AVAX</a>
                <a href="#" className="hover:text-white cursor-default">DOGE</a>
                <a href="#" className="hover:text-white cursor-default">LTC</a>
                <a href="#" className="hover:text-white cursor-default">BCH</a>
                <a href="#" className="hover:text-white cursor-default">Speculative</a>
                <a href="#" className="hover:text-white cursor-default">Reports</a>
                <a href="#" className="hover:text-white cursor-default">Stables</a>
                <a href="#" className="hover:text-white relative cursor-default">
                  Calendar
                  <span className="absolute -top-2.5 -right-4.5 px-1 text-[9px] font-medium bg-[#0091AD] text-black rounded-sm">New</span>
                </a>
                <a href="#" className="hover:text-white cursor-default">Governance</a>
                <a href="#" className="hover:text-white cursor-default">Infrastructure</a>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Third Row - Today's Picks - Mobile Optimized Charts */} 
      <motion.div 
        className="bg-slate-950/95 overflow-hidden"
        initial={false}
        animate={{ height: 'auto' }} // Always auto height since we're not collapsing this container
        transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
      >
        <div className="container mx-auto max-w-[77rem] relative py-4 pb-0">
          {/* Loader */}
          {isInitiallyLoading && (
            <div className="absolute inset-0 flex items-center justify-center mt-4 z-10 bg-opacity-100">
              <LoadingCubes />
            </div>
          )}

          {/* Live Markets/Today's Picks Header - Always Visible */}
          <div className="flex justify-between items-center mb-1 px-4 lg:px-0">
            <div className="flex gap-2 items-center">
              <button 
                onClick={() => handleViewChange('markets')}
                className={`text-sm font-medium ${activeView === 'markets' ? 'text-white' : 'text-gray-400 hover:text-gray-300'}`}
              >
                Live Markets
              </button>
              <div className="h-4 w-px bg-gray-600"></div>
              <button 
                onClick={() => handleViewChange('picks')}
                className={`text-sm font-medium ${activeView === 'picks' ? 'text-white' : 'text-gray-400 hover:text-gray-300'}`}
              >
                Today's Picks
              </button>
              
              {/* Compress/Expand Button - Right after the text */}
              <AnimatePresence mode="wait">
                {isPicksExpanded ? (
                  <motion.button 
                    key="compress"
                    onClick={togglePicksExpansion} 
                    className="p-1 rounded transition-colors text-gray-300 hover:bg-slate-700 bg-slate-800 ml-2"
                    aria-label="Collapse Today's Picks"
                    initial={{ opacity: 0, scale: 0.8, rotate: 180 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.8, rotate: -180 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <ChevronUp size={16} />
                  </motion.button>
                ) : (
                  <motion.button 
                    key="expand"
                    onClick={togglePicksExpansion} 
                    className="p-1 rounded transition-colors text-gray-300 hover:bg-slate-700 bg-slate-800 ml-2"
                    aria-label="Expand Today's Picks"
                    initial={{ opacity: 0, scale: 0.8, rotate: -180 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.8, rotate: 180 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <ChevronDown size={16} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            
            {/* View Prices Button - Now standalone on the right */}
            <button className="hidden lg:flex items-center text-xs text-gray-400 hover:text-gray-200 transition-colors font-medium">
              View Prices
              <ChevronRight size={14} className="ml-0.5" />
            </button>
          </div>
          
          {/* Collapsible Content Area */}
          <motion.div
            initial={false}
            animate={{ 
              height: isPicksExpanded ? 'auto' : 0,
              opacity: isPicksExpanded ? 1 : 0
            }}
            transition={{ 
              height: { type: "spring", duration: 0.4, bounce: 0.1 },
              opacity: { duration: 0.2, delay: isPicksExpanded ? 0.1 : 0 }
            }}
            className="overflow-hidden"
          >
            {/* Time Interval Selector Row with Controls - Mobile Optimized */}
            {activeView === 'markets' && (
              <div className="flex justify-between items-center mb-0 px-4 lg:px-0">
                <div className="flex items-center gap-2">
                  {/* Time Interval Selector - Horizontal scroll on mobile */}
                  <div className="flex space-x-0 overflow-x-auto lg:overflow-x-visible scrollbar-none">
                    {timeIntervals.map(interval => (
                      <button 
                        key={interval}
                        onClick={() => setSelectedInterval(interval)}
                        className={`px-1.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap flex-shrink-0
                          ${selectedInterval === interval 
                            ? 'text-white' 
                            : 'text-gray-400 hover:bg-slate-700/80 hover:text-gray-200'}
                        `}
                      >
                        {interval}
                      </button>
                    ))}
                  </div>

                  {/* Mobile Charts Expand Button - Only visible on mobile */}
                  <button 
                    onClick={toggleMobileChartsExpansion}
                    className="lg:hidden p-1 rounded transition-colors text-gray-300 hover:bg-slate-700 bg-slate-800 ml-2"
                    aria-label={isMobileChartsExpanded ? "Collapse Mobile Charts" : "Expand Mobile Charts"}
                  >
                    {isMobileChartsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {/* Page Controls - Moved here and aligned right */}
                {!isInitiallyLoading && (
                  <div className="hidden lg:flex items-center space-x-1">
                    <button 
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`p-1 rounded transition-colors 
                        ${currentPage === 1 
                          ? 'text-gray-600 cursor-not-allowed bg-slate-800'
                          : 'text-gray-300 hover:bg-slate-700 bg-slate-800'}
                      `}
                      aria-label="Previous Page"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs text-gray-400 px-2">
                      Page {currentPage}
                    </span>
                    <button 
                      onClick={handleNextPage}
                      className="p-1 rounded transition-colors text-gray-300 hover:bg-slate-700 bg-slate-800"
                      aria-label="Next Page"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* AnimatePresence for the content switching */}
            <AnimatePresence>
              {(
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
                    // Markets View - Mobile Optimized
                    <motion.div className="relative">
                      {/* Desktop Grid - Only show when expanded */}
                      <div className="hidden lg:grid lg:grid-cols-6 gap-1">
                        {isInitiallyLoading ? (
                          <div className="col-span-6 py-8 flex justify-center">
                          </div>
                        ) : (
                          <>
                            {coins.slice((currentPage - 1) * 6, currentPage * 6).map((coin, index) => {
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
                                  className="bg-[#14151F] border border-gray-800 rounded flex flex-col h-[140px] shadow-lg mb-5 mt-2"
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

                      {/* Universal Horizontal Scroll - Shows on mobile always, and on desktop when expanded */}
                      <div className="lg:hidden">
                        <div className="overflow-x-auto scrollbar-none px-4">
                          {!isMobileChartsExpanded ? (
                            // Collapsed view - Ticker style
                            <div className="flex space-x-2 pb-1">
                              {isInitiallyLoading ? (
                                <div className="flex justify-center w-full py-8">
                                  <LoadingCubes />
                                </div>
                              ) : (
                                <>
                                  {coins.map((coin, index) => {
                                    const data = chartData[coin.symbol];
                                    const error = chartErrors[coin.symbol];
                                    const hasData = data && !error;
                                    
                                    if (hasData && data) {
                                      return (
                                        <MobileTickerItem
                                          key={coin.symbol}
                                          symbol={coin.symbol}
                                          price={data.price || INITIAL_PRICES[coin.symbol]?.price || 0}
                                          percentageChange={data.percentageChange || 0}
                                          index={index}
                                        />
                                      );
                                    }
                                    
                                    // Fallback for loading/error states
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
                                        className="inline-flex items-center mx-1 px-2 flex-shrink-0 bg-gray-900 rounded-md border border-gray-700 py-1 px-2 cursor-default"
                                        style={{
                                          transition: 'font-size 0.2s ease-in-out',
                                        }}
                                      >
                                        <span className="font-medium mr-1.5 text-gray-100 text-xs">
                                          {coin.symbol.toUpperCase()}
                                        </span>
                                        <span className="text-gray-400 text-xs">
                                          {error ? 'Error' : 'Loading...'}
                                        </span>
                                      </motion.div>
                                    );
                                  })}
                                </>
                              )}
                            </div>
                          ) : (
                            // Expanded view - Full charts
                            <div className="flex space-x-3 pb-4">
                              {isInitiallyLoading ? (
                                <div className="flex justify-center w-full py-8">
                                  <LoadingCubes />
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
                                        className="bg-[#14151F] border border-gray-800 rounded flex flex-col h-[140px] w-[200px] flex-shrink-0 shadow-lg mt-2"
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
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    // Today's Picks View
                    <motion.div
                      className="grid grid-cols-6 gap-2 relative px-4 lg:px-0"
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
          </motion.div>
          
          {/* Compressed Ticker View - Shows when collapsed */}
          {!isPicksExpanded && activeView === 'markets' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-x-auto scrollbar-none px-4 py-2"
            >
              <div className="flex space-x-2">
                {isInitiallyLoading ? (
                  <div className="flex justify-center w-full py-4">
                    <LoadingCubes />
                  </div>
                ) : (
                  <>
                    {coins.map((coin, index) => {
                      const data = chartData[coin.symbol];
                      const error = chartErrors[coin.symbol];
                      const hasData = data && !error;
                      
                      if (hasData && data) {
                        return (
                          <MobileTickerItem
                            key={coin.symbol}
                            symbol={coin.symbol}
                            price={data.price || INITIAL_PRICES[coin.symbol]?.price || 0}
                            percentageChange={data.percentageChange || 0}
                            index={index}
                          />
                        );
                      }
                      
                      // Fallback for loading/error states
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
                          className="inline-flex items-center mx-1 px-2 flex-shrink-0 bg-gray-900 rounded-md border border-gray-700 py-1 px-2 cursor-default"
                          style={{
                            transition: 'font-size 0.2s ease-in-out',
                          }}
                        >
                          <span className="font-medium mr-1.5 text-gray-100 text-xs">
                            {coin.symbol.toUpperCase()}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {error ? 'Error' : 'Loading...'}
                          </span>
                        </motion.div>
                      );
                    })}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Fourth Row - Live Feed - Mobile Optimized */}
      <motion.div 
        className="bg-slate-900 border-t border-b border-gray-800 overflow-hidden "
        initial={false}
        animate={{ height: isLiveFeedExpanded ? '230px' : '160px' }}
        transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
      >
        <div className="container mx-auto max-w-[77rem] relative pt-4 pb-5 px-4 lg:px-0">
          {/* Live Feed Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-100">Live Wire</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <button className="p-1 text-gray-400 hover:text-gray-200 transition-colors">
                <Filter size={13} />
              </button>
              
              {/* Expand Button for Live Feed - Moved here next to Live Wire text */}
              {!isLiveFeedExpanded && (
                <button 
                  onClick={toggleLiveFeedExpansion} 
                  className="p-1 rounded transition-colors text-gray-300 hover:bg-slate-700 bg-slate-800"
                  aria-label="Expand Live Feed"
                >
                  <ChevronDown size={16} />
                </button>
              )}
            </div>
            
            {/* Open in CTerminal Button - Hidden on mobile */}
            <button className="hidden lg:flex items-center text-xs text-gray-400 hover:text-gray-200 transition-colors font-medium">
              Open in CTerminal
              <ChevronRight size={14} className="ml-0.5" />
            </button>
          </div>
          
          {/* Live Wire Feed Container - Mobile Optimized */}
          <div className="mt-2">
            <div className="max-w-[77rem] mx-auto bg-slate-950/30 rounded-md border border-gray-800 overflow-hidden">
              <div 
                ref={liveWireContainerRef}
                onScroll={handleScroll}
                className="overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent pt-0 md:pt-2 pl-2"
                style={{ 
                  scrollbarWidth: 'thin',
                  height: isLiveFeedExpanded ? '150px' : '78px'
                }}
              >
                <AnimatePresence initial={false}>
                  {liveWireData.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className={`flex flex-col lg:flex-row lg:items-center px-2 lg:px-4 py-2 lg:py-1 group ${
                        index === 0 
                          ? 'text-gray-200 text-sm' 
                          : 'text-xs text-gray-400 hover:text-white'
                      } transition-colors duration-200 cursor-default border-b border-gray-800 lg:border-b-0`}
                      style={{
                        marginBottom: index !== liveWireData.length - 1 ? '0px' : '0',
                      }}
                    >
                      {/* Mobile Layout */}
                      <div className="lg:hidden">
                        <div className="flex items-center justify-between mb-1">
                          <div className={`text-xs font-medium ${
                            index === 0 
                              ? 'text-gray-400' 
                              : 'text-gray-400 group-hover:text-gray-300 transition-colors duration-200'
                          }`}>
                            {item.timestamp}
                          </div>
                          <div className="flex gap-1 items-center">
                            {item.relatedTokens.map((token, idx) => (
                              <div 
                                key={idx}
                                className={`flex items-center text-[10px] font-medium rounded px-1 py-0.5 
                                  ${token.direction === 'positive' 
                                    ? 'text-green-500' 
                                    : token.direction === 'negative' 
                                      ? 'text-red-500' 
                                      : 'text-gray-300'}`}
                              >
                                <span className="mr-0.5">
                                  {token.direction === 'positive' ? '+' : 
                                   token.direction === 'negative' ? '-' : ''}
                                </span>
                                {token.symbol}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className={`font-medium ${
                          index === 0 
                            ? 'text-gray-200' 
                            : 'text-gray-500 group-hover:text-white transition-colors duration-200'
                        }`}>
                          {item.content}
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden lg:flex lg:items-center lg:w-full">
                        {/* Time */}
                        <div className={`w-16 text-xs font-medium ${
                          index === 0 
                            ? 'text-gray-400' 
                            : 'text-gray-400 group-hover:text-gray-300 transition-colors duration-200'
                        }`}>
                          {item.timestamp}
                        </div>
                        
                        {/* Content */}
                        <div className={`flex-1 font-medium truncate pl-8 ${
                          index === 0 
                            ? 'text-gray-200' 
                            : 'text-gray-500 group-hover:text-white transition-colors duration-200'
                        }`}>
                          {item.content}
                        </div>
                        
                        {/* Related Tokens */}
                        <div className="flex gap-2 items-center">
                          {item.relatedTokens.map((token, idx) => (
                            <div 
                              key={idx}
                              className={`flex items-center ${index === 0 ? 'text-xs' : 'text-[10px]'} font-medium rounded px-2 py-0.5 
                                ${token.direction === 'positive' 
                                  ? 'text-green-500' 
                                  : token.direction === 'negative' 
                                    ? 'text-red-500' 
                                    : index === 0 
                                      ? 'text-gray-300'
                                      : 'text-gray-300 group-hover:text-gray-100 transition-colors duration-200'}`}
                            >
                              <span className="mr-1">
                                {token.direction === 'positive' ? '+' : 
                                 token.direction === 'negative' ? '-' : ''}
                              </span>
                              {token.symbol}
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Expand Button for Live Feed */}
              {!isLiveFeedExpanded && (
                <motion.button 
                  onClick={toggleLiveFeedExpansion} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.0 }}
                  className="absolute left-4 lg:left-0 mt-4 p-1 rounded transition-colors text-gray-300 hover:bg-slate-700 bg-slate-800 hidden"
                  aria-label="Expand Live Feed"
                >
                  <ChevronDown size={16} />
                </motion.button>
              )}
            </div>
          </div>

          {/* Compress Button */}
          {isLiveFeedExpanded && (
            <button 
              onClick={toggleLiveFeedExpansion} 
              className="absolute bottom-1 left-4 lg:left-0 text-gray-300 hover:text-gray-100"
              aria-label="Collapse Live Feed"
            >
              <ChevronUp size={20} />
            </button>
          )}
        </div>
      </motion.div>

      {/* Sign Up Modal */}
      <SignUpModal 
        isOpen={isSignUpModalOpen} 
        onClose={() => setIsSignUpModalOpen(false)} 
      />
    </>
  );
}; 