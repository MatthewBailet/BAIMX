import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface ArticleItem {
  id: string;
  title: string;
  image: string;
  tags: string[];
  timeAgo: string;
  readTime: string;
  url: string;
}

interface SectionBaseProps {
  title: string;
  icon: React.ReactNode;
  iconColor: string;
  articles: ArticleItem[];
  viewAllLink: string;
}

const SectionBase: React.FC<SectionBaseProps> = ({ 
  title, 
  icon, 
  iconColor, 
  articles, 
  viewAllLink 
}) => {
  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <div className={`p-1.5 rounded ${iconColor} mr-2`}>
            {icon}
          </div>
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
        </div>
        <Link 
          to={viewAllLink}
          className="group flex items-center text-sm text-gray-600 hover:text-[#1C1D33]"
        >
          View all
          <motion.div 
            className="ml-1"
            whileHover={{ x: 3 }} 
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <ChevronRight className="w-4 h-4 transition-transform duration-200 ease-in-out group-hover:translate-x-1" /> 
          </motion.div>
        </Link>
      </div>
      
      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {articles.map((article) => (
          <div key={article.id} className="group">
            {/* Image */}
            <Link 
              to={article.url}
              className="block relative aspect-[16/9] rounded-lg overflow-hidden mb-3"
            >
              <img 
                src={article.image} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80" />
            </Link>
            
            {/* Content */}
            <div>
              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {article.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-2 py-0.5 text-[10px] font-medium bg-[#1C1D33] text-white rounded uppercase tracking-wide"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              {/* Title */}
              <Link to={article.url}>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {article.title}
                </h3>
              </Link>
              
              {/* Time info */}
              <div className="text-xs text-gray-500">
                {article.timeAgo} | {article.readTime}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectionBase; 