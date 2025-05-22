import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface PriceData {
  symbol: string;
  price: number;
  lastPrice: number;
  basePrice: number;
  volatility: number;
}

interface RealTimePricesProps {
  coins: { symbol: string; tokenId: string }[];
}

// Base prices and volatility for simulation
const INITIAL_PRICES: Record<string, { price: number; volatility: number }> = {
  'BTC': { price: 71245.50, volatility: 0.001 },
  'ETH': { price: 3975.25, volatility: 0.0015 },
  'SOL': { price: 185.75, volatility: 0.002 },
  'USDC': { price: 1.00, volatility: 0.0000 },
  'BONK': { price: 0.00001234, volatility: 0.005 },
  'WIF': { price: 0.45, volatility: 0.003 }
};

export const RealTimePrices: React.FC<RealTimePricesProps> = ({ coins }) => {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Initialize prices
  useEffect(() => {
    const initialPrices: Record<string, PriceData> = {};
    coins.forEach(coin => {
      const initialData = INITIAL_PRICES[coin.symbol];
      if (initialData) {
        initialPrices[coin.symbol] = {
          symbol: coin.symbol,
          price: initialData.price,
          lastPrice: initialData.price,
          basePrice: initialData.price,
          volatility: initialData.volatility
        };
      }
    });
    setPrices(initialPrices);
    setIsLoading(false);
  }, [coins]);

  // Simulate price updates
  const updatePrice = useCallback((symbol: string, currentData: PriceData) => {
    const randomFactor = 1 + (Math.random() - 0.5) * currentData.volatility;
    const newPrice = currentData.basePrice * randomFactor;
    
    return {
      ...currentData,
      lastPrice: currentData.price,
      price: newPrice
    };
  }, []);

  // Update prices periodically
  useEffect(() => {
    const fastInterval = setInterval(() => {
      setPrices(prevPrices => {
        const newPrices = { ...prevPrices };
        // Randomly select 1-3 coins to update each tick
        const numUpdates = Math.floor(Math.random() * 3) + 1;
        const availableCoins = Object.keys(newPrices);
        
        for (let i = 0; i < numUpdates; i++) {
          const randomIndex = Math.floor(Math.random() * availableCoins.length);
          const symbol = availableCoins[randomIndex];
          newPrices[symbol] = updatePrice(symbol, newPrices[symbol]);
        }
        
        return newPrices;
      });
    }, 800); // Update every 800ms

    // Slower interval for base price drift
    const slowInterval = setInterval(() => {
      setPrices(prevPrices => {
        const newPrices = { ...prevPrices };
        Object.keys(newPrices).forEach(symbol => {
          const drift = 1 + (Math.random() - 0.5) * 0.0005;
          newPrices[symbol] = {
            ...newPrices[symbol],
            basePrice: newPrices[symbol].basePrice * drift
          };
        });
        return newPrices;
      });
    }, 10000); // Drift every 10 seconds

    return () => {
      clearInterval(fastInterval);
      clearInterval(slowInterval);
    };
  }, [updatePrice]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {coins.map(coin => (
          <div key={coin.symbol} className="bg-[#14151F] rounded p-3 h-16 animate-pulse flex items-center justify-center">
            <div className="text-gray-600">{coin.symbol}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
      {coins.map(coin => {
        const priceData = prices[coin.symbol];
        if (!priceData) return null;

        const priceChange = priceData.price - priceData.lastPrice;
        const isPositive = priceChange >= 0;
        const percentChange = ((priceData.price - priceData.basePrice) / priceData.basePrice) * 100;

        return (
          <motion.div
            key={coin.symbol}
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              backgroundColor: priceChange !== 0 ? (isPositive ? '#22c55e20' : '#ef444420') : 'transparent'
            }}
            transition={{ 
              duration: 0.2,
              backgroundColor: { duration: 0.3 }
            }}
            className="bg-[#14151F] rounded p-3 shadow-lg"
          >
            <div className="flex flex-col">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-400">{coin.symbol}/USD</span>
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}
                >
                  {percentChange >= 0 ? '+' : ''}{percentChange.toFixed(2)}%
                </motion.span>
              </div>
              <span className="text-base font-bold text-white mt-1">
                ${priceData.price < 0.01 
                  ? priceData.price.toFixed(8)
                  : priceData.price.toLocaleString(undefined, { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}; 