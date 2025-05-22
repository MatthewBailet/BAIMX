import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { EChartsOption } from 'echarts';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingCubes } from '../LoadingCubes';
import { ChevronDown } from 'lucide-react';


import "../../index.css"

const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&display=swap');

  .dm-mono {
    font-family: 'DM Mono', monospace;
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

// --- Interfaces ---
interface PriceData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_percentage_24h: number;
}

interface MarketData {
  current_price: number;
  high_24h: number;
  low_24h: number;
  total_volume: number;
  price_change_percentage_24h: number;
}

interface ChartData {
  prices: [number, number][];
  total_volumes: [number, number][];
}

// --- NEW: News Article Interface ---
interface NewsArticle {
    id: string;
    title: string;
    source: string;
    timestamp: string; // e.g., "2h ago"
    link: string; // URL
}

// --- Mock/Initial Data ---
const dummyNewsData: NewsArticle[] = [
    { id: 'news1', title: 'Bitcoin Whale Accumulation Hits Record Highs Ahead of Halving Event', source: 'CryptoNews Today', timestamp: '15m ago', link: '#' },
    { id: 'news2', title: 'Ethereum Devs Finalize Details for Next Network Upgrade "Prague"', source: 'ETH World', timestamp: '45m ago', link: '#' },
    { id: 'news3', title: 'Solana DeFi Protocol Sees Surge in TVL After Partnership Announcement', source: 'DeFi Pulse', timestamp: '1h ago', link: '#' },
    { id: 'news4', title: 'Regulatory Clarity Sought for Stablecoins in Latest Senate Hearing', source: 'Capitol Crypto', timestamp: '2h ago', link: '#' },
    { id: 'news5', title: 'Analysis: Altcoin Season Potential Hinges on Bitcoin Dominance Drop', source: 'Market Insights', timestamp: '3h ago', link: '#' },
    { id: 'news6', title: 'NFT Marketplace Volume Dips Slightly, Blue Chips Hold Steady', source: 'NFT Times', timestamp: '4h ago', link: '#' },
    { id: 'news7', title: 'Global Investment Bank Launches Tokenized Asset Platform', source: 'Finance Forward', timestamp: '5h ago', link: '#' },
    { id: 'news8', title: 'Bitcoin Miners Increase Holdings Amid Price Stability', source: 'Mining Monitor', timestamp: '6h ago', link: '#' },
];

const timePeriods = [
  { label: '1H', days: '1', interval: 'hourly' }, // CoinGecko doesn't guarantee < hourly for free tier
  { label: '24H', days: '1', interval: 'hourly' },
  { label: '7D', days: '7', interval: 'daily' },
  { label: '1M', days: '30', interval: 'daily' },
  { label: '1Y', days: '365', interval: 'daily' },
  { label: 'All', days: 'max', interval: 'daily' },
];

