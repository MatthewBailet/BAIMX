import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';

// Sample data - in real app this would come from your backend
const tldrItems = [
  { id: 1, title: "Bitcoin ETF sees record inflow of $2.3B this week", xout: 2.4, votes: 342, symbol: "BTC" },
  { id: 2, title: "Ethereum Layer 2 TVL reaches new ATH", xout: 1.8, votes: 256, symbol: "ETH" },
  { id: 3, title: "Major protocol vulnerability patched within hours", xout: -1.2, votes: 189, symbol: "AAVE" },
  { id: 4, title: "DeFi lending rates spike amid market volatility", xout: 0.8, votes: 145, symbol: "COMP" },
  { id: 5, title: "New regulatory framework proposed in EU", xout: -0.5, votes: 234, symbol: "BTC" },
  { id: 6, title: "NFT trading volume surges 40% in 24h", xout: 3.2, votes: 167, symbol: "NFT" },
  { id: 7, title: "Major bank launches institutional custody", xout: 1.5, votes: 289, symbol: "BTC" },
  { id: 8, title: "Mining difficulty reaches record high", xout: 0.3, votes: 178, symbol: "BTC" },
  { id: 9, title: "DEX aggregator announces major upgrade", xout: 2.1, votes: 156, symbol: "UNI" },
  { id: 10, title: "Stablecoin market cap exceeds $100B", xout: 1.7, votes: 223, symbol: "USDT" }
];

export const TLDRSection: React.FC = () => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [inputText, setInputText] = useState('');
  const firstHalf = tldrItems.slice(0, 5);
  const secondHalf = tldrItems.slice(5);

  return (
    <section className="container mx-auto my-8 max-w-[77rem] mt-8 mb-8 px-4 border-b pb-8 border-gray-400">
      <h2 className="text-lg font-bold mb-2 pb-2 flex items-center">
        <span className=" ">TLDR</span>
        <span className="text-xs font-normal text-gray-500 ml-4">What's really happening today</span>
      </h2>
      <div className="border border-gray-400 bg-slate-50/50 flex flex-col text-gray-500 mina-regular mb-2 rounded-lg">
        <div className="flex items-center justify-center space-x-4 p-4 py-1 border-b border-gray-400  bg-gray-100 rounded-t-lg">
          <button className="p-1 text-gray-700 hover:text-gray-600 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-medium text-gray-700">April 25, 2025</span>
          <button className="p-1 text-gray-700 hover:text-gray-600 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="grid grid-cols-2 divide-x divide-gray-400">
          {/* Left Column */}
          <div className="p-2">
            {firstHalf.map((item, index) => (
              <div key={item.id} className="flex items-start justify-between mb-2.5 last:mb-0 group py-0.5">
                <div className="flex-1 pr-3">
                  <div className="flex items-start">
                    <span className="text-gray-400 mr-2 text-sm font-medium">{index + 1}.</span>
                    <div>
                      <p className="text-gray-700 text-sm leading-5  mb-0.5">{item.title}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] text-gray-500">
                          XOUT: <span className={item.xout >= 0 ? 'text-green-500' : 'text-red-500'}>
                            {item.xout > 0 ? '+' : ''}{item.xout.toFixed(1)}% {item.symbol}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-sm">
                  <button className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight size={14} />
                  </button>
                  <span className="text-gray-500 min-w-[3ch] text-center text-xs">{item.votes}</span>
                  <button className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowDownRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {/* Right Column */}
          <div className="p-2">
            {secondHalf.map((item, index) => (
              <div key={item.id} className="flex items-start justify-between mb-2.5 last:mb-0 group py-0.5">
                <div className="flex-1 pr-3">
                  <div className="flex items-start">
                    <span className="text-gray-400 mr-2 text-sm font-medium">{index + 6}.</span>
                    <div>
                      <p className="text-gray-700 text-sm leading-5 mb-0.5">{item.title}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] text-gray-500">
                          XOUT: <span className={item.xout >= 0 ? 'text-green-500' : 'text-red-500'}>
                            {item.xout > 0 ? '+' : ''}{item.xout.toFixed(1)}% {item.symbol}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-sm">
                  <button className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight size={14} />
                  </button>
                  <span className="text-gray-500 min-w-[3ch] text-center text-xs">{item.votes}</span>
                  <button className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowDownRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Input Section - Now outside the main container */}
      <div className="bg-white rounded-lg py-2">
        <div className="relative">
          <textarea 
            placeholder="What happened today?" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 resize-none h-[60px] pr-[100px]"
          />
          <button 
            className={`absolute bottom-4 right-3 px-5 py-1.5 rounded-md text-sm font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
              termsAccepted && inputText.trim() 
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm hover:shadow-md' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-100'
            }`}
            disabled={!termsAccepted || !inputText.trim()}
          >
            <div className="flex items-center space-x-1">
              <span>Send</span>
              {termsAccepted && inputText.trim() && (
                <ArrowUpRight size={16} className="transform -rotate-45" />
              )}
            </div>
          </button>
        </div>
        <div className="flex items-center mt-2.5 text-xs text-gray-500">
          <label className="flex items-center cursor-pointer group select-none">
            <input 
              type="checkbox" 
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20 focus:ring-2 mr-2 cursor-pointer" 
            />
            <span>
              I have read and agree to the <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline transition-colors">Terms of Service</a>
            </span>
          </label>
        </div>
      </div>
    </section>
  );
}; 