import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TrendingUp, AlertCircle, Globe } from 'lucide-react';

interface FeedItem {
  id: string;
  title: string;
  source: string;
  time: string;
  category: 'market' | 'breaking' | 'global';
  isNew?: boolean;
  impact?: 'high' | 'medium' | 'low';
}

interface FeedColumnProps {
  title: string;
  icon: React.ReactNode;
  items: FeedItem[];
  isActive: boolean;
  isFullscreen: boolean;
  newItemColor: string;
  viewAllLink: string;
}

export const FeedColumn: React.FC<FeedColumnProps> = ({
  title,
  icon,
  items,
  isActive,
  isFullscreen,
  newItemColor,
  viewAllLink
}) => {
  return (
    <div className={`bg-white rounded-lg transition-opacity border border-gray-200 duration-300 ${isActive ? 'opacity-100' : 'opacity-40 pointer-events-none'} flex flex-col ${isFullscreen ? 'overflow-y-auto scrollbar-hide' : 'h-[720px] overflow-y-auto scrollbar-hide'}`}>
      <div className={`px-5 py-3 border-b border-gray-200 flex items-center justify-between flex-shrink-0 ${isFullscreen ? 'sticky top-0 z-10 bg-white' : ''}`}>
        <div className="flex items-center">
          {icon}
          <h3 className="text-sm font-semibold text-gray-800 ml-2">{title}</h3>
        </div>
      </div>
      <div className={`${isFullscreen ? '' : 'flex-grow overflow-y-auto scrollbar-hide'}`}>
        <ul className="divide-y divide-gray-100">
          {items.slice(0, 8).map((item) => (
            <motion.li
              key={item.id}
              initial={item.isNew ? { backgroundColor: newItemColor } : {}}
              animate={{ backgroundColor: '#FFFFFF' }}
              transition={{ duration: 1.5 }}
              className={`px-5 py-3 hover:bg-gray-50/80 transition-colors`}
            >
              <div className="flex items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <h4 className="text-sm font-medium text-gray-800">{item.title}</h4>
                    {item.isNew && (
                      <span className={`ml-2 ${newItemColor} font-semibold text-[10px] uppercase tracking-wide`}>New</span>
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
        {items.length === 0 && <p className="text-sm text-gray-500 p-5 text-center">No updates.</p>}
      </div>
      <div className={`px-5 py-2 text-right border-t border-gray-100 flex-shrink-0 ${isFullscreen ? 'sticky bottom-0 bg-gray-50' : 'bg-gray-50'}`}>
        <Link to={viewAllLink} className="text-xs text-blue-600 hover:underline font-medium">View all →</Link>
      </div>
    </div>
  );
}; 