// --- Helper Functions ---
const formatPrice = (value: number): string => {
  if (value < 0.01 && value > 0) return `$${value.toFixed(6)}`;
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

const formatCompact = (value: number): string => {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
};

// --- Chart Option Generator ---
const generateChartOption = (chartData?: ChartData): EChartsOption | null => {
  if (!chartData || !chartData.prices || chartData.prices.length === 0) return null;

  const { prices, total_volumes } = chartData;
  const timestamps = prices.map(p => p[0]);
  const priceValues = prices.map(p => p[1]);
  const volumeValues = total_volumes ? total_volumes.map(v => v[1]) : [];

  const firstPrice = priceValues[0] || 0;
  const lastPrice = priceValues[priceValues.length - 1] || 0;
  const isPositiveTrend = lastPrice >= firstPrice;
  const trendColor = isPositiveTrend ? '#10B981' : '#EF4444'; // Tailwind green-500, red-500
  const areaColorStops = isPositiveTrend
    ? [{ offset: 0, color: 'rgba(16, 185, 129, 0.3)' }, { offset: 1, color: 'rgba(16, 185, 129, 0.01)' }]
    : [{ offset: 0, color: 'rgba(239, 68, 68, 0.3)' }, { offset: 1, color: 'rgba(239, 68, 68, 0.01)' }];

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross', label: { backgroundColor: '#27272a' } }, // Darker label bg
      backgroundColor: 'rgba(17, 24, 39, 0.85)',
      borderColor: '#374151',
      textStyle: { color: '#f3f4f6', fontSize: 12 },
      // Formatter to show price and volume
      formatter: (params: any) => {
        const pricePoint = params.find((p: any) => p.seriesName === 'Price');
        const volumePoint = params.find((p: any) => p.seriesName === 'Volume');
        if (!pricePoint) return '';
        const date = new Date(pricePoint.axisValue);
        let output = `${date.toLocaleString()}<br/>`;
        output += `<b>Price:</b> ${formatPrice(pricePoint.value)}<br/>`;
        if (volumePoint && volumePoint.value !== undefined && volumePoint.value !== null) {
          output += `<b>Volume:</b> ${formatCompact(volumePoint.value)}`;
        }
        return output;
      }
    },
    axisPointer: { link: [{ xAxisIndex: 'all' }], label: { backgroundColor: '#777' } }, // Link tooltips
    grid: [
      { top: '8%', left: '2%', right: '2%', bottom: '30%' }, // Price chart grid (larger)
      { left: '2%', right: '2%', height: '18%', bottom: '8%' } // Volume chart grid (smaller, below)
    ],
    xAxis: [
      { // Price chart X axis
        type: 'category',
        data: timestamps,
        gridIndex: 0,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false } // Hide labels on price chart x-axis
      },
      { // Volume chart X axis
        type: 'time',
        gridIndex: 1,
        axisLine: { show: true, lineStyle: { color: '#d1d5db' } },
        axisTick: { show: false },
        axisLabel: {
          color: '#6b7280', fontSize: 10,
        }
      }
    ],
    yAxis: [
      { // Price chart Y axis
        type: 'value',
        scale: true,
        gridIndex: 0,
        splitLine: { show: true, lineStyle: { color: '#e5e7eb', type: 'dashed' } },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#6b7280', fontSize: 10, inside: false, margin: 4 }
      },
      { // Volume chart Y axis
        type: 'value',
        scale: true,
        gridIndex: 1,
        splitLine: { show: false }, // No grid lines for volume
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false } // Hide volume axis labels
      }
    ],
    dataZoom: [
      { type: 'inside', xAxisIndex: [0, 1], start: 0, end: 100 }, // Link zoom for both charts
      { show: true, xAxisIndex: [0, 1], type: 'slider', bottom: 0, height: 20, start: 0, end: 100, 
        dataBackground: {lineStyle:{opacity:0}, areaStyle:{opacity:0}}, // Hide preview chart in slider
        selectedDataBackground: {lineStyle:{opacity:0}, areaStyle:{opacity:0}},
        handleStyle: { color: '#cbd5e1' }, borderColor: '#e2e8f0' }
    ],
    series: [
      { // Price series
        name: 'Price',
        data: priceValues,
        type: 'line',
        xAxisIndex: 0, yAxisIndex: 0,
        smooth: false,
        symbol: 'none',
        lineStyle: { color: trendColor, width: 1.5 },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: areaColorStops }, origin: 'start' }
      },
      { // Volume series
        name: 'Volume',
        data: volumeValues,
        type: 'bar',
        xAxisIndex: 1, yAxisIndex: 1,
        itemStyle: { color: '#cbd5e1' }, // Light gray bars
        large: true
      }
    ]
  };
};

const ITEMS_PER_PAGE = 15;

