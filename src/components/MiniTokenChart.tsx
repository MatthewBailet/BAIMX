import React, { memo, useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { EChartsOption } from 'echarts';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';

import "../index.css"

// Coin ID mapping for CoinGecko API
const COINGECKO_IDS: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'SOL': 'solana',
  'USDC': 'usd-coin',
  'BONK': 'bonk',
  'WIF': 'dogwifhat'
};

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

interface MiniTokenChartProps {
  symbol: string;
  chartOption: EChartsOption | null;
  error: string | null;
  percentageChange: number | null;
  price?: number;
  lastPrice?: number;
  volume24h?: string;
}

const CHART_HEIGHT = '40px';

// Base volatility for simulation
const VOLATILITIES: Record<string, number> = {
  'BTC': 0.001,
  'ETH': 0.0015,
  'SOL': 0.002,
  'USDC': 0.0001,
  'BONK': 0.005,
  'WIF': 0.003
};

export const MiniTokenChart: React.FC<MiniTokenChartProps> = memo(({ 
  symbol, 
  chartOption, 
  error, 
  percentageChange,
  price: initialPrice,
  volume24h 
}) => {
  // --- MOCK DATA --- 
  // const percentageChange = 1.00; // Mock positive value -- Remove mock
  // --- END MOCK DATA ---

  const [currentPrice, setCurrentPrice] = useState(initialPrice);
  const [lastPrice, setLastPrice] = useState(initialPrice);
  const [priceChangeColor, setPriceChangeColor] = useState('text-white');
  const [iconUrl, setIconUrl] = useState<string | null>(null);

  // Fetch coin icon
  useEffect(() => {
    const fetchCoinIcon = async () => {
      try {
        const coinId = COINGECKO_IDS[symbol];
        if (!coinId) {
          console.warn(`No CoinGecko ID mapping for symbol: ${symbol}`);
          return;
        }
        
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`);
        if (!response.ok) throw new Error('Failed to fetch coin data');
        
        const data = await response.json();
        setIconUrl(data.image?.thumb);
      } catch (err) {
        console.error('Error fetching coin icon:', err);
      }
    };

    fetchCoinIcon();
  }, [symbol]);

  /*
  // Simulate price updates - Commenting this out
  useEffect(() => {
    if (initialPrice === undefined) return;

    const volatility = VOLATILITIES[symbol] || 0.001;
    const updateInterval = setInterval(() => {
      setLastPrice(currentPrice);
      const randomFactor = 1 + (Math.random() - 0.5) * volatility;
      const newPrice = initialPrice * randomFactor;
      setCurrentPrice(newPrice);
      
      // Flash green/red based on price change
      setPriceChangeColor(newPrice > (lastPrice || newPrice) ? 'text-green-500' : 'text-red-500');
      setTimeout(() => setPriceChangeColor('text-white'), 1000);
    }, 3000 + Math.random() * 2000); // Random interval between 3-5 seconds

    return () => clearInterval(updateInterval);
  }, [symbol, initialPrice]);
  */

  return (
    <div className="w-full relative bg-slate-950/30 rounded-lg px-2">
      {/* Header with Symbol and Percentage */}
      <div className="flex justify-between items-center py-2">
        <div className="flex items-center gap-2">
          {iconUrl ? (
            <img
              src={iconUrl}
              alt={`${symbol} icon`}
              className="w-4 h-4 rounded-full"
            />
          ) : (
            <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center">
              <span className="text-[10px] text-gray-400">{symbol.charAt(0)}</span>
            </div>
          )}
          <span className="text-xs font-medium text-white">{symbol}/USD</span>
          {/* Price Change Indicator Icon */}
          {percentageChange !== null && (
            <span className="ml-1">
              {percentageChange >= 0 ? (
                <ArrowUpRight size={12} className="text-green-500" />
              ) : (
                <ArrowDownRight size={12} className="text-red-500" />
              )}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {percentageChange !== null && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`text-xs font-medium ${percentageChange >= 0 ? 'text-green-500' : 'text-red-500'}`}
            >
              {percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(2)}%
            </motion.span>
          )}
          <motion.div
            whileHover={{ x: 2 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="text-gray-400 hover:text-white cursor-pointer"
          >
            <ChevronRight size={16} />
          </motion.div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative" style={{ height: CHART_HEIGHT }}>
        {error && (
          <div className="w-full h-full flex items-center justify-center bg-red-900 bg-opacity-30 rounded-lg" title={error}>
            <span className="text-red-400 text-xs font-mono">!</span>
          </div>
        )}
        {!error && chartOption && (
          <ReactECharts
            option={{
              ...chartOption,
              grid: {
                ...chartOption.grid,
                left: 0,
                right: 0,
                top: 0,
                bottom: 0
              }
            }}
            style={{ height: CHART_HEIGHT, width: '100%' }}
            notMerge={true}
            lazyUpdate={true}
          />
        )}
        {!error && !chartOption && (
          <div className="w-full h-full flex items-center justify-center bg-slate-900 bg-opacity-20 rounded-xl">
            <span className="text-gray-500 text-xs">-</span>
          </div>
        )}
      </div>

      {/* Price and Volume Below Chart */}
      <div className=" pt-1 flex justify-between mt-4 ">
        {currentPrice !== undefined && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-xl mt-2 font-regular leading-tight transition-colors duration-300 ${priceChangeColor}`}
          >
            ${currentPrice < 0.01 
              ? currentPrice.toFixed(8)
              : currentPrice.toLocaleString(undefined, { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
          </motion.div>
        )}
        {volume24h && (
          <div className="text-right">
            <div className="text-[10px] font-regular text-gray-400 leading-tight ">24h Vol</div>
            <div className="text-[12px] text-white">{volume24h}</div>
          </div>
        )}
      </div>
    </div>
  );
});

MiniTokenChart.displayName = 'MiniTokenChart';

// --- Light Theme Version --- 

export const MiniTokenChartLight: React.FC<MiniTokenChartProps> = memo(({ 
  symbol, 
  chartOption, 
  error, 
  percentageChange,
  price: initialPrice,
  volume24h 
}) => {
  // --- MOCK DATA --- 
  // const percentageChange = -0.45; // Mock negative value -- Remove mock
  // --- END MOCK DATA ---

  const [currentPrice, setCurrentPrice] = useState(initialPrice);
  const [lastPrice, setLastPrice] = useState(initialPrice);
  const [priceChangeColor, setPriceChangeColor] = useState('text-black');
  const [iconUrl, setIconUrl] = useState<string | null>(null);

  // Fetch coin icon
  useEffect(() => {
    const fetchCoinIcon = async () => {
      try {
        const coinId = COINGECKO_IDS[symbol];
        if (!coinId) {
          console.warn(`No CoinGecko ID mapping for symbol: ${symbol}`);
          return;
        }
        
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`);
        if (!response.ok) throw new Error('Failed to fetch coin data');
        
        const data = await response.json();
        setIconUrl(data.image?.thumb);
      } catch (err) {
        console.error('Error fetching coin icon:', err);
      }
    };

    fetchCoinIcon();
  }, [symbol]);

  /*
  // Simulate price updates - Commenting this out
  useEffect(() => {
    if (initialPrice === undefined) return;

    const volatility = VOLATILITIES[symbol] || 0.001;
    const updateInterval = setInterval(() => {
      setLastPrice(currentPrice);
      const randomFactor = 1 + (Math.random() - 0.5) * volatility;
      const newPrice = initialPrice * randomFactor;
      setCurrentPrice(newPrice);
      
      // Flash green/red based on price change
      setPriceChangeColor(newPrice > (lastPrice || newPrice) ? 'text-green-600' : 'text-red-600');
      setTimeout(() => setPriceChangeColor('text-black'), 1000);
    }, 3000 + Math.random() * 2000); // Random interval between 3-5 seconds

    return () => clearInterval(updateInterval);
  }, [symbol, initialPrice]);
  */

  return (
    <div className="w-full relative bg-white rounded-lg px-2 border border-gray-400">
      {/* Header with Symbol and Percentage */}
      <div className="flex justify-between items-center py-2">
        <div className="flex items-center gap-2">
          {iconUrl ? (
            <img
              src={iconUrl}
              alt={`${symbol} icon`}
              className="w-4 h-4 rounded-full"
            />
          ) : (
            <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-[10px] text-gray-600">{symbol.charAt(0)}</span>
            </div>
          )}
          <span className="text-xs font-medium text-black">{symbol}/USD</span>
          {/* Price Change Indicator Icon */}
          {percentageChange !== null && (
            <span className="ml-1">
              {percentageChange >= 0 ? (
                <ArrowUpRight size={12} className="text-green-500" />
              ) : (
                <ArrowDownRight size={12} className="text-red-500" />
              )}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {percentageChange !== null && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`text-xs font-medium ${percentageChange >= 0 ? 'text-green-500' : 'text-red-500'}`}
            >
              {percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(2)}%
            </motion.span>
          )}
          <motion.div
            whileHover={{ x: 2 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="text-gray-600 hover:text-black cursor-pointer"
          >
            <ChevronRight size={16} />
          </motion.div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative" style={{ height: CHART_HEIGHT }}>
        {error && (
          <div className="w-full h-full flex items-center justify-center bg-red-100 rounded-lg" title={error}>
            <span className="text-red-600 text-xs font-mono">!</span>
          </div>
        )}
        {!error && chartOption && (
          <ReactECharts
            option={{
              ...chartOption,
              grid: {
                ...chartOption.grid,
                left: 0,
                right: 0,
                top: 0,
                bottom: 0
              }
            }}
            style={{ height: CHART_HEIGHT, width: '100%' }}
            notMerge={true}
            lazyUpdate={true}
          />
        )}
        {!error && !chartOption && (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
            <span className="text-gray-400 text-xs">-</span>
          </div>
        )}
      </div>

      {/* Price and Volume Below Chart */}
      <div className=" pt-1 flex justify-between mt-4">
        {currentPrice !== undefined && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-xl mt-2 font-regular leading-tight transition-colors duration-300 ${priceChangeColor}`}
          >
            ${currentPrice < 0.01 
              ? currentPrice.toFixed(8)
              : currentPrice.toLocaleString(undefined, { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
          </motion.div>
        )}
        {volume24h && (
          <div className="text-right">
            <div className="text-[10px] font-regular text-gray-500 leading-tight ">24h Vol</div>
            <div className="text-[12px] text-black">{volume24h}</div>
          </div>
        )}
      </div>
    </div>
  );
});

MiniTokenChartLight.displayName = 'MiniTokenChartLight'; 