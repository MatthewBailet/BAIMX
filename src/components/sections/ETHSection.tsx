import React from 'react';
import { Hexagon } from 'lucide-react';
import SectionBase from './SectionBase';
import { mockArticles } from './mockData';

const ETHSection: React.FC = () => {
  return (
    <SectionBase
      title="Ethereum (ETH)"
      icon={<Hexagon className="w-4 h-4 text-white" />}
      iconColor="bg-blue-500"
      articles={mockArticles.eth}
      viewAllLink="/news/eth"
    />
  );
};

export default ETHSection; 