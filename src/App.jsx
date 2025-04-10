import React, { useState, useEffect } from 'react'; // Import hooks and useEffect
import { Link, Outlet } from 'react-router-dom'; // Removed useLocation import
import { motion, AnimatePresence } from 'framer-motion'; // Re-added motion and AnimatePresence import
import './index.css' // Ensure Tailwind styles are imported
import { MiniTokenChart } from './components/MiniTokenChart.tsx'; // Import the new chart component
import { LoadingCubes } from './components/LoadingCubes.tsx'; // Import LoadingCubes
import { ChevronRight, ChevronUp, ChevronDown, ArrowUpRight, ArrowDownRight } from 'lucide-react'; // Import Lucide icons

// Define Coins with Solana Token IDs (Example IDs - verify these)
const coins = [
  { symbol: 'BTC', tokenId: '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E' }, // WBTC (Portal)
  { symbol: 'ETH', tokenId: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs' }, // WETH (Portal)
  { symbol: 'SOL', tokenId: 'So11111111111111111111111111111111111111112' }, // Native SOL
  { symbol: 'USDC', tokenId: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' }, // USDC
  { symbol: 'BONK', tokenId: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' }, // BONK
  { symbol: 'WIF', tokenId: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm' }, // dogwifhat
];

// --- Helper functions moved from MiniTokenChart --- 

// Helper to find the best pool address (simplified, types removed)
const findBestPoolAddress = (pools) => {
  if (!pools || pools.length === 0) return null;
  pools.sort((a, b) => parseFloat(b.attributes.volume_usd?.h24 || '0') - parseFloat(a.attributes.volume_usd?.h24 || '0'));
  return pools[0]?.attributes?.address || null;
};

// Helper to create chart option AND calculate 24h change
const createChartOption = (candleList) => {
  if (!candleList || candleList.length === 0) return null;

  // Find the closest candle to 24 hours ago and the most recent candle
  const now = Date.now();
  const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
  let price24hAgo = null;
  let latestPrice = null;

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
    tooltip: { trigger: 'axis', formatter: '{c0}', axisPointer: { type: 'none' }, backgroundColor: 'rgba(30, 30, 30, 0.7)', borderColor: '#555', borderWidth: 1, textStyle: { color: '#eee', fontSize: 10 }, position: function (pos, params, dom, rect, size) { return [pos[0] - size.contentSize[0] / 2, -size.contentSize[1] - 5]; }, extraCssText: 'padding: 2px 5px; pointer-events: none;' }
  };

  // Return both option and percentage change
  return { option, percentageChange }; 
};

const Header = () => {
  const [isInitiallyLoading, setIsInitiallyLoading] = useState(true);
  const [chartData, setChartData] = useState({});
  const [chartErrors, setChartErrors] = useState({});
  const [isPicksExpanded, setIsPicksExpanded] = useState(true); 

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
          const { option, percentageChange } = createChartOption(candleList);
          if (!option) throw new Error('No OHLCV data returned.');

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
      <div className="bg-[#1C1D33] p-4 py-4 sticky top-0 z-[999] text-white">
        <div className="container mx-auto flex justify-between items-center max-w-6xl">
          <div className="flex items-center space-x-2">
            <img src="/logoBAIMX.png" alt="BAIMX Logo" className="h-5 w-auto" /> {/* Actual Logo */}
          </div>
          <div className="flex items-center space-x-4">
            <nav className="flex space-x-4 text-xs">
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
      <div className="bg-[#31334B] p-4 py-2">
        <div className="container mx-auto max-w-6xl flex justify-center">
          <nav className="flex justify-center space-x-6 text-xs text-gray-100">
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
        animate={{ height: isPicksExpanded ? 'auto' : '85px' }} // Animate height
        transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
      >
        <div className="container mx-auto max-w-6xl relative pt-3 pb-8">
          {/* Toggle Button absolutely positioned */}
          <button 
            onClick={togglePicksExpansion} 
            className="absolute bottom-1 left-0 text-gray-500 hover:text-white transition-colors z-20 p-1"
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

          <h2 className="text-xs font-semibold mb-1 text-white">Today's Picks</h2>
          
          {/* AnimatePresence for the content switching/resizing */}
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={isPicksExpanded ? 'expanded' : 'collapsed'} // Change key on toggle
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-6 gap-2 relative"
              // Explicitly set minHeight for collapsed state consistency
              style={{ minHeight: isPicksExpanded ? '80px' : 'auto' }} 
            >
              {/* Conditional rendering based on isPicksExpanded */} 
              {coins.map((coin) => {
                const data = chartData[coin.symbol];
                const error = chartErrors[coin.symbol];
                const change = data?.percentageChange;
                const isUp = change !== null && change >= 0;

                return (
                  <div 
                    key={coin.symbol} 
                    className={`bg-[#31334B] p-2 rounded flex flex-col items-center text-center transition-opacity duration-300 ${isInitiallyLoading ? 'opacity-0' : 'opacity-100'}`}
                  >
                    {/* Collapsed View */} 
                    {!isPicksExpanded && (
                      <div className="flex flex-col items-center justify-center h-full text-xs">
                        <span className="font-medium text-gray-200 mb-0.5">{coin.symbol}</span>
                        {change !== null && !error && (
                          <span className={`flex items-center ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                            {isUp ? <ArrowUpRight size={12} className="mr-0.5"/> : <ArrowDownRight size={12} className="mr-0.5"/>}
                            {change.toFixed(2)}%
                          </span>
                        )}
                        {error && <span className="text-red-500 text-xs">Error</span>}
                        {isInitiallyLoading && change === null && !error && <span className="text-gray-500 text-xs">...</span>} 
                      </div>
                    )}
                    
                    {/* Expanded View */} 
                    {isPicksExpanded && (
                      <>
                        <span className="text-xs font-medium text-gray-100 mb-1">{coin.symbol}/USD</span>
                        <MiniTokenChart
                          symbol={coin.symbol}
                          chartOption={data?.option || null}
                          error={error || null}
                          percentageChange={change || null}
                        />
                      </>
                    )}
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
};

// Updated LiveFeedSection for Link and Icon + Hover Animation
const LiveFeedSection = () => (
  <section className="container mx-auto my-8 max-w-6xl">
    <div className="flex justify-between items-center mb-1">
      {/* Wrap Link content for group hover effect */}
      <Link 
        to="/Livefeed" 
        className="group text-md font-bold flex items-center hover:text-blue-600 transition-colors duration-200" // Removed relative pr-4
      >
        <img src="/logoBAIMXblack.png" alt="BAIMX" className="h-3 mr-0" />
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

// New HomePage component
export const HomePage = () => (
  <>
    <AdSpace />
    <FeaturedSection />
    <LiveFeedSection />
    <FeaturedSection />
    <FeaturedSection />
  </>
);

// Footer Component
const Footer = () => (
  <footer className="bg-gray-100 text-gray-600 p-4 mt-8 text-center text-sm">
    © 2025 BAIMX. All rights reserved.
  </footer>
);

// Main Layout Component - Animations Removed
const Layout = () => {
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
function App() {
  return <Layout />;
}

export default App;

// --- Keep full JSX for AdSpace and FeaturedSection for context --- 

const AdSpace = () => (
  <section className="container mx-auto my-4 h-40 bg-gray-200 flex items-center justify-center text-gray-500 max-w-6xl">
    ADSPACE
  </section>
);

const FeaturedSection = () => (
    <section className="container mx-auto my-4 max-w-6xl">
        <h2 className="text-md font-bold mb-1">Featured</h2>
        <div className="grid grid-cols-3 gap-6">
            {/* Main featured article */}
            <div className="col-span-2 bg-gray-300 h-100 relative rounded flex flex-col justify-end p-6 text-white ">
                 <div className="absolute inset-0 bg-gray-700 opacity-80 rounded"></div>
                <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-2">Bitcoin futures sells above Average as FTX Shuts its doors</h3>
                    <a href="#" className="text-sm hover:underline">Read the full article &gt;</a>
                     {/* Wrapper for bottom alignment */}
                     <div className="mt-4 flex justify-between items-end text-xs text-gray-300">
                        {/* Time/Read Duration */}
                        <span>3 minutes ago | 6 minute read</span>
                        {/* Tags */}
                         <div className="flex space-x-2">
                            <span className="bg-gray-600 px-2 py-0.5 rounded text-xs">Speculative</span>
                            <span className="bg-gray-600 px-2 py-0.5 rounded text-xs">Speculative</span>
                            <span className="bg-gray-600 px-2 py-0.5 rounded text-xs">BTC</span>
                        </div>
                    </div>
                </div>
            </div>
            {/* Sidebar placeholder articles */}
            <div className="space-y-4">
                <div className="bg-gray-200 h-30 rounded"></div>
                <div className="bg-gray-200 h-30 rounded"></div>
                <div className="bg-gray-200 h-30 rounded"></div>
            </div>
        </div>
    </section>
);
