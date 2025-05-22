import React from 'react';
import { Bitcoin } from 'lucide-react';
import SectionBase from './SectionBase';
import { mockArticles } from './mockData';

const BTCSection: React.FC = () => {
  return (
    <SectionBase
      title="Bitcoin (BTC)"
      icon={<Bitcoin className="w-4 h-4 text-white" />}
      iconColor="bg-orange-500"
      articles={mockArticles.btc}
      viewAllLink="/news/btc"
    />
  );
};

export default BTCSection; 