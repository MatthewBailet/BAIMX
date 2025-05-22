import React from 'react';
import { CircleDollarSign } from 'lucide-react';
import SectionBase from './SectionBase';
import { mockArticles } from './mockData';

const XRPSection: React.FC = () => {
  return (
    <SectionBase
      title="Ripple (XRP)"
      icon={<CircleDollarSign className="w-4 h-4 text-white" />}
      iconColor="bg-indigo-500"
      articles={mockArticles.xrp}
      viewAllLink="/news/xrp"
    />
  );
};

export default XRPSection; 