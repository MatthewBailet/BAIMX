import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import './PriceTicker.css'; // Assuming styles are in this file relative to components/

interface TickerCoinData {
  id: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
}

const TickerBar: React.FC = () => {
  const [coins, setCoins] = useState<TickerCoinData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const tickerRef = useRef<HTMLDivElement>(null);

  const formatPriceTicker = (value: number): string => {
    if (value >= 1) {
      return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (value >= 0.0001) {
      return value.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
    } else if (value === 0) {
      return '0.00';
    } else {
      // For very small numbers, show more precision or scientific notation if appropriate
      // This example will show up to 8 decimal places for small numbers
      const s = value.toFixed(8);
      // Trim trailing zeros only if there are more than 2 decimal places
      return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s;
    }
  };

  useEffect(() => {
    const fetchTickerData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Example: Fetching top 100 coins by market cap on page 1
        const response = await fetch('/api/coingecko/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: TickerCoinData[] = await response.json();
        
        // Filter for specific coins if needed, or use the top ones
        // For this example, let's filter some popular coins and ensure they are in the data
        const targetSymbols = ['BTC', 'ETH', 'SOL', 'USDC', 'BONK', 'WIF', 'DOGE', 'ADA', 'AVAX', 'DOT', 'MATIC', 'SHIB', 'TRX', 'LINK', 'TON', 'ICP', 'NEAR', 'UNI', 'GRT', 'FET'];
        const filteredCoins = data.filter(coin => targetSymbols.includes(coin.symbol.toUpperCase()))
                                  .sort((a,b) => targetSymbols.indexOf(a.symbol.toUpperCase()) - targetSymbols.indexOf(b.symbol.toUpperCase())); // Keep original order

        setCoins(filteredCoins.slice(0, 20)); // Show up to 20 coins

      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('An unknown error occurred');
        }
        console.error("Failed to fetch ticker data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchTickerData();
    const intervalId = setInterval(fetchTickerData, 60000); // Refresh every 60 seconds

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (tickerRef.current) {
      // Adjust animation duration based on the number of items for a consistent speed
      const numItems = coins.length > 0 ? coins.length * 2 : 20 * 2; // Each item is duplicated for seamless scroll
      const itemWidth = 160; // Approximate width of each ticker item in px
      const totalWidth = numItems * itemWidth;
      const duration = totalWidth / 50; // Adjust 50 to control speed (higher = slower)
      
      // Update animation duration using CSS variable
      tickerRef.current.style.setProperty('--animation-duration', `${duration}s`);
    }
  }, [coins]);

  if (loading && coins.length === 0) { // Only show initial loader
    return <div className="h-[28px] bg-slate-900 flex items-center justify-center text-xs text-gray-400">Loading prices...</div>;
  }

  if (error) {
    return <div className="h-[28px] bg-red-700 text-white flex items-center justify-center text-xs">Error: {error}</div>;
  }
  
  if (coins.length === 0) { // No coins to display, but not loading and no error
    return <div className="h-[28px] bg-slate-900 flex items-center justify-center text-xs text-gray-500">No price data available.</div>;
  }

  // Duplicate coins for seamless scrolling effect
  const duplicatedCoins = [...coins, ...coins];

  return (
    <div className="bg-slate-900 overflow-hidden h-[28px] relative ticker-container-fade">
      <motion.div
        ref={tickerRef}
        className="flex absolute left-0 ticker-track" // Use CSS animation
        // Removed Framer Motion animation properties to rely on CSS
      >
        {duplicatedCoins.map((coin, index) => (
          <div key={`${coin.id}-${index}`} className="flex items-center space-x-1.5 px-3 py-1.5 border-r border-slate-700/70 whitespace-nowrap min-w-[160px]">
            <span className="text-xs font-medium text-slate-300">{coin.symbol.toUpperCase()}</span>
            <span className={`text-xs font-medium ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${formatPriceTicker(coin.current_price)}
            </span>
            <span className={`text-xs flex items-center ${coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {coin.price_change_percentage_24h >= 0 ? <ArrowUpRight size={12} className="mr-0.5" /> : <ArrowDownRight size={12} className="mr-0.5" />}
              {coin.price_change_percentage_24h.toFixed(2)}%
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default TickerBar; 