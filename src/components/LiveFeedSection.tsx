import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, AlertCircle, TrendingUp, Globe, Maximize, Minimize, Settings, Filter, PlusCircle, Plus } from 'lucide-react';

// Feed item interface
interface FeedItem {
  id: string;
  title: string;
  source: string;
  time: string;
  category: 'market' | 'breaking' | 'global';
  isNew?: boolean;
  impact?: 'high' | 'medium' | 'low';
}

// Sample data for demonstration
const sampleFeedData: Record<string, FeedItem[]> = {
  market: [
    { id: 'm1', title: 'BTC/USD hits new intraday high of $78,245', source: 'CoinDesk', time: '2m ago', category: 'market', isNew: true, impact: 'medium' },
    { id: 'm2', title: 'Ethereum gas fees drop 15% following network upgrade', source: 'Decrypt', time: '18m ago', category: 'market', impact: 'medium' },
    { id: 'm3', title: 'SOL surges 8% amid growing institutional interest', source: 'Bloomberg', time: '42m ago', category: 'market', impact: 'high' },
    { id: 'm4', title: 'Major exchange completes token migration', source: 'CryptoNews', time: '1h ago', category: 'market' },
    { id: 'm5', title: 'XRP trading volume spikes 25% in Asian markets', source: 'TokenInsight', time: '1.5h ago', category: 'market', impact: 'medium' },
    { id: 'm6', title: 'DeFi TVL reaches new quarterly high', source: 'DeFi Pulse', time: '2h ago', category: 'market', impact: 'high' },
    { id: 'm7', title: 'AVAX ecosystem sees surge in developer activity', source: 'CoinMetrics', time: '2.5h ago', category: 'market', impact: 'low' },
    { id: 'm8', title: 'Bitcoin mining difficulty adjusts upward by 3.2%', source: 'BitInfoCharts', time: '3h ago', category: 'market', impact: 'medium' }
  ],
  breaking: [
    { id: 'b1', title: 'SEC approves new blockchain ETF application', source: 'Financial Times', time: '5m ago', category: 'breaking', isNew: true, impact: 'high' },
    { id: 'b2', title: 'Major protocol vulnerability patched, funds safe', source: 'DeFi News', time: '27m ago', category: 'breaking', impact: 'high' },
    { id: 'b3', title: 'Government announces new regulatory framework', source: 'Reuters', time: '53m ago', category: 'breaking' },
    { id: 'b4', title: 'Leading DeFi platform launches governance token', source: 'DApp Radar', time: '1h ago', category: 'breaking' },
    { id: 'b5', title: 'Major crypto exchange announces expansion to new markets', source: 'CoinTelegraph', time: '1.5h ago', category: 'breaking', impact: 'high' },
    { id: 'b6', title: 'Institutional investors launch crypto-focused fund', source: 'The Block', time: '2h ago', category: 'breaking', impact: 'medium' },
    { id: 'b7', title: 'New cross-chain bridge protocol announced', source: 'Crypto Briefing', time: '2.5h ago', category: 'breaking', impact: 'medium' },
    { id: 'b8', title: 'Major bank integrates blockchain payment system', source: 'Banking Weekly', time: '3h ago', category: 'breaking', impact: 'high' }
  ],
  global: [
    { id: 'g1', title: 'G20 agrees on framework for digital currency regulation', source: 'World Economic Forum', time: '12m ago', category: 'global', isNew: true, impact: 'high' },
    { id: 'g2', title: 'Central Bank Digital Currency trials show promising results', source: 'Central Banking', time: '46m ago', category: 'global', impact: 'medium' },
    { id: 'g3', title: 'New cross-border payment solution launches in Asia', source: 'Nikkei', time: '1h ago', category: 'global' },
    { id: 'g4', title: 'Tech giant files new blockchain-related patents', source: 'Tech Review', time: '2h ago', category: 'global' },
    { id: 'g5', title: 'EU announces new crypto asset reporting requirements', source: 'EU Commission', time: '2.5h ago', category: 'global', impact: 'high' },
    { id: 'g6', title: 'African nations explore joint CBDC initiative', source: 'African Markets', time: '3h ago', category: 'global', impact: 'medium' },
    { id: 'g7', title: 'Middle East crypto adoption reaches new milestone', source: 'Gulf News', time: '3.5h ago', category: 'global', impact: 'medium' },
    { id: 'g8', title: 'International standards body proposes crypto guidelines', source: 'ISO News', time: '4h ago', category: 'global', impact: 'high' }
  ]
};

