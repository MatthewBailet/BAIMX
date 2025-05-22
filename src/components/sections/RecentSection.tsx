import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

// Define Article Type
interface Article {
  id: number;
  title: string;
  imageUrl?: string;
  time: string;
  read: string;
  tags: string[];
  preview?: string;
  xoutValue?: number;
  xoutSymbol?: string;
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
    imageUrl: '/placeholder-eth.jpg',
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
    imageUrl: '/placeholder-meme.jpg',
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
            className="group text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors flex items-center bg-gray-50 px-3 py-1.5 rounded-full"
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
              className={`block relative overflow-hidden group transition-all duration-300 hover:shadow-lg bg-white border border-gray-100 shadow-sm ${gridClasses}`}
            >
              <div className="absolute inset-0">
                {article.imageUrl ? (
                  <img 
                    src={article.imageUrl} 
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                  />
                ) : (
                  <div className="absolute inset-0 bg-gray-200 rounded"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 rounded-md"></div>
              </div>
              
              {/* Category tag in top left */}
              <div className="absolute top-3 left-3 z-10">
                {article.tags.length > 0 && (
                  <span className="text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-sm font-medium">
                    {article.tags[0]}
                  </span>
                )}
              </div>
              
              {/* Time in top right */}
              <div className="absolute top-3 right-3 z-10">
                <span className="text-[10px] text-white/90 backdrop-blur-sm font-medium">
                  {article.time} • {article.read}
                </span>
              </div>
              
              {/* Content at bottom */}
              <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end p-4">
                <div className="text-white">
                  <h3 className={`${isLarge ? 'text-xl' : 'text-lg'} font-semibold mb-2 line-clamp-3 leading-tight`}>
                    {article.title}
                  </h3>
                  
                  {(isLarge || isWide || isTall) && article.preview && (
                    <div className="relative mb-3">
                      <p className={`${isLarge ? 'text-sm' : 'text-xs'} text-gray-100 line-clamp-2 leading-snug`}>
                        {article.preview}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5 mb-1">
                      {article.tags.slice(1, isLarge ? 3 : 2).map(tag => (
                        <span key={tag} className="bg-blue-600/70 px-2 py-0.5 rounded-full text-[10px] font-medium text-white">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <span className="text-blue-300 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                      Read <ChevronRight className="w-3 h-3 ml-0.5" />
                    </span>
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