// --- Main Component ---
export const PricesMainView: React.FC = () => {
  // State for chart/news section
  const [selectedAssetData, setSelectedAssetData] = useState<PriceData | null>(null); // Holds full data of the selected asset
  const [activePeriod, setActivePeriod] = useState<string>('7D');
  const [chartOption, setChartOption] = useState<EChartsOption | null>(null);
  const [marketDetails, setMarketDetails] = useState<MarketData | null>(null); // Still used for header display
  const [isLoadingChart, setIsLoadingChart] = useState<boolean>(false);
  const [chartError, setChartError] = useState<string | null>(null);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [showViewMoreNews, setShowViewMoreNews] = useState(false);
  const newsScrollRef = useRef<HTMLDivElement>(null);

  // State for the coin list sidebar
  const [coinList, setCoinList] = useState<PriceData[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isListLoading, setIsListLoading] = useState<boolean>(true);
  const [listError, setListError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true); // Assume true initially

  // Fetch Coin List for Sidebar
  const fetchCoinList = useCallback(async (page: number) => {
    setIsListLoading(true);
    setListError(null);
    try {
      const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${ITEMS_PER_PAGE}&page=${page}&sparkline=false`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Coin List API Error: ${response.statusText}`);
      const data: PriceData[] = await response.json();

      // Check if this is potentially the last page
      setHasNextPage(data.length === ITEMS_PER_PAGE);

      setCoinList(data);

      // If it's the first page load, select the top coin by default
      if (page === 1 && data.length > 0 && !selectedAssetData) {
          handleAssetSelect(data[0]); // Select the first coin
      }

    } catch (err) {
      console.error("Error fetching coin list:", err);
      setListError(err instanceof Error ? err.message : 'Failed to load coin list.');
      setCoinList([]); // Clear list on error
    } finally {
      setIsListLoading(false);
    }
  }, [selectedAssetData]); // Dependency added to prevent re-selecting on page change if already selected

  // Fetch Chart/News Data for Selected Asset
  const fetchChartAndNews = useCallback(async (coinId: string, periodLabel: string) => {
    if (!coinId) return; // Don't fetch if no coin is selected

    setIsLoadingChart(true);
    setChartError(null);
    setChartOption(null);
    setNewsArticles([]);
    setShowViewMoreNews(false);

    const period = timePeriods.find(p => p.label === periodLabel);
    if (!period) {
      setChartError('Invalid time period selected.');
      setIsLoadingChart(false);
      return;
    }

    try {
      // Fetch chart data
      const chartApiUrl = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${period.days}${period.interval === 'hourly' ? '&interval=hourly' : ''}`;
      const chartResponse = await fetch(chartApiUrl);
      if (!chartResponse.ok) throw new Error(`Chart API Error: ${chartResponse.statusText}`);
      const chartApiData: ChartData = await chartResponse.json();

      const option = generateChartOption(chartApiData);
      if (!option) throw new Error('Failed to generate chart.');
      setChartOption(option);

      // Fetch/Set News Data (Using Dummy Data For Now)
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
      const assetName = selectedAssetData?.name || '';
      const assetSymbol = selectedAssetData?.symbol || '';
      const relevantNews = dummyNewsData.filter((article: NewsArticle) =>
          article.title.toLowerCase().includes(assetName.toLowerCase()) ||
          article.title.toLowerCase().includes(assetSymbol.toLowerCase()) ||
          Math.random() > 0.3
      ).slice(0, 8);
      setNewsArticles(relevantNews);

    } catch (err) {
      console.error("Error fetching chart/news data:", err);
      setChartError(err instanceof Error ? err.message : 'Failed to load data.');
      setChartOption(null);
      setNewsArticles([]);
    } finally {
      setIsLoadingChart(false);
    }
  }, [selectedAssetData]); // Depends on selectedAssetData

  // Initial list fetch
  useEffect(() => {
    fetchCoinList(currentPage);
  }, [currentPage, fetchCoinList]); // Refetch when page changes

  // Fetch chart/news when selection or period changes
  useEffect(() => {
    if (selectedAssetData) {
      fetchChartAndNews(selectedAssetData.id, activePeriod);
    }
  }, [selectedAssetData, activePeriod, fetchChartAndNews]);

  // Handle selecting an asset from the list
  const handleAssetSelect = (asset: PriceData) => {
      setSelectedAssetData(asset); // Store the full asset data
      // Update marketDetails for the header using data from the list item
      setMarketDetails({
         current_price: asset.current_price,
         high_24h: asset.high_24h,
         low_24h: asset.low_24h,
         total_volume: asset.total_volume,
         price_change_percentage_24h: asset.price_change_percentage_24h,
      });
      // Chart/News data will be fetched by the useEffect hook that depends on selectedAssetData
  };

  const handlePeriodSelect = (periodLabel: string) => {
    setActivePeriod(periodLabel);
  };

  const handleNewsScroll = (event: React.UIEvent<HTMLDivElement>) => {
      const target = event.currentTarget;
      // Threshold before bottom (e.g., 50px) to trigger the view more button
      const threshold = 50;
      const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < threshold;

      if (isNearBottom && !showViewMoreNews) {
          setShowViewMoreNews(true);
      } else if (!isNearBottom && showViewMoreNews) {
          // Optional: Hide button again if user scrolls back up significantly
          // setShowViewMoreNews(false);
      }
  };

  const handleNextPage = () => {
      if (hasNextPage) {
          setCurrentPage(prev => prev + 1);
      }
  };

  const handlePrevPage = () => {
      setCurrentPage(prev => Math.max(1, prev - 1)); // Ensure page doesn't go below 1
  };

  // Display name for the selected asset, default to "Loading..."
  const selectedAssetName = selectedAssetData?.name ?? 'Loading...';
  const selectedAssetSymbol = selectedAssetData?.symbol ?? '';
  const selectedAssetImageUrl = selectedAssetData?.image ?? '';


  return (
    <section className="container mx-auto my-8 max-w-[77rem]">
      <h2 className="text-lg font-bold mb-4 flex items-center">
        <span className="pl-3">Prices Overview</span>
        <span className="text-xs font-normal text-gray-500 ml-4">Cryptocurrency Market Cap Rankings</span>
      </h2>
      
      <div className="bg-white border-y border-gray-400 overflow-hidden min-h-[680px]"> {/* Increased min-height for news */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-0 h-full"> 
          
          {/* Left Column: Chart & News Section (Span 3 cols) */}
          <div className="md:col-span-3 p-4 border-r border-gray-400 flex flex-col">
            {/* --- NEW: Asset Header --- */}
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-400 min-h-[60px]"> {/* Added min-height */}
                <div className="flex items-center gap-3"> {/* NEW: Flex container for icon + text */}
                    {selectedAssetImageUrl && (
                         <img
                            src={selectedAssetImageUrl}
                            alt={`${selectedAssetName} logo`}
                            className="w-8 h-8 rounded-full"
                         />
                    )}
                    {!selectedAssetData && isListLoading && (<div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>) }
                    <div>
                        <h3 className="text-3xl font-semibold text-gray-900">{selectedAssetName}</h3>
                        {selectedAssetSymbol && <span className="text-sm text-gray-500 uppercase">{selectedAssetSymbol}/USD</span>}
                    </div>
                </div>
                <div className="text-right">
                    {marketDetails ? (
                        <>
                            <div className="text-3xl font-regular tracking-tighter dm-mono text-gray-900">{formatPrice(marketDetails.current_price)}</div>
                            <div className={`flex items-center justify-end dm-mono text-sm font-medium ${marketDetails.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {marketDetails.price_change_percentage_24h >= 0 ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
                                {Math.abs(marketDetails.price_change_percentage_24h ?? 0).toFixed(2)}%
                            </div>
                        </>
                    ) : (
                        <div className="h-12 flex flex-col items-end justify-center">
                            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-1"></div>
                            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    )}
                </div>
            </div>
            {/* --- END: Asset Header --- */}

             {/* Top Bar: Time Period & OHLCV */}
             <div className="flex justify-between items-start mb-3 flex-wrap gap-y-2">
                 {/* Time Period Buttons */} 
                 <div className="flex space-x-1 border border-gray-400 rounded-md p-0.5">
                     {timePeriods.map((period) => (
                         <button 
                             key={period.label}
                             onClick={() => handlePeriodSelect(period.label)}
                             className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${activePeriod === period.label ? 'bg-gray-100 text-gray-800 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
                             {period.label}
                         </button>
                     ))}
                 </div>
                 {/* OHLCV Data */} 
                 <div className="flex space-x-4 text-xs text-right min-h-[34px]"> {/* Added min-height */}
                     {marketDetails ? (
                         <>
                             <div>
                                 <span className="text-gray-500 block">24H High</span>
                                 <span className="font-medium text-green-600">{formatPrice(marketDetails.high_24h)}</span>
                             </div>
                             <div>
                                 <span className="text-gray-500 block">24H Low</span>
                                 <span className="font-medium text-red-600">{formatPrice(marketDetails.low_24h)}</span>
                             </div>
                             <div>
                                 <span className="text-gray-500 block">24H Vol</span>
                                 <span className="font-medium text-gray-800">{formatCompact(marketDetails.total_volume)}</span>
                             </div>
                         </>
                     ) : (
                         <div className="h-8 flex items-center text-gray-400">
                             {isLoadingChart ? 'Loading data...' : (chartError ? '-' : '' )}
                         </div>
                     )}
                 </div>
             </div>
            
             {/* Chart Area */}
             <div className="flex-grow h-[320px] relative mt-2 mb-4"> {/* Added mb-4 */}
      
               {chartError && !isLoadingChart && (
                 <div className="absolute inset-0 flex items-center justify-center text-center text-red-600 bg-red-50 p-4 rounded z-10">
                   Error loading chart data:<br/>{chartError}
                 </div>
               )}
               {!isLoadingChart && !chartError && chartOption && (
                 <ReactECharts
                   option={chartOption}
                   style={{ height: '100%', width: '100%' }}
                   notMerge={false} // Allow options to merge for smoother updates
                   lazyUpdate={true}
                 />
               )}
               {!isLoadingChart && !chartError && !chartOption && !marketDetails && ( // Show 'no data' only if market details also failed
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-50 p-4 rounded z-10">
                    {selectedAssetData ? 'No chart data available.' : 'Select an asset to view chart.'}
                  </div>
               )}
             </div>

            {/* --- NEW: Live Feed Placeholder --- */}
            <div className="mt-4 pt-4 border-t border-gray-400 flex-shrink-0">
                <h4 className="text-base font-semibold text-gray-800 mb-2">Live Feed</h4>
                <div className="h-16 bg-gray-50 border border-gray-400 rounded flex items-center justify-center text-sm text-gray-400">
                    {/* Placeholder for live feed cells */}
                    Live feed content will appear here...
                </div>
            </div>
            {/* --- END: Live Feed Placeholder --- */}

            {/* --- NEW: News Section --- */}
            <div className="mt-4 pt-4 border-t border-gray-400 flex-shrink-0 h-[250px] flex flex-col"> {/* Fixed height container */}
              <h4 className="text-base font-semibold text-gray-800 mb-3">
                News <span className='text-gray-400 font-normal'>| {selectedAssetName === 'Loading...' ? '...' : selectedAssetName}</span>
              </h4>
              <div className="relative flex-grow overflow-hidden"> {/* Container for scroll and fade */}
        
                  {!isLoadingChart && newsArticles.length === 0 && (
                       <div className="h-full flex items-center justify-center text-sm text-gray-400">
                           {selectedAssetData ? 'No recent news.' : 'Select an asset to view news.'}
                       </div>
                  )}

                  {newsArticles.length > 0 && (
                      <div
                          ref={newsScrollRef}
                          onScroll={handleNewsScroll}
                          className="h-full overflow-y-auto pr-2 custom-scrollbar" // Added custom-scrollbar class if you have one
                          style={{ scrollbarWidth: 'thin' }} // Firefox scrollbar styling
                      >
                          <ul className="space-y-3 pb-10"> {/* Add padding-bottom to prevent overlap with button */}
                              {newsArticles.map((article) => (
                                  <li key={article.id} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                                      <a href={article.link} target="_blank" rel="noopener noreferrer" className="group block hover:bg-gray-50 p-1 -m-1 rounded transition-colors">
                                          <h5 className="text-sm font-medium text-gray-800 group-hover:text-blue-600 mb-0.5 leading-snug">{article.title}</h5>
                                          <div className="flex items-center justify-between text-xs text-gray-500">
                                              <span>{article.source}</span>
                                              <span>{article.timestamp}</span>
                                          </div>
                                      </a>
                                  </li>
                              ))}
                          </ul>
                      </div>
                  )}

                  {/* Fade Effect */}
                  <AnimatePresence>
                      {!showViewMoreNews && newsArticles.length > 2 && ( // Only show fade if enough articles and not scrolled down
                          <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none z-10"
                          />
                      )}
                  </AnimatePresence>

                   {/* View More Button */}
                   <AnimatePresence>
                      {showViewMoreNews && newsArticles.length > 2 && (
                           <motion.div
                               initial={{ opacity: 0, y: 10 }}
                               animate={{ opacity: 1, y: 0 }}
                               exit={{ opacity: 0, y: 10 }}
                               transition={{ duration: 0.3, delay: 0.1 }}
                               className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20"
                           >
                              <button className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-full shadow-sm transition-colors">
                                  View More
                                  <ChevronDown size={14} className="ml-1" />
                              </button>
                           </motion.div>
                      )}
                   </AnimatePresence>
              </div>
            </div>
            {/* --- END: News Section --- */}

          </div>
          
          {/* Right Column: Paginated List of Coins */}
          <div className="md:col-span-2 flex flex-col border-gray-400 h-full max-h-[820px]"> {/* Ensure column takes full height */}
             <div className="flex-grow overflow-y-auto"> {/* Let flex-grow handle height */}
        
                {coinList.map((asset) => (
                  <div
                    key={asset.id}
                    className={`flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-100 transition-colors cursor-pointer ${selectedAssetData?.id === asset.id ? 'bg-blue-50 font-semibold' : ''}`}
                    onClick={() => handleAssetSelect(asset)}
                  >
                     <div className="flex items-center">
                        {/* NEW: Use img tag for icon */}
                        {asset.image ? (
                             <img
                                src={asset.image}
                                alt={`${asset.name} logo`}
                                className="w-7 h-7 rounded-full mr-3"
                             />
                        ) : (
                             <div className={`w-7 h-7 rounded-full mr-3 flex items-center justify-center text-xs ${selectedAssetData?.id === asset.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                 {asset.symbol.slice(0, 1).toUpperCase()}
                             </div>
                        )}
                       <div>
                         <div className={`text-sm ${selectedAssetData?.id === asset.id ? 'text-gray-900' : 'text-gray-800'}`}>{asset.name}</div>
                         <div className="text-xs text-gray-500">{asset.symbol.toUpperCase()}</div>
                       </div>
                     </div>
                     <div className="text-right">
                       <div className={`text-sm ${selectedAssetData?.id === asset.id ? 'text-gray-900' : 'text-gray-800'}`}>
                         {formatPrice(asset.current_price)}
                       </div>
                       <div className={`flex items-center justify-end text-xs ${asset.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                         {asset.price_change_percentage_24h >= 0 ? <ArrowUpRight size={14} className="mr-0.5" /> : <ArrowDownRight size={14} className="mr-0.5" />}
                         {Math.abs(asset.price_change_percentage_24h ?? 0).toFixed(2)}%
                       </div>
                     </div>
                  </div>
                ))}
             </div>
              {/* Pagination Controls */}
              <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-t border-gray-400 bg-slate-900">
                  <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1 || isListLoading}
                      className={`p-1 rounded-full disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50/20 text-white transition-opacity ${currentPage > 1 ? 'hover:bg-gray-400/20' : ''}`}
                      aria-label="Previous Page"
                  >
                      <ChevronLeft size={18} />
                  </button>
                  <span className="text-xs text-gray-50">Page {currentPage}</span>
                  <button
                      onClick={handleNextPage}
                      disabled={!hasNextPage || isListLoading}
                      className={`p-1 rounded-full disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50/20 text-white transition-opacity ${hasNextPage ? 'hover:bg-gray-400/20' : ''}`}
                      aria-label="Next Page"
                  >
                      <ChevronRight size={18} />
                  </button>
              </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 