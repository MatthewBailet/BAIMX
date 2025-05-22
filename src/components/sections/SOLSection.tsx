import React from 'react';
import { Sun } from 'lucide-react';
import SectionBase from './SectionBase';
import { mockArticles } from './mockData';

const SOLSection: React.FC = () => {
  return (
    <SectionBase
      title="Solana (SOL)"
      icon={<Sun className="w-4 h-4 text-white" />}
      iconColor="bg-purple-500"
      articles={mockArticles.sol}
      viewAllLink="/news/sol"
    />
  );
};

export default SOLSection; 