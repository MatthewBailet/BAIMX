import React from 'react';
import { Sparkles } from 'lucide-react';
import SectionBase from './SectionBase';
import { mockArticles } from './mockData';

const SpeculativeSection: React.FC = () => {
  return (
    <SectionBase
      title="Speculative"
      icon={<Sparkles className="w-4 h-4 text-white" />}
      iconColor="bg-pink-500"
      articles={mockArticles.speculative}
      viewAllLink="/news/speculative"
    />
  );
};

export default SpeculativeSection; 