export const LiveFeedSection: React.FC = () => {
  const [feedData, setFeedData] = useState<Record<string, FeedItem[]>>(sampleFeedData);
  const [activeFeeds, setActiveFeeds] = useState<Record<string, boolean>>({
    market: true,
    breaking: true,
    global: true
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const feedSectionRef = useRef<HTMLDivElement>(null);

  // Simulated real-time updates
  useEffect(() => {
    // Add a new item every 40 seconds to a random feed
    const updateInterval = setInterval(() => {
      const categories = ['market', 'breaking', 'global'];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)] as 'market' | 'breaking' | 'global';
      
      const newItem: FeedItem = {
        id: `${randomCategory[0]}${Date.now()}`,
        title: `New ${randomCategory} update ${new Date().toLocaleTimeString()}`,
        source: 'BAIMX Analytics',
        time: 'just now',
        category: randomCategory,
        isNew: true,
        impact: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
      };

      setFeedData(prev => ({
        ...prev,
        [randomCategory]: [newItem, ...prev[randomCategory].slice(0, 7)]
      }));

      // Remove "isNew" flag after 30 seconds
      setTimeout(() => {
        setFeedData(prev => ({
          ...prev,
          [randomCategory]: prev[randomCategory].map(item => 
            item.id === newItem.id ? { ...item, isNew: false } : item
          )
        }));
      }, 30000);
      
    }, 40000);

    return () => clearInterval(updateInterval);
  }, []);

  const toggleFeed = (feedType: string) => {
    setActiveFeeds(prev => ({
      ...prev,
      [feedType]: !prev[feedType]
    }));
  };

  // Fullscreen toggle handler
  const handleFullscreenToggle = () => {
    if (!feedSectionRef.current) return;

    if (!document.fullscreenElement) {
      feedSectionRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Effect to listen for fullscreen changes (e.g., user pressing ESC)
  useEffect(() => {
    const handleFullscreenChange = () => {
      // Delay slightly to sync state with browser transition
      setTimeout(() => setIsFullscreen(!!document.fullscreenElement), 50);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Placeholder function for customization
  const handleCustomize = () => {
    console.log('Customize button clicked (placeholder)');
    // Future implementation: Open modal or sidebar for customization
  };

  // Placeholder for Add New Feed
  const handleAddNewFeed = () => {
    console.log('Add New Feed button clicked (placeholder)');
    // Future: Show UI to select/configure a new feed column
  };

  // Placeholder for Filters
  const handleFilter = () => {
    console.log('Filter button clicked (placeholder)');
    // Future: Show filtering options (e.g., by source, impact, keyword)
  };

  // Category icon mapping
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'market': return <TrendingUp className="w-4 h-4" />;
      case 'breaking': return <AlertCircle className="w-4 h-4" />;
      case 'global': return <Globe className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <section
      ref={feedSectionRef}
      className={`bg-white transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 top-0 z-40 overflow-hidden bg-white'
          : 'py-3'
      }`}
      style={isFullscreen ? { paddingTop: '40px' } : {}}
    >
      <div className={`container mx-auto h-full ${isFullscreen ? 'px-4 sm:px-5' : 'max-w-[77rem] px-0 sm:px-0'}`}>
        <div className={`${isFullscreen ? 'h-full flex flex-col bg-white' : 'bg-white border border-gray-300 p-5 shadow-lg rounded-lg'}`}>
          <div className="flex flex-col items-center mb-4 flex-shrink-0 p-0">
            <div className="flex flex-col items-center justify-center mb-1">
              <Link to="/" className="flex items-center mb-1">
                <div className="rounded p-0">
                  <img src="/logoBAIMXblack.png" alt="BAIMX" className="h-11 w-auto" />
                </div>
              </Link>

            </div>
           
            <div className="flex flex-col items-center gap-y-2  w-full">
              <div className="flex items-center space-x-2">
                <button onClick={handleAddNewFeed} className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md transition-colors" aria-label='Add new feed column'><PlusCircle size={18} /></button>
                <button onClick={handleFilter} className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md transition-colors" aria-label='Filter feeds'><Filter size={18} /></button>
                <button onClick={handleCustomize} className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md transition-colors" aria-label='Customize feed layout'><Settings size={18} /></button>
                <button onClick={handleFullscreenToggle} className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md transition-colors" aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>{isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}</button>
              </div>

            
            </div>
            
          </div>
          
          <div className={`grid grid-cols-1 bg-white border border-gray-300 rounded-lg p-4 md:grid-cols-4 gap-2 ${isFullscreen ? 'flex-grow min-h-0 overflow-hidden' : ''}`}>
            
            <div className={`bg-white rounded-lg transition-opacity  border border-gray-200 duration-300 ${activeFeeds.market ? 'opacity-100' : 'opacity-40 pointer-events-none'} flex flex-col ${isFullscreen ? 'overflow-y-auto' : 'h-[720px]'}`}>
              
              <div className={`px-5 py-3 border-b border-gray-200 flex items-center justify-between flex-shrink-0 ${isFullscreen ? 'sticky top-0 z-10 bg-white' : ''}`}>
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 text-gray-800 mr-2" />
                  <h3 className="text-sm font-semibold text-gray-800">MARKET UPDATES</h3>
                </div>
              </div>
              <div className={` ${isFullscreen ? '' : 'flex-grow overflow-y-auto'}`}>
                <ul className="divide-y divide-gray-100">
                  {feedData.market.slice(0, 8).map((item) => (
                    <motion.li
                      key={item.id}
                      initial={item.isNew ? { backgroundColor: '#EBF8FF' } : {}}
                      animate={{ backgroundColor: '#FFFFFF' }}
                      transition={{ duration: 1.5 }}
                      className={`px-5 py-3 hover:bg-gray-50/80 transition-colors`}
                    >
                      <div className="flex items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <h4 className="text-sm font-medium text-gray-800">{item.title}</h4>
                            {item.isNew && (
                              <span className="ml-2 text-blue-600 font-semibold text-[10px] uppercase tracking-wide">New</span>
                            )}
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <span>{item.source}</span>
                            <span className="mx-1.5">•</span>
                            <span>{item.time}</span>
                          </div>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
                {feedData.market.length === 0 && <p className="text-sm text-gray-500 p-5 text-center">No market updates.</p>}
              </div>
              <div className={`px-5 py-2 text-right border-t border-gray-100 flex-shrink-0 ${isFullscreen ? 'sticky bottom-0 bg-gray-50' : 'bg-gray-50'}`}>
                <Link to="/livefeed/market" className="text-xs text-blue-600 hover:underline font-medium">View all →</Link>
              </div>
            </div>

            <div className={`bg-white text-black rounded-lg transition-opacity  border border-gray-200 duration-300 ${activeFeeds.breaking ? 'opacity-100' : 'opacity-40 pointer-events-none'} flex flex-col ${isFullscreen ? 'overflow-y-auto' : 'h-[720px]'}`}>
              <div className={`px-5 py-3 border-b border-gray-200 flex items-center justify-between flex-shrink-0 ${isFullscreen ? 'sticky top-0 z-10 bg-white' : ''}`}>
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 text-gray-800 mr-2" />
                  <h3 className="text-sm font-semibold text-gray-800">BREAKING NEWS</h3>
                </div>
              </div>
              <div className={` ${isFullscreen ? '' : 'flex-grow overflow-y-auto'}`}>
                <ul className="divide-y divide-gray-100">
                  {feedData.breaking.slice(0, 8).map((item) => (
                    <motion.li
                      key={item.id}
                      initial={item.isNew ? { backgroundColor: '#FFF5F5' } : {}}
                      animate={{ backgroundColor: '#FFFFFF' }}
                      transition={{ duration: 1.5 }}
                      className={`px-5 py-3 hover:bg-gray-50/80 transition-colors`}
                    >
                      <div className="flex items-start ">
                        <div className="flex-1">
                          <div className="flex items-center mb-1 ">
                            <h4 className="text-sm font-medium text-gray-800">{item.title}</h4>
                            {item.isNew && (
                              <span className="ml-2 text-red-600 font-semibold text-[10px] uppercase tracking-wide">New</span>
                            )}
                          </div>
                          <div className="flex items-center text-xs text-gray-500 ">
                            <span>{item.source}</span>
                            <span className="mx-1.5">•</span>
                            <span>{item.time}</span>
                          </div>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
                {feedData.breaking.length === 0 && <p className="text-sm text-gray-500 p-5 text-center">No breaking news.</p>}
              </div>
              <div className={`px-5 py-2 text-right border-t border-gray-100 flex-shrink-0 ${isFullscreen ? 'sticky bottom-0 bg-gray-50' : 'bg-gray-50'}`}>
                <Link to="/livefeed/breaking" className="text-xs text-blue-600 hover:underline font-medium">View all →</Link>
              </div>
            </div>

            <div className={`bg-white text-white rounded-lg transition-opacity  border border-gray-200 duration-300 ${activeFeeds.global ? 'opacity-100' : 'opacity-40 pointer-events-none'} flex flex-col ${isFullscreen ? 'overflow-y-auto' : 'h-[720px]'}`}>
              <div className={`px-5 py-3 border-b border-gray-200 flex items-center justify-between flex-shrink-0 ${isFullscreen ? 'sticky top-0 z-10 bg-white' : ''}`}>
                <div className="flex items-center">
                  <Globe className="w-4 h-4 text-gray-800 mr-2" />
                  <h3 className="text-sm font-semibold text-gray-800">GLOBAL UPDATES</h3>
                </div>
              </div>
              <div className={` ${isFullscreen ? '' : 'flex-grow overflow-y-auto'}`}>
                <ul className="divide-y divide-gray-100">
                  {feedData.global.slice(0, 8).map((item) => (
                    <motion.li
                      key={item.id}
                      initial={item.isNew ? { backgroundColor: '#FAF5FF' } : {}}
                      animate={{ backgroundColor: '#FFFFFF' }}
                      transition={{ duration: 1.5 }}
                      className={`px-5 py-3 hover:bg-gray-50/80 transition-colors`}
                    >
                      <div className="flex items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <h4 className="text-sm font-medium text-gray-800">{item.title}</h4>
                            {item.isNew && (
                              <span className="ml-2 text-purple-600 font-semibold text-[10px] uppercase tracking-wide">New</span>
                            )}
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <span>{item.source}</span>
                            <span className="mx-1.5">•</span>
                            <span>{item.time}</span>
                          </div>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
                {feedData.global.length === 0 && <p className="text-sm text-gray-500 p-5 text-center">No global updates.</p>}
              </div>
              <div className={`px-5 py-2 text-right border-t border-gray-100 flex-shrink-0 ${isFullscreen ? 'sticky bottom-0 bg-gray-50' : 'bg-gray-50'}`}>
                <Link to="/livefeed/global" className="text-xs text-blue-600 hover:underline font-medium">View all →</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveFeedSection; 