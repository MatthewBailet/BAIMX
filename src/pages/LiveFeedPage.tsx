import React from 'react';

// Simple placeholder page
export const LiveFeedPage: React.FC = () => {
  return (
    <div className="container mx-auto max-w-7xl py-8">
      <h1 className="text-2xl font-bold mb-4">Live Feed Page</h1>
      <p>This is where the full live feed content will go.</p>
      {/* Add more content placeholder */}
      <div className="mt-6 space-y-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="bg-gray-100 p-4 rounded shadow">
            Placeholder Live Feed Item {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}; 