import React from 'react';
import { motion } from 'framer-motion';

interface AdSpaceProps {
  className?: string;
}

export const AdSpace: React.FC<AdSpaceProps> = ({ className = '' }) => {
  return (
    <div className={`w-full h-[250px] bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
      <span className="text-gray-400">Advertisement</span>
    </div>
  );
};

export const CTERMINALAD: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto max-w-[77rem] mt-8 mb-8"
    >
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-white flex flex-col md:flex-row items-center justify-between">
        <div className="flex-1">
          <h3 className="text-2xl font-bold mb-4">Get Started with cTerminal Pro</h3>
          <p className="text-blue-100 mb-6 max-w-xl">
            Access advanced features, real-time data, and exclusive insights with our premium subscription.
            Join thousands of traders who trust cTerminal for their crypto analysis.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors">
              Start Free Trial
            </button>
            <button className="border border-white text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600/20 transition-colors">
              Learn More
            </button>
          </div>
        </div>
        <div className="mt-6 md:mt-0 md:ml-8">
          <div className="bg-blue-600 p-6 rounded-lg">
            <div className="text-4xl font-bold mb-2">$29</div>
            <div className="text-blue-200">per month</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